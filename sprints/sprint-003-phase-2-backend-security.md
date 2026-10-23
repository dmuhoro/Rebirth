# Sprint 003 — Phase 2: Backend Security & Production Proxy (complete)

## Goal
Harden the `/api/spiritual-guidance` and `/api/daily-contemplation` boundaries: validation, rate limiting, spend cap, safe errors.

## Scope (in this sprint)
- `src/utils/apiSchemas.ts` — Zod request schemas + sanitizeError (no stack/key leaks)
- `src/utils/apiSecurity.ts` — express-rate-limit (API + stricter AI limiter), Gemini daily spend cap circuit breaker, body-size limit, structured request logger (no PII)
- `server.ts` — wire middleware (`/api/*` rate limit, AI limiter, body size, request logger); Zod validation on spiritual-guidance; spend-cap refusal (503); sanitized 502 errors; theological guardrail gate retained from Sprint 001

## Scope (out of this sprint)
- Per-user (token-bucket) rate limiting (IP-based in v1; Convex-backed in later phase)
- Redis-backed spend tracker for multi-instance (single-instance in-memory in v1)

## Acceptance criteria
- [ ] `npm run lint` clean
- [ ] `npm run test` green
- [ ] `npm run build` succeeds
- [ ] Invalid payloads → 400 VALIDATION_ERROR
- [ ] Spend cap exceeded → 503 SPEND_CAP_REACHED with remainingUsd
- [ ] Provider errors → sanitized 502, no stack/key leak

## Status
Complete — green.
