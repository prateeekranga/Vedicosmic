import { useSyncExternalStore } from 'react';

/**
 * True while the visitor is still on the page that arrived pre-rendered (and during the static
 * render itself). That page's content is already on screen, so entrance animations are skipped:
 * the server and the hydrating browser render the same markup, and nothing visible fades out and
 * back in. After the first in-app navigation, pages animate in as before.
 */
let onPrerenderedPage = typeof window === 'undefined';

export function markPrerendered() { onPrerenderedPage = true; }
export function markNavigated() { onPrerenderedPage = false; }

/** An entrance animation's `initial` value, or false (start fully shown) on a pre-rendered first page. */
export function enter<T>(initial: T): T | false {
  return onPrerenderedPage ? false : initial;
}
export const skipEntrance = () => onPrerenderedPage;

const subscribe = () => () => {};

/** False in the static render and while hydrating; true once the page is running in the browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
