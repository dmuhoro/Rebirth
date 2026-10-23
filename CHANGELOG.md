# Rebirth CHANGELOG

All notable changes to Rebirth are documented in this file.

## [Unreleased]

### Added
- Theological safety foundation: `src/utils/theologicalGuardrails.ts` encoding the three pillars (Qavah/Meno, Lev Tahor/Basar, Divinity of Christ) and hard rules (no manifestation/frequency/attraction, no prosperity gospel, no suffering-as-weak-faith, no direct-revelation claims, traceable citations, always points to Scripture/prayer/community).
- Fail-closed guardrail gate on `/api/spiritual-guidance` in `server.ts`: violating AI output returns the biblically-grounded fallback instead of the AI payload.
- `src/__tests__/theologicalGuardrails.test.ts` — 12 boundary tests (manifestation, prosperity, suffering-as-faith, "God told you", "God is saying", law-of-attraction, clean response, system-instruction content).
- `docs/AGENTS.md` — operating conventions for all agents and humans.
- `docs/THEOLOGY.md` — theological guardrails, canon/licensing tiers, Formation Journeys reframe, review checklist.
- `docs/adr/ADR-001-convex-backend.md`, `ADR-002-pwa-offline-first.md`, `ADR-003-theological-guardrails.md`, `ADR-004-architecture-stack.md`.
- `docs/evidence/001-theological-guardrails-smoke-test.md` — curl smoke test evidence.
- `scripts/verify-theological-guardrails.sh` — lint + test + build verification.
- `sprints/sprint-001-theological-safety-foundation.md`.

### Changed
- `server.ts`: replaced inline system instruction with `buildPastoralSystemInstruction()`; added `validateOutputAgainstGuardrails()` fail-closed gate; added `buildDailyContemplationSystemInstruction()` for `/api/daily-contemplation`.

## [1.0.0] - 2026-10-23 (baseline prototype)
- Initial release: React 19, TypeScript strict, Vite, Tailwind v4, Express + Gemini, Web Speech audio, haptics, localStorage state, 3 Vitest suites, GitHub Actions CI.
