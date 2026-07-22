import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DateSelect } from '@/components/ui/DateSelect';
import { NAKSHATRAS as NAKS, RULER_COLOR } from '@/data/nakshatras';

/* ─────────────── approximate Moon sidereal longitude ─────────────── */
const rad = Math.PI / 180;
function moonSiderealLon(dt: Date): number {
  const jd = dt.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  const L = 218.316 + 13.176396 * d;          // mean longitude
  const M = 134.963 + 13.064993 * d;          // mean anomaly
  const D = 297.85 + 12.190749 * d;           // mean elongation
  const Ms = 357.529 + 0.98560028 * d;        // sun anomaly
  let lon = L
    + 6.289 * Math.sin(M * rad)
    + 1.274 * Math.sin((2 * D - M) * rad)
    + 0.658 * Math.sin(2 * D * rad)
    - 0.186 * Math.sin(Ms * rad);
  const ayan = 23.856 + d * 0.0000382;        // Lahiri ayanamsa, linearised
  lon = ((lon - ayan) % 360 + 360) % 360;
  return lon;
}

const SEG = 360 / 27;

export default function NakshatraTool() {
  const [sel, setSel] = useState(0);
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('06:00');
  const [result, setResult] = useState<{ idx: number; pada: number; lon: number } | null>(null);

  const find = () => {
    if (!dob) return;
    const dt = new Date(`${dob}T${time || '06:00'}:00`);
    if (isNaN(dt.getTime())) return;
    const lon = moonSiderealLon(dt);
    const idx = Math.floor(lon / SEG) % 27;
    const pada = Math.floor((lon % SEG) / (SEG / 4)) + 1;
    setResult({ idx, pada, lon });
    setSel(idx);
  };

  const nak = NAKS[sel];

  /* wheel geometry */
  const C = 150, R1 = 96, R2 = 138;
  const pt = (a: number, r: number) => ({ x: C + r * Math.cos(a * rad), y: C + r * Math.sin(a * rad) });
  const segPath = (i: number) => {
    const a1 = i * SEG - 90, a2 = (i + 1) * SEG - 90;
    const p1 = pt(a1, R1), p2 = pt(a1, R2), p3 = pt(a2, R2), p4 = pt(a2, R1);
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${R2} ${R2} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${R1} ${R1} 0 0 0 ${p1.x} ${p1.y} Z`;
  };
  const moonAngle = result ? result.lon - 90 : null;

  const stars = useMemo(() => Array.from({ length: 40 }, () => ({
    x: 20 + Math.random() * 260, y: 20 + Math.random() * 260, r: Math.random() * 1.1 + 0.3, o: Math.random() * 0.5 + 0.15,
  })), []);

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/65">
          The Moon crosses one of <b className="text-white">27 nakshatras</b> — lunar mansions — every day of its monthly
          journey. The mansion it occupied at your birth is your <b className="text-white">janma nakshatra</b>, the
          seed-star of your temperament. Explore the wheel, or enter your birth details to find yours.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <DateSelect value={dob} onChange={setDob} className="max-w-md" />
          <label className="text-xs text-white/50">Birth time
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="mt-1 block rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/50" />
          </label>
          <Button onClick={find} disabled={!dob}><Star className="mr-2 h-4 w-4" /> Find my star</Button>
        </div>
        {result && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-white/75">
            <Sparkles className="mr-1 inline h-4 w-4 text-gold-300" />
            Your janma nakshatra is <b className="text-gold-300">{NAKS[result.idx].name} · {NAKS[result.idx].dev}</b>, pada {result.pada}
            <span className="text-white/40"> (sidereal Moon ≈ {result.lon.toFixed(1)}°)</span>
          </motion.p>
        )}
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* wheel */}
        <Card className="p-6">
          <span className="eyebrow">The wheel of 27 mansions</span>
          <svg viewBox="0 0 300 300" className="mx-auto mt-3 w-full max-w-[400px]">
            {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />)}
            {NAKS.map((nk, i) => {
              const active = i === sel;
              const mid = (i + 0.5) * SEG - 90;
              const lp = pt(mid, (R1 + R2) / 2);
              return (
                <g key={nk.n} onClick={() => setSel(i)} className="cursor-pointer">
                  <motion.path d={segPath(i)} fill={RULER_COLOR[nk.ruler]}
                    animate={{ opacity: active ? 0.85 : 0.22 }} whileHover={{ opacity: 0.6 }}
                    stroke="rgba(0,0,0,0.5)" strokeWidth="0.6" />
                  <text x={lp.x} y={lp.y + 2.5} textAnchor="middle" fontSize="7.5"
                    fill={active ? '#fff' : 'rgba(255,255,255,0.55)'} className="pointer-events-none select-none">{nk.n}</text>
                </g>
              );
            })}
            <circle cx={C} cy={C} r={R1 - 8} fill="rgba(10,8,30,0.85)" stroke="rgba(255,255,255,0.1)" />
            {/* moon marker */}
            {moonAngle != null && (() => { const p = pt(moonAngle, (R1 + R2) / 2); return (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <circle cx={p.x} cy={p.y} r="7" fill="#FFF7DB" style={{ filter: 'drop-shadow(0 0 8px #FFD700)' }} />
                <circle cx={p.x + 2} cy={p.y - 1} r="5.4" fill="#0a081e" opacity="0.85" />
              </motion.g>
            ); })()}
            {/* centre: selected */}
            <text x={C} y={C - 14} textAnchor="middle" className="font-sacred" fontSize="17" fill="#FFD700">{nak.dev}</text>
            <text x={C} y={C + 4} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)">{nak.name}</text>
            <text x={C} y={C + 18} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.45)">#{nak.n} of 27 · {nak.ruler}</text>
          </svg>
          <p className="mt-2 text-center text-[11px] text-white/35">Tap any segment · colours show the ruling planet</p>
        </Card>

        {/* details */}
        <AnimatePresence mode="wait">
          <motion.div key={nak.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-h3 text-white">{nak.name} <span className="font-sacred text-gold-300">{nak.dev}</span></h3>
                {result && result.idx === sel && <Badge tone="gold">Your star</Badge>}
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <p className="text-xs text-white/40">Ruling planet</p>
                  <p className="mt-0.5 flex items-center gap-2 text-white/85">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: RULER_COLOR[nak.ruler] }} />{nak.ruler}
                  </p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <p className="text-xs text-white/40">Presiding deity</p>
                  <p className="mt-0.5 text-white/85">{nak.deity}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <p className="text-xs text-white/40">Symbol</p>
                  <p className="mt-0.5 text-white/85">{nak.symbol}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <p className="text-xs text-white/40">Span</p>
                  <p className="mt-0.5 text-white/85">{(sel * SEG).toFixed(2)}° – {((sel + 1) * SEG).toFixed(2)}°</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/65"><Sparkles className="mr-1 inline h-4 w-4 text-gold-soft" />{nak.trait}</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((p) => (
                  <span key={p} className={`rounded-full border px-2.5 py-1 text-xs ${result && result.idx === sel && result.pada === p ? 'border-gold-soft/60 bg-gold-bright/10 text-gold-pale' : 'border-white/10 text-white/45'}`}>
                    Pada {p}
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/30">
                Birth-star computed from an approximate lunar position (±1°) with Lahiri ayanamsa, in your device’s timezone.
                Births near a boundary may shift by one mansion — verify with a full ephemeris or panchang.
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
