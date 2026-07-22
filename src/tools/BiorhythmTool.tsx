import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import { daysAlive, biorhythm } from '@/lib/format';
import { DateSelect } from '@/components/ui/DateSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const PRIMARY = [
  { key: 'physical', label: 'Physical', days: 23, color: '#F87171', desc: 'Strength · energy · coordination' },
  { key: 'emotional', label: 'Emotional', days: 28, color: '#39B7F0', desc: 'Mood · creativity · sensitivity' },
  { key: 'intellectual', label: 'Intellectual', days: 33, color: '#FFD700', desc: 'Focus · memory · reasoning' },
] as const;

const SECONDARY = [
  { key: 'mastery', label: 'Mastery', pair: ['physical', 'intellectual'] as const, color: '#A78BFA', desc: 'Physical + Intellectual, combined' },
  { key: 'passion', label: 'Passion', pair: ['physical', 'emotional'] as const, color: '#F472B6', desc: 'Physical + Emotional, combined' },
  { key: 'wisdom', label: 'Wisdom', pair: ['emotional', 'intellectual'] as const, color: '#34D399', desc: 'Emotional + Intellectual, combined' },
] as const;

const RANGES = [15, 30, 60] as const;

const BENEFIT: Record<string, { pos: string; neg: string }> = {
  physical: { pos: 'more strength, energy and physical coordination than usual', neg: 'your body may want more rest and gentler movement' },
  emotional: { pos: 'more warmth, creativity and emotional openness', neg: 'moods may run more sensitive — be gentle with yourself' },
  intellectual: { pos: 'sharper focus, memory and clear reasoning', neg: 'mental fog is more likely — good day for routine over big decisions' },
  mastery: { pos: 'a strong combination of physical drive and mental clarity', neg: 'both body and mind may feel like they need a slower pace' },
  passion: { pos: 'energy and feeling are aligned — a vivid, engaged day', neg: 'low physical and emotional charge — a quieter day is natural' },
  wisdom: { pos: 'intuition and intellect are working well together', neg: 'feeling and thinking may pull in different directions — reflect before deciding' },
};

function phase(v: number) {
  if (v > 0.7) return { label: 'Peak', tone: 'success' as const };
  if (v > 0.15) return { label: 'Rising', tone: 'cyan' as const };
  if (v > -0.15) return { label: 'Critical', tone: 'warning' as const };
  if (v > -0.7) return { label: 'Low', tone: 'neutral' as const };
  return { label: 'Recharge', tone: 'violet' as const };
}

const W = 700, H = 240, MID = H / 2, AMP = 92;

function Gauge({ value, color, label }: { value: number; color: string; label: string }) {
  const R = 30, C = 2 * Math.PI * R;
  const pct = Math.min(1, Math.abs(value));
  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle cx="40" cy="40" r={R} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C - pct * C }}
          transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-lg leading-none" style={{ color }}>{value >= 0 ? '+' : ''}{Math.round(value * 100)}</div>
        <div className="text-[9px] uppercase tracking-wide text-white/40">{label}</div>
      </div>
    </div>
  );
}

export default function BiorhythmTool() {
  const [dob, setDob] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [range, setRange] = useState<typeof RANGES[number]>(15);
  const [showSecondary, setShowSecondary] = useState(false);
  const [hoverOffset, setHoverOffset] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const baseN = useMemo(() => (dob ? daysAlive(new Date(dob), new Date()) : 0), [dob]);

  const primaryValueAt = (d: number, key: string) => {
    const c = PRIMARY.find((p) => p.key === key)!;
    return biorhythm(baseN + d, c.days);
  };

  const activeCycles = useMemo(() => {
    const primary = PRIMARY.map((c) => ({
      key: c.key, label: c.label, color: c.color, desc: c.desc,
      valueAt: (d: number) => primaryValueAt(d, c.key),
    }));
    if (!showSecondary) return primary;
    const secondary = SECONDARY.map((c) => ({
      key: c.key, label: c.label, color: c.color, desc: c.desc,
      valueAt: (d: number) => (primaryValueAt(d, c.pair[0]) + primaryValueAt(d, c.pair[1])) / 2,
    }));
    return [...primary, ...secondary];
  }, [baseN, showSecondary]);

  const series = useMemo(() => {
    if (!dob) return null;
    return activeCycles.map((c) => {
      const points = Array.from({ length: range * 2 + 1 }, (_, i) => {
        const d = i - range;
        const x = (i / (range * 2)) * W;
        const y = MID - c.valueAt(d) * AMP;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      return { ...c, points, today: c.valueAt(0) };
    });
  }, [dob, activeCycles, range]);

  const criticals = useMemo(() => {
    if (!dob) return [];
    return PRIMARY.map((c) => {
      const half = c.days / 2;
      const rem = ((baseN % half) + half) % half;
      const d = Math.max(1, Math.round(half - rem));
      const date = new Date(); date.setDate(date.getDate() + d);
      return { label: c.label, color: c.color, in: d, date };
    }).sort((a, b) => a.in - b.in);
  }, [dob, baseN]);

  const gridX = Array.from({ length: 7 }, (_, i) => (i / 6) * W);

  const offsetFromClientX = (clientX: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const xFrac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const idx = Math.round(xFrac * (range * 2));
    return idx - range;
  };

  const handleMove = (clientX: number) => setHoverOffset(offsetFromClientX(clientX));
  const handleLeave = () => setHoverOffset(null);

  const hover = useMemo(() => {
    if (hoverOffset == null || !series) return null;
    const date = new Date(); date.setDate(date.getDate() + hoverOffset);
    const readings = series.map((c) => {
      const v = c.valueAt(hoverOffset);
      return { key: c.key, label: c.label, color: c.color, value: v, phase: phase(v) };
    });
    const featured = readings.reduce((a, b) => (Math.abs(b.value) > Math.abs(a.value) ? b : a));
    const trendUp = (() => {
      const cycle = activeCycles.find((c) => c.key === featured.key)!;
      const a = cycle.valueAt(Math.max(-range, hoverOffset - 1));
      const b = cycle.valueAt(Math.min(range, hoverOffset + 1));
      return b >= a;
    })();
    const isCritical = Math.abs(featured.value) < 0.15;
    const benefit = BENEFIT[featured.key];
    const sentence = isCritical
      ? `A Critical Day for ${featured.label} — the cycle is crossing zero, classically a day to move a little more gently and stay self-aware.`
      : `${trendUp ? 'Rising trend' : 'Falling trend'} of a ${featured.value > 0 ? 'Positive' : 'Negative'} phase for ${featured.label} — expect ${featured.value > 0 ? benefit.pos : benefit.neg}.`;
    const xFrac = (hoverOffset + range) / (range * 2);
    return { date, readings, sentence, x: xFrac * W };
  }, [hoverOffset, series, activeCycles, range]);

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/60">
          Biorhythm theory suggests three cycles — physical (23 days), emotional (28 days) and intellectual (33 days) —
          begin at birth and rise and fall like sine waves. Use it as a gentle lens for self-observation, not prediction.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <DateSelect value={dob} onChange={(v) => { setDob(v); setSubmitted(false); }} className="max-w-md" />
          <Button onClick={() => setSubmitted(true)} disabled={!dob}>
            <Activity className="h-4 w-4" /> Plot my rhythms
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {submitted && series && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* today gauges */}
            <div className="grid gap-4 sm:grid-cols-3">
              {series.slice(0, 3).map((c, i) => {
                const p = phase(c.today);
                return (
                  <motion.div key={c.key} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                    <Card className="flex items-center gap-4 p-5">
                      <Gauge value={c.today} color={c.color} label="today" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: c.color }}>{c.label}</span>
                          <Badge tone={p.tone}>{p.label}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-white/45">{c.desc}</p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {showSecondary && (
              <div className="grid gap-4 sm:grid-cols-3">
                {series.slice(3).map((c, i) => {
                  const p = phase(c.today);
                  return (
                    <motion.div key={c.key} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                      <Card className="flex items-center gap-4 p-5">
                        <Gauge value={c.today} color={c.color} label="today" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: c.color }}>{c.label}</span>
                            <Badge tone={p.tone}>{p.label}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-white/45">{c.desc}</p>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* wave chart */}
            <Card className="p-4 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="eyebrow">{range}-day rhythm</span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-1 rounded-full border border-white/10 p-0.5">
                    {RANGES.map((r) => (
                      <button key={r} onClick={() => setRange(r)}
                        className={`rounded-full px-3 py-1 text-xs transition-all ${range === r ? 'bg-gold-400/15 text-gold-200' : 'text-white/50 hover:text-white'}`}>
                        {r}d
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowSecondary((s) => !s)}
                    className={`rounded-full border px-3 py-1 text-xs transition-all ${showSecondary ? 'border-gold-400/50 bg-gold-400/10 text-gold-200' : 'border-white/12 text-white/60 hover:border-white/25'}`}>
                    {showSecondary ? 'Hide' : 'Show'} secondary rhythms
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 pb-3 text-xs">
                {series.map((c) => (
                  <span key={c.key} className="flex items-center gap-1.5 text-white/50">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.label}
                  </span>
                ))}
              </div>
              <div className="relative">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${W} ${H}`}
                  className="h-auto w-full cursor-crosshair touch-none"
                  preserveAspectRatio="none"
                  onMouseMove={(e) => handleMove(e.clientX)}
                  onMouseLeave={handleLeave}
                  onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
                  onTouchEnd={handleLeave}
                >
                  {gridX.map((x, i) => <line key={i} x1={x} y1={12} x2={x} y2={H - 12} stroke="rgba(255,255,255,0.04)" />)}
                  <line x1={0} y1={MID} x2={W} y2={MID} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 5" />
                  <line x1={W / 2} y1={8} x2={W / 2} y2={H - 8} stroke="rgba(255,215,0,0.45)" strokeDasharray="5 4" />
                  {series.map((c, i) => (
                    <motion.polyline key={c.key} points={c.points} fill="none" stroke={c.color} strokeWidth="2.4"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.3, delay: i * 0.15 }} />
                  ))}
                  <circle cx={W / 2} cy={MID} r="3.5" fill="#FFD700" />
                  {hover && (
                    <>
                      <line x1={hover.x} y1={8} x2={hover.x} y2={H - 8} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                      {hover.readings.map((r) => (
                        <circle key={r.key} cx={hover.x} cy={MID - r.value * AMP} r="4" fill={r.color} stroke="#0A0A1A" strokeWidth="1.5" />
                      ))}
                    </>
                  )}
                </svg>

                <AnimatePresence>
                  {hover && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="pointer-events-none absolute top-0 z-10 w-56 rounded-xl border border-white/10 bg-cosmic-dark/95 p-3 text-xs shadow-xl backdrop-blur-md"
                      style={{
                        left: `${Math.min(96, Math.max(4, (hover.x / W) * 100))}%`,
                        transform: (hover.x / W) > 0.7 ? 'translateX(-100%)' : 'none',
                      }}
                    >
                      <p className="mb-2 font-medium text-white/80">
                        {hover.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {hoverOffset === 0 && <span className="ml-1.5 text-gold-soft">(Today)</span>}
                      </p>
                      <div className="space-y-1">
                        {hover.readings.map((r) => (
                          <div key={r.key} className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-white/60"><span className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} />{r.label}</span>
                            <span style={{ color: r.color }}>{r.value >= 0 ? '+' : ''}{Math.round(r.value * 100)}%</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 border-t border-white/10 pt-2 leading-relaxed text-white/55">{hover.sentence}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-white/35">
                <span>−{range}d</span><span className="text-gold-soft">Today</span><span>+{range}d</span>
              </div>
              <p className="mt-2 text-[11px] text-white/30 sm:hidden">Tap and drag across the chart to explore any day.</p>
              <p className="mt-2 hidden text-[11px] text-white/30 sm:block">Hover over the chart to explore any day.</p>
            </Card>

            {/* upcoming critical days */}
            <Card className="p-5 sm:p-6">
              <span className="eyebrow">Next critical days</span>
              <p className="mt-1 mb-4 text-xs text-white/45">
                A cycle is “critical” as it crosses zero — classically a day to move gently and stay aware.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {criticals.map((c) => (
                  <div key={c.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-sm" style={{ color: c.color }}>
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.label}
                    </div>
                    <div className="mt-2 font-display text-2xl text-white">
                      {c.in === 1 ? 'Tomorrow' : `in ${c.in} days`}
                    </div>
                    <div className="text-xs text-white/40">
                      {c.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/30">{baseN.toLocaleString('en-IN')} days alive</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
