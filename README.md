## Flow Timer – Pure PWA Wrapper (no native shell)

This repo runs as a Progressive Web App—no Capacitor/Cordova/Xcode wrapper is needed. Install to Home Screen on iOS to get a standalone, full-bleed experience.

### Run locally
1. `npm install`
2. `npm run dev`

### Build
`npm run build` → outputs to `dist/`

### Deploy
- Vercel recommended. SPA rewrites handled via `vercel.json`.

### PWA specifics
- Manifest: `manifest.webmanifest`
- Service Worker: `public/sw.js` (network-first for pages, stale-while-revalidate for assets)
- Safe area: `index.html` + `index.css` handle iOS insets and full-bleed backgrounds.
