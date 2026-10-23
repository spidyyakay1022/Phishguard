export default function SignalList({ title, note, items, emptyText }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 sm:p-5">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm text-ink/70">{note}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink/60">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((s, i) => (
            <li key={i} className="border-l-4 border-ink/20 pl-3">
              <p className="font-medium">{s.label}</p>
              {s.detail && <p className="text-sm text-ink/70">{s.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
