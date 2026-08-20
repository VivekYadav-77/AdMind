from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_superadmin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    login_blocked = Column(Boolean, default=False)
    email_blocked = Column(Boolean, default=False)
    last_seen_at = Column(DateTime, nullable=True)
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


class CommunityReview(Base):
    __tablename__ = "community_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    content = Column(String, nullable=False)
    is_approved = Column(Integer, default=0) # 0 for False, 1 for True for sqlite compat or just Boolean if supported. The schema says boolean, but sqlite uses 0/1. Let's use Boolean or just Integer.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null for guests
    guest_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    category = Column(String, nullable=False) # e.g., "Bug", "Feature", "Billing", "Other"
    subject = Column(String, nullable=False)
    status = Column(String, default="open") # open, in_progress, resolved, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    sender_type = Column(String, nullable=False) # "user", "admin", "guest"
    message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("SupportTicket", back_populates="messages")


class EmailToken(Base):
    __tablename__ = "email_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    token_type = Column(String, nullable=False) # "verify" or "reset"
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email_to = Column(String, nullable=False)
    email_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    gas_response = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class UserFeatureControl(Base):
    __tablename__ = "user_feature_controls"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feature = Column(String, nullable=False)   # e.g. "analyze", "tools", "chat", etc.
    is_blocked = Column(Boolean, default=False)
    reason = Column(String, nullable=True)     # optional admin note
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # admin who changed it

    user = relationship("User", foreign_keys=[user_id])
    updater = relationship("User", foreign_keys=[updated_by])
