import { SEVERITY } from "../severity.js";
import ScoreRing from "./ScoreRing.jsx";
import SignalList from "./SignalList.jsx";

const SOURCE_TEXT = {
  gemini: "Analysed by Gemini AI",
  rules: "Analysed by built-in rules (AI was unavailable)",
  demo: "Sample answer from demo mode, not a real analysis",
};

export default function Result({ result }) {
  const sev = SEVERITY[result.severity];

  return (
    <section aria-live="polite" className="space-y-4">
      <div className={`flex flex-col items-center gap-5 rounded-lg border-2 bg-white p-5 sm:flex-row sm:p-6 ${sev.border}`}>
        <ScoreRing score={result.score} color={sev.color} />
        <div className="text-center sm:text-left">
          <p className={`inline-block rounded px-2 py-1 text-sm font-bold ${sev.bg} ${sev.text}`}>{sev.label}</p>
          <p className="mt-2 text-lg font-medium">{result.summary}</p>
          <p className="mt-2 text-sm text-ink/60">{SOURCE_TEXT[result.source] ?? ""}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SignalList
          title="Confirmed facts"
          note="Checked data, such as how the link is built."
          items={result.facts}
          emptyText="No hard facts were found."
        />
        <SignalList
          title="Warning signs"
          note="The AI's judgement. These can be wrong, so use them as a guide."
          items={result.warnings}
          emptyText="No warning signs were found."
        />
      </div>

      {result.steps.length > 0 && (
        <div className="rounded-lg border border-line bg-white p-4 sm:p-5">
          <h3 className="font-bold">What to do next</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {result.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
