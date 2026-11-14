export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://vedicosmic.com';
export const SITE_NAME = 'VediCosmic';
export const SITE_DESCRIPTION = 'Free Vedic tools: today’s tithi and nakshatra, your birth star, planetary hours, numerology and a 17-minute daily sādhana. Calculated in your browser. No ads.';
export const DEFAULT_OG_IMAGE = '/logo-full.png';
/** Stable JSON-LD identifiers, so every page's structured data points at the same publisher and site. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
