import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB = 10


async def upload_image(file: UploadFile, folder: str = "ppa") -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, GIF allowed")
    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {MAX_SIZE_MB}MB limit")
    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        transformation=[{"quality": "auto", "fetch_format": "auto"}],
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}


def delete_image(public_id: str) -> bool:
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception:
        return False
