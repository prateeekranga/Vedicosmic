import { useEffect } from 'react';
import { getSEOOverrides } from '@/lib/siteContent';
import { useOverridesVersion } from './useOverridesVersion';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/config/site';

export interface SEOInput {
  /** Override lookup key — only the 9 static routes have a matching admin override. */
  key: string;
  /** Canonical path, e.g. `/tools/${slug}`. */
  path: string;
  /** Full literal title string — brand suffix is the caller's responsibility. */
  title: string;
  description: string;
  image?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
  type?: 'website' | 'article';
  /** When false, defers setting window.__PRERENDER_READY__ until it flips true — for pages
   *  still waiting on an async data fetch (e.g. a DB-backed blog post). Defaults to true, so
   *  every other call site's timing is unaffected. */
  ready?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

/** Sets per-route title/meta/canonical/JSON-LD, reactive to admin SEO overrides. */
export function useSEO(input: SEOInput): void {
  const version = useOverridesVersion();
  const jsonLdKey = JSON.stringify(input.jsonLd ?? null);

  useEffect(() => {
    const ov = getSEOOverrides()[input.key];
    const title = ov?.title || input.title;
    const description = ov?.description || input.description;
    const image = ov?.ogImage || input.image || DEFAULT_OG_IMAGE;
    const url = SITE_URL + input.path;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', image.startsWith('http') ? image : SITE_URL + image);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', input.type ?? 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('name', 'robots', input.noindex ? 'noindex, follow' : 'index, follow');
    upsertCanonical(url);

    document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
    const items = input.jsonLd ? (Array.isArray(input.jsonLd) ? input.jsonLd : [input.jsonLd]) : [];
    const scripts = items.map((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-jsonld', '1');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
      return s;
    });

    if (input.ready ?? true) {
      (window as unknown as { __PRERENDER_READY__?: boolean }).__PRERENDER_READY__ = true;
    }

    return () => { scripts.forEach((s) => s.remove()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, input.key, input.path, input.title, input.description, input.image, input.noindex, input.type, input.ready, jsonLdKey]);
}
