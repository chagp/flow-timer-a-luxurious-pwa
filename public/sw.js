/* Simple runtime service worker for Flow Timer PWA
   - Caches shell assets on first use
   - Network-first for navigation (HTML)
   - Stale-while-revalidate for static assets
*/
const CACHE_PREFIX = 'flow-timer-cache-';
const CACHE_VERSION = 'v2';
const RUNTIME_CACHE = `${CACHE_PREFIX}${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k.startsWith(CACHE_PREFIX) && k !== RUNTIME_CACHE) ? caches.delete(k) : undefined));
      await self.clients.claim();
    })()
  );
});

// Network-first for navigation requests
async function handleNavigation(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback to root
    return caches.match('/index.html');
  }
}

// Stale-while-revalidate for other GET requests
async function handleAsset(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached || fetchPromise;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (request.mode === 'navigate' || (request.destination === 'document')) {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Ignore non-http(s)
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(handleAsset(request));
});


