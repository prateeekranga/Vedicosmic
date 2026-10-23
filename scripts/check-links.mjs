// Internal link check on the built site. Every href/src in dist/**/*.html that points inside
// the site must resolve to a file in dist/ or to a pre-rendered page (dist/<path>/index.html).
// A crawler cannot do this against `vite preview` or the live server: both answer unknown
// paths with the app shell and status 200. Run after `npm run build`; exits 1 on broken links.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = 'https://vedicosmic.com';
// Real routes that are deliberately not pre-rendered (noindex or client-only).
const CLIENT_ONLY = new Set(['/tools/kundali-matching']);

const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const exists = (rel) => {
  const p = path.join(DIST, decodeURIComponent(rel));
  if (!p.startsWith(DIST)) return false;
  try {
    const st = fs.statSync(p);
    return st.isFile() || fs.existsSync(path.join(p, 'index.html'));
  } catch { return false; }
};

const broken = new Map(); // target -> pages linking to it
let checked = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const page = '/' + path.relative(DIST, file).replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '');
  for (const [, attr] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let url = attr.replace(/&amp;/g, '&');
    if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/';
    if (!url.startsWith('/') || url.startsWith('//')) continue; // external, mailto:, tel:, #hash
    const target = url.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    checked++;
    if (target === '/' || CLIENT_ONLY.has(target) || exists(target)) continue;
    if (!broken.has(target)) broken.set(target, new Set());
    broken.get(target).add(page || '/');
  }
}

for (const [target, pages] of broken) {
  console.error(`✗ ${target}  ← linked from ${[...pages].slice(0, 3).join(', ')}${pages.size > 3 ? ` and ${pages.size - 3} more` : ''}`);
}
console.log(`[check-links] ${htmlFiles.length} pages, ${checked} internal links, ${broken.size} broken target(s).`);
process.exitCode = broken.size ? 1 : 0;
