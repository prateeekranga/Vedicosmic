/**
 * Third-party services the site may load. Both values are public by design (they appear in
 * the page source), so they can live here; an environment variable overrides each one.
 * While a value is empty the service is off: nothing is loaded and nothing is sent, and the
 * Privacy Policy says so automatically.
 */

/** Umami Cloud website ID — privacy-friendly analytics without cookies. */
const UMAMI_WEBSITE_ID_DEFAULT = '';
export const UMAMI_WEBSITE_ID = (import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined) || UMAMI_WEBSITE_ID_DEFAULT;
export const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';
export const ANALYTICS_ENABLED = UMAMI_WEBSITE_ID !== '';

/** Sentry DSN — error reports with personal data scrubbed. */
const SENTRY_DSN_DEFAULT = '';
export const SENTRY_DSN = (import.meta.env.VITE_SENTRY_DSN as string | undefined) || SENTRY_DSN_DEFAULT;
export const ERROR_REPORTING_ENABLED = SENTRY_DSN !== '';
