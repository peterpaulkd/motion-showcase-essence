from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from math import ceil
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import Announcement
from app.schemas.schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementOut
from app.services.cloudinary_service import upload_image, delete_image
from app.services.utils import slugify, log_activity

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("/")
def list_announcements(
    page: int = Query(1, ge=1), per_page: int = Query(10, ge=1, le=50),
    status: Optional[str] = "published", search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Announcement)
    if status:
        q = q.filter(Announcement.status == status)
    if search:
        q = q.filter(or_(Announcement.title.ilike(f"%{search}%"), Announcement.content.ilike(f"%{search}%")))
    q = q.order_by(Announcement.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": ceil(total / per_page) if total else 1}


@router.get("/{slug}", response_model=AnnouncementOut)
def get_announcement(slug: str, db: Session = Depends(get_db)):
    ann = db.query(Announcement).filter(Announcement.slug == slug, Announcement.status == "published").first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return ann


@router.post("/", response_model=AnnouncementOut, status_code=201)
def create_announcement(data: AnnouncementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    ann = Announcement(**data.model_dump(), slug=slugify(data.title), created_by=current_user.id)
    if data.status == "published":
        ann.published_at = datetime.utcnow()
    db.add(ann)
    db.commit()
    db.refresh(ann)
    log_activity(db, current_user.id, "create_announcement", "announcement", ann.id, ann.title)
    return ann


@router.put("/{ann_id}", response_model=AnnouncementOut)
def update_announcement(ann_id: int, data: AnnouncementUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(ann, k, v)
    if data.status == "published" and not ann.published_at:
        ann.published_at = datetime.utcnow()
    db.commit()
    db.refresh(ann)
    return ann


@router.delete("/{ann_id}", status_code=204)
def delete_announcement(ann_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if ann.cover_image_public_id:
        delete_image(ann.cover_image_public_id)
    db.delete(ann)
    db.commit()


@router.post("/{ann_id}/cover", response_model=AnnouncementOut)
async def upload_cover(ann_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if ann.cover_image_public_id:
        delete_image(ann.cover_image_public_id)
    result = await upload_image(file, folder="ppa/announcements")
    ann.cover_image_url = result["url"]
    ann.cover_image_public_id = result["public_id"]
    db.commit()
    db.refresh(ann)
    return ann
