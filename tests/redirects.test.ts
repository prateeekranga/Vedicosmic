import { describe, expect, it } from 'vitest';
import { GONE_PREFIXES, REDIRECTS } from '@/content/redirects';
import { STATIC_ROUTES, TOOLS } from '@/content/routes';
import { BLOG_POSTS } from '@/data/blog';
import { BLOG_CATEGORIES } from '@/data/blogCategories';

const LIVE = new Set([
  ...STATIC_ROUTES.map((r) => r.path),
  ...TOOLS.filter((t) => t.status === 'live').map((t) => `/tools/${t.slug}`),
  ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
  ...BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => `/blog/category/${c.id}`),
]);

describe('redirect map', () => {
  it('sends every old URL to a live page in a single hop', () => {
    const froms = new Set(REDIRECTS.map((r) => r.from));
    for (const { from, to } of REDIRECTS) {
      expect(LIVE.has(to), `${from} → ${to} is not a live page`).toBe(true);
      expect(froms.has(to), `${from} → ${to} chains into another redirect`).toBe(false);
      expect(LIVE.has(from), `${from} is still a live page`).toBe(false);
      expect(from).toMatch(/^\/[^?#]*[^/]$/);
    }
  });

  it('lists each old URL once', () => {
    expect(new Set(REDIRECTS.map((r) => r.from)).size).toBe(REDIRECTS.length);
  });

  it('never marks a live page as gone', () => {
    for (const prefix of GONE_PREFIXES) {
      expect([...LIVE].filter((p) => p.startsWith(prefix))).toEqual([]);
    }
  });
});
