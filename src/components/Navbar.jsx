import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
      <Link to="/" aria-label="PhishGuard AI home" className="flex min-w-0 items-center gap-3">
        <img src="/icons/phishguard-icon.svg" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <span className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
          <span className="text-ink">PHISH</span><span className="text-brand">GUARD</span>
          <span className="ml-1 text-xs font-semibold text-muted sm:text-sm">AI</span>
        </span>
      </Link>
      <Link to="/analyze" className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-brand sm:px-4">
        Check something
      </Link>
    </header>
  )
}
