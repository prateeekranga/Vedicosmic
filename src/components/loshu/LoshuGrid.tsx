import { motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { LOSHU_LAYOUT, LOSHU_NUMBERS, PLANES, effectiveCounts, type Plane } from '@/data/loshu';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const S = 96, G = 8, M = 20;
const VB = 340;

const POS: Record<number, [number, number]> = {};
LOSHU_LAYOUT.forEach((row, r) => row.forEach((n, c) => { POS[n] = [r, c]; }));
const cellXY = (n: number) => { const [r, c] = POS[n]; return { x: M + c * (S + G), y: M + r * (S + G) }; };
const center = (n: number) => { const { x, y } = cellXY(n); return { cx: x + S / 2, cy: y + S / 2 }; };

/** Visual category per plane — rows/columns get a plain colour, the three
 * "named" planes (Will, Golden & Silver Diagonal) get their own signature look. */
type Category = 'row' | 'col' | 'will' | 'golden' | 'silver';
function categoryOf(p: Plane): Category {
  if (p.id === 'will') return 'will';
  if (p.id === 'golden') return 'golden';
  if (p.id === 'spiritual') return 'silver';
  return p.kind === 'row' ? 'row' : 'col';
}
const CATEGORY_COLOR: Record<Category, string> = {
  row: '#39B7F0',
  col: '#8B5CF6',
  will: '#818CF8',
  golden: '#FFD700',
  silver: '#D8DCE6',
};
const CATEGORY_LABEL: Record<Category, string> = {
  row: 'Row', col: 'Column', will: 'Will Power', golden: 'Golden Diagonal', silver: 'Silver Diagonal',
};

/** Deterministic sparkle points along a line — same on every render, no Math.random jitter. */
function sparklePoints(a: { cx: number; cy: number }, b: { cx: number; cy: number }, count = 7) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1);
    const wobble = Math.sin(i * 12.9898) * 5.5;
    return { x: a.cx + dx * t + nx * wobble, y: a.cy + dy * t + ny * wobble, delay: (i * 0.22) % 1.6 };
  });
}

export interface LoshuGridProps {
  counts: Record<number, number>;
  driver?: number;
  conductor?: number;
  kua?: number | null;
  className?: string;
}

/**
 * The advanced, interactive Lo Shu Grid — shared by the Numerology Blueprint
 * and the standalone Lo Shu Grid tool. Complete rows/columns/diagonals draw a
 * glowing arrow; the Will Plane and the Golden/Silver Diagonals get their own
 * colour and a callout chip, and the two diagonals glitter when complete.
 * Hover any cell for its planetary meaning.
 */
export function LoshuGrid({ counts, driver, conductor, kua, className }: LoshuGridProps) {
  const reduced = usePrefersReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  // Mulank / Bhagyank / Kua count as present too, filling otherwise-empty cells
  // so an arrow can form "after adding" them — see effectiveCounts' docs.
  const eff = effectiveCounts(counts, driver, conductor, kua);
  const has = (n: number) => (eff[n] || 0) > 0;
  const present = PLANES.filter((p) => p.cells.every(has));
  const byCategory = (cat: Category) => present.find((p) => categoryOf(p) === cat);

  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${VB} ${VB}`} className="mx-auto w-full max-w-[380px] overflow-visible">
        <defs>
          {/* userSpaceOnUse with a fixed region — percentage-based regions collapse to
              zero on perfectly horizontal/vertical lines (zero-height/width bbox),
              which made row & column arrows invisible while diagonals worked fine. */}
          <filter id="loshuGlow" filterUnits="userSpaceOnUse" x={-20} y={-20} width={VB + 40} height={VB + 40}>
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {(Object.keys(CATEGORY_COLOR) as Category[]).map((cat) => (
            <marker key={cat} id={`loshuArrow-${cat}`} viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill={CATEGORY_COLOR[cat]} />
            </marker>
          ))}
        </defs>

        {/* cells */}
        {LOSHU_LAYOUT.flat().map((n, i) => {
          const info = LOSHU_NUMBERS[n];
          const { x, y } = cellXY(n);
          const count = eff[n] || 0;
          const cellPresent = count > 0;
          const label = cellPresent ? String(n).repeat(count) : String(n);
          const fs = count <= 1 ? 34 : count === 2 ? 27 : count === 3 ? 21 : 16;
          const hovered = hover === n;
          return (
            <motion.g
              key={n}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: hovered ? 1.05 : 1 }}
              transition={{ delay: reduced ? 0 : 0.05 * i, type: 'spring', stiffness: 220, damping: 16 }}
              style={{ transformOrigin: `${x + S / 2}px ${y + S / 2}px`, cursor: 'pointer' }}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover((h) => (h === n ? null : h))}
              onTouchStart={() => setHover((h) => (h === n ? null : n))}
            >
              <rect x={x} y={y} width={S} height={S} rx={12}
                fill={cellPresent ? info.color : 'rgba(255,255,255,0.04)'}
                stroke={hovered ? '#FFD700' : cellPresent ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.14)'}
                strokeWidth={hovered ? 2.5 : cellPresent ? 1 : 1.2}
                strokeDasharray={cellPresent ? '0' : '4 4'}
                style={hovered ? { filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.7))' } : undefined} />
              <text x={x + S / 2} y={y + S / 2 + 2} textAnchor="middle" dominantBaseline="middle"
                fontFamily="'Cinzel', serif" fontWeight={700} fontSize={fs}
                fill={cellPresent ? '#1a1330' : 'rgba(255,255,255,0.28)'}>{label}</text>
              <text x={x + S / 2} y={y + S - 12} textAnchor="middle"
                fontFamily="'Inter', sans-serif" fontWeight={600} fontSize={9.5}
                letterSpacing="0.12em"
                fill={cellPresent ? 'rgba(26,19,48,0.7)' : 'rgba(255,255,255,0.32)'}>
                {info.planet.toUpperCase()}
              </text>
            </motion.g>
          );
        })}

        {/* arrows for every complete plane — coloured & arrow-headed by category */}
        {present.map((p, i) => {
          const cat = categoryOf(p);
          const color = CATEGORY_COLOR[cat];
          const a = center(p.cells[0]); const b = center(p.cells[2]);
          const isDiamond = cat === 'golden' || cat === 'silver';
          return (
            <g key={p.id}>
              <motion.line x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                stroke={color} strokeWidth={isDiamond ? 5 : 4} strokeLinecap="round"
                opacity={isDiamond ? 0.85 : 0.65}
                filter="url(#loshuGlow)"
                markerEnd={`url(#loshuArrow-${cat})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isDiamond ? 0.85 : 0.65 }}
                transition={{ delay: reduced ? 0 : 0.6 + i * 0.18, duration: 0.7, ease: 'easeOut' }} />
              {/* glitter — only the Golden & Silver Diagonals sparkle */}
              {isDiamond && !reduced && sparklePoints(a, b).map((s, si) => (
                <motion.circle key={si} cx={s.x} cy={s.y} r={2.2} fill={color}
                  style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: 1.2 + s.delay, ease: 'easeInOut' }} />
              ))}
            </g>
          );
        })}

        {/* Mulank / Bhagyank / Kua markers */}
        {(() => {
          const markers = [
            ...(driver != null ? [{ n: driver, color: '#FFD700', letter: 'M' }] : []),
            ...(conductor != null ? [{ n: conductor, color: '#39B7F0', letter: 'B' }] : []),
            ...(kua != null ? [{ n: kua, color: '#8B5CF6', letter: 'K' }] : []),
          ];
          const seen: Record<number, number> = {};
          return markers.map((m, idx) => {
            const order = (seen[m.n] = (seen[m.n] ?? -1) + 1);
            const { x, y } = cellXY(m.n);
            const pad = 3 + order * 5;
            const bx = x + S - 13;
            const by = y + 13 + order * 20;
            return (
              <g key={m.letter}>
                <motion.rect x={x + pad} y={y + pad} width={S - 2 * pad} height={S - 2 * pad} rx={10}
                  fill="none" stroke={m.color} strokeWidth={2.6}
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: reduced ? 0 : 0.9 + idx * 0.15, type: 'spring', stiffness: 200, damping: 14 }}
                  style={{ transformOrigin: `${x + S / 2}px ${y + S / 2}px`, filter: `drop-shadow(0 0 5px ${m.color})` }} />
                <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: reduced ? 0 : 1.0 + idx * 0.15, type: 'spring', stiffness: 240, damping: 14 }}
                  style={{ transformOrigin: `${bx}px ${by}px` }}>
                  <circle cx={bx} cy={by} r={8.5} fill={m.color} stroke="#0A0A1A" strokeWidth={1} />
                  <text x={bx} y={by + 0.5} textAnchor="middle" dominantBaseline="middle"
                    fontFamily="'Inter',sans-serif" fontWeight={700} fontSize={10} fill="#0A0A1A">{m.letter}</text>
                </motion.g>
              </g>
            );
          });
        })()}
      </svg>

      {/* tooltip for the hovered cell */}
      {hover != null && (() => {
        const { x, y } = cellXY(hover);
        const info = LOSHU_NUMBERS[hover];
        return (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10 w-48 -translate-x-1/2 -translate-y-full rounded-xl border border-white/15 bg-cosmic-darker/95 p-3 text-left shadow-card backdrop-blur-md"
            style={{ left: `${((x + S / 2) / VB) * 100}%`, top: `${(y / VB) * 100}%` }}
          >
            <p className="text-xs font-semibold" style={{ color: info.color }}>{info.planet} · {info.sanskrit}</p>
            <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-white/50">{info.keyword}</p>
            <p className="mt-1.5 text-xs leading-snug text-white/65">{info.trait}</p>
          </motion.div>
        );
      })()}

      {/* named-plane callouts — Will Power, Golden & Silver Diagonal, shown properly whether formed or not */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {(['will', 'golden', 'silver'] as const).map((cat) => {
          const plane = byCategory(cat);
          const active = !!plane;
          const color = CATEGORY_COLOR[cat];
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 1.3 }}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active ? 'shadow-[0_0_16px_-4px_var(--glow)]' : 'border-white/10 bg-white/[0.03] text-white/35',
              )}
              style={active ? ({ borderColor: `${color}66`, background: `${color}14`, color, '--glow': color } as CSSProperties) : undefined}
            >
              <motion.span
                animate={active && !reduced ? { rotate: 360 } : undefined}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              >
                {cat === 'will' ? '⚡' : '✦'}
              </motion.span>
              {CATEGORY_LABEL[cat]}
              {!active && <span className="text-white/25">· not yet formed</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
