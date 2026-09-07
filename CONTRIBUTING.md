# Contributing to Rebirth

Thank you for your interest in contributing to **Rebirth**! This project blends faithful Christian theology, original-language exegesis, contemplative spiritual disciplines, and modern mobile-first web engineering.

We welcome contributions ranging from bug fixes and UI accessibility enhancements to additional scripture studies, patristic voices, and performance optimizations.

---

## 🕊️ Theological Foundation & Guiding Principles

When contributing theological content, commentary, or curriculum updates, all materials must adhere to the three permanent pillars:

1. **Reclaiming Spiritual Strength:** Rooted in the Old Testament concept of waiting upon the Lord (*Qavah* - Isaiah 40) and the New Testament discipline of abiding in Christ the True Vine (*Meno* - John 15).
2. **Repentance and Inner Transformation:** Emphasizing God's gift of a new heart of flesh (*Lev Basar* - Ezekiel 36) over legalistic moralism, and true biblical repentance (*Metanoia*) under grace without condemnation.
3. **Divinity of Christ:** High Christology grounded in John 1:1, Colossians 1:15-20, and Hebrews 1:1-3, maintaining Christ as the eternal *Logos* and the absolute Bridge to the Father.

Please ensure scripture citations are faithful, linguistic terms in Hebrew and Greek include accurate transliteration and lexical definitions, and all contemplative practices point directly to Christ.

---

## 💻 Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/rebirth-devotional.git
cd rebirth-devotional
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Branch Naming Conventions
Create a descriptive branch for your work:
- `feat/linguistic-study-philippians`
- `fix/audio-scrubber-safari`
- `docs/contributing-guidelines`

### 4. Code Standards & Guidelines
- **TypeScript:** Strict typing throughout. Avoid `any`. Place shared interfaces in `src/types.ts`.
- **Styling:** Use Tailwind CSS utility classes exclusively. Maintain the contemplative dark palette with warm gold/cream accents (`#0c0e12`, `#d4af37`, `#e5c158`, `#f7f4ec`).
- **Mobile First:** Ensure all touch targets are at least 44px on mobile screens, thumb-friendly, and responsive.
- **Icons:** Use `lucide-react`. Do not inject custom raw SVGs.
- **Modularity:** Extract reusable views and widgets into `src/components/`.

---

## 🧪 Verification & Testing

Before submitting a Pull Request, verify that all linting, tests, and builds succeed:

```bash
# 1. Run typecheck / lint
npm run lint

# 2. Run unit test suite
npm run test

# 3. Test production bundle build
npm run build
```

Ensure new features or theological additions include corresponding tests in `src/__tests__/`.

---

## 📬 Submitting a Pull Request

1. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against `main`.
3. Provide a clear, detailed PR description:
   - What changed and why.
   - Any theological references or UI changes.
   - Confirmation that `npm run test` and `npm run lint` passed.

We look forward to collaborating with you in building tools that draw hearts closer to Christ!
