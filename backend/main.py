import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from sqlalchemy.orm import Session

from agents.auditor import run_auditor
from agents.copywriter import run_copywriter
from agents.strategist import run_strategist
from db.database import Base, engine, get_db
from db.models import AnalysisJob
from models.schemas import PipelineResult
from services.csv_parser import parse_csv
from services.gemini import GeminiError


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
def get_history(db: Session = Depends(get_db)):
    jobs = db.query(AnalysisJob).order_by(AnalysisJob.created_at.desc()).all()
    return jobs


@app.post("/analyze")
async def analyze(file: UploadFile = File(...), db: Session = Depends(get_db)):
    csv_text = await _read_csv_upload(file)

    async def event_stream():
        try:
            yield _sse_event("start", {"message": "Pipeline started", "total_steps": 3})

            rows, stats = parse_csv(csv_text)
            
            # Create job in database
            job = AnalysisJob(
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
async def analyze_sync(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        csv_text = await _read_csv_upload(file)
        rows, stats = parse_csv(csv_text)

        # Create job
        job = AnalysisJob(
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
