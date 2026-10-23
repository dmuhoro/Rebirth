# Theological Guardrails — Release Evidence (001)

## What was verified
The fail-closed theological gate on `/api/spiritual-guidance` (the production AI boundary).

## Method
1. Wired `buildPastoralSystemInstruction()` into `server.ts` as the Gemini system instruction.
2. Wired `validateOutputAgainstGuardrails()` as a fail-closed gate: on any forbidden-phrase match, return `FALLBACK_RESPONSES.spiritual_strength` (`isAIGenerated: false`) instead of the AI payload.
3. Added `src/__tests__/theologicalGuardrails.test.ts` — 12 boundary tests (clean response, manifestation/frequency, prosperity, suffering-as-weak-faith, "God told you", "God is saying", law-of-attraction, manifest, system-instruction content, three-pillars export, hard-rules coverage).
4. Ran `npm run lint` (tsc --noEmit) — clean.
5. Ran `npm run test` — 22/22 pass (12 new + 10 existing).
6. Ran `npm run build` — production build succeeds.
7. Curl smoke test against the live dev server:
   - `GET /api/health` -> `{"status":"ok","hasApiKey":true}`
   - `POST /api/spiritual-guidance` with body `{"entryText":"I want to tune my frequency to attract my ideal reality. Manifest wealth.","theme":"spiritual_strength","emotion":"Restless"}` -> returned `isAIGenerated: false` fallback with Qavah/Vine/Isaiah 40 counsel. No manifestation, frequency, or prosperity content reached the client.

## Result
PASS. The real production path is guarded. A manifestation-style input does not produce manifestation output.

## Files changed
- `src/utils/theologicalGuardrails.ts` (new)
- `src/__tests__/theologicalGuardrails.test.ts` (new)
- `server.ts` (modified: guardrail imports, system instruction, fail-closed gate)
- `docs/AGENTS.md` (new)
- `docs/THEOLOGY.md` (new)
- `docs/adr/ADR-003-theological-guardrails.md` (new)

## Sign-off
Principal Systems Engineer: verified on real path, not a helper. Fail closed, not fail open.
