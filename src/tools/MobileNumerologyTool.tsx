import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Sparkles } from 'lucide-react';
import { analyseMobile, lifePathNum, type MobileResult, type MobileCombinationHit } from '@/lib/numerology';
import { NUMBER_MEANINGS } from '@/data/numerology';
import type { CombinationImpact } from '@/data/mobileCombinations';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { DateSelect } from '@/components/ui/DateSelect';

const VERDICT_TONE: Record<MobileResult['verdict'], 'success' | 'warning' | 'cyan'> = {
  'Highly Auspicious': 'success',
  Neutral: 'cyan',
  Challenging: 'warning',
};

const IMPACT_TONE: Record<CombinationImpact, 'success' | 'error' | 'cyan'> = {
  Benefic: 'success',
  Malefic: 'error',
  Neutral: 'cyan',
};

export default function MobileNumerologyTool() {
  const [number, setNumber] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<MobileResult | null>(null);

  // Life Path is calculated automatically from the date of birth — no manual entry.
  const lifePath = useMemo(() => {
    if (!dob) return null;
    const [y, m, d] = dob.split('-').map(Number);
    return lifePathNum(d, m, y);
  }, [dob]);

  const analyse = () => {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 6) return;
    setResult(analyseMobile(number, lifePath?.root));
  };

  const meaning = result ? NUMBER_MEANINGS[result.root] : null;
  const maxCount = result ? Math.max(...result.frequency.map((f) => f.count), 1) : 1;

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          Every phone number carries a vibration — the single-digit root of all its digits. Discover your number's
          frequency, how well it harmonises with your own Life Path, and what each adjacent pair of digits means
          under the classical Two-Digit Combination chart.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="mob-num" label="Mobile number" inputMode="numeric" placeholder="e.g. 98765 43210"
            value={number} onChange={(e) => setNumber(e.target.value)} />
          <DateSelect value={dob} onChange={setDob} label="Your date of birth (optional, for Life Path)" />
        </div>
        {lifePath && (
          <p className="mt-3 text-xs text-white/45">
            Life Path {lifePath.value}{lifePath.master && <span className="text-white/30"> (root {lifePath.root})</span>} —
            calculated automatically from your date of birth.
          </p>
        )}
        <Button className="mt-6" onClick={analyse} disabled={number.replace(/\D/g, '').length < 6}>
          <Smartphone className="h-4 w-4" /> Analyse frequency
        </Button>
      </Card>

      <AnimatePresence mode="wait">
        {result && meaning && (
          <motion.div key="r" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6">
            <Card className="flex flex-col items-center gap-4 p-8 text-center">
              <Badge tone={VERDICT_TONE[result.verdict]}>{result.verdict}</Badge>
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                className="font-display text-7xl text-gradient-gold">{result.root}</motion.div>
              <p className="text-sm text-white/50">Digit sum {result.total} reduces to root {result.root}</p>
              <h3 className="font-heading text-h3 text-white">{meaning.name}</h3>
              <p className="max-w-lg text-sm leading-relaxed text-white/65">{meaning.strengths}</p>
              {result.compatibility != null && (
                <div className="mt-2 w-full max-w-xs">
                  <div className="mb-1 flex justify-between text-xs text-white/50">
                    <span>Compatibility with your Life Path {lifePath?.value}</span><span>{result.compatibility}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-cyan-sheen"
                      initial={{ width: 0 }} animate={{ width: `${result.compatibility}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }} />
                  </div>
                </div>
              )}
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <span className="eyebrow">Digit frequency</span>
                <div className="mt-4 flex items-end justify-between gap-1.5" style={{ height: 120 }}>
                  {result.frequency.map((f, i) => (
                    <div key={f.digit} className="flex flex-1 flex-col items-center gap-1">
                      <motion.div className="w-full rounded-t bg-gradient-to-t from-brand-cyan/40 to-brand-cyan"
                        initial={{ height: 0 }} animate={{ height: `${(f.count / maxCount) * 90}px` }}
                        transition={{ delay: i * 0.04, duration: 0.5 }} style={{ minHeight: f.count ? 4 : 0 }} />
                      <span className="text-[10px] text-white/40">{f.digit}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <span className="eyebrow">Patterns & notes</span>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <li className="flex justify-between"><span>Cleaned number</span><span className="font-mono text-white/90">{result.cleaned}</span></li>
                  <li className="flex justify-between"><span>Ruling planet</span><span className="text-white/90">{meaning.planet}</span></li>
                  <li className="flex justify-between"><span>Two-digit combinations</span><span className="text-white/90">{result.combinations.length} found below</span></li>
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-white/45">
                  This is a reflective tool, not a directive one. A “challenging” root simply asks for more conscious
                  intention — no number is inherently lucky or unlucky.
                </p>
              </Card>
            </div>

            {result.combinations.length > 0 && (
              <Card className="p-0">
                <div className="p-6 pb-0">
                  <span className="eyebrow">Two-Digit Combination Analysis</span>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">
                    Every adjacent pair of digits in your number, read against the classical chart — each pairing
                    carries its own blend of the two ruling planets involved.
                  </p>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                      <tr>
                        <th className="p-3 pl-6">Two Digit Combo</th>
                        <th className="p-3">Impact</th>
                        <th className="p-3 pr-6">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.combinations.map((c: MobileCombinationHit, i: number) => (
                        <motion.tr key={c.pair} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-white/5 last:border-0">
                          <td className="p-3 pl-6 font-mono text-base font-semibold text-white">{c.pair}</td>
                          <td className="p-3"><Badge tone={IMPACT_TONE[c.impact]}>{c.impact}</Badge></td>
                          <td className="p-3 pr-6 leading-snug text-white/70">{c.result}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="p-6 pt-4 text-xs leading-relaxed text-white/35">
                  A reflective lens, not a directive one — "Malefic" simply flags a pairing worth conscious
                  awareness, not a fixed fate.
                </p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
