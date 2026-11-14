import { useEffect } from 'react';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, ORGANIZATION_ID, WEBSITE_ID } from '@/config/site';

/** Site-wide Organization + WebSite JSON-LD. The static build writes it into every page's head too. */
export const SITE_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_URL + DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-IN',
    publisher: { '@id': ORGANIZATION_ID },
  },
];

/** Keeps the site JSON-LD in the head for the app's lifetime (replacing the pre-rendered copy, if any). */
export function SiteJsonLd() {
  useEffect(() => {
    document.querySelectorAll('script[data-site-jsonld]').forEach((n) => n.remove());
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-site-jsonld', '1');
    script.textContent = JSON.stringify(SITE_SCHEMA);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return null;
}
