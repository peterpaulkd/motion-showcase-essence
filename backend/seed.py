"""Run: python seed.py"""
import sys
sys.path.append(".")
from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()
existing = db.query(User).filter(User.email == "admin@ppa.ac.ke").first()
if existing:
    print("Superadmin already exists.")
else:
    admin = User(
        email="admin@ppa.ac.ke",
        full_name="PPA Administrator",
        hashed_password=hash_password("Admin@2025!"),
        role="superadmin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print("Superadmin created: admin@ppa.ac.ke / Admin@2025!")
    print("IMPORTANT: Change the password immediately after first login.")
db.close()
