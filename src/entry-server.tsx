/**
 * Server entry for the static build (scripts/ssg.mjs): renders one URL to HTML in Node, with
 * no browser, after every lazy page has loaded, and reports the page's head data.
 */
import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Writable } from 'node:stream';
import App from './App';
import { HeadContext, buildHead, headToHtml, jsonForScript, type HeadCollector, type SEOInput } from '@/lib/seoHead';
import { SITE_SCHEMA } from '@/components/seo/SiteJsonLd';
import { STATIC_ROUTES, TOOLS, TOOL_CATEGORIES } from '@/content/routes';
import { BLOG_POSTS } from '@/data/blog';
import { BLOG_CATEGORIES } from '@/data/blogCategories';

export { REDIRECTS, GONE_PREFIXES } from '@/content/redirects';

export interface Rendered {
  /** The app's markup for <div id="root">. */
  html: string;
  /** Head tags for the page, or null if the page set none. */
  head: string | null;
  noindex: boolean;
}

export function render(url: string): Promise<Rendered> {
  const collector: HeadCollector = {};
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _enc, done) { html += chunk.toString(); done(); },
    });
    sink.on('finish', () => {
      const seo = collector.seo;
      resolve({ html, head: seo ? headFor(seo) : null, noindex: !!seo?.noindex });
    });
    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <HeadContext.Provider value={collector}>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </HeadContext.Provider>
      </StrictMode>,
      {
        onAllReady() { pipe(sink); },
        onShellError: reject,
        onError(err) { reject(err); },
      },
    );
  });
}

/** Head tags for a page, plus the site-wide JSON-LD. Also used for pages that render only in the browser. */
export function headFor(seo: SEOInput): string {
  return headToHtml(buildHead(seo)) +
    `\n    <script type="application/ld+json" data-site-jsonld="1">${jsonForScript(SITE_SCHEMA)}</script>`;
}

const PAGE_EYEBROW: Record<string, string> = { '/': 'Free Vedic tools', '/tools': 'Free tools', '/blog': 'Articles' };
const toolCategory = (id: string) => TOOL_CATEGORIES.find((c) => c.id === id)?.label ?? 'Tool';
const blogCategory = (id: string) => BLOG_CATEGORIES.find((c) => c.id === id)?.label ?? 'Article';

/** Every URL the static build writes, in sitemap groups, with the label its share card carries. */
export function routesToRender() {
  return {
    pages: STATIC_ROUTES.map((r) => ({ path: r.path, indexable: r.indexable, eyebrow: PAGE_EYEBROW[r.path] ?? 'VediCosmic' })),
    tools: TOOLS.map((t) => ({
      path: `/tools/${t.slug}`, indexable: t.indexable && t.status === 'live', eyebrow: `Free tool · ${toolCategory(t.category)}`, sub: t.subtitle,
    })),
    blog: [
      ...BLOG_POSTS.map((p) => ({
        path: `/blog/${p.slug}`, indexable: true, lastmod: p.updatedAt ?? p.publishedAt, eyebrow: `Article · ${blogCategory(p.category)}`,
      })),
      ...BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({ path: `/blog/category/${c.id}`, indexable: true, eyebrow: 'Articles' })),
    ],
  };
}
