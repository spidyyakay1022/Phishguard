# PhishGuard AI — Chrome Extension MVP

A Manifest V3 popup that sends the **current tab URL only** to the existing PhishGuard `/analyze` API and displays the risk score, verdict, explanation, and indicators.

## Install locally (Chrome)

1. Open Chrome and visit `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository's `chrome-extension` folder.
5. Open an ordinary website, click the PhishGuard extension icon, then click **Scan current website**.

## Features

- Manual scan of the current HTTP/HTTPS tab URL.
- Risk score, verdict, explanation and available indicators.
- Stores up to 10 recent scan results in Chrome local extension storage.
- Does not read page contents, passwords, cookies, or form fields.

## Limitations

- Local MVP, not published to the Chrome Web Store.
- Does not automatically block or monitor websites.
- Google Safe Browsing lookup is supported when the backend environment variable `GOOGLE_SAFE_BROWSING_API_KEY` is configured. Without the key, URLs without strong warning signs remain **UNVERIFIED**; a low score is not proof a URL is safe.
- Only submit URLs you are comfortable sending to the backend. Avoid URLs containing private tokens or personal data.
- First scan may take longer if the hosted backend is waking up.

## Troubleshooting

Backend health: https://phishguard-api-b4hf.onrender.com/health
API schema: https://phishguard-api-b4hf.onrender.com/docs

## Enable live URL reputation checks (recommended)

1. Create a Google Safe Browsing API key in Google Cloud Console and enable the **Safe Browsing API** for that project.
2. In the Render dashboard, open the existing PhishGuard backend web service.
3. Open **Environment** and add:
   - Key: `GOOGLE_SAFE_BROWSING_API_KEY`
   - Value: your Google Safe Browsing API key
4. Save changes and wait for the backend to redeploy.
5. Test a known safe URL and a URL confirmed by Google Safe Browsing test guidance. A no-match result is still not a guarantee that a URL is safe.

Never put the API key in frontend or Chrome extension files, and do not commit it to GitHub.
