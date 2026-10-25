# Sprint 011 — P0 Launch Acceptance

## Goal

Close the four highest-priority launch checks with production evidence: finish
Google sign-in, deploy and smoke-test the current revision, prove authenticated
Convex backup/restore across clients, and verify install/offline/audio behavior
on a physical Android device.

## Results

| P0 acceptance | Result | Evidence / remaining work |
|---|---|---|
| Complete Google sign-in | Complete | Production Google OAuth returned to Rebirth. After a full page reload, the account panel reported "Account connected." The UI does not display the account email, so no identity string was collected. |
| Latest production deployment | Pending | The current production app is healthy; deploy the latest committed frontend after the small-screen account-dialog fix is committed. |
| Two-client Convex backup, restore, and deletion | Partial | A synthetic no-personal-data entry was created in the primary browser and manually imported. Convex reported 1 journal entry, 0 progress records, 0 bookmarks, and 0 cloud deletions applied. The Android browser is open at the sign-in page; same-account sign-in, cloud restore, and test-entry deletion propagation remain. |
| Android install, offline, and lock-screen playback | Partial | Earlier PWA evidence confirmed standalone installation and cached offline guest content. The Android 16 phone is connected and opened the live app in Chrome, but remains at sign-in. Native Android app compilation succeeded; installation and native lock-screen playback are blocked by 247 MB free against Android's 1 GiB low-storage threshold. The earlier PWA screen-off check stopped reporting speech after 35 seconds. |

## Device and deployment evidence

- Physical device is a Xiaomi 25078RA3EA running Android 16. Current free space
  is 247 MB; Android reports `lowBytes=1048576000`. No device data was deleted.
- The live site opened in Android Chrome and displayed its sign-in page. The
  device is a separate browser client; it has not yet been authenticated to the
  same account.
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
- `npm run lint`, `npm test` (15 files, 80 tests), and `npm run build` pass.
  The build retains existing large-chunk and dependency-comment warnings.
- Native Android `:app:assembleDebug` succeeded with JDK 21. The APK has not
  been installed because Android is below its low-storage threshold.

## Remaining P0 work

1. Deploy the latest committed frontend to Vercel and verify the health
   endpoint and responsive account dialog.
2. Sign the Android Chrome client into the same account, restore the synthetic
   cloud record, verify its text, delete only that synthetic record, manually
   back up the deletion marker, then restore on the primary client and confirm
   the test entry is absent. Preserve every unrelated user record.
3. Free at least 1 GiB on the phone (or use another device), install the native
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

Google sign-in and first-client manual Convex import are now verified. The
second-client restore/deletion cycle, latest Vercel deployment, and native
Android lock-screen acceptance remain open. The PWA screen-off test stopped
reporting speech after 35 seconds. The connected phone's storage reserve
prevents installing the successfully built native APK; no device data was
removed.
