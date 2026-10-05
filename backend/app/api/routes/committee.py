from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import CommitteeMember
from app.schemas.schemas import CommitteeMemberCreate, CommitteeMemberUpdate, CommitteeMemberOut
from app.services.cloudinary_service import upload_image, delete_image

router = APIRouter(prefix="/committee", tags=["Committee"])


@router.get("/", response_model=list[CommitteeMemberOut])
def list_members(db: Session = Depends(get_db)):
    return db.query(CommitteeMember).filter(CommitteeMember.is_active == True).order_by(CommitteeMember.order_index).all()


@router.post("/", response_model=CommitteeMemberOut, status_code=201)
def create_member(data: CommitteeMemberCreate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    member = CommitteeMember(**data.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/{member_id}", response_model=CommitteeMemberOut)
def update_member(member_id: int, data: CommitteeMemberUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    member = db.query(CommitteeMember).filter(CommitteeMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(member, k, v)
    db.commit()
    db.refresh(member)
    return member


@router.post("/{member_id}/photo", response_model=CommitteeMemberOut)
async def upload_photo(member_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    member = db.query(CommitteeMember).filter(CommitteeMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member.photo_public_id:
        delete_image(member.photo_public_id)
    result = await upload_image(file, folder="ppa/committee")
    member.photo_url = result["url"]
    member.photo_public_id = result["public_id"]
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=204)
def delete_member(member_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_admin)):
    member = db.query(CommitteeMember).filter(CommitteeMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member.photo_public_id:
        delete_image(member.photo_public_id)
    db.delete(member)
    db.commit()
