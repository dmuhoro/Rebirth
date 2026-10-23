# ADR-002: PWA offline-first with Service Worker, MediaSession, and manifest

## Status
Accepted (Phase 1)

## Context
Rebirth is mobile-first for Android/web. Users meditate on walks, flights, and in poor connectivity. The app currently has no Service Worker, no Web App Manifest, and Web Speech stops on screen lock.

## Decision
Implement a full PWA:
- `public/manifest.webmanifest` — name, short_name, icons (maskable + standard), theme_color, display: standalone, start_url, orientation: portrait.
- Service Worker (`public/sw.js`) — cache-first for static assets (HTML/CSS/JS), network-first for API with offline fallback page, versioned cache keys, no caching of private journal/AI responses.
- `navigator.mediaSession` — feature-detected lock-screen metadata (title, artist, artwork, play/pause handlers) for audio tracks; does NOT claim to keep Web Speech alive on lock screen (see ADR-004 audio note).
- Safe-area insets + mobile viewport safeguards via Tailwind utilities.

## Cache policy
- Static shell (index.html, assets): cache-first, versioned (`rebirth-v1`).
- API routes (`/api/*`): network-first with offline fallback; never cached.
- Private data (journal entries, AI responses): excluded from all caches — stored only in localStorage/Convex.

## Alternatives considered
- **No PWA:** Rejected — violates the mobile/Android requirement and offline meditation use case.
- **Workbox-generated SW:** Deferred — hand-written SW keeps the surface small and auditable for Phase 1.

## Consequences
- Positive: "Add to Home Screen", offline lessons, lock-screen playback controls.
- Negative: MediaSession does not guarantee Web Speech survives screen lock; Phase 4 addresses this with pre-rendered/audio-asset fallback.
