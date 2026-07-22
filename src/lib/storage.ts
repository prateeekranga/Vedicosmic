/**
 * Shared localStorage read/write primitives for all client-side admin state
 * (course/tool overrides, site content, SEO overrides). `write` fires a
 * `vc:overrides` window event so any component using `useOverridesVersion`
 * re-renders with fresh data.
 */
export function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
export function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('vc:overrides'));
}
