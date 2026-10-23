import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * Whether the visitor asked for reduced motion. Correct on the first render of client-side pages.
 * On a pre-rendered page it reads false while hydrating (matching the server's HTML), then
 * re-renders with the real value straight after.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

const FINE_HOVER = '(hover: hover) and (pointer: fine)';

function subscribeHover(onChange: () => void) {
  const mq = window.matchMedia(FINE_HOVER);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Whether the device has a mouse-like pointer that can hover; false in the static render and while hydrating. */
export function useFineHover(): boolean {
  return useSyncExternalStore(subscribeHover, () => window.matchMedia(FINE_HOVER).matches, () => false);
}
