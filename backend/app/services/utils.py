import re
from datetime import datetime
from sqlalchemy.orm import Session


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return f"{text}-{int(datetime.utcnow().timestamp())}"


def log_activity(db: Session, user_id: int, action: str, resource_type: str = None, resource_id: int = None, details: str = None):
    from app.models.user import ActivityLog
    log = ActivityLog(user_id=user_id, action=action, resource_type=resource_type, resource_id=resource_id, details=details)
    db.add(log)
    db.commit()
