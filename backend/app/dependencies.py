from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from db.database import get_db
from db.models import User
from auth import decode_token, oauth2_scheme

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    if user.is_banned:
        raise HTTPException(status_code=403, detail="Your account has been banned.")
        
    user.last_seen_at = datetime.utcnow()
    db.commit()
    
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Superadmin access required")
    return current_user
