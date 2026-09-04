from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from db.database import get_db
from db.models import User, CommunityReview
from app.dependencies import require_admin

router = APIRouter()

@router.get("/reviews", response_model=dict)
def get_admin_reviews(page: int = 1, size: int = 20, status: str = "pending", db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    query = db.query(CommunityReview)
    if status == "pending":
        query = query.filter(CommunityReview.is_approved == 0)
    elif status == "approved":
        query = query.filter(CommunityReview.is_approved == 1)
        
    total = query.count()
    from sqlalchemy.orm import joinedload
    reviews = query.options(joinedload(CommunityReview.user)).order_by(desc(CommunityReview.created_at)).offset((page - 1) * size).limit(size).all()
    
    items = []
    for r in reviews:
        items.append({
            "id": r.id,
            "user_email": r.user.email if r.user else "Unknown",
            "author_name": r.author_name,
            "rating": r.rating,
            "content": r.content,
            "is_approved": r.is_approved,
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}

@router.post("/reviews/{review_id}/approve")
def approve_review(review_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    review = db.query(CommunityReview).filter(CommunityReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = 1
    db.commit()
    return {"message": "Review approved"}

@router.delete("/reviews/{review_id}/reject")
def reject_review(review_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    review = db.query(CommunityReview).filter(CommunityReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
