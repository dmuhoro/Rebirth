# Sprint 011 — P0 Launch Acceptance

## Goal

Close the four highest-priority launch checks with production evidence: finish
Google sign-in, deploy and smoke-test the current revision, prove authenticated
Convex backup/restore across clients, and verify install/offline/audio behavior
on a physical Android device.

## Results

| P0 acceptance | Result | Evidence / remaining work |
|---|---|---|
| Complete Google sign-in | Complete | Production Google OAuth returned to Rebirth on desktop and Android Chrome. Both account panels reported "Account connected" after reload. The UI does not display the account email, so no identity string was collected. |
| Latest production deployment | Complete | Vercel production deployment `dpl_4xdXSS4WFLNkUKHUELwMuuFAxfoo` reached `READY`; the production alias served the updated bundle, and `/api/health` returned `{"status":"ok","hasApiKey":false}`. CSP/security headers and JSON/no-store API 404 were verified live. |
| Two-client Convex backup, restore, and deletion | Complete | The primary client imported one synthetic entry; Android restored and displayed it. Deleting only that entry on Android and importing local data applied one cloud deletion while preserving one lesson-progress record. A primary-client restore then reported 0 journal entries and 1 progress record; the test entry is absent from both local archives and cloud. |
| Android install, offline, and lock-screen playback | Partial | Android Chrome loaded the production app and showed the authenticated account. With Wi-Fi and mobile data disabled, cached guest lesson content still loaded. A production test push reached Android Chrome. Native APK installation and lock-screen playback remain blocked by 469 MB free against Android's 1 GiB low-storage threshold; no Rebirth WebAPK is currently installed. The earlier PWA screen-off check stopped reporting speech after 35 seconds. |

## Device and deployment evidence

- Physical device is a Xiaomi 25078RA3EA running Android 16. The latest
  `adb shell df -h /data` measurement reports 469 MB available; Android reports
  `lowBytes=1048576000`. No device data was deleted.
- Production Google sign-in completed in Android Chrome using the same account
  as the desktop. The account panel reported "Account connected" before and
  after a Chrome reload. No account email or credentials were recorded.
- Production `/api/health` returned `{"status":"ok","hasApiKey":false}`.
  The synthetic reflection received the deterministic fallback, not a Gemini
  model response.
- On the primary browser, local state had no journal entries before the test.
  It had no progress, completion, bookmark, or favorite records and one
  pre-existing local journal-deletion marker. Import applied zero cloud
  deletions and preserved existing cloud records.
- The authenticated production account remained connected after a full reload.
  The account panel does not display an email address; credentials were not
  recorded.
- Vercel deployed the latest accepted production revision
  (`dpl_4xdXSS4WFLNkUKHUELwMuuFAxfoo`). The responsive account dialog was
  visible and scrollable on the Android viewport in the earlier acceptance.
- On 2026-10-25, live production checks confirmed CSP/security headers, the
  health endpoint, and JSON/no-store behavior for unknown API routes.
- The PWA was held open across two production deployments. Reload changed its
  main bundle from `index-D8iQLO4X.js` to `index-DV_8C6gs.js`; this verifies
  page reload update behavior, not standalone-PWA offline behavior.
- On Android Chrome, the app remained usable with `navigator.onLine=false`:
  the cached shell loaded and lesson content was present. Wi-Fi and mobile data
  were re-enabled immediately after the test.
- Android Chrome granted notification permission, registered a push
  subscription, and received the production test notification. The account
  panel continued to report "Account connected" after the production JWT key
  rotation.
- The synthetic entry was visible in Android Journal after restore. Its local
  deletion produced `0` journal imports, `1` progress record, and `1` applied
  journal deletion in the Android manual-backup result. Desktop restore then
  showed `0` journals and preserved the single lesson-progress record.
- `npm run lint`, `npm test` (15 files, 80 tests), and `npm run build` pass.
  The build retains existing large-chunk and dependency-comment warnings.
- Native Android `:app:assembleDebug` succeeded with JDK 21. The 4.4 MB APK
  reports `versionName 1.3.1` and `targetSdk 36`; it has not been installed
  because Android is below its low-storage threshold and later disconnected.

## Remaining P0 work

1. Free at least 1 GiB on the phone (or use another device), install the native
   APK, grant notification permission, and verify an offline English voice.
   Test audible narration with the screen securely locked and verify
   notification controls and progress updates.

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

Google sign-in, production deployment, and the two-client Convex backup,
restore, and deletion cycle are verified. Android Chrome offline guest content
and production Web Push delivery are verified on-device. Native APK install and
lock-screen narration remain blocked by insufficient storage; no device data
was removed.
