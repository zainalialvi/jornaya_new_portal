from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from db import forms_collection, audits_collection
from routers.auth import require_role, get_current_user
from models.form import FormCreate, FormResponse
from utils import serialize_doc

router = APIRouter()


@router.post("/companies/{company_id}/form", response_model=FormResponse, status_code=201)
async def create_form(
    company_id: str,
    form: FormCreate,
    current_user: dict = Depends(require_role("admin"))
):
    active_form = await forms_collection.find_one({
        "company_id": ObjectId(company_id),
        "deleted_at": {"$exists": False}
    })

    if active_form:
        raise HTTPException(status_code=409, detail="Active form already exists for this company")

    form_doc = {
        "company_id": ObjectId(company_id),
        "schema": [field.model_dump() for field in form.schema],
        "created_at": datetime.utcnow(),
        "created_by": current_user["_id"]
    }

    result = await forms_collection.insert_one(form_doc)
    form_doc["_id"] = result.inserted_id

    await audits_collection.insert_one({
        "actor_user_id": current_user["_id"],
        "action_type": "create_form",
        "target_collection": "forms",
        "target_id": result.inserted_id,
        "timestamp": datetime.utcnow(),
        "details": {"company_id": company_id}
    })

    return serialize_doc(form_doc)


@router.get("/companies/{company_id}/form", response_model=FormResponse)
async def get_company_form(
    company_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["admin", "user", "supervisor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    form = await forms_collection.find_one({
        "company_id": ObjectId(company_id),
        "deleted_at": {"$exists": False}
    })

    if not form:
        raise HTTPException(status_code=404, detail="No active form found for this company")

    return serialize_doc(form)


@router.delete("/companies/{company_id}/form/{form_id}", status_code=204)
async def delete_form(
    company_id: str,
    form_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    result = await forms_collection.update_one(
        {"_id": ObjectId(form_id), "company_id": ObjectId(company_id)},
        {"$set": {"deleted_at": datetime.utcnow()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Form not found")

    await audits_collection.insert_one({
        "actor_user_id": current_user["_id"],
        "action_type": "delete_form",
        "target_collection": "forms",
        "target_id": ObjectId(form_id),
        "timestamp": datetime.utcnow(),
        "details": {"company_id": company_id, "form_id": form_id}
    })

    return None
