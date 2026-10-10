import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings, BASE_DIR
from app.core.logging import configure_logging
from app.core.database import SessionLocal
from app.services.audit import init_db
from app.services.storage import get_storage_service, StorageConfigurationError
from app.api.routes import router, ensure_bootstrap_users

logger = logging.getLogger(__name__)

configure_logging()
settings = get_settings()
init_db()
try:
    with SessionLocal() as db:
        ensure_bootstrap_users(db)
except Exception as e:
    logger.warning("Could not run ensure_bootstrap_users on startup: %s", e)

# Validate storage configuration on startup
storage_service = get_storage_service()
if settings.environment == "production" or settings.app_env == "production":
    try:
        storage_service.validate_configuration(check_bucket=True)
        logger.info("Supabase Storage validated successfully for bucket '%s'", storage_service.bucket_name)
    except Exception as exc:
        logger.critical("Fatal: Supabase Storage configuration validation failed on startup: %s", exc)
        raise RuntimeError(f"Supabase Storage configuration failure: {exc}") from exc
else:
    if storage_service.is_configured():
        logger.info("Supabase Storage configured for bucket '%s'", storage_service.bucket_name)
    else:
        logger.warning(
            "Supabase Storage credentials not configured. Document uploads will require SUPABASE_URL and SUPABASE_SECRET_KEY."
        )


app = FastAPI(title=settings.app_name, version="1.0.0")


# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(router, prefix=settings.api_prefix)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
