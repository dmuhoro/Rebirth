# ADR-001: Convex as the backend (replaces Supabase direction)

## Status
Accepted

## Context
Rebirth's Phase 3 originally leaned toward Supabase (PostgreSQL + RLS + auth). After re-evaluation, the project standardizes on **Convex** for the backend: a reactive, TypeScript-native, ACID-compliant database with built-in authentication, action/mutation/query separation, and automatic React bindings.

## Decision
Use Convex as the canonical backend for cloud persistence, multi-device sync, and user accounts (Google Sign-In / email magic links), while preserving anonymous guest mode backed by localStorage.

### Convex function surface (planned, Phase 3)
- `users: getCurrentUser`, `users: upsertProfile`
- `journals: create`, `journals: list`, `journals: delete`, `journals: export`
- `lessonProgress: upsert`, `lessonProgress: list`
- `bookmarks: toggle`, `bookmarks: list`
- `sync: push` (local -> Convex on sign-in), `sync: pull` (Convex -> local)

### RLS-equivalent in Convex
Convex does not use SQL RLS. Instead, authorization is enforced inside every mutation/query via `ctx.auth.getUserIdentity()` and explicit ownership checks on `userId` fields. Every journal entry, lesson progress row, and bookmark carries `userId`; reads filter by the authenticated user's identity. Guest mode rows remain `userId: null` and local-only.

## Alternatives considered
- **Supabase (PostgreSQL + RLS):** Rejected. Requires a separate SQL schema layer, RLS policy authoring, and a Supabase client alongside React. Convex's single TypeScript surface reduces surface area and matches Rebirth's React/TS stack.
- **Firebase:** Rejected. NoSQL, weaker transactional guarantees, less TypeScript-native.

## Consequences
- Positive: TypeScript end-to-end, automatic React reactivity, built-in auth, ACID transactions, no RLS policy language to audit separately.
- Negative: Vendor lock-in to Convex; must model relational data (journal -> scripture bookmarks) in Convex's document store.
- Data sovereignty: prayer journal text is written by authenticated users only; Convex function authorization is the real boundary (enforcement at the mutation, not a client-side helper).

## Related
- docs/THEOLOGY.md (privacy of prayer journals)
- docs/AGENTS.md (fail closed at real boundary)
