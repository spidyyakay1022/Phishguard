export default function Loading() {
  return (
    <div role="status" className="flex items-center gap-3 rounded-lg border border-line bg-white p-6">
      <span className="h-5 w-5 animate-spin rounded-full border-4 border-line border-t-ink" />
      <p className="font-medium">Checking for phishing signs. This can take a few seconds.</p>
    </div>
  );
}
