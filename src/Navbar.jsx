import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
      <Link to="/" className="font-display text-xl font-extrabold">PhishGuard AI</Link>
      <Link to="/analyze" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-brand">
        Check something
      </Link>
    </header>
  )
}
