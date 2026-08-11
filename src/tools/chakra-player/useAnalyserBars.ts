import { useEffect, useRef } from 'react';

/**
 * Polls a live AnalyserNode via requestAnimationFrame and writes bar heights straight to
 * cached DOM refs' style.transform — no per-frame React state, matching the imperative
 * rAF-loop idiom already used by Starfield.tsx/CosmicGate.tsx. Reads time-domain samples
 * (not frequency-domain) deliberately: a single sine tone would light up one frequency
 * bin, which would visually overstate how many frequencies are really present — this is a
 * literal, honest rendering of the actual oscillation in the buffer, closer to a bar-style
 * oscilloscope than a fake "spectrum."
 */
export function useAnalyserBars(
  getAnalyser: () => AnalyserNode | null,
  barCount: number,
  active: boolean,
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const analyser = getAnalyser();
    const el = containerRef.current;
    if (!analyser || !el) return;
    const bars = Array.from(el.children) as HTMLElement[];
    if (bars.length === 0) return;

    const buf = new Uint8Array(analyser.fftSize); // allocated once, reused every frame
    const chunk = Math.max(1, Math.floor(buf.length / barCount));
    let raf = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      for (let i = 0; i < barCount; i++) {
        let peak = 0;
        const start = i * chunk;
        const end = Math.min(buf.length, start + chunk);
        for (let j = start; j < end; j++) {
          const d = Math.abs(buf[j] - 128);
          if (d > peak) peak = d;
        }
        const scale = 0.12 + Math.min(1, peak / 90) * 0.88; // never fully flat
        bars[i].style.transform = `scaleY(${scale})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, getAnalyser, barCount]);

  return containerRef;
}
