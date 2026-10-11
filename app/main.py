import logging
import os
from contextlib import asynccontextmanager

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    port = os.getenv("PORT", "10000")
    logger.info("Initializing Clario backend (app_env=%s, port=%s)...", settings.app_env, port)

    # 1. Initialize database tables and bootstrap users
    try:
        init_db()
        with SessionLocal() as db:
            ensure_bootstrap_users(db)
        logger.info("Database initialized and bootstrap users checked.")
    except Exception as exc:
        logger.warning("Database startup initialization issue: %s", exc)

    # 2. Supabase Storage readiness check
    storage_service = get_storage_service()
    if settings.environment == "production" or settings.app_env == "production":
        try:
            storage_service.validate_configuration(check_bucket=True)
            logger.info("Supabase Storage validated successfully for bucket '%s'", storage_service.bucket_name)
        except Exception as exc:
            logger.error("Supabase Storage configuration check issue on startup: %s", exc)
    else:
        if storage_service.is_configured():
            logger.info("Supabase Storage configured for bucket '%s'", storage_service.bucket_name)
        else:
            logger.warning(
                "Supabase Storage credentials not configured. Document uploads will require SUPABASE_URL and SUPABASE_SECRET_KEY."
            )

    logger.info("Clario backend startup complete; ready to serve on port %s.", port)
    yield
    logger.info("Clario backend shutting down...")


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)


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
