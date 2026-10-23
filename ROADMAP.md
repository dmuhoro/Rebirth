# Rebirth Roadmap

## Phase 0 — Foundation (complete)
- PRD scope & exclusions approved
- Theological/editorial policy approved (docs/THEOLOGY.md)
- AGENTS.md guardrails (docs/AGENTS.md)
- Repository baseline audited (lint/test/build green)
- Theological safety foundation shipped (sprint-001)

## Phase 1 — Hardening & PWA Integration (next)
- public/manifest.webmanifest + themed/maskable icons
- public/sw.js Service Worker (cache-first static, network-first API, no private cache)
- navigator.mediaSession lock-screen controls
- Safe-area insets + mobile viewport safeguards
- Offline cache fallbacks
- Gate: installs on real Android, lesson plays with screen locked, offline works

## Phase 2 — Backend Security & Production Proxy
- express-rate-limit on /api/* routes
- Zod request/response validation
- Content moderation prompt guards (3 pillars)
- Safe error sanitization + structured logging
- Gemini spend cap + rate limits
- Gate: eval set passes, abuse test passes

## Phase 3 — Cloud Database & Multi-Device Sync (Convex)
- Convex schema: profiles, journals, lesson_progress, bookmarks, etc.
- Auth (Google + magic link), guest mode preserved
- Ownership enforced in Convex functions (RLS-equivalent)
- localStorage -> Convex migration (idempotent, consent-based)
- Export + delete-my-data
- Gate: two devices in sync, delete-my-data works

## Phase 3.5 — Content Sprint
- Daily check-in library + first 6 Formation Journeys (Joseph, Moses, David, Nehemiah, Ruth, Paul) + Christ capstone
- Theological review gate (docs/THEOLOGY.md reviewer signs off)
- Gate: reviewer sign-off

## Phase 4 — Retention, Spaced Repetition & Audio Upgrades
- Streaks + opt-in reminders
- Spaced repetition for Hebrew/Greek terms
- Pre-rendered / server-rendered audio
- Gate: audio matches tested device behavior

## Release gate: controlled beta
Reviewed content, safety evals, privacy/licensing review, accessibility audit, rollback rehearsal, device test matrix, small beta cohort.
