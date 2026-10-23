# Sprint 001 — Theological Safety Foundation (complete)

## Goal
Lock the AI pastoral boundary before any PWA/offline code lands, so the product cannot amplify theological drift faster and more smoothly.

## Scope (in this sprint)
- `src/utils/theologicalGuardrails.ts` — guardrails module (pillars, hard rules, system instructions, forbidden-phrase validator)
- `server.ts` — wire guardrails at the real `/api/spiritual-guidance` boundary; fail-closed on violation
- `src/__tests__/theologicalGuardrails.test.ts` — 12 boundary tests
- `docs/AGENTS.md` — operating conventions
- `docs/THEOLOGY.md` — theological guardrails, pillars, canon tiers, review checklist
- `docs/adr/ADR-003-theological-guardrails.md`
- `docs/evidence/001-theological-guardrails-smoke-test.md`
- `scripts/verify-theological-guardrails.sh`

## Scope (explicitly out of this sprint)
- PWA manifest / Service Worker / MediaSession (Phase 1, next sprint)
- Convex migration (Phase 3)
- Spaced repetition / streaks / push (Phase 4)
- Formation Journeys content (content sprint, after Phase 2)

## Acceptance criteria
- [ ] `npm run lint` clean (tsc --noEmit)
- [ ] `npm run test` all green (22/22)
- [ ] `npm run build` succeeds
- [ ] Curl smoke test: manifestation input returns biblically-grounded fallback, no heretical content
- [ ] 12 boundary tests pass (regression baseline for all future AI prompt changes)

## Status
Complete — merged to `main`, ready for Phase 1 (PWA) checkpoint.

## Division of labor (per PRD)
- AI Studio: generated guardrails module, system prompts, boundary tests, ADR, evidence.
- Opencode (local): landed code, ran lint/test/build, curl smoke test on real path.
- Human: accepted PRD, named theological reviewer (pending Phase 3.5), authorized production guardrails.
