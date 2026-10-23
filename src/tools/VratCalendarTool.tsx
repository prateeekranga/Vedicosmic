import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Bell, BellOff, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PlaceSearch } from '@/components/astro/PlaceSearch';
import { MethodLine } from '@/components/astro/MethodLine';
import { skyAt } from '@/engine/panchang';
import { vratsBetween, type Vrat } from '@/engine/vrat';
import { dateInZone } from '@/engine/time';
import { formatIsoDate } from '@/lib/format';
import { usePreferredPlace } from '@/hooks/usePreferredPlace';

/* ── animated moon that shows a given illuminated phase (0=new,0.5=full,1=new) ── */
function MoonPhase({ phase, size = 120, glow = true }: { phase: number; size?: number; glow?: boolean }) {
  // waxing 0→0.5 lit from right; waning 0.5→1 lit from left
  const lit = 1 - Math.abs(phase - 0.5) * 2;         // 0..1 fraction illuminated
  const waxing = phase < 0.5;
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  // terminator ellipse radius: from full (r) at half-lit to 0 at edges
  const k = Math.cos(lit * Math.PI); // +1 crescent … -1 gibbous
  const rx = Math.abs(k) * r;
  const bright = '#F4F1E4', dark = '#2A2740';
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}
      style={glow ? { filter: `drop-shadow(0 0 ${8 + lit * 20}px rgba(244,241,228,${0.25 + lit * 0.5}))` } : undefined}>
      <defs>
        <clipPath id={`mc${size}`}><circle cx={cx} cy={cy} r={r} /></clipPath>
        <radialGradient id={`mg${size}`}><stop offset="0%" stopColor="#FFFDF5" /><stop offset="100%" stopColor={bright} /></radialGradient>
      </defs>
      <g clipPath={`url(#mc${size})`}>
        <rect x="0" y="0" width={size} height={size} fill={dark} />
        {/* bright half on the appropriate side */}
        <rect x={waxing ? cx : 0} y="0" width={cx} height={size} fill={`url(#mg${size})`} />
        {/* terminator ellipse: adds to bright (gibbous) or subtracts (crescent) */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={r}
          fill={lit > 0.5 ? (waxing ? `url(#mg${size})` : `url(#mg${size})`) : dark} />
        {/* subtle maria */}
        <circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.14} fill="#00000018" />
        <circle cx={cx + r * 0.2} cy={cy + r * 0.3} r={r * 0.1} fill="#00000014" />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" />
    </svg>
  );
}

const KIND_COLOR: Record<Vrat['kind'], string> = {
  ekadashi: '#FFD700', purnima: '#F4F1E4', amavasya: '#8B5CF6', pradosh: '#38BDF8', chaturthi: '#F97316', ashtami: '#F87171',
};
const KIND_ICON: Record<Vrat['kind'], string> = {
  ekadashi: '🌿', purnima: '🌕', amavasya: '🌑', pradosh: '🔱', chaturthi: '🐘', ashtami: '🔴',
};
const KIND_NOTE: Record<Vrat['kind'], string> = {
  ekadashi: 'The 11th tithi — sacred to Vishnu. A day of fasting, japa and lightness; the mind turns easily inward.',
  purnima: 'The full moon — high tide of the mind and emotions. Ideal for meditation, charity and satsang.',
  amavasya: 'The new moon — a dark, inward day for ancestral remembrance (tarpana) and quiet rest.',
  pradosh: 'The 13th tithi at dusk — sacred to Shiva. Worship in the twilight hour dissolves obstacles.',
  chaturthi: 'The 4th tithi of Krishna paksha — sacred to Ganesha, remover of obstacles.',
  ashtami: 'The 8th tithi — often kept for the Divine Mother (Durga Ashtami).',
};
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const relative = (n: number) => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `in ${n} days`;

export default function VratCalendarTool() {
  const [place, setPlace] = usePreferredPlace();
  const [remind, setRemind] = useState<Record<string, boolean>>({});
  const [vrats, setVrats] = useState<Vrat[] | null>(null);
  const today = dateInZone(Date.now(), place.zone);
  const sky = useMemo(() => skyAt(Date.now()), []);

  // Six weeks of sunrise, sunset, moonrise and tithi searches: run just after the page paints.
  useEffect(() => {
    setVrats(null);
    const id = window.setTimeout(() => setVrats(vratsBetween(today, 45, place)), 0);
    return () => window.clearTimeout(id);
  }, [today, place]);

  const next = vrats?.[0];
  const toggle = (id: string) => setRemind((r) => ({ ...r, [id]: !r[id] }));
  const key = (v: Vrat) => `${v.kind}-${v.paksha}-${v.date}`;

  return (
    <div className="space-y-8">
      {/* the sky right now */}
      <Card className="overflow-hidden p-0">
        <div className="grid items-center gap-6 p-6 sm:grid-cols-[auto,1fr] sm:p-8"
          style={{ background: 'radial-gradient(120% 140% at 15% 0%, rgba(139,92,246,0.10), transparent 60%)' }}>
          <div className="mx-auto grid place-items-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <MoonPhase phase={sky.moonPhase} size={128} />
            </motion.div>
          </div>
          <div>
            <span className="eyebrow">The sky now</span>
            <h3 className="mt-1 font-heading text-h3 text-white">{sky.tithi.name}</h3>
            <p className="mt-1 text-sm text-white/60">
              {sky.tithi.paksha === 'Shukla' ? 'Waxing' : 'Waning'} moon · Moon in <b className="text-white/80">{sky.nakshatra}</b> nakshatra
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
              The Hindu day is measured by the Moon’s dance with the Sun. Each lunar day (tithi) carries a mood — some for fasting and
              inwardness, some for celebration. Here are the sacred days rising over the next six weeks.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <PlaceSearch id="vrat-place" label="Dates for" value={place} onChange={setPlace} className="max-w-xl" />
      </Card>

      {/* next big one */}
      {next && (
        <Card className="flex flex-wrap items-center gap-5 p-6">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${KIND_COLOR[next.kind]}1e`, boxShadow: `0 0 24px -6px ${KIND_COLOR[next.kind]}` }}>
            {KIND_ICON[next.kind]}
          </div>
          <div className="min-w-0 flex-1">
            <span className="eyebrow">Next observance</span>
            <p className="font-heading text-h4 text-white">{next.name}</p>
            <p className="text-sm text-white/55">{formatIsoDate(next.date, { weekday: 'long', day: 'numeric', month: 'long' })} · {relative(daysBetween(today, next.date))}</p>
          </div>
          <Badge tone="gold">{relative(daysBetween(today, next.date))}</Badge>
        </Card>
      )}

      {/* list */}
      <div>
        <h3 className="eyebrow flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Next 45 days</h3>
        {vrats === null && <p className="mt-4 text-sm text-white/60" role="status">Working out the dates…</p>}
        <div className="mt-4 space-y-3">
          <AnimatePresence>
            {(vrats ?? []).map((v, i) => {
              const id = key(v);
              const n = daysBetween(today, v.date);
              return (
                <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                  <Card className="flex items-center gap-4 p-4 sm:p-5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `${KIND_COLOR[v.kind]}18` }}>
                      {KIND_ICON[v.kind]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">{v.name}</p>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLOR[v.kind] }} />
                        <span className="text-xs text-white/45">{formatIsoDate(v.date)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{KIND_NOTE[v.kind]}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`text-xs font-medium ${n <= 1 ? 'text-gold-300' : 'text-white/60'}`}>{relative(n)}</span>
                      <button onClick={() => toggle(id)} aria-label="Toggle reminder"
                        className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${remind[id] ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/40 hover:text-white/70'}`}>
                        {remind[id] ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/60">
          <Moon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Dates are for {place.label}, from tithi end times: Ekadashi, Purnima, Amavasya and Ashtami by the tithi at sunrise,
            Pradosh by the tithi in the 2 h 24 min after sunset, and Sankashti Chaturthi by the tithi at moonrise. Some
            traditions use other rules (for example the Vaishnava rule for Ekadashi), which can move a date by a day, so
            confirm important vrats with your own panchang. The bell markers last only while this page is open and do not
            send notifications.
          </span>
        </p>
        <MethodLine kind="day" className="mt-2" />
      </div>
    </div>
  );
}
