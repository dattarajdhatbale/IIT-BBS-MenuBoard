// Bump this version string whenever you change cached files,
// so old caches get cleared and users get the update.
const CACHE_NAME = "menuboard-cache-v1";

// The "app shell" — static files needed for the UI to load offline.
// NOTE: We deliberately do NOT cache the Google Sheet data URL,
// since menu data should always be fetched fresh from the network.
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/images/logo.png",
  "/images/icon-192.png",
  "/images/icon-512.png"
];

// Install: pre-cache the app shell, then activate immediately.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean up old cache versions, take control of open tabs.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for app shell files, network-first for everything else
// (so the live Google Sheet menu data is never served stale from cache).
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests from our own origin's app shell files.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // If offline and not cached, fall back to the cached index page.
        return caches.match("/index.html");
      });
    })
  );
});
