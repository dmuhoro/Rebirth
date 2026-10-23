# ADR-004: Architecture & tech stack

## Status
Accepted

## Context
Rebirth v1 codebase audit (3 commits, README scaffolding notes). Current stack confirmed working: React 19, TypeScript strict, Vite, Tailwind CSS v4, Express + `@google/genai` (Gemini), Web Speech API audio, `navigator.vibrate` haptics, `localStorage` state, Vitest (10 tests), GitHub Actions CI.

## Decision
Preserve the current stack; do not rewrite. Evolve incrementally per the four-phase roadmap.

### Layer responsibility map
| Layer | Responsibility |
|-------|----------------|
| React client | Views, accessible interaction, playback UI, local drafts |
| Service Worker | Public asset caching; explicit exclusion of private/AI responses |
| Express | Route validation, AI orchestration, theological guardrail gate, safe errors |
| Convex (Phase 3) | Auth, profiles, journals, lesson progress, bookmarks, sync |
| Object storage (Phase 4) | Approved audio/media assets |

### Audio correction (per Perplexity review)
`navigator.mediaSession` provides lock-screen metadata and playback interactions; it does NOT guarantee Web Speech synthesis survives screen lock. MediaSession is feature-detected. Reliable background audio (Phase 4) uses actual audio assets / HTMLMediaElement, not a silent-audio keep-alive workaround.

### Data model (Phase 3, Convex)
`profiles`, `user_preferences`, `journal_entries`, `lesson_progress`, `scripture_bookmarks`, `practice_sessions`, `review_cards`, `review_events`, `reminder_preferences`, `content_items`, `content_sources`, `content_reviews`, `audio_assets`. Every synced row carries `userId`; ownership enforced in Convex functions.

## Canons & licensing (docs/THEOLOGY.md)
Tier 1: Protestant 66-book canon (core). Tier 2: Deuterocanon labeled by tradition. Public-domain texts only (KJV, ASV, WEB, public-domain Apocrypha). No bulk NIV/ESV/NLT without license. Recorded in `docs/SOURCES.md`.

## Verification
`npm run lint` (tsc --noEmit), `npm run test` (vitest), `npm run build` (vite + esbuild) all green on `main`.
