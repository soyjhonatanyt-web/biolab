const CACHE = "biolab-offline-v11-pages-root";
const ASSETS = ["./", "./index.html", "./styles.css?v=aprende-1", "./learn.css?v=aprende-1", "./editorial.css?v=scope-3", "./config.js?v=sheets-1", "./evaluation-sync.js?v=sheets-1", "./learn.js?v=scope-3", "./assessment.js?v=assessment-4", "./app.js?v=scope-3", "./favicon.svg", "./manifest.webmanifest"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("biolab-offline-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    if (event.request.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
    return Response.error();
  }));
});
