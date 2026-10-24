# Rebirth: Contemplative Christian Devotional & Audio Exegesis

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38b2ac.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-729B1B.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> *"Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come."* — 2 Corinthians 5:17

**Rebirth** is an open-source, offline-first contemplative Christian devotional for mobile browsers and Android. It brings together Christ-centered Scripture studies, original-language exegesis, formation journeys, private journaling, optional cloud backup/restore, and AI-guided pastoral reflection.

## Live deployment

- **Live App:** [https://rebirth-devotional.vercel.app](https://rebirth-devotional.vercel.app/)
- **Vercel project:** [rebirth-devotional](https://vercel.com/dmuhor01/rebirth-devotional)
- **Convex production deployment:** [accomplished-kiwi-69](https://dashboard.convex.dev/t/dmuhoro/rebirth/accomplished-kiwi-69)

The production PWA and API health endpoint are deployed. Google OAuth is
configured, and the developer reports that the redirect mismatch is resolved;
the complete sign-in/session flow still needs end-to-end confirmation. Guest
mode is available. Gemini counsel is currently unavailable in production
because `GEMINI_API_KEY` is not configured. Email magic-link and Web Push
delivery still need live acceptance testing.

---

## 📖 Recommended Repository Details

* **Live App:** [https://rebirth-devotional.vercel.app](https://rebirth-devotional.vercel.app)  
* **GitHub Repository:** [https://github.com/dmuhoro/Rebirth](https://github.com/dmuhoro/Rebirth)  
* **Repository Name:** `rebirth-devotional`
* **Short Description:** *Offline-first Christian devotional with Scripture studies, private cloud backup, and AI-guided prayer for mobile web.*
* **Repository Topics:**
  `christian-devotional`, `theology`, `christology`, `pwa`, `offline-first`, `convex`, `web-push`, `react`, `typescript`, `gemini-api`, `spiritual-disciplines`, `mobile-web`, `contemplative-prayer`, `vitest`

---

## 🌟 Core Theological Pillars

Every lesson, scripture study, prayer prompt, and AI pastoral model is permanently grounded in three biblical foundations:

### 1. Reclaiming Spiritual Strength
* **Theology:** Old Testament waiting on the Lord (*Qavah*) and New Testament abiding in the Vine (*Meno*).
* **Scripture Anchors:** Isaiah 40:28–31, John 15:1–8, Psalm 27:14.
* **Core Insight:** In Hebrew, *Qavah* describes braiding fragile human strands with God's unbreakable cord. Renewal is not self-manufactured willpower; it is an active, expectant divine exchange of our human exhaustion for His uncreated life.

### 2. Understanding Repentance and Inner Transformation
* **Theology:** Clean heart theology (*Lev Tahor*), moving from legalistic behavior modification to an ontological heart of flesh (*Lev Basar*).
* **Scripture Anchors:** Ezekiel 36:26–27, Psalm 51:10–12, Romans 8:1–4.
* **Core Insight:** Biblical repentance (*Metanoia*) is turning away from the idol of self-justification toward the beauty of Christ. Grace cleanses at the cellular level of the spirit, eliminating condemnation.

### 3. Exploring the Divinity of Christ
* **Theology:** High Christology, the eternal *Logos*, cosmic reconciler, and absolute Bridge between fallen humanity and the Father.
* **Scripture Anchors:** John 1:1–14, Colossians 1:15–20, Hebrews 1:1–4.
* **Core Insight:** Christ is not merely an exemplary moral teacher; He is the uncreated Creator through whom and for whom all things exist, holding the cosmos and our hearts together.

---

## ✨ Key Features

- 🎧 **Comprehensive Audio Lessons & Narration:**
  Browser speech synthesis narrates lessons and Scripture studies. Media Session metadata and playback controls are supported where the browser provides them. Browser speech may pause when the device locks; persistent background narration requires pre-rendered recordings and is not yet available.
- ⚡ **Tactile Android Haptic Feedback:**
  Integrated haptic engine (`navigator.vibrate`) providing physical tactile responses during tab navigation, prayer generation, and bookmarking.
- 📜 **Original-Language Scripture Studies:**
  Exhaustive exegetical guides featuring Hebrew and Greek linguistic breakdowns (transliteration, original script, lexical meaning, and theological significance), historical contexts, and explicit Christological bridges.
- 🕊️ **Daily Contemplation & Deep-Linking:**
  Rotating daily scripture contemplation with reflective prompts that deep-link directly into the spiritual notepad.
- ✍️ **AI Spiritual Notepad & Pastoral Counsel:**
  With explicit consent, reflections can be processed by Gemini for pastoral guidance, Scripture, and prayer. An immediate-risk screen returns static crisis resources without calling AI; this is not a crisis service and cannot identify every emergency.
- ⭐ **Spiritual Archive, Progress Tracking & Favorites:**
  Journals, bookmarks, lesson progress, formation journeys, streak calculations, and spaced-repetition scheduling. Guest data stays in local storage; signed-in users can manually back up local records to Convex or restore cloud records to the current device. Repeat the backup after local changes.
- 🎚️ **Adaptive Playback Engine:**
  Adjustable speech rate, playback controls, and a floating mini-player.
- 🔐 **Account & Manual Backup:**
  Google OAuth and passwordless email sign-in, with guest mode and user-initiated backup and restore. Convex functions enforce ownership at the data boundary; there is no automatic cross-device sync.
- 🔔 **Opt-in Web Push:**
  Per-device subscription and a test notification flow. Delivery requires VAPID configuration; browser permission is requested only after the user opts in.
- 📲 **Offline PWA:**
  Installable application shell and cached public content. Private journal and AI responses are excluded from the service-worker cache.

---

## Privacy

- Journal entries and generated counsel are stored in this browser's local storage. The app does not encrypt this browser storage; protect access to your device.
- AI reflection requires an explicit consent checkbox. The entry is sent to Rebirth's API server, screened for crisis language, and, when configured, sent to Google Gemini for a response. The server logs request metadata (such as route, status, duration, and IP address), not journal text. AI results are saved locally after a successful response; they are not automatically uploaded to Convex.
- Signed-in users can manually import local records to Convex and restore cloud records to a device. This is not live synchronization. Repeat the manual backup after making local changes.
- JSON/Markdown exports can contain sensitive reflections. Store and share exported files carefully. JSON device restore applies supported journal, bookmark, progress, and preference data; cloud-only records included in an account export are archival and are not recreated by device restore. Exports do not contain sign-in credentials or browser push subscription keys.
- Data deletion removes devotional records from local storage and the signed-in user's Convex data, and unsubscribes this browser from push notifications. The authentication account remains; a minimal deletion timestamp is retained locally and in Convex to prevent an older backup from restoring deleted journal entries.
- The crisis screen provides general emergency guidance and a link to [Find A Helpline](https://findahelpline.com/). It is not monitored, is not a substitute for emergency or professional support, and may not detect every crisis. If you or someone else may be in immediate danger, contact local emergency services.

---

## 🛠️ Architecture & Tech Stack

```
rebirth/
├── server.ts                 # Express full-stack proxy & Gemini API backend
├── src/
│   ├── components/           # Modular UI views & player controls
│   │   ├── AudioPlayerBar.tsx      # Web Speech audio engine with speed sliders
│   │   ├── JournalArchiveView.tsx  # Spiritual journal, favorites & discipline history
│   │   ├── LessonsView.tsx         # Theological curriculum, progress bars & daily verse
│   │   ├── NavigationTabs.tsx      # Mobile thumb-navigation bar with haptics
│   │   ├── NotepadView.tsx         # AI-guided prayer notepad & deep-linked prompt
│   │   └── ScripturesView.tsx      # Hebrew/Greek linguistic exegesis cards
│   ├── context/
│   │   └── DevotionalContext.tsx   # Persistent state (lessons, favorites, journal)
│   ├── data/
│   │   ├── lessonsData.ts          # Core lessons, patristic voices & breath prayers
│   │   └── scripturesData.ts       # Exegetical scripture studies & linguistic insights
│   ├── services/
│   │   └── speechService.ts        # Browser SpeechSynthesis controller with chunking
│   ├── utils/
│   │   └── haptics.ts              # Tactile vibration utility for mobile devices
│   ├── types.ts                    # Strict TypeScript interfaces & theological types
│   └── __tests__/                  # Vitest comprehensive unit test suite
│       ├── dailyContemplation.test.ts
│       ├── haptics.test.ts
│       └── theology.test.ts
├── .github/
│   └── workflows/ci.yml      # Automated GitHub Actions test & build pipeline
└── package.json
```

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/dmuhoro/Rebirth.git
cd Rebirth

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and provide your Google Gemini API key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```
Configure Convex development and populate its generated frontend URLs:
```bash
npx convex dev
```

For authentication, set these variables in the Convex deployment environment:
`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, and
`EMAIL_FROM`. Register Google OAuth callback URLs using the Convex Auth site
URL (`https://<deployment>.convex.site/api/auth/callback/google`). For local
development only, magic links can be printed to the Convex development logs by
setting `EMAIL_LINK_DEV_MODE=true`; production email sign-in requires Resend
configuration and otherwise fails closed.

For Web Push, generate a VAPID key pair and set `VAPID_PUBLIC_KEY`,
`VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` in Convex. Set the matching public key
as `VITE_WEB_PUSH_PUBLIC_KEY` before building the frontend. Never expose the
private VAPID key with a `VITE_` variable.

Without `GEMINI_API_KEY`, AI-guided reflection uses the project's grounded
fallback response.

### Running Locally
```bash
# Start dev server (Express + Vite on port 3000)
npm run dev
```
Open your browser at `http://localhost:3000`.

### Running Tests
```bash
# Run Vitest test suite
npm run test

# Run tests in watch mode
npm run test:watch
```

### Code Quality & Build
```bash
# Check TypeScript types
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

---

## 🧪 Testing Strategy

`npm run lint`, `npm test`, and `npm run build` are the required local checks.
The current automated suite contains 41 tests covering theological guardrails,
curriculum, journeys, haptics, daily contemplation, streak calculation, and
spaced repetition. PWA installation, offline startup, notifications, OAuth, and
background audio still require browser/device and configured-provider checks.

---

## 🤝 Contributing

Contributions that enrich theological depth, expand linguistic insights, or enhance mobile accessibility are warmly welcomed! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code style, theological review standards, and pull request process.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
