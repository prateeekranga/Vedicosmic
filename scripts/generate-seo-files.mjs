import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fetchDbPosts } from './lib/fetchDbPosts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function loadData() {
  const vite = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'custom',
  });
  const { TOOLS, STATIC_ROUTES } = await vite.ssrLoadModule('/src/content/routes.ts');
  const { BLOG_POSTS } = await vite.ssrLoadModule('/src/data/blog/index.ts');
  const { BLOG_CATEGORIES } = await vite.ssrLoadModule('/src/data/blogCategories.ts');
  const { SITE_URL, SITE_NAME, SITE_DESCRIPTION } = await vite.ssrLoadModule('/src/config/site.ts');
  await vite.close();
  return { TOOLS, STATIC_ROUTES, BLOG_POSTS, BLOG_CATEGORIES, SITE_URL, SITE_NAME, SITE_DESCRIPTION };
}

function priorityFor(routePath, isNew) {
  if (routePath === '/') return '1.0';
  if (routePath === '/tools' || routePath === '/blog') return '0.9';
  if (routePath.startsWith('/blog/category/')) return '0.7';
  if (routePath.startsWith('/tools/')) return isNew ? '0.85' : '0.8';
  if (routePath.startsWith('/blog/')) return '0.8';
  return '0.5';
}

function buildSitemap(routes, SITE_URL) {
  const urls = routes.map((r) =>
    `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priorityFor(r.path, r.isNew)}</priority>\n  </url>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildLlmsTxt({ SITE_NAME, SITE_DESCRIPTION, SITE_URL, tools, BLOG_POSTS, pages }) {
  const toolLines = tools.map((t) => `- [${t.name}](${SITE_URL}/tools/${t.slug}): ${t.description}`).join('\n');
  const blogLines = BLOG_POSTS.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`).join('\n');
  const pageLines = pages.map((r) => `- [${r.seoLabel}](${SITE_URL}${r.path})`).join('\n');
  return `# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n\nVediCosmic is a free Vedic astrology, panchang, numerology and practice website. Every tool runs its calculations in the visitor's browser.\n\n## Tools\n\n${toolLines}\n\n## Blog\n\n${blogLines}\n\n## Pages\n\n${pageLines}\n`;
}

async function main() {
  const data = await loadData();
  const dbPosts = await fetchDbPosts();
  data.BLOG_POSTS = [...data.BLOG_POSTS, ...dbPosts]; // merge so buildLlmsTxt's blogLines picks them up too
  // Only live, indexable pages: noindex pages (coming-soon tools, /courses) stay out.
  const pages = data.STATIC_ROUTES.filter((r) => r.indexable);
  const tools = data.TOOLS.filter((t) => t.indexable && t.status === 'live');
  const routes = [
    ...pages.map((r) => ({ path: r.path })),
    ...tools.map((t) => ({ path: `/tools/${t.slug}`, isNew: !!t.isNew })),
    ...data.BLOG_POSTS.map((p) => ({ path: `/blog/${p.slug}` })),
    ...data.BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({ path: `/blog/category/${c.id}` })),
  ];
  const distDir = path.join(root, 'dist');
  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(routes, data.SITE_URL));
  await fs.writeFile(path.join(distDir, 'llms.txt'), buildLlmsTxt({ ...data, tools, pages }));
  console.log(`[seo] wrote sitemap.xml (${routes.length} urls) and llms.txt to dist/`);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
