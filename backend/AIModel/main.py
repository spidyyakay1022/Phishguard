"""
main.py - The web server. It has the /analyze endpoint and joins all 3 layers.
"""

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, HTMLResponse
from pathlib import Path
from pydantic import BaseModel

from rules import analyze_rules
from llm import analyze_with_llm

MAX_CHARS = 5000    # longest message we accept
RULE_WEIGHT = 0.4   # 40% rules
LLM_WEIGHT = 0.6    # 60% AI

app = FastAPI(title="PhishGuard AI - Detection Engine")


# This describes the JSON we expect: {"text": "..."}
class AnalyzeRequest(BaseModel):
    text: str


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
@app.get("/", response_class=HTMLResponse)
def home():
    page = Path(__file__).parent / "static" / "index.html"
    return HTMLResponse(page.read_text(encoding="utf-8"))

@app.get("/health")
def health():
    return {"status": "PhishGuard AI Detection Engine is running"}


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

    response = {
        "risk_score": final_score,
        "verdict": get_verdict(final_score),
        "indicators": indicators,
        "impersonated_entity": entity,
        "url_analysis": url_analysis,
        "explanation": explanation,
        "safe_steps": safe_steps,
    }
    if note:
        response["note"] = note   # only added when the AI failed
    return response