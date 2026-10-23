# PhishGuard PWA testing checklist

## Local production build

Run these commands from the frontend project directory (the directory containing `package.json`):

```bash
npm ci
npm run build
npm run preview
```

Open the local preview URL printed by Vite. Service-worker registration is enabled only for production builds, so the development server does not register it.

## Browser checks

1. Open DevTools → Application → Manifest. Confirm the name, standalone display mode, theme color, and app icon are present.
2. In DevTools → Application → Service Workers, confirm `/sw.js` is registered and active.
3. Reload the app and navigate to `/`, `/analyze`, and `/results`.
4. In DevTools → Network, switch to Offline and reload. The cached app shell should open; scanning itself still requires a network connection to the backend.
5. Return online and verify a message/link analysis still reaches the configured API.
6. Check the Console and Network panels for missing manifest/icon files, service-worker errors, and failed JS/CSS requests.
7. On a supported browser, use the browser's Install app option or the in-app Install PhishGuard button when it appears.

## Notes

- The service worker deliberately does not cache API responses or user-submitted content.
- Do not treat offline shell availability as offline phishing detection: backend analysis requires connectivity.
- This branch has not been built or browser-tested in the GitHub environment. Run the commands above before merging.
- Current icon is a scalable SVG. If the target browser/device requires raster install icons, add and test dedicated 192×192 and 512×512 PNG assets before release.
