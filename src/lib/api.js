export async function analyze({ type, content }) {
  if (type === "image") {
    throw new Error(
      "Screenshot/QR analysis is not connected yet. Please use Message or Link."
    );
  }

  const text = (content || "").trim();

  if (!text) {
    throw new Error("Please enter a message or URL to analyze.");
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  const score = Number(data.risk_score ?? 0);
  const urls = data.url_analysis || [];

  return {
    risk_score: score,
    summary: data.explanation || data.verdict || "Analysis complete",
    findings: (data.indicators || []).map((indicator) => ({
      title: indicator,
      severity: score > 70 ? "high" : score > 30 ? "medium" : "low",
      detail: data.explanation || indicator,
    })),
    url_analysis: urls.length
      ? {
          domain: urls.map((item) => item.url).join(", "),
          issues: [...new Set(urls.flatMap((item) => item.issues || []))],
        }
      : null,
    impersonating: data.impersonated_entity || null,
    next_steps: data.safe_steps || [],
    note: data.note || null,
  };
}
