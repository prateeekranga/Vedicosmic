// Checks every pre-rendered page in dist/ the way a crawler sees it, without running JavaScript:
// exactly one h1; unique title (30–60 characters) and description (70–160); a self-referencing
// absolute canonical; og tags with a 1200×630 share image under 300 KB that exists; JSON-LD that
// parses; html lang; no "undefined"/"null" text; reciprocal hreflang; internal links that resolve.
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

for (const p of pages) {
  const file = fileFor(p.path);
  if (!fs.existsSync(file)) { fail(p.path, 'no pre-rendered file'); continue; }
  const html = fs.readFileSync(file, 'utf8');
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

if (!fs.existsSync(path.join(DIST, '404.html'))) problems.push('dist/404.html is missing');

for (const msg of problems) console.error(`✗ ${msg}`);
console.log(`[verify-prerender] ${pages.length} pages checked, ${problems.length} problem(s).`);
process.exitCode = problems.length ? 1 : 0;
