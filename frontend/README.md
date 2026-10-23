# PhishGuard AI – Frontend (Member 2)

React + Vite + Tailwind interface. It sends a message or link to the backend and shows the risk score,
confirmed facts, warning signs and next steps.

## 1. Run it on your laptop (first time)

1. Install Node.js (LTS) from https://nodejs.org
2. Open a terminal inside this folder.
3. Install the packages:  `npm install`
4. Make your settings file:  copy `.env.example` and name the copy `.env`
5. Start the app:  `npm run dev`
6. Open the address it prints (usually http://localhost:5173)

## 2. Demo mode vs real mode (set in `.env`)

| Setting | Meaning |
|---|---|
| `VITE_USE_MOCK=true` | Demo mode. Fake answers, no backend needed. A yellow "Demo mode" badge shows on screen. |
| `VITE_USE_MOCK=false` | Real mode. Talks to the backend at `VITE_API_URL`. A green "Live analysis" badge shows. |

After you change `.env`, stop the app (Ctrl+C) and run `npm run dev` again.

## 3. What the backend must return (agree this with Member 1)

`POST /analyze` with body `{ "type": "message" | "url", "content": "..." }`

```json
{
  "risk_score": 87,
  "severity": "critical",
  "summary": "This looks like a phishing attempt.",
  "signals": [
    { "label": "Link uses a raw IP address", "detail": "...", "kind": "fact" },
    { "label": "Urgent wording", "detail": "...", "kind": "heuristic" }
  ],
  "recommendations": ["Do not click the link", "Report the message"],
  "source": "gemini"
}
```

`kind: "fact"` shows under "Confirmed facts". Anything else shows under "Warning signs".
`severity` is optional; if missing, the frontend works it out from the score.

The backend must also allow browser requests from your frontend (CORS). Tell Member 1:
"Add CORSMiddleware in FastAPI and allow http://localhost:5173".

## 4. Where things are

- `src/App.jsx` – main page, holds the state
- `src/api.js` – the ONLY file that talks to the backend
- `src/mock.js` – fake answers for demo mode
- `src/components/` – one file per piece of screen
- `src/severity.js` – colours and labels for low/medium/high/critical

## 5. Sharing your work on GitHub (without breaking teammates' work)

```
git pull
git checkout -b frontend-ui
git add .
git commit -m "Add frontend interface"
git push -u origin frontend-ui
```

Then open GitHub, click "Compare & pull request", and ask a teammate to merge it.
