# Sprint 012 — Web Production Hardening

## Goal

Close the web/PWA production gaps found in the readiness audit without touching
the native Android narration stream (owned by the Android portion). Every claim
in this sprint has a named command or test that demonstrates it. No new runtime
dependency was added.

## Shipped

### 1. Gemini spend cap that actually enforces spend

`src/utils/apiSecurity.ts` previously imported `recordSpendUsd` but never called
it, so the "daily cap" could never be reached. Now:

- `reserveAiSpend()` atomically checks and records budget **before** the
  provider call.
- Invalid, negative, zero, or non-numeric caps fail closed (`0` cap → AI
  refused). A cap of `0` is a valid "disable AI" setting.
- Pricing is configurable: `GEMINI_DAILY_SPEND_CAP_USD` (default `5.00`) and
  `GEMINI_ESTIMATED_REQUEST_COST_USD` (default `0.01`, deliberately rounded up).
- `/api/counsel` and `/api/spiritual-guidance` reserve after the crisis and
  missing-key short-circuits, so static crisis support and fallback counsel are
  never charged.
- `/api/daily-contemplation?fresh=true` reserves before generation and silently
  serves the curated contemplation when budget is exhausted (page still works).
- Exhaustion returns HTTP `503` with `code: "SPEND_CAP_REACHED"`, the remaining
  budget, and a user-readable message.

### 2. Hardened HTTP boundary

- `src/utils/securityHeaders.ts`: CSP, HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, referrer policy, permissions policy, COOP.
- `app.disable("x-powered-by")`.
- All `/api/*` responses are `Cache-Control: no-store` (private reflections and
  counsel must never enter a shared cache).
- Unknown `/api/*` routes return JSON `404 {error:"not_found",code:"API_NOT_FOUND"}`
  instead of the SPA shell with a 200.
- `vercel.json` applies the same headers to static assets. CSP is duplicated
  there **by necessity**; `webConfig.test.ts` fails if the two copies drift.
- CSP is production-only (`NODE_ENV=production` or `VERCEL=1`), because Vite HMR
  needs inline scripts and eval in development.
- The inline service-worker registration script was removed from `index.html`
  so `script-src 'self'` can be enforced without `unsafe-inline`.

### 3. Offline correctness

`public/sw.js` was cache-first for navigations, which pinned installed users to
a stale `index.html` whose hashed bundle no longer existed after a deploy.

- Navigations: network-first, refresh the cached shell, fall back to cache and
  then a branded offline page.
- Hashed static assets: cache-first; only successful responses are stored.
- `/api/*`: network-only, never cached; offline returns JSON `503`.
- Non-GET and cross-origin requests are not intercepted.
- Cache version `v3`; activation deletes older caches.
- A failed non-HTML request returns `504`, never the HTML shell (which produced
  confusing MIME errors).

### 4. Boot resilience

- `src/lib/convex.ts` no longer constructs `new ConvexReactClient(undefined)`
  at import time. The client is `null` when `VITE_CONVEX_URL` is missing or
  malformed, and `getConvexClient()` throws a clear configuration error.
- `src/main.tsx` renders an explicit configuration screen instead of a white
  screen, and wraps the app in `AppErrorBoundary` (role `alert`, reload action).
- `SyncProvider` uses `getConvexClient()` so cloud import fails with a clear
  message rather than a null dereference.

### 5. Accessibility

- Skip link to `#main-content`; `<main>` is a focus target.
- Global `:focus-visible` ring (WCAG 2.4.7).
- Tabs use `aria-current="page"` (the previous `aria-selected` on plain buttons
  was invalid without `role="tab"`), `type="button"`, and 44px minimum targets.
- Account panel: `aria-describedby`, initial focus, Tab trap, Escape to close,
  focus restored to the trigger.
- Header controls reach 44px; auth errors use `role="alert"`; decorative icon
  marked `aria-hidden`.

## Evidence

| Check | Command | Result |
|---|---|---|
| Types | `npm run lint` | Pass |
| Tests | `npm test` | 15 files, 80 tests pass (baseline 11/64) |
| Build | `npm run build` | Pass; `dist/sw.js` emitted |
| Inline scripts | `index.html` / `webConfig.test.ts` | None; assert fails if reintroduced |
| CSP drift | `webConfig.test.ts` | `vercel.json` CSP equals server CSP |
| Spend cap | `serverHardening.test.ts` | 1st AI call 200, 2nd 503 `SPEND_CAP_REACHED`, provider called once |
| Crisis path | `serverHardening.test.ts` | Static crisis response, no spend, no provider call |
| API 404 | `serverHardening.test.ts` | JSON 404, not SPA HTML |
| API caching | `serverHardening.test.ts` | `Cache-Control: no-store` |
| SW navigation | `serviceWorker.test.ts` | Real `public/sw.js` executed in a VM: network-first + cached fallback |
| SW API policy | `serviceWorker.test.ts` | No cache writes for `/api/*`; offline JSON 503 |
| SW non-GET/cross-origin | `serviceWorker.test.ts` | Not intercepted |
| A11y contract | `accessibility.test.tsx` | `aria-current`, no `aria-selected`, alert roles |
| Boot failure UI | `accessibility.test.tsx` | Configuration and error screens announce themselves |

## Deliberately not changed

- **Per-instance limits.** Rate limits and spend tracking are in memory. On
  Vercel, each serverless instance has its own counter, so the effective global
  cap is higher than configured. Moving this to Convex/Redis is a separate
  change requiring an ADR; it is recorded in the readiness audit, not hidden.
- **Content constants.** `server.ts` still duplicates some curated content that
  also exists under `src/data`. De-duplicating is safe but orthogonal; it is
  recorded as debt.
- **No new test dependencies.** The suite has no jsdom or testing-library, and
  adding them would have mixed package changes into another contributor's
  in-flight work. New tests use `react-dom/server` and `node:vm` instead.

## External verification still required

These are owned, not silently closed:

1. **Complete in Sprint 011:** Google sign-in from a supported external
   browser, then reload persistence.
2. **Complete in Sprint 011:** Two-client authenticated backup/restore/delete
   with a synthetic entry.
3. Native APK **install**, offline English voice, and lock-screen playback
   acceptance (Android portion). The 4.4 MB APK reports `versionName 1.3.1`
   and `targetSdk 36`. The connected phone reports 349 MB free against
   Android's 1 GiB low-storage threshold. Lock-screen playback needs a human
   to lock the device.
4. **Complete for the web page:** production deployment
   `dpl_9TX7zbnfKWkwrxnj3Nh4yVNTxgEk` passed live CSP, health, and JSON/no-store
   API 404 checks. A later deployment with the Web Push public key changed the
   main bundle hash, and an already-open page picked it up after reload.
   Android Chrome offline guest content was then verified with Wi-Fi and mobile
   data disabled. Standalone-WebAPK installation remains unverified.
5. **Complete:** production Web Push VAPID configuration and test delivery to
   Android Chrome. Magic-link acceptance remains blocked because Resend
   rejects the configured `gmail.com` sender domain as unverified; configure a
   sender on a verified domain and repeat the test.

## Release note

The native implementation shipped as `v1.3.1`; remaining physical acceptance is
tracked in Sprint 011 and Sprint 013 rather than represented as complete.
