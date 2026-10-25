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

The production PWA and API health endpoint are deployed. Google OAuth has been
verified in desktop and Android Chrome; the account panel reports a connected
account after reload on both clients. A synthetic journal entry was manually
backed up to Convex, restored on Android, deleted there, and the deletion was
backed up and restored on desktop. The test entry is absent from both clients
and cloud; existing lesson progress was preserved. Gemini is not configured
in production (`hasApiKey: false`), so counsel uses the deterministic
theological fallback rather than a live model. Email magic-link and Web Push
delivery still need live acceptance testing. Native Android narration builds,
but lock-screen playback is not yet device-verified; the last connected-device
check reported 411 MB free, below Android's 1 GiB low-storage threshold for
installing the APK. The phone disconnected before native acceptance could resume.

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

- 🎧 **Audio Lessons & Narration:**
  Browser speech synthesis narrates lessons and Scripture studies in the web/PWA. The Capacitor Android app includes an on-device Android TTS foreground service with notification and lock-screen controls. The native path requires an installed offline English voice and is awaiting physical-device acceptance; browser speech may stop when the device locks.
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
  Installable application shell and cached public content. App navigations are network-first, so a deployed update is picked up on the next load instead of pinning the installed app to a stale bundle. Private journal entries and AI responses are excluded from the service-worker cache, and API routes are never cached.

---

## Privacy

- Journal entries and generated counsel are stored in this browser's local storage. The app does not encrypt this browser storage; protect access to your device.
- AI reflection requires an explicit consent checkbox. The entry is sent to Rebirth's API server, screened for crisis language, and, when configured, sent to Google Gemini for a response. The server logs request metadata (such as route, status, duration, and IP address), not journal text. AI results are saved locally after a successful response; they are not automatically uploaded to Convex.
- Signed-in users can manually import local records to Convex and restore cloud records to a device. This is not live synchronization. Repeat the manual backup after making local changes.
- JSON/Markdown exports can contain sensitive reflections. Store and share exported files carefully. JSON device restore applies supported journal, bookmark, progress, and preference data; cloud-only records included in an account export are archival and are not recreated by device restore. Exports do not contain sign-in credentials or browser push subscription keys.
- Data deletion removes devotional records from local storage and the signed-in user's Convex data, and unsubscribes this browser from push notifications. The authentication account remains; a minimal deletion timestamp is retained locally and in Convex to prevent an older backup from restoring deleted journal entries.
- The crisis screen provides general emergency guidance and a link to [Find A Helpline](https://findahelpline.com/). It is not monitored, is not a substitute for emergency or professional support, and may not detect every crisis. If you or someone else may be in immediate danger, contact local emergency services.

### Production boundaries

- API responses are sent with `Cache-Control: no-store`; the production CSP,
  HSTS, frame denial, and nosniff headers are defined in both `server.ts`
  (via `src/utils/securityHeaders.ts`) and `vercel.json`. A test fails if the
  two CSP copies drift.
- Every Gemini call reserves budget before contacting the provider. Once the
  daily cap is exhausted the API returns `503 SPEND_CAP_REACHED` and the UI
  falls back to curated counsel; crisis support is static and never charged.
- The budget counters and rate limiters are in memory, so on multi-instance
  hosting the effective ceiling is per instance. Treat the cap as a
  cost-bounding guardrail, not an accounting system.
- If `VITE_CONVEX_URL` is missing or malformed, Rebirth renders an explicit
  configuration screen instead of a blank page. Cloud backup then remains
  unavailable until the app is rebuilt with a valid deployment URL.

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
│   │   ├── speechService.ts        # Browser SpeechSynthesis controller with chunking
│   │   └── backgroundNarration.ts  # Native Android narration plugin contract
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

# Optional AI budget guardrails (server-side). Invalid values fail closed.
GEMINI_DAILY_SPEND_CAP_USD=5.00
GEMINI_ESTIMATED_REQUEST_COST_USD=0.01
```
Configure Convex development and populate its generated frontend URLs:
```bash
npx convex dev
```

`VITE_CONVEX_URL` is read at build time and is required for the app to start;
without it Rebirth shows a configuration screen rather than a blank page. The
development command writes it to `.env.local` (gitignored).

For authentication, set these variables in the Convex deployment environment:
`AUTH_SECRET`, `JWT_PRIVATE_KEY` (PKCS#8 RSA private key), and `JWKS` (the
matching public key set),
`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM`.
Register Google OAuth callback URLs using the Convex Auth site
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

### Native Android build

The Android wrapper requires Android Studio/SDK (API 36) and JDK 21:

```bash
npm ci
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

Install the generated debug APK from `android/app/build/outputs/apk/debug/`
on an Android device. Grant notification permission and ensure an offline
English text-to-speech voice is installed to use background narration. The
foreground service, notification, lock-screen, and offline-voice behavior
must be verified on a physical device before relying on it.

---

## 🧪 Testing Strategy

`npm run lint`, `npm test`, and `npm run build` are the required web checks.
The automated suite currently contains 80 tests covering theological
guardrails, curriculum, journeys, haptics, daily contemplation, backup
integrity, streak calculation, spaced repetition, API security headers, the
spend cap, the real `public/sw.js` cache policy (executed in a VM), CSP
consistency between the server and Vercel, and accessibility contracts.
PWA installation, offline startup after a deploy, notifications, OAuth, and
native background audio still require browser/device and configured-provider
acceptance checks.

---

## 🤝 Contributing

Contributions that enrich theological depth, expand linguistic insights, or enhance mobile accessibility are warmly welcomed! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code style, theological review standards, and pull request process.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
