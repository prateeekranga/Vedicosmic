import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { useAnalyserBars } from './useAnalyserBars';

/** Tiny 4-bar indicator for the active row in the sidebar, real analyser-driven. */
export function MiniWaveformBars({ active, color }: { active: boolean; color: string }) {
  const { getAnalyserNode } = useChakraPlayer();
  const containerRef = useAnalyserBars(getAnalyserNode, 4, active);
  return (
    <div ref={containerRef} aria-hidden className="flex h-3 shrink-0 items-center gap-[2px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="w-[2.5px] rounded-full"
          style={{ height: '100%', transformOrigin: 'center', background: color, transform: 'scaleY(0.12)' }} />
      ))}
    </div>
  );
}
