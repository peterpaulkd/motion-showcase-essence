import os

from fastapi import APIRouter, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Google Authentication"])


class GoogleLoginRequest(BaseModel):
    credential: str


@router.post("/google")
def google_login(data: GoogleLoginRequest):

    client_id = os.getenv("GOOGLE_CLIENT_ID")

    if not client_id:
        raise HTTPException(500, "Google authentication is not configured")

    try:
        google_user = id_token.verify_oauth2_token(
            data.credential,
            requests.Request(),
            client_id
        )
    except ValueError:
        raise HTTPException(401, "Invalid Google credentials")

    email = google_user.get("email", "").lower()

    if not google_user.get("email_verified"):
        raise HTTPException(403, "Google email is not verified")

    allowed_emails = [
        item.strip().lower()
        for item in os.getenv("ADMIN_EMAILS", "").split(",")
        if item.strip()
    ]

    if email not in allowed_emails:
        raise HTTPException(403, "This Google account is not authorised")

    db: Session = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = User(
                email=email,
                full_name=google_user.get("name", email),
                hashed_password=hash_password(os.urandom(32).hex()),
                role="admin",
                is_active=True,
                avatar_url=google_user.get("picture")
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not user.is_active:
            raise HTTPException(403, "Admin account is disabled")

        if user.role not in ["admin", "superadmin"]:
            raise HTTPException(403, "Insufficient permissions")

        return {
            "access_token": create_access_token(
                {"sub": str(user.id)}
            ),
            "refresh_token": create_refresh_token(
                {"sub": str(user.id)}
            ),
            "token_type": "bearer"
        }

    finally:
        db.close()