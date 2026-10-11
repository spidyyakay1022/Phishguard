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

  const { risk_score, summary, findings = [], url_analysis, impersonating, next_steps = [] } = result

  return (
    <section className="py-8">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-line bg-white p-6 sm:flex-row">
        <RiskGauge score={risk_score} />
        <div>
          <p className="font-display text-3xl font-extrabold" style={{ color: levelColor(risk_score) }}>{levelLabel(risk_score)}</p>
          <p className="mt-2 text-lg">{summary}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold">Why it looks this way</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {findings.map((f, i) => <FindingCard key={i} finding={f} />)}
      </div>

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
