import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function loadData() {
  const vite = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'custom',
  });
  const { TOOLS } = await vite.ssrLoadModule('/src/data/tools.tsx');
  const { COURSES } = await vite.ssrLoadModule('/src/data/courses.ts');
  const { STATIC_ROUTES } = await vite.ssrLoadModule('/src/data/routes.ts');
  const { BLOG_POSTS } = await vite.ssrLoadModule('/src/data/blog/index.ts');
  const { BLOG_CATEGORIES } = await vite.ssrLoadModule('/src/data/blogCategories.ts');
  const { SITE_URL, SITE_NAME, SITE_DESCRIPTION } = await vite.ssrLoadModule('/src/config/site.ts');
  await vite.close();
  return { TOOLS, COURSES, STATIC_ROUTES, BLOG_POSTS, BLOG_CATEGORIES, SITE_URL, SITE_NAME, SITE_DESCRIPTION };
}

function priorityFor(routePath, isNew) {
  if (routePath === '/') return '1.0';
  if (routePath === '/tools' || routePath === '/courses' || routePath === '/blog') return '0.9';
  if (routePath.startsWith('/blog/category/')) return '0.7';
  if (routePath.startsWith('/tools/')) return isNew ? '0.85' : '0.8';
  if (routePath.startsWith('/courses/') || routePath.startsWith('/blog/')) return '0.8';
  return '0.5';
}

function buildSitemap(routes, SITE_URL) {
  const urls = routes.map((r) =>
    `  <url>\n    <loc>${SITE_URL}${r.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priorityFor(r.path, r.isNew)}</priority>\n  </url>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildLlmsTxt({ SITE_NAME, SITE_DESCRIPTION, SITE_URL, TOOLS, COURSES, BLOG_POSTS, STATIC_ROUTES }) {
  const toolLines = TOOLS.map((t) => `- [${t.name}](${SITE_URL}/tools/${t.slug}): ${t.description}`).join('\n');
  const courseLines = COURSES.map((c) => `- [${c.title}](${SITE_URL}/courses/${c.slug}): ${c.description}`).join('\n');
  const blogLines = BLOG_POSTS.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`).join('\n');
  const pageLines = STATIC_ROUTES.map((r) => `- [${r.seoLabel}](${SITE_URL}${r.path})`).join('\n');
  return `# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n\nVediCosmic is a free interactive Vedic astrology, numerology, and meditation platform. Every tool computes real results client-side; courses go deeper with structured teaching.\n\n## Tools\n\n${toolLines}\n\n## Courses\n\n${courseLines}\n\n## Blog\n\n${blogLines}\n\n## Pages\n\n${pageLines}\n`;
}

async function main() {
  const data = await loadData();
  const routes = [
    ...data.STATIC_ROUTES.map((r) => ({ path: r.path })),
    ...data.TOOLS.map((t) => ({ path: `/tools/${t.slug}`, isNew: !!t.isNew })),
    ...data.COURSES.map((c) => ({ path: `/courses/${c.slug}` })),
    ...data.BLOG_POSTS.map((p) => ({ path: `/blog/${p.slug}` })),
    ...data.BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({ path: `/blog/category/${c.id}` })),
  ];
  const distDir = path.join(root, 'dist');
  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(routes, data.SITE_URL));
  await fs.writeFile(path.join(distDir, 'llms.txt'), buildLlmsTxt(data));
  console.log(`[seo] wrote sitemap.xml (${routes.length} urls) and llms.txt to dist/`);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
