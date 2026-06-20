import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi

load_dotenv(Path(__file__).resolve().parent.parent / '.env')

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("MONGO_DB_NAME", "form_dashboard")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI environment variable is not set")

# TLS is auto-enabled for connections that look like Atlas / explicitly request
# it; local mongo (the dockerized service) runs plaintext and must not pass
# tls=True or pymongo will raise. Override with MONGO_TLS=true|false to force.
_tls_env = os.getenv("MONGO_TLS")
if _tls_env is not None:
    _use_tls = _tls_env.lower() in ("1", "true", "yes")
else:
    _use_tls = (
        MONGO_URI.startswith("mongodb+srv://")
        or "tls=true" in MONGO_URI.lower()
        or "ssl=true" in MONGO_URI.lower()
    )

# Notes on the options below:
# - tlsCAFile=certifi.where() fixes `TLSV1_ALERT_INTERNAL_ERROR` on Windows /
#   conda where the bundled OpenSSL CA store is stale and can't validate
#   Atlas's SNI certs.
# - Explicit timeouts prevent a transient blip from hanging a request for the
#   default 30s server-selection timeout.
# - retryWrites/retryReads let the driver transparently recover from a single
#   dropped socket, which is what causes most of the "failed to load" errors.
# - A pool with min/max keeps a few warm connections so we don't re-handshake
#   TLS on every request.
_CLIENT_KWARGS = dict(
    server_api=ServerApi("1"),
    # Tight timeouts let SDAM mark an unreachable shard as Unknown within
    # seconds rather than 20s, so subsequent requests route to healthy nodes.
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=20000,
    waitQueueTimeoutMS=5000,
    maxPoolSize=50,
    maxIdleTimeMS=60000,
    heartbeatFrequencyMS=10000,
    retryWrites=True,
    retryReads=True,
    appname="jornaya_portal",
)

if _use_tls:
    _CLIENT_KWARGS["tls"] = True
    _CLIENT_KWARGS["tlsCAFile"] = certifi.where()

client = AsyncIOMotorClient(MONGO_URI, **_CLIENT_KWARGS)
db = client[DATABASE_NAME]

companies_collection = db["companies"]
forms_collection = db["forms"]
users_collection = db["users"]
submissions_collection = db["submissions"]
audits_collection = db["audits"]


async def ping() -> None:
    await client.admin.command("ping")
