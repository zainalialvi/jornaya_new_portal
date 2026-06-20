from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import List

from db import companies_collection, audits_collection
from routers.auth import require_role
from models.company import CompanyCreate, CompanyResponse, CompanyActiveUpdate
from utils import serialize_doc

router = APIRouter()


@router.post("", response_model=CompanyResponse, status_code=201)
async def create_company(
    company: CompanyCreate,
    current_user: dict = Depends(require_role("admin"))
):
    company_doc = {
        "name": company.name,
        "contact_email": company.contact_email,
        "address": company.address,
        "company_secret": company.company_secret,
        "is_active": False,
        "created_at": datetime.utcnow(),
        "created_by": current_user["_id"]
    }

    result = await companies_collection.insert_one(company_doc)
    company_doc["_id"] = result.inserted_id

    await audits_collection.insert_one({
        "actor_user_id": current_user["_id"],
        "action_type": "create_company",
        "target_collection": "companies",
        "target_id": result.inserted_id,
        "timestamp": datetime.utcnow(),
        "details": {"name": company.name, "is_active": False}
    })

    return serialize_doc(company_doc)


@router.get("", response_model=List[CompanyResponse])
async def list_companies(current_user: dict = Depends(require_role("admin"))):
    companies = await companies_collection.find({}).to_list(None)
    return [serialize_doc({**c, "is_active": bool(c.get("is_active", False))}) for c in companies]


@router.patch("/{company_id}/active", response_model=CompanyResponse)
async def set_company_active(
    company_id: str,
    payload: CompanyActiveUpdate,
    current_user: dict = Depends(require_role("admin")),
):
    try:
        oid = ObjectId(company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company id")

    company = await companies_collection.find_one({"_id": oid})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    previous = bool(company.get("is_active", False))
    new_value = bool(payload.is_active)

    await companies_collection.update_one(
        {"_id": oid},
        {"$set": {"is_active": new_value}},
    )

    await audits_collection.insert_one({
        "actor_user_id": current_user["_id"],
        "action_type": "toggle_company_active",
        "target_collection": "companies",
        "target_id": oid,
        "timestamp": datetime.utcnow(),
        "details": {
            "name": company.get("name"),
            "previous": previous,
            "new": new_value,
        },
    })

    company["is_active"] = new_value
    return serialize_doc(company)


async def migrate_missing_is_active() -> int:
    result = await companies_collection.update_many(
        {"is_active": {"$exists": False}},
        {"$set": {"is_active": False}},
    )
    return result.modified_count
