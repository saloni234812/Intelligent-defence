const CACHE_NAME = 'aegis-cache-v1';
const API_CACHE = 'aegis-api-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/src/assets/maps/alpha.json',
  '/src/assets/maps/bravo.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => ![CACHE_NAME, API_CACHE].includes(k)).map(k => caches.delete(k))
    ))
  );
});

// Cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/alerts') || url.pathname.startsWith('/maps')) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(API_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw e;
  }
}




