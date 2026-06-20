"""
post_data.py — report a submission's processing result back to the portal.

Calls the unauthenticated POST /bot/result to finalize a submission the bot was
processing:

    RESULT == "success"  ->  form_status = "submitted"
    RESULT == "failure"  ->  form_status = "failed"

The target submission must currently be in the "processing" state (i.e. it was
just handed out by get_data.py); otherwise the portal returns 404.

Just run it:  python post_data.py
Paste the submission id you got from get_data.py into SUBMISSION_ID below.
"""
import json
import urllib.error
import urllib.request

# ============================ CONFIG — edit these ============================
BASE_URL = "http://localhost:8989"            # local backend; use your hosted URL to hit the cloud
SUBMISSION_ID = "6a363f9fc435f111f55d0745"    # the submission_id printed by get_data.py
RESULT = "success"                            # "success" or "failure"
JORNAYA_ID = ""                               # the Jornaya LeadiD token for this lead
IP_ADDRESS = ""                               # the lead's IP address
DETAILS = {}                                  # optional extra info, e.g. {"ref": "abc123"}
# ============================================================================


def post_result(submission_id=SUBMISSION_ID, result=RESULT, jornaya_id=JORNAYA_ID,
                ip_address=IP_ADDRESS, details=DETAILS, base_url=BASE_URL, timeout=30):
    """Finalize a processing submission. Returns the portal's JSON response."""
    if result not in ("success", "failure"):
        raise ValueError("RESULT must be 'success' or 'failure'")

    url = f"{base_url.rstrip('/')}/bot/result"
    payload = json.dumps({
        "submission_id": submission_id,
        "result": result,
        "jornaya_id": jornaya_id,
        "ip_address": ip_address,
        "details": details or {},
    }).encode("utf-8")

    request = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Portal returned HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Could not reach portal at {url}: {exc.reason}") from exc

    return json.loads(body)


if __name__ == "__main__":
    response = post_result()
    print(json.dumps(response, indent=2))
