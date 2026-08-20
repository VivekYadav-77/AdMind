from pydantic import BaseModel
from typing import Optional

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class WorkspaceCreate(BaseModel):
    name: str

class ChatRequest(BaseModel):
    message: str

class CommentCreate(BaseModel):
    target_keyword: str
    comment_text: str

class ABTestCreate(BaseModel):
    test_name: str
    variant_a_copy: str
    variant_b_copy: str

class ABTestWinner(BaseModel):
    winner: str

class UrlRequest(BaseModel):
    url: str

class DescRequest(BaseModel):
    description: str

class AdRequest(BaseModel):
    ad_copy: str

class ReviewCreate(BaseModel):
    rating: int
    content: str

class FeatureControlUpdate(BaseModel):
    feature: str
    is_blocked: bool
    reason: Optional[str] = None
