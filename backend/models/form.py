from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict


class FieldValidation(BaseModel):
    minLength: Optional[int] = None
    maxLength: Optional[int] = None
    regex: Optional[str] = None
    min: Optional[float] = None
    max: Optional[float] = None


class FormField(BaseModel):
    id: str
    name: str
    type: str
    required: bool = False
    validations: Optional[FieldValidation] = None
    options: Optional[List[str]] = None
    default: Optional[Any] = None


class FormCreate(BaseModel):
    schema: List[FormField]


class FormResponse(BaseModel):
    id: str = Field(alias="_id")
    company_id: str
    schema: List[FormField]
    created_at: str
    created_by: str
    deleted_at: Optional[str] = None

    class Config:
        populate_by_name = True
