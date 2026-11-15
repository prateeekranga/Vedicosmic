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

## After Phase 3 (`phase-3/`)

Same server and settings, but now the pre-rendered build that production will serve (`serve@14.2.4 dist`,
without the SPA fallback). Phase 2 measured the client-rendered build Hostinger served at the time.

| Page | Perf | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|
| `/` | 83 → 82 | 4.0 → 3.8 s | 122 → 24 ms | 0.031 → 0.028 | 812 → 822 KB |
| `/tools/sadhana` | 70 → 68 | 6.0 → 4.7 s | 242 → 337 ms | 0.002 → 0.001 | 852 → 854 KB |
| `/tools/nakshatra` | 67 → 59 | 5.0 → 5.4 s | 133 → 222 ms | 0.206 → 0.205 | 877 → 879 KB |
| `/tools/planetary-hours` | 79 → 75 | 4.6 → 4.7 s | 73 → 127 ms | 0.001 → 0.002 | 764 → 767 KB |
| `/blog/best-time-to-meditate-morning-vs-evening` | 82 → 82 | 4.2 → 3.9 s | 98 → 106 ms | 0.022 → 0.022 | 685 → 689 KB |

- Every page now arrives as complete HTML (heading, copy, links, head tags and JSON-LD) before any script
  runs; crawlers and link previews no longer depend on JavaScript. That was the goal of this phase, not speed.
- Mobile performance is in the same range as before: what costs time is still the JavaScript every page loads
  (React, framer-motion) and the Google Fonts, which Phases 4 and 8 address. TBT moves between runs on this
  machine (Sādhana runs: 62/77/68).
- A first attempt shifted the tool pages by 40 px after loading (CLS 0.10): the pre-rendered share row wrapped
  to two lines, then phones swapped in a one-line Share button. The pre-rendered page now shows the same button,
  and CLS is back to 0.001–0.002. Nakshatra's 0.205 is still the title re-wrapping when Cinzel arrives.
- Measured on staging.vedicosmic.com (the real Hostinger server), runs vary widely with the network (the
  homepage scored 91, 64 and 66), so the local server stays the comparison point. Staging's SEO score is low on
  purpose: it is blocked from indexing.

axe (`phase-3/axe.json`): 0 critical. The homepage now shows 15 low-contrast elements that were invisible to
axe before, because sections below the fold used to wait at opacity 0 for their entrance animation; they are
the same site-wide patterns (faint step numbers, blog-card dates) listed for Phase 4/8.

## After tools round 1 (`tools-1/`)

Same server and settings as Phase 3 (`serve@14.2.4 dist`, mobile, median of three runs). This round rebuilt the
numerology tools and the tool page template; it changed no fonts or site-wide scripts.

| Page | Perf | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|
| `/tools/sadhana` | 68 → 84 | 4.7 → 3.7 s | 337 → 83 ms | 0.001 → 0.001 | 854 → 650 KB |
| `/tools/nakshatra` | 59 → 70 | 5.4 → 4.1 s | 222 → 34 ms | 0.205 → 0.192 | 879 → 693 KB |
| `/tools/planetary-hours` | 75 → 80 | 4.7 → 4.2 s | 127 → 0 ms | 0.002 → 0.001 | 767 → 578 KB |
| `/tools/loshu-grid` (new) | 82 | 3.9 s | 0 ms | 0.035 | 543 KB |
| `/tools` (new) | 79 | 3.6 s | 0 ms | 0.157 | 593 KB |

- Tool pages download about 200 KB less: each tool is now its own chunk, and a tool page no longer loads every
  other tool and every blog article. The tool page chunk went from 385 KB to 70 KB (raw).
- Accessibility is 100 on the two pages measured for the first time; SEO and best practices stay at 100.
- `/tools` CLS 0.157 and Nakshatra's 0.192 have the same cause as before: the heading re-wraps when the Cinzel
  web font arrives. Phase 4 self-hosts the fonts with metric-matched fallbacks.
- These are local runs on one machine and move between runs; they are a comparison with the Phase 3 table,
  not a measurement of the live site.

axe (`tools-1/axe.json`, 16 pages, results on screen for the birth chart, Lo Shu grid and Life Path): 0 critical,
9 serious (13 before this round's fixes). `/tools`, the numerology hub, Lo Shu Grid and Life Path have no
violations. The remaining serious ones are the site-wide low-contrast patterns on older pages, for Phase 4/8.

Checks added this round: 83 unit tests (331 → 414), of which 55 are numerology (hand-worked cases, every date
1900–2099, a lint of the reading text), 19 cover tool-page content and 7 the chakra scoring; tool-page guards in
`scripts/verify-prerender.mjs`; and 14 new smoke checks (54 → 68).

## After the numerology fixes and additions (15 November 2026, `upgrade/tools-1-fixes`)

Two commits on top of tools round 1. The first puts back three things the rebuild dropped: arrows on the Lo Shu
grid for complete lines, a compatibility level on the Mobile Number page, and a reading for every two-digit
pair. The second adds what the paid numerology suites show and this site did not: Maha, Antar and Pratyantar
Dasha with the grid read for the running period, Numero Vastu directions, favourable days and dates, and six
further name numbers (Hidden Passion, Subconscious Self, Balance, Rational Thought, the Cornerstone, Capstone
and First Vowel, and the Planes of Expression).

axe (18 pages; the Numerology Calculator and Mobile Number results are now scanned as well): 0 critical, 9
serious, the same nine as after round 1. Lo Shu Grid, Life Path, Numerology Calculator and Mobile Number have no
violations with their results on screen.

Checks added: 24 unit tests (414 → 438): the two-digit chart and compatibility level, hand-worked dasha cases,
every calendar day from 1900 to 2100 for the weekday arithmetic, the further name numbers, and the reading text
under the claims lint. 18 smoke checks (68 → 86) cover the arrows, the compatibility level, the pair chart, the
dasha section and the name numbers in a real browser.

Lighthouse was not re-run for these two commits. They add no fonts, images or site-wide scripts; the Lo Shu and
Numerology Calculator chunks grew by the new sections.

## After tools round 2 (15 November 2026, `upgrade/tools-2`)

This round adds the Panchang page and merges the Rahu Kaal and Muhurat Finder into it (`/tools/muhurta` answers
with a 301 to `/tools/panchang`). It also writes the page copy for six tools: panchang, kundli, nakshatra, hora,
vrat calendar and daily sadhana.

New reference checks (Skyfield with NASA JPL DE421, `tests/golden/panchang-moon-reference.json`):

| Check | Cases | Tolerance | Largest difference |
|---|---|---|---|
| Moonrise and moonset | 240 days (20 places × 12 dates) | 2 minutes | 1 second |
| Lunar month name, adhika months | 336 dates, 2019–2032 | exact | none |
| New moon instants | 336 dates, 2019–2032 | 2 minutes | 15 seconds |

Re-running the reference script reproduced the existing sunrise and tithi fixture byte for byte.

axe (18 pages, with the Panchang page in place of the Muhurta page): 0 critical, 8 serious (9 before). The
Panchang page has no violations; the Muhurta page it replaces had one, for low-contrast text. The remaining eight
are the site-wide low-contrast patterns on older pages, for Phase 4/8.

Checks added: 592 unit tests (438 → 1,030), of which 579 are the reference cases above and 13 cover the day
overview, clock labels and the worked examples printed on the Panchang and Hora pages. Smoke checks 86 → 91: the
five limbs, Sun and Moon times, Rahu Kaal and the muhurtas, both Choghadiya tables and the day buttons on the
Panchang page, and the Hora page opening on a date from the address. Tool pages with their own copy: 5 → 11.

Lighthouse was not re-run locally for this round; CI runs it on every push.

## Printed numerology reports (15 November 2026, `upgrade/print`)

Printing a numerology result used to give plain black-on-white text, and because the page behind it was only
made invisible, not removed, Chrome followed every report with blank pages: a three-page Lo Shu report came out
as 11 pages. The report is now its own document under `<body>`, shown alone in print:

| Report (test person) | Pages before | Pages now | One-page summary |
|---|---|---|---|
| Lo Shu Grid (14 June 1985, male) | 11 | 4 | 1 |
| Numerology Calculator (Asha Rao, 15 August 1990, female) | 10 | 4 | 1 |
| Life Path (29 November 1987) | 7 | 2 | 1 |
| Chaldean (Narendra Modi) | 5 | 1 | 1 |
| Mobile Number (98171 45678, with 14 June 1985) | 8 | 2 | 1 |

Measured with Chrome 157's own PDF output (A4, `preferCSSPageSize`); "before" is commit 43bc978 printed the
same way. Each report has a branded heading, the
numbers at a glance, numbered sections, the Lo Shu grid drawn with its arrows, a running header and
"Page x of y" footer, and an appendix with the working; an options dialog chooses sections, a name, a
consultant's details, notes, a cover page, colour or ink saver, and A4 or US Letter. While printing, the page
title becomes the report's name, which browsers use as the PDF file name.

Checks added: 15 unit tests (1,030 → 1,045) build every report for 200+ people and check the numbers, the
sections and the wording (the claims lint now covers printed text too), and render the document with each
option. Smoke checks 91 → 99 print real PDFs: the options open and cancel, only the report prints, the summary is
one page, the full Lo Shu report has no blank pages, and the PDF is named after the report and the person.

axe (18 pages): 0 critical, 8 serious, unchanged; Lo Shu, Life Path, Numerology Calculator and Mobile Number
have no violations.
