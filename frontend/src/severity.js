// One place that decides how each severity level looks and reads.
export const SEVERITY = {
  low: { label: "Low risk", color: "#1F7A5A", text: "text-safe", bg: "bg-safe/10", border: "border-safe" },
  medium: { label: "Medium risk", color: "#B87A00", text: "text-caution", bg: "bg-caution/10", border: "border-caution" },
  high: { label: "High risk", color: "#C4352B", text: "text-danger", bg: "bg-danger/10", border: "border-danger" },
  critical: { label: "Critical risk", color: "#8E1B2C", text: "text-critical", bg: "bg-critical/10", border: "border-critical" },
};

// Used when the backend does not send a severity.
export function severityFromScore(score) {
  if (score < 25) return "low";
  if (score < 50) return "medium";
  if (score < 75) return "high";
  return "critical";
}
