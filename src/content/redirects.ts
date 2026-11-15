/**
 * URLs that changed or were merged. Each `from` answers with a single 301 to `to`, which must be
 * a live page (tests/redirects.test.ts checks this). Paths start with "/" and have no trailing slash.
 * scripts/generate-htaccess.mjs turns these into server rules.
 */
export const REDIRECTS: { from: string; to: string }[] = [
  // The category hubs live at /tools/category/<id>; the bare folder has no page of its own.
  { from: '/tools/category', to: '/tools' },
  // The Rahu Kaal and Muhurat Finder became part of the Panchang page (tools round 2, November 2026).
  { from: '/tools/muhurta', to: '/tools/panchang' },
];

/** Path prefixes gone for good, answered with 410: the course pages never existed as real courses. */
export const GONE_PREFIXES = ['/courses/'];
