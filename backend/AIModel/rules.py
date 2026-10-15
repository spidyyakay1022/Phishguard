"""
rules.py - Layer 1: simple rule-based checks (NO AI here).

It looks at the text, finds warning signs, and adds points.
More warning signs = higher rule score (maximum 100).
"""

import re
from urllib.parse import urlparse

# ---------------------------------------------------------------
# WORD LISTS (all lowercase). You can add more words any time.
# ---------------------------------------------------------------
URGENCY_WORDS = [
    "urgent", "urgently", "immediately", "within 24 hours", "within 24 hrs",
    "blocked", "suspended", "last warning", "final warning", "final notice",
    "act now", "expires today", "account will be closed", "deactivated",
    "immediate action",
]

SENSITIVE_WORDS = [
    "otp", "password", "upi pin", "atm pin", "card pin", "your pin",
    "enter your pin", "share your pin", "card number", "debit card number",
    "cvv", "bank details", "account number", "net banking password",
]

# Real banks often write "Do not share your OTP". That is a SAFE sentence,
# so if one of these phrases is present we do not count the OTP/password words.
SAFE_PHRASES = ["do not share", "don't share", "never share"]

PRIZE_WORDS = [
    "lottery", "lucky draw", "you have won", "you won", "you are a winner",
    "winner", "prize", "reward", "cashback", "congratulations",
    "free gift", "gift card", "claim your", "claim now",
]

KYC_WORDS = [
    "kyc", "know your customer", "update your pan", "pan card update",
    "aadhaar update", "aadhar update", "verify your account",
    "account verification",
]

COURIER_WORDS = ["courier", "parcel", "customs", "india post", "fedex",
                 "dhl", "blue dart", "dtdc"]
FEE_WORDS = ["fee", "fees", "charge", "charges", "duty", "pay", "payment",
             "rs", "₹"]

JOB_WORDS = [
    "work from home", "part time job", "part-time job", "earn daily",
    "earn per day", "registration fee", "joining fee", "guaranteed job",
    "job offer",
]

# ---------------------------------------------------------------
# URL LISTS
# ---------------------------------------------------------------
SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly",
    "rb.gy", "ow.ly", "shorturl.at", "tiny.cc", "rebrand.ly", "s.id",
}

RISKY_ENDINGS = [".xyz", ".top", ".click", ".tk", ".ml", ".ga", ".cf",
                 ".gq", ".icu", ".buzz", ".work", ".loan"]

# Brand name -> (nice name, list of REAL official domains)
BRANDS = {
    "sbi": ("SBI Bank", ["sbi.co.in", "onlinesbi.sbi", "onlinesbi.com", "sbi.bank.in", "sbicard.com"]),
    "hdfc": ("HDFC Bank", ["hdfcbank.com", "hdfc.com"]),
    "icici": ("ICICI Bank", ["icicibank.com"]),
    "paytm": ("Paytm", ["paytm.com"]),
    "phonepe": ("PhonePe", ["phonepe.com"]),
    "paypal": ("PayPal", ["paypal.com"]),
    "amazon": ("Amazon", ["amazon.in", "amazon.com"]),
    "flipkart": ("Flipkart", ["flipkart.com"]),
    "google": ("Google", ["google.com", "google.co.in"]),
    "microsoft": ("Microsoft", ["microsoft.com"]),
    "aadhaar": ("Aadhaar / UIDAI", ["uidai.gov.in"]),
    "incometax": ("Income Tax Department", ["incometax.gov.in", "incometaxindia.gov.in"]),
}

# Fake spelling tricks: paypa1 -> paypal, amaz0n -> amazon
LOOKALIKE_MAP = str.maketrans({"0": "o", "1": "l", "3": "e", "5": "s"})

# Finds things that start with http://, https:// or www.
URL_PATTERN = re.compile(r"(?:https?://|www\.)[^\s<>\"']+", re.IGNORECASE)


def _find(text, words):
    """Return the words from the list that appear in the text."""
    found = []
    for word in words:
        # (?<!\w) and (?!\w) mean: the word must stand alone.
        # This stops "pin" matching inside "spinning".
        pattern = r"(?<!\w)" + re.escape(word) + r"(?!\w)"
        if re.search(pattern, text):
            found.append(word)
    return found


def extract_urls(text):
    """Pull all links out of the text (no duplicates)."""
    urls = [u.rstrip(".,);:!?") for u in URL_PATTERN.findall(text)]

    # If the user pasted only a link without http (like "sbi-kyc.xyz/login")
    if not urls:
        t = text.strip().rstrip(".,);:!?")
        if " " not in t and "." in t and len(t) > 3:
            urls = [t]

    unique = []
    for u in urls:
        if u not in unique:
            unique.append(u)
    return unique


def _brand_in_tokens(name, tokens):
    """Is the brand name one of the pieces of the domain?"""
    for t in tokens:
        if t == name or (len(name) >= 4 and name in t):
            return True
    return False


def check_url(url):
    """Check ONE url. Returns (list_of_issues, impersonated_brand_or_None)."""
    issues = []
    brand = None

    has_scheme = "://" in url
    parsed = urlparse(url if has_scheme else "http://" + url)
    host = (parsed.hostname or "").lower()

    if not host:
        return ["The web address looks broken or unusual"], None

    host_no_www = host[4:] if host.startswith("www.") else host

    if url.lower().startswith("http://"):
        issues.append("Does not use HTTPS (connection is not secure)")
    if "@" in url:
        issues.append('Contains an "@" symbol, which can hide the real website')
    if host_no_www in SHORTENERS:
        issues.append("Shortened link hides the real destination")
    if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host):
        issues.append("Uses an IP address instead of a website name")
    if host.count("-") >= 3:
        issues.append("Has too many hyphens in the domain")
    if len(host.split(".")) > 4:
        issues.append("Has too many subdomains")
    for ending in RISKY_ENDINGS:
        if host.endswith(ending):
            issues.append(f'Ends with a risky domain type ("{ending}")')
            break

    # Brand checks: fake spelling, or brand name on a non-official site
    tokens = re.split(r"[.\-]", host)
    fixed_tokens = [t.translate(LOOKALIKE_MAP) for t in tokens]
    for name, (nice_name, official_domains) in BRANDS.items():
        if _brand_in_tokens(name, tokens):
            is_official = any(host == d or host.endswith("." + d)
                              for d in official_domains)
            if not is_official:
                issues.append(f'Uses the name "{nice_name}" but is not its official website')
                brand = nice_name
        elif _brand_in_tokens(name, fixed_tokens):
            issues.append(f'Fake spelling that looks like "{nice_name}"')
            brand = nice_name

    return issues, brand


def analyze_rules(text):
    """
    Run all rule checks on the text.
    Returns a dictionary with: score, indicators, url_analysis,
    impersonated_entity, reasons.
    """
    lowered = text.lower()
    score = 0
    indicators = []
    reasons = []  # short plain-English sentences (used if the AI is down)

    # 1. Urgency
    hits = _find(lowered, URGENCY_WORDS)
    if hits:
        score += 15
        indicators.append("Urgency")
        reasons.append(f'it uses pressure words like "{hits[0]}"')

    # 2. Asking for OTP / password / card details
    has_safe_phrase = any(p in lowered for p in SAFE_PHRASES)
    hits = _find(lowered, SENSITIVE_WORDS)
    if hits and not has_safe_phrase:
        score += 25
        indicators.append("Sensitive information request")
        reasons.append(f'it asks for private details like "{hits[0]}"')

    # 3. Prize / lottery bait
    hits = _find(lowered, PRIZE_WORDS)
    if hits:
        score += 20
        indicators.append("Prize or reward bait")
        reasons.append(f'it talks about prizes or rewards ("{hits[0]}")')

    # 4. Fake KYC
    hits = _find(lowered, KYC_WORDS)
    if hits:
        score += 20
        indicators.append("Fake KYC")
        reasons.append("it asks you to update or verify KYC")

    # 5. Fake courier / customs fee (needs BOTH a courier word and a fee word)
    if _find(lowered, COURIER_WORDS) and _find(lowered, FEE_WORDS):
        score += 15
        indicators.append("Fake courier or customs fee")
        reasons.append("it talks about a parcel and asks for a payment")

    # 6. Fake job offer
    hits = _find(lowered, JOB_WORDS)
    if hits:
        score += 15
        indicators.append("Fake job offer")
        reasons.append(f'it looks like a job offer scam ("{hits[0]}")')

    # 7. URL checks
    url_analysis = []
    impersonated = None
    total_url_issues = 0
    for url in extract_urls(text):
        issues, brand = check_url(url)
        if issues:
            url_analysis.append({"url": url, "issues": issues})
            total_url_issues += len(issues)
        if brand and impersonated is None:
            impersonated = brand

    if total_url_issues > 0:
        score += min(40, total_url_issues * 10)  # URL points are capped at 40
        indicators.append("Suspicious URL")
        reasons.append("the link has warning signs")
    if impersonated:
        indicators.append("Impersonation")
        reasons.append(f"the link pretends to be {impersonated}")

    return {
        "score": min(100, score),
        "indicators": indicators,
        "url_analysis": url_analysis,
        "impersonated_entity": impersonated,
        "reasons": reasons,
    }