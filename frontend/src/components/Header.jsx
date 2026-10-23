import { USE_MOCK } from "../api.js";

export default function Header() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">PhishGuard AI</h1>
          <p className="text-sm text-ink/70">Check a message or link before you click it.</p>
        </div>
        {USE_MOCK ? (
          <span className="rounded-full border border-caution px-3 py-1 text-sm font-medium text-caution">
            Demo mode: sample answers
          </span>
        ) : (
          <span className="rounded-full border border-safe px-3 py-1 text-sm font-medium text-safe">
            Live analysis
          </span>
        )}
      </div>
    </header>
  );
}
