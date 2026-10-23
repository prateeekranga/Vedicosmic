import { read, write } from './storage';
import type { SEOOverride } from '@/types/content.types';

/**
 * Per-post SEO overrides set from the admin Blog tab, persisted to this browser's
 * localStorage. They change only what the admin's own browser shows; visitors and
 * crawlers always get the values written in code.
 */
const SEO_KEY = 'vc.seo';

export const getSEOOverrides = (): Record<string, SEOOverride> => read(SEO_KEY, {});
export function setSEOOverride(routeKey: string, patch: SEOOverride) {
  const all = getSEOOverrides();
  all[routeKey] = { ...all[routeKey], ...patch };
  write(SEO_KEY, all);
}
