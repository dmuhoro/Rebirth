# ADR-003: Theological guardrails at the AI boundary

## Status
Accepted (Phase 0 safety foundation)

## Context
Rebirth's `/api/spiritual-guidance` (called `/api/counsel` in early briefing) is an open Express endpoint proxying to Gemini. Without guardrails, AI pastoral output could drift into manifestation/law-of-attraction, prosperity gospel, suffering-as-weak-faith, or "God told me" direct-revelation claims — all of which contradict the three pillars.

## Decision
Enforce theological guardrails at the real production boundary: inside `server.ts`, on the `/api/spiritual-guidance` response path, before the payload reaches the client.

### Components
- `src/utils/theologicalGuardrails.ts` — pure, side-effect-free module:
  - `buildPastoralSystemInstruction()` / `buildDailyContemplationSystemInstruction()` — hard-coded system prompts encoding the three pillars + hard rules.
  - `validateOutputAgainstGuardrails(output)` — regex-based forbidden-phrase detector (manifestation, frequency, prosperity, suffering-as-faith, "God told you", etc.).
- `server.ts` — wires `buildPastoralSystemInstruction()` as the system instruction and `validateOutputAgainstGuardrails()` as a fail-closed gate: if AI output violates any rule, return the biblically-grounded `FALLBACK_RESPONSES` instead of the AI payload.
- `src/__tests__/theologicalGuardrails.test.ts` — 12 boundary tests covering clean responses, manifestation, prosperity, suffering-as-faith, direct revelation, "God is saying", law-of-attraction, and system-instruction content.

### Fail-closed behavior
The AI response is parsed, stringified, and run through `validateOutputAgainstGuardrails`. On any violation, the server returns `FALLBACK_RESPONSES.spiritual_strength` with `isAIGenerated: false` and a guardrail note. The client never receives a violating payload.

## Alternatives considered
- **Client-side filtering only:** Rejected — enforcement at the client is bypassable; the real boundary is the Express route.
- **Post-generation LLM filter:** Rejected — adds latency and a second model that could itself drift. Deterministic regex gate is faster and auditable.

## Consequences
- Positive: Zero-tolerance for theological drift at the production path; tested; no stubs.
- Negative: Regex gate can have false positives/negatives; mitigated by the 12-test regression suite and human theological review (docs/THEOLOGY.md review checklist).

## Related
- docs/THEOLOGY.md (pillars, hard rules, review checklist)
- docs/AGENTS.md (theological reverence convention)
- docs/evidence/001-theological-guardrails-smoke-test.md (curl smoke test)
