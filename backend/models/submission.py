from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class SubmissionCreate(BaseModel):
    company_id: str
    form_id: str
    data: Dict[str, Any]


class SubmissionResponse(BaseModel):
    id: str = Field(alias="_id")
    form_id: str
    company_id: str
    user_id: str
    data: Dict[str, Any]
    form_status: str
    created_at: str
    processing_started_at: Optional[str] = None
    completed_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    submission_attempts: int
    jornaya_id: Optional[str] = None
    ip_address: Optional[str] = None
    bot_response: Optional[Dict[str, Any]] = None

    class Config:
        populate_by_name = True


class BotPollRequest(BaseModel):
    company_id: str
    limit: int = 10


class BotPollItem(BaseModel):
    submission_id: str
    form_id: str
    data: Dict[str, Any]
    submission_attempts: int


class BotResultRequest(BaseModel):
    submission_id: str
    result: str
    jornaya_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
