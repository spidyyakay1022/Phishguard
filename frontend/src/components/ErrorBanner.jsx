export default function ErrorBanner({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border-2 border-danger bg-danger/5 p-4">
      <p className="font-bold text-danger">The check did not finish</p>
      <p className="mt-1">{message}</p>
      <button onClick={onRetry} className="mt-3 rounded-md border border-danger px-4 py-2 font-medium text-danger">
        Try again
      </button>
    </div>
  );
}
