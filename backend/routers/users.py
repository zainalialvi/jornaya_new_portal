from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import List

from db import users_collection, audits_collection
from routers.auth import require_role
from models.user import UserCreate, UserResponse
from auth_utils import hash_password
from utils import serialize_doc

router = APIRouter()


@router.post("/companies/{company_id}/users", response_model=UserResponse, status_code=201)
async def create_user(
    company_id: str,
    user: UserCreate,
    current_user: dict = Depends(require_role("admin"))
):
    if user.role not in ["supervisor", "user"]:
        raise HTTPException(status_code=400, detail="Role must be 'supervisor' or 'user'")

    existing = await users_collection.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    user_doc = {
        "username": user.username,
        "password_hash": hash_password(user.password),
        "role": user.role,
        "company_id": ObjectId(company_id),
        "created_at": datetime.utcnow()
    }

    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    await audits_collection.insert_one({
        "actor_user_id": current_user["_id"],
        "action_type": "create_user",
        "target_collection": "users",
        "target_id": result.inserted_id,
        "timestamp": datetime.utcnow(),
        "details": {"username": user.username, "role": user.role, "company_id": company_id}
    })

    user_doc.pop("password_hash", None)
    return serialize_doc(user_doc)


@router.get("/companies/{company_id}/users", response_model=List[UserResponse])
async def list_company_users(
    company_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    users = await users_collection.find({"company_id": ObjectId(company_id)}).to_list(None)

    for user in users:
        user.pop("password_hash", None)

    return [serialize_doc(user) for user in users]


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    await audits_collection.insert_one({
        "actor_user_id": current_user["_id"],
        "action_type": "delete_user",
        "target_collection": "users",
        "target_id": ObjectId(user_id),
        "timestamp": datetime.utcnow(),
        "details": {"user_id": user_id}
    })

    return None
