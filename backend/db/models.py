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

    analysis_jobs = relationship("AnalysisJob", back_populates="user")
    workspaces = relationship("WorkspaceMember", back_populates="user")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")
    members = relationship("WorkspaceMember", back_populates="workspace")
    analysis_jobs = relationship("AnalysisJob", back_populates="workspace")


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    workspace_id = Column(Integer, ForeignKey("workspaces.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    role = Column(String, default="member")  # e.g. "admin", "member"
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspaces")


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True) # nullable for backward compatibility
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="analysis_jobs")
    workspace = relationship("Workspace", back_populates="analysis_jobs")
    
    # Input stats
    total_rows = Column(Integer, default=0)
    input_spend = Column(Float, default=0.0)
    input_revenue = Column(Float, default=0.0)

    # We store the full JSON results here for easy retrieval
    audit_data = Column(JSON, nullable=True)
    strategy_data = Column(JSON, nullable=True)
    copy_data = Column(JSON, nullable=True)
    
    status = Column(String, default="processing")
    progress_logs = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    
    chat_messages = relationship("ChatMessage", back_populates="job")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("analysis_jobs.id"), nullable=False)
    role = Column(String, nullable=False) # "user" or "assistant"
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("AnalysisJob", back_populates="chat_messages")


class RecommendationComment(Base):
    __tablename__ = "recommendation_comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("analysis_jobs.id"), nullable=False)
    target_keyword = Column(String, nullable=False)
    comment_text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ABTestCampaign(Base):
    __tablename__ = "ab_test_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    test_name = Column(String, nullable=False)
    variant_a_copy = Column(String, nullable=False)
    variant_b_copy = Column(String, nullable=False)
    status = Column(String, default="running")
    winner = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
