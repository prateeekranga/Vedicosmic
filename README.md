# VediCosmic

> Free Vedic astrology, panchang, numerology and daily-practice tools — **vedicosmic.com**.

VediCosmic is a React single-page application. Every tool computes its result in the visitor's browser, and
nothing typed into a tool is sent to a server. Some astronomy results are approximate until the Phase 2 engine
ships; each tool says so.

---

## ✦ Where things live

- **Routes, tools and tool counts:** `src/content/routes.ts` (single source of truth; use `liveTools()` for any
  stated count). Tool components are registered in `src/tools/registry.tsx`. Full list: `docs/inventory.md`.
- **Calculations:** `src/engine/` (pure, tested) and `src/lib/astronomy.ts`, `panchang.ts`, `nakshatra.ts`,
  `sunEvents.ts` (approximate; replaced in Phase 2). Reference charts: `tests/golden/vectors.json`.
- **People:** `src/content/people.ts` — only verified people are shown, with only what they have confirmed.
- **Legal details:** `src/content/legal.ts` — `/legal` stays hidden until the owner's details are filled in.
- **Visitor progress:** `src/contexts/DeviceStoreContext.tsx` — kept in the browser only; no accounts.
- **Blog:** static posts in `src/data/blog/posts/`, plus database posts written in the admin (Supabase).
- **Upgrade records:** `docs/` — live-vs-repo report, Lighthouse baselines, inventory, claims removed.

## ✦ Checks

```bash
npm test                         # Vitest, run under Asia/Kolkata and America/New_York
npm run build                    # build + sitemap + (locally) prerender, then scripts/check-claims.mjs
node scripts/smoke.mjs <url>     # browser smoke test against a served build
```

`scripts/check-claims.mjs` fails the build if an invented claim (courses, ratings, user counts, people who are not
real) or an `[OWNER TO PROVIDE]` marker would reach the built site.

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

## ✦ Deploying to VediCosmic.com (Hostinger)

Production is **vedicosmic.com on Hostinger**, deployed by Hostinger's Git auto-deploy: every push to `main`
is built by Hostinger (`npm install && npm run build`, Node 18) and `dist/` goes live. Merging to `main` is a
production deploy.

- Hostinger's build has no browser, so the `postbuild` prerender and OG-image steps log "skipped" and the
  site ships as a client-side SPA. Run `npm run build` locally (with Chrome installed) to see the prerendered
  output. Until builds move to GitHub Actions, every dependency must install and run on Node 18.
- SPA routing on Hostinger comes from `public/.htaccess`. `vercel.json` is a leftover and is not used.
- The Supabase URL and anon key have hard-coded fallbacks; `.env.example` documents the optional overrides.

`npm run build:standalone` produces a single-file HashRouter build in `dist-standalone/` (not deployed, not
committed).

---


## ✦ Privacy

What visitors type into tools, and anything they choose to save, stays in their own browser. There is no
analytics or advertising. The blog's database posts and the admin login use Supabase; fonts load from Google
Fonts. See `src/pages/legal/PrivacyPolicy.tsx` for the visitor-facing wording.

---

*© VediCosmic — vedicosmic.com. All readings are for reflection and entertainment.*
