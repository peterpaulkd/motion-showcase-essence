from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


# ── Users ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "staff"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    avatar_url: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Events ────────────────────────────────────────────────────────────────────
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    venue: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "upcoming"
    is_featured: bool = False
    registration_link: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    registration_link: Optional[str] = None

class EventImageOut(BaseModel):
    id: int
    image_url: str
    caption: Optional[str]
    model_config = {"from_attributes": True}

class EventOut(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str]
    venue: Optional[str]
    start_date: datetime
    end_date: Optional[datetime]
    status: str
    cover_image_url: Optional[str]
    is_featured: bool
    registration_link: Optional[str]
    created_at: datetime
    images: List[EventImageOut] = []
    model_config = {"from_attributes": True}


# ── Gallery ───────────────────────────────────────────────────────────────────
class GalleryImageOut(BaseModel):
    id: int
    image_url: str
    caption: Optional[str]
    category: str
    created_at: datetime
    model_config = {"from_attributes": True}

class GalleryImageUpdate(BaseModel):
    caption: Optional[str] = None
    category: Optional[str] = None


# ── Announcements ─────────────────────────────────────────────────────────────
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    status: str = "draft"
    is_featured: bool = False

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None

class AnnouncementOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    cover_image_url: Optional[str]
    status: str
    is_featured: bool
    published_at: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Committee ─────────────────────────────────────────────────────────────────
class CommitteeMemberCreate(BaseModel):
    full_name: str
    position: str
    bio: Optional[str] = None
    email: Optional[str] = None
    order_index: int = 0

class CommitteeMemberUpdate(BaseModel):
    full_name: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class CommitteeMemberOut(BaseModel):
    id: int
    full_name: str
    position: str
    bio: Optional[str]
    photo_url: Optional[str]
    email: Optional[str]
    order_index: int
    is_active: bool
    model_config = {"from_attributes": True}


# ── Pagination ────────────────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    pages: int
