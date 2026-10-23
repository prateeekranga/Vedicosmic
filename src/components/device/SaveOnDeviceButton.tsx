import { useState } from 'react';
import { Bookmark, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';

/**
 * Save button for readings and reflections. The first time, it explains what will be stored
 * and where, and saves only after the visitor agrees. Later saves happen in one tap.
 */
export function SaveOnDeviceButton({
  label, onSave, saved = false, disabled = false, className = '', size,
}: { label: string; onSave: () => void; saved?: boolean; disabled?: boolean; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const { data, giveConsent } = useDeviceStore();
  const [asking, setAsking] = useState(false);

  if (saved) {
    return <p className={`flex items-center justify-center gap-2 text-sm text-success ${className}`}><Check className="h-4 w-4" /> Saved on this device</p>;
  }

  if (asking) {
    return (
      <div role="group" aria-label="Save on this device" className={`rounded-xl border border-white/10 bg-cosmic-light/30 p-4 text-left ${className}`}>
        <p className="text-sm leading-relaxed text-white/70">
          Save on this device? It is kept in this browser’s storage and is not sent to us. You can see and delete
          everything you save on the Daily Sādhana page.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => { giveConsent(); onSave(); setAsking(false); }}>Save on this device</Button>
          <Button size="sm" variant="ghost" onClick={() => setAsking(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="outline" size={size} className={className} disabled={disabled}
      onClick={() => (data.consented ? onSave() : setAsking(true))}>
      <Bookmark className="mr-2 h-4 w-4" /> {label}
    </Button>
  );
}
