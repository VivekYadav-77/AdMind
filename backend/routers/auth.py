from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import time
from datetime import datetime, timedelta
import hashlib

from db.database import get_db, SessionLocal
from db.models import User, Workspace, WorkspaceMember, EmailToken, EmailLog
from models.schemas import UserCreate, Token, ResendVerificationRequest, VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest
from models.requests import ChangePasswordRequest
from services.email_service import send_email_via_gas, generate_token
from services.email_templates import verification_email, password_reset_email
from middleware.rate_limit import check_rate_limit
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.dependencies import get_current_user

router = APIRouter()

VERIFY_COOLDOWN_MINUTES = 5
VERIFY_COOLDOWN_SECONDS = VERIFY_COOLDOWN_MINUTES * 60
_verify_cooldown_store: dict[str, float] = {}

RESET_COOLDOWN_MINUTES = 10
RESET_COOLDOWN_SECONDS = RESET_COOLDOWN_MINUTES * 60
_reset_cooldown_store: dict[str, float] = {}

@router.post("/register")
async def register_user(user: UserCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    normalized_email = user.email.strip().lower()
    
    await check_rate_limit(f"ratelimit:register:{ip}", 5, 3600)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)
    await check_rate_limit(f"ratelimit:register_email:{normalized_email}", 3, 3600)

    GENERIC_RESPONSE = {"message": "If this email can be used for an account, check your inbox for further instructions."}

    async def _send_verification_email(email, name, plain_token, uid, client_ip):
        html = verification_email(name, plain_token)
        try:
            res = await send_email_via_gas(email, "Verify your AdMind account", html)
            status_str = "sent" if res.get("status") == "ok" else "failed"
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status=status_str, ip_address=client_ip, gas_response=str(res))
        except Exception as e:
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status="failed", ip_address=client_ip, gas_response=str(e))
        db_session = SessionLocal()
        db_session.add(log)
        db_session.commit()
        db_session.close()

    try:
        existing = db.query(User).filter(User.email == normalized_email).first()

        if existing is None:
            hashed_password = get_password_hash(user.password)
            new_user = User(email=normalized_email, name=user.name, hashed_password=hashed_password, is_verified=False)
            db.add(new_user)
            db.flush()
            
            ws = Workspace(name="My Workspace", owner_id=new_user.id)
            db.add(ws)
            db.flush()
            ws_member = WorkspaceMember(workspace_id=ws.id, user_id=new_user.id, role="admin")
            db.add(ws_member)
            
            plain, hashed = generate_token()
            db.add(EmailToken(user_id=new_user.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24)))
            db.commit()
            background_tasks.add_task(_send_verification_email, normalized_email, new_user.name, plain, new_user.id, ip)
            
        elif not existing.is_verified:
            if existing.email_blocked:
                return GENERIC_RESPONSE
            existing.hashed_password = get_password_hash(user.password)
            if user.name:
                existing.name = user.name
                
            now = time.time()
            last_sent = _verify_cooldown_store.get(normalized_email)
            if last_sent is None or (now - last_sent) >= VERIFY_COOLDOWN_SECONDS:
                _verify_cooldown_store[normalized_email] = now
                
                db.query(EmailToken).filter(
                    EmailToken.user_id == existing.id,
                    EmailToken.token_type == "verify",
                    EmailToken.used_at == None
                ).update({"used_at": datetime.utcnow()})
                
                plain, hashed = generate_token()
                db.add(EmailToken(user_id=existing.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24)))
                background_tasks.add_task(_send_verification_email, normalized_email, existing.name, plain, existing.id, ip)
                
            db.commit()
            
        else:
            pass
            
    except IntegrityError:
        db.rollback()
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing and not existing.is_verified:
            existing.hashed_password = get_password_hash(user.password)
            now = time.time()
            last_sent = _verify_cooldown_store.get(normalized_email)
            if last_sent is None or (now - last_sent) >= VERIFY_COOLDOWN_SECONDS:
                _verify_cooldown_store[normalized_email] = now
                
                db.query(EmailToken).filter(
                    EmailToken.user_id == existing.id,
                    EmailToken.token_type == "verify",
                    EmailToken.used_at == None
                ).update({"used_at": datetime.utcnow()})
                
                plain, hashed = generate_token()
                db.add(EmailToken(user_id=existing.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24)))
                background_tasks.add_task(_send_verification_email, normalized_email, existing.name, plain, existing.id, ip)
                
            db.commit()

    return GENERIC_RESPONSE

@router.post("/login", response_model=Token)
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    normalized_email = form_data.username.strip().lower()
    
    await check_rate_limit(f"ratelimit:login:{ip}", 10, 900)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)

    user = db.query(User).filter(User.email == normalized_email).first()
    password_ok = user is not None and verify_password(form_data.password, user.hashed_password)
    
    if not password_ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    
    if user.login_blocked:
        raise HTTPException(status_code=403, detail="Login has been restricted for this account.")
    
    if user.is_banned:
        raise HTTPException(status_code=403, detail="Your account has been banned.")
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer", "X-Verification-Required": "true"}
        )
    
    access_token = create_access_token(data={"sub": user.email, "name": user.name}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/resend-verification")
async def resend_verification(req: ResendVerificationRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    normalized_email = req.email.strip().lower()
    
    await check_rate_limit(f"ratelimit:resend_verify:{ip}", 3, 3600)
    await check_rate_limit(f"ratelimit:resend_verify_email:{normalized_email}", 3, 3600)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)

    GENERIC_RESPONSE = {"message": "If your email is unregistered or already verified, no email will be sent. Otherwise, check your inbox."}

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or user.is_verified or user.email_blocked:
        return GENERIC_RESPONSE
        
    now = time.time()
    last_sent = _verify_cooldown_store.get(normalized_email)
    if last_sent is not None and (now - last_sent) < VERIFY_COOLDOWN_SECONDS:
        return GENERIC_RESPONSE
        
    _verify_cooldown_store[normalized_email] = now
        
    db.query(EmailToken).filter(
        EmailToken.user_id == user.id,
        EmailToken.token_type == "verify",
        EmailToken.used_at == None
    ).update({"used_at": datetime.utcnow()})
        
    plain, hashed = generate_token()
    token_record = EmailToken(user_id=user.id, token_hash=hashed, token_type="verify", expires_at=datetime.utcnow() + timedelta(hours=24))
    db.add(token_record)
    db.commit()

    async def send_verification(email, name, plain_token, uid):
        html = verification_email(name, plain_token)
        try:
            res = await send_email_via_gas(email, "Verify your AdMind account", html)
            status_str = "sent" if res.get("status") == "ok" else "failed"
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status=status_str, ip_address=ip, gas_response=str(res))
        except Exception as e:
            log = EmailLog(user_id=uid, email_to=email, email_type="verification", status="failed", ip_address=ip, gas_response=str(e))
        db_session = SessionLocal()
        db_session.add(log)
        db_session.commit()
        db_session.close()

    background_tasks.add_task(send_verification, user.email, user.name, plain, user.id)
    return GENERIC_RESPONSE

@router.post("/auth/verify-email")
async def verify_email(body: VerifyEmailRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"ratelimit:verify_token:{ip}", 20, 3600)
    
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    record = db.query(EmailToken).filter(EmailToken.token_hash == token_hash, EmailToken.token_type == "verify").first()
    
    invalid_error = HTTPException(status_code=400, detail="This verification link is invalid or has already been used.")
    
    if not record:
        raise invalid_error
    if record.used_at:
        raise invalid_error
    if record.expires_at.replace(tzinfo=None) < datetime.utcnow():
        raise invalid_error
        
    record.used_at = datetime.utcnow()
    user = db.query(User).filter(User.id == record.user_id).first()
    if user:
        user.is_verified = True
        
    db.query(EmailToken).filter(
        EmailToken.user_id == record.user_id,
        EmailToken.token_type == "verify",
        EmailToken.used_at == None
    ).update({"used_at": datetime.utcnow()})
    
    db.commit()
    return {"message": "Email verified successfully"}

@router.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"ratelimit:forgot:{ip}", 3, 3600)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)

    email_key = req.email.strip().lower()
    now = time.time()

    last_sent = _reset_cooldown_store.get(email_key)
    if last_sent is not None:
        elapsed = now - last_sent
        if elapsed < RESET_COOLDOWN_SECONDS:
            remaining = int(RESET_COOLDOWN_SECONDS - elapsed)
            return {"cooldown_seconds_remaining": remaining}

    _reset_cooldown_store[email_key] = now

    user = db.query(User).filter(User.email == req.email).first()
    if user and user.is_verified and not user.email_blocked:
        plain, hashed = generate_token()
        token_record = EmailToken(user_id=user.id, token_hash=hashed, token_type="reset", expires_at=datetime.utcnow() + timedelta(minutes=15))
        db.add(token_record)
        db.commit()

        async def send_reset(email, name, plain_token, uid):
            html = password_reset_email(name, plain_token)
            try:
                res = await send_email_via_gas(email, "Password Reset Request", html)
                status_str = "sent" if res.get("status") == "ok" else "failed"
                log = EmailLog(user_id=uid, email_to=email, email_type="password_reset", status=status_str, ip_address=ip, gas_response=str(res))
            except Exception as e:
                log = EmailLog(user_id=uid, email_to=email, email_type="password_reset", status="failed", ip_address=ip, gas_response=str(e))
            db_session = SessionLocal()
            db_session.add(log)
            db_session.commit()
            db_session.close()

        background_tasks.add_task(send_reset, user.email, user.name, plain, user.id)

    return {"cooldown_seconds_remaining": RESET_COOLDOWN_SECONDS}

@router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"ratelimit:reset_password:{ip}", 5, 900)
    await check_rate_limit(f"ratelimit:auth_global:{ip}", 20, 60)
    
    token_hash = hashlib.sha256(req.token.encode()).hexdigest()
    record = db.query(EmailToken).filter(EmailToken.token_hash == token_hash, EmailToken.token_type == "reset").first()
    
    if not record:
        raise HTTPException(status_code=400, detail="Invalid token")
    if record.used_at:
        raise HTTPException(status_code=400, detail="Token already used")
    if record.expires_at.replace(tzinfo=None) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
        
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        
    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = get_password_hash(req.new_password)
    record.used_at = datetime.utcnow()
    
    db.query(EmailToken).filter(
        EmailToken.user_id == user.id, 
        EmailToken.token_type == "reset", 
        EmailToken.used_at == None
    ).update({"used_at": datetime.utcnow()})
    
    db.commit()
    return {"message": "Password reset successfully"}

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
