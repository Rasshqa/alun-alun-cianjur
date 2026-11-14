const SHELL = 'shell-v6';
const TILES = 'tiles-v2';
const PHOTOS = 'photos-v2';
const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sadaya-logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/alun-alun-overlay.svg',
];
const TILE_MAX = 150;
const PHOTO_MAX = 70;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  const keep = new Set([SHELL, TILES, PHOTOS]);
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('openstreetmap') ||
    url.hostname.includes('tile.')
  ) {
    e.respondWith(cacheFirst(e.request, TILES, TILE_MAX));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/photos/')) {
    e.respondWith(cacheFirst(e.request, PHOTOS, PHOTO_MAX));
    return;
  }

  e.respondWith(networkFirst(e.request, SHELL));
});

async function cacheFirst(req, name, maxEntries) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const cache = await caches.open(name);
    await cache.put(req, res.clone());
    await trimCache(cache, maxEntries);
  }
  return res;
}

async function networkFirst(req, name) {
  const cache = await caches.open(name);
  try {
    const res = await fetch(req);
    if (res.ok) {
      await cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function trimCache(cache, max) {
  const keys = await cache.keys();
  const excess = keys.length - max;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}
