import { mockAnalyze } from './mock.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/*
  Contract to agree on with the backend teammate.

  POST /api/analyze
    Text or URL -> JSON:    { "type": "text" | "url", "content": "..." }
    Screenshot  -> FormData: type="image", file=<image file>

  Response JSON:
  {
    "risk_score": 91,                               // 0-100
    "summary": "Short plain-language verdict",
    "findings": [{ "title": "Urgency language", "severity": "low|medium|high", "detail": "..." }],
    "url_analysis": { "domain": "x.com", "issues": ["..."] } | null,
    "impersonating": "PayPal" | null,
    "next_steps": ["Do not click the link", "..."]
  }
*/
export async function analyze({ type, content, file }) {
  if (USE_MOCK) return mockAnalyze({ type, content: file ? 'screenshot' : content })

  let options
  if (type === 'image') {
    const form = new FormData()
    form.append('type', 'image')
    form.append('file', file)
    options = { method: 'POST', body: form }
  } else {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content }),
    }
  }

  const res = await fetch('/api/analyze', options)
  if (!res.ok) throw new Error(`The server returned an error (${res.status}). Try again in a moment.`)
  return res.json()
}
