# ai-context/architect.md — Architect Agent

Authority: Final word on offline-first, dependencies, ADRs, and stack preservation.

## Stack (preserve, do not rewrite)
React 19, TypeScript strict, Vite, Tailwind CSS v4, Express + @google/genai, Web Speech audio, navigator.vibrate haptics, localStorage (guest) -> Convex (Phase 3 sync), Vitest, GitHub Actions CI.

## Conventions
- Strict TypeScript (tsc --noEmit clean). Zero `any` where a type exists.
- Mobile-first Tailwind. Touch targets >= 44x44 CSS px.
- Production-grade only. Zero stubs/placeholders/fabricated claims.
- Fail closed. Defaults refuse, never silently allow.

## PWA audio correction (ADR-002/004)
navigator.mediaSession = lock-screen metadata + playback interactions. Does NOT keep Web Speech alive on lock screen. Reliable background audio (Phase 4) = real audio assets / HTMLMediaElement, no silent-audio keep-alive.

## Dependencies
No new npm dependencies without explicit human approval. Justify against existing packages.
