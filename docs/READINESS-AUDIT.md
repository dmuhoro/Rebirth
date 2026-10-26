# Rebirth Readiness Audit

Date: 2026-10-25
Scope: web/PWA production readiness. Native Android acceptance is tracked
separately in `sprints/sprint-011-p0-launch-acceptance.md`.

This audit distinguishes **verified** (a command or live check demonstrates it),
**mitigated** (a guard exists, with a named residual risk), and **external**
(requires a credential, device, or second client that engineering does not
hold). Nothing here is marked verified on intent alone.

## Verified in this cycle

| Area | Control | Evidence |
|---|---|---|
| AI cost | Daily Gemini spend is reserved before every provider call; exhaustion returns `503 SPEND_CAP_REACHED` | `src/utils/apiSecurity.ts`; `serverHardening.test.ts` |
| AI safety | Crisis text short-circuits to static support with no provider call or charge | `serverHardening.test.ts`; `counselApi.test.ts` |
| AI safety | Theological guardrails reject forbidden claims and fall back | `theologicalGuardrails` tests |
| HTTP | CSP, HSTS, frame denial, nosniff, referrer, permissions, COOP | `securityHeaders.test` via `serverHardening.test.ts`; `webConfig.test.ts` |
| HTTP | Unknown `/api/*` returns JSON 404, never the SPA shell | `serverHardening.test.ts` |
| Privacy | All API responses `Cache-Control: no-store` at server and edge | `serverHardening.test.ts`; `webConfig.test.ts` |
| Offline | Navigations are network-first; cached shell fallback | `serviceWorker.test.ts` (real `public/sw.js` in a VM) |
| Privacy | Service worker never caches `/api/*` | `serviceWorker.test.ts` |
| Resilience | Missing `VITE_CONVEX_URL` renders a configuration screen, not a white page | `accessibility.test.tsx`; `src/lib/convex.ts` |
| Resilience | Render errors are caught by an error boundary with a reload action | `accessibility.test.tsx` |
| Accessibility | Skip link, focus ring, `aria-current`, modal semantics/Escape/focus restore, 44px targets | `accessibility.test.tsx`; component review |
| Supply chain | No new runtime dependency added in this cycle | `package.json` diff |
| Quality gate | `npm run lint`, `npm test` (80), `npm run build` | local run recorded in Sprint 012 |

## Mitigated with residual risk

| Risk | Current control | Residual | Owner / next step |
|---|---|---|---|
| Serverless rate limits and spend counters are per instance | In-memory limiter + spend tracker, fail-closed per instance | Effective global limits are `configured × active instances`; a burst across cold instances can exceed the daily cap | Engineering: move counters to Convex/Redis behind an ADR |
| Curated content defined twice | `server.ts` constants and `src/data` | Divergence could show different daily content server vs client | Engineering: single source of truth |
| Installed WebAPK speech stops on screen lock | Documented limitation; foreground speech starts in the WebAPK but stops when the screen sleeps. The Capacitor foreground service exists only in native builds, and its temporary probe APK was removed | Lock-screen narration is unavailable in the installed app; audible output and notification-tap routing still need a human check | Product decision: use the native wrapper if lock-screen narration is required |
| PWA update while open | Network-first shell picks up new HTML on next load | A tab already open keeps its in-memory bundle until reload | Acceptable; documented in Sprint 012 |
| Backup is manual, not continuous | Explicit import/restore with confirmation | Users can believe data is synced when it is not | Product: align copy and consider automatic sync after ADR |

## External verification (not engineering-completable here)

| Item | Why blocked | Required to close |
|---|---|---|
| Google sign-in completes and persists | Production sign-in and reload persistence verified; after the 2026-10-25 JWT key rotation, a fresh Google sign-in completed in the integrated browser and the account panel persisted across reload | Complete |
| Two-client backup/restore/delete | Synthetic entry was restored on Android, deleted there, and deletion propagated to desktop | Complete in Sprint 011; evidence retained |
| Installed WebAPK / offline / push | `org.chromium.webapk.a65924abe5097642f_v2` (label `Rebirth`) installed 2026-10-26. It launches standalone with `/sw.js` active; account sign-in persisted; warm and cold-start offline loading passed; notification permission, an FCM subscription, and a production test notification were verified. | Foreground narration starts, but speech stops when the screen sleeps. A temporary native APK probe showed the foreground service survives 45 seconds, but that APK was uninstalled and is not the installed path. | Human: confirm audible output and notification-tap routing; decide whether lock-screen narration requires the native wrapper |
| Live production header/update proof | Latest production alias returned CSP/security headers, health 200, and JSON/no-store API 404; an open page reloaded the new main bundle after the next deployment | Complete for browser-page reload and standalone warm/cold offline start |
| Email magic-link / Web Push acceptance | Android Chrome and the installed WebAPK received production test notifications; the WebAPK has an FCM push subscription. Resend rejected the configured `gmail.com` sender with HTTP 403 because that domain is unverified. | Configure a sender on a verified domain and repeat the magic-link test; Web Push delivery is complete |
| Gemini live quality | Production reports `hasApiKey:false`; model path only proven with mocks | Operator-provided key and budget approval |

## Product-level gaps to state plainly

- Rebirth is **not** an emergency service. Crisis detection routes to static
  support; it is not a hotline and does not monitor users.
- AI counsel is bounded by guardrails and a spend cap; when either refuses, the
  app serves curated content rather than inventing an answer.
- Guest data is device-local. Cloud backup is opt-in and manual.
- No analytics or third-party trackers are loaded; fonts are fetched from
  Google Fonts unless self-hosted, which is the only cross-origin asset.

## Definition of done for this cycle

- [x] Spend cap enforces and fails closed.
- [x] Security headers and CSP deployed from both express and Vercel config.
- [x] Offline shell updates and API routes are never cached.
- [x] Boot misconfiguration and render failures are explained, not blank.
- [x] Keyboard and screen-reader paths for navigation and the account panel.
- [x] Automated evidence for every new control.
- [x] Sprint record and changelog entry.
- [ ] External acceptance items above (tracked, not claimed).
