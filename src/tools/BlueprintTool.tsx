import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, ArrowRight, Lock } from 'lucide-react';
import { computeBlueprint, type NumResult } from '@/lib/numerology';
import {
  buildLoshuChart, kuaNumber, effectiveCounts, repetitionMeaning, MISSING_REMEDIES, LOSHU_NUMBERS,
} from '@/data/loshu';
import { LoshuGrid } from '@/components/loshu/LoshuGrid';
import {
  NUMBER_COLORS, STRENGTH, WEAKNESS, LUCKY_COLORS, LUCKY_NUMBERS, CYCLE,
} from '@/data/predictions';
import { Input, Select } from '@/components/ui/Field';
import { Card } from '@/components/ui/Card';
import { ShareBar } from '@/components/ShareBar';
import { useShareResult } from '@/contexts/ShareContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const NOW = new Date().getFullYear();
const YEARS = Array.from({ length: 110 }, (_, i) => NOW - i);
const pad = (n: number) => String(n).padStart(2, '0');

function useCountUp(target: number, dur = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

export default function BlueprintTool() {
  const [name, setName] = useState('');
  const [day, setDay] = useState(''); const [month, setMonth] = useState(''); const [year, setYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [submitted, setSubmitted] = useState<{ name: string; d: number; m: number; y: number; gender: 'male' | 'female' } | null>(null);
  const ready = name.trim().length > 1 && day && month && year;

  const data = useMemo(() => {
    if (!submitted) return null;
    const bp = computeBlueprint(submitted.name, submitted.d, submitted.m, submitted.y);
    const iso = `${submitted.y}-${pad(submitted.m)}-${pad(submitted.d)}`;
    const chart = buildLoshuChart(iso);
    const kua = kuaNumber(submitted.y, submitted.gender);
    return { bp, chart, kua };
  }, [submitted]);

  useShareResult(data ? `My Life Path is ${data.bp.lifePath.value} — ${LOSHU_NUMBERS[data.bp.lifePath.root]?.keyword} ✨` : null);

  if (!data || !submitted) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-400/10 text-gold-300"><Sparkles className="h-6 w-6" /></span>
            <h2 className="font-heading text-h3 text-white">Your Numerology Blueprint</h2>
            <p className="mt-1 text-sm text-white/55">Enter your full birth name and date to reveal your core numbers.</p>
          </div>
          <div className="space-y-4">
            <Input id="bp-name" label="Full birth name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lakshay Sharma" />
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Date of birth</label>
              <div className="grid grid-cols-3 gap-3">
                <Select aria-label="Day" value={day} onChange={(e) => setDay(e.target.value)}>
                  <option value="">Day</option>{Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
                <Select aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
                  <option value="">Month</option>{MONTHS.map((mn, i) => <option key={mn} value={i + 1}>{mn}</option>)}
                </Select>
                <Select aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Year</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Gender <span className="text-white/40">(for Kua number)</span></label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map((g) => (
                  <button key={g} onClick={() => setGender(g)} data-sound="tap"
                    className={`rounded-xl border py-2.5 text-sm capitalize transition-all ${gender === g ? 'border-gold-400/60 bg-gold-400/10 text-gold-200' : 'border-white/12 text-white/60'}`}>{g}</button>
                ))}
              </div>
            </div>
            <button
              disabled={!ready}
              onClick={() => setSubmitted({ name: name.trim(), d: +day, m: +month, y: +year, gender })}
              data-sound="bowl"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 py-4 font-heading text-lg font-semibold text-white shadow-glow-cyan transition-all hover:-translate-y-0.5 hover:shadow-glow-gold disabled:translate-y-0 disabled:opacity-40">
              SEE MY NUMBERS <ArrowRight className="h-5 w-5" />
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/40">
              <Lock className="h-3 w-3" /> Nothing is stored or saved.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const { bp, chart, kua } = data;
  const cores: { key: string; label: string; sub: string; n: NumResult }[] = [
    { key: 'lp', label: 'Life Path', sub: 'who you are', n: bp.lifePath },
    { key: 'ex', label: 'Expression', sub: 'your potential', n: bp.expression },
    { key: 'su', label: 'Soul Urge', sub: 'your desire', n: bp.soulUrge },
    { key: 'pe', label: 'Personality', sub: 'how others see you', n: bp.personality },
    { key: 'bd', label: 'Birthday', sub: 'a special gift', n: bp.birthday },
    { key: 'py', label: `Personal Year ${NOW}`, sub: 'your current cycle', n: bp.personalYear },
  ];
  const loshuCores: { key: string; label: string; sub: string; n: NumResult }[] = [
    { key: 'mulank', label: 'Mulank', sub: 'driver · core nature', n: { value: chart.driver, root: chart.driver, master: false, raw: chart.driver } },
    { key: 'bhagyank', label: 'Bhagyank', sub: 'conductor · destiny', n: { value: chart.conductor, root: chart.conductor, master: false, raw: chart.conductor } },
    { key: 'kua', label: 'Kua Number', sub: 'auspicious direction', n: { value: kua, root: kua, master: false, raw: kua } },
  ];
  const lp = bp.lifePath.root;

  const eff = effectiveCounts(chart.counts, chart.driver, chart.conductor, kua);
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !(eff[n] > 0));
  const repeated = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (chart.counts[n] || 0) >= 2);

  return (
    <div className="space-y-10">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">✦ Blueprint for</p>
          <h2 className="font-heading text-h2 text-gradient-gold">{submitted.name}</h2>
          <p className="text-sm text-white/50">{submitted.d} {MONTHS[submitted.m - 1]} {submitted.y}</p>
        </div>
        <button onClick={() => setSubmitted(null)} data-sound="tone"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
          <RotateCcw className="h-4 w-4" /> Recalculate
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-3.5">
        <p className="text-sm text-white/60">Share your result</p>
        <ShareBar
          url={window.location.href}
          title="Numerology Blueprint · VediCosmic"
          text={`My Life Path is ${bp.lifePath.value} — ${LOSHU_NUMBERS[lp]?.keyword} ✨`}
          className="ml-auto"
        />
      </div>

      {/* core number orbs */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {cores.map((c, i) => <NumberOrb key={c.key} label={c.label} sub={c.sub} n={c.n} delay={i * 0.08} />)}
      </div>

      {/* Lo Shu core numbers — Mulank, Bhagyank & Kua, shown up top just like Life Path etc. */}
      <div>
        <p className="mb-4 text-xs uppercase tracking-wider text-white/35">From your Lo Shu Grid</p>
        <div className="grid grid-cols-3 gap-6 sm:max-w-lg">
          {loshuCores.map((c, i) => <NumberOrb key={c.key} label={c.label} sub={c.sub} n={c.n} delay={0.5 + i * 0.08} />)}
        </div>
      </div>

      {/* wheel + lo shu */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-2 font-heading text-h5 text-white">Core Number Wheel</h3>
          <p className="mb-4 text-xs text-white/45">Each spoke scales with the strength of that number.</p>
          <CoreWheel items={cores.map((c) => ({ label: c.label, root: c.n.root }))} />
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 font-heading text-h5 text-white">Lo Shu Grid</h3>
          <p className="mb-4 text-xs text-white/45">
            Your birth-date digits, with Mulank · Bhagyank · Kua highlighted. Hover a cell for its meaning —
            complete rows, columns and diagonals light up as arrows.
          </p>
          <LoshuGrid counts={chart.counts} driver={chart.driver} conductor={chart.conductor} kua={kua} />
        </Card>
      </div>

      {/* missing numbers + remedies, amplified energies */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-1 font-heading text-h5 text-white">
            {missing.length ? 'Missing Numbers & Remedies' : 'A Fully Present Grid'}
          </h3>
          <p className="mb-4 text-xs text-white/45">
            {missing.length
              ? 'Energies your chart doesn\'t naturally carry — gentle, practical ways to work with each.'
              : 'Every number 1–9 appears at least once, including your Mulank, Bhagyank and Kua — a rare, well-rounded chart.'}
          </p>
          {missing.length > 0 && (
            <div className="space-y-2.5">
              {missing.map((n) => (
                <motion.div key={n} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-dashed border-white/25 text-sm font-bold text-white/50">
                    {n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80">{LOSHU_NUMBERS[n].planet} — {LOSHU_NUMBERS[n].keyword}</p>
                    <p className="mt-1 text-xs leading-snug text-white/55">{MISSING_REMEDIES[n]}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="mb-1 font-heading text-h5 text-white">Amplified Energies</h3>
          <p className="mb-4 text-xs text-white/45">Numbers repeated in your birth date carry an intensified charge.</p>
          {repeated.length > 0 ? (
            <div className="space-y-2.5">
              {repeated.map((n) => (
                <motion.div key={n} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-lg text-sm font-bold text-[#1a1330]"
                    style={{ background: LOSHU_NUMBERS[n].color }}>{n}</span>
                  <p className="text-sm leading-snug text-white/65">{repetitionMeaning(n, chart.counts[n])}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">No number repeats in your birth date — a balanced, evenly-distributed chart.</p>
          )}
        </Card>
      </div>

      {/* insights */}
      <div className="grid gap-5 md:grid-cols-2">
        <InsightCard title={`Life Path ${bp.lifePath.value} — strengths`} color={NUMBER_COLORS[lp]} body={STRENGTH[lp]} />
        <InsightCard title="Growth edge" color={NUMBER_COLORS[lp]} body={WEAKNESS[lp]} />
        <InsightCard title={`Personal Year ${bp.personalYear.value}`} color={NUMBER_COLORS[bp.personalYear.root]} body={CYCLE[bp.personalYear.root]} />
        <LuckyCard root={lp} />
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/35">
        <Lock className="h-3 w-3" /> Computed in your browser. Nothing is stored or saved.
      </p>
    </div>
  );
}

function NumberOrb({ label, sub, n, delay }: { label: string; sub: string; n: NumResult; delay: number }) {
  const color = NUMBER_COLORS[n.root];
  const val = useCountUp(n.value, 1100);
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, type: 'spring', stiffness: 180, damping: 16 }}
      className="flex flex-col items-center text-center">
      <div className="relative grid h-24 w-24 place-items-center rounded-full sm:h-28 sm:w-28"
        style={{ background: `radial-gradient(circle at 40% 35%, ${color}, ${color}aa 72%)`, boxShadow: `0 0 40px -8px ${color}` }}>
        <span className="font-display text-4xl font-bold text-white drop-shadow sm:text-5xl">{val}</span>
        {n.master && <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-0.5 text-[0.6rem] font-bold text-cosmic-darker">/{n.root}</span>}
      </div>
      <p className="mt-3 font-heading text-sm text-white">{label}</p>
      <p className="text-xs text-white/45">{sub}</p>
    </motion.div>
  );
}

function CoreWheel({ items }: { items: { label: string; root: number }[] }) {
  const cx = 150, cy = 150, R = 118;
  return (
    <svg viewBox="0 0 300 300" className="mx-auto h-auto w-full max-w-[330px]" role="img" aria-label="Radial chart of your core numbers">
      {[42, 80, 118].map((r) => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" />)}
      {items.map((it, i) => {
        const ang = (-90 + i * (360 / items.length)) * (Math.PI / 180);
        const len = 42 + (it.root / 9) * 76;
        const x = cx + Math.cos(ang) * len, y = cy + Math.sin(ang) * len;
        const lx = cx + Math.cos(ang) * (R + 16), ly = cy + Math.sin(ang) * (R + 16);
        const color = NUMBER_COLORS[it.root];
        return (
          <g key={it.label}>
            <motion.line x1={cx} y1={cy} stroke={color} strokeWidth={3.5} strokeLinecap="round"
              initial={{ x2: cx, y2: cy, opacity: 0 }} animate={{ x2: x, y2: y, opacity: 1 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            <motion.circle cx={x} cy={y} r={8} fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 240 }} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
            <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="#0A0A1A">{it.root}</text>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="rgba(255,255,255,0.55)">{it.label}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={5} fill="#fff" opacity={0.6} />
    </svg>
  );
}


function InsightCard({ title, body, color }: { title: string; body: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <Card className="h-full p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <h4 className="font-heading text-sm text-white">{title}</h4>
        </div>
        <p className="text-sm leading-relaxed text-white/65">{body}</p>
      </Card>
    </motion.div>
  );
}

function LuckyCard({ root }: { root: number }) {
  const colors = LUCKY_COLORS[root]; const nums = LUCKY_NUMBERS[root];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <Card className="h-full p-5">
        <h4 className="mb-3 font-heading text-sm text-white">Lucky colours & numbers</h4>
        <div className="flex flex-wrap items-center gap-2">
          {colors.lucky.map((c) => (
            <span key={c.n} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/70">
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.hex }} /> {c.n}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {nums.friend.map((n) => (
            <span key={n} className="grid h-7 w-7 place-items-center rounded-lg text-sm font-semibold text-cosmic-darker" style={{ background: NUMBER_COLORS[n] }}>{n}</span>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
