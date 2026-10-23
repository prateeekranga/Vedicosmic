import { ERROR_REPORTING_ENABLED, SENTRY_DSN } from '@/config/integrations';

/**
 * Error reporting (Sentry), off until a DSN is set in src/config/integrations.ts. Loaded only
 * after the page has settled, as a separate chunk, so visitors who never hit an error pay
 * almost nothing. Reports carry the error, browser and page path — never names, birth details,
 * places, typed input, query strings or interaction breadcrumbs.
 */
export function initMonitoring(): void {
  if (!ERROR_REPORTING_ENABLED) return;
  import('@sentry/browser').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeBreadcrumb: () => null,
      beforeSend(event) {
        delete event.user;
        if (event.request) {
          const url = event.request.url;
          event.request = url ? { url: url.split(/[?#]/)[0] } : {};
        }
        return event;
      },
    });
  }).catch(() => { /* monitoring is optional */ });
}
