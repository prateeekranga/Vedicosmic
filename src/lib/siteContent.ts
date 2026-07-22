import { read, write } from './storage';
import { DEFAULT_HOME_CONTENT } from '@/data/homeContent';
import { DEFAULT_ABOUT_CONTENT } from '@/data/aboutContent';
import { DEFAULT_CONTACT_CONTENT } from '@/data/contactContent';
import type { HomeContent, AboutContent, ContactContent, SEOOverride } from '@/types/content.types';

/**
 * Admin-editable site copy (Home/About/Contact) and per-route SEO overrides,
 * persisted to localStorage via the same read/write primitives as
 * `overrides.ts`. Each store keeps only the fields the admin has actually
 * touched — `mergedXContent()` layers them over the full defaults so pages
 * never need `??` fallback chains.
 */
const K = {
  home: 'vc.content.home',
  about: 'vc.content.about',
  contact: 'vc.content.contact',
  seo: 'vc.seo',
};

export const getHomeContent = (): Partial<HomeContent> => read(K.home, {});
export const setHomeContent = (patch: Partial<HomeContent>) => write(K.home, { ...getHomeContent(), ...patch });
export const resetHomeContent = () => write(K.home, {});
export const mergedHomeContent = (): HomeContent => ({ ...DEFAULT_HOME_CONTENT, ...getHomeContent() });

export const getAboutContent = (): Partial<AboutContent> => read(K.about, {});
export const setAboutContent = (patch: Partial<AboutContent>) => write(K.about, { ...getAboutContent(), ...patch });
export const resetAboutContent = () => write(K.about, {});
export const mergedAboutContent = (): AboutContent => ({ ...DEFAULT_ABOUT_CONTENT, ...getAboutContent() });

export const getContactContent = (): Partial<ContactContent> => read(K.contact, {});
export const setContactContent = (patch: Partial<ContactContent>) => write(K.contact, { ...getContactContent(), ...patch });
export const resetContactContent = () => write(K.contact, {});
export const mergedContactContent = (): ContactContent => ({ ...DEFAULT_CONTACT_CONTENT, ...getContactContent() });

export const getSEOOverrides = (): Record<string, SEOOverride> => read(K.seo, {});
export function setSEOOverride(routeKey: string, patch: SEOOverride) {
  const all = getSEOOverrides();
  all[routeKey] = { ...all[routeKey], ...patch };
  write(K.seo, all);
}
export const resetSEOOverrides = () => write(K.seo, {});

export function exportSiteContent(): string {
  return JSON.stringify({
    home: getHomeContent(),
    about: getAboutContent(),
    contact: getContactContent(),
    seo: getSEOOverrides(),
  }, null, 2);
}
