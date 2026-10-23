# ai-context/security.md — Security Agent

Authority: Overrides frontend/data on auth, secrets, rate limiting, PII.

## Secrets
API keys in env vars or secret manager. Never commit to repo. .env ignored; .env.example documents names only. Rotate any secret that touches a commit.

## Rate limiting (Phase 2)
express-rate-limit on /api/* routes (IP-based + optional token bucket). Per-user and per-IP limits. Hard monthly spend cap on Gemini key.

## Validation (Phase 2)
Zod schemas on request/response bodies. Sanitized errors, request IDs, structured logging. No private reflections in logs.

## PII
Journal text never logged, never in analytics, excluded from Service Worker caches. End-to-end encryption only if actually implemented — do not promise it.

## Fail closed
Invalid/abusive payloads rejected cleanly with clear reason. Provider failures return safe fallback (already present).
