// Accessibility check with axe-core (WCAG 2.2 A/AA rules) against a served build:
//   npx vite preview --port 4173 --strictPort      (in one terminal)
//   node scripts/axe.mjs http://localhost:4173      (in another)
// Prints every violation. Exits 1 only for impacts listed in FAIL_ON, so known issues can be
// fixed page by page (Phase 8) while new critical ones still stop the build.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '');
const OUT = process.argv[3]; // optional: write the full report as JSON here
const FAIL_ON = new Set(['critical']);
const PAGES = ['/', '/tools', '/tools/sadhana', '/tools/nakshatra', '/tools/planetary-hours', '/tools/astrology',
  '/blog/best-time-to-meditate-morning-vs-evening', '/about', '/contact', '/privacy-policy'];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const axeSource = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

async function launch() {
  try { return await chromium.launch({ channel: 'chrome' }); } catch { return chromium.launch(); }
}

const browser = await launch();
// Reduced motion: entrance animations finish at once, so contrast is measured on the final colours.
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const report = [];

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.addScriptTag({ content: axeSource });
  const { violations } = await page.evaluate((tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
  report.push({ path, violations: violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target.join(' ') })) });
}
await browser.close();

let failing = 0;
for (const { path, violations } of report) {
  console.log(`\n${path} — ${violations.length ? `${violations.length} rule(s) violated` : 'no violations'}`);
  for (const v of violations) {
    const fail = FAIL_ON.has(v.impact);
    if (fail) failing++;
    console.log(`  ${fail ? '✗' : '!'} [${v.impact}] ${v.id} ×${v.nodes} — ${v.help}${v.sample ? ` (e.g. ${v.sample})` : ''}`);
  }
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ base: BASE, date: new Date().toISOString(), report }, null, 2) + '\n');

const byImpact = {};
for (const v of report.flatMap((r) => r.violations)) byImpact[v.impact] = (byImpact[v.impact] ?? 0) + 1;
console.log(`\n[axe] ${PAGES.length} pages; violations by impact: ${JSON.stringify(byImpact)}; failing (${[...FAIL_ON].join(', ')}): ${failing}`);
process.exitCode = failing ? 1 : 0;
