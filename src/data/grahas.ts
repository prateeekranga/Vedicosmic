import type { GrahaId } from '@/engine/sky';
import type { HoraPlanet } from '@/engine/muhurta';

/** Display symbol and colour for each graha. */
export const GRAHA_META: Record<GrahaId, { symbol: string; color: string }> = {
  sun: { symbol: '☉', color: '#FFB300' },
  moon: { symbol: '☾', color: '#CBD5E1' },
  mars: { symbol: '♂', color: '#F87171' },
  mercury: { symbol: '☿', color: '#34D399' },
  jupiter: { symbol: '♃', color: '#FBBF24' },
  venus: { symbol: '♀', color: '#7DD3FC' },
  saturn: { symbol: '♄', color: '#6366F1' },
  rahu: { symbol: '☊', color: '#A78BFA' },
  ketu: { symbol: '☋', color: '#C084FC' },
};

/** Sanskrit name and colour of each hora lord. */
export const HORA_META: Record<HoraPlanet, { sa: string; color: string }> = {
  Sun: { sa: 'Surya', color: '#FFB300' },
  Venus: { sa: 'Shukra', color: '#7DD3FC' },
  Mercury: { sa: 'Budha', color: '#34D399' },
  Moon: { sa: 'Chandra', color: '#CBD5E1' },
  Saturn: { sa: 'Shani', color: '#6366F1' },
  Jupiter: { sa: 'Guru', color: '#FBBF24' },
  Mars: { sa: 'Mangala', color: '#F87171' },
};
