import { preview } from 'vite';
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const configFile = path.join(root, 'vite.config.ts');

async function loadPosts() {
  const vite = await createServer({ root, configFile, server: { middlewareMode: true }, appType: 'custom' });
  const { BLOG_POSTS } = await vite.ssrLoadModule('/src/data/blog/index.ts');
  await vite.close();
  return BLOG_POSTS;
}

async function main() {
  const posts = await loadPosts();
  const server = await preview({ root, configFile, preview: {} });
  const baseURL = server.resolvedUrls.local[0].replace(/\/$/, '');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch {
    try {
      browser = await chromium.launch();
    } catch (err) {
      await server.close();
      console.warn(`[og-images] skipped — no browser available in this environment: ${err.message}`);
      return;
    }
  }

  const context = await browser.newContext({ viewport: { width: 1200, height: 630 } });
  const page = await context.newPage();

  let failures = 0;
  for (const post of posts) {
    try {
      await page.goto(`${baseURL}/og/blog/${post.slug}`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__OG_CARD_READY__ === true, { timeout: 5000 })
        .catch(() => {/* timeout: screenshot anyway */});
      const filePath = path.join(root, 'dist', 'og', 'blog', `${post.slug}.png`);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await page.locator('#og-card').screenshot({ path: filePath });
      console.log(`[og-images] wrote dist/og/blog/${post.slug}.png`);
    } catch (err) {
      failures++;
      console.warn(`[og-images] FAILED ${post.slug}: ${err.message}`);
    }
  }

  await browser.close();
  await server.close();

  if (failures > 0) {
    console.error(`[og-images] ${failures} image(s) failed to generate.`);
    process.exitCode = 1;
  } else {
    console.log(`[og-images] done — ${posts.length} images generated.`);
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
