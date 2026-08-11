/**
 * Minimal event-tracking seam. No analytics provider (GA4/GTM/etc.) is wired
 * into the site yet — that's a separate, sitewide decision. This stub keeps
 * call sites (like the chakra player) ready to report real events the moment
 * one is added, without anything needing to change here.
 */
export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${name}`, props ?? {});
  }
}
