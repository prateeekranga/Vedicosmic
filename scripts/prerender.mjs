import { createServer, preview } from 'vite';
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const configFile = path.join(root, 'vite.config.ts');

async function loadRoutes() {
  const vite = await createServer({
    root,
    configFile,
    server: { middlewareMode: true },
    appType: 'custom',
  });
  const { TOOLS } = await vite.ssrLoadModule('/src/data/tools.tsx');
  const { COURSES } = await vite.ssrLoadModule('/src/data/courses.ts');
  const { STATIC_ROUTES } = await vite.ssrLoadModule('/src/data/routes.ts');
  const { BLOG_POSTS } = await vite.ssrLoadModule('/src/data/blog/index.ts');
  const { BLOG_CATEGORIES } = await vite.ssrLoadModule('/src/data/blogCategories.ts');
  await vite.close();
  // '/' must be prerendered LAST: Vite preview's SPA fallback serves dist/index.html
  // for any route whose own static file doesn't exist yet, so overwriting it early
  // would corrupt the fallback shell every other in-progress route still depends on.
  const rest = STATIC_ROUTES.map((r) => r.path).filter((p) => p !== '/');
  return [
    ...rest,
    ...TOOLS.map((t) => `/tools/${t.slug}`),
    ...COURSES.map((c) => `/courses/${c.slug}`),
    ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
    ...BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => `/blog/category/${c.id}`),
    '/',
  ];
}

function filePathFor(route) {
  return route === '/'
    ? path.join(root, 'dist', 'index.html')
    : path.join(root, 'dist', route, 'index.html');
}

async function main() {
  const routes = await loadRoutes();
  const server = await preview({ root, configFile, preview: {} });
  const baseURL = server.resolvedUrls.local[0].replace(/\/$/, '');

  // Try 'chrome' channel first, fall back to default chromium
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch {
    try {
      browser = await chromium.launch();
    } catch (err) {
      await server.close();
      console.warn(`[prerender] skipped — no browser available in this environment: ${err.message}`);
      console.warn('[prerender] The site will work as a client-side SPA. Prerendering can be run locally.');
      return;
    }
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  let failures = 0;
  for (const route of routes) {
    try {
      await page.goto(baseURL + route, { waitUntil: 'load' });
      // Wait for app signal, but fall back to whatever HTML is ready
      await page.waitForFunction(() => window.__PRERENDER_READY__ === true, { timeout: 5000 })
        .catch(() => {/* timeout: snapshot anyway */});
      const html = await page.content();
      const filePath = filePathFor(route);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, html);
      console.log(`[prerender] ${route} -> ${path.relative(root, filePath)}`);
    } catch (err) {
      failures++;
      console.warn(`[prerender] FAILED ${route}: ${err.message}`);
    }
  }

  await browser.close();
  await server.close();

  if (failures > 0) {
    console.error(`[prerender] ${failures} route(s) failed to prerender.`);
    process.exitCode = 1;
  } else {
    console.log(`[prerender] done — ${routes.length} routes prerendered.`);
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
