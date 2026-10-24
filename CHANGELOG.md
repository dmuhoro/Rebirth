# Rebirth CHANGELOG

All notable changes to Rebirth are documented in this file.

## [Unreleased]

### Verification — Sprint 011 P0 launch acceptance
- Redeployed `main` commit `7093a9c` to Vercel production (`dpl_2sXBBFUfGMNqgKDKctVUiumz9UTs`, READY) and confirmed the live health endpoint.
- Installed the production PWA on a connected Android phone; service worker controlled the installed app, and a simulated offline reload opened cached devotional content in guest mode.
- Android standalone PWA and service-worker control were confirmed. Foreground narration started, but browser speech stopped after the PWA was backgrounded and no Rebirth Android media session appeared; secure lock-screen behavior and audible output still need human confirmation.
- The Google OAuth page is reachable, but sign-in was not completed during this check. Two-client Convex backup/restore was not run because neither client was authenticated; no account data was created or changed.

## [1.2.0] - 2026-10-24

### Added — Sprint 009: Trusted Private Reflection & Reliable Backup
- Versioned JSON and Markdown exports, local JSON restore, expanded Convex backup snapshots, and deletion safeguards that prevent older journal backups from resurrecting deleted entries.
- Explicit consent before AI reflection submission, honest retryable provider-error states, and clearer manual-backup wording.
- Static crisis-support response that bypasses Gemini, with client rendering that does not save it as AI-generated counsel.
- `/api/counsel` with the legacy `/api/spiritual-guidance` alias, strict request validation, 32 KB JSON parser limit, sanitized parser/provider errors, and bounded Gemini requests.
- Privacy and deletion disclosures in the README and account UI.

## [1.1.0] - 2026-10-23

### Added — Sprint 007: Phase 3 Auth & Local Data Import
- Google OAuth and Resend-backed email magic-link sign-in with explicit guest mode.
- Convex Auth HTTP routes for OAuth callbacks and passwordless email authentication.
- Account panel for retryable local journal, lesson progress, completion, and bookmark import to Convex; local records are preserved.
- Authenticated cloud snapshot query and restore-to-device flow for journals, progress, and bookmarks.
- Idempotent Convex import mutation and local-ID journal deduplication.
- Correct Convex Auth user-ID lookup in protected functions.

### Added — Sprint 008: Phase 4 Web Push & Media Session
- Authenticated, per-user Web Push subscriptions and a test notification action with stale subscription cleanup.
- Service Worker push display and same-origin notification click handling.
- Functional Media Session playback action handlers.
- Pre-rendered audio assets and live notification delivery require voice-licensing/source decisions and VAPID deployment configuration; see Sprint 008.

### Added — Sprint 001: Theological Safety Foundation
- `src/utils/theologicalGuardrails.ts` — three pillars (Qavah/Meno, Lev Tahor/Basar, Divinity of Christ) + hard rules (no manifestation/frequency/attraction, no prosperity gospel, no suffering-as-weak-faith, no direct-revelation claims, traceable citations, always points to Scripture/prayer/community).
- Fail-closed guardrail gate on `/api/spiritual-guidance` in `server.ts`: violating AI output returns the biblically-grounded fallback instead of the AI payload.
- `src/__tests__/theologicalGuardrails.test.ts` — 12 boundary tests (manifestation, prosperity, suffering-as-faith, "God told you", "God is saying", law-of-attraction, clean response, system-instruction content).
- `docs/AGENTS.md` — operating conventions for all agents and humans.
- `docs/THEOLOGY.md` — theological guardrails, canon/licensing tiers, Formation Journeys reframe, review checklist.
- `docs/adr/ADR-001-convex-backend.md`, `ADR-002-pwa-offline-first.md`, `ADR-003-theological-guardrails.md`, `ADR-004-architecture-stack.md`.
- `docs/evidence/001-theological-guardrails-smoke-test.md` — curl smoke test evidence.
- `scripts/verify-theological-guardrails.sh` — lint + test + build verification.
- `sprints/sprint-001-theological-safety-foundation.md`.

### Added — Sprint 002: Phase 1 PWA Offline-First
- `public/manifest.webmanifest` — app metadata, themed icons, maskable icon, display: standalone.
- `public/icons/*.png` — 9 sizes (72–512) + maskable + apple-touch-icon.
- `public/sw.js` — Service Worker: cache-first static shell, network-first API + offline fallback, private data excluded.
- `index.html` — manifest link, theme-color, apple-touch-icon, SW registration script.
- `src/index.css` — safe-area insets, reduced-motion support.
- `src/components/AudioPlayerBar.tsx` — useMediaSession lock-screen metadata integration.
- `src/hooks/useMediaSession.ts` — feature-detected MediaSession.

### Added — Sprint 003: Phase 2 Backend Security & Production Proxy
- `src/utils/apiSchemas.ts` — Zod request schemas + sanitizeError (no stack/key leaks).
- `src/utils/apiSecurity.ts` — express-rate-limit (API + stricter AI limiter), Gemini daily spend cap circuit breaker, body-size limit, structured request logger (no PII).
- `server.ts` — `/api/*` rate limit, AI limiter, body size, request logger; Zod validation on spiritual-guidance; spend-cap refusal (503); sanitized 502 errors.

### Added — Sprint 004: Phase 3 Convex Cloud Sync
- Convex project `outstanding-ram-327` (eu-west-1) linked; dev deployment provisioned; `npx convex codegen` types generated.
- `convex/schema.ts` — 13 tables, all userId-scoped (ownership enforced = RLS-equivalent).
- `convex/users.ts`, `convex/journals.ts`, `convex/lessons.ts`, `convex/content.ts`, `convex/sync.ts`, `convex/auth.ts`, `convex/review.ts` — ownership-enforced mutations/queries.
- `src/lib/convex.ts` — ConvexReactClient + generated api exports.
- `src/lib/sync.tsx` — SyncProvider, guest/auth mode, signIn/signOut, sync functions.
- `src/App.tsx` — wraps DevotionalApp in SyncProvider.

### Added — Sprint 005: Phase 3.5 Formation Journeys Content
- `src/data/journeysData.ts` — FormationJourney type + 7 journeys (Joseph, Moses, David, Nehemiah, Ruth, Paul, Jesus Christ) using the fixed formation template.
- `src/__tests__/journeys.test.ts` — 6 theological integrity tests.

### Added — Sprint 006: Phase 4 Retention, Spaced Repetition & Audio Upgrades
- `src/lib/streak.ts` — pure streak calculator (current/longest streak, streak days, grace-day pause, broken detection).
- `src/lib/spacedRepetition.ts` — pure SM-2 scheduler (create/review/due/sort), ease factor clamped >= 1.3.
- `src/__tests__/streak.test.ts` — 5 streak tests.
- `src/__tests__/spacedRepetition.test.ts` — 7 SM-2 tests.
- `convex/review.ts` — upsertReviewCard, listDueReviewCards, recordReviewEvent, listPracticeStreakDates.

### Changed
- `server.ts`: replaced inline system instruction with `buildPastoralSystemInstruction()`; added `validateOutputAgainstGuardrails()` fail-closed gate; Zod validation, rate limiting, spend cap, sanitized errors.
- `CONTRIBUTING.md` — theological review gate wired in.
- `README.md` — clone URL fixed to dmuhoro/Rebirth.
- `ROADMAP.md` — added (release roadmap).

## [1.0.0] - 2026-10-23 (baseline prototype)
- Initial release: React 19, TypeScript strict, Vite, Tailwind v4, Express + Gemini, Web Speech audio, haptics, localStorage state, 3 Vitest suites, GitHub Actions CI.

## [1.2.1] - 2025-10-24

### Added
- New brand identity (Sacred Minimalism) with updated logos, icons, and design tokens
- Design tokens system with CSS variables and Inter/Newsreader typography
- Complete PWA icon set including maskable icons

### Changed
- Updated header branding with new Rebirth wordmark
- Replaced decorative marks in auth screens with new brand mark
- Updated manifest and app metadata with new theme colors

### Fixed
- Auth fully configured for all methods (Google OAuth, Email magic links, Guest)
