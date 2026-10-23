import { useContext, useEffect } from 'react';
import { getSEOOverrides } from '@/lib/siteContent';
import { buildHead, HeadContext, type SEOInput } from '@/lib/seoHead';
import { useOverridesVersion } from './useOverridesVersion';

export type { SEOInput } from '@/lib/seoHead';

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

/**
 * Sets per-route title/meta/canonical/JSON-LD, reactive to admin SEO overrides. During the static
 * build there is no document: the input is handed to the build instead, which writes the same tags
 * into the page's HTML (see buildHead).
 */
export function useSEO(input: SEOInput): void {
  const collector = useContext(HeadContext);
  if (collector) collector.seo = input;

  const version = useOverridesVersion();
  const jsonLdKey = JSON.stringify(input.jsonLd ?? null);

  useEffect(() => {
    const head = buildHead(input, getSEOOverrides()[input.key]);
    document.title = head.title;
    for (const [attr, key, content] of head.meta) upsertMeta(attr, key, content);
    upsertCanonical(head.canonical);

    document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
    const scripts = head.jsonLd.map((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-jsonld', '1');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
      return s;
    });
    return () => { scripts.forEach((s) => s.remove()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, input.key, input.path, input.title, input.description, input.image, input.noindex, input.type, input.ready, jsonLdKey]);
}
