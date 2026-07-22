# VediCosmic — The Inner Journey

> Ancient Vedic wisdom, interactive tools, and modern clarity — a heavily-animated spiritual web experience built for **VediCosmic.com**.

VediCosmic is a single-page React application that turns timeless contemplative traditions into ten living, browser-side tools and a catalogue of eight guided courses. Every reading is computed in real time from real formulas — nothing is random, and nothing leaves your device.

---

## ✦ Features

### Ten interactive tools
| Tool | What it does |
|------|--------------|
| **Numerology Reading** | Life Path, Expression, Soul Urge & Personality numbers from name + birth date, with full reduction trails. |
| **Mobile Number Analysis** | Vibrational profile of any phone number — digit frequency, root number, and life-path compatibility. |
| **Vedic Astrology** | Sidereal Sun, Moon & Ascendant placement on an animated Rashi wheel, computed for any date, time and city. |
| **Chakra Assessment** | A 21-question journey rendered as an animated seven-point energy radar. |
| **Mantra Japa Timer** | A 108-bead counter with eight sacred mantras and a persistent practice streak. |
| **Sacred Yantra Studio** | Eight procedurally-drawn, animated sacred-geometry yantras with the mathematics behind each. |
| **Biorhythm Chart** | Physical, emotional and intellectual cycles plotted around today. |
| **Planetary Hours (Hora)** | Live day/night planetary-hour ruler for any city, updating in real time. |
| **Crystal Guide** | Filter twelve crystals by intention and build your own kit. |
| **Daily Tarot** | One deterministic card per day with a reflective journal. |

### Eight guided courses
Vedic Astrology, Kundalini Awakening, Sacred Geometry & Yantras, Numerology Mastery, Meditation & Pranayama, Chakra Healing, Vastu Shastra, and Vedic Mantra Science — each with modules, lessons, instructor profiles, previews and reviews.

### Experience
- Animated starfield + rotating Sri Yantra hero, floating sacred glyphs, page transitions, scroll reveals.
- Local-first mock accounts (SHA-256 via Web Crypto) — save readings, keep a tarot journal, build a crystal kit, track a mantra streak.
- Fully responsive, keyboard-accessible, and `prefers-reduced-motion` aware.

---

## ✦ Tech stack

- **React 18** + **TypeScript 5**
- **Vite 5** (build + dev server)
- **Tailwind CSS 3** (custom cosmic theme)
- **Framer Motion 11** (animation)
- **React Router v6** (routing, lazy-loaded pages)
- **Recharts** (biorhythm visualisation)
- **lucide-react** (icons)

---

## ✦ Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server (http://localhost:5173)
npm run dev

# 3. Type-check + production build
npm run build

# 4. Preview the production build locally
npm run preview
```

> Requires Node.js 18+.

---

## ✦ Deploying to VediCosmic.com (Vercel)

The repository ships with `vercel.json` (SPA rewrites already configured).

1. Push this project to a Git repository.
2. In Vercel, **Import Project** and select it. Framework preset: **Vite** (auto-detected).
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add your domain **vedicosmic.com** under **Settings → Domains**.
4. Deploy. Any static host works too (Netlify, Cloudflare Pages, S3+CloudFront) — just serve `dist/` and route all paths to `index.html`.

No environment variables are required for the current experience. `.env.example` documents the keys that a future hosted backend would use.

---

## ✦ Project structure

```
vedic-cosmic/
├─ public/                 # favicon and static assets
├─ src/
│  ├─ components/
│  │  ├─ auth/             # AuthModal
│  │  ├─ effects/          # Starfield, SriYantra, FloatingGlyphs
│  │  ├─ layout/           # Navbar, Footer, Layout
│  │  └─ ui/               # Button, Card, Badge, Modal, Field, Accordion, …
│  ├─ contexts/            # AuthContext, ToastContext
│  ├─ data/                # numerology, zodiac, chakras, crystals, tarot,
│  │  │                    #   mantras, yantras, courses, tools registry
│  ├─ hooks/               # useLocalStorage, usePrefersReducedMotion
│  ├─ lib/                 # numerology, astronomy, format (the real math)
│  ├─ pages/               # Home, Tools, ToolPage, Courses, CourseDetail,
│  │                       #   About, Contact, NotFound
│  ├─ tools/               # the ten tool components
│  ├─ types/               # shared TypeScript types
│  ├─ styles/globals.css   # Tailwind layers + theme tokens
│  ├─ App.tsx              # router
│  └─ main.tsx             # entry
├─ index.html
├─ tailwind.config.ts
├─ vite.config.ts
└─ vercel.json
```

---

## ✦ Scope note — MVP vs. Phase 2

This build is the **MVP**: a complete, deployable front-end where all logic, content and persistence run client-side (local storage). It is fully functional offline-of-a-server.

**Phase 2** (out of scope here) would add a hosted backend: real user accounts, a payments integration for course purchases, server-side persistence, and email. The data and auth layers are deliberately structured so that swapping local storage for live API calls is a contained change.

---

## ✦ Privacy

Your inputs and saved data live only in your own browser. There is no analytics server or third-party tracking in this experience.

---

*© VediCosmic — vedicosmic.com. All readings are for reflection and entertainment.*
