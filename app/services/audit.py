import json
import logging

from sqlalchemy import inspect, text

from app.core.database import Base, SessionLocal, engine
from app.models import QueryAudit

logger = logging.getLogger(__name__)

# Additive, nullable columns introduced after the initial schema.
# Base.metadata.create_all() only creates missing tables; it never alters
# existing ones, so these are added explicitly (idempotent, non-destructive).
_ADDITIVE_COLUMNS: dict[str, dict[str, str]] = {
    "users": {"full_name": "VARCHAR(120)"},
    "documents": {"storage_key": "VARCHAR(512)"},
}


def _ensure_additive_columns() -> None:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    for table, columns in _ADDITIVE_COLUMNS.items():
        if table not in existing_tables:
            continue
        present = {column["name"] for column in inspector.get_columns(table)}
        for name, ddl_type in columns.items():
            if name in present:
                continue
            with engine.begin() as conn:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl_type}"))
            logger.info("Added column %s.%s", table, name)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_additive_columns()


def write_audit(question: str, source_used: str, trace: list[str], user_id: int | None = None) -> None:
    with SessionLocal() as db:
        db.add(QueryAudit(question=question, source_used=source_used, trace_json=json.dumps(trace), user_id=user_id))
        db.commit()
