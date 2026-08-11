import { CHAKRAS, type Chakra } from '@/data/chakras';
import { PRESET_FREQUENCIES, type PresetId } from '@/lib/chakraPlayerEngine';

/**
 * Shared preset lookup for the Chakra Player — one source of truth consumed by
 * both the full page (src/tools/chakra-player/*) and the sitewide docked mini
 * player (src/components/layout/ChakraMiniPlayer.tsx), so the two never drift.
 */
export interface PresetInfo {
  id: PresetId;
  name: string;
  sanskrit: string;
  bija: string;
  color: string;
  freq: number;
  /** A short affirmation line shown on the hero card. */
  affirmation: string;
  /** Two short tag pills shown on the hero card. */
  tags: [string, string];
}

/** Derives two short tag pills from a chakra's own data — no hand-authored tags field. */
export function deriveTags(c: Chakra): [string, string] {
  const first = c.themes.split(',')[0].trim().replace(/\.$/, '');
  return [c.element, first.charAt(0).toUpperCase() + first.slice(1)];
}

const SLEEP_PRESET: PresetInfo = {
  id: 'sleep', name: 'Sleep Mix', sanskrit: 'Nidrā', bija: '—', color: '#94A3B8', freq: PRESET_FREQUENCIES.sleep,
  affirmation: 'I let go of the day, and rest comes easily.',
  tags: ['Rest', 'Sleep'],
};

export const PRESETS: PresetInfo[] = [
  ...CHAKRAS.map((c): PresetInfo => ({
    id: c.id as PresetId, name: c.name, sanskrit: c.sanskrit, bija: c.bija, color: c.color,
    freq: PRESET_FREQUENCIES[c.id as PresetId],
    // Chakra.balanced is already written in a warm, affirmation-like voice — reused verbatim
    // rather than adding a second, easily-drifting content field for the same idea.
    affirmation: c.balanced,
    tags: deriveTags(c),
  })),
  SLEEP_PRESET,
];

export function getPreset(id: PresetId | null): PresetInfo | null {
  if (!id) return null;
  return PRESETS.find((p) => p.id === id) ?? null;
}

export function formatMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
