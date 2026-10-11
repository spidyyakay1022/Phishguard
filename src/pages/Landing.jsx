import { Link } from 'react-router-dom'

// The hero shows a real-looking scam SMS with the suspicious parts marked.
function Flag({ children, why }) {
  return (
    <mark title={why} className="rounded bg-danger/15 px-1 text-danger underline decoration-dotted underline-offset-4">
      {children}
    </mark>
  )
}

export default function Landing() {
  return (
    <>
      <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Not sure if that message is a scam? Find out why.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            Paste a message, a link or a screenshot. PhishGuard gives a risk score and shows exactly what looks wrong.
          </p>
          <Link to="/analyze" className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-ink">
            Check a message
          </Link>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Sample message. Hover the marked parts.</p>
          <p className="mt-3 leading-relaxed">
            Dear customer, your SBI account will be <Flag why="Urgency language">suspended within 24 hours</Flag>.
            Update your <Flag why="Asks for financial information">KYC and card number</Flag> at{' '}
            <Flag why="Suspicious domain">sbi-kyc-update.xyz</Flag> now.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm font-semibold">Risk</span>
            <span className="font-display text-2xl font-extrabold text-danger">91/100</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-t border-line py-10 sm:grid-cols-2">
        {[
          ['Risk score', 'A single 0 to 100 number so you know how worried to be.'],
          ['Plain-language reasons', 'Every warning explains what is suspicious and why it matters.'],
          ['Link and sender checks', 'Spots look-alike domains and brands being imitated.'],
          ['Clear next steps', 'Tells you what to do now, such as what not to click and who to call.'],
        ].map(([title, text]) => (
          <div key={title}>
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-muted">{text}</p>
          </div>
        ))}
      </section>
    </>
  )
}
