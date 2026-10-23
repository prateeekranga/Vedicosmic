// Browser smoke test for the Phase 1 acceptance checks. Run against a served build:
//   npm run build && npx vite preview --port 4173 --strictPort   (in one terminal)
//   node scripts/smoke.mjs http://localhost:4173                  (in another)
// Uses the system Chrome (or Playwright's Chromium). Exits 1 if any check fails.
import { chromium } from 'playwright-core';

const BASE = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

async function launch() {
  try { return await chromium.launch({ channel: 'chrome' }); } catch { return chromium.launch(); }
}

/** Waits for the SPA to render the route's content. */
async function open(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
}

const headingReport = (page) => page.evaluate(() => {
  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]));
  const skips = [];
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skips.push(`h${levels[i - 1]}→h${levels[i]}`);
  return { h1: levels.filter((l) => l === 1).length, skips };
});

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

// 1. One H1 and no skipped heading levels on key pages.
for (const path of ['/', '/tools', '/courses', '/contact', '/about', '/tools/astrology', '/tools/nakshatra',
  '/blog/best-time-to-meditate-morning-vs-evening', '/privacy-policy']) {
  await open(page, path);
  const { h1, skips } = await headingReport(page);
  check(`${path}: exactly one h1`, h1 === 1, `found ${h1}`);
  check(`${path}: no skipped heading levels`, skips.length === 0, skips.join(', '));
}

// 2. Homepage console is free of warnings and errors (incl. the old negative-blur spring warnings).
{
  const messages = [];
  const p2 = await context.newPage();
  p2.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') messages.push(`${m.type()}: ${m.text()}`); });
  p2.on('pageerror', (e) => messages.push(`pageerror: ${e.message}`));
  await open(p2, '/');
  await p2.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
  await p2.waitForTimeout(1000);
  check('/: no console warnings or errors', messages.length === 0, messages.slice(0, 5).join(' | '));
  await p2.close();
}

// 3. Removed claims are not on screen.
const BANNED_TEXT = [/60,000/, /\bseekers\b/i, /instructor/i, /\benrol/i, /cosmic blueprint/i, /Ananya/, /4\.9 /, /Loved by a curious community/i, /sign in/i];
for (const path of ['/', '/about', '/tools', '/contact', '/courses', '/blog/numerology-compatibility-life-path']) {
  await open(page, path);
  const text = await page.evaluate(() => document.body.innerText);
  const hits = BANNED_TEXT.filter((re) => re.test(text)).map(String);
  check(`${path}: no removed claims on screen`, hits.length === 0, hits.join(', '));
}

// 4. Birth chart: golden case L01 (Kolkata 1988-03-20 02:00) — Lagna hidden, borderline Moon flagged,
//    and no request leaves the page carrying the birth data.
{
  await open(page, '/tools/astrology');
  await page.selectOption('select[aria-label="Day"]', '20');
  await page.selectOption('select[aria-label="Month"]', '3');
  await page.selectOption('select[aria-label="Year"]', '1988');
  await page.fill('#ast-time', '02:00');
  await page.selectOption('#ast-city', { label: 'Kolkata, India' });
  const requests = [];
  page.on('request', (r) => requests.push({ url: r.url(), body: r.postData() ?? '' }));
  await page.getByRole('button', { name: /cast my chart/i }).click();
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => document.body.innerText);
  check('astrology: Lagna is hidden with the rebuild note', /Lagna \(Ascendant\) is being rebuilt/.test(text));
  check('astrology: borderline note shown for L01 Moon (0.009° from Meena/Mesha)', /Borderline: your Moon/.test(text));
  check('astrology: Moon sign is Meena or Mesha', /Meena|Mesha/.test(text));
  const leaks = requests.filter((r) => !r.url.startsWith(BASE) || /1988|02:00|Kolkata/.test(r.url + r.body));
  check('astrology: no request carries birth data', leaks.length === 0, leaks.map((r) => r.url).join(', '));

  // 5. Saving asks for consent first, appears on the Sādhana page, and can be deleted.
  await page.getByRole('button', { name: /save this chart/i }).click();
  const asked = await page.getByText('Save on this device?').isVisible();
  check('save: consent is asked before anything is stored', asked);
  const storedBefore = await page.evaluate(() => localStorage.getItem('vc:device:v1'));
  check('save: nothing stored before consent', storedBefore === null, String(storedBefore));
  await page.getByRole('button', { name: 'Save on this device' }).click();
  await page.waitForTimeout(500);
  await open(page, '/tools/sadhana');
  check('save: chart listed under "Saved on this device"', await page.getByText('Vedic Birth Chart').first().isVisible());
  await page.getByRole('button', { name: /delete everything on this device/i }).click();
  await page.getByRole('button', { name: /yes, delete everything/i }).click();
  await page.waitForTimeout(500);
  check('save: delete everything empties the store', await page.getByText('Nothing is saved yet.').isVisible());
  const storedAfter = await page.evaluate(() => localStorage.getItem('vc:device:v1'));
  check('save: storage key removed after delete', storedAfter === null, String(storedAfter));
}

// 6. Coming-soon tool is noindex; retired and unfinished pages show "not found".
{
  await open(page, '/tools/kundali-matching');
  const robots = await page.evaluate(() => [...document.querySelectorAll('meta[name="robots"]')].map((m) => m.content).join(' | '));
  check('/tools/kundali-matching: robots noindex', /noindex/.test(robots), robots);
  for (const path of ['/courses/chakra-healing', '/legal']) {
    await open(page, path);
    check(`${path}: renders "not found"`, /Page not found|404/i.test(await page.evaluate(() => document.body.innerText)));
  }
  await open(page, '/tools/nakshatra');
  check('/tools/nakshatra: result note under the tool', await page.getByText('Astrology offers tradition-based reflection, not guarantees.').isVisible());
}

await browser.close();

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.ok ? `  — ${r.detail}` : ''}`);
console.log(`\n[smoke] ${results.length - failed.length}/${results.length} checks passed against ${BASE}`);
process.exitCode = failed.length ? 1 : 0;
