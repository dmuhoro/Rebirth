// Rebirth Service Worker (Phase 1 — PWA offline-first)
//
// Cache policy (per ADR-002):
//   - Static shell (HTML/CSS/JS): cache-first, versioned cache `rebirth-static-v1`.
//   - API routes (/api/*): network-first with offline fallback; NEVER cached.
//   - Private data (journal/AI responses): excluded from all caches — localStorage/Convex only.
//
// Private and AI API responses are explicitly excluded so sensitive spiritual
// journal text never enters a shared cache.

const CACHE_STATIC = "rebirth-static-v2";
const CACHE_OFFLINE = "rebirth-offline-v2";

// Public static assets to precache for offline meditation.
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon-512x512.png",
];

// Offline fallback page served when network API calls fail offline.
const OFFLINE_FALLBACK = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rebirth — Offline</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background:#0c0e12; color:#f7f4ec; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; padding:16px; text-align:center; }
    h1 { color:#d4af37; margin-bottom:8px; }
    p { color:#b8b3a4; max-width:320px; line-height:1.5; }
    a { color:#e5c158; text-decoration:underline; }
  </style>
</head>
<body>
  <h1>Rebirth — Offline</h1>
  <p>You're offline. Previously opened lessons and Scripture studies remain available. Audio and AI-guided prayer require a connection.</p>
  <p><a href="/">Return home</a></p>
</body>
</html>
`;

// Install: precache static shell.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_STATIC && key !== CACHE_OFFLINE).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: route by request type.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache private or API routes — fail to network, offline fallback for API.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  // Navigation requests: cache-first, offline fallback page.
  if (request.mode === "navigate") {
    event.respondWith(cacheFirstNavigation(request));
    return;
  }

  // Static assets: cache-first.
  event.respondWith(cacheFirstStatic(request));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() };
  }
  const { title = "Rebirth", body = "Your devotional reminder is ready.", url = "/" } = payload;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedUrl = new URL(event.notification.data?.url ?? "/", self.location.origin);
  if (requestedUrl.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => "focus" in client);
      if (existing) {
        return existing.navigate(requestedUrl.href).then(() => existing.focus());
      }
      return self.clients.openWindow(requestedUrl.href);
    }),
  );
});

async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_STATIC);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    return caches.match("/index.html");
  }
}

async function cacheFirstNavigation(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_STATIC);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    return new Response(OFFLINE_FALLBACK, { headers: { "Content-Type": "text/html" } });
  }
}

async function networkFirstApi(request) {
  try {
    const fresh = await fetch(request);
    return fresh;
  } catch (err) {
    // API offline: return a JSON fallback so the client can degrade gracefully.
    return new Response(
      JSON.stringify({ error: "offline", message: "AI and sync features require a connection. Saved reflections remain available locally." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}
