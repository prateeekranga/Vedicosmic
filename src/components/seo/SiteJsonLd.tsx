import { useEffect } from 'react';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/config/site';
import { mergedContactContent } from '@/lib/siteContent';

/** Site-wide Organization + WebSite JSON-LD, injected once for the app's lifetime. */
export function SiteJsonLd() {
  useEffect(() => {
    const socials = mergedContactContent().socials;
    const sameAs = Object.values(socials).filter((v): v is string => !!v);

    const schema = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: SITE_URL + DEFAULT_OG_IMAGE,
        description: SITE_DESCRIPTION,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
      },
    ];

    // defensive: a stale SPA-fallback shell (e.g. during static prerendering) can carry
    // a leftover copy of this script from a different page's snapshot — clear it first.
    document.querySelectorAll('script[data-site-jsonld]').forEach((n) => n.remove());
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-site-jsonld', '1');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return null;
}
