from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, CommunityReview
from models.requests import ReviewCreate
from app.dependencies import get_current_user
from main import check_feature_blocked

router = APIRouter()

@router.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(CommunityReview).filter(CommunityReview.is_approved == 1).order_by(desc(CommunityReview.created_at)).all()
    return reviews

@router.get("/reviews/my")
def get_my_review(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(CommunityReview).filter(CommunityReview.user_id == current_user.id).first()
    if not review:
        return None
    return {
        "id": review.id,
        "rating": review.rating,
        "content": review.content,
        "is_approved": review.is_approved,
        "author_name": review.author_name,
        "created_at": review.created_at.isoformat() if review.created_at else ""
    }

@router.post("/reviews")
def create_review(req: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_feature_blocked(current_user, "community", db)
    existing = db.query(CommunityReview).filter(CommunityReview.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review. Please wait for admin approval.")

    email_parts = current_user.email.split("@")
    if len(email_parts) == 2 and len(email_parts[0]) > 1:
        masked_name = f"{email_parts[0][0]}***@{email_parts[1]}"
    else:
        masked_name = "User"

    review = CommunityReview(
        user_id=current_user.id,
        author_name=masked_name,
        rating=req.rating,
        content=req.content,
        is_approved=0
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(CommunityReview).filter(CommunityReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
