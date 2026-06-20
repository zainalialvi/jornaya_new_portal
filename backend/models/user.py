from pydantic import BaseModel, Field
from typing import Optional


class UserCreate(BaseModel):
    username: str
    password: str
    role: str


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    role: str
    company_id: Optional[str] = None
    created_at: str
    last_login_at: Optional[str] = None

    class Config:
        populate_by_name = True


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    company_id: Optional[str] = None
    company_name: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str
