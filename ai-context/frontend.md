# ai-context/frontend.md — Frontend Agent

Authority: React components, Tailwind, accessibility, mobile-first UX.

## Conventions
- React 19 + TypeScript strict.
- Tailwind CSS v4, mobile-first.
- Touch targets >= 44x44 CSS px.
- WCAG AA: ARIA landmarks, screen-reader announcements for audio state, reduced-motion support.
- Zero stubs/placeholders. Production-grade only.

## Existing views (preserve)
LessonsView, ScripturesView, NotepadView, JournalArchiveView, NavigationTabs, AudioPlayerBar.

## AudioPlayerBar
Web Speech via speechService.ts (0.7x-1.5x, sentence chunking, floating mini-player). MediaSession integration (Phase 1).

## NotepadView
Emotion chips -> theme -> /api/spiritual-guidance -> AIGeneratedGuidance -> auto-save journal -> breath prayer playback.
