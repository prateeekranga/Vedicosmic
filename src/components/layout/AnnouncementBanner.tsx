import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAnnouncement } from '@/lib/overrides';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';

const TONES: Record<string, string> = {
  gold: 'from-gold-400/20 to-gold-600/10 text-gold-200 border-gold-400/30',
  cyan: 'from-brand-cyan-400/20 to-brand-cyan-300/10 text-brand-cyan-200 border-brand-cyan-400/30',
  info: 'from-violet-chakra/20 to-violet-chakra/5 text-white/80 border-violet-chakra/30',
};

export function AnnouncementBanner() {
  useOverridesVersion();
  const ann = getAnnouncement();
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => { setDismissed(sessionStorage.getItem('vc.ann.dismissed') === ann.text); }, [ann.text]);

  if (!ann.active || !ann.text.trim() || dismissed) return null;
  return (
    <div className={`relative z-40 border-b bg-gradient-to-r px-4 py-2.5 text-center text-sm backdrop-blur-sm ${TONES[ann.tone] ?? TONES.gold}`}>
      <span className="mx-auto">{ann.text}</span>
      <button onClick={() => { setDismissed(true); sessionStorage.setItem('vc.ann.dismissed', ann.text); }}
        aria-label="Dismiss" className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 transition-opacity hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
