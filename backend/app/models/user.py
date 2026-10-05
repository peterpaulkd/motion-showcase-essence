from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    superadmin = "superadmin"
    admin = "admin"
    staff = "staff"


class EventStatus(str, enum.Enum):
    upcoming = "upcoming"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


class AnnouncementStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="staff")
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    activity_logs = relationship("ActivityLog", back_populates="user")


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(300), unique=True, index=True)
    description = Column(Text)
    venue = Column(String(255))
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    status = Column(String(20), default="upcoming")
    cover_image_url = Column(String(500))
    cover_image_public_id = Column(String(255))
    is_featured = Column(Boolean, default=False)
    registration_link = Column(String(500))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    images = relationship("EventImage", back_populates="event", cascade="all, delete-orphan")


class EventImage(Base):
    __tablename__ = "event_images"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    public_id = Column(String(255))
    caption = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    event = relationship("Event", back_populates="images")


class GalleryImage(Base):
    __tablename__ = "gallery_images"
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=False)
    public_id = Column(String(255))
    caption = Column(String(255))
    category = Column(String(100), default="general")
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(300), unique=True, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(String(500))
    cover_image_url = Column(String(500))
    cover_image_public_id = Column(String(255))
    status = Column(String(20), default="draft")
    is_featured = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CommitteeMember(Base):
    __tablename__ = "committee_members"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    bio = Column(Text)
    photo_url = Column(String(500))
    photo_public_id = Column(String(255))
    email = Column(String(255))
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100))
    resource_id = Column(Integer)
    details = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="activity_logs")
