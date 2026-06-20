from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import datetime
from bson import ObjectId
from typing import Optional

from db import users_collection, companies_collection
from auth_utils import verify_password, create_access_token, create_refresh_token, decode_token
from models.user import LoginRequest, LoginResponse, RefreshRequest

INACTIVE_COMPANY_MESSAGE = (
    "Your company account is currently inactive. "
    "Please contact your administrator."
)

router = APIRouter()


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ")[1]
    payload = decode_token(token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def require_role(*allowed_roles: str):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await users_collection.find_one({"username": request.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    company = None
    if user.get("company_id"):
        company = await companies_collection.find_one({"_id": user["company_id"]})

    if user.get("role") in ("user", "supervisor") and user.get("company_id"):
        if not company or not company.get("is_active", False):
            raise HTTPException(status_code=403, detail=INACTIVE_COMPANY_MESSAGE)

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login_at": datetime.utcnow()}}
    )

    user_id_str = str(user["_id"])
    access_token = create_access_token(user_id_str)
    refresh_token = create_refresh_token(user_id_str)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        role=user["role"],
        company_id=str(user["company_id"]) if user.get("company_id") else None,
        company_name=company.get("name") if company else None,
    )


@router.post("/refresh")
async def refresh(request: RefreshRequest):
    payload = decode_token(request.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
