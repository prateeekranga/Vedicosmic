import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useAnimationFrame, useReducedMotion } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════════
   RealisticSerpent — a procedurally-built serpent that uncoils from a
   basal spiral (the classic 2½ coils) and climbs a sine path threading
   each chakra centre. The body is a tapered ribbon with a fish-scale
   texture, belly stripe and golden rim-light; the head has slit-pupil
   golden eyes, nostrils and a flicking forked tongue. Slither runs at
   60fps by mutating path `d` attributes directly (no React re-render)
   and freezes under prefers-reduced-motion.
   ══════════════════════════════════════════════════════════════════ */

interface Geo { cx: number; yBase: number; yTop: number; amp: number }
interface Built { body: string; belly: string; head: { x: number; y: number; a: number } }

const TWO_PI = Math.PI * 2;
const COIL_FRAC = 0.20;          // fraction of the param spent in the basal coil
const COIL_TURNS = 2.5;          // the classic two-and-a-half coils
const SAMPLES = 96;

/** Point on the composite guide curve at param u∈[0,1], with slither phase t. */
function guide(u: number, t: number, g: Geo): { x: number; y: number } {
  if (u < COIL_FRAC) {
    const v = u / COIL_FRAC;                       // 0 = tail tip … 1 = exit
    const theta = -Math.PI / 2 - (1 - v) * COIL_TURNS * TWO_PI;
    const r = 5 + v * 15 + 1.2 * Math.sin(3 * theta + t * 1.5);
    return { x: g.cx + r * Math.cos(theta), y: g.yBase + 10 + r * Math.sin(theta) * 0.72 };
  }
  const w = (u - COIL_FRAC) / (1 - COIL_FRAC);     // 0 at base … 1 at crown
  const env = Math.pow(Math.sin(Math.PI * Math.min(1, 0.08 + w * 0.97)), 0.85);
  const base = Math.sin(6 * Math.PI * w) * g.amp * env;       // zeros at chakras
  const ripple = 5 * Math.sin(15 * Math.PI * w - t * 2.6) * env; // travelling slither
  return { x: g.cx + base + ripple, y: g.yBase - w * (g.yBase - g.yTop) };
}

/** Body half-width along the current body length s∈[0,1] (tail→neck). */
function widthAt(s: number, wMax: number): number {
  const bulk = Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.02)), 0.6);
  const neck = s > 0.9 ? 1 - ((s - 0.9) / 0.1) * 0.45 : 1;
  return Math.max(1.4, wMax * (0.22 + 0.78 * bulk) * neck);
}

function build(progress: number, t: number, g: Geo, wMax: number): Built {
  const p = Math.max(0.05, Math.min(1, progress));
  const n = Math.max(12, Math.round(SAMPLES * p));
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) pts.push(guide((i / n) * p, t, g));

  const L: string[] = [], R: string[] = [], B1: string[] = [], B2: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
    let nx = -(b.y - a.y), ny = b.x - a.x;
    const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    const w = widthAt(i / n, wMax);
    const P = pts[i];
    L.push(`${(P.x + nx * w).toFixed(1)},${(P.y + ny * w).toFixed(1)}`);
    R.push(`${(P.x - nx * w).toFixed(1)},${(P.y - ny * w).toFixed(1)}`);
    const bw = w * 0.42;
    B1.push(`${(P.x + nx * bw).toFixed(1)},${(P.y + ny * bw).toFixed(1)}`);
    B2.push(`${(P.x - nx * bw).toFixed(1)},${(P.y - ny * bw).toFixed(1)}`);
  }
  const ribbon = (Ls: string[], Rs: string[]) => `M ${Ls.join(' L ')} L ${Rs.reverse().join(' L ')} Z`;
  const hA = pts[n], hB = pts[n - 2] || pts[0];
  return {
    body: ribbon(L, R),
    belly: ribbon(B1, B2),
    head: { x: hA.x, y: hA.y, a: (Math.atan2(hA.y - hB.y, hA.x - hB.x) * 180) / Math.PI },
  };
}

export function RealisticSerpent({
  progress, cx, yBase, yTop, amp = 40, wMax = 9, slither = true,
}: { progress: number; cx: number; yBase: number; yTop: number; amp?: number; wMax?: number; slither?: boolean }) {
  const uid = useId().replace(/[:]/g, '');
  const reduced = useReducedMotion();
  const g: Geo = useMemo(() => ({ cx, yBase, yTop, amp }), [cx, yBase, yTop, amp]);

  const bodyRef = useRef<SVGPathElement>(null);
  const bellyRef = useRef<SVGPathElement>(null);
  const scaleRef = useRef<SVGPathElement>(null);
  const rimRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const pRef = useRef(progress); pRef.current = progress;
  const tRef = useRef(0);

  const apply = (bt: Built) => {
    bodyRef.current?.setAttribute('d', bt.body);
    scaleRef.current?.setAttribute('d', bt.body);
    rimRef.current?.setAttribute('d', bt.body);
    bellyRef.current?.setAttribute('d', bt.belly);
    headRef.current?.setAttribute('transform', `translate(${bt.head.x} ${bt.head.y}) rotate(${bt.head.a})`);
  };

  useAnimationFrame((_, delta) => {
    if (reduced || !slither) return;
    tRef.current += delta / 1000;
    apply(build(pRef.current, tRef.current, g, wMax));
  });
  useEffect(() => { apply(build(progress, tRef.current, g, wMax)); }, [progress, g, wMax]);

  const first = useMemo(() => build(progress, 0, g, wMax), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <g>
      <defs>
        <linearGradient id={`sb${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#14532D" /><stop offset="45%" stopColor="#15803D" />
          <stop offset="80%" stopColor="#22C55E" /><stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
        <linearGradient id={`sv${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.75" /><stop offset="100%" stopColor="#ECFDF5" stopOpacity="0.85" />
        </linearGradient>
        <pattern id={`sc${uid}`} width="9" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 7 Q 2.25 3.6 4.5 7 Q 6.75 3.6 9 7" fill="none" stroke="#052e16" strokeWidth="0.8" opacity="0.55" />
          <path d="M-4.5 3.5 Q -2.25 0.1 0 3.5 Q 2.25 0.1 4.5 3.5 Q 6.75 0.1 9 3.5 Q 11.25 0.1 13.5 3.5" fill="none" stroke="#052e16" strokeWidth="0.8" opacity="0.45" />
        </pattern>
        <radialGradient id={`sh${uid}`}><stop offset="0%" stopColor="#4ADE80" /><stop offset="100%" stopColor="#166534" /></radialGradient>
      </defs>

      {/* soft ground shadow beneath the coil */}
      <ellipse cx={cx} cy={yBase + 22} rx="30" ry="7" fill="#000" opacity="0.35" />

      {/* body: base → scales → belly → rim light */}
      <path ref={bodyRef} d={first.body} fill={`url(#sb${uid})`} stroke="#052e16" strokeWidth="1"
        style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45)) drop-shadow(0 0 10px rgba(74,222,128,0.35))' }} />
      <path ref={scaleRef} d={first.body} fill={`url(#sc${uid})`} />
      <path ref={bellyRef} d={first.belly} fill={`url(#sv${uid})`} opacity="0.5" />
      <path ref={rimRef} d={first.body} fill="none" stroke="#FDE68A" strokeWidth="0.9" opacity="0.35" />

      {/* head */}
      <g ref={headRef} transform={`translate(${first.head.x} ${first.head.y}) rotate(${first.head.a})`}>
        <motion.g animate={{ scaleX: [0, 1, 1, 0, 0] }} transition={{ duration: 2.6, times: [0, 0.12, 0.3, 0.42, 1], repeat: Infinity }}
          style={{ transformOrigin: '13px 0px', transformBox: 'fill-box' as never }}>
          <path d="M13 0 L 26 0 M26 0 L 31 -3.4 M26 0 L 31 3.4" stroke="#F43F5E" strokeWidth="1.7" strokeLinecap="round" fill="none" />
        </motion.g>
        <path d="M-9 0 C -9 -7.5 -1 -9.5 4 -8.5 C 11 -7 15 -3.4 16.5 0 C 15 3.4 11 7 4 8.5 C -1 9.5 -9 7.5 -9 0 Z"
          fill={`url(#sh${uid})`} stroke="#052e16" strokeWidth="1"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }} />
        <path d="M-6 -2.5 C -1 -5 6 -5 12 -1.6" fill="none" stroke="#A7F3D0" strokeWidth="0.9" opacity="0.5" />
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(4 ${s * 4.6})`}>
            <circle r="2.7" fill="#FCD34D" stroke="#78350F" strokeWidth="0.5" style={{ filter: 'drop-shadow(0 0 3px #FCD34D)' }} />
            <ellipse rx="0.8" ry="2" fill="#1C1917" />
            <circle cx="-0.8" cy="-0.8" r="0.55" fill="#FFF" opacity="0.85" />
          </g>
        ))}
        <circle cx="12.5" cy="-1.6" r="0.55" fill="#052e16" /><circle cx="12.5" cy="1.6" r="0.55" fill="#052e16" />
      </g>
    </g>
  );
}

/* ── iḍā & piṅgalā — the lunar and solar channels weaving the suṣumṇā ── */
export function NadiChannels({ cx, yBase, yTop, amp = 48 }: { cx: number; yBase: number; yTop: number; amp?: number }) {
  const uid = useId().replace(/[:]/g, '');
  const path = (sign: 1 | -1) => {
    const pts: string[] = [];
    for (let i = 0; i <= 72; i++) {
      const w = i / 72;
      const env = Math.pow(Math.sin(Math.PI * Math.min(1, 0.06 + w * 0.99)), 0.9);
      const x = cx + sign * Math.sin(6 * Math.PI * w) * amp * env;
      pts.push(`${x.toFixed(1)},${(yBase - w * (yBase - yTop)).toFixed(1)}`);
    }
    return `M ${pts.join(' L ')}`;
  };
  return (
    <g opacity="0.8">
      <defs>
        <linearGradient id={`ida${uid}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#E0F2FE" /></linearGradient>
        <linearGradient id={`pin${uid}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#F97316" /><stop offset="100%" stopColor="#FCA5A5" /></linearGradient>
      </defs>
      <path d={path(1)} fill="none" stroke={`url(#ida${uid})`} strokeWidth="2.6" strokeLinecap="round" opacity="0.75"
        strokeDasharray="7 9" style={{ filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.6))' }}>
        <animate attributeName="stroke-dashoffset" from="160" to="0" dur="7s" repeatCount="indefinite" />
      </path>
      <path d={path(-1)} fill="none" stroke={`url(#pin${uid})`} strokeWidth="2.6" strokeLinecap="round" opacity="0.75"
        strokeDasharray="7 9" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.6))' }}>
        <animate attributeName="stroke-dashoffset" from="0" to="160" dur="7s" repeatCount="indefinite" />
      </path>
      <text x={cx - amp - 6} y={yBase + 4} textAnchor="end" fontSize="9" fill="#93C5FD" opacity="0.8">iḍā ☾</text>
      <text x={cx + amp + 6} y={yBase + 4} fontSize="9" fill="#FDBA74" opacity="0.8">piṅgalā ☀</text>
    </g>
  );
}

/* ── radiant crown rays (the halo of the reference cover) ── */
export function CrownRays({ cx, cy, r = 34, active }: { cx: number; cy: number; r?: number; active: boolean }) {
  return (
    <motion.g style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box' as never }}
      animate={{ rotate: 360, opacity: active ? 1 : 0.35 }}
      transition={{ rotate: { duration: 60, repeat: Infinity, ease: 'linear' }, opacity: { duration: 1.2 } }}>
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * TWO_PI;
        const r2 = r + (i % 3 === 0 ? 16 : i % 2 ? 8 : 11);
        return <line key={i} x1={cx + r * Math.cos(a)} y1={cy + r * Math.sin(a)}
          x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
          stroke={i % 2 ? '#FDE68A' : '#A78BFA'} strokeWidth="1" opacity={0.55} />;
      })}
    </motion.g>
  );
}

/* ── looping ascent (for Urdhva SOS): the serpent rises, holds, dissolves, rises ── */
export function SerpentAscentLoop({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  const [st, setSt] = useState({ p: 0.3, o: 1 });
  const CH = ['#EF4444', '#F97316', '#FACC15', '#34D399', '#38BDF8', '#6366F1', '#A78BFA'];
  const CYCLE = 9;

  useAnimationFrame((time) => {
    if (reduced) return;
    const raw = ((time / 1000) % CYCLE) / CYCLE;
    const p = raw < 0.85 ? raw / 0.85 : 1;
    const fade = raw < 0.05 ? raw / 0.05 : raw > 0.94 ? (1 - raw) / 0.06 : 1;
    setSt({ p: 0.06 + p * 0.94, o: Math.max(0, fade) });
  });

  return (
    <svg viewBox="0 0 160 360" className={className}>
      <line x1="80" y1="340" x2="80" y2="24" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 5" />
      {CH.map((c, i) => (
        <circle key={i} cx="80" cy={324 - i * 49} r="5.5" fill={c} opacity="0.85" style={{ filter: `drop-shadow(0 0 5px ${c})` }} />
      ))}
      <g style={{ opacity: st.o }}>
        <RealisticSerpent progress={st.p} cx={80} yBase={324} yTop={24} amp={26} wMax={6.5} slither={false} />
      </g>
    </svg>
  );
}
