import json

from app.core.database import Base, SessionLocal, engine
from app.models import QueryAudit


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def write_audit(question: str, source_used: str, trace: list[str], user_id: int | None = None) -> None:
    with SessionLocal() as db:
        db.add(QueryAudit(question=question, source_used=source_used, trace_json=json.dumps(trace), user_id=user_id))
        db.commit()
