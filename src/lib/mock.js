// Fake analyzer so the UI works before the backend is ready.
export function mockAnalyze({ type, content }) {
  const text = (typeof content === 'string' ? content : 'screenshot').toLowerCase()
  const findings = []
  let score = 8

  if (/urgent|immediately|within 24|suspended|last warning|act now/.test(text)) {
    score += 25
    findings.push({ title: 'Urgency language', severity: 'medium', detail: 'The message pressures you to act fast. Scammers do this so you do not stop to think.' })
  }
  if (/password|otp|card number|cvv|bank|account|kyc|pan\b|aadhaar/.test(text)) {
    score += 30
    findings.push({ title: 'Asks for sensitive information', severity: 'high', detail: 'Real companies do not ask for passwords, OTPs or card details through messages or links.' })
  }
  const url = text.match(/https?:\/\/[^\s]+|\b[a-z0-9-]+\.(xyz|top|click|ru|tk|info)\b/)
  let url_analysis = null
  if (url) {
    score += 25
    const domain = url[0].replace(/^https?:\/\//, '').split('/')[0]
    url_analysis = { domain, issues: ['Domain is not a well-known official site', 'May use look-alike spelling or an unusual ending'] }
    findings.push({ title: 'Suspicious domain', severity: 'high', detail: `${domain} does not look like an official website.` })
  }
  let impersonating = null
  if (/paypal|amazon|sbi|hdfc|icici|paytm|google|microsoft|netflix/.test(text)) {
    score += 15
    impersonating = text.match(/paypal|amazon|sbi|hdfc|icici|paytm|google|microsoft|netflix/)[0]
    findings.push({ title: 'Possible impersonation', severity: 'medium', detail: `The message mentions ${impersonating}, but the link or sender may not belong to them.` })
  }
  if (type === 'image') findings.push({ title: 'Screenshot received', severity: 'low', detail: 'Mock mode cannot read images. The real backend will extract the text and analyze it.' })

  score = Math.min(score, 98)
  if (findings.length === 0) findings.push({ title: 'No red flags found', severity: 'low', detail: 'Nothing suspicious was detected, but stay careful with unexpected messages.' })

  return new Promise((resolve) =>
    setTimeout(() => resolve({
      risk_score: score,
      summary: score >= 70 ? 'This looks like a phishing attempt. Do not click anything or reply.'
        : score >= 35 ? 'Some parts look suspicious. Verify with the sender through an official channel.'
        : 'This looks fairly safe, but always double-check unexpected requests.',
      findings, url_analysis, impersonating,
      next_steps: score >= 35
        ? ['Do not click links or open attachments', 'Do not share passwords, OTPs or card details', 'Contact the company using the number on its official website', 'Report and delete the message']
        : ['Keep an eye out for unexpected requests', 'Visit sites by typing the address yourself'],
    }), 1200)
  )
}
