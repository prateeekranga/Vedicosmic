import { PRESETS } from '@/data/chakraPresets';
import { PresetRow } from './PresetRow';

/** Vertical list at lg+, horizontal scrollable chip row below — a chip row rather than an
 *  Accordion, deliberately: switching presets is the single most frequent action on this
 *  page while audio is already running, and this codebase's Accordion is reserved for
 *  independent show/hide content (FAQs), a different interaction. */
export function ChakraSidebar() {
  return (
    <div className="lg:sticky lg:top-28">
      <p className="eyebrow mb-3 px-1">♪ 7 Chakra Player</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
        {PRESETS.map((p) => <PresetRow key={p.id} preset={p} />)}
      </div>
      <p className="mt-4 hidden text-xs leading-relaxed text-white/40 lg:block">
        Every tone is synthesised live in your browser using the Web Audio API — nothing here is a recording.
        Headphones are recommended, and required for the binaural effect.
      </p>
    </div>
  );
}
