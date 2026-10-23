# ai-context/data.md — Convex Data Agent

Authority: Overrides frontend on Convex schema and sync.

## Convex function surface (Phase 3)
- users: getCurrentUser, upsertProfile
- journals: create/list/delete/export (userId-scoped)
- lessonProgress: upsert/list
- bookmarks: toggle/list
- sync: push (local->Convex on sign-in), sync: pull (Convex->local)

## Ownership model (RLS-equivalent)
Every synced row carries `userId`. Reads filter by `ctx.auth.getUserIdentity()`. Writes bind `userId` from auth. Guest rows: `userId: null`, local-only. Cross-user read/write = P0 defect.

## Data model
profiles, user_preferences, journal_entries, lesson_progress, scripture_bookmarks, practice_sessions, review_cards, review_events, reminder_preferences, content_items, content_sources, content_reviews, audio_assets.

## Migration
localStorage -> Convex on sign-in: repeatable, idempotent, consent-based, duplicate-protected. Journal conflicts do not silently overwrite. Export + delete-my-data flows.
