# Sprint 011 — P0 Launch Acceptance

## Goal

Close the four highest-priority launch checks with production evidence: finish
Google sign-in, deploy and smoke-test the current revision, prove authenticated
Convex backup/restore across clients, and verify install/offline/audio behavior
on a physical Android device.

## Results

| P0 acceptance | Result | Evidence / remaining work |
|---|---|---|
| Complete Google sign-in | Partial | Developer reported Google now gets past `redirect_uri_mismatch`. Persisted sign-in state and a return to the account screen were not independently observed. |
| Latest production deployment | Complete | Current `main` was deployed to Vercel production. Deployment reached `READY`; `/api/health` returned `{"status":"ok","hasApiKey":false}`. The GitHub repository homepage points to the live app. |
| Two-client Convex backup, restore, and deletion | Blocked | Not run. The Android PWA remained in guest mode, a second client was not authenticated, and no disposable account-data test was authorized. No user data was changed. |
| Android install, offline, and lock-screen playback | Partial | Installed PWA confirmed via standalone display mode. Service worker controlled the app and cached the shell/assets. On-device offline reload plus guest continuation displayed devotional content. During a short screen-off check, browser Web Speech reported `speaking: true`; Rebirth did not appear in Android's media-session listing. Secure lock-screen controls and audible playback were not confirmed. |

## Device and deployment evidence

- Physical Android device connected over ADB; Android 16, Chrome 154.
- PWA loaded from `https://rebirth-devotional.vercel.app/` and launched in
  standalone display mode.
- Active service worker controlled the PWA. Cache included the root/index,
  manifest, icons, deployed JavaScript/CSS bundles, and fonts.
- Android Chrome's per-target offline emulation was enabled; the installed
  PWA reloaded, accepted guest mode offline, and rendered daily contemplation
  and lesson content.
- Vercel production alias was checked after deployment; API health responded
  successfully. Gemini remains unavailable (`hasApiKey:false`).
- No account data was created, edited, restored, or deleted during testing.

## Remaining P0 work

1. Complete Google sign-in on the installed app and confirm the authenticated
   account remains signed in after reload.
2. With explicit permission, create one synthetic journal entry, manually
   import it to Convex, restore it in a second authenticated browser/device,
   then remove only the test entry. Do not run whole-account deletion as a
   production test.
3. Repeat audio testing with a real lock-screen configuration, listen for
   actual audio with the display off, and verify Android media controls. Web
   Speech may stop or be suspended in the background; pre-rendered licensed
   audio is not available as a workaround in this sprint.

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

Production deployment and Android PWA install/offline checks passed. Google
sign-in completion, authenticated two-client Convex verification, and secure
lock-screen/audio acceptance remain open. Those checks require user
authentication, explicit permission for a synthetic data round trip, and
human confirmation of sound/lock-screen behavior.
