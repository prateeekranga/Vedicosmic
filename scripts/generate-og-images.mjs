// Share cards: a 1200×630 JPEG for every page in dist-ssr/pages.json, written to dist/og/<path>.jpg
// (dist/og/home.jpg for "/"), the path src/lib/seoHead.ts gives as og:image. Light parchment so the
// card stays legible in dark chat themes. Needs a browser (CI has Chrome); without one it skips,
// or fails when REQUIRE_PRERENDER is set. Fails if any card reaches 300 KB.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const MAX_BYTES = 300 * 1024;
const pages = JSON.parse(fs.readFileSync(path.join(root, 'dist-ssr', 'pages.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fontSize = (title) => (title.length <= 26 ? 78 : title.length <= 44 ? 66 : title.length <= 70 ? 54 : 46);

// A quiet lotus-and-rings mark, drawn the same way every time.
const petals = Array.from({ length: 12 }, (_, i) =>
  `<ellipse cx="280" cy="150" rx="34" ry="118" transform="rotate(${i * 30} 280 280)" fill="none" stroke="#7A5310" stroke-width="2"/>`).join('');
const MANDALA = `<svg viewBox="0 0 560 560" xmlns="http://www.w3.org/2000/svg">
  <circle cx="280" cy="280" r="270" fill="none" stroke="#7A5310" stroke-width="2"/>
  <circle cx="280" cy="280" r="236" fill="none" stroke="#7A5310" stroke-width="1"/>
  ${petals}
  <circle cx="280" cy="280" r="60" fill="none" stroke="#7A5310" stroke-width="2"/>
</svg>`;

const card = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@500;600&display=block">
<style>
  html, body { margin: 0; }
  .card { position: relative; width: 1200px; height: 630px; box-sizing: border-box; padding: 70px 80px; overflow: hidden;
    background: radial-gradient(120% 120% at 85% 15%, #FBF5E4 0%, #F3E6C6 55%, #E8D3A6 100%); color: #2A1F45; font-family: Inter, sans-serif; }
  .frame { position: absolute; inset: 22px; border: 2px solid rgba(138, 90, 18, 0.5); border-radius: 18px; }
  .mandala { position: absolute; right: -120px; top: 35px; width: 560px; height: 560px; opacity: 0.14; }
  .brand { font-family: Cinzel, serif; font-weight: 700; font-size: 34px; letter-spacing: 0.04em; }
  .brand span { color: #9A6110; }
  .eyebrow { margin-top: 52px; font-weight: 600; font-size: 22px; letter-spacing: 0.16em; text-transform: uppercase; color: #8A5A12; }
  h1 { font-family: Cinzel, serif; font-weight: 700; line-height: 1.14; margin: 16px 0 0; max-width: 860px; }
  .sub { margin: 22px 0 0; max-width: 820px; font-size: 30px; line-height: 1.35; color: #4E3F63; }
  .foot { position: absolute; left: 80px; bottom: 62px; font-size: 22px; color: #4E3F63; }
</style></head><body>
<div class="card" id="card">
  <div class="frame"></div>
  <div class="mandala">${MANDALA}</div>
  <div class="brand">Vedi<span>Cosmic</span></div>
  <div class="eyebrow">${esc(p.eyebrow ?? 'VediCosmic')}</div>
  <h1 style="font-size:${fontSize(p.h1)}px">${esc(p.h1)}</h1>
  ${p.sub ? `<p class="sub">${esc(p.sub)}</p>` : ''}
  <div class="foot">vedicosmic.com · Free Vedic tools, calculated in your browser</div>
</div></body></html>`;

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
} catch {
  try {
    browser = await chromium.launch();
  } catch (err) {
    console.warn(`[og-images] skipped — no browser available in this environment: ${err.message}`);
    if (process.env.REQUIRE_PRERENDER) process.exitCode = 1;
    process.exit();
  }
}

const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tooBig = [];
for (const p of pages) {
  await page.setContent(card(p), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(DIST, 'og', `${p.path === '/' ? 'home' : p.path.slice(1)}.jpg`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.locator('#card').screenshot({ path: file, type: 'jpeg', quality: 84 });
  const size = fs.statSync(file).size;
  if (size >= MAX_BYTES) tooBig.push(`${p.path} (${Math.round(size / 1024)} KB)`);
}
await browser.close();

if (tooBig.length) {
  console.error(`[og-images] over 300 KB: ${tooBig.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`[og-images] ${pages.length} share cards written to dist/og/`);
}
