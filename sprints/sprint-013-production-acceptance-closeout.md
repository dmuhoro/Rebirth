# Sprint 013 — Production Acceptance Closeout

Date: 2026-10-25; updated 2026-10-26

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
- Installed Rebirth as a Chrome WebAPK
  (`org.chromium.webapk.a65924abe5097642f_v2`, label `Rebirth`, installed
  2026-10-26 19:12). It launches standalone with `/sw.js` active; the account
  persisted, warm and cold-start offline loading passed, and an FCM push
  subscription received the production test notification. Foreground TTS
  starts, but narration stops when the screen sleeps.
- Google sign-in completed in the integrated browser after JWT rotation; the
  Android account panel also remained connected after reload.
- The production PWA page was held open across two deployments and loaded a
  new hashed bundle after reload.
- Existing Sprint 011 evidence confirms Google sign-in and the two-client
  synthetic backup/restore/deletion flow, including propagated deletion.
- `npm test` passes (15 files, 80 tests); `npm run lint` passes; Vercel's
  production build completed successfully.
- Convex production now logs a bounded, email-redacted Resend rejection reason;
  the diagnostic code was typechecked and deployed without logging the
  recipient address or sign-in URL.

## Still open / external acceptance

- **Email magic link:** the owner-provided test inbox was used. Resend returned
  HTTP 403 (`validation_error`) because the configured sender domain is
  `gmail.com`, which Resend does not verify for sending. Configure
  `EMAIL_FROM` on a verified domain and repeat the send-and-click flow.
- **Lock-screen narration:** the installed WebAPK starts foreground browser
  speech but stops when the screen sleeps (after 45 seconds: `speaking=false`,
  page hidden). A temporary native APK probe showed the foreground
  `BackgroundNarrationService` survives 45 seconds, but that APK was uninstalled
  and the Capacitor service is not part of the WebAPK. If lock-screen narration
  is required, ship and install the native wrapper and repeat acceptance.
- **Human device checks:** confirm foreground narration is audible and tap the
  delivered notification to verify it opens Rebirth.

No device data was deleted. WebAPK installation, standalone launch, account,
warm/cold offline loading, and Web Push delivery are verified. Lock-screen
narration is not available in the WebAPK; it requires the native wrapper. A
build, HTTP probe, or configured provider is not reported as a substitute for
user-visible delivery or physical-device testing.
