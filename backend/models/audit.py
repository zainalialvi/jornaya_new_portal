from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class AuditResponse(BaseModel):
    id: str = Field(alias="_id")
    actor_user_id: Optional[str] = None
    action_type: str
    target_collection: str
    target_id: str
    timestamp: str
    details: Dict[str, Any]

    class Config:
        populate_by_name = True
