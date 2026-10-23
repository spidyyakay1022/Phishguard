// The big risk meter. Circle fills clockwise in proportion to the score (0-100).
export default function ScoreRing({ score, color }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40 shrink-0" role="img" aria-label={`Risk score ${score} out of 100`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#D5DEE3" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
      />
      <text x="60" y="62" textAnchor="middle" fontSize="32" fontWeight="800" fill="#10262E">{score}</text>
      <text x="60" y="80" textAnchor="middle" fontSize="10" fill="#10262E" opacity="0.7">out of 100</text>
    </svg>
  );
}
