# PhishGuard AI

PhishGuard is an AI-assisted phishing-awareness tool. It analyses pasted messages and links with rule-based checks and (when configured) Gemini, and gives a risk score, indicators, an explanation, and safer next steps. Screenshot text is extracted in the browser with OCR; QR codes can be decoded in the browser. QR destinations are treated as text and are never opened automatically.

> **Important:** The score is an estimate, not a guarantee. Do not paste passwords, OTPs, private keys, or other secrets into the app. OCR can misread text; review the extracted content.

## Repository layout

```text
PhishGuard_Fixed/
├── frontend/                 # React + Vite UI
│   ├── src/components/
│   ├── src/pages/
│   └── src/lib/api.js
├── backend/AIModel/           # FastAPI, rules engine, optional Gemini analysis
├── render.yaml
└── README.md
```

## Run locally

### 1. Backend

Python 3.10+ recommended.

```bash
cd backend/AIModel
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env       # Windows; on macOS/Linux use: cp .env.example .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Add your own `GEMINI_API_KEY` to `backend/AIModel/.env` if you want AI analysis. If no key is configured or Gemini fails, the backend uses rule-based checks and marks the response with a note. Never commit `.env`.

Check `http://127.0.0.1:8000/health` and `http://127.0.0.1:8000/docs`.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. In local development, `/api/analyze` is proxied to `http://127.0.0.1:8000/analyze`.

## Deploy

### Backend on Render

This repository includes `render.yaml`. Create a Render Web Service from this repository and set `GEMINI_API_KEY` (optional) and `CORS_ORIGINS` (required for cross-origin browser requests) in the service environment. `CORS_ORIGINS` should be your exact deployed frontend origin, such as `https://your-app.vercel.app`, with no trailing slash. Confirm `/health` returns `{"status":"ok"}`.

### Frontend on Vercel

Import the `frontend` directory as the Vercel project root. Set the build command to `npm run build` and output directory to `dist`. Set `VITE_API_BASE_URL` to the deployed backend origin, for example `https://your-api.onrender.com` (do not append `/analyze`). Redeploy after changing environment variables. Keep the SPA rewrite in `frontend/vercel.json`.

## API

`POST /analyze`

```json
{"text":"Your account will be suspended. Update KYC at https://example.xyz" , "type":"message"}
```

The `type` field is informational; both messages and links are analysed by the same endpoint. Responses include `risk_score`, `verdict`, `indicators`, `impersonated_entity`, `url_analysis`, `explanation`, `safe_steps`, and optionally `note`.

## Current limitations

- The rule engine is heuristic and may produce false positives or miss new scam patterns.
- URL checks inspect text patterns; the app does not visit websites, verify live reputation, or guarantee a destination is safe.
- Screenshot OCR is currently English-only in the browser. OCR quality depends on image clarity and may need a first-time model download.
- QR decoding uses the filename-independent mode selector. The decoded destination is not opened automatically.
- If Gemini is unavailable, the service falls back to rule-only scoring; review the `note` shown on the result.
- Automated test coverage is limited; test using synthetic examples before presenting or deploying.

## Safety

Use synthetic or authorised samples only. Do not test on other people's accounts, collect credentials, or open suspicious destinations just to verify them. For suspected financial fraud in India, contact your bank through official channels and consider reporting at cybercrime.gov.in or 1930.
