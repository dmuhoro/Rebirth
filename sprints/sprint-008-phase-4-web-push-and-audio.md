# Sprint 008 — Phase 4 Closeout: Web Push & Background Audio

## Delivered
- Per-user, per-device Web Push subscription storage with ownership enforcement.
- Opt-in browser permission flow, authenticated test-notification action, stale
  endpoint cleanup, service-worker notification display, and same-origin click routing.
- VAPID configuration contract documented in `.env.example` and `README.md`.
- Media Session play, pause, previous, and next actions now invoke the player
  instead of remaining no-ops.

## Acceptance still requiring external setup
- VAPID public/private keys and subject must be configured on the frontend and
  Convex deployments before a real notification can be delivered.
- The Android lock-screen/background behavior must be confirmed on a physical
  device. Web Speech may be suspended by the browser when locked.
- Pre-rendered narration assets are not included. No approved voice, source
  recordings, or configured TTS provider is available in this workspace; do not
  silently substitute generated audio of unverified quality or licensing.

## Verification
- `npm run lint`
- `npm test`
- `npm run build`
- `npx convex codegen`

## Status
Push implementation is complete. Live delivery, device verification, and
pre-rendered audio assets remain pending the external setup above.

Production app and Convex code are deployed. The production Convex environment
currently has no auth, email, or VAPID variables configured, so live sign-in and
push delivery are intentionally not reported as verified.
