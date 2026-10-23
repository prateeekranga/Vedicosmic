# Lighthouse baselines (Phase 0, 23 Oct 2026)

Mobile Lighthouse, 3 runs per page, before any upgrade work. Raw reports: `<page>-run<N>.json` in this folder.

## How they were measured

- **What:** a production build of commit `174feba` (tag `pre-upgrade-2026-10`), byte-identical to what
  vedicosmic.com serves (same hashed asset names; see `docs/live-vs-repo.md`). Built the way Hostinger builds it
  (`tsc -b && vite build`, no prerender), served locally with gzip (`serve@14.2.4 -s dist`).
- **Why not the live URL:** Hostinger's CDN answered Lighthouse's headless Chrome with HTTP 403 on all 15 runs,
  and the free PageSpeed Insights API quota was exhausted.
- **Tool:** Lighthouse 12.8.2, default mobile settings (simulated 4G throttling, 4× CPU slowdown), Chrome 155 headless.
  Use the same version for every later comparison.
- **Caveat:** this machine is fast (Lighthouse benchmark index 2409), and simulated throttling only partly corrects
  for that. Expect lower scores on PageSpeed Insights or a real mid-range Android phone. The earlier audit measured
  performance 33 and LCP 7.3 s on its setup; treat the numbers below as a like-for-like reference for later phases,
  not as what visitors experience.

## Medians

| Page | Perf | A11y | Best practices | SEO | LCP | TBT | CLS | FCP | Perf, 3 runs |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 56 | 98 | 100 | 100 | 6.6 s | 487 ms | 0.000 | 3.4 s | 58, 56, 44 |
| `/tools/sadhana` | 59 | 96 | 79 | 100 | 6.6 s | 383 ms | 0.000 | 3.4 s | 54, 59, 69 |
| `/tools/nakshatra` | 61 | 95 | 100 | 100 | 6.1 s | 397 ms | 0.000 | 3.3 s | 60, 66, 61 |
| `/tools/planetary-hours` | 69 | 96 | 100 | 100 | 5.8 s | 208 ms | 0.000 | 3.3 s | 71, 60, 69 |
| `/blog/best-time-to-meditate-morning-vs-evening` | 70 | 92 | 79 | 100 | 5.7 s | 103 ms | 0.022 | 3.7 s | 66, 72, 70 |

Homepage total transfer: 848 KB (median of 3 runs). Budget from the Master brief: performance ≥ 90, LCP ≤ 2.5 s, TBT ≤ 200 ms,
CLS ≤ 0.1. The SEO score of 100 is misleading: Lighthouse scores the page after JavaScript has run, while the raw
HTML that crawlers and link previews read is empty.

## Still to collect

Search Console exports (queries, pages, indexed pages) from the owner, to be saved here.

## After Phase 1 (same method, `phase-1/`)

Same build style (no prerender), same server, same Lighthouse version and settings.

| Page | Perf | LCP | TBT | A11y | Best practices | SEO |
|---|---|---|---|---|---|---|
| `/` | 56 → 54 | 6.6 → 5.6 s | 487 → 801 ms | 98 → 100 | 100 → 100 | 100 → 100 |
| `/tools/sadhana` | 59 → 64 | 6.6 → 6.2 s | 383 → 380 ms | 96 → 96 | 79 → 79 | 100 → 100 |
| `/tools/nakshatra` | 61 → 61 | 6.1 → 6.1 s | 397 → 302 ms | 95 → 96 | 100 → 100 | 100 → 100 |
| `/tools/planetary-hours` | 69 → 67 | 5.8 → 5.5 s | 208 → 355 ms | 96 → 96 | 100 → 100 | 100 → 100 |
| `/blog/best-time-to-meditate-morning-vs-evening` | 70 → 68 | 5.7 → 5.0 s | 103 → 383 ms | 92 → 92 | 79 → 79 | 100 → 100 |

LCP improved on every page (the homepage headline is now plain HTML, not a per-word JavaScript animation) and
the homepage transfers 728 KB instead of 848 KB. TBT moved both ways within run-to-run noise (homepage runs:
438–1055 ms before, 406–849 ms after); in every run it is dominated by framer-motion scripting, which Phase 8
removes from static sections. Phase 1 was not a performance phase.

## After Phase 0b (`phase-0b/`)

Same build style (no pre-render, which is what Hostinger serves), same server (`serve@14.2.4 -s`, gzip), now run
through Lighthouse CI 0.15.1 with three runs per page; the median run of each page is saved. CI repeats this on
every push and keeps the full reports as a build artifact for 14 days.

| Page | Perf | LCP | TBT | A11y | Best practices | SEO |
|---|---|---|---|---|---|---|
| `/` | 54 → 73 | 5.6 → 5.7 s | 801 → 133 ms | 100 → 100 | 100 → 100 | 100 → 100 |
| `/tools/sadhana` | 64 → 70 | 6.2 → 5.9 s | 380 → 261 ms | 96 → 96 | 79 → 100 | 100 → 100 |
| `/tools/nakshatra` | 61 → 72 | 6.1 → 5.8 s | 302 → 146 ms | 96 → 96 | 100 → 100 | 100 → 100 |
| `/tools/planetary-hours` | 67 → 77 | 5.5 → 5.1 s | 355 → 92 ms | 96 → 96 | 100 → 100 | 100 → 100 |
| `/blog/best-time-to-meditate-morning-vs-evening` | 68 → 78 | 5.0 → 4.5 s | 383 → 109 ms | 92 → 92 | 79 → 100 | 100 → 100 |

- The higher performance scores come mostly from lower TBT. Phase 0b removed no JavaScript, so read that as
  machine noise, not progress.
- Best practices 79 → 100: the nine Pexels photos are now served from `/images/blog/` as WebP. The Pexels
  servers had been setting third-party cookies. On the blog post the LCP element is that hero photo, and its
  LCP improved by 0.5 s.
- Homepage transfer: 813 KB (728 KB after Phase 1). Nearly all of the difference is one extra 83 KB Inter
  font file from Google Fonts that this run downloaded and the Phase 1 run did not. Phase 4 self-hosts and subsets
  the fonts.
- Analytics and error reporting add nothing while they are switched off: the code is removed at build time.
- A pre-rendered build measured the same way does worse (performance 63–65, LCP 6.3–7.1 s), because React
  discards the pre-rendered markup and paints the page again. Hostinger has never served that build. Phase 3's
  SSG must hydrate the existing markup (`hydrateRoot`) and keep the LCP element visible without JavaScript.

axe-core 4.14 (WCAG 2.2 A/AA rules, 10 pages, `phase-0b/axe.json`): 0 critical; 9 serious rule violations, all
`color-contrast` (low-opacity white text such as `text-white/30`–`/45`) except two `link-in-text-block` (links
told apart only by colour, on the blog post and privacy page). CI fails on critical issues now; Phase 8 raises
that to serious.

## After Phase 2 (`phase-2/`)

Same method as Phase 0b (Hostinger-style build, `serve@14.2.4 -s`, Lighthouse CI 0.15.1, median of 3 runs).

| Page | Perf | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|
| `/` | 73 → 83 | 5.7 → 4.0 s | 133 → 122 ms | 0.028 → 0.031 | 813 → 812 KB |
| `/tools/sadhana` | 70 → 70 | 5.9 → 6.0 s | 261 → 242 ms | 0.000 → 0.002 | 821 → 852 KB |
| `/tools/nakshatra` | 72 → 67 | 5.8 → 5.0 s | 146 → 133 ms | 0.000 → 0.206 | 845 → 877 KB |
| `/tools/planetary-hours` | 77 → 79 | 5.1 → 4.6 s | 92 → 73 ms | 0.003 → 0.001 | 733 → 764 KB |
| `/blog/best-time-to-meditate-morning-vs-evening` | 78 → 82 | 4.5 → 4.2 s | 109 → 98 ms | 0.022 → 0.022 | 686 → 685 KB |

- Tool pages carry about 30 KB more (gzip): Astronomy Engine in its own `astro` chunk (24 KB) and the engine,
  place search and new result views in the tool chunk (6 KB). Pages without tools are unchanged; the shared
  `vendor` chunk is byte-identical to Phase 0b.
- A place search loads one file from `public/places/` on first use: 59 KB gzip for "k", 88 KB for "s" (the
  largest); 846 KB for all 27 files together, never loaded at once.
- `/tools/nakshatra` CLS 0.206 is a font swap: the page title first paints in the fallback font on one line, then
  wraps to two lines when Cinzel arrives from Google Fonts and pushes the (now taller) form card down by about
  27 px. Same cause as the smaller shifts elsewhere; Phase 4 self-hosts the fonts with metric-matched fallbacks.
- The higher homepage score is run-to-run variation; nothing on the homepage changed.

axe-core 4.14 (13 pages, chart cast on `/tools/astrology`, `phase-2/axe.json`): 0 critical. New code adds no
violations; the remaining serious ones are the site-wide low-contrast patterns listed after Phase 0b (breadcrumbs,
badges, blog cards, faint helper text), for Phase 4/8.
