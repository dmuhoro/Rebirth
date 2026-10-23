# Sprint 007 — Phase 3 Closeout: Auth & Local Data Import

## Goal
Complete interactive account entry and a safe, retryable local-storage import to Convex.

## Delivered
- Google OAuth and email magic-link providers in `convex/auth.ts`; production links use Resend and fail explicitly when production email is not configured.
- `convex/http.ts` registers Convex Auth's HTTP routes for sign-in and OAuth callbacks.
- Auth UI with Google, email, and explicit guest paths.
- Account panel exposes import, sign-out, and per-device notification setup.
- `convex.sync.importLocalData` imports journals, progress, completed lessons, and bookmarks with ownership checks and idempotent keys.
- `convex.sync.getCloudSnapshot` restores the signed-in user's remote records to this device through the Account & Sync panel.
- Guest data remains local; imports preserve local data and are safe to retry after partial failure.
- Convex ownership checks use Convex Auth's actual user ID API, fixing authorization lookups across existing protected functions.

## Deployment configuration
Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, and
`EMAIL_FROM` in the Convex deployment. Add the Convex Auth callback URL to the
Google OAuth client and configure the sending domain with Resend.

## Verification
- `npm run lint`
- `npm test`
- `npm run build`
- `npx convex codegen`

Physical Google/email sign-in and cross-device data confirmation require configured
OAuth/email credentials and two authenticated clients.

## Status
Implementation complete; external-provider and two-device acceptance remain
unverified until production credentials and devices are available.
