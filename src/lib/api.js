const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function analyze({ type = 'message', content }) {
  const text = String(content || '').trim()
  if (!text) throw new Error('Please enter a message or URL to analyze.')
  if (text.length > 5000) throw new Error('Please keep the content under 5,000 characters.')

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Analysis failed (${response.status}).`)

  const score = Math.max(0, Math.min(100, Math.round(Number(data.risk_score ?? 0))))
  const urlItems = Array.isArray(data.url_analysis) ? data.url_analysis : []
  const indicators = Array.isArray(data.indicators) ? data.indicators : []
  const severity = score >= 70 ? 'high' : score >= 35 ? 'medium' : 'low'

  return {
    risk_score: score,
    summary: data.explanation || data.verdict || 'Analysis complete. Review the findings before deciding what to do.',
    findings: indicators.map((item) => ({
      title: typeof item === 'string' ? item : String(item.title || item.label || 'Potential warning sign'),
      severity,
      detail: typeof item === 'object' && item.detail ? item.detail : (data.explanation || 'This signal should be checked in context.'),
    })),
    url_analysis: urlItems.length ? {
      domain: urlItems.map((item) => item.url).filter(Boolean).join(', '),
      issues: [...new Set(urlItems.flatMap((item) => Array.isArray(item.issues) ? item.issues : []))],
    } : null,
    impersonating: data.impersonated_entity || null,
    next_steps: Array.isArray(data.safe_steps) ? data.safe_steps : [],
    note: data.note || null,
    verdict: data.verdict || null,
  }
}
