# Sprint 013 — Production Acceptance Closeout

Date: 2026-10-25

## Completed

- Deployed the current `main` revision to Vercel production as
  `dpl_9TX7zbnfKWkwrxnj3Nh4yVNTxgEk`; verified live CSP/security headers,
  `/api/health` (`200`, `{"status":"ok","hasApiKey":false}`), and JSON/no-store
  `404` for an unknown API path.
- Rotated the production Convex JWT signing key and matching JWKS. The initial
  JWKS encoding was corrected immediately. The public, region-specific JWKS
  endpoint now returns valid RSA/RS256 JSON. Existing users may need to
  authenticate again; the browser account panel remained connected after reload.
- Configured a VAPID key pair in production Convex and the public VAPID key in
  Vercel. Deployed `dpl_4xdXSS4WFLNkUKHUELwMuuFAxfoo`; the production browser
  loaded the new bundle after reload (`index-D8iQLO4X.js` to
  `index-DV_8C6gs.js`).
- The authenticated push test reached the expected no-subscription guard,
  confirming the backend has VAPID configuration. No notification was sent.
- Existing Sprint 011 evidence confirms Google sign-in and the two-client
  synthetic backup/restore/deletion flow, including propagated deletion.
- `npm test` passes (15 files, 80 tests); `npm run lint` passes; Vercel's
  production build completed successfully.

## Still open / external acceptance

- **Email magic link:** production Resend variables are configured, but sending
  and receiving a live link requires an owner-provided test inbox.
- **Web Push delivery:** VAPID keys are configured, but the integrated browser
  blocks notification permission. A permitted device must subscribe and receive
  the test notification.
- **Native Android:** the last connected check showed 411 MB free versus
  Android's 1 GiB low-storage threshold; the device then disconnected. Install
  the APK only after at least 1.2 GB is available, then test offline voice,
  notification controls, and narration with the screen securely locked.
- **Standalone PWA:** page reload across two production deployments picked up a
  new hashed bundle, but standalone/offline behavior after this deployment
  still needs physical-device acceptance.
- **Fresh OAuth:** the public JWKS endpoint is valid and the current account
  remains connected after reload. Complete a new Google OAuth login to verify
  token issuance after key rotation.

No device data was deleted. A build, HTTP probe, or configured provider is not
reported as a substitute for user-visible delivery or physical-device testing.
