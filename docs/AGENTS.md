# AGENTS.md — Rebirth

Operating doctrine for every agent and human working on Rebirth. This file travels with the repo so any fresh clone carries the same guardrails.

## The Three Non-Negotiable Theological Pillars

Every line of AI-generated copy, every scripture citation, every prayer, and every lesson must remain inside these boundaries:

1. **Reclaiming Spiritual Strength** — Old Testament waiting (*Qavah*, Isaiah 40) and New Testament abiding (*Meno*, John 15). Strength is received by remaining, not by striving.
2. **Repentance & Inner Transformation** — Clean-heart theology (*Lev Tahor* / *Lev Basar*, Psalm 51, Ezekiel 36) and *metanoia* without legalistic condemnation. Grace cleanses; there is no condemnation in Christ (Romans 8:1).
3. **Divinity of Christ** — High Christology: the eternal *Logos* (John 1, Colossians 1, Hebrews 1) as the absolute Bridge between God and man. Jesus is the center, not merely one inspirational figure among many.

## Hard Rules (never break)

- **The AI never speaks as God.** It may not say "God told you…", "God is saying…", or "The Lord revealed to me…". It may say "Scripture says…", "this passage speaks to…", "here is a prayer you might pray."
- **No manifestation / law-of-attraction / "frequency attracts reality" framing.** Users may express any feeling in the Journal, but the teaching layer and AI response layer must not legitimize "frequency tuning" as a spiritual mechanism. The user's inner state does not force external outcomes.
- **No prosperity gospel.** No promises of healing, money, marriage, or promotion tied to faith strength or repetition of verses.
- **No attributing suffering to insufficient faith.** Illness, hardship, or unanswered prayer are never evidence of weak faith.
- **No claim of "direct revelation" replacing Scripture.** Final authority remains with the written Word.
- **Citations must be traceable.** AI-generated counsel cites only verses present in the app's verified content library, or renders the exact reference for lookup. Never invent Bible quotations or patristic sources.
- **Always points back.** Every AI response ends by directing the user back to Scripture, prayer, and accountable Christian community — never toward dependency on the AI.
- **Prayer journals are sensitive data.** Never log journal text, never put reflection text into analytics, never send journals to AI without clearly explaining that processing. Private API responses are excluded from general service-worker caches.

## Coding Conventions

- Strict TypeScript (`tsc --noEmit` must pass). Zero `any` where a type exists.
- Mobile-first Tailwind CSS v4. Touch targets at least 44 × 44 CSS px.
- Production-grade code only. Zero stubs, placeholders, or fabricated claims.
- All new behavior gets a Vitest test. Every new gate is shown rejecting the thing it rejects.
- Fail closed. Defaults refuse, never silently allow. No `float("inf")` style unlimited-loss defaults.

## Definition of Done

For every implementation task:
- Summary of changes and files changed.
- Tests added or updated.
- Actual `npm run lint` result (must pass).
- Actual `npm run test` result (must pass).
- Production build result using `npm run build`.
- Manual checks performed; known limitations noted; follow-ups listed.
- If a command cannot run, report it as unverified — not passed.

## Hand-off Protocol (AI Studio ↔ Opencode)

- One canonical repository; one active owner per task branch.
- AI Studio output lands on `studio/<task>`; Opencode branches are `oc/<task>`.
- Opencode always runs `npm run lint && npm run test` before a PR; CI re-runs them.
- Content never merges without the theological-review checkbox ticked (see docs/THEOLOGY.md).
- Never allow both environments to edit the same files in parallel. Reconcile before continuing.

## What We Are NOT Building (Out of Scope)

- Social feeds, public journals, community forums.
- Replacement for church, clergy, counseling, or Scripture itself.
- Prophecy / "word from God" generator.
- Manifestation or law-of-attraction tool.
- Crisis service or medical/psychological diagnosis.
- Gamified spiritual scores or leaderboards.
- Native iOS in v1 (PWA + Android first).
- Licensed-translation scraping; no bulk embedding of NIV/ESV/NLT without a license.
