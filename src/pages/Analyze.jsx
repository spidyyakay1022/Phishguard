import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyze } from '../lib/api.js'

const TABS = [
  { id: 'text', label: 'Message' },
  { id: 'url', label: 'Link' },
  { id: 'image', label: 'Screenshot or QR' },
]

export default function Analyze() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Show a small preview of the chosen image.
  useEffect(() => {
    if (!file) return setPreview(null)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const ready = (tab === 'text' && text.trim()) || (tab === 'url' && url.trim()) || (tab === 'image' && file)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const result = await analyze({ type: tab, content: tab === 'text' ? text : url, file })
      sessionStorage.setItem('phishguard-result', JSON.stringify(result))
      navigate('/results', { state: { result } })
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl py-8">
      <h1 className="font-display text-3xl font-extrabold">What do you want to check?</h1>

      <div role="tablist" className="mt-6 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${tab === t.id ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'text' && (
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
            placeholder="Paste the email, SMS or chat message here"
            className="w-full rounded-lg border border-line bg-white p-3" aria-label="Message text" />
        )}
        {tab === 'url' && (
          <input value={url} onChange={(e) => setUrl(e.target.value)} type="url"
            placeholder="https://example.com/login"
            className="w-full rounded-lg border border-line bg-white p-3" aria-label="Link to check" />
        )}
        {tab === 'image' && (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-white p-8 text-center hover:border-brand">
            {preview ? <img src={preview} alt="Selected screenshot" className="max-h-56 rounded" />
              : <span className="text-muted">Click to choose a screenshot or QR code image</span>}
            {file && <span className="mt-2 text-sm">{file.name}</span>}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
        )}
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-danger/10 p-3 text-danger">{error}</p>}

      <button onClick={handleSubmit} disabled={!ready || loading}
        className="mt-5 w-full rounded-lg bg-brand py-3 font-semibold text-white hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8">
        {loading ? 'Checking...' : 'Check for phishing'}
      </button>
    </section>
  )
}
