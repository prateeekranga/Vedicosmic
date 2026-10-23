import { ANALYTICS_ENABLED, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/config/integrations';

/**
 * Privacy-friendly analytics (Umami Cloud). Off until a website ID is set in
 * src/config/integrations.ts. Page views are counted by Umami itself, including client-side
 * route changes; the events below are the only other things ever sent.
 *
 * Never send names, birth dates or times, places, readings or anything typed by a visitor.
 * Properties are restricted to the keys in ALLOWED_PROPS, and anything else is dropped.
 */
export type AnalyticsEvent =
  // From the audit playbook (the ones without a feature yet are reserved for later phases)
  | 'view_today' | 'city_set' | 'chart_created' | 'chart_saved' | 'share_clicked'
  | 'sadhana_started' | 'sadhana_completed' | 'streak_3' | 'streak_7' | 'streak_30'
  | 'waitlist_submit' | 'match_started' | 'match_result_viewed' | 'pwa_installed' | 'language_switched'
  // Chakra Frequency Player
  | 'player_play' | 'player_pause' | 'player_stop' | 'player_timer_set' | 'player_record_download';

type PropValue = string | number | boolean;
const ALLOWED_PROPS = new Set(['channel', 'tool', 'preset', 'minutes', 'step']);

declare global {
  interface Window { umami?: { track: (event: string, data?: Record<string, PropValue>) => void } }
}

const queue: [AnalyticsEvent, Record<string, PropValue> | undefined][] = [];

export function trackEvent(name: AnalyticsEvent, props?: Record<string, PropValue | null | undefined>): void {
  if (!ANALYTICS_ENABLED) {
    if (import.meta.env.DEV) console.debug(`[analytics off] ${name}`, props ?? {});
    return;
  }
  const safe = props
    ? Object.fromEntries(Object.entries(props).filter((e): e is [string, PropValue] => ALLOWED_PROPS.has(e[0]) && e[1] != null))
    : undefined;
  if (window.umami) window.umami.track(name, safe);
  else if (queue.length < 20) queue.push([name, safe]);
}

/** Loads the Umami script once the page has settled, so it never competes with the first paint. */
export function initAnalytics(): void {
  if (!ANALYTICS_ENABLED || typeof document === 'undefined') return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = UMAMI_SCRIPT_URL;
  s.dataset.websiteId = UMAMI_WEBSITE_ID;
  s.dataset.doNotTrack = 'true'; // respect the browser's Do Not Track setting
  s.onload = () => { for (const [name, data] of queue.splice(0)) window.umami?.track(name, data); };
  document.head.appendChild(s);
}
