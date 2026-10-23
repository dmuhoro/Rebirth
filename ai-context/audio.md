# ai-context/audio.md — Audio Agent

Authority: Web Speech pipeline, MediaSession, background audio, pre-rendered assets (Phase 4).

## speechService.ts
Client-side Web Speech synthesis. Sentence-by-sentence chunking (avoids Android timeout). Rate 0.7x-1.5x. pitch 1.0. Voice selection (en Natural/Google/en-US/en-GB). skipForward/skipBackward/pause/resume/stop. Progress callbacks.

## MediaSession (Phase 1)
Feature-detected. Lock-screen metadata + play/pause handlers. Does NOT keep Web Speech alive on lock screen.

## Background audio (Phase 4)
Real audio assets / HTMLMediaElement for reliable background playback. Transcripts when playback unavailable. No silent-audio keep-alive.

## Haptics (utils/haptics.ts)
navigator.vibrate patterns (selection/light/medium/heavy/success/warning). Non-blocking try/catch fallback.
