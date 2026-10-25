// Rebirth Service Worker
//
// Cache policy (per ADR-002):
//   - Navigations / app shell: network-first with cached fallback. This is
//     what prevents users being pinned to a stale index.html after a deploy
//     (a cached shell references hashed bundles that no longer exist).
//   - Hashed static assets: cache-first (safe: filenames change per build).
//   - API routes (/api/*): network-only, NEVER cached. Private reflections and
//     AI responses must not enter a shared cache.
//   - Cross-origin requests are not intercepted.
//
// Bump CACHE_VERSION whenever the precache list changes.

const CACHE_VERSION = "v3";
const CACHE_STATIC = `rebirth-static-${CACHE_VERSION}`;
const CACHE_OFFLINE = `rebirth-offline-${CACHE_VERSION}`;

// Public static assets to precache for offline meditation.
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon.svg",
  "/apple-touch-icon.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon-192x192.png",
  "/icons/maskable-icon-512x512.png",
  "/brand/rebirth-mark.svg",
  "/brand/rebirth-logo-horizontal.svg",
  "/brand/rebirth-logo-horizontal-reversed.svg",
];

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

// Install: precache the public shell. skipWaiting would activate immediately;
// navigation is network-first now, so new shells are picked up on the next load
// without risking a stale bundle.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: remove caches from older versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_STATIC && key !== CACHE_OFFLINE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch: route by request type.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache private or API routes.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkOnlyApi(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(cacheFirstStatic(request));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }
  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.slice(0, 120)
      : "Rebirth";
  const body =
    typeof payload.body === "string" && payload.body.trim()
      ? payload.body.slice(0, 300)
      : "Your devotional reminder is ready.";
  const url = typeof payload.url === "string" ? payload.url : "/";
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
  const requestedUrl = new URL(
    event.notification.data?.url ?? "/",
    self.location.origin,
  );
  if (requestedUrl.origin !== self.location.origin) return;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
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
    if (fresh.ok) {
      const cache = await caches.open(CACHE_STATIC);
      await cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    // Never return the HTML shell for a failed script/style/image request:
    // that produces confusing MIME errors instead of a clean network failure.
    return new Response("", { status: 504, statusText: "Gateway Timeout" });
  }
}

async function networkFirstNavigation(request) {
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(CACHE_STATIC);
      await cache.put(request, fresh.clone());
      await cache.put("/index.html", fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached =
      (await caches.match(request)) || (await caches.match("/index.html"));
    if (cached) return cached;
    return new Response(OFFLINE_FALLBACK, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

async function networkOnlyApi(request) {
  try {
    return await fetch(request);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "offline",
        message:
          "AI and backup features require a connection. Saved reflections remain available locally.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
}
