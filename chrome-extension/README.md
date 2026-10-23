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
- No live threat-intelligence/domain-reputation feed; a low score is not proof a URL is safe.
- Only submit URLs you are comfortable sending to the backend. Avoid URLs containing private tokens or personal data.
- First scan may take longer if the hosted backend is waking up.

## Troubleshooting

Backend health: https://phishguard-api-b4hf.onrender.com/health
API schema: https://phishguard-api-b4hf.onrender.com/docs