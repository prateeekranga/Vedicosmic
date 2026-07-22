/**
 * Ambient Navagraha orbital backdrop for the hero. Pure SVG + CSS animation
 * (each graha rides a rotating group), so it's GPU-friendly and needs no JS
 * re-renders. It pauses automatically under prefers-reduced-motion (handled
 * globally in globals.css). Decorative only — pointer-events disabled.
 */
const C = 300;

interface P { id: string; color: string; glow: string; r: number; s: number; dur: number; base: number; ring?: boolean }

const PLANETS: P[] = [
  { id: 'moon',    color: '#DCE3EC', glow: '#A9C4E0', r: 64,  s: 6,  dur: 38,  base: 20 },
  { id: 'mercury', color: '#67C97F', glow: '#2EB872', r: 92,  s: 5,  dur: 30,  base: 140 },
  { id: 'venus',   color: '#F4C9D7', glow: '#E892AE', r: 120, s: 8,  dur: 26,  base: 250 },
  { id: 'mars',    color: '#E5594F', glow: '#C0392B', r: 150, s: 7,  dur: 46,  base: 60 },
  { id: 'jupiter', color: '#F2C14E', glow: '#D99A1C', r: 184, s: 13, dur: 64,  base: 200 },
  { id: 'saturn',  color: '#7E93C4', glow: '#4A5C8C', r: 218, s: 11, dur: 92,  base: 320, ring: true },
  { id: 'rahu',    color: '#9A8BB8', glow: '#6B5B8C', r: 252, s: 6,  dur: 120, base: 100 },
  { id: 'ketu',    color: '#A7ACB2', glow: '#6B7077', r: 252, s: 6,  dur: 120, base: 280 },
];

export function OrbitBackdrop({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="orbitSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE894" />
          <stop offset="55%" stopColor="#FFB72B" />
          <stop offset="100%" stopColor="#FF8A00" />
        </radialGradient>
      </defs>

      {/* orbit guide rings */}
      {PLANETS.slice(0, 7).map((p) => (
        <circle key={`o-${p.id}`} cx={C} cy={C} r={p.r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.6} />
      ))}

      {/* sun */}
      <g style={{ transformBox: 'view-box', transformOrigin: '300px 300px', animation: 'spin-slow 180s linear infinite' }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <line key={i} x1={C} y1={C} x2={C} y2={C - 40} stroke="#FFB72B" strokeWidth={0.7} opacity={0.3}
            transform={`rotate(${(i * 360) / 28} ${C} ${C})`} />
        ))}
      </g>
      <circle cx={C} cy={C} r={26} fill="url(#orbitSun)" style={{ filter: 'drop-shadow(0 0 22px #FF8A00)' }} />

      {/* planets, each on its own rotating group */}
      {PLANETS.map((p) => (
        <g key={p.id}
          style={{
            transformBox: 'view-box',
            transformOrigin: '300px 300px',
            animation: `spin-slow ${p.dur}s linear infinite`,
            animationDelay: `-${(p.base / 360) * p.dur}s`,
          }}>
          <circle cx={C + p.r} cy={C} r={p.s + 6} fill={p.glow} opacity={0.22} />
          {p.ring && (
            <ellipse cx={C + p.r} cy={C} rx={p.s + 6} ry={(p.s + 6) * 0.4} fill="none"
              stroke={p.color} strokeWidth={1.1} opacity={0.7} transform={`rotate(-18 ${C + p.r} ${C})`} />
          )}
          <circle cx={C + p.r} cy={C} r={p.s} fill={p.color} stroke="rgba(255,255,255,0.45)" strokeWidth={0.6}
            style={{ filter: `drop-shadow(0 0 6px ${p.glow})` }} />
        </g>
      ))}
    </svg>
  );
}
