from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings, BASE_DIR
from app.core.logging import configure_logging
from app.core.database import SessionLocal
from app.services.audit import init_db
from app.api.routes import router, ensure_bootstrap_users


configure_logging()
settings = get_settings()
init_db()
try:
    with SessionLocal() as db:
        ensure_bootstrap_users(db)
except Exception as e:
    import logging
    logging.getLogger(__name__).warning("Could not run ensure_bootstrap_users on startup: %s", e)


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
