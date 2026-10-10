import hashlib
import json
import logging
import re
import tempfile
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.rate_limit import rate_limiter
from app.core.security import create_access_token, get_current_user, hash_password, require_roles, verify_password
from app.models import DocumentRecord, Feedback, QueryAudit, User
from app.rag.vector_store import add_documents, delete_documents
from app.rag.workflow import ask
from app.services.audit import write_audit
from app.services.ingestion import SUPPORTED, chunk_documents, load_file
from app.services.storage import (
    StorageConfigurationError,
    StorageFileNotFoundError,
    StorageUploadError,
    StorageError,
    get_storage_service,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["clario"])
settings = get_settings()


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=3000)


MIN_PASSWORD_LENGTH = 12
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=256)


class RegisterRequest(BaseModel):
    # Deliberately has no `role` field: any extra keys (e.g. "role") are ignored,
    # and the role is always assigned server-side.
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=256)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("Name must be at least 2 characters")
        return value

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not EMAIL_PATTERN.match(value):
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Password cannot be blank")
        return value


def auth_response(user: User) -> dict:
    return {
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "full_name": user.full_name,
    }


class FeedbackRequest(BaseModel):
    message_id: str = Field(min_length=1, max_length=128)
    helpful: bool
    comment: str | None = Field(default=None, max_length=2000)


def serialize_document(record: DocumentRecord) -> dict:
    return {
        "id": record.id,
        "filename": record.original_filename,
        "status": record.status,
        "chunks": record.chunk_count,
        "byte_size": record.byte_size,
        "created_at": record.created_at,
        "error_message": record.error_message,
        "storage_key": getattr(record, "storage_key", None) or record.stored_filename,
    }


def ensure_bootstrap_users(db: Session) -> None:
    if not settings.jwt_secret:
        logger.warning("JWT_SECRET must be configured before bootstrap users can be initialized.")
        return

    # 1. Bootstrap system administrator if missing
    if settings.bootstrap_admin_email and settings.bootstrap_admin_password:
        admin_email = settings.bootstrap_admin_email.lower().strip()
        admin = db.scalar(select(User).where(User.email == admin_email))
        if admin is None:
            db.add(User(
                email=admin_email,
                full_name="System Administrator",
                password_hash=hash_password(settings.bootstrap_admin_password),
                role="system_admin",
            ))
            db.commit()
            logger.info("Created bootstrap system administrator (%s)", admin_email)

    # 2. Bootstrap default employee user for workplace assistant chat queries
    if settings.bootstrap_employee_email and settings.bootstrap_employee_password:
        emp_email = settings.bootstrap_employee_email.lower().strip()
        emp = db.scalar(select(User).where(User.email == emp_email))
        if emp is None:
            db.add(User(
                email=emp_email,
                full_name="Employee User",
                password_hash=hash_password(settings.bootstrap_employee_password),
                role="employee",
            ))
            db.commit()
            logger.info("Created bootstrap employee account (%s)", emp_email)


# Backward compatibility alias
ensure_bootstrap_admin = ensure_bootstrap_users


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(select(1))
    storage_svc = get_storage_service()
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.environment,
        "storage": {
            "configured": storage_svc.is_configured(),
            "bucket": storage_svc.bucket_name,
        },
    }


@router.get("/health/storage")
def storage_health(
    _: User = Depends(require_roles("hr_admin", "system_admin")),
):
    storage_service = get_storage_service()
    try:
        result = storage_service.validate_configuration(check_bucket=True)
        return {"status": "ok", "storage": result}
    except StorageConfigurationError as err:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(err))


@router.post("/auth/login")
def login(
    payload: LoginRequest,
    _: None = Depends(rate_limiter.limit("login", 10, 60)),
    db: Session = Depends(get_db),
):
    user = db.scalar(select(User).where(User.email == payload.email.strip().lower()))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return auth_response(user)


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    _: None = Depends(rate_limiter.limit("register", 5, 60)),
    db: Session = Depends(get_db),
):
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="Registration is temporarily unavailable")
    if db.scalar(select(User.id).where(User.email == payload.email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    user = User(
        email=payload.email,
        full_name=payload.name,
        password_hash=hash_password(payload.password),
        role="employee",  # Always employee. Admin accounts come only from bootstrap configuration.
        is_active=True,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # Concurrent registration with the same email
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    db.refresh(user)
    logger.info("Registered employee account (id=%s)", user.id)
    return auth_response(user)


@router.post("/auth/refresh")
def refresh_token(user: User = Depends(get_current_user)):
    return auth_response(user)


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role, "full_name": user.full_name}


@router.post("/chat")
def chat(
    payload: ChatRequest,
    _: None = Depends(rate_limiter.limit("chat", 20, 60)),
    user: User = Depends(get_current_user),
):
    try:
        result = ask(payload.question)
        write_audit(payload.question, result["source_used"], result.get("trace", []), user.id)
        return {
            "answer": result["answer"],
            "source_used": result["source_used"],
            "trace": result.get("trace", []),
            "citations": result.get("citations", []),
            "rewritten_query": result.get("current_query", payload.question),
        }
    except Exception:
        logger.exception("Chat request failed", extra={"user_id": user.id})
        raise HTTPException(status_code=503, detail="The assistant is temporarily unavailable. Please try again.")


@router.post("/feedback", status_code=status.HTTP_201_CREATED)
def feedback(payload: FeedbackRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.add(Feedback(user_id=user.id, **payload.model_dump()))
    db.commit()
    return {"message": "Feedback recorded"}


@router.get("/documents")
def list_documents(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("hr_admin", "system_admin")),
):
    records = db.scalars(select(DocumentRecord).order_by(DocumentRecord.created_at.desc())).all()
    return {"documents": [serialize_document(record) for record in records]}


@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("hr_admin", "system_admin")),
):
    storage_service = get_storage_service()
    if not storage_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Document storage is not configured. SUPABASE_URL and SUPABASE_SECRET_KEY are required.",
        )

    filename = Path(file.filename or "").name
    suffix = Path(filename).suffix.lower()
    if not filename or suffix not in SUPPORTED:
        raise HTTPException(status_code=400, detail=f"Supported types: {', '.join(sorted(SUPPORTED))}")

    content = await file.read(settings.max_upload_bytes + 1)
    if not content or len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail=f"File must be between 1 byte and {settings.max_upload_bytes} bytes")

    content_hash = hashlib.sha256(content).hexdigest()
    existing = db.scalar(select(DocumentRecord).where(DocumentRecord.content_hash == content_hash))
    if existing and existing.status == "ready":
        raise HTTPException(status_code=409, detail=f"This document is already indexed as '{existing.original_filename}'")

    # If previously failed, clean up the failed record so the user can cleanly retry
    if existing and existing.status == "failed":
        if existing.storage_key:
            storage_service.delete_file(existing.storage_key)
        db.delete(existing)
        db.commit()

    document_id = str(uuid.uuid4())
    storage_key = storage_service.generate_storage_key(document_id, filename)
    stored_name = storage_key

    record = DocumentRecord(
        id=document_id,
        original_filename=filename,
        stored_filename=stored_name,
        storage_key=storage_key,
        content_hash=content_hash,
        content_type=file.content_type or "application/octet-stream",
        byte_size=len(content),
        status="indexing",
        created_by_id=user.id,
    )
    db.add(record)
    db.commit()

    # Step 1: Upload original document to private Supabase Storage bucket
    try:
        storage_service.upload_file(
            storage_key=storage_key,
            content=content,
            content_type=file.content_type or "application/octet-stream",
        )
    except Exception as upload_err:
        logger.exception("Failed to upload document to Supabase Storage", extra={"document_id": document_id})
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store document in cloud storage service.",
        ) from upload_err

    # Step 2: Extract text from temporary local file, chunk, and embed into Pinecone
    ids: list[str] = []
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_file = Path(temp_dir) / storage_key
            temp_file.write_bytes(content)
            chunks = chunk_documents(load_file(temp_file, source_name=filename))

        if not chunks:
            raise ValueError("Document yielded no text chunks for vector indexing")

        ids = [f"{document_id}:{index}" for index in range(len(chunks))]
        for index, chunk in enumerate(chunks):
            chunk.metadata.update({"document_id": document_id, "source": filename, "chunk_index": index})

        add_documents(chunks, ids=ids)

        record.status = "ready"
        record.chunk_count = len(chunks)
        record.vector_ids_json = json.dumps(ids)
        record.error_message = None
        db.commit()
        return {"message": "Document indexed", "document": serialize_document(record), "ids_created": len(ids)}
    except Exception as ingest_err:
        logger.exception("Document ingestion failed", extra={"document_id": document_id})
        if ids:
            try:
                delete_documents(ids)
            except Exception:
                logger.warning("Could not roll back Pinecone vector IDs for %s", document_id)
        # Clean up uploaded storage object on ingestion failure to prevent orphans
        storage_service.delete_file(storage_key)
        record.status = "failed"
        record.error_message = "Document could not be indexed. Review server logs for details."
        db.commit()
        raise HTTPException(status_code=500, detail="Document indexing failed")


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("hr_admin", "system_admin")),
):
    record = db.get(DocumentRecord, document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found")

    vector_ids = json.loads(record.vector_ids_json) if record.vector_ids_json else []
    if vector_ids:
        try:
            delete_documents(vector_ids)
        except Exception as vec_err:
            logger.warning("Failed to delete vectors for document %s: %s", document_id, vec_err)

    # Delete from Supabase Storage
    storage_service = get_storage_service()
    key_to_delete = record.storage_key or record.stored_filename
    if key_to_delete and storage_service.is_configured():
        try:
            storage_service.delete_file(key_to_delete)
        except Exception as storage_err:
            logger.warning("Failed to delete storage object %s: %s", key_to_delete, storage_err)

    # Clean up local legacy copy if one existed
    if record.stored_filename:
        (Path(settings.upload_dir) / record.stored_filename).unlink(missing_ok=True)

    db.delete(record)
    db.commit()


@router.get("/documents/{document_id}/download")
def download_document(
    document_id: str,
    signed_url: bool = Query(default=False),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("hr_admin", "system_admin")),
):
    record = db.get(DocumentRecord, document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found")

    storage_service = get_storage_service()
    key = record.storage_key or record.stored_filename

    if signed_url:
        if not storage_service.is_configured():
            raise HTTPException(status_code=503, detail="Storage service is not configured for signed URLs")
        try:
            url = storage_service.create_signed_url(key, expires_in=300)
            return {"url": url, "filename": record.original_filename}
        except StorageFileNotFoundError:
            raise HTTPException(status_code=404, detail="Document file not found in storage")
        except Exception as e:
            logger.exception("Failed to generate signed URL for document %s", document_id)
            raise HTTPException(status_code=500, detail="Failed to generate download URL")

    content: bytes | None = None
    if storage_service.is_configured() and key:
        try:
            content = storage_service.download_file(key)
        except StorageFileNotFoundError:
            content = None
        except Exception:
            logger.exception("Failed to retrieve document %s from Supabase Storage", document_id)

    # Fallback to local file if not yet migrated
    if content is None and record.stored_filename:
        local_path = Path(settings.upload_dir) / record.stored_filename
        if local_path.is_file():
            content = local_path.read_bytes()

    if content is None:
        raise HTTPException(status_code=404, detail="Document file content not found")

    return Response(
        content=content,
        media_type=record.content_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{record.original_filename}"'
        },
    )


@router.get("/documents/{document_id}/preview")
def preview_document(
    document_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("hr_admin", "system_admin")),
):
    record = db.get(DocumentRecord, document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found")

    storage_service = get_storage_service()
    key = record.storage_key or record.stored_filename
    content: bytes | None = None

    if storage_service.is_configured() and key:
        try:
            content = storage_service.download_file(key)
        except StorageFileNotFoundError:
            content = None
        except Exception:
            logger.exception("Failed to retrieve document %s from Supabase Storage", document_id)

    if content is None and record.stored_filename:
        local_path = Path(settings.upload_dir) / record.stored_filename
        if local_path.is_file():
            content = local_path.read_bytes()

    if content is None:
        raise HTTPException(status_code=404, detail="Document file content not found")

    return Response(
        content=content,
        media_type=record.content_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'inline; filename="{record.original_filename}"'
        },
    )


@router.post("/documents/{document_id}/reprocess")
def reprocess_document(
    document_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("hr_admin", "system_admin")),
):
    record = db.get(DocumentRecord, document_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Document not found")

    storage_service = get_storage_service()
    key = record.storage_key or record.stored_filename
    content: bytes | None = None

    if storage_service.is_configured() and key:
        try:
            content = storage_service.download_file(key)
        except StorageFileNotFoundError:
            content = None
        except Exception:
            logger.exception("Failed to download document %s for reprocessing", document_id)

    if content is None and record.stored_filename:
        local_path = Path(settings.upload_dir) / record.stored_filename
        if local_path.is_file():
            content = local_path.read_bytes()

    if content is None:
        raise HTTPException(status_code=404, detail="Original document file not found for reprocessing")

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_file = Path(temp_dir) / (record.stored_filename or f"{document_id}.bin")
        temp_file.write_bytes(content)
        chunks = chunk_documents(load_file(temp_file, source_name=record.original_filename))

    old_ids = json.loads(record.vector_ids_json) if record.vector_ids_json else []
    if old_ids:
        try:
            delete_documents(old_ids)
        except Exception:
            pass

    ids = [f"{document_id}:{index}" for index in range(len(chunks))]
    for index, chunk in enumerate(chunks):
        chunk.metadata.update({"document_id": document_id, "source": record.original_filename, "chunk_index": index})

    add_documents(chunks, ids=ids)

    record.status = "ready"
    record.chunk_count = len(chunks)
    record.vector_ids_json = json.dumps(ids)
    record.error_message = None
    db.commit()

    return {"message": "Document reprocessed", "document": serialize_document(record), "chunks": len(chunks)}


@router.get("/audit")
def list_audit(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("hr_admin", "system_admin")),
):
    rows = db.scalars(select(QueryAudit).order_by(QueryAudit.created_at.desc()).offset(offset).limit(limit)).all()
    return {"logs": [{"id": row.id, "created_at": row.created_at, "question": row.question, "source_used": row.source_used, "trace_json": row.trace_json} for row in rows]}


@router.get("/audit/stats")
def audit_stats(db: Session = Depends(get_db), _: User = Depends(require_roles("hr_admin", "system_admin"))):
    total = db.scalar(select(func.count()).select_from(QueryAudit)) or 0
    sources = dict(db.execute(select(QueryAudit.source_used, func.count()).group_by(QueryAudit.source_used)).all())
    return {
        "total": total,
        "successful": total - sources.get("insufficient_evidence", 0),
        "web_fallbacks": sources.get("web_search", 0),
        "insufficient": sources.get("insufficient_evidence", 0),
    }
