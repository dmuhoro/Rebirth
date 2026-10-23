# Sprint 006 — Phase 4: Retention, Spaced Repetition & Audio Upgrades (complete)

## Goal
Ship retention mechanics: streak calculator, SM-2 spaced repetition, reminder preferences, Convex persistence for review/streak data.

## Scope (in this sprint)
- `src/lib/streak.ts` — pure streak calculator (current/longest streak, streak days, grace-day pause, broken detection)
- `src/lib/spacedRepetition.ts` — pure SM-2 scheduler (create/review/due/sort), ease factor clamped >= 1.3
- `src/__tests__/streak.test.ts` — 5 streak tests (empty, single day, consecutive, dedupe, grace/broken)
- `src/__tests__/spacedRepetition.test.ts` — 7 SM-2 tests (fresh card, intervals, failure reset, ease clamp, quality sort, clamp)
- `convex/review.ts` — upsertReviewCard, listDueReviewCards, recordReviewEvent, listPracticeStreakDates (ownership-enforced)
- `convex/codegen` regenerated; review functions deployed

## Scope (out of this sprint)
- Opt-in Web Push delivery (subscription and test-message infrastructure added in Sprint 008; VAPID setup and physical-device verification remain)
- Pre-rendered / server-rendered audio assets (requires approved voice/source assets and a configured TTS provider)
- Streak UI display in LessonsView / journal

## Acceptance criteria
- [ ] `npm run lint` clean
- [ ] `npm run test` green (41 total incl. 12 new)
- [ ] `npm run build` succeeds
- [ ] SM-2 ease factor clamped >= 1.3; failure resets to interval 1

## Status
Complete — green.
