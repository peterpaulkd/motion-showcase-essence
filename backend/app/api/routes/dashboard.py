from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import Event, GalleryImage, Announcement, CommitteeMember, ActivityLog, User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    return {
        "events": {
            "total": db.query(Event).count(),
            "upcoming": db.query(Event).filter(Event.status == "upcoming").count(),
            "ongoing": db.query(Event).filter(Event.status == "ongoing").count(),
            "completed": db.query(Event).filter(Event.status == "completed").count(),
        },
        "gallery": db.query(GalleryImage).count(),
        "announcements": {
            "total": db.query(Announcement).count(),
            "published": db.query(Announcement).filter(Announcement.status == "published").count(),
            "draft": db.query(Announcement).filter(Announcement.status == "draft").count(),
        },
        "committee": db.query(CommitteeMember).filter(CommitteeMember.is_active == True).count(),
        "users": db.query(User).filter(User.is_active == True).count(),
    }


@router.get("/activity-logs")
def get_activity_logs(
    page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db), current_user=Depends(get_current_admin)
):
    from math import ceil
    q = db.query(ActivityLog).order_by(ActivityLog.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return {"items": [{"id": l.id, "action": l.action, "resource_type": l.resource_type, "resource_id": l.resource_id, "details": l.details, "created_at": l.created_at, "user": l.user.full_name if l.user else None} for l in items], "total": total, "page": page, "pages": ceil(total / per_page) if total else 1}


@router.get("/users")
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    from app.schemas.schemas import UserOut
    users = db.query(User).all()
    return [UserOut.model_validate(u) for u in users]
