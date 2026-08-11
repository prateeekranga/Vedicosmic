import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAnalyserBars } from './useAnalyserBars';

const BAR_COUNT = 28;

/** The hero card's big real, analyser-driven waveform. */
export function WaveformVisualizer({ color }: { color: string }) {
  const { isPlaying, getAnalyserNode } = useChakraPlayer();
  const reducedMotion = usePrefersReducedMotion();
  const active = isPlaying && !reducedMotion;
  const containerRef = useAnalyserBars(getAnalyserNode, BAR_COUNT, active);

  return (
    <div ref={containerRef} aria-hidden className="flex h-12 items-center gap-[3px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span key={i} className="flex-1 rounded-full"
          style={{ height: '100%', transformOrigin: 'center', background: color, opacity: 0.75, transform: 'scaleY(0.12)' }} />
      ))}
    </div>
  );
}
