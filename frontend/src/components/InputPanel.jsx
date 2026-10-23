const SAMPLES = {
  message: [
    {
      name: "Fake bank alert",
      value: "URGENT: Your account will be suspended within 24 hours. Verify now: http://secure-bankupdate.example-login.com and share your OTP.",
    },
    { name: "Normal message", value: "Hi, class is moved to Room 204 tomorrow at 10 am. See you there." },
  ],
  url: [
    { name: "Suspicious link", value: "http://192.168.4.20/login/verify-account" },
    { name: "Normal link", value: "https://www.wikipedia.org" },
  ],
};

export default function InputPanel({ mode, setMode, value, setValue, onSubmit, loading }) {
  const tabs = [
    { id: "message", label: "Message" },
    { id: "url", label: "Link (URL)" },
  ];

  return (
    <section className="rounded-lg border border-line bg-white p-4 sm:p-6" aria-labelledby="input-title">
      <h2 id="input-title" className="text-lg font-bold">What do you want to check?</h2>

      <div role="tablist" className="mt-4 inline-flex rounded-md border border-line p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mode === t.id}
            onClick={() => setMode(t.id)}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              mode === t.id ? "bg-ink text-white" : "text-ink hover:bg-paper"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label htmlFor="content" className="mt-5 block text-sm font-medium">
        {mode === "message" ? "Paste the SMS, email or WhatsApp text" : "Paste the full link"}
      </label>
      {mode === "message" ? (
        <textarea
          id="content"
          rows={6}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste the message here"
          className="mt-2 w-full rounded-md border border-line p-3 text-base"
        />
      ) : (
        <input
          id="content"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://"
          className="mt-2 w-full rounded-md border border-line p-3 text-base"
        />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink/70">Try a sample:</span>
        {SAMPLES[mode].map((s) => (
          <button
            key={s.name}
            onClick={() => setValue(s.value)}
            className="rounded-full border border-line px-3 py-1 hover:bg-paper"
          >
            {s.name}
          </button>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || value.trim().length === 0}
        className="mt-5 w-full rounded-md bg-ink px-5 py-3 font-bold text-white transition-opacity disabled:opacity-40 sm:w-auto"
      >
        {loading ? "Checking…" : "Check for phishing"}
      </button>
    </section>
  );
}
