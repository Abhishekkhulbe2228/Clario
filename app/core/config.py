from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Clario"
    app_env: str = "development"
    groq_api_key: str = ""
    tavily_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index_name: str = "hr-policy-rag"
    pinecone_namespace: str = "company-hr-kb"
    embedding_model: str = "all-MiniLM-L6-v2"
    groq_model: str = "openai/gpt-oss-20b"
    top_k: int = 4
    max_retries: int = 1
    api_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    environment: str = "development"
    database_url: str = f"sqlite:///{BASE_DIR / 'data' / 'clario.db'}"
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    bootstrap_admin_email: str = ""
    bootstrap_admin_password: str = ""
    max_upload_bytes: int = 10 * 1024 * 1024
    audit_db_path: str = str(BASE_DIR / "data" / "audit.db")
    upload_dir: str = str(BASE_DIR / "uploads")
    sample_kb_dir: str = str(BASE_DIR / "data" / "sample_kb")
    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"), extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]




@lru_cache
def get_settings() -> Settings:
    return Settings()
