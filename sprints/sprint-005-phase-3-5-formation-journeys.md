# Sprint 005 — Phase 3.5: Formation Journeys Content (complete)

## Goal
Ship the Formation Journeys library (6 biblical figures + Christ capstone) with the fixed formation template, locked by theological integrity tests.

## Scope (in this sprint)
- `src/data/journeysData.ts` — FormationJourney type + 7 journeys (Joseph, Moses, David, Nehemiah, Ruth, Paul, Jesus Christ)
- Fixed template: theGap · theCall · theObjection · theFormation · theObedience · theFailure · theFruit · thePractice · christConnection
- `src/__tests__/journeys.test.ts` — 6 theological integrity tests (3-pillar coverage, figure set, full template, Christ-connection, no manifestation/prosperity language)

## Scope (out of this sprint)
- Journeys UI screens (journey selection, progress, audio playback) — future phase
- Deuterocanon content (Tier 2) — future phase, labeled by tradition

## Theological positioning
- Adopts the Formation Journeys reframe (closes the gap between where user is and where they want to be via biblical case studies)
- Drops law-of-attraction / "frequency attracts reality" framing
- Every journey points to Christ; high Christology pillar centered in the Christ capstone

## Acceptance criteria
- [ ] `npm run lint` clean
- [ ] `npm run test` green (28 total incl. 6 new)
- [ ] Christ journey centers the Logos (divinity_of_christ theme, fulfillment language)

## Status
Complete — green.
