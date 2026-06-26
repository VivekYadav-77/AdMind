from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Establish relationship to AnalysisJob
    analysis_jobs = relationship("AnalysisJob", back_populates="user")


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Establish relationship to User
    user = relationship("User", back_populates="analysis_jobs")
    
    # Input stats
    total_rows = Column(Integer, default=0)
    input_spend = Column(Float, default=0.0)
    input_revenue = Column(Float, default=0.0)

    # We store the full JSON results here for easy retrieval
    audit_data = Column(JSON, nullable=True)
    strategy_data = Column(JSON, nullable=True)
    copy_data = Column(JSON, nullable=True)
    
    status = Column(String, default="processing")
