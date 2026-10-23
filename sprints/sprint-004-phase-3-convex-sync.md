# Sprint 004 — Phase 3: Convex Cloud Sync (client scaffolding) (complete)

## Goal
Stand up Convex as the backend (per ADR-001) with ownership-enforced functions and client sync scaffolding, preserving guest/localStorage mode.

## Scope (in this sprint)
- Convex project linked: `outstanding-ram-327` (eu-west-1), dev deployment provisioned
- `convex/schema.ts` — profiles, userPreferences, journalEntries, lessonProgress, scriptureBookmarks, practiceSessions, reviewCards, reviewEvents, reminderPreferences, contentItems, contentSources, contentReviews, audioAssets (all userId-scoped)
- `convex/users.ts`, `convex/journals.ts`, `convex/lessons.ts`, `convex/content.ts`, `convex/sync.ts`, `convex/auth.ts`, `convex/review.ts` — ownership-enforced mutations/queries (RLS-equivalent via userId + getUserIdentity)
- `src/lib/convex.ts` — ConvexReactClient + generated api exports
- `src/lib/sync.tsx` — SyncProvider (ConvexProvider wrapper), guest/auth mode, signIn/signOut, syncJournal/syncLessonProgress/syncBookmarks
- `src/App.tsx` — wraps DevotionalApp in SyncProvider
- `npx convex codegen` — types generated; functions deployed to dev deployment

## Scope (out of this sprint)
- Google Sign-In / email magic link auth UI (Convex auth provider integration)
- localStorage → Convex one-time migration UI (client scaffolding ready; migration flow gated on sign-in)
- Cross-device sync verification on two physical devices (requires auth UI)

## Auth/security model
- Every synced row carries `userId`; reads filter by `ctx.auth.getUserIdentity()`
- Guest mode (no userId) → localStorage only, never written to Convex
- Cross-user read/write = P0 defect

## Acceptance criteria
- [ ] `npm run lint` clean (Convex types included)
- [ ] `npm run test` green
- [ ] `npm run build` succeeds
- [ ] `npx convex codegen` succeeds; functions deployed

## Status
Complete — green.
