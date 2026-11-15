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
  const response = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  return response;
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
for (const path of ['/', '/tools', '/tools/category/numerology', '/tools/loshu-grid', '/courses', '/contact', '/about', '/how-we-calculate', '/tools/astrology', '/tools/nakshatra',
  '/blog/best-time-to-meditate-morning-vs-evening', '/privacy-policy']) {
  await open(page, path);
  const { h1, skips } = await headingReport(page);
  check(`${path}: exactly one h1`, h1 === 1, `found ${h1}`);
  check(`${path}: no skipped heading levels`, skips.length === 0, skips.join(', '));
}

// 2. Pages load without console warnings or errors: no hydration mismatches (React errors 418,
//    422, 423, 425) on the pre-rendered HTML, and no old animation warnings.
for (const path of ['/', '/tools', '/tools/category/astrology', '/tools/astrology', '/tools/loshu-grid', '/blog', '/blog/best-time-to-meditate-morning-vs-evening', '/about']) {
  const messages = [];
  const p2 = await context.newPage();
  p2.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') messages.push(`${m.type()}: ${m.text()}`); });
  p2.on('pageerror', (e) => messages.push(`pageerror: ${e.message}`));
  await open(p2, path);
  await p2.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
  await p2.waitForTimeout(1000);
  check(`${path}: no console warnings or errors`, messages.length === 0, messages.slice(0, 3).join(' | '));
  await p2.close();
}

// 2b. A made-up URL gets a real 404 status and the branded page.
{
  const response = await open(page, '/this-page-does-not-exist');
  check('made-up URL: HTTP 404 with the branded page', response?.status() === 404 && /This path is uncharted/i.test(await page.evaluate(() => document.body.innerText)),
    `status ${response?.status()}`);
}

// 2c. An unknown tool is a missing page: 404, the branded page, and the address stays as typed.
{
  const response = await open(page, '/tools/not-a-tool');
  const text = await page.evaluate(() => document.body.innerText);
  check('/tools/not-a-tool: HTTP 404 with the branded page', response?.status() === 404 && /This path is uncharted/i.test(text), `status ${response?.status()}`);
  check('/tools/not-a-tool: the address is not rewritten', new URL(page.url()).pathname === '/tools/not-a-tool', page.url());
}

// 2d. Lo Shu grid: hand-worked case K1 (15 August 1990, female), an impossible date is refused,
//     and no request leaves the page carrying the date of birth.
{
  await open(page, '/tools/loshu-grid');
  await page.waitForSelector('select[aria-label="Day"]', { timeout: 15000 });
  const requests = [];
  page.on('request', (r) => requests.push({ url: r.url(), body: r.postData() ?? '' }));
  await page.selectOption('select[aria-label="Day"]', '31');
  await page.selectOption('select[aria-label="Month"]', '2');
  await page.selectOption('select[aria-label="Year"]', '1990');
  check('loshu-grid: 31 February is refused', await page.getByRole('button', { name: 'Make my grid' }).isDisabled()
    && /has only 28 days/.test(await page.evaluate(() => document.body.innerText)));
  await page.selectOption('select[aria-label="Day"]', '15');
  await page.selectOption('select[aria-label="Month"]', '8');
  await page.selectOption('#loshu-gender', 'female');
  await page.getByRole('button', { name: 'Make my grid' }).click();
  await page.waitForSelector('#tool table', { timeout: 10000 });
  const cells = await page.locator('#tool table button').evaluateAll((els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  const cell = (n) => cells.find((c) => c.startsWith(String(n))) ?? '';
  check('loshu-grid: 6 appears twice (Driver and Conductor added)', /appears twice: once as the Driver and once as the Conductor/.test(cell(6)), cell(6));
  check('loshu-grid: 8 appears twice (date and Kua)', /appears twice: once from the date and once as the Kua number/.test(cell(8)), cell(8));
  check('loshu-grid: 2, 3, 4 and 7 are missing', [2, 3, 4, 7].every((n) => / missing,/.test(cell(n))) && [1, 5, 6, 8, 9].every((n) => !/ missing,/.test(cell(n))));
  const text = await page.evaluate(() => document.body.innerText);
  check('loshu-grid: method line names the numerology engine', /Engine: VediCosmic numerology \d/.test(text));
  const allowed = (url) => url.startsWith(BASE) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url);
  const leaks = requests.filter((r) => !allowed(r.url) || /1990|08-15|15-08/.test(r.url + r.body));
  check('loshu-grid: no request carries the date of birth', leaks.length === 0, leaks.map((r) => r.url).join(', '));
  // K1 fills 9-5-1 and 8-1-6 and no other line, so exactly those two arrows are drawn and named.
  const arrows = await page.locator('[data-testid="loshu-arrows"] [data-line]').evaluateAll((els) => els.map((e) => e.getAttribute('data-line')).sort());
  const named = await page.locator('[data-testid="loshu-lines"]').innerText();
  check('loshu-grid: an arrow is drawn for each complete line and no other', arrows.join(',') === 'practical,will', arrows.join(','));
  check('loshu-grid: the complete lines are named under the grid', /Will plane/.test(named) && /Practical plane/.test(named) && /Golden Raj Yog \(4-5-6\) is not formed/.test(named), named);
  // Dasha: which numbers are running depends on today's date, so only the structure is checked here
  // (the numbers themselves are fixed by hand-worked cases in tests/numerology-depth.test.ts).
  const dasha = await page.locator('[data-testid="loshu-dasha"]').innerText();
  check('loshu-grid: shows the Maha, Antar and Pratyantar Dasha running today', /Maha Dasha/i.test(dasha) && /Antar Dasha/i.test(dasha) && /Pratyantar Dasha/i.test(dasha) && /Your grid in this period/i.test(dasha));
  const yearRows = await page.locator('[data-testid="loshu-dasha"] details').first().locator('tbody tr').count();
  check('loshu-grid: lists five dasha years', yearRows === 5, `found ${yearRows}`);
  await page.getByText('With current dasha', { exact: true }).click();
  await page.waitForTimeout(400);
  const periodArrows = await page.locator('[data-testid="loshu-arrows"] [data-line]').evaluateAll((els) => els.map((e) => e.getAttribute('data-line')));
  check('loshu-grid: the dasha view keeps the birth arrows and may add more', periodArrows.includes('will') && periodArrows.includes('practical'), periodArrows.join(','));
  check('loshu-grid: the dasha view marks the added numbers', /M and A mark a number added/.test(await page.locator('#tool').innerText()));
  const directions = await page.locator('[data-testid="loshu-directions"]').innerText();
  check('loshu-grid: missing numbers are given their directions', /South-West \(2\), East \(3\), South-East \(4\), West \(7\)/.test(directions), directions.slice(0, 200));
}

// 2d-print. Printing the same Lo Shu result: the button opens the print options, the browser's
//           print is started once, only the report is printed, the one-page summary is one page,
//           the full report has no trailing blank pages, and the PDF is named after the report.
{
  const pdfPages = async () => ((await page.pdf({ preferCSSPageSize: true })).toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  const printWith = async (choice, name) => {
    await page.getByRole('button', { name: /Print or save PDF/ }).click();
    await page.getByRole('dialog').waitFor({ timeout: 5000 });
    if (name) await page.getByLabel('Name on the report').fill(name);
    await page.getByText(choice, { exact: true }).click();
    await page.getByRole('button', { name: 'Print or save as PDF' }).click();
    await page.waitForTimeout(400);
  };
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed += 1; }; });

  await page.getByRole('button', { name: /Print or save PDF/ }).click();
  check('print: the Print button opens the print options', await page.getByRole('dialog').isVisible().catch(() => false));
  // Cancelling forgets what was typed.
  await page.getByLabel('Name on the report').fill('Not kept');
  await page.keyboard.press('Escape');
  const closed = await page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 3000 }).then(() => true, () => false);
  check('print: cancelling closes the options without printing', closed && (await page.evaluate(() => window.__printed)) === 0);
  await printWith('One-page summary', 'Smoke Test');
  check('print: the browser print is started once', (await page.evaluate(() => window.__printed)) === 1);

  await page.emulateMedia({ media: 'print' });
  const shown = await page.evaluate(() => {
    const doc = document.querySelector('body > .pd');
    return {
      doc: doc ? getComputedStyle(doc).display : 'missing',
      root: getComputedStyle(document.getElementById('root')).display,
      named: !!doc?.textContent?.includes('Smoke Test'),
    };
  });
  check('print: only the report is printed, with the name on it', shown.doc === 'block' && shown.root === 'none' && shown.named, JSON.stringify(shown));
  const summary = await pdfPages();
  check('print: the one-page summary prints on one page', summary === 1, `${summary} pages`);
  await page.emulateMedia({ media: 'screen' });

  await printWith('Full report');
  await page.emulateMedia({ media: 'print' });
  const full = await pdfPages();
  check('print: the full Lo Shu report has no blank pages', full >= 3 && full <= 6, `${full} pages`);
  await page.emulateMedia({ media: 'screen' });

  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const title = await page.title();
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  check('print: the PDF is named after the report and the person', title === 'Lo Shu Grid Report - Smoke Test - VediCosmic', title);
  check('print: the page title comes back after printing', !/Smoke Test/.test(await page.title()));
}

// 2e. Numerology Calculator: a birthday with 4, 5 and 6 (14 June 1985) shows the Golden Raj Yog
//     with its arrow on the grid.
{
  await open(page, '/tools/numerology');
  await page.waitForSelector('#blueprint-name', { timeout: 15000 });
  await page.fill('#blueprint-name', 'Asha Rao');
  await page.selectOption('select[aria-label="Day"]', '14');
  await page.selectOption('select[aria-label="Month"]', '6');
  await page.selectOption('select[aria-label="Year"]', '1985');
  await page.getByRole('button', { name: 'Show my numbers' }).click();
  await page.waitForSelector('#tool table', { timeout: 10000 });
  const arrows = await page.locator('[data-testid="loshu-arrows"] [data-line]').evaluateAll((els) => els.map((e) => e.getAttribute('data-line')));
  const text = await page.locator('#tool').innerText();
  check('numerology: the completed Golden Raj Yog has an arrow on the grid', arrows.includes('golden'), arrows.join(','));
  check('numerology: the completed Golden Raj Yog is named and read', /Golden Raj Yog \(4-5-6\)\./.test(text) && /The 4-5-6 diagonal is complete/.test(text));
  // ASHA RAO: four of seven letters carry 1; initials A + R = 10, so Balance 1; planes 4 mental, 3 emotional.
  const more = await page.locator('[data-testid="numerology-more"]').innerText();
  check('numerology: further name numbers are shown', /Hidden Passion/i.test(more) && /4 of your 7 letters carry it/.test(more) && /Balance 1:/.test(more) && /Subconscious Self/i.test(more) && /Rational Thought/i.test(more));
  check('numerology: special letters and planes of expression are shown', /Cornerstone/i.test(more) && /Capstone/i.test(more) && /First Vowel/i.test(more) && /4 letters, strongest/.test(more));
  check('numerology: the running dasha is shown', /Maha Dasha/i.test(await page.locator('[data-testid="numerology-dasha"]').innerText()));
}

// 2f. Mobile number with a date of birth: a compatibility level, a reading for every pair, the
//     Raj yog of 1 and 7, and no request carrying the number.
{
  await open(page, '/tools/mobile-numerology');
  await page.waitForSelector('#mobile-number', { timeout: 15000 });
  const requests = [];
  page.on('request', (r) => requests.push({ url: r.url(), body: r.postData() ?? '' }));
  await page.fill('#mobile-number', '98171 45678');
  await page.getByRole('button', { name: 'Read this number' }).click();
  await page.waitForSelector('[data-testid="mobile-pairs"]', { timeout: 10000 });
  check('mobile-numerology: without a date of birth it asks for one', /Add your date of birth above/.test(await page.locator('#tool').innerText()));
  await page.selectOption('select[aria-label="Day"]', '14');
  await page.selectOption('select[aria-label="Month"]', '6');
  await page.selectOption('select[aria-label="Year"]', '1985');
  await page.getByRole('button', { name: 'Read this number' }).click();
  await page.waitForSelector('[data-testid="mobile-compatibility"]', { timeout: 10000 });
  // Root 2 (Moon) with Mulank 5 (Mercury) is mixed, 0; with Bhagyank 7 (Ketu) unfriendly, −2: level 2.
  const level = await page.locator('[data-testid="mobile-compatibility"]').innerText();
  check('mobile-numerology: shows the compatibility level with the date of birth', /Compatibility level/i.test(level) && /Low/.test(level) && /level 2 of 5/.test(level), level.slice(0, 120));
  const rows = await page.locator('[data-testid="mobile-pairs"] tbody tr').count();
  check('mobile-numerology: every neighbouring pair has a row', rows === 9, `found ${rows}`);
  const pairs = await page.locator('[data-testid="mobile-pairs"]').innerText();
  check('mobile-numerology: pairs carry the chart class and their own reading', /Benefic/.test(pairs) && /Malefic/.test(pairs) && /Sun with Ketu a Raj yog/.test(pairs) && /Bandhan yog/.test(pairs));
  check('mobile-numerology: the Raj yog note checks for an 8', /also contains an 8/.test(await page.locator('[data-testid="mobile-raj-yog"]').innerText()));
  // Number score: fit −2 gives 10, pairs 17, ending 5678 (root 8, +3 with 5 and 7) 13, balance 10: 50, Low.
  const score = await page.locator('[data-testid="mobile-score"]').innerText();
  check('mobile-numerology: shows the Number score with its four parts', /\b50\b/.test(score) && /out of 100/.test(score) && /Low/.test(score)
    && /Fit with your birth numbers/.test(score) && /Digit balance/.test(score), score.slice(0, 160));
  check('mobile-numerology: lists the points to watch', /Grahan yog/.test(await page.locator('[data-testid="mobile-cautions"]').innerText()));
  check('mobile-numerology: reads the last four digits', /root\s*8/.test(await page.locator('[data-testid="mobile-ending"]').innerText()));
  check('mobile-numerology: draws the Lo Shu grid with the number', (await page.locator('[data-testid="mobile-grid"] table button').count()) === 9);
  check('mobile-numerology: rates every root from 1 to 9', (await page.locator('[data-testid="mobile-roots"] li').count()) === 9);
  await page.fill('#compare-0', '99887 66554');
  await page.fill('#compare-1', '12345');
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  const compare = await page.locator('[data-testid="mobile-compare"]').innerText();
  check('mobile-numerology: compares numbers and flags one that is too short', /99887 66554/.test(compare) && /highest score/i.test(compare) && /Use 7 to 15 digits/.test(compare), compare.slice(0, 200));
  check('mobile-numerology: shows the traditional customs', /Phone cover or wallpaper/.test(await page.locator('[data-testid="mobile-remedies"]').innerText()));
  const leaks = requests.filter((r) => /9817145678|98171|9988766554|99887/.test(r.url + r.body));
  check('mobile-numerology: no request carries the number', leaks.length === 0, leaks.map((r) => r.url).join(', '));
}

// 3. Removed claims are not on screen.
const BANNED_TEXT = [/60,000/, /\bseekers\b/i, /instructor/i, /\benrol/i, /cosmic blueprint/i, /Ananya/, /4\.9 /, /Loved by a curious community/i, /sign in/i];
for (const path of ['/', '/about', '/tools', '/contact', '/courses', '/blog/numerology-compatibility-life-path']) {
  await open(page, path);
  const text = await page.evaluate(() => document.body.innerText);
  const hits = BANNED_TEXT.filter((re) => re.test(text)).map(String);
  check(`${path}: no removed claims on screen`, hits.length === 0, hits.join(', '));
}

// 4. Birth chart: golden case L01 (Kolkata 1988-03-20 02:00) — Lagna Dhanu, borderline Moon flagged,
//    method line shown, and no request leaves the page carrying the birth data.
{
  await open(page, '/tools/astrology');
  const requests = [];
  page.on('request', (r) => requests.push({ url: r.url(), body: r.postData() ?? '' }));
  await page.selectOption('select[aria-label="Day"]', '20');
  await page.selectOption('select[aria-label="Month"]', '3');
  await page.selectOption('select[aria-label="Year"]', '1988');
  await page.fill('#ast-time', '02:00');
  await page.fill('#ast-place', 'Kolkata');
  await page.waitForSelector('#ast-place-opt-0', { timeout: 10000 });
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /cast my chart/i }).click();
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => document.body.innerText);
  check('astrology: Lagna shown and is Dhanu (golden L01)', /Lagna \(Ascendant\)/.test(text) && /Dhanu \(Sagittarius\)/.test(text));
  check('astrology: borderline note shown for L01 Moon (0.009° from Meena/Mesha)', /Moon is within 0\.05° of the edge/.test(text));
  check('astrology: Moon sign is Meena or Mesha', /Meena|Mesha/.test(text));
  check('astrology: all nine grahas listed', ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].every((g) => text.includes(g)));
  check('astrology: method line names the engine', /Engine: Astronomy Engine \d/.test(text));
  // Our own files and Google Fonts only; nothing may carry the date, time, place or its coordinates.
  const allowed = (url) => url.startsWith(BASE) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url);
  const leaks = requests.filter((r) => !allowed(r.url) || /1988|02:00|kolkata|22\.57|88\.36/i.test(r.url + r.body));
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
  check('save: chart listed under "Saved on this device"', await page.getByText(/^Vedic Birth Chart\s*·/).first().isVisible());
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
  // On Hostinger, .htaccess answers retired course URLs with a real 410 Gone; locally the app shows "not found".
  for (const path of ['/courses/chakra-healing', '/legal']) {
    const response = await open(page, path);
    const gone = response?.status() === 410;
    check(`${path}: gone (410) or renders "not found"`, gone || /Page not found|404/i.test(await page.evaluate(() => document.body.innerText)),
      `status ${response?.status()}`);
  }
  await open(page, '/tools/nakshatra');
  check('/tools/nakshatra: result note under the tool', await page.getByText('Astrology offers tradition-based reflection, not guarantees.').isVisible());
}

// 7. Place search finds the playbook's test towns; the daily tools compute for a place.
{
  await open(page, '/tools/nakshatra');
  for (const town of ['Sonipat', 'Rohtak']) {
    await page.fill('#nak-place', town);
    await page.waitForFunction((t) => document.querySelector('#nak-place-opt-0')?.textContent?.startsWith(t), town, { timeout: 10000 }).catch(() => {});
    const option = await page.locator('#nak-place-opt-0').textContent().catch(() => '');
    check(`place search: "${town}" finds ${town}, Haryana`, new RegExp(`^${town}, Haryana`).test(option ?? ''), option ?? '');
  }
  const role = await page.getAttribute('#nak-place', 'role');
  check('place search: input is an ARIA combobox', role === 'combobox', String(role));

  await open(page, '/tools/vrat-calendar');
  await page.waitForSelector('text=Ekadashi', { timeout: 15000 }).catch(() => {});
  check('/tools/vrat-calendar: lists an Ekadashi in the next 45 days', /Ekadashi/.test(await page.evaluate(() => document.body.innerText)));

  await open(page, '/tools/panchang?date=2026-11-15');
  await page.waitForSelector('[data-testid="panchang-limbs"]', { timeout: 15000 }).catch(() => {});
  {
    // New Delhi is the place until a visitor chooses one, so these are fixed, hand-checked values.
    const limbs = await page.locator('[data-testid="panchang-limbs"]').innerText().catch(() => '');
    check('/tools/panchang: the five limbs with end times', /Panchang for Sunday, 15 November 2026/i.test(limbs) && /Shukla Shashthi/i.test(limbs) && /until 2:02 am, 16 Nov/.test(limbs) && /Uttara Ashadha/i.test(limbs) && /Kartika/i.test(limbs), limbs.slice(0, 160));
    const sky = await page.locator('[data-testid="panchang-sun-moon"]').innerText().catch(() => '');
    check('/tools/panchang: Sun and Moon times', /6:44 am/.test(sky) && /5:28 pm/.test(sky) && /11:41 am/.test(sky) && /10:18 pm/.test(sky), sky.replace(/\s+/g, ' ').slice(0, 160));
    const windows = await page.locator('[data-testid="panchang-windows"]').innerText().catch(() => '');
    check('/tools/panchang: Rahu Kaal and the muhurtas with times', /Rahu Kaal[\s\S]*4:07 pm to 5:28 pm/.test(windows) && /Abhijit Muhurta/i.test(windows) && /Brahma Muhurta/i.test(windows));
    const dayRows = await page.locator('[data-testid="panchang-choghadiya-day"] tbody tr').count();
    const nightRows = await page.locator('[data-testid="panchang-choghadiya-night"] tbody tr').count();
    const chog = await page.locator('[data-testid="panchang-choghadiya-day"]').innerText().catch(() => '');
    check('/tools/panchang: day and night Choghadiya, classed in words', dayRows === 8 && nightRows === 8 && /Udveg[\s\S]*Avoid/.test(chog) && /Amrit[\s\S]*Good/.test(chog), `rows ${dayRows}/${nightRows}`);
    await page.getByRole('button', { name: 'Next day' }).click();
    await page.waitForTimeout(600);
    check('/tools/panchang: the next-day button moves the date', /Monday, 16 November 2026/i.test(await page.locator('[data-testid="panchang-limbs"]').innerText().catch(() => '')));
  }

  await open(page, '/tools/planetary-hours?date=2026-11-15');
  await page.waitForSelector('text=Day horas', { timeout: 15000 }).catch(() => {});
  check('/tools/planetary-hours: opens on the date asked for', /Hora day of Sunday, 15 November/i.test(await page.evaluate(() => document.body.innerText)));

  await open(page, '/how-we-calculate');
  check('/how-we-calculate: lists the reference charts', /Reference charts we pass/.test(await page.evaluate(() => document.body.innerText)));
}

await browser.close();

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail && !r.ok ? `  — ${r.detail}` : ''}`);
console.log(`\n[smoke] ${results.length - failed.length}/${results.length} checks passed against ${BASE}`);
process.exitCode = failed.length ? 1 : 0;
