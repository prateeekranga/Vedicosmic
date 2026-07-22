import { DateSelect } from '@/components/ui/DateSelect';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, RotateCcw, Bookmark } from 'lucide-react';
import {
  LOSHU_NUMBERS, PLANES, repetitionMeaning, LOSHU_INTRO, MISSING_REMEDIES,
  buildLoshuChart, kuaNumber, effectiveCounts, type LoshuChart,
} from '@/data/loshu';
import { LoshuGrid } from '@/components/loshu/LoshuGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Field';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function LoshuGridTool() {
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'' | 'male' | 'female'>('');
  const [chart, setChart] = useState<LoshuChart | null>(null);
  const [kua, setKua] = useState<number | null>(null);
  const [key, setKey] = useState(0);
  const { user, saveReading } = useAuth();
  const { notify } = useToast();

  const compute = () => {
    if (!dob) return;
    const c = buildLoshuChart(dob);
    setChart(c);
    setKua(gender ? kuaNumber(c.year, gender) : null);
    setKey((k) => k + 1);
  };
  const reset = () => { setChart(null); setKua(null); };

  // Mulank / Bhagyank / Kua fill otherwise-empty cells too, so this list of
  // complete lines always agrees with what the grid itself is showing.
  const eff = useMemo(
    () => (chart ? effectiveCounts(chart.counts, chart.driver, chart.conductor, kua) : {}),
    [chart, kua],
  );

  const planes = useMemo(() => {
    if (!chart) return { present: [] as typeof PLANES, absent: [] as typeof PLANES };
    const has = (n: number) => (eff[n] || 0) > 0;
    return {
      present: PLANES.filter((p) => p.cells.every(has)),
      absent: PLANES.filter((p) => p.cells.every((n) => !has(n))),
    };
  }, [chart, eff]);

  const missing = chart ? [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !(eff[n] > 0)) : [];
  const repeated = chart ? [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (chart.counts[n] || 0) >= 2) : [];

  const save = () => {
    if (!chart) return;
    saveReading({
      toolId: 'loshu-grid',
      toolName: 'Lo Shu Grid',
      summary: `Driver ${chart.driver} (${LOSHU_NUMBERS[chart.driver].planet}) · Conductor ${chart.conductor} (${LOSHU_NUMBERS[chart.conductor].planet}) · Missing: ${missing.length ? missing.join(', ') : 'none'}`,
    });
    notify('Lo Shu chart saved to your journal');
  };

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <p className="mb-6 text-sm leading-relaxed text-white/60">{LOSHU_INTRO}</p>
        <div className="grid gap-4 sm:max-w-md sm:grid-cols-2">
          <DateSelect value={dob} onChange={setDob} />
          <Select id="loshu-gender" label="Gender (for Kua)" value={gender}
            onChange={(e) => setGender(e.target.value as '' | 'male' | 'female')}>
            <option value="">Optional…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={compute} disabled={!dob}>
            <Grid3x3 className="mr-2 h-4 w-4" /> Cast my grid
          </Button>
          {chart && (
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {chart && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid gap-8 lg:grid-cols-[auto_1fr]"
          >
            {/* The chart */}
            <Card className="p-5 sm:p-7">
              <LoshuGrid counts={chart.counts} driver={chart.driver} conductor={chart.conductor} kua={kua} className="max-w-[380px]" />

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {([['Driver · Mulank', chart.driver, '#FFD700', 'M', 'Your core nature, from the birth day'],
                   ['Conductor · Bhagyank', chart.conductor, '#39B7F0', 'B', 'Your destiny, from the whole date'],
                   ...(kua != null ? [['Kua', kua, '#8B5CF6', 'K', 'Your auspicious directions & element'] as const] : [])] as const)
                  .map(([lbl, val, color, letter, blurb]) => {
                    const info = LOSHU_NUMBERS[val];
                    return (
                      <div key={lbl} className="rounded-xl border border-white/10 bg-white/5 p-3.5" style={{ borderColor: `${color}55` }}>
                        <div className="flex items-center gap-2.5">
                          <span className="relative grid h-9 w-9 flex-none place-items-center rounded-lg font-heading text-lg font-bold text-[#1a1330]"
                            style={{ background: info.color, boxShadow: `0 0 0 2px ${color}` }}>
                            {val}
                            <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full text-[0.55rem] font-bold text-[#0A0A1A]" style={{ background: color }}>{letter}</span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-[0.65rem] uppercase tracking-wider text-white/45">{lbl}</p>
                            <p className="truncate text-sm font-medium text-white">{info.planet}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-[0.7rem] leading-snug text-white/45">{blurb}</p>
                      </div>
                    );
                  })}
              </div>

              {user ? (
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={save}>
                  <Bookmark className="mr-2 h-4 w-4" /> Save this chart
                </Button>
              ) : (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('vc:open-auth'))}
                  className="mt-4 w-full rounded-lg border border-white/10 py-2 text-xs text-white/50 transition-colors hover:text-gold-400">
                  Sign in to save your chart
                </button>
              )}
            </Card>

            {/* Interpretation */}
            <div className="space-y-6">
              {planes.present.length > 0 && (
                <div>
                  <h3 className="mb-3 font-heading text-h5 text-white">Arrows of Strength</h3>
                  <div className="space-y-2.5">
                    {planes.present.map((p) => (
                      <motion.div key={p.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                        className="rounded-xl border border-gold-400/25 bg-gold-400/5 p-3.5">
                        <div className="flex items-center gap-2">
                          <Badge tone="gold">{p.cells.join('–')}</Badge>
                          <span className="text-sm font-medium text-gold-300">{p.name}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-snug text-white/65">{p.present}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {repeated.length > 0 && (
                <div>
                  <h3 className="mb-3 font-heading text-h5 text-white">Amplified Energies</h3>
                  <div className="space-y-2">
                    {repeated.map((n) => (
                      <div key={n} className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/4 p-3">
                        <span className="grid h-7 w-7 flex-none place-items-center rounded-md text-sm font-bold text-[#1a1330]"
                          style={{ background: LOSHU_NUMBERS[n].color }}>{n}</span>
                        <p className="text-sm leading-snug text-white/65">{repetitionMeaning(n, chart.counts[n])}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 font-heading text-h5 text-white">
                  {missing.length ? 'Missing Numbers & Remedies' : 'A Fully Present Grid'}
                </h3>
                {missing.length ? (
                  <div className="space-y-2.5">
                    {missing.map((n) => (
                      <div key={n} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                        <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-dashed border-white/25 text-sm font-bold text-white/50">
                          {n}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white/80">{LOSHU_NUMBERS[n].planet} — {LOSHU_NUMBERS[n].keyword}</p>
                          <p className="mt-1 text-xs leading-snug text-white/55">{MISSING_REMEDIES[n]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">Every number 1–9 appears at least once — a rare, well-rounded chart.</p>
                )}
                {planes.absent.length > 0 && (
                  <p className="mt-3 text-xs leading-relaxed text-white/40">
                    Empty lines: {planes.absent.map((p) => p.name).join(' · ')} — gentle areas for conscious growth.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
