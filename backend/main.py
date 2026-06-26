import json
import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist
from db.database import Base, engine, get_db
from db.models import AnalysisJob, User
from models.schemas import PipelineResult, UserCreate, Token
from services.csv_parser import parse_csv
from services.gemini import GeminiError
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    oauth2_scheme,
    ACCESS_TOKEN_EXPIRE_MINUTES
)


load_dotenv()

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AdMind API", version="1.0.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
SAMPLE_CSV_PATH = BASE_DIR / "sample_data.csv"


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
    return user


def _sse_event(event: str, data):
    return f"data: {json.dumps({'event': event, 'data': data})}\n\n"


async def _read_csv_upload(file: UploadFile) -> str:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    content = await file.read()
    try:
        return content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8 encoded") from exc


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/sample-csv")
async def get_sample_csv():
    if not SAMPLE_CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="Sample CSV not found")

    return PlainTextResponse(
        SAMPLE_CSV_PATH.read_text(encoding="utf-8"),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="sample_ads.csv"'},
    )


@app.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    jobs = db.query(AnalysisJob).filter(AnalysisJob.user_id == current_user.id).order_by(AnalysisJob.created_at.desc()).all()
    return jobs


@app.get("/history/{job_id}")
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id,
        AnalysisJob.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return job


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    csv_text = await _read_csv_upload(file)

    async def event_stream():
        try:
            yield _sse_event("start", {"message": "Pipeline started", "total_steps": 3})

            rows, stats = parse_csv(csv_text)
            
            # Create job in database for this user
            job = AnalysisJob(
                user_id=current_user.id,
                total_rows=stats["total_rows"],
                input_spend=stats["total_spend"],
                input_revenue=stats["total_revenue"],
                status="processing"
            )
            db.add(job)
            db.commit()
            db.refresh(job)

            yield _sse_event(
                "csv_parsed",
                {
                    "job_id": job.id,
                    "rows": stats["total_rows"],
                    "total_spend": stats["total_spend"],
                    "total_revenue": stats["total_revenue"],
                },
            )

            yield _sse_event(
                "agent_start",
                {"agent": "auditor", "message": "Analyzing campaign performance..."},
            )
            audit = await run_auditor(rows)
            
            job.audit_data = audit.model_dump()
            db.commit()

            yield _sse_event(
                "agent_done",
                {"agent": "auditor", "result": audit.model_dump()},
            )

            yield _sse_event(
                "agent_start",
                {"agent": "strategist", "message": "Generating strategy recommendations..."},
            )
            strategy = await run_strategist(rows, audit)
            
            job.strategy_data = strategy.model_dump()
            db.commit()

            yield _sse_event(
                "agent_done",
                {"agent": "strategist", "result": strategy.model_dump()},
            )

            yield _sse_event(
                "agent_start",
                {"agent": "copywriter", "message": "Rewriting underperforming ad copy..."},
            )
            copy = await run_copywriter(rows, audit)
            
            job.copy_data = copy.model_dump()
            job.status = "complete"
            db.commit()

            yield _sse_event(
                "agent_done",
                {"agent": "copywriter", "result": copy.model_dump()},
            )

            final = PipelineResult(audit=audit, strategy=strategy, copy_results=copy)
            yield _sse_event("complete", final.model_dump())
        except Exception as exc:
            yield _sse_event("error", {"message": str(exc)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/analyze-sync")
async def analyze_sync(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        csv_text = await _read_csv_upload(file)
        rows, stats = parse_csv(csv_text)

        # Create job
        job = AnalysisJob(
            user_id=current_user.id,
            total_rows=stats["total_rows"],
            input_spend=stats["total_spend"],
            input_revenue=stats["total_revenue"],
            status="processing"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        audit = await run_auditor(rows)
        job.audit_data = audit.model_dump()
        db.commit()

        strategy = await run_strategist(rows, audit)
        job.strategy_data = strategy.model_dump()
        db.commit()

        copy = await run_copywriter(rows, audit)
        job.copy_data = copy.model_dump()
        job.status = "complete"
        db.commit()

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except GeminiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return PipelineResult(audit=audit, strategy=strategy, copy_results=copy)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
