"""
main.py - The web server. It has the /analyze endpoint and joins all 3 layers.
"""

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import json
from urllib.request import Request, urlopen
from urllib.parse import urlparse

from rules import analyze_rules, extract_urls
from llm import analyze_with_llm

MAX_CHARS = 5000    # longest message we accept
RULE_WEIGHT = 0.4   # 40% rules
LLM_WEIGHT = 0.6    # 60% AI

app = FastAPI(title="PhishGuard AI - Detection Engine", version="1.0.0")


# Allow the deployed production frontends and local development origins.
# Override this comma-separated list with CORS_ORIGINS in Render if needed.
_default_origins = "https://phishguard-akay10.vercel.app,https://phishguard-peach-eta.vercel.app,http://localhost:5173,http://127.0.0.1:5173"
_origins = [item.strip() for item in os.getenv("CORS_ORIGINS", _default_origins).split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    type: str = "message"


# ---------- Friendly error messages (so the server never just crashes) ----------
@app.exception_handler(RequestValidationError)
async def bad_request_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"error": 'Please send JSON like this: {"text": "your message here"}'},
    )


@app.exception_handler(Exception)
async def unexpected_error_handler(request, exc):
    print(f"[ERROR] {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong on our side. Please try again."},
    )


# ---------- Small helper functions ----------
def get_verdict(score):
    if score <= 30:
        return "LOW RISK"
    if score <= 70:
        return "MEDIUM RISK"
    return "HIGH RISK"


def merge_unique(list_a, list_b):
    """Join two lists, remove repeats (ignoring upper/lower case)."""
    result = []
    seen = set()
    for item in list_a + list_b:
        key = item.lower().strip()
        if key and key not in seen:
            seen.add(key)
            result.append(item)
    return result


def merge_urls(rule_urls, llm_urls):
    """Join URL findings from rules and AI. Same URL -> combine the issues."""
    merged = {}
    for item in rule_urls + llm_urls:
        merged.setdefault(item["url"], [])
        merged[item["url"]] = merge_unique(merged[item["url"]], item["issues"])
    return [{"url": url, "issues": issues} for url, issues in merged.items()]


def default_safe_steps(score):
    if score > 30:
        return [
            "Do not click any links in this message",
            "Do not share your OTP, password, PIN or card details",
            "Contact the company only through its official website or app",
            "Report scams at cybercrime.gov.in or call 1930",
        ]
    return [
        "No big warning signs were found, but stay careful",
        "Check who sent the message before clicking any link",
    ]


def rules_only_explanation(reasons):
    if not reasons:
        return ("The basic rule checks found no common phishing signs, "
                "but the AI check was not available, so please stay careful.")
    return "This message looks risky because " + "; ".join(reasons[:3]) + "."


# ---------- Health check (open http://localhost:8000 to see it) ----------
@app.get("/")
def home():
    return {"service": "PhishGuard AI Detection Engine", "status": "running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}


def check_google_safe_browsing(urls):
    """Return (matched_urls, configured, error). No match is NOT proof of safety."""
    api_key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "").strip()
    if not api_key or not urls:
        return [], bool(api_key), None
    entries = []
    for url in urls[:20]:
        candidate = url.strip()
        if not candidate.startswith(("http://", "https://")):
            candidate = "https://" + candidate
        entries.append({"url": candidate})
    payload = {
        "client": {"clientId": "PhishGuard", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": entries,
        },
    }
    request = Request(
        "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + api_key,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=5) as response:
            result = json.loads(response.read().decode("utf-8"))
        matches = result.get("matches", [])
        matched = {m.get("threat", {}).get("url", "").lower() for m in matches}
        return [u for u in urls if any(
            (u if u.startswith(("http://", "https://")) else "https://" + u).lower() == m
            for m in matched
        )], True, None
    except Exception as error:
        print(f"[Safe Browsing unavailable] {error}")
        return [], True, "Google Safe Browsing lookup failed; URL safety remains unverified."


# ---------- The main endpoint ----------
@app.post("/analyze")
def analyze(body: AnalyzeRequest):
    text = body.text.strip()

    # Check the input
    if not text:
        return JSONResponse(
            status_code=400,
            content={"error": "Please paste a message or URL to analyze."},
        )
    if len(text) > MAX_CHARS:
        return JSONResponse(
            status_code=400,
            content={"error": f"Text is too long. Maximum is {MAX_CHARS} characters."},
        )

    # Layer 1: rules
    rule_result = analyze_rules(text)

    # Layer 2: AI (this may fail, so we protect it)
    note = None
    try:
        llm_result = analyze_with_llm(text)
    except Exception as error:
        print(f"[AI unavailable] {error}")
        llm_result = None
        note = "AI analysis was unavailable, so this result uses only rule-based checks."

    # Layer 3: final score
    if llm_result:
        final_score = round(RULE_WEIGHT * rule_result["score"]
                            + LLM_WEIGHT * llm_result["risk_score"])
    else:
        final_score = rule_result["score"]   # rules only
    final_score = max(0, min(100, final_score))

    # A rule-detected URL warning must not be diluted into a "low risk" result
    # by a confident-sounding AI answer. This is a conservative warning floor.
    if rule_result["url_analysis"]:
        final_score = max(final_score, 40)

    # Do not let the AI weighted average dilute a strong advance-fee scam pattern.
    # A prize/job plus a money request and urgency/sensitive-data request is high risk.
    rule_indicators = set(rule_result["indicators"])
    if (
        "Advance-fee or payment demand" in rule_indicators
        and ("Prize or reward bait" in rule_indicators or "Fake job offer" in rule_indicators)
    ):
        final_score = max(final_score, 85)

    # Check URLs against Google Safe Browsing when GOOGLE_SAFE_BROWSING_API_KEY is configured.
    # A clean lookup is not a guarantee that a URL is safe.
    urls_found = extract_urls(text)
    detected_urls = bool(urls_found)
    matched_urls, safe_browsing_configured, safe_browsing_error = check_google_safe_browsing(urls_found)
    if matched_urls:
        final_score = max(final_score, 95)
        indicators = None  # populated after merging model/rule indicators below
        rule_result["indicators"] = merge_unique(rule_result["indicators"], ["Listed by Google Safe Browsing"])
        for matched_url in matched_urls:
            rule_result["url_analysis"].append({"url": matched_url, "issues": ["Listed by Google Safe Browsing as a potential threat"]})

    # Build the final answer
    if llm_result:
        indicators = merge_unique(rule_result["indicators"], llm_result["indicators"])
        url_analysis = merge_urls(rule_result["url_analysis"], llm_result["url_analysis"])
        entity = llm_result["impersonated_entity"] or rule_result["impersonated_entity"]
        explanation = llm_result["explanation"] or rules_only_explanation(rule_result["reasons"])
        safe_steps = llm_result["safe_steps"] or default_safe_steps(final_score)
    else:
        indicators = rule_result["indicators"]
        url_analysis = rule_result["url_analysis"]
        entity = rule_result["impersonated_entity"]
        explanation = rules_only_explanation(rule_result["reasons"])
        safe_steps = default_safe_steps(final_score)

    # No positive match is not a clean bill of health. URLs stay unverified unless a threat is found.
    unverified_url = detected_urls and final_score <= 30
    response = {
        "risk_score": final_score,
        "verdict": "UNVERIFIED" if unverified_url else get_verdict(final_score),
        "analysis_status": "unverified" if unverified_url else ("partial" if note else "complete"),
        "url_verification": (
            "known_threat_match" if matched_urls else
            "checked_no_match_not_proof_safe" if safe_browsing_configured and not safe_browsing_error and detected_urls else
            "lookup_failed" if safe_browsing_error else
            "not_checked_no_api_key" if detected_urls else "no_url_detected"
        ),
        "indicators": indicators,
        "impersonated_entity": entity,
        "url_analysis": url_analysis,
        "explanation": explanation,
        "safe_steps": safe_steps,
    }
    if note:
        response["note"] = note   # only added when the AI failed
    if safe_browsing_error:
        response["note"] = (response.get("note", "") + " " + safe_browsing_error).strip()
    elif detected_urls and not safe_browsing_configured and not matched_urls:
        response["note"] = (response.get("note", "") + " Google Safe Browsing API key is not configured; this URL was not checked against live threat data.").strip()
    return response