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

Homepage total transfer: 803 KB. Budget from the Master brief: performance ≥ 90, LCP ≤ 2.5 s, TBT ≤ 200 ms,
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
