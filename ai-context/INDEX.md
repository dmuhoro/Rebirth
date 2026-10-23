# Rebirth — AI Engineering Team

This folder contains specialized engineer agents for the Rebirth SDLC. Load the relevant agent(s) at the start of any Opencode session.

## Agent Routing Table

| Task type | Primary agent | Supporting agent |
|---|---|---|
| Architectural decision | architect.md | — |
| New React component | frontend.md | theology.md |
| Schema change (Convex) | data.md | architect.md |
| Security / theological review | theology.md | security.md |
| Writing tests | test.md | — |
| PWA / Service Worker / MediaSession | pwa.md | frontend.md |
| Convex backend (auth, sync, RLS-equivalent) | data.md | devops.md |
| CI/CD, deployment, versioning | devops.md | — |
| Feature scope decision | product.md | architect.md |
| Audio pipeline (Web Speech / MediaSession / assets) | audio.md | pwa.md |

## Authority Hierarchy (who overrides whom)
- `theology.md` — final word on the three pillars, hard rules, and content review. Overrides frontend/data on any theological boundary.
- `architect.md` — final word on offline-first, dependencies, ADRs.
- `security.md` — overrides frontend/data on auth, secrets, rate limiting, PII.
- `data.md` — overrides frontend on Convex schema and sync.
- `product.md` — overrides all on scope (prevents overbuilding).
- `frontend.md`, `test.md`, `pwa.md`, `audio.md`, `devops.md`, `product.md` — execution agents.

## How to invoke

Single agent:
  "Acting as the engineer in ai-context/theology.md, review this prompt."

Multiple agents:
  "Acting as ai-context/data.md and ai-context/test.md, write the Convex schema and tests for journal sync."

Full team review:
  "Route this task to the appropriate agents in ai-context/ and execute."

## Non-negotiables (enforced by ALL agents, no exceptions)

1. The AI never speaks as God. Never "God told you" / direct revelation.
2. No manifestation / law-of-attraction / "frequency attracts reality" framing.
3. No prosperity gospel or suffering-as-weak-faith claims.
4. Fail closed at the real boundary (`/api/spiritual-guidance`), not a helper.
5. Private journal text never logged, never cached by Service Worker, never sent to AI without consent.
6. `npm run lint && npm run test` must pass before any PR.
7. No new npm dependencies without explicit human approval.
8. No PII or secrets in logs. Ever.
