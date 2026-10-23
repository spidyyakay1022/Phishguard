import { useState } from "react";
import { analyze } from "./api.js";
import Header from "./components/Header.jsx";
import InputPanel from "./components/InputPanel.jsx";
import Loading from "./components/Loading.jsx";
import ErrorBanner from "./components/ErrorBanner.jsx";
import Result from "./components/Result.jsx";

export default function App() {
  const [mode, setMode] = useState("message"); // "message" or "url"
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setStatus("loading");
    setError("");
    try {
      const data = await analyze({ type: mode, content: value.trim() });
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  function changeMode(m) {
    setMode(m);
    setValue("");
    setStatus("idle");
    setResult(null);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <InputPanel
          mode={mode}
          setMode={changeMode}
          value={value}
          setValue={setValue}
          onSubmit={handleSubmit}
          loading={status === "loading"}
        />
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorBanner message={error} onRetry={handleSubmit} />}
        {status === "done" && result && <Result result={result} />}
      </main>
      <footer className="mx-auto max-w-5xl px-4 pb-8 text-sm text-ink/60">
        PhishGuard AI gives guidance, not a guarantee. When in doubt, do not click.
      </footer>
    </div>
  );
}
