# Sprint 014 — Native Background Audio

Date: 2026-10-26

## Goal

Apply Android's supported background-media design principles to Rebirth's
existing native narration path without claiming that a WebAPK can keep browser
speech alive after screen lock.

## Platform findings and decision

- Android background audio belongs in a foreground playback service with a
  media session and a user-visible media notification. This lets system
  surfaces (lock screen, notification shade, media buttons) control playback
  independently of the activity.
- A media app must request audio focus before playback, pause for transient
  interruptions, resume only when focus returns, and release focus when done.
- Rebirth's current Android narration is on-device TextToSpeech, not streamed
  music. Keep the text and narration on-device; no server audio generation or
  user-journal audio upload is introduced.
- The current native `Service`/`MediaSession` is appropriate for TTS. If Rebirth
  adds curated, pre-rendered audio assets, evaluate AndroidX Media3
  `MediaSessionService` with ExoPlayer as the playback engine for those assets.
  Do not add Media3 preemptively without audio assets and queue/seek product
  requirements.
- The installed Chrome WebAPK remains a separate product surface. Browser
  `speechSynthesis` is not a reliable lock-screen playback engine. Do not use
  silent-audio keep-alives to evade browser lifecycle limits.

## Implemented

- Added Android audio-focus requests using speech audio attributes.
- Pause TTS on transient focus loss, including duck requests, and resume after
  focus gain. Permanent loss does not automatically restart narration.
- Release focus and deactivate the media session when playback stops, ends, or
  fails; activate the media session for a new playback.
- Include the playback session ID in native state and progress payloads. The
  React listener filters events by session ID, so omission of the field caused
  valid native events to be discarded.
- Use standard MediaStyle actions with the existing service notification.

## Verification

- `npm run lint` — passed.
- `npm test` — 16 files, 89 tests passed.
- `npm run build` — passed. Vite reports the existing >500 kB chunk advisory
  and upstream Zod pure-annotation notices.
- `cd android && JAVA_HOME="$HOME/.local/opt/jdk21" PATH="$HOME/.local/opt/jdk21/bin:$PATH" ./gradlew :app:assembleDebug :app:lintDebug` — passed.
- ADB sees the Xiaomi Android 16 device with 2.7 GB available. The installed
  native package is version 1.3.2 (installed at 2026-10-26 21:24); the
  foreground/background acceptance for the changes in this sprint has not been
  repeated on that installed build.
- **Battery & auto‑start whitelist**: On HyperOS / MIUI the foreground service
  may be killed by the battery optimiser unless the user completes the whitelist
  steps documented in `README.md` (Settings → Apps → Rebirth → Battery → No
  restrictions + Auto‑start). Without these settings the service may be terminated
  at Doze and narration will stop until the app is reopened.
- Prior temporary APK evidence only showed that the foreground service
  remained active for 45 seconds with the screen locked. It did not verify
  audible output or taps on pause/resume/skip controls.
- The installed WebAPK continues to stop browser narration when the screen
  sleeps. No device app was installed, replaced, or removed during this sprint.

## Acceptance still required

- On the native Android build, verify audible narration with the screen securely
  locked for a representative lesson duration.
- Verify lock-screen and notification pause/resume/stop controls and Bluetooth
  or headset media buttons.
- Verify incoming call/notification interruptions pause and resume correctly,
  and that another media app can take audio focus.
- Verify installed offline English voice behavior with radios disabled.
- Keep the WebAPK limitation clearly disclosed; native acceptance does not
  transfer to the WebAPK.

## References

- [Android Media3 background playback](https://developer.android.com/media/media3/session/background-playback)
- [Android foreground services](https://developer.android.com/develop/background-work/services/fgs)
- [Android audio focus](https://developer.android.com/media/optimize/audio-focus)
