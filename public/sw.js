// Minimal service worker to enable PWA install and standalone mode
// Caches are intentionally minimal; app is online-first.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No-op fetch handler to satisfy some browsers' PWA install criteria
self.addEventListener('fetch', () => {});


