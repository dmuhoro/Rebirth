# ai-context/pwa.md — PWA Agent

Authority: Manifest, Service Worker, MediaSession, offline caching, safe-area.

## Manifest (public/manifest.webmanifest)
name, short_name, icons (maskable + standard at required sizes), theme_color, display: standalone, start_url, orientation: portrait.

## Service Worker (public/sw.js)
- Static shell: cache-first, versioned (rebirth-v1).
- API routes: network-first + offline fallback page; NEVER cached.
- Private data (journal/AI): excluded from all caches.

## MediaSession
Feature-detected. Lock-screen metadata (title, artist, artwork, play/pause). Does NOT guarantee Web Speech on lock screen (see ADR-004).

## Safe area
Viewport safeguards + safe-area insets via Tailwind utilities.

## Privacy
No private responses in general caches.
