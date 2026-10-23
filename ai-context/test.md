# ai-context/test.md — Test Agent

Authority: Vitest suite, boundary tests, regression baseline.

## Commands
npm run test (vitest run), npm run test:watch (vitest).

## Standards
- Every new behavior gets a Vitest test.
- Every new gate shown rejecting the thing it rejects.
- Never weaken an assertion to go green.
- Test the real path, not a helper only tests use.

## Suites
- src/__tests__/theology.test.ts — curriculum integrity (3 pillars).
- src/__tests__/haptics.test.ts — haptic fallback behavior.
- src/__tests__/dailyContemplation.test.ts — deep-link prompt mapping.
- src/__tests__/theologicalGuardrails.test.ts — 12 boundary tests (regression baseline for AI prompts).

## Definition of done
lint clean + test green + build succeeds + manual checks performed.
