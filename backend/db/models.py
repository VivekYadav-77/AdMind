from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String
from sqlalchemy.sql import func

from db.database import Base


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Input stats
    total_rows = Column(Integer, default=0)
    input_spend = Column(Float, default=0.0)
    input_revenue = Column(Float, default=0.0)

    # We store the full JSON results here for easy retrieval
    audit_data = Column(JSON, nullable=True)
    strategy_data = Column(JSON, nullable=True)
    copy_data = Column(JSON, nullable=True)
    
    status = Column(String, default="processing")
