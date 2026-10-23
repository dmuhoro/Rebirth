# Rebirth: Contemplative Christian Devotional & Audio Exegesis

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38b2ac.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-729B1B.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> *"Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come."* — 2 Corinthians 5:17

**Rebirth** is an open-source, mobile-first contemplative Christian devotional application engineered for modern disciples. Designed specifically for thumb-friendly Android and mobile browser usage, Rebirth bridges academic Christology, original-language biblical exegesis (Hebrew and Greek), and spiritual disciplines with hands-free Web Speech audio narration and dynamic, AI-guided pastoral counseling.

---

## 📖 Recommended Repository Details

* **Repository Name:** `rebirth-devotional`
* **Short Description:** *Contemplative Christian audio devotional, original-language scripture exegesis, and AI-guided prayer notepad for Android and mobile web.*
* **Repository Topics:**
  `christian-devotional`, `theology`, `christology`, `audio-devotional`, `web-speech-api`, `react`, `typescript`, `gemini-api`, `spiritual-disciplines`, `mobile-web`, `contemplative-prayer`, `vitest`

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
  Hands-free audio playback powered by the native browser Web Speech API. Listen to multi-part theological expositions, patristic voices (St. Augustine, St. Athanasius, Martin Luther), and guided breath prayers on walks, during commutes, or in quiet meditation.
- ⚡ **Tactile Android Haptic Feedback:**
  Integrated haptic engine (`navigator.vibrate`) providing physical tactile responses during tab navigation, prayer generation, and bookmarking.
- 📜 **Original-Language Scripture Studies:**
  Exhaustive exegetical guides featuring Hebrew and Greek linguistic breakdowns (transliteration, original script, lexical meaning, and theological significance), historical contexts, and explicit Christological bridges.
- 🕊️ **Daily Contemplation & Deep-Linking:**
  Rotating daily scripture contemplation with reflective prompts that deep-link directly into the spiritual notepad.
- ✍️ **AI Spiritual Notepad & Pastoral Counsel:**
  Express honest emotions, spiritual dryness, contrition, or anxiety. The integrated Gemini API generates grounded pastoral guidance, reassuring scripture promises, customized prayers in Jesus' Name, and centered breath prayers.
- ⭐ **Spiritual Archive, Progress Tracking & Favorites:**
  Dedicated favorites tab for bookmarked prayers and insights, persistent reading progress tracking across lessons, and local offline storage.
- 🎚️ **Adaptive Playback Engine:**
  Real-time speech rate slider (0.7x to 1.5x) with quick presets, active sentence scrubbing, background listening persistence, and floating mini-player bar.

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
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Note: If no API key is provided, the application gracefully provides grounded, theological fallback responses so the application remains fully functional).*

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

The repository includes test suites checking:
1. **Theological Curriculum Integrity:** Verifies coverage of all three foundational themes, patristic quotes, breath prayers, and Hebrew/Greek lexical structures.
2. **Tactile Haptic Engine:** Validates non-blocking fallback behavior across varying browser environments and mobile devices.
3. **Daily Contemplation & Deep-Linking:** Verifies correct prompt interpolation and emotion mapping when transferring daily verses into the prayer notepad.

---

## 🤝 Contributing

Contributions that enrich theological depth, expand linguistic insights, or enhance mobile accessibility are warmly welcomed! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code style, theological review standards, and pull request process.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
