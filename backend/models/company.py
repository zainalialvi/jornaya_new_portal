from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    contact_email: Optional[str] = None
    address: Optional[str] = None
    company_secret: Optional[str] = None


class CompanyResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    contact_email: Optional[str] = None
    address: Optional[str] = None
    company_secret: Optional[str] = None
    is_active: bool = False
    created_at: str
    created_by: str

    class Config:
        populate_by_name = True


class CompanyActiveUpdate(BaseModel):
    is_active: bool
