# Live site vs repository (Phase 0, 23 Oct 2026)

**Answer: the live site is the latest commit.** Nothing is stale or undeployed. vedicosmic.com serves commit
`174feba` ("Redesign Chakra Player…", 11 Aug 2026), the head of `main` before this upgrade (tagged
`pre-upgrade-2026-10`). The empty pages crawlers see come from how Hostinger builds the site, not from an old deploy.

## Evidence

| Check | Result |
|---|---|
| Hostinger deployment record (read-only API) | Git auto-deploy from `prateeekranga/Vedicosmic`, branch `main`, enabled. Latest build: commit `174feba`, state `completed`, 11 Aug 2026 15:13–15:14 UTC. |
| Build settings | Node **18** (18.20.8, npm 10.8.2), app type `vite`, script `build`, output `dist`. |
| Asset hashes | A clean local build of `174feba` produces the same file names the live HTML loads: `index-Dps3V3wE.js`, `vendor-DUeVOdmb.js`, `router-Cz7JMogm.js`, `motion-duXYsv7Y.js`, `icons-2agcBwef.js`, `react-core-9k5E6M09.js`, `index-BNvwe3Hj.css`. Content-hashed names only match when the code is identical. |
| `Last-Modified` header | `Tue, 11 Aug 2026 15:14:00 GMT`, matching the build time. |
| Live sitemap | 89 URLs, including `/tools/chakra-frequency-player`, which only exists in the last two commits. |

## Why crawlers and WhatsApp see an empty page

The Hostinger build log for `174feba` shows:

```
[seo] wrote sitemap.xml (89 urls) and llms.txt to dist/
[og-images] skipped — no browser available in this environment: browserType.launch: Executable doesn't exist …
[prerender] skipped — no browser available in this environment: …
[prerender] The site will work as a client-side SPA. Prerendering can be run locally.
```

`scripts/prerender.mjs` and `scripts/generate-og-images.mjs` drive a headless browser. Hostinger's build has none,
so both steps skip and exit successfully. Result on the live site:

- Every URL returns the same 3.5 KB `index.html` (empty `<div id="root">`) with HTTP 200, including made-up URLs.
- The 28 blog posts whose share image is a generated `/og/blog/<slug>.png` point at a file that was never built
  (the CDN answers 422).

Phase 3 fixes this by rendering pages without a browser and building in GitHub Actions.

## Other findings from the build log and live checks

- **Node 18 is out of support**, and `@supabase/supabase-js` 2.110.8 declares `node >= 22`; every build prints
  `EBADENGINE` warnings and a deprecation notice. It still builds today. Recommended: switch the Hostinger build to
  Node 22 in hPanel (or move builds to GitHub Actions in Phase 3, which removes the constraint).
- `npm install` on Hostinger reports **6 known vulnerabilities (3 moderate, 3 high)**. To be reviewed with `npm audit`
  in Phase 0b.
- **Hostinger's CDN blocks automated browsers intermittently.** Lighthouse (headless Chrome) got HTTP 403 on all
  15 runs against the live site, and a LinkedIn-crawler request had its connection dropped, while ordinary requests
  succeed. If the CDN's bot protection also blocks link-preview or search crawlers, pages lose their previews and
  indexing. Worth checking the bot-protection / security settings in hPanel. Because of this, the Phase 0 Lighthouse
  baselines were measured on a local production build of `174feba` (see `docs/baselines/README.md`).
- Hashed assets are cached for 7 days (`max-age=604800`), not as immutable. Phase 3 `.htaccess` work.
