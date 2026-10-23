import { createContext } from 'react';
import { SITE_URL, SITE_NAME } from '@/config/site';

export interface SEOInput {
  /** Override lookup key — only the 9 static routes have a matching admin override. */
  key: string;
  /** Canonical path, e.g. `/tools/${slug}`. */
  path: string;
  /** Full literal title string — brand suffix is the caller's responsibility. */
  title: string;
  description: string;
  /** Share image; defaults to the page's generated card (see shareImageFor). */
  image?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
  type?: 'website' | 'article';
  /** False while the page still waits for data (e.g. a database blog post). Defaults to true. */
  ready?: boolean;
}

export interface SEOOverride { title?: string; description?: string; ogImage?: string }

export interface HeadTags {
  title: string;
  /** [attribute, key, content], e.g. ['property', 'og:title', '…']. */
  meta: ['name' | 'property', string, string][];
  canonical: string;
  jsonLd: object[];
}

/** The 1200×630 share card generated at build time for a page path (scripts/generate-og-images.mjs). */
export function shareImageFor(path: string): string {
  return `/og${path === '/' ? '/home' : path}.jpg`;
}

/** Every head tag for a page. Used by useSEO in the browser and by the static build, so both always agree. */
export function buildHead(input: SEOInput, ov: SEOOverride = {}): HeadTags {
  const title = ov.title || input.title;
  const description = ov.description || input.description;
  const imagePath = ov.ogImage || input.image || shareImageFor(input.path);
  const image = imagePath.startsWith('http') ? imagePath : SITE_URL + imagePath;
  const url = SITE_URL + input.path;
  return {
    title,
    canonical: url,
    meta: [
      ['name', 'description', description],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:image', image],
      ['property', 'og:image:width', '1200'],
      ['property', 'og:image:height', '630'],
      ['property', 'og:url', url],
      ['property', 'og:type', input.type ?? 'website'],
      ['property', 'og:site_name', SITE_NAME],
      ['property', 'og:locale', 'en_IN'],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', image],
      ['name', 'robots', input.noindex ? 'noindex, follow' : 'index, follow'],
    ],
    jsonLd: input.jsonLd ? (Array.isArray(input.jsonLd) ? input.jsonLd : [input.jsonLd]) : [],
  };
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** JSON for a <script> element: "<" is escaped so the content can never close the tag. */
export const jsonForScript = (obj: unknown) => JSON.stringify(obj).replace(/</g, '\\u003c');

/** Head tags as HTML, with the same data-* markers useSEO uses, so the browser replaces rather than duplicates them. */
export function headToHtml(tags: HeadTags): string {
  return [
    `<title>${escapeAttr(tags.title)}</title>`,
    ...tags.meta.map(([attr, key, content]) => `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`),
    `<link rel="canonical" href="${escapeAttr(tags.canonical)}" />`,
    ...tags.jsonLd.map((obj) => `<script type="application/ld+json" data-seo-jsonld="1">${jsonForScript(obj)}</script>`),
  ].join('\n    ');
}

/** Filled in during the static render: the page's useSEO input, read back by the build to write the head. */
export interface HeadCollector { seo?: SEOInput }
export const HeadContext = createContext<HeadCollector | null>(null);
