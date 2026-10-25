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
- On Android Chrome, granted notification permission, created a push
  subscription, and received the production test notification. Android's
  notification manager showed the title "Rebirth" and body
  "Notifications are enabled on this device."
- On the connected Xiaomi 25078RA3EA running Android 16, disabled Wi-Fi and
  mobile data and confirmed the page remained offline (`navigator.onLine=false`)
  while cached lesson content was present. Connectivity was restored after
  the test.
- Google sign-in completed in the integrated browser after JWT rotation; the
  Android account panel also remained connected after reload.
- The production PWA page was held open across two deployments and loaded a
  new hashed bundle after reload.
- Existing Sprint 011 evidence confirms Google sign-in and the two-client
  synthetic backup/restore/deletion flow, including propagated deletion.
- `npm test` passes (15 files, 80 tests); `npm run lint` passes; Vercel's
  production build completed successfully.

## Still open / external acceptance

- **Email magic link:** the owner-provided test inbox was used. Resend returned
  HTTP 403 (`validation_error`) because the configured sender domain is
  `gmail.com`, which Resend does not verify for sending. Configure
  `EMAIL_FROM` on a verified domain and repeat the send-and-click flow.
- **Native Android:** the connected phone reports 349 MB free versus Android's
  1 GiB low-storage threshold. No Rebirth WebAPK is installed. Install the
  native APK only after at least 1.2 GB is available, then test offline voice,
  foreground-service controls, and narration with the screen securely locked.
- Chrome's PWA install chooser was opened, but no Rebirth WebAPK package
  appeared afterward; standalone installation is not accepted as complete.
- **Standalone PWA:** Chrome-tab offline content and cross-deployment reload
  were verified. Standalone-WebAPK installation and offline behavior remain
  unverified on this phone.

No device data was deleted. Native Android installation and lock-screen
narration remain blocked by storage. A build, HTTP probe, or configured provider
is not reported as a substitute for user-visible delivery or physical-device
testing.
