import { useId } from 'react';

/**
 * The Moon as it looks at a given phase: 0 is new, 0.5 full, 1 new again. It waxes from the
 * right, as seen from the northern hemisphere. Decorative: the phase is always written beside it.
 */
export function MoonPhase({ phase, size = 96 }: { phase: number; size?: number }) {
  const id = useId().replace(/:/g, '');
  const lit = 1 - Math.abs(phase - 0.5) * 2; // 0 to 1, the fraction of the disc that is lit
  const waxing = phase < 0.5;
  const r = size / 2 - 4;
  const c = size / 2;
  // The terminator is an ellipse: full width at new and full moon, a line at the half moon.
  const rx = Math.abs(Math.cos(lit * Math.PI)) * r;
  const bright = '#F4F1E4', dark = '#2A2740';
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="flex-none"
      style={{ filter: `drop-shadow(0 0 ${6 + lit * 14}px rgba(244,241,228,${0.2 + lit * 0.4}))` }}>
      <defs>
        <clipPath id={`moon-clip-${id}`}><circle cx={c} cy={c} r={r} /></clipPath>
        <radialGradient id={`moon-light-${id}`}><stop offset="0%" stopColor="#FFFDF5" /><stop offset="100%" stopColor={bright} /></radialGradient>
      </defs>
      <g clipPath={`url(#moon-clip-${id})`}>
        <rect x="0" y="0" width={size} height={size} fill={dark} />
        <rect x={waxing ? c : 0} y="0" width={c} height={size} fill={`url(#moon-light-${id})`} />
        <ellipse cx={c} cy={c} rx={rx} ry={r} fill={lit > 0.5 ? `url(#moon-light-${id})` : dark} />
        <circle cx={c - r * 0.3} cy={c - r * 0.2} r={r * 0.14} fill="#00000018" />
        <circle cx={c + r * 0.2} cy={c + r * 0.3} r={r * 0.1} fill="#00000014" />
      </g>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.12)" />
    </svg>
  );
}
