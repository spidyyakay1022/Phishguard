export const levelColor = (score) =>
  score >= 70 ? 'var(--color-danger)' : score >= 35 ? 'var(--color-warn)' : 'var(--color-safe)'

export const levelLabel = (score) =>
  score >= 70 ? 'High risk' : score >= 35 ? 'Suspicious' : 'Looks safe'

// Circular score meter drawn with SVG.
export default function RiskGauge({ score }) {
  const r = 70
  const circ = 2 * Math.PI * r
  const color = levelColor(score)
  return (
    <div className="relative h-44 w-44 shrink-0" role="img" aria-label={`Risk score ${score} out of 100`}>
      <svg viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--color-line)" strokeWidth="14" />
        <circle
          cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-sm text-muted">out of 100</span>
      </div>
    </div>
  )
}
