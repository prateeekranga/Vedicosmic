// Checks every pre-rendered page in dist/ the way a crawler sees it, without running JavaScript:
// exactly one h1; unique title (30–60 characters) and description (70–160); a self-referencing
// absolute canonical; og tags with a 1200×630 share image under 300 KB that exists; JSON-LD that
// parses; html lang; no "undefined"/"null" text; reciprocal hreflang; internal links that resolve.
// Every question and answer in FAQ markup must be visible on its page. Tool pages are checked
// further: template parts, heading order, enough copy of their own, and links pointing at them.
// Run after `npm run build`. Exits 1 and lists every problem.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const SITE = 'https://vedicosmic.com';
const pages = JSON.parse(fs.readFileSync(path.join(root, 'dist-ssr', 'pages.json'), 'utf8')).filter((p) => !p.clientOnly);

const problems = [];
const fail = (p, msg) => problems.push(`${p}: ${msg}`);
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const meta = (html, attr, key) => {
  const m = html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`));
  return m ? decode(m[1]) : null;
};
const fileFor = (route) => path.join(DIST, route === '/' ? 'index.html' : `${route.slice(1)}/index.html`);
const exists = (urlPath) => {
  const p = path.join(DIST, decodeURIComponent(urlPath));
  try { return fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')); } catch { return false; }
};

/** Width and height of a JPEG or PNG file, or null. */
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  for (let i = 2; i < b.length - 9;) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

const titles = new Map();
const descriptions = new Map();

/**
 * Tools whose page copy (src/content/toolContent/<slug>.ts) is still to be written. A tool not
 * listed here must have its copy; a listed tool that has copy must be removed from the list.
 * The list only ever shrinks.
 */
const COPY_PENDING = new Set([
  'planet-mandala', 'kundali-matching',
  'chakra-assessment', 'mantra-timer', 'tratak', 'crystals', 'tarot', 'vastu', 'kundalini', 'pranayama', 'soundbath',
  'chakra-frequency-player', 'urdhva', 'puja-aarti', 'yantra', 'biorhythm',
]);
const MIN_UNIQUE_WORDS = 350;
const MIN_INBOUND_PAGES = 5;

const squash = (s) => s.replace(/\s+/g, ' ').trim();
const visible = (html) => squash(decode(html.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')));
const mainOf = (html) => { const a = html.indexOf('<main'), b = html.lastIndexOf('</main>'); return a >= 0 && b > a ? html.slice(a, b) : ''; };
const jsonLdOf = (html) => [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap(([, json]) => { try { const v = JSON.parse(json); return Array.isArray(v) ? v : [v]; } catch { return []; } });
const headingsOf = (html) => [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map(([, level, inner]) => ({ level: Number(level), text: visible(inner) }));
/** Text of a page's main content, one entry per block (paragraph, list item, heading, cell). */
const blocksOf = (main) => main
  .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/g, ' ')
  .replace(/<\/?(p|li|h[1-6]|summary|details|dt|dd|td|th|caption|section|div|ul|ol|nav|header|table|tr)\b[^>]*>/g, '\n')
  .split('\n').map((b) => visible(b)).filter((b) => b.length > 0);
const wordCount = (s) => s.split(/\s+/).filter(Boolean).length;
const today = new Date().toISOString().slice(0, 10);

const htmlByPath = new Map();
const toolPages = [];

for (const p of pages) {
  const file = fileFor(p.path);
  if (!fs.existsSync(file)) { fail(p.path, 'no pre-rendered file'); continue; }
  const html = fs.readFileSync(file, 'utf8');
  htmlByPath.set(p.path, html);
  if (/^\/tools\/[^/]+$/.test(p.path)) toolPages.push(p);
  const body = html.slice(html.indexOf('<div id="root">'));
  const text = decode(body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');

  const h1s = (body.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(p.path, `${h1s} h1 elements (expected 1)`);
  if (!/^<!doctype html>\s*<html lang="[a-z-]+"/i.test(html)) fail(p.path, 'html lang is not set');
  if (/\b(undefined|null|NaN)\b/.test(text)) fail(p.path, `visible text contains "${text.match(/\b(undefined|null|NaN)\b/)[0]}"`);
  if (text.length < 200) fail(p.path, `only ${text.length} characters of text before JavaScript`);

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const description = meta(html, 'name', 'description') ?? '';
  if (title.length < 30 || title.length > 60) fail(p.path, `title is ${title.length} characters (30–60): "${title}"`);
  if (description.length < 70 || description.length > 160) fail(p.path, `description is ${description.length} characters (70–160)`);
  if (p.indexable) {
    if (titles.has(title)) fail(p.path, `title also used by ${titles.get(title)}`); else titles.set(title, p.path);
    if (descriptions.has(description)) fail(p.path, `description also used by ${descriptions.get(description)}`); else descriptions.set(description, p.path);
  }

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== SITE + p.path) fail(p.path, `canonical is ${canonical ?? 'missing'}, expected ${SITE + p.path}`);
  if (meta(html, 'property', 'og:url') !== SITE + p.path) fail(p.path, 'og:url does not match the canonical');
  for (const key of ['og:title', 'og:description', 'og:type']) if (!meta(html, 'property', key)) fail(p.path, `missing ${key}`);
  if (meta(html, 'property', 'og:locale') !== 'en_IN') fail(p.path, 'og:locale is not en_IN');

  const image = meta(html, 'property', 'og:image') ?? '';
  if (!image.startsWith(`${SITE}/`)) fail(p.path, `og:image is not an absolute ${SITE} URL: ${image}`);
  else {
    const imgFile = path.join(DIST, image.slice(SITE.length));
    if (!fs.existsSync(imgFile)) fail(p.path, `og:image file missing: ${image.slice(SITE.length)}`);
    else {
      const size = imageSize(imgFile);
      const bytes = fs.statSync(imgFile).size;
      if (!size || size.w !== 1200 || size.h !== 630) fail(p.path, `og:image is ${size ? `${size.w}×${size.h}` : 'unreadable'}, expected 1200×630`);
      if (bytes >= 300 * 1024) fail(p.path, `og:image is ${Math.round(bytes / 1024)} KB (limit 300)`);
    }
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch (e) { fail(p.path, `JSON-LD does not parse: ${e.message}`); }
  }
  if (!meta(html, 'property', 'og:image:alt')) fail(p.path, 'missing og:image:alt');

  // FAQ markup may only repeat questions and answers a visitor can read on the page.
  const pageText = visible(body);
  for (const obj of jsonLdOf(html).filter((o) => o['@type'] === 'FAQPage')) {
    for (const q of obj.mainEntity ?? []) {
      if (!pageText.includes(squash(q.name ?? ''))) fail(p.path, `FAQ markup question is not on the page: "${q.name}"`);
      if (!pageText.includes(squash(q.acceptedAnswer?.text ?? ''))) fail(p.path, `FAQ markup answer is not on the page: "${q.name}"`);
    }
  }

  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => m[2]);
  for (const href of hreflangs) {
    const other = href.startsWith(SITE) ? fileFor(href.slice(SITE.length) || '/') : null;
    if (!other || !fs.existsSync(other) || !fs.readFileSync(other, 'utf8').includes(`href="${SITE + p.path}"`)) fail(p.path, `hreflang to ${href} is not reciprocal`);
  }

  for (const [, raw] of body.matchAll(/\shref="([^"]+)"/g)) {
    let url = decode(raw);
    if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/';
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    const target = url.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (target !== '/' && !exists(target)) fail(p.path, `link to missing page ${target}`);
  }
}

// ---- Tool pages, hubs and the tools index ----
const toolSitemap = fs.existsSync(path.join(DIST, 'sitemap-tools.xml')) ? fs.readFileSync(path.join(DIST, 'sitemap-tools.xml'), 'utf8') : '';
const hubPages = pages.filter((p) => p.path === '/tools' || p.path.startsWith('/tools/category/'));

// Pages whose main content links to each page.
const inbound = new Map();
for (const [from, html] of htmlByPath) {
  for (const [, raw] of mainOf(html).matchAll(/\shref="([^"]+)"/g)) {
    let url = decode(raw);
    if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/';
    if (!url.startsWith('/')) continue;
    const [target, fragment] = url.split('#');
    const clean = target.split('?')[0].replace(/\/$/, '') || '/';
    if (clean !== from) { if (!inbound.has(clean)) inbound.set(clean, new Set()); inbound.get(clean).add(from); }
    // A link to a section must land on something.
    if (fragment && htmlByPath.has(clean) && !htmlByPath.get(clean).includes(`id="${fragment}"`)) fail(from, `link to ${clean}#${fragment}, but that page has no such section`);
  }
}

// Blocks of text that appear on more than one tool page do not count as a page's own copy.
const blockPages = new Map();
const toolBlocks = new Map();
for (const p of toolPages) {
  const blocks = [...new Set(blocksOf(mainOf(htmlByPath.get(p.path))))];
  toolBlocks.set(p.path, blocks);
  for (const b of blocks) blockPages.set(b, (blockPages.get(b) ?? 0) + 1);
}

for (const p of [...toolPages, ...hubPages]) {
  const html = htmlByPath.get(p.path);
  if (!html) continue;
  const main = mainOf(html);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');

  // Headings: the h1 first, no level skipped, none empty, none repeated, and the h1 is not the title.
  const headings = headingsOf(main);
  if (headings[0]?.level !== 1) fail(p.path, 'the first heading is not the h1');
  const seenHeadings = new Set();
  headings.forEach((h, i) => {
    if (!h.text) fail(p.path, `empty h${h.level}`);
    if (i > 0 && h.level > headings[i - 1].level + 1) fail(p.path, `heading level skipped before "${h.text}"`);
    const key = h.text.toLowerCase();
    if (seenHeadings.has(key)) fail(p.path, `heading repeated: "${h.text}"`);
    seenHeadings.add(key);
  });
  if (headings[0]?.text === title) fail(p.path, 'the h1 repeats the page title word for word');

  // The visible breadcrumb and the BreadcrumbList must name the same pages.
  const ld = jsonLdOf(html);
  const nav = main.match(/<nav aria-label="Breadcrumb"[\s\S]*?<\/nav>/)?.[0];
  const crumbs = ld.find((o) => o['@type'] === 'BreadcrumbList')?.itemListElement?.map((i) => i.name) ?? [];
  if (!nav || !/<ol\b/.test(nav)) fail(p.path, 'no breadcrumb list (nav > ol)');
  else {
    const shown = [...nav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, li]) => visible(li).replace(/\s*\/\s*$/, ''));
    if (shown.join(' > ') !== crumbs.join(' > ')) fail(p.path, `breadcrumb shows "${shown.join(' > ')}" but the markup says "${crumbs.join(' > ')}"`);
  }
}

for (const p of toolPages) {
  const html = htmlByPath.get(p.path);
  const slug = p.path.split('/').pop();
  const main = mainOf(html);
  const ld = jsonLdOf(html);
  const hasCopy = main.includes('id="about"');

  if (COPY_PENDING.has(slug) && hasCopy) fail(p.path, 'has page copy now: remove it from COPY_PENDING in scripts/verify-prerender.mjs');
  if (!COPY_PENDING.has(slug)) {
    for (const id of ['tool', 'about', 'how-to-use', 'reading', 'method', 'faq', 'related-tools']) {
      if (!main.includes(`id="${id}"`)) fail(p.path, `missing the #${id} section`);
    }
    const own = toolBlocks.get(p.path).filter((b) => blockPages.get(b) === 1);
    const words = own.reduce((n, b) => n + wordCount(b), 0);
    if (words < MIN_UNIQUE_WORDS) fail(p.path, `only ${words} words of its own before JavaScript (needs ${MIN_UNIQUE_WORDS})`);
    if (!new RegExp(`<loc>${SITE}${p.path}</loc>\\s*<lastmod>`).test(toolSitemap)) fail(p.path, 'no lastmod in sitemap-tools.xml');
    // HowTo markup may only describe steps a visitor can read.
    const text = visible(main);
    for (const howTo of ld.filter((o) => o['@type'] === 'HowTo')) {
      for (const step of howTo.step ?? []) {
        if (!text.includes(squash(step.name)) || !text.includes(squash(step.text))) fail(p.path, `HowTo step is not on the page: "${step.name}"`);
      }
    }
  }

  if (p.indexable) {
    const apps = ld.filter((o) => o['@type'] === 'WebApplication');
    if (apps.length !== 1) fail(p.path, `${apps.length} WebApplication objects (expected 1)`);
    else {
      if (apps[0].url !== SITE + p.path) fail(p.path, 'WebApplication url is not the canonical URL');
      if (apps[0].offers?.price !== '0') fail(p.path, 'WebApplication is not marked free');
      if (apps[0].dateModified && apps[0].dateModified > today) fail(p.path, `dateModified ${apps[0].dateModified} is in the future`);
    }
    if (/aggregateRating|ratingValue/.test(html)) fail(p.path, 'structured data claims a rating');
    const from = inbound.get(p.path) ?? new Set();
    if (!from.has('/tools')) fail(p.path, 'not linked from /tools');
    if (![...from].some((f) => f.startsWith('/tools/category/'))) fail(p.path, 'not linked from its category page');
    if (from.size < MIN_INBOUND_PAGES) fail(p.path, `linked from the content of only ${from.size} page(s) (needs ${MIN_INBOUND_PAGES})`);
  }
}
const pendingLive = toolPages.filter((p) => COPY_PENDING.has(p.path.split('/').pop())).length;
console.log(`[verify-prerender] tool pages: ${toolPages.length - pendingLive} with their own copy, ${pendingLive} still pending.`);

if (!fs.existsSync(path.join(DIST, '404.html'))) problems.push('dist/404.html is missing');

for (const msg of problems) console.error(`✗ ${msg}`);
console.log(`[verify-prerender] ${pages.length} pages checked, ${problems.length} problem(s).`);
process.exitCode = problems.length ? 1 : 0;
