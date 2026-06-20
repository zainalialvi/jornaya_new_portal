"""
get_data.py — pull the next pending submission for a company from the portal.

Calls the unauthenticated POST /bot/poll, which atomically claims the single
oldest `pending` submission for the company (flipping it `pending -> processing`)
and returns it. Only pending work is ever dispatched. Returns null when nothing
is pending or the company is inactive.

Just run it:  python get_data.py
Edit the CONFIG values below to point at your portal / company.
"""
import json
import urllib.error
import urllib.request

# ============================ CONFIG — edit these ============================
BASE_URL = "http://localhost:8989"          # local backend; use your hosted URL to hit the cloud
COMPANY_ID = "6a36627cd515dfff8b816aea"     # Acme Corp (compose DB)
# ============================================================================


def poll_company(company_id=COMPANY_ID, base_url=BASE_URL, timeout=30):
    """Claim the next pending submission. Returns one dict, or None if none."""
    url = f"{base_url.rstrip('/')}/bot/poll"
    payload = json.dumps({"company_id": company_id}).encode("utf-8")

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
    item = poll_company()
    print(json.dumps(item, indent=2))
    print("\nClaimed 1 submission." if item else "\nNo pending submissions.")
