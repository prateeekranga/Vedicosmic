import type { PresetInfo } from '@/data/chakraPresets';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { MiniWaveformBars } from './MiniWaveformBars';

/** One sidebar entry — a horizontal chip below `lg`, a full left-bordered row at `lg+`,
 *  via one responsive class list rather than two separate components. */
export function PresetRow({ preset: p }: { preset: PresetInfo }) {
  const { activePreset, isPlaying, play } = useChakraPlayer();
  const isActive = activePreset === p.id;

  return (
    <button
      type="button"
      onClick={() => play(p.id)}
      aria-pressed={isActive}
      aria-label={`${p.name} — ${p.sanskrit}, ${p.bija}, ${p.freq} hertz`}
      className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.02] px-3 py-2 transition-colors hover:border-white/25 lg:w-full lg:justify-between lg:rounded-lg lg:rounded-l-none lg:border-y-0 lg:border-r-0 lg:border-l-4 lg:px-3 lg:py-2.5"
      style={{ borderColor: isActive ? p.color : undefined, background: isActive ? `${p.color}14` : undefined }}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden />
        <span className="min-w-0 text-left">
          <span className="block text-sm font-medium text-white">{p.name}</span>
          <span className="hidden text-xs text-white/45 lg:block">{p.sanskrit} · {p.freq} Hz</span>
        </span>
      </span>
      {isActive && isPlaying && <MiniWaveformBars active color={p.color} />}
    </button>
  );
}
