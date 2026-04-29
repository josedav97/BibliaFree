const CACHE_NAME = 'biblia-v1';
const ASSETS = [
  '/BibliaFree/',
  '/BibliaFree/index.html',
  '/BibliaFree/manifest.json',
  '/BibliaFree/icon-192.svg',
  '/BibliaFree/icon-512.svg',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets:', ASSETS);
      return cache.addAll(ASSETS).then(() => {
        console.log('[SW] All assets cached');
      }).catch((err) => {
        console.warn('[SW] Cache addAll error (non-fatal):', err);
      });
    })
  );
  self.skipWaiting();
  console.log('[SW] Skip waiting');
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('[SW] Clearing old caches:', keys);
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
  console.log('[SW] Clients claimed');
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.hostname === 'bible-api.deno.dev') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
