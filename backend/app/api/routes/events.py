from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from math import ceil
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import Event, EventImage
from app.schemas.schemas import EventCreate, EventUpdate, EventOut
from app.services.cloudinary_service import upload_image, delete_image
from app.services.utils import slugify, log_activity

router = APIRouter(prefix="/events", tags=["Events"])


def paginate(query, page: int, per_page: int):
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": ceil(total / per_page) if total else 1}


# ── Public ────────────────────────────────────────────────────────────────────
@router.get("/")
def list_events(
    page: int = Query(1, ge=1), per_page: int = Query(12, ge=1, le=50),
    status: Optional[str] = None, search: Optional[str] = None,
    featured: Optional[bool] = None, db: Session = Depends(get_db)
):
    q = db.query(Event)
    if status:
        q = q.filter(Event.status == status)
    if featured is not None:
        q = q.filter(Event.is_featured == featured)
    if search:
        q = q.filter(or_(Event.title.ilike(f"%{search}%"), Event.description.ilike(f"%{search}%"), Event.venue.ilike(f"%{search}%")))
    q = q.order_by(Event.start_date.desc())
    return paginate(q, page, per_page)


@router.get("/{slug}", response_model=EventOut)
def get_event(slug: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


# ── Admin ─────────────────────────────────────────────────────────────────────
@router.post("/", response_model=EventOut, status_code=201)
async def create_event(
    data: EventCreate, db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    event = Event(**data.model_dump(), slug=slugify(data.title), created_by=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    log_activity(db, current_user.id, "create_event", "event", event.id, event.title)
    return event


@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: int, data: EventUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(event, k, v)
    db.commit()
    db.refresh(event)
    log_activity(db, current_user.id, "update_event", "event", event.id, event.title)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.cover_image_public_id:
        delete_image(event.cover_image_public_id)
    log_activity(db, current_user.id, "delete_event", "event", event.id, event.title)
    db.delete(event)
    db.commit()


@router.post("/{event_id}/cover", response_model=EventOut)
async def upload_cover(event_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.cover_image_public_id:
        delete_image(event.cover_image_public_id)
    result = await upload_image(file, folder="ppa/events")
    event.cover_image_url = result["url"]
    event.cover_image_public_id = result["public_id"]
    db.commit()
    db.refresh(event)
    return event


@router.post("/{event_id}/images")
async def add_event_images(event_id: int, files: list[UploadFile] = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    uploaded = []
    for file in files:
        result = await upload_image(file, folder="ppa/events/gallery")
        img = EventImage(event_id=event_id, image_url=result["url"], public_id=result["public_id"])
        db.add(img)
        uploaded.append(result["url"])
    db.commit()
    return {"uploaded": uploaded}


@router.delete("/{event_id}/images/{image_id}", status_code=204)
def delete_event_image(event_id: int, image_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    img = db.query(EventImage).filter(EventImage.id == image_id, EventImage.event_id == event_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    if img.public_id:
        delete_image(img.public_id)
    db.delete(img)
    db.commit()
