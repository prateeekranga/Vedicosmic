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

// 2d. Lo Shu report: hand-worked case K1 (15 August 1990, female: grid 1 x2, 5, 6 x2, 8 x2, 9 x2; 2, 3, 4 and 7 missing; Driver 6,
//     Conductor 6, Kua 8). An impossible date is refused, no request carries the date of birth, and every tab says what it should.
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
  await page.waitForSelector('[data-testid="loshu-summary"]', { timeout: 10000 });
  const tool = page.locator('#tool');
  const panel = (id) => page.locator(`#loshu-panel-${id}`);
  const showTab = async (name) => { await page.getByRole('tab', { name }).click(); await page.waitForTimeout(150); };

  // --- the report opens on its summary, with the form folded away and save, link and print up front
  check('loshu-report: the form folds away and the report names the person', !(await page.locator('select[aria-label="Day"]').isVisible().catch(() => false))
    && /Born 15 August 1990 · Female/.test(await page.locator('[data-testid="loshu-subject"]').innerText()));
  const order = await tool.evaluate((el) => {
    const q = (sel) => el.querySelector(sel);
    const before = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
    const print = [...el.querySelectorAll('button')].find((b) => /Print or save PDF/.test(b.textContent));
    return { printBeforeTabs: before(print, q('[role="tablist"]')), editButton: !![...el.querySelectorAll('button')].find((b) => /Edit details/.test(b.textContent)) };
  });
  check('loshu-report: print and save sit above the tabs, and details can be edited', order.printBeforeTabs && order.editButton, JSON.stringify(order));
  const tabNames = (await page.getByRole('tab').allInnerTexts()).map((t) => t.trim());
  check('loshu-report: nine tabs, in the order a reading is explained', tabNames.join(' | ') === 'Summary | Grid reading | Career, money, love, health | Years ahead | Marriage years | Remedies | Name and mobile | Numbers and dates | Reference', tabNames.join(' | '));

  // --- Summary
  const summary = page.locator('[data-testid="loshu-summary"]');
  const cells = await summary.locator('table button').evaluateAll((els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  const cell = (n) => cells.find((c) => c.startsWith(String(n))) ?? '';
  check('loshu-summary: 6 appears twice (Driver and Conductor added)', /appears twice: once as the Driver and once as the Conductor/.test(cell(6)), cell(6));
  check('loshu-summary: 8 appears twice (date and Kua)', /appears twice: once from the date and once as the Kua number/.test(cell(8)), cell(8));
  check('loshu-summary: 2, 3, 4 and 7 are missing', [2, 3, 4, 7].every((n) => / missing,/.test(cell(n))) && [1, 5, 6, 8, 9].every((n) => !/ missing,/.test(cell(n))));
  const arrows = await summary.locator('[data-testid="loshu-arrows"] [data-line]').evaluateAll((els) => els.map((e) => e.getAttribute('data-line')).sort());
  check('loshu-summary: an arrow is drawn for each complete line and no other', arrows.join(',') === 'practical,will', arrows.join(','));
  const named = await summary.locator('[data-testid="loshu-lines"]').innerText();
  check('loshu-summary: the complete lines are named under the grid, without a list of what is not formed', /Will plane/.test(named) && /Practical plane/.test(named) && !/is not formed/.test(named), named);
  const legend = await summary.locator('table').first().locator('xpath=ancestor::div[contains(@class,"max-w-[380px]")]/following-sibling::p').last().innerText().catch(() => '');
  const summaryText = await summary.innerText();
  check('loshu-summary: a number that repeats is written as many times as it appears, and the legend says so with a real example',
    /A number is written as often as it appears: “11” means 1 appears twice/.test(summaryText) && !/(^|\s)×\d/.test(summaryText), legend);
  const digitRuns = await summary.locator('table button span[aria-hidden="true"]').allInnerTexts();
  check('loshu-summary: the repeated cells read 11, 66, 88 and 99, and the single ones 5 (no “×2” in any cell)',
    ['11', '66', '88', '99', '5'].every((t) => digitRuns.includes(t)) && !digitRuns.some((t) => /×/.test(t)), digitRuns.join('|'));
  const geometry = await page.evaluate(() => {
    const header = document.querySelector('[data-testid="loshu-subject"]').closest('div[class*="rounded"]');
    const tiles = [...document.querySelectorAll('[data-testid="loshu-summary"] .grid-cols-3 > div')];
    const top = header.getBoundingClientRect().top;
    return { tiles: tiles.length, sameRow: new Set(tiles.map((t) => Math.round(t.getBoundingClientRect().top))).size === 1, coreBottom: Math.round(tiles[0].getBoundingClientRect().bottom - top) };
  });
  check('loshu-summary: the three numbers sit in one row, within about one screen of the top of the report', geometry.tiles === 3 && geometry.sameRow && geometry.coreBottom < 640, JSON.stringify(geometry));
  check('loshu-summary: says what a Lo Shu grid is, in a line above it', /3×3 arrangement of the numbers 1 to 9/.test(await summary.innerText()));
  check('loshu-summary: the 15th is shown as 15/6, as an analyst writes it', /Day 15: 15\/6/.test(await summary.innerText()));
  // The arrows run the full length of each line on a layer behind the cell text: the arrow layer sits below the numbers, and no patch crops it.
  const layers = await summary.locator('table button', { hasText: /^6/ }).first().evaluate((el) => {
    const text = el.querySelector('span');
    const svg = el.closest('div').querySelector('svg[data-testid="loshu-arrows"]');
    return { textBg: getComputedStyle(text).backgroundColor, textZ: Number(getComputedStyle(text).zIndex), svgZ: Number(getComputedStyle(svg).zIndex) };
  });
  check('loshu-summary: arrows run behind the numbers, uncropped (arrow layer under the text, no patch on the text)',
    layers.textBg === 'rgba(0, 0, 0, 0)' && layers.svgZ < layers.textZ, JSON.stringify(layers));
  const glance = await summary.innerText();
  check('loshu-summary: the core numbers are shown at once', /Mulank · Driver/.test(glance) && /Bhagyank · Conductor/.test(glance) && /Kua/.test(glance));
  check('loshu-summary: at a glance, in plain words: what is strong, held often, missing, the areas, the year',
    /Practical plane \(getting things done\) and Will plane \(strong willpower\)/.test(glance) && /1 \(Sun, twice\), 6 \(Venus, twice\), 8 \(Saturn, twice\) and 9 \(Mars, twice\)/.test(glance)
    && /2 \(feeling and intuition\), 3 \(learning and expression\), 4 \(order and method\) and 7 \(inquiry and detachment\)/.test(glance)
    && /Health and energy has the most of its five key numbers present\./.test(glance) && /The year of \w+ \(Antar Dasha \d\): Venus, the planet of your Driver and Conductor, (regards \w+ as (a friend|neutral|unfriendly)|is your own number)|The year of Venus \(Antar Dasha 6\): Venus is your own number/.test(glance), glance.slice(0, 900));
  check('loshu-summary: the three areas are counts of key numbers present, with no score or point total',
    /3 of 5 present/.test(glance) && /4 of 5 present/.test(glance) && /To build: 3, 4/.test(glance) && /To build: 2, 3/.test(glance) && !/\d of 10|\d of 8|[+−]\d|supported|Room to build/.test(glance));
  check('loshu-summary: where to start names the yog a missing number would complete', /Completes the Silver Raj Yog \(2-5-8\)/.test(glance) && /Completes the Golden Raj Yog \(4-5-6\)/.test(glance));
  check('loshu-summary: says once that it is tradition and not prediction, and that nothing leaves the device', /not a prediction or advice/.test(glance) && /nothing is sent anywhere/.test(glance));

  // --- Your grid
  await showTab('Grid reading');
  const gridTab = await panel('grid').innerText();
  check('loshu-grid: the full grid says what is not formed, and how close it is', /Golden Raj Yog \(4-5-6\) is not formed/.test(await panel('grid').locator('[data-testid="loshu-lines"]').innerText()));
  check('loshu-grid: the eight lines are one table, with prose for complete lines and lines one number short',
    (await panel('grid').locator('[data-testid="loshu-lines-table"] tbody tr').count()) === 8 && /Complete/.test(gridTab) && /One number short: \d completes it/.test(gridTab));
  const numberRows = await panel('grid').locator('[data-testid="loshu-numbers"] li').allInnerTexts();
  check('loshu-grid: number by number lists all nine in order 1 to 9, repeated and missing together', numberRows.length === 9 && numberRows.every((t, i) => t.trim().startsWith(String(i + 1))) && /A missing 2 is read as/.test(gridTab), numberRows.map((t) => t.slice(0, 6)).join('|'));
  check('loshu-grid: the planet is named but the planet’s keyword is not set beside a reading from the grid', !/Identity and will|Patience and structure/.test(await panel('grid').locator('[data-testid="loshu-numbers"]').innerText())
    && /ruler in Indian numerology/.test(await panel('grid').locator('[data-testid="loshu-numbers"]').innerText()));
  await page.getByText('With current dasha', { exact: true }).click();
  await page.waitForTimeout(400);
  const periodArrows = await panel('grid').locator('[data-testid="loshu-arrows"] [data-line]').evaluateAll((els) => els.map((e) => e.getAttribute('data-line')));
  check('loshu-grid: the dasha view keeps the birth arrows and may add more', periodArrows.includes('will') && periodArrows.includes('practical'), periodArrows.join(','));
  check('loshu-grid: the dasha view marks the added numbers', /M and A mark a number added/.test(await panel('grid').innerText()));

  // --- Career, money, love, health
  await showTab('Career, money, love, health');
  // 15 August 1990 holds 5 once and 6 twice: both money numbers present.
  const moneyCard = await page.locator('[data-testid="area-money"]').innerText();
  check('loshu-money: money is read through 5 and 6, in words and a count', /2\s*\/\s*2/.test(moneyCard) && /Both 5 and 6 are in your grid/.test(moneyCard), moneyCard.slice(0, 160));
  check('loshu-money: says it is not financial advice', /not financial advice/.test(await page.locator('[data-testid="loshu-areas"]').innerText()));
  // The cards stand side by side from a tablet up; measure there, then return to the phone width.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(200);
  const rowTops = await page.evaluate(() => ['area-career', 'area-relationships'].map((id) => {
    const card = document.querySelector(`[data-testid="${id}"]`);
    return [...card.children].map((c) => Math.round(c.getBoundingClientRect().top));
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  check('loshu-areas: cards side by side share their rows (count, numbers, reading, step and fold line up)',
    rowTops[0].length === 7 && rowTops[0].every((t, i) => Math.abs(t - rowTops[1][i]) <= 1), JSON.stringify(rowTops));
  const areas = page.locator('[data-testid="loshu-areas"]');
  const career = await areas.locator('[data-testid="area-career"]').innerText();
  const relationships = await areas.locator('[data-testid="area-relationships"]').innerText();
  const health = await areas.locator('[data-testid="area-health"]').innerText();
  check('loshu-areas: each area says how many of its five key numbers are present, in words and a count',
    /3\s*\/\s*5/.test(career) && /To build: 3, 4/.test(career) && /3\s*\/\s*5/.test(relationships) && /4\s*\/\s*5/.test(health) && /To build: 2/.test(health)
    && !/supported|Room to build/.test(career + relationships + health));
  check('loshu-areas: each gap gets one step', /Try: /.test(career) && /Try: /.test(relationships));
  check('loshu-areas: says health is habits and energy, not medical advice', /not medical advice/.test(await areas.innerText()) && /Health and energy/i.test(health));
  check('loshu-areas: the years ahead are not repeated here', !/This dasha year|Best short period/.test(await areas.innerText()));
  const working = areas.locator('[data-testid="area-working"]');
  check('loshu-areas: the points arithmetic is folded away and labelled as this page’s own method',
    (await working.getAttribute('open')) === null && /own method/.test(await working.locator('summary').innerText()) && /of 10/.test(await working.evaluate((e) => e.textContent)));

  // --- Years ahead
  await showTab('Years ahead');
  const years = page.locator('[data-testid="loshu-years"]');
  const dasha = await page.locator('[data-testid="loshu-dasha"]').innerText();
  check('loshu-years: shows the Maha, Antar and Pratyantar Dasha running today', /Maha Dasha/i.test(dasha) && /Antar Dasha/i.test(dasha) && /Pratyantar Dasha/i.test(dasha) && /Your grid in this period/i.test(dasha));
  check('loshu-years: the dasha section has no table of its own', (await page.locator('[data-testid="loshu-dasha"] table').count()) === 0);
  const firstYear = await page.locator('[data-testid="loshu-outlook"] tbody tr').first().evaluate((e) => e.textContent);
  check('loshu-years: five dasha years, each saying which planet regards which, in that direction',
    (await page.locator('[data-testid="loshu-outlook"] tbody tr').count()) === 5 && /(Venus, the planet of your Driver and Conductor, regards \w+ as (a friend|neutral|unfriendly)|Venus is your own number)/.test(firstYear), firstYear);
  const yearsOrder = await years.evaluate((el) => {
    const a = el.querySelector('[data-testid="loshu-outlook"]'); const b = el.querySelector('[data-testid="loshu-dasha"]');
    return !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  check('loshu-years: the years in words come before the running periods', yearsOrder);
  check('loshu-years: says it cannot time a job change, and points to Marriage years', /does not time a change of job/.test(await years.innerText()) && /under Marriage years/.test(await years.innerText()));
  check('loshu-years: each area has a reading for this year, in words', (await page.locator('[data-testid="loshu-outlook"] h4').first().innerText()) !== '' && /Career/.test(await years.innerText()));
  const scores = years.locator('[data-testid="loshu-scores"]');
  check('loshu-years: every score is folded away and labelled as this page’s own method',
    (await scores.getAttribute('open')) === null && /own method/.test(await scores.locator('summary').innerText()));
  await scores.locator('summary').click();
  const scoreText = await scores.innerText();
  check('loshu-years: the fold holds the scored tones, nine short periods and the rule', (await scores.locator('tbody tr').count()) === 14 && /Favourable|Neutral|Needs care/.test(scoreText) && /A total of \+2 or more reads favourable/.test(scoreText));
  check('loshu-years: says plainly it is a way of reading and not a forecast', /cannot say what will happen/.test(await years.innerText()));

  // --- Remedies
  await showTab('Remedies');
  const remedy2 = page.locator('[data-testid="remedy-2"]');
  const remedy2Text = await remedy2.innerText();
  check('loshu-remedies: the first priority (2, the Moon) is open, with daily life, offering and mantra, colours, things to use, a gift, numbers around you and the home',
    (await remedy2.getAttribute('open')) !== null && /Completes the Silver Raj Yog/.test(remedy2Text) && /Om Chandraya Namaha/.test(remedy2Text)
    && ['Daily life', 'Offering and mantra', 'Colours to wear', 'Everyday items', 'Phone and laptop wallpaper', 'Things to use', 'Give', 'Numbers around you', 'Home'].every((l) => new RegExp(l, 'i').test(remedy2Text)), remedy2Text.slice(0, 300));
  check('loshu-remedies: the Moon’s five everyday items and its wallpaper (a full Moon over calm water)', /watch with a white or silver dial/.test(remedy2Text) && /white or silver pen/.test(remedy2Text) && /silver-toned bottle or mug/.test(remedy2Text) && /white, cream or silver wallet/.test(remedy2Text) && /white, cream or pale silver phone cover/.test(remedy2Text) && /full Moon over calm water/.test(remedy2Text));
  check('loshu-remedies: the Moon’s everyday items are practical objects (a silver strap, a white handkerchief, a pearl-white keychain)', /silver-toned or white strap/.test(remedy2Text) && /white or silver pen/.test(remedy2Text) && /phone cover/.test(remedy2Text));
  check('loshu-remedies: the Moon’s remedies are the Moon’s (milk and water to Shiva on Monday, white and silver, the South-West)', /milk and water to Shiva/.test(remedy2Text) && /white, cream or silver/.test(remedy2Text) && /Lo Shu direction: South-West/.test(remedy2Text));
  await remedy2.locator('details summary').click();
  check('loshu-remedies: the weekly observance and the stone are one fold away', /Weekly observance/.test(await remedy2.evaluate((e) => e.textContent)) && /Stone: Pearl/.test(await remedy2.evaluate((e) => e.textContent)));
  const remediesText = await page.locator('#loshu-panel-remedies').evaluate((e) => e.textContent);
  check('loshu-remedies: 4 and 7 are listed too, and gemstones are never advised',
    (await page.locator('[data-testid="remedy-4"]').count()) === 1 && (await page.locator('[data-testid="remedy-7"]').count()) === 1
    && /never suggests buying/.test(remediesText) && /hessonite/.test(remediesText));
  check('loshu-remedies: nothing on the page borrows a planet’s colour for a Lo Shu direction', !/touch of/.test(remediesText));
  // 15 August 1990 holds 1, 6, 8 and 9 twice each: each gets a card of balancing customs, closed because twice is usually a strength.
  const repeatCards = page.locator('[data-testid="loshu-repeats"] [data-testid^="repeat-"]');
  check('loshu-repeats: every number held twice has a card, closed, saying twice is usually a strength',
    (await repeatCards.count()) === 4 && (await repeatCards.first().getAttribute('open')) === null && /Held twice: usually a strength/.test(await repeatCards.first().evaluate((e) => e.textContent)));
  check('loshu-repeats: the page says which of these customs are traditional and which are its own arrangement', /no classical text lists them/.test(await page.locator('#loshu-panel-remedies').evaluate((e) => e.textContent)));

  // --- Marriage years: born 15 August 1990, Mulank 6, Mulank Maha 6 + 8 = 14, then 5.
  await showTab('Marriage years');
  const marriage = await panel('marriage').innerText();
  check('loshu-marriage: shows the Mulank Maha with its working, and the Vivah Mulanks that suit Mulank 6', /Mulank 6 \+ month 8 = 14, then 1 \+ 4 = 5/.test(marriage) && /1, 2, 3, 5, 6 or 9 favour marriage/.test(marriage), marriage.slice(0, 300));
  check('loshu-marriage: twelve coming years, the ones that favour marriage marked in words', (await panel('marriage').locator('[data-testid^="marriage-year-"]').count()) === 12
    && (await panel('marriage').locator('[data-testid="marriage-year-yes"]').count()) > 0 && /Favours marriage/.test(marriage));
  await panel('marriage').locator('[data-testid="marriage-check"] input').fill('2027');
  check('loshu-marriage: a year can be checked, with its working (2027 + 5 = 2032, Vivah Mulank 7, not for Mulank 6)',
    /2027 \+ 5 = 2032/.test(await panel('marriage').locator('[data-testid="marriage-check"]').innerText()) && /Not by this method/.test(await panel('marriage').locator('[data-testid="marriage-check"]').innerText()));
  check('loshu-marriage: says where the method comes from, and that a year is not a promise', /lineage teaching/.test(marriage) && /not a promise/.test(marriage));

  // --- Name and mobile: none given, so the tab offers to add them.
  await showTab('Name and mobile');
  check('loshu-person: with no name or number, the tab says how to add them', /Add your name, your mobile number or both under Edit details/.test(await panel('person').innerText()));

  // --- Lucky and careful: the pair tables for Mulank 6 with Bhagyank 6.
  await showTab('Numbers and dates');
  const lucky = await page.locator('[data-testid="loshu-lucky"]').innerText();
  check('loshu-lucky: the pair tables for 6 & 6 come first: lucky numbers, dates, colours, work and name totals',
    /Mulank 6 with Bhagyank 6/.test(lucky) && /1, 6, 10, 15, 19, 24, 28/.test(lucky) && /Green, Light blue/.test(lucky) && /Friday/.test(lucky) && /Fancy and luxury goods/.test(lucky), lucky.slice(0, 300));
  check('loshu-lucky: the stones carry the astrologer note', /qualified astrologer/.test(lucky));
  const datesText = await page.locator('[data-testid="loshu-dates"]').innerText();
  check('loshu-lucky: coming dates are laid out on the calendar as best, good and go carefully',
    /(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d+ \w{3}/.test(datesText) && /best: your own number/i.test(datesText) && /good: other dates that suit/i.test(datesText) && /go carefully/i.test(datesText), datesText.slice(0, 200));
  check('loshu-lucky: one link to the phone-number tool, not two', (await page.locator('#loshu-panel-lucky').getByRole('link', { name: /Mobile Number Numerology/ }).count()) === 1);
  const challenging = await page.locator('[data-testid="careful-challenging"]').innerText();
  check('loshu-careful: 1 and 2 are the numbers to go carefully with; 1 is marked lucky for the pair and its dates left out',
    /2, 11, 20, 29/.test(challenging) && /1, 10, 19, 28 left out/.test(challenging) && /lucky for your pair/.test(challenging) && /Sunday, Monday/.test(challenging), challenging.replace(/\s+/g, ' '));
  check('loshu-careful: says once where the pair tables and the friendship table differ', /Here that is 1 \(Sun\)/.test(await page.locator('[data-testid="pair-differs"]').innerText()));
  const carefulText = await page.locator('[data-testid="loshu-careful"]').innerText();
  check('loshu-careful: never lists the Driver or Conductor, and says it is preference, not fortune', !/Venus/.test(challenging.split('Dates')[0]) && /not of fortune/.test(carefulText));
  await page.fill('#tool [data-testid="loshu-check"] input', '9876543210');
  check('loshu-check: a number is added down and given a plain verdict (45, then 9: neutral for Venus)', /Neutral/.test(await page.locator('[data-testid="loshu-check"]').innerText()) && /= 45, then 4 \+ 5 = 9/.test(await page.locator('[data-testid="loshu-check"]').innerText()));
  await page.fill('#tool [data-testid="loshu-check"] input', 'MH 12 AB 1234');
  check('loshu-check: letters are ignored (MH 12 AB 1234 adds to 13, then 4: friendly)', /Friendly/.test(await page.locator('[data-testid="loshu-check"]').innerText()));

  // --- More
  await showTab('Reference');
  const more = await panel('more').innerText();
  const directions = await page.locator('[data-testid="loshu-directions"]').innerText();
  check('loshu-more: missing numbers are given their Lo Shu directions, and it says this is not Vastu Shastra',
    /South-West \(2\), East \(3\), South-East \(4\), West \(7\)/.test(directions) && /not the planet-direction scheme of Vastu Shastra/.test(directions), directions.slice(0, 200));
  check('loshu-more: the Kua directions carry their plain English names', /Sheng Qi · success/i.test(more) && /Fu Wei · stability/i.test(more));
  check('loshu-more: nine words are explained, and the words come first', (await page.locator('[data-testid="loshu-glossary"] dt').count()) === 9
    && await panel('more').evaluate((el) => { const g = el.querySelector('[data-testid="loshu-glossary"]'); const d = el.querySelector('[data-testid="loshu-directions"]'); return !!(g && d && (g.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING)); }));
  check('loshu-more: names the directions to go gently with (Kua 8 is the west group)', /Directions to go gently with: North, South, East and South-East/.test(more));
  check('loshu-more: method line names the numerology engine', /Engine: VediCosmic numerology \d/.test(more));
  check('loshu-more: points to the name, Chaldean, mobile and Life Path tools', (await panel('more').getByRole('link', { name: /Numerology Calculator|Chaldean|Mobile Number|Life Path/ }).count()) >= 4);

  // --- keyboard and layout
  await page.getByRole('tab', { name: 'Summary' }).focus();
  await page.keyboard.press('ArrowRight');
  check('loshu-report: the arrow key moves between tabs', (await page.getByRole('tab', { name: 'Grid reading' }).getAttribute('aria-selected')) === 'true');
  await page.keyboard.press('End');
  check('loshu-report: End jumps to the last tab', (await page.getByRole('tab', { name: 'Reference' }).getAttribute('aria-selected')) === 'true');
  check('loshu-report: the tab bar stays in view while a tab is read', await page.getByRole('tablist').locator('xpath=ancestor::div[contains(@class,"sticky")]').first().evaluate((e) => getComputedStyle(e).position === 'sticky'));
  let widest = 0;
  for (const name of tabNames) {
    await showTab(name);
    widest = Math.max(widest, await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
  }
  check('loshu-report: no tab scrolls sideways at phone width', widest <= 1, `${widest}px over`);
  const allowed = (url) => url.startsWith(BASE) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url);
  const leaks = requests.filter((r) => !allowed(r.url) || /1990|08-15|15-08/.test(r.url + r.body));
  check('loshu-grid: no request carries the date of birth', leaks.length === 0, leaks.map((r) => r.url).join(', '));
  check('loshu-report: the page is far shorter than before (the whole report is at most 10 phone screens on a tab)',
    (await page.evaluate(() => Math.max(...[...document.querySelectorAll('[role="tabpanel"]:not([hidden])')].map((p) => p.getBoundingClientRect().height)))) < 8440);
  await showTab('Summary');
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
  // 12 pages on A4 since marriage years were added and remedies print as labelled rows (every page checked to carry
  // content, 18 November 2026). More than 13 would mean a section is spilling onto an empty page.
  check('print: the full Lo Shu report has no blank pages', full >= 6 && full <= 13, `${full} pages`);
  await page.emulateMedia({ media: 'screen' });

  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const title = await page.title();
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  check('print: the PDF is named after the report and the person', title === 'Lo Shu Grid Report - Smoke Test - VediCosmic', title);
  check('print: the page title comes back after printing', !/Smoke Test/.test(await page.title()));

  // --- a number held often (1 January 2011: four 1s): the card is open, says it is worth balancing, and carries the Sun's customs
  await page.getByRole('button', { name: /Start again/ }).click();
  await page.waitForSelector('select[aria-label="Day"]', { timeout: 10000 });
  await page.selectOption('select[aria-label="Day"]', '1');
  await page.selectOption('select[aria-label="Month"]', '1');
  await page.selectOption('select[aria-label="Year"]', '2011');
  await page.getByRole('button', { name: 'Make my grid' }).click();
  await page.waitForSelector('[data-testid="loshu-summary"]', { timeout: 10000 });
  await page.getByRole('tab', { name: 'Remedies' }).click();
  const often = page.locator('[data-testid="repeat-1"]');
  const oftenText = await often.evaluate((e) => e.textContent);
  check('loshu-repeats: the Sun held often is open and worth balancing, with the signs, the colours, the gift and the speaking',
    (await often.getAttribute('open')) !== null && /worth balancing/i.test(oftenText) && /stubbornness, ego or unbalanced energy/.test(oftenText) && /Go easy on strong red, gold and ruby/.test(oftenText)
    && /Donate red-coloured items/.test(oftenText) && /active listening/.test(oftenText) && /go lighter on 1 in a phone, house or vehicle number/.test(oftenText) && /Lo Shu direction: North/.test(oftenText) && /Items to swap/i.test(oftenText) && /Swap a red or gold watch strap, phone cover or wallet/.test(oftenText) && /calm green forest or a soft blue sky, rather than a strong red or gold sunrise/.test(oftenText), oftenText.slice(0, 200));
  check('loshu-repeats: a grid with a number held often still lists the remedies for what it lacks', (await page.locator('[data-testid^="remedy-"]').count()) >= 1);
  await page.getByRole('tab', { name: 'Summary' }).click();
  const runs = await page.locator('[data-testid="loshu-summary"] table button span[aria-hidden="true"]').allInnerTexts();
  check('loshu-summary: four 1s are written 1111, in a smaller size so that they fit the cell', runs.some((t) => /^1{4,}$/.test(t)), runs.join('|'));
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
