const SHELL = 'shell-v4';
const TILES = 'tiles-v1';
const SHELL_URLS = ['/', '/index.html', '/manifest.json', '/alun-alun-overlay.svg'];
const TILE_MAX = 150;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL && k !== TILES).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (url.hostname.includes('openstreetmap') || url.hostname.includes('tile.')) {
    e.respondWith(cacheFirst(e.request, TILES));
    return;
  }

  e.respondWith(networkFirst(e.request, SHELL));
});

async function cacheFirst(req, name) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const cache = await caches.open(name);
    cache.put(req, res.clone());
    trimCache(name, TILE_MAX);
  }
  return res;
}

async function networkFirst(req, name) {
  const cache = await caches.open(name);
  try {
    const res = await fetch(req);
    if (res.ok) {
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw new Error('Offline and not in cache');
  }
}

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) {
    await cache.delete(keys[0]);
    trimCache(name, max);
  }
}
