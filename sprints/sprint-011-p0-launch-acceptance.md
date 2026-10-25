# Sprint 011 — P0 Launch Acceptance

## Goal

Close the four highest-priority launch checks with production evidence: finish
Google sign-in, deploy and smoke-test the current revision, prove authenticated
Convex backup/restore across clients, and verify install/offline/audio behavior
on a physical Android device.

## Results

| P0 acceptance | Result | Evidence / remaining work |
|---|---|---|
| Complete Google sign-in | Blocked | OAuth reached Google's account page, but Google rejected the embedded sign-in browser with "The browser you're using doesn't support JavaScript, or has JavaScript turned off." Retry from a supported external browser; callback completion, account recognition, and reload persistence remain unverified. |
| Latest production deployment | Complete | `main` commit `7093a9c` was deployed to Vercel production (`dpl_2sXBBFUfGMNqgKDKctVUiumz9UTs`), reached `READY`, and the live `/api/health` returned `{"status":"ok","hasApiKey":false}`. The GitHub repository homepage points to the live app. |
| Two-client Convex backup, restore, and deletion | Blocked | Not run. The Android PWA remained in guest mode and neither client was authenticated. No account data was changed. |
| Android install, offline, and lock-screen playback | Partial | Installed PWA confirmed via standalone display mode and a controlling service worker. On-device offline reload plus guest continuation displayed devotional content. Developer confirms foreground audio is audible. With the screen turned off (secure-lock status not verified), speech was active before backgrounding and reported `speaking: false` after 35 seconds; Rebirth did not appear in Android's media-session listing. A Capacitor Android foreground TTS service and playback bridge are now integrated, but the native APK has not yet compiled or been installed. |

## Device and deployment evidence

- Physical Android device connected over ADB; Android 16, Chrome 154.
- PWA loaded from `https://rebirth-devotional.vercel.app/` and launched in
  standalone display mode.
- Active service worker controlled the PWA. Cache included the root/index,
  manifest, icons, deployed JavaScript/CSS bundles, and fonts.
- Android Chrome's per-target offline emulation was enabled; the installed
  PWA reloaded, accepted guest mode offline, and rendered daily contemplation
  and lesson content.
- Latest `main` was deployed to Vercel production and verified READY; the
  production alias served the updated app shell and API health responded
  successfully. Gemini remains unavailable (`hasApiKey:false`).
- Android remote inspection confirmed standalone display mode and an active
  service-worker controller. Narration entered speaking state and advanced
  to 11% before screen-off. After 35 seconds in background it reported
  `speaking: false` and 100% listened; no Rebirth Android media session
  appeared. Developer confirms foreground audio is audible. The device went
  to its home screen when woken, so secure-lock-screen behavior was not
  verified.
- Google sign-in in the shared embedded browser was rejected by Google with
  a JavaScript/browser compatibility message. This is distinct from
  `redirect_uri_mismatch`; retry OAuth in an external supported browser.
- No account data was created, edited, restored, or deleted during testing.
- The current workspace now contains the native Android foreground TTS service,
  Capacitor plugin, and web playback integration. `npm run lint`, `npm test`
  (64 tests), and `npm run build` pass. Android Gradle compilation is blocked
  by the installed Java 21 runtime missing `jlink` and `jmod`; Java 17 tools
  cannot process Android API 36's Java 21 module descriptor. The phone is
  currently connected over ADB (Android 16, model `25078RA3EA`), but no native
  APK has been installed.

## Remaining P0 work

1. Complete Google sign-in from a supported external browser (not the
   rejected embedded browser) and confirm the authenticated account remains
   signed in after reload.
2. With explicit permission, create one synthetic journal entry, manually
   import it to Convex, restore it in a second authenticated browser/device,
   then remove only the test entry. Do not run whole-account deletion as a
   production test.
3. Build the native APK with a complete JDK 21 installation, install it on the
   connected Android 16 device, grant notification permission, and verify an
   offline English voice is selected. Test audible narration with the screen
   securely locked, then validate notification/lock-screen controls and
   progress updates. The prior PWA screen-off check showed Web Speech stop
   reporting active after 35 seconds; foreground audio is confirmed audible
   by the developer.

## Free/open model and tunnel note

Ngrok can provide a temporary route to a development server; it is not a
production host or an AI model and should not be used as the public app's
reliability or privacy boundary. Self-hosted open models can avoid a model
subscription but still require hardware, hosting, operations, and a review of
each model's license. Third-party free inference tiers have changeable quotas
and data terms. Do not send private reflections to a new provider until the
provider, retention/privacy terms, consent copy, and failure behavior are
approved and tested.

## Status

Latest production deployment, Android PWA install, offline guest content,
and audible foreground narration are confirmed. The native Android service is
integrated in the code but remains uncompiled and unverified on-device because
the available Java 21 runtime lacks `jlink`/`jmod`. Google sign-in was
previously blocked by the embedded browser's JavaScript compatibility error;
retry from a supported browser. Authenticated two-client Convex verification
and secure lock-screen/audio acceptance remain open. The screen-off PWA test
stopped reporting speech after 35 seconds, and no Android media session was
observed.
