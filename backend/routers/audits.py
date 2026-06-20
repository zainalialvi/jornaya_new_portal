from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import Optional

from db import audits_collection
from routers.auth import require_role
from utils import serialize_doc

router = APIRouter()


@router.get("")
async def list_audits(
    action_type: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_role("admin"))
):
    query = {}

    if action_type:
        query["action_type"] = action_type

    if from_date:
        query.setdefault("timestamp", {})["$gte"] = datetime.fromisoformat(from_date.replace("Z", "+00:00"))

    if to_date:
        query.setdefault("timestamp", {})["$lte"] = datetime.fromisoformat(to_date.replace("Z", "+00:00"))

    total = await audits_collection.count_documents(query)
    skip = (page - 1) * per_page

    audits = await audits_collection.find(query).sort("timestamp", -1).skip(skip).limit(per_page).to_list(None)

    return {
        "items": [serialize_doc(audit) for audit in audits],
        "total": total,
        "page": page,
        "per_page": per_page
    }
