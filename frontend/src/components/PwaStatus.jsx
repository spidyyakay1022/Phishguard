import { useEffect, useState } from 'react'

export default function PwaStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const onBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const onInstalled = () => {
      setInstallPrompt(null)
      setMessage('PhishGuard installed successfully.')
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setMessage(choice.outcome === 'accepted' ? 'Installation started.' : 'You can install PhishGuard later from your browser menu.')
    setInstallPrompt(null)
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pb-3" aria-live="polite">
      {!online && (
        <p role="status" className="w-full rounded-lg border border-warn/40 bg-white px-3 py-2 text-sm text-ink">
          You are offline. The app shell may still open, but phishing scans need an internet connection.
        </p>
      )}
      {online && message && <p role="status" className="text-sm text-muted">{message}</p>}
      {installPrompt && (
        <button type="button" onClick={installApp} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand">
          Install PhishGuard
        </button>
      )}
    </div>
  )
}
