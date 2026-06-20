import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError

from db import (
    client,
    ping,
    submissions_collection,
    users_collection,
    forms_collection,
    audits_collection,
)
from routers import auth, companies, forms, users, submissions, bot, audits
from routers.companies import migrate_missing_is_active

logger = logging.getLogger("uvicorn.error")


async def _ensure_indexes() -> None:
    await submissions_collection.create_index(
        [("company_id", 1), ("form_status", 1), ("created_at", -1)],
        name="submissions_company_status_created",
    )
    await users_collection.create_index(
        "username", unique=True, name="users_username_unique"
    )
    await forms_collection.create_index("company_id", name="forms_company_id")
    await audits_collection.create_index([("timestamp", -1)], name="audits_timestamp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await ping()
        logger.info("MongoDB connection verified.")
    except PyMongoError as exc:
        # Don't crash startup on a transient network blip — individual requests
        # will retry via the driver's built-in retry logic.
        logger.warning("Initial MongoDB ping failed: %s", exc)

    try:
        await _ensure_indexes()
    except PyMongoError as exc:
        logger.warning("Index creation skipped: %s", exc)

    try:
        migrated = await migrate_missing_is_active()
        if migrated:
            logger.info("Backfilled is_active=False on %d companies.", migrated)
    except PyMongoError as exc:
        logger.warning("is_active migration skipped: %s", exc)

    try:
        yield
    finally:
        client.close()


app = FastAPI(title="Form Submission Dashboard", lifespan=lifespan)

# Allowed browser origins. Comma-separated CORS_ORIGINS in prod (e.g.
# "http://138.199.193.196"); defaults to "*" for local dev. Credentials are off
# because auth uses Bearer tokens in headers, not cookies — so "*" stays valid.
_cors = os.getenv("CORS_ORIGINS", "*")
_origins = [o.strip() for o in _cors.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(forms.router, prefix="", tags=["forms"])
app.include_router(users.router, prefix="", tags=["users"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
app.include_router(bot.router, prefix="/bot", tags=["bot"])
app.include_router(audits.router, prefix="/audits", tags=["audits"])


@app.get("/")
async def root():
    return {"message": "Form Submission Dashboard API"}


@app.get("/healthz")
async def healthz():
    try:
        await ping()
        return {"status": "ok", "db": "up"}
    except PyMongoError as exc:
        return {"status": "degraded", "db": "down", "error": str(exc)}
