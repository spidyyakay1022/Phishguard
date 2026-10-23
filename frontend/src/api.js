import { severityFromScore } from "./severity.js";
import { mockAnalyze } from "./mock.js";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// What we send to the backend:  POST {API_URL}/analyze
//   { "type": "message" | "url", "content": "..." }
//
// What we expect back (Member 1 should return this shape):
//   {
//     "risk_score": 0-100,
//     "severity": "low" | "medium" | "high" | "critical",   (optional)
//     "summary": "one sentence",
//     "signals": [ { "label": "...", "detail": "...", "kind": "fact" | "heuristic" } ],
//     "recommendations": [ "step 1", "step 2" ],
//     "source": "gemini" | "rules"
//   }

// Turns whatever the backend sends into one clean shape, so the UI never crashes
// if a field is missing or named slightly differently.
export function normalize(raw) {
  const scoreRaw = Number(raw?.risk_score ?? raw?.score ?? 0);
  const score = Math.max(0, Math.min(100, Math.round(Number.isFinite(scoreRaw) ? scoreRaw : 0)));

  const toSignal = (s, defaultKind) =>
    typeof s === "string"
      ? { label: s, detail: "", kind: defaultKind }
      : {
          label: s?.label ?? s?.title ?? s?.signal ?? "Signal",
          detail: s?.detail ?? s?.description ?? s?.explanation ?? "",
          kind: s?.kind ?? s?.type ?? defaultKind,
        };

  let signals = [];
  if (Array.isArray(raw?.signals)) signals = raw.signals.map((s) => toSignal(s, "heuristic"));
  // Also accept separate "facts" and "warnings" lists.
  if (Array.isArray(raw?.facts)) signals.push(...raw.facts.map((s) => toSignal(s, "fact")));
  if (Array.isArray(raw?.warnings)) signals.push(...raw.warnings.map((s) => toSignal(s, "heuristic")));

  const severity = ["low", "medium", "high", "critical"].includes(raw?.severity)
    ? raw.severity
    : severityFromScore(score);

  return {
    score,
    severity,
    summary: raw?.summary ?? "",
    facts: signals.filter((s) => s.kind === "fact"),
    warnings: signals.filter((s) => s.kind !== "fact"),
    steps: raw?.recommendations ?? raw?.next_steps ?? [],
    source: raw?.source ?? "unknown",
  };
}

export async function analyze({ type, content }) {
  if (USE_MOCK) return normalize(await mockAnalyze({ type, content }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // give up after 30 s

  try {
    const res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`The server answered with an error (code ${res.status}). Ask Member 1 to check the backend logs.`);
    }
    return normalize(await res.json());
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("The analysis took too long. Try again in a moment.");
    }
    if (err instanceof TypeError) {
      throw new Error(`Cannot reach the backend at ${API_URL}. Check that it is running and that VITE_API_URL is correct.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
