# Sprint 002 — Phase 1: PWA Offline-First (complete)

## Goal
Make Rebirth installable and offline-capable for Android/mobile web, with lock-screen audio controls.

## Scope (in this sprint)
- `public/manifest.webmanifest` — app metadata, themed icons, maskable icon, display: standalone
- `public/icons/*.png` — 9 icon sizes (72–512) + maskable + apple-touch-icon
- `public/sw.js` — Service Worker: cache-first static shell, network-first API + offline fallback, private data excluded
- `index.html` — manifest link, theme-color, apple-touch-icon, SW registration script
- `src/index.css` — safe-area insets, reduced-motion support
- `src/components/AudioPlayerBar.tsx` — useMediaSession lock-screen metadata integration
- `src/hooks/useMediaSession.ts` — feature-detected MediaSession (play/pause, artwork)

## Scope (out of this sprint)
- Background Web Speech on lock screen (MediaSession does not keep Web Speech alive — Phase 4 audio assets path)
- Convex auth flows / Google Sign-In (Phase 3 client scaffolding done; auth gate in Convex functions)

## Acceptance criteria
- [ ] `npm run lint` clean
- [ ] `npm run test` green
- [ ] `npm run build` succeeds
- [ ] SW registered on load (no console errors)
- [ ] Static assets precached; API calls return offline JSON fallback
- [ ] Touch targets >= 44px; safe-area padding applied

## Status
Complete — green, ready for Phase 2.
