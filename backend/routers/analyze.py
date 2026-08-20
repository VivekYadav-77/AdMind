from fastapi import APIRouter, Depends, Request, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import asyncio

from db.database import get_db, SessionLocal
from db.models import User, AnalysisJob
from app.dependencies import get_current_user
from main import check_feature_blocked, _read_csv_upload, _get_workspace_id, run_analysis_task

router = APIRouter()

@router.post("/analyze")
async def analyze(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_feature_blocked(current_user, "analyze", db)
    csv_text = await _read_csv_upload(file)
    wid = _get_workspace_id(request, db, current_user)
    
    job = AnalysisJob(
        user_id=current_user.id,
        workspace_id=wid,
        status="processing",
        progress_logs=[]
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(run_analysis_task, job.id, csv_text)
    return {"job_id": job.id}


@router.get("/analyze/{job_id}/stream")
async def analyze_stream(
    job_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify access
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id, AnalysisJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_stream():
        last_idx = 0
        while True:
            db_stream = SessionLocal()
            try:
                current_job = db_stream.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
                if not current_job:
                    break
                logs = current_job.progress_logs or []
                
                for i in range(last_idx, len(logs)):
                    log = logs[i]
                    yield f"data: {json.dumps(log)}\n\n"
                
                last_idx = len(logs)
                
                if current_job.status in ["complete", "error"]:
                    break
            finally:
                db_stream.close()
                
            await asyncio.sleep(1)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
