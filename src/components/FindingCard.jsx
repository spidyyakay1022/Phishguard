const styles = {
  high: { bar: 'var(--color-danger)', tag: 'High' },
  medium: { bar: 'var(--color-warn)', tag: 'Medium' },
  low: { bar: 'var(--color-safe)', tag: 'Low' },
}

export default function FindingCard({ finding }) {
  const s = styles[finding.severity] || styles.low
  return (
    <article className="rounded-lg border border-line bg-white p-4" style={{ borderLeft: `6px solid ${s.bar}` }}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{finding.title}</h3>
        <span className="shrink-0 text-xs font-semibold" style={{ color: s.bar }}>{s.tag} severity</span>
      </div>
      <p className="mt-1 text-sm text-muted">{finding.detail}</p>
    </article>
  )
}
