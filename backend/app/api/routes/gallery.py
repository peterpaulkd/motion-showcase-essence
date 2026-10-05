from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import GalleryImage
from app.schemas.schemas import GalleryImageOut, GalleryImageUpdate
from app.services.cloudinary_service import upload_image, delete_image
from app.services.utils import log_activity

router = APIRouter(prefix="/gallery", tags=["Gallery"])


@router.get("/")
def list_gallery(
    page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None, db: Session = Depends(get_db)
):
    q = db.query(GalleryImage)
    if category:
        q = q.filter(GalleryImage.category == category)
    q = q.order_by(GalleryImage.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": ceil(total / per_page) if total else 1}


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    from sqlalchemy import distinct
    cats = db.query(distinct(GalleryImage.category)).all()
    return [c[0] for c in cats]


@router.post("/upload", status_code=201)
async def upload_gallery_images(
    files: list[UploadFile] = File(...),
    category: str = Query("general"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin)
):
    uploaded = []
    for file in files:
        result = await upload_image(file, folder="ppa/gallery")
        img = GalleryImage(image_url=result["url"], public_id=result["public_id"], category=category, uploaded_by=current_user.id)
        db.add(img)
        uploaded.append({"url": result["url"], "public_id": result["public_id"]})
    db.commit()
    log_activity(db, current_user.id, "upload_gallery", "gallery", None, f"{len(uploaded)} images")
    return {"uploaded": uploaded}


@router.put("/{image_id}", response_model=GalleryImageOut)
def update_gallery_image(image_id: int, data: GalleryImageUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    img = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(img, k, v)
    db.commit()
    db.refresh(img)
    return img


@router.delete("/{image_id}", status_code=204)
def delete_gallery_image(image_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    img = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    if img.public_id:
        delete_image(img.public_id)
    db.delete(img)
    db.commit()
