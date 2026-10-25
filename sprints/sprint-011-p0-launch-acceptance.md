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
| Android install, offline, and lock-screen playback | Partial | Earlier PWA evidence confirmed standalone installation and cached offline guest content. Android Chrome loaded the production app, signed in, restored/deleted the test entry, and retained the account after reload. Native Android app compilation succeeded; native installation and lock-screen playback are blocked by the last observed 411 MB free against Android's 1 GiB low-storage threshold. The earlier PWA screen-off check stopped reporting speech after 35 seconds. |

## Device and deployment evidence

- Physical device is a Xiaomi 25078RA3EA running Android 16. The last
  `adb shell df -h /data` measurement reported 411 MB available; Android reports
  `lowBytes=1048576000`. The phone later disconnected. No device data was deleted.
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
restore, and deletion cycle are verified. Earlier PWA install/offline evidence
remains valid, and page reload picked up the latest deployed bundle. Native
Android lock-screen acceptance is still blocked by insufficient storage and
the disconnected device; no device data was removed.
