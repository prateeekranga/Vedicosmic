// Checks a deployed site's server behaviour with real HTTP requests (no browser):
//   node scripts/check-server.mjs https://staging.vedicosmic.com
// Made-up URLs return 404 with the branded page; trailing slashes and /index.html get one 301;
// retired courses return 410; every redirect in src/content/redirects.ts is a single 301 to a live
// page; security and cache headers are set; key pages carry exactly one h1 in their raw HTML.
// Uses a crawler user-agent, because Hostinger's CDN challenges automated browser-like requests.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BASE = (process.argv[2] ?? 'https://vedicosmic.com').replace(/\/$/, '');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { REDIRECTS } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });
const get = (p, opts = {}) => fetch(BASE + p, { redirect: 'manual', headers: { 'User-Agent': UA }, ...opts });
const locationOf = (r) => {
  const loc = r.headers.get('location');
  return loc ? loc.replace(/^https?:\/\/[^/]+/, '') : null;
};

// 404s are real and branded.
{
  const r = await get('/this-page-does-not-exist-' + Date.now());
  const html = await r.text();
  check('made-up URL returns 404', r.status === 404, `status ${r.status}`);
  check('404 shows the branded page', /This path is uncharted/i.test(html) && /<h1/i.test(html));
}

// One URL per page.
for (const [from, to] of [['/about/', '/about'], ['/about/index.html', '/about'], ['/index.html', '/'], ['/tools/astrology/', '/tools/astrology']]) {
  const r = await get(from);
  const loc = locationOf(r);
  check(`${from} → single 301 to ${to}`, r.status === 301 && loc === to, `status ${r.status} → ${loc}`);
}
for (const p of ['/', '/about', '/tools/astrology', '/blog/best-time-to-meditate-morning-vs-evening']) {
  const r = await get(p);
  const html = await r.text();
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  check(`${p}: 200 with one h1 in the raw HTML`, r.status === 200 && h1 === 1, `status ${r.status}, ${h1} h1`);
}

// Retired and redirected URLs.
{
  const r = await get('/courses/chakra-healing');
  check('/courses/chakra-healing returns 410', r.status === 410, `status ${r.status}`);
}
for (const { from, to } of REDIRECTS) {
  const r = await get(from);
  const loc = locationOf(r);
  const target = loc ? await get(loc) : null;
  check(`${from} → single 301 to live ${to}`, r.status === 301 && loc === to && target?.status === 200,
    `status ${r.status} → ${loc} (${target?.status})`);
}

// Headers.
{
  const r = await get('/');
  const h = (k) => r.headers.get(k) ?? '';
  check('nosniff header', h('x-content-type-options') === 'nosniff', h('x-content-type-options'));
  check('Referrer-Policy header', h('referrer-policy') === 'strict-origin-when-cross-origin', h('referrer-policy'));
  check('Permissions-Policy header', /camera=\(\)/.test(h('permissions-policy')), h('permissions-policy'));
  check('pages cached for minutes', /max-age=300\b/.test(h('cache-control')), h('cache-control'));
  const html = await r.text();
  const asset = html.match(/\/assets\/[\w.-]+\.js/)?.[0];
  if (asset) {
    const a = await get(asset);
    check('hashed assets cached for a year', /max-age=31536000/.test(a.headers.get('cache-control') ?? '') && /immutable/.test(a.headers.get('cache-control') ?? ''),
      a.headers.get('cache-control') ?? '');
  } else check('hashed assets cached for a year', false, 'no /assets/ script found on /');
  const admin = await get('/vc-portal-x7');
  check('admin is noindex', admin.status === 200 && /noindex/.test(admin.headers.get('x-robots-tag') ?? ''), `${admin.status} ${admin.headers.get('x-robots-tag')}`);
}

// Production only: www goes to the apex in one hop.
if (/^https:\/\/vedicosmic\.com$/.test(BASE)) {
  const r = await fetch('https://www.vedicosmic.com/about', { redirect: 'manual', headers: { 'User-Agent': UA } });
  check('www → apex in a single 301', r.status === 301 && r.headers.get('location') === 'https://vedicosmic.com/about', `${r.status} → ${r.headers.get('location')}`);
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : `  — ${r.detail}`}`);
console.log(`\n[check-server] ${results.length - failed.length}/${results.length} checks passed against ${BASE}`);
process.exitCode = failed.length ? 1 : 0;
