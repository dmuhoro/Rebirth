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
| Android install, offline, and lock-screen playback | Partial — WebAPK installed; offline and push pass; lock-screen narration fails | Rebirth is installed as a Chrome WebAPK (`org.chromium.webapk.a65924abe5097642f_v2`, label `Rebirth`, installed 2026-10-26 19:12) and launches standalone with `/sw.js` active. The account remained connected; warm reload and cold start with Wi-Fi and mobile data disabled both rendered cached content; notification permission, an FCM subscription, and a production test notification were verified. Foreground `Listen (TTS)` set `speechSynthesis.speaking=true` with 92 voices, but after 45 seconds with the screen off speech had stopped and the page was hidden. The Capacitor foreground service was probed only in a temporary APK that was uninstalled; it is not part of the WebAPK. Audible output and notification-tap routing still need a human check. |

## Device and deployment evidence

- Physical device is a Xiaomi 25078RA3EA running Android 16. The 2026-10-25
  `adb shell df -h /data` measurement reported 670 MB available against
  Android's `lowBytes=1048576000`; on 2026-10-26 it reported 4.2 GB free. A
  temporary debug APK was installed for the foreground-service probe and
  removed; the installed app is the Chrome WebAPK recorded below. No device
  data was deleted by this work.
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
- Chrome installed Rebirth from its "Install and create shortcut" flow as a
  Chrome WebAPK. The APK reports label `Rebirth`, package
  `org.chromium.webapk.a65924abe5097642f_v2`, and `firstInstallTime` /
  `lastUpdateTime` 2026-10-26 19:12. It launches in standalone display mode.
- The installed WebAPK remained usable offline: a warm reload and a cold start
  after force-stopping Chrome, both with Wi-Fi and mobile data disabled,
  rendered cached daily content with `navigator.onLine=false` and `/sw.js`
  controlling the page. Radios were restored after each test.
- The WebAPK account panel reports "Account connected" and Convex auth tokens
  are present after reload. Notification permission was granted, an FCM push
  subscription was created, and the production test notification reported
  "sent to 1 device(s)" and was posted by
  `org.chromium.webapk.a65924abe5097642f_v2`. The account persisted across the
  production JWT key rotation.
- Tapping `Listen (TTS)` in the WebAPK set `speechSynthesis.speaking=true` with
  92 installed voices. After 45 seconds with the screen confirmed off,
  `speaking` was false and the page was hidden; WebAPK narration does not
  survive screen lock.
- The synthetic entry was visible in Android Journal after restore. Its local
  deletion produced `0` journal imports, `1` progress record, and `1` applied
  journal deletion in the Android manual-backup result. Desktop restore then
  showed `0` journals and preserved the single lesson-progress record.
- `npm run lint`, `npm test` (15 files, 80 tests), and `npm run build` pass.
  The build retains existing large-chunk and dependency-comment warnings.
- **Temporary native probe (APK no longer installed):** Native Android
  `:app:assembleDebug` succeeded with JDK 21. The 4.4 MB APK reports
  `versionName 1.3.1` and `targetSdk 36`. On 2026-10-26 the device reconnected
  with 4.2 GB free; `adb install -r` reported `Success` and the package's
  `lastUpdateTime` was `2026-10-26 18:35:30`. The activity launched to the auth
  screen and guest mode rendered the lesson list.
- Tapping `Listen (TTS)` on “The Mystery of Qavah: Waiting on the Lord”
  started `com.dmuhoro.rebirth/.BackgroundNarrationService` with action
  `com.dmuhoro.rebirth.PLAY`, `isForeground=true`, foreground id `4107`, type
  `0x00000002` (media playback), and a `rebirth_audio` notification. The
  notification exposed Pause, Previous, Next, and Stop actions.
- `dumpsys media_session` showed session `RebirthNarration`
  (`com.dmuhoro.rebirth`) in `PLAYING` state with the lesson title, app name,
  and subtitle. `dumpsys power` confirmed `mWakefulness=Asleep` and
  `mIsScreenOn=false`; after 45 seconds the service was still foreground, the
  media session remained active, and Google TTS was still loading its local
  `en-gb` superpack files. The earlier browser-screen-off 35-second stop was
  not reproduced on the native path.
- A media STOP key while locked stopped `BackgroundNarrationService` and
  cleared its notification. Pause/resume could not be tapped because the phone
  requires a PIN that was not entered; the same `ACTION_PAUSE`/`ACTION_RESUME`
  service intents back the notification buttons.
- The temporary APK was uninstalled after the probe. Its 45-second locked-screen
  service evidence is historical and does not describe the installed WebAPK.
- On 2026-10-26, `npm run lint`, `npx tsc -p convex/tsconfig.json --noEmit`,
  `npm test` (15 files, 80 tests), `npm run build`, and Android
  `lintDebug` all passed.

## Remaining P0 work

1. On the installed WebAPK, have a human confirm foreground narration is
   audible and tap the delivered notification to verify it opens Rebirth.
2. Decide whether lock-screen narration is required. The WebAPK stops speech
   when the screen sleeps; that capability requires the native wrapper build,
   which is not currently installed.
3. If the native wrapper is chosen, install it and repeat the locked-screen,
   notification-action, offline-voice, and progress-update checks.

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
restore, and deletion cycle are verified. The Rebirth WebAPK is installed and
launches standalone; account, warm/cold offline behavior, and Web Push delivery
are verified on-device. Foreground narration starts, but it stops when the
screen sleeps, so lock-screen narration is not available in the WebAPK. Audible
output and notification-tap routing remain human checks. No device data was
removed.
