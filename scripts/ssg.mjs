// Static site generation: renders every page with React in Node (no browser) into dist/, so each
// page is complete HTML before any JavaScript runs; the browser then hydrates it (src/main.tsx).
// Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
// Also writes dist-ssr/pages.json, the page list the sitemap, share-card and verify scripts use.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fetchDbPosts } from './lib/fetchDbPosts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(root, 'dist');
const { render, routesToRender, headFor } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);

const SEO_BLOCK = /<!--seo-->[\s\S]*?<!--\/seo-->/;
const ROOT_DIV = '<div id="root"></div>';
// dist/index.html is the template until this script overwrites it with the home page, so keep a
// copy: running the script again (without a new `vite build`) reuses it.
const SAVED = path.join(root, 'dist-ssr', 'template.html');
const fresh = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const template = fresh.includes(ROOT_DIV) ? fresh : fs.existsSync(SAVED) ? fs.readFileSync(SAVED, 'utf8') : fresh;
if (!SEO_BLOCK.test(template) || !template.includes(ROOT_DIV)) {
  throw new Error('dist/index.html lacks the <!--seo--> block or an empty #root; run `vite build` first.');
}
fs.writeFileSync(SAVED, template);

const page = (head, html) => template.replace(SEO_BLOCK, () => head).replace(ROOT_DIV, () => `<div id="root">${html}</div>`);

function write(file, content) {
  const target = path.join(DIST, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
const fileFor = (route) => (route === '/' ? 'index.html' : `${route.slice(1)}/index.html`);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const h1Of = (html) => decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());

const groups = routesToRender();
const manifest = [];
for (const [group, routes] of Object.entries(groups)) {
  for (const route of routes) {
    const out = await render(route.path);
    if (!out.head) throw new Error(`${route.path}: the page set no title or description (useSEO)`);
    write(fileFor(route.path), page(out.head, out.html));
    manifest.push({ path: route.path, group, indexable: route.indexable && !out.noindex, lastmod: route.lastmod ?? null, h1: h1Of(out.html), eyebrow: route.eyebrow, sub: route.sub ?? null });
  }
}

// Real 404 page, served by the server for any unknown path.
// It answers many URLs, so it names none as canonical.
const notFound = await render('/404');
const notFoundHead = notFound.head.replace(/\n\s*<link rel="canonical"[^>]*>/, '').replace(/\n\s*<meta property="og:url"[^>]*>/, '');
write('404.html', page(notFoundHead, notFound.html));

// Pages that render only in the browser: the admin, and blog posts written in the admin since this build.
const shell = (seo) => page(headFor(seo), '');
write(fileFor('/vc-portal-x7'), shell({ key: 'admin', path: '/vc-portal-x7', title: 'Admin · VediCosmic', description: 'VediCosmic site administration.', noindex: true }));
const staticSlugs = new Set(groups.blog.map((r) => r.path));
for (const post of await fetchDbPosts()) {
  const route = `/blog/${post.slug}`;
  if (staticSlugs.has(route)) continue;
  write(fileFor(route), shell({ key: `blog:${post.slug}`, path: route, title: post.seoTitle ?? `${post.title} · VediCosmic`, description: post.excerpt ?? '', type: 'article' }));
  manifest.push({ path: route, group: 'blog', indexable: true, lastmod: post.updatedAt ?? post.publishedAt ?? null, h1: post.title, eyebrow: 'Article', clientOnly: true });
}

fs.writeFileSync(path.join(root, 'dist-ssr', 'pages.json'), JSON.stringify(manifest, null, 1));
console.log(`[ssg] ${manifest.length} pages + 404.html + admin shell written to dist/`);
