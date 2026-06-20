from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from typing import Optional

from db import submissions_collection, companies_collection
from models.submission import BotPollRequest, BotPollItem, BotResultRequest

router = APIRouter()


@router.post("/poll", response_model=Optional[BotPollItem])
async def bot_poll(request: BotPollRequest):
    """Hand out exactly one pending submission for processing.

    Each call atomically claims the single oldest `pending` submission for the
    company, flips it to `processing`, and returns it. Submissions that are
    already `processing`, `submitted`, or `failed` are never returned — only
    `pending` work is dispatched. Returns null when there is nothing pending or
    the company is inactive.
    """
    company_id = ObjectId(request.company_id)

    company = await companies_collection.find_one({"_id": company_id})
    if not company or not company.get("is_active", False):
        return None

    submission = await submissions_collection.find_one_and_update(
        {"company_id": company_id, "form_status": "pending"},
        {
            "$set": {
                "form_status": "processing",
                "processing_started_at": datetime.utcnow(),
            },
            "$inc": {"submission_attempts": 1},
        },
        sort=[("created_at", 1)],
        return_document=True,
    )

    if not submission:
        return None

    return {
        "submission_id": str(submission["_id"]),
        "form_id": str(submission["form_id"]),
        "data": submission["data"],
        "submission_attempts": submission["submission_attempts"],
    }


@router.post("/result")
async def bot_result(request: BotResultRequest):
    """Finalize a submission the bot was processing.

    success -> form_status = "submitted"; anything else -> "failed".
    The submission must currently be in the `processing` state.
    """
    submission = await submissions_collection.find_one({
        "_id": ObjectId(request.submission_id),
        "form_status": "processing"
    })

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found or not in processing state")

    new_status = "submitted" if request.result == "success" else "failed"

    await submissions_collection.update_one(
        {"_id": ObjectId(request.submission_id)},
        {
            "$set": {
                "form_status": new_status,
                "completed_at": datetime.utcnow(),
                "jornaya_id": request.jornaya_id,
                "ip_address": request.ip_address,
                "bot_response": request.details or {}
            }
        }
    )

    return {
        "ok": True,
        "submission_id": request.submission_id,
        "status": new_status
    }
