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
npm run build                    # static pages, sitemaps, .htaccess, share cards, then scripts/check-claims.mjs
npm run verify                   # every pre-rendered page: one h1, title/description lengths, canonical, og image, JSON-LD
npm run smoke -- <url>           # browser smoke test against a served build (npx serve dist)
npm run check:server -- <url>    # HTTP checks of a deployed site: 404s, redirects, headers
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

# 4. Serve the built site locally (real 404s, like production)
npx serve dist
```

> Requires Node.js 18+.

---

## ✦ Deploying to VediCosmic.com (Hostinger)

Production is **vedicosmic.com on Hostinger**. The site is built in GitHub Actions (`.github/workflows/ci.yml`)
and published as finished files; Hostinger's Git auto-deploy serves them.

1. Every push to `main` or an `upgrade/**` branch runs the checks: type-check, lint, tests, the build,
   `verify-prerender`, the link check, the smoke test, axe and Lighthouse.
2. If they all pass, the built `dist/` is pushed (by `scripts/publish-branch.sh`) to a branch Hostinger watches:
   `main` → **`deploy`** (vedicosmic.com), `upgrade/**` → **`staging`** (staging.vedicosmic.com, never indexed).
   Merging to `main` is therefore a production deploy. Never edit `deploy` or `staging` by hand.
3. A scheduled run at 00:05 IST rebuilds production so pre-rendered pages carry the new day's values. It only
   publishes when something changed.
4. Roll back by re-running the workflow on an earlier commit of `main` (Actions → CI → Run workflow), or by
   pushing an earlier `deploy` commit back to the `deploy` branch.

How the build works: `vite build` makes the browser bundle; `vite build --ssr src/entry-server.tsx` makes a
Node bundle that `scripts/ssg.mjs` uses to render every page to HTML (no browser needed), which the browser then
hydrates. Tools render in the browser after the page loads. `scripts/generate-htaccess.mjs` writes the server
rules (real 404s, one URL per page, redirects from `src/content/redirects.ts`, caching and security headers).
Share cards need a browser and are made in CI.

- Blog posts written in the admin appear as pages at the next build (the daily one, or a manual run).
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
