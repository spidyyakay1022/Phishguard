import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Tesseract from 'tesseract.js'
import jsQR from 'jsqr'
import { analyze } from '../lib/api.js'

const TABS = [
  { id: 'text', label: 'Message' },
  { id: 'url', label: 'Link' },
  { id: 'image', label: 'Screenshot or QR' },
]
const MAX_FILE_BYTES = 5 * 1024 * 1024

function findUrls(text) {
  const matches = text.match(/https?:\\/\\/\\S+|www\\.\\S+|\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)+(?:\\/\\S*)?/gi) || []
  return [...new Set(matches.map((url) => url.replace(/[.,;:!?]+$/, '')))]
}
async function readImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose a valid image file.')
  if (file.size > MAX_FILE_BYTES) throw new Error('Image must be 5 MB or smaller.')
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = objectUrl
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('Could not open this image.')) })
    return { image, objectUrl }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

async function decodeQr(file) {
  const { image, objectUrl } = await readImage(file)
  try {
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, 1800 / image.width)
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d', { willReadFrequently: true })
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' })
    if (!code?.data) throw new Error('No QR code found. Try a clearer, tightly cropped image.')
    return code.data
  } finally { URL.revokeObjectURL(objectUrl) }
}

async function extractText(file, onProgress) {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (message) => { if (message.status === 'recognizing text') onProgress(Math.round(message.progress * 100)) },
  })
  const text = (result.data.text || '').trim()
  if (!text) throw new Error('No readable text found. Try a sharper screenshot.')
  return text
}

export default function Analyze() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [imageMode, setImageMode] = useState('screenshot')
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) { setPreview(null); return undefined }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const ready = (tab === 'text' && text.trim()) || (tab === 'url' && url.trim()) || (tab === 'image' && file)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    setProgress('Preparing analysis…')
    try {
      let content
      let type
      if (tab === 'text') { content = text; type = 'message' }
      else if (tab === 'url') { content = url; type = 'link' }
      else {
        if (!file.type.startsWith('image/')) throw new Error('Choose a valid image file.')
        if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5 MB or smaller.')
        if (imageMode === 'qr') {
          setProgress('Reading QR code in your browser…')
          content = await decodeQr(file)
          type = 'link'
        } else {
          setProgress('Reading screenshot text… first use may take a little longer.')
          content = await extractText(file, (percent) => setProgress(`Reading screenshot text… ${percent}%`))
          type = 'message'
        }
      }
      setProgress('Checking for phishing indicators…')
      const result = await analyze({ type, content })
      result.extracted_content = tab === 'image' ? content : null
      result.extracted_urls = findUrls(content)
      result.input_type = type
      sessionStorage.setItem('phishguard-result', JSON.stringify(result))
      navigate('/results', { state: { result } })
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your connection and try again.')
    } finally { setLoading(false); setProgress('') }
  }

  return (
    <section className="mx-auto max-w-2xl py-8">
      <h1 className="font-display text-3xl font-extrabold">What do you want to check?</h1>
      <p className="mt-2 text-sm text-muted">Analysis is a warning aid, not a guarantee. Do not paste passwords, OTPs, or other private secrets.</p>
      <div role="tablist" aria-label="Content type" className="mt-6 flex flex-wrap gap-2 border-b border-line">
        {TABS.map((item) => <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => { setTab(item.id); setError('') }} className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${tab === item.id ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{item.label}</button>)}
      </div>
      <div className="mt-5">
        {tab === 'text' && <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={5000} rows={8} placeholder="Paste the email, SMS or chat message here" className="w-full rounded-lg border border-line bg-white p-3" aria-label="Message text" />}
        {tab === 'url' && <input value={url} onChange={(e) => setUrl(e.target.value)} maxLength={5000} type="text" placeholder="https://example.com/login" className="w-full rounded-lg border border-line bg-white p-3" aria-label="Link to check" />}
        {tab === 'image' && <div className="rounded-lg border-2 border-dashed border-line bg-white p-6 text-center">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3">
            {preview ? <img src={preview} alt="Selected screenshot preview" className="max-h-56 rounded object-contain" /> : <span className="text-muted">Choose a screenshot or QR image (max 5 MB)</span>}
            <span className="rounded-lg border border-line px-4 py-2 text-sm font-semibold">Browse image</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] || null); setError('') }} />
          </label>
          {file && <p className="mt-3 break-all text-sm text-muted">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" name="imageMode" value="screenshot" checked={imageMode === 'screenshot'} onChange={() => setImageMode('screenshot')} /> Screenshot text (OCR)</label><label className="flex items-center gap-2"><input type="radio" name="imageMode" value="qr" checked={imageMode === 'qr'} onChange={() => setImageMode('qr')} /> QR code link</label></div>
          <p className="mt-2 text-xs text-muted">QR links are analysed as text and never opened automatically.</p>
        </div>}
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-danger/10 p-3 text-danger">{error}</p>}
      {loading && <p role="status" aria-live="polite" className="mt-4 text-sm text-muted">{progress}</p>}
      <button onClick={handleSubmit} disabled={!ready || loading} className="mt-5 w-full rounded-lg bg-brand py-3 font-semibold text-white hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8">{loading ? 'Checking…' : 'Check for phishing'}</button>
    </section>
  )
}
