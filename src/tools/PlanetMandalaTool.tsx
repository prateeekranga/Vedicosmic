import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Hand } from 'lucide-react';

interface Graha {
  id: string; name: string; sanskrit: string; color: string; glow: string;
  radius: number; size: number; speed: number; base: number; offset?: number;
  day: string; significance: string;
}

const SUN = { id: 'sun', name: 'Sun', sanskrit: 'Surya', color: '#FFB72B', glow: '#FF8A00',
  day: 'Sunday', significance: 'The soul, vitality and the father — confidence, authority and the radiant core of the self.' };

const GRAHAS: Graha[] = [
  { id: 'moon', name: 'Moon', sanskrit: 'Chandra', color: '#DCE3EC', glow: '#A9C4E0', radius: 56, size: 7, speed: 34, base: 20, day: 'Monday', significance: 'The mind, emotions and the mother — memory, feeling and the tides of the inner world.' },
  { id: 'mercury', name: 'Mercury', sanskrit: 'Budha', color: '#67C97F', glow: '#2EB872', radius: 82, size: 6, speed: 27, base: 140, day: 'Wednesday', significance: 'Intellect and communication — speech, commerce, learning and quick analytical reasoning.' },
  { id: 'venus', name: 'Venus', sanskrit: 'Shukra', color: '#F4C9D7', glow: '#E892AE', radius: 108, size: 9, speed: 21, base: 250, day: 'Friday', significance: 'Love, beauty and pleasure — relationships, art, luxury and the sweetness of life.' },
  { id: 'mars', name: 'Mars', sanskrit: 'Mangala', color: '#E5594F', glow: '#C0392B', radius: 136, size: 8, speed: 16, base: 60, day: 'Tuesday', significance: 'Energy, courage and drive — action, conflict, property and physical vitality.' },
  { id: 'jupiter', name: 'Jupiter', sanskrit: 'Guru', color: '#F2C14E', glow: '#D99A1C', radius: 168, size: 14, speed: 10, base: 200, day: 'Thursday', significance: 'Wisdom, expansion and grace — knowledge, dharma, fortune and the teacher.' },
  { id: 'saturn', name: 'Saturn', sanskrit: 'Shani', color: '#7E93C4', glow: '#4A5C8C', radius: 200, size: 12, speed: 7, base: 320, day: 'Saturday', significance: 'Discipline, time and karma — structure, endurance, limitation and hard-won maturity.' },
  { id: 'rahu', name: 'Rahu', sanskrit: 'Rahu', color: '#9A8BB8', glow: '#6B5B8C', radius: 226, size: 7, speed: 5, base: 100, day: 'North Node', significance: 'The shadow node of ambition and obsession — innovation, foreign things and worldly desire.' },
  { id: 'ketu', name: 'Ketu', sanskrit: 'Ketu', color: '#A7ACB2', glow: '#6B7077', radius: 226, size: 7, speed: 5, base: 100, offset: 180, day: 'South Node', significance: 'The shadow node of detachment and moksha — past karma, intuition and spiritual liberation.' },
];

const CX = 240, CY = 240, TILT = 0.52;
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = (i / 70) * Math.PI * 2;
  const rr = 232 + (i % 5) * 4;
  return { x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr * TILT, r: 0.5 + (i % 3) * 0.4, d: (i % 7) * 0.4 };
});

export default function PlanetMandalaTool() {
  const [now, setNow] = useState(0);
  const [selected, setSelected] = useState<Graha | typeof SUN>(SUN);
  const [hovered, setHovered] = useState<string | null>(null);

  const autoRef = useRef(0);
  const baseRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      if (tRef.current == null) tRef.current = t;
      const dt = Math.min(0.05, (t - tRef.current) / 1000);
      tRef.current = t;
      if (!draggingRef.current) autoRef.current += dt * 4; // gentle auto-spin
      setNow((n) => n + dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rotation = autoRef.current + baseRef.current;

  const positions = useMemo(() => GRAHAS.map((g) => {
    const ang = ((g.base + (g.offset ?? 0)) + now * g.speed) * (Math.PI / 180);
    return { g, x: CX + Math.cos(ang) * g.radius, y: CY + Math.sin(ang) * g.radius * TILT };
  }), [now]);

  const onDown = (e: React.PointerEvent) => {
    draggingRef.current = true; lastXRef.current = e.clientX; movedRef.current = 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX; movedRef.current += Math.abs(dx);
    baseRef.current += dx * 0.45;
  };
  const onUp = () => { draggingRef.current = false; };

  return (
    <div className="grid gap-7 lg:grid-cols-[1.3fr_1fr]">
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-cosmic-darker/70 backdrop-blur-md">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: 'radial-gradient(ellipse at center, rgba(57,183,240,0.10), transparent 60%)' }} />
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[0.7rem] text-white/55">
          <Hand className="h-3.5 w-3.5" /> Drag to rotate · tap a graha
        </div>

        <svg viewBox="0 0 480 480" className="w-full cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <defs>
            <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE08A" /><stop offset="55%" stopColor={SUN.color} /><stop offset="100%" stopColor={SUN.glow} />
            </radialGradient>
          </defs>

          <g transform={`rotate(${rotation} ${CX} ${CY})`}>
            {/* star ring */}
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF"
                opacity={0.3 + 0.5 * Math.abs(Math.sin(now * 1.2 + s.d))} />
            ))}
            {/* orbits */}
            {GRAHAS.map((g) => (
              <ellipse key={g.id} cx={CX} cy={CY} rx={g.radius} ry={g.radius * TILT}
                fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={0.6} />
            ))}

            {/* sun */}
            <circle cx={CX} cy={CY} r={26} fill="url(#sunGrad)"
              style={{ filter: `drop-shadow(0 0 18px ${SUN.glow})`, cursor: 'pointer' }}
              onClick={() => setSelected(SUN)} />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1={CX} y1={CY} x2={CX} y2={CY - 34} stroke={SUN.color} strokeWidth={0.7} opacity={0.35}
                transform={`rotate(${(i * 360) / 24} ${CX} ${CY})`} />
            ))}

            {/* planets */}
            {positions.map(({ g, x, y }) => {
              const active = selected.id === g.id || hovered === g.id;
              return (
                <g key={g.id} style={{ cursor: 'pointer' }}
                  onClick={() => { if (movedRef.current < 6) setSelected(g); }}
                  onPointerEnter={() => setHovered(g.id)} onPointerLeave={() => setHovered(null)}>
                  <circle cx={x} cy={y} r={g.size + 6} fill={g.glow} opacity={active ? 0.35 : 0.18} />
                  <circle cx={x} cy={y} r={g.size} fill={g.color}
                    stroke={active ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth={active ? 1.5 : 0.6}
                    style={{ filter: `drop-shadow(0 0 6px ${g.glow})` }} />
                  {g.id === 'saturn' && (
                    <ellipse cx={x} cy={y} rx={g.size + 6} ry={(g.size + 6) * 0.4} fill="none"
                      stroke={g.color} strokeWidth={1.2} opacity={0.7}
                      transform={`rotate(-18 ${x} ${y})`} />
                  )}
                  <text x={x} y={y - g.size - 8} textAnchor="middle" fontSize={9.5}
                    fontFamily="'Inter',sans-serif" fill="#fff" opacity={active ? 0.95 : 0}
                    style={{ transition: 'opacity .2s' }}>{g.name}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* info panel */}
      <AnimatePresence mode="wait">
        <motion.div key={selected.id}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/12 bg-cosmic-light/30 p-7 backdrop-blur-sm">
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl"
            style={{ background: ('glow' in selected ? selected.glow : SUN.glow), opacity: 0.25 }} />
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="h-14 w-14 flex-none rounded-full"
                style={{ background: selected.color, boxShadow: `0 0 30px -4px ${'glow' in selected ? selected.glow : SUN.glow}` }} />
              <div>
                <p className="font-heading text-h3 text-white">{selected.name}</p>
                <p className="font-sacred text-brand-cyan-300">{selected.sanskrit}</p>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/60">
              <RotateCw className="h-3.5 w-3.5" /> {selected.day}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/75">{selected.significance}</p>
            <p className="mt-6 text-xs leading-relaxed text-white/40">
              The Navagraha — nine celestial influences of Vedic astrology. Drag the mandala to spin it through a full 360°, and tap any graha to read its meaning.
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
