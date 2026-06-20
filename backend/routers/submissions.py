from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from datetime import datetime
from bson import ObjectId
from typing import Optional, List
import re
import csv
import io

from db import submissions_collection, forms_collection, users_collection
from routers.auth import require_role, get_current_user
from models.submission import SubmissionCreate, SubmissionResponse
from utils import serialize_doc

router = APIRouter()


def validate_field(field, value):
    errors = []

    if field["required"] and (value is None or value == ""):
        errors.append(f"{field['name']} is required")
        return errors

    if value is None or value == "":
        return errors

    field_type = field["type"]
    validations = field.get("validations", {}) or {}

    if field_type == "number":
        try:
            num_val = float(value)
            if validations.get("min") is not None and num_val < validations["min"]:
                errors.append(f"{field['name']} must be at least {validations['min']}")
            if validations.get("max") is not None and num_val > validations["max"]:
                errors.append(f"{field['name']} must be at most {validations['max']}")
        except (ValueError, TypeError):
            errors.append(f"{field['name']} must be a number")

    if field_type in ["text", "textarea", "email", "phone"]:
        str_val = str(value)
        if validations.get("minLength") and len(str_val) < validations["minLength"]:
            errors.append(f"{field['name']} must be at least {validations['minLength']} characters")
        if validations.get("maxLength") and len(str_val) > validations["maxLength"]:
            errors.append(f"{field['name']} must be at most {validations['maxLength']} characters")
        if validations.get("regex"):
            if not re.match(validations["regex"], str_val):
                errors.append(f"{field['name']} format is invalid")

    if field_type == "email":
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, str(value)):
            errors.append(f"{field['name']} must be a valid email")

    return errors


@router.post("", status_code=201)
async def create_submission(
    submission: SubmissionCreate,
    request: Request,
    current_user: dict = Depends(require_role("user"))
):
    if str(current_user.get("company_id")) != submission.company_id:
        raise HTTPException(status_code=403, detail="Can only submit for your own company")

    form = await forms_collection.find_one({
        "_id": ObjectId(submission.form_id),
        "company_id": ObjectId(submission.company_id),
        "deleted_at": {"$exists": False}
    })

    if not form:
        raise HTTPException(status_code=404, detail="Active form not found")

    all_errors = []
    for field in form["schema"]:
        field_id = field["id"]
        value = submission.data.get(field_id)
        errors = validate_field(field, value)
        all_errors.extend(errors)

    if all_errors:
        raise HTTPException(status_code=400, detail={"errors": all_errors})

    submission_doc = {
        "form_id": ObjectId(submission.form_id),
        "company_id": ObjectId(submission.company_id),
        "user_id": current_user["_id"],
        "data": submission.data,
        "form_status": "pending",
        "created_at": datetime.utcnow(),
        "metadata": {
            "ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent")
        },
        "submission_attempts": 0
    }

    result = await submissions_collection.insert_one(submission_doc)

    return {"submission_id": str(result.inserted_id)}


@router.get("", response_model=dict)
async def list_submissions(
    company_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort: str = Query("created_at:-1"),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["supervisor", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    query = {}

    if current_user["role"] == "supervisor":
        query["company_id"] = current_user["company_id"]
    elif company_id:
        query["company_id"] = ObjectId(company_id)

    if status:
        query["form_status"] = status

    if user_id:
        query["user_id"] = ObjectId(user_id)

    if from_date:
        query.setdefault("created_at", {})["$gte"] = datetime.fromisoformat(from_date.replace("Z", "+00:00"))

    if to_date:
        query.setdefault("created_at", {})["$lte"] = datetime.fromisoformat(to_date.replace("Z", "+00:00"))

    sort_field, sort_dir = sort.split(":")
    sort_direction = -1 if sort_dir == "-1" else 1

    total = await submissions_collection.count_documents(query)
    skip = (page - 1) * per_page

    submissions = await submissions_collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(per_page).to_list(None)

    user_ids = list({sub["user_id"] for sub in submissions})
    users = await users_collection.find({"_id": {"$in": user_ids}}).to_list(None)
    user_map = {u["_id"]: u["username"] for u in users}

    for sub in submissions:
        sub["username"] = user_map.get(sub["user_id"], "Unknown")

    return {
        "items": [serialize_doc(sub) for sub in submissions],
        "total": total,
        "page": page,
        "per_page": per_page
    }


@router.get("/export", response_class=StreamingResponse)
async def export_submissions(
    company_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["supervisor", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    query = {}

    if current_user["role"] == "supervisor":
        query["company_id"] = current_user["company_id"]
    elif company_id:
        query["company_id"] = ObjectId(company_id)

    if status:
        query["form_status"] = status

    if from_date:
        query.setdefault("created_at", {})["$gte"] = datetime.fromisoformat(from_date.replace("Z", "+00:00"))

    if to_date:
        query.setdefault("created_at", {})["$lte"] = datetime.fromisoformat(to_date.replace("Z", "+00:00"))

    submissions = await submissions_collection.find(query).to_list(None)

    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found")

    first_submission = submissions[0]
    form = await forms_collection.find_one({"_id": first_submission["form_id"]})

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    field_names = [field["id"] for field in form["schema"]]
    headers = ["submission_id", "created_at", "status"] + field_names

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()

    for sub in submissions:
        row = {
            "submission_id": str(sub["_id"]),
            "created_at": sub["created_at"].isoformat(),
            "status": sub["form_status"]
        }
        for field_name in field_names:
            row[field_name] = sub["data"].get(field_name, "")
        writer.writerow(row)

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=submissions_export.csv"}
    )


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["supervisor", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    submission = await submissions_collection.find_one({"_id": ObjectId(submission_id)})

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if current_user["role"] == "supervisor" and submission["company_id"] != current_user["company_id"]:
        raise HTTPException(status_code=403, detail="Cannot access submissions from other companies")

    return serialize_doc(submission)
