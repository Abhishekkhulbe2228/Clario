import hashlib
import json
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.rate_limit import rate_limiter
from app.core.security import create_access_token, get_current_user, hash_password, require_roles, verify_password
from app.models import DocumentRecord, Feedback, QueryAudit, User
from app.rag.vector_store import add_documents
from app.rag.workflow import ask
from app.services.audit import write_audit
from app.services.ingestion import SUPPORTED, chunk_documents, load_file

logger = logging.getLogger(__name__)
router = APIRouter(tags=["clario"])
settings = get_settings()


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=3000)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=12, max_length=256)


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
                password_hash=hash_password(settings.bootstrap_admin_password),
                role="system_admin",
            ))
            db.commit()
            logger.info("Created bootstrap system administrator (%s)", admin_email)

    # 2. Bootstrap default employee user for workplace assistant chat queries
    emp_email = "employee@company.com"
    emp = db.scalar(select(User).where(User.email == emp_email))
    if emp is None:
        db.add(User(
            email=emp_email,
            password_hash=hash_password("Employee1234!"),
            role="employee",
        ))
        db.commit()
        logger.info("Created bootstrap employee account (%s)", emp_email)


# Backward compatibility alias
ensure_bootstrap_admin = ensure_bootstrap_users


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(select(1))
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    ensure_bootstrap_users(db)
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return {
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
    }


@router.post("/auth/refresh")
def refresh_token(user: User = Depends(get_current_user)):
    return {
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
    }


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}



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
    filename = Path(file.filename or "").name
    suffix = Path(filename).suffix.lower()
    if not filename or suffix not in SUPPORTED:
        raise HTTPException(status_code=400, detail=f"Supported types: {', '.join(sorted(SUPPORTED))}")
    content = await file.read(settings.max_upload_bytes + 1)
    if not content or len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail=f"File must be between 1 byte and {settings.max_upload_bytes} bytes")
    content_hash = hashlib.sha256(content).hexdigest()
    existing = db.scalar(select(DocumentRecord).where(DocumentRecord.content_hash == content_hash))
    if existing:
        raise HTTPException(status_code=409, detail=f"This document is already indexed as '{existing.original_filename}'")

    document_id = str(uuid.uuid4())
    stored_name = f"{document_id}{suffix}"
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / stored_name
    record = DocumentRecord(
        id=document_id,
        original_filename=filename,
        stored_filename=stored_name,
        content_hash=content_hash,
        content_type=file.content_type or "application/octet-stream",
        byte_size=len(content),
        status="indexing",
        created_by_id=user.id,
    )
    db.add(record)
    db.commit()

    try:
        destination.write_bytes(content)
        chunks = chunk_documents(load_file(destination))
        ids = [f"{document_id}:{index}" for index in range(len(chunks))]
        for index, chunk in enumerate(chunks):
            chunk.metadata.update({"document_id": document_id, "source": filename, "chunk_index": index})
        add_documents(chunks, ids=ids)
        record.status = "ready"
        record.chunk_count = len(chunks)
        record.vector_ids_json = json.dumps(ids)
        db.commit()
        return {"message": "Document indexed", "document": serialize_document(record), "ids_created": len(ids)}
    except Exception:
        logger.exception("Document ingestion failed", extra={"document_id": document_id})
        record.status = "failed"
        record.error_message = "Document could not be indexed. Review server logs for details."
        db.commit()
        destination.unlink(missing_ok=True)
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
    from app.rag.vector_store import delete_documents
    vector_ids = json.loads(record.vector_ids_json)
    if vector_ids:
        delete_documents(vector_ids)
    (Path(settings.upload_dir) / record.stored_filename).unlink(missing_ok=True)
    db.delete(record)
    db.commit()


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
