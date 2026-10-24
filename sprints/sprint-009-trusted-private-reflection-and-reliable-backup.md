# Sprint 009 — Trusted Private Reflection & Reliable Backup

## Goal

Make private reflection, manual cloud backup, export, restore, and deletion
behavior accurate and understandable; bound the counsel API and provide static
crisis resources without invoking the AI provider.

## Delivered

- Removed fabricated starter journal content and filtered the legacy starter
  record from stored journal and favorite data. The retired entry ID is also
  blocked from cloud import/restore and filtered from JSON restore.
- Replaced claims of automatic synchronization with accurate manual backup and
  restore descriptions.
- Added explicit consent before sending a reflection for AI counsel, a privacy
  link, and retryable failure messaging that does not imply unsaved content was
  saved or fallback counsel was returned.
- Added versioned JSON and Markdown export, validated local JSON restore, and a
  broader authenticated Convex backup snapshot.
- Added separate devotional-data deletion with explicit confirmation. It
  preserves the sign-in account, removes local/cloud devotional records and
  this browser's push subscription, and retains a minimal deletion cutoff to
  prevent older backups from restoring deleted journal entries.
- Added persistent local deletion tombstones and cloud import/restore filtering.
- JSON restore now honors both local and known cloud journal tombstones and
  waits for an authenticated cloud snapshot before restoring on a signed-in
  device. Cloud-only datasets included in an export are explicitly archival;
  device restore does not recreate them.
- Added `/api/counsel`, preserving `/api/spiritual-guidance` as a compatibility
  alias. Both endpoints use the AI request limiter, strict request validation,
  a 32 KB JSON parser limit, sanitized parser/provider errors, and a finite
  Gemini timeout with retries disabled.
- Added heuristic first-person crisis-intent screening that returns only a
  static support response and a general helpline directory link before any
  spend-cap check or Gemini client initialization. The client renders that
  response separately and does not save it as AI counsel.
- Documented privacy, local/cloud storage, export sensitivity, deletion
  retention, crisis-screen limitations, and the absence of live cross-device
  synchronization in the README.

## Verification

- `npm run lint` — passed.
- `npm test` — passed, 11 files and 64 tests.
- `npm run build` — passed. Vite reported the existing large-chunk advisory
  and dependency comment warnings; output bundles were generated.
- Focused crisis/API/backup run — passed, 4 files and 23 tests.
- `git diff --check` — passed.
- Vercel production deployment completed and is `READY`; `/api/health` returned
  `{"status":"ok","hasApiKey":false}` and a benign `/api/counsel` smoke request
  returned the configured non-AI response.
- Convex production functions/schema deployed to
  `accomplished-kiwi-69` (`https://accomplished-kiwi-69.eu-west-1.convex.cloud`).
- The Convex CLI skipped its function-specific `tsc` check because the repo has
  no `convex/tsconfig.json`; the repository-wide `npm run lint` check passed.

## Remaining limits and external verification

- The crisis phrase screen is heuristic, not clinical, monitored, or
  comprehensive. It cannot detect every crisis and is not a substitute for
  emergency or professional care.
- API rate limits and the Gemini spend tracker are in-memory and therefore
  per-process; they do not provide a shared quota across scaled serverless
  instances. A shared rate/spend store is required for a hard production-wide
  limit.
- Physical Android install/offline/lock-screen tests and two-device Convex
  restore verification were not performed in this environment.
- Gemini counsel, Google/email sign-in, and Web Push delivery remain
  unverified: production has no Gemini API key (`hasApiKey:false`), and these
  integrations depend on operator-managed provider configuration.
- Speech remains browser-generated; pre-rendered, licensed narration assets
  were not added.
- Cloud restore and import remain explicit manual operations, not live sync.

## Status

Code is committed and pushed; Vercel and Convex production deployments are
complete. Local automated checks are green. Production-wide quota guarantees,
provider integrations, and physical-device verification remain external
follow-up work.
