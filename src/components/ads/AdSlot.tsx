import { useEffect } from 'react';

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;

/** Named placements → their per-slot env var. Add a row here for every new AdSlot call site. */
const SLOT_ENV_KEYS: Record<string, string> = {
  'blog-post-top': 'VITE_ADSENSE_SLOT_BLOG_POST_TOP',
  'blog-post-bottom': 'VITE_ADSENSE_SLOT_BLOG_POST_BOTTOM',
  'blog-hub': 'VITE_ADSENSE_SLOT_BLOG_HUB',
};

let scriptRequested = false;
function ensureAdSenseScript(clientId: string) {
  if (scriptRequested) return;
  scriptRequested = true;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  document.head.appendChild(script);
}

/**
 * AdSense-ready placement, dormant until real IDs are configured.
 * Renders nothing in production so no empty ad boxes ship before approval —
 * only shows a labeled outline in dev so placements can be reviewed.
 * Set VITE_ADSENSE_CLIENT_ID and the slot's env var (see SLOT_ENV_KEYS) to activate.
 */
export function AdSlot({ slot }: { slot: keyof typeof SLOT_ENV_KEYS }) {
  const slotId = import.meta.env[SLOT_ENV_KEYS[slot]] as string | undefined;
  const active = !!CLIENT_ID && !!slotId;

  useEffect(() => {
    if (!active) return;
    ensureAdSenseScript(CLIENT_ID!);
    try {
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ??= []).push({});
    } catch { /* AdSense script not ready yet — safe to ignore */ }
  }, [active]);

  if (!active) {
    if (import.meta.env.DEV) {
      return (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/15 py-6 text-xs uppercase tracking-wide text-white/25">
          Ad slot: {slot}
        </div>
      );
    }
    return null;
  }

  return (
    <div>
      <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-white/25">Advertisement</p>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
