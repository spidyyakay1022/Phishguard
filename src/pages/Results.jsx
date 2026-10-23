import { Link, useLocation } from 'react-router-dom'
import RiskGauge, { levelColor, levelLabel } from '../components/RiskGauge.jsx'
import FindingCard from '../components/FindingCard.jsx'

function loadResult(state) {
  if (state?.result) return state.result
  try { return JSON.parse(sessionStorage.getItem('phishguard-result')) } catch { return null }
}

export default function Results() {
  const result = loadResult(useLocation().state)

  if (!result) {
    return (
      <section className="py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">Nothing to show yet</h1>
        <p className="mt-2 text-muted">Check a message, link or screenshot first.</p>
        <Link to="/analyze" className="mt-5 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white">Check something</Link>
      </section>
    )
  }

  const { risk_score, summary, findings = [], url_analysis, impersonating, next_steps = [], note, extracted_content, extracted_urls = [], verdict, analysis_status } = result

  return (
    <section className="py-8">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-line bg-white p-6 sm:flex-row">
        <RiskGauge score={risk_score} />
        <div>
          <p className="font-display text-3xl font-extrabold" style={{ color: analysis_status === "unverified" ? "var(--color-warn)" : levelColor(risk_score) }}>{analysis_status === "unverified" ? "Unverified" : (verdict && verdict !== "UNVERIFIED" ? verdict : levelLabel(risk_score))}</p>
          <p className="mt-2 text-lg">{summary}</p>
        </div>
      </div>

      {analysis_status === "unverified" && <p role="alert" className="mt-4 rounded-lg border border-line bg-amber-50 p-3 text-sm text-amber-900">Safety could not be verified. A low heuristic score is not proof that this URL is safe. Avoid entering passwords, payment details, or OTPs unless you independently trust the site.</p>}
      {note && <p role="status" className="mt-4 rounded-lg border border-line bg-white p-3 text-sm text-muted">{note}</p>}
      {extracted_content && <details className="mt-6 rounded-lg border border-line bg-white p-4"><summary className="cursor-pointer font-semibold">Review extracted content</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted">{extracted_content}</p>{extracted_urls.length > 0 && <><h3 className="mt-3 font-semibold">Detected URL text</h3><ul className="list-disc break-all pl-5 text-sm text-muted">{extracted_urls.map((item, i) => <li key={i}>{item}</li>)}</ul></>}</details>}
      <h2 className="mt-10 font-display text-2xl font-semibold">Why it looks this way</h2>
      {findings.length ? <div className="mt-3 grid gap-3 md:grid-cols-2">{findings.map((f, i) => <FindingCard key={i} finding={f} />)}</div> : <p className="mt-3 rounded-lg border border-line bg-white p-4 text-muted">No specific warning labels were returned. Read the explanation carefully; this does not guarantee the content is safe.</p>}

      {(url_analysis || impersonating) && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {url_analysis && (
            <div className="rounded-lg border border-line bg-white p-4">
              <h3 className="font-display text-lg font-semibold">Link check</h3>
              <p className="mt-1 break-all font-mono text-sm">{url_analysis.domain}</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                {url_analysis.issues.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}
          {impersonating && (
            <div className="rounded-lg border border-line bg-white p-4">
              <h3 className="font-display text-lg font-semibold">Possible impersonation</h3>
              <p className="mt-1 text-sm text-muted">This message appears to pretend to be <strong className="text-ink">{impersonating}</strong>.</p>
            </div>
          )}
        </div>
      )}

      <h2 className="mt-10 font-display text-2xl font-semibold">What to do now</h2>
      <ul className="mt-3 space-y-2">
        {next_steps.map((s, i) => (
          <li key={i} className="flex gap-3 rounded-lg bg-white p-3 border border-line">
            <span aria-hidden className="text-safe">&#10003;</span>{s}
          </li>
        ))}
      </ul>

      <Link to="/analyze" className="mt-8 inline-block rounded-lg bg-ink px-6 py-3 font-semibold text-white hover:bg-brand">Check another</Link>
    </section>
  )
}
