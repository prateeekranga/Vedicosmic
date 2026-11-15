import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Smartphone } from 'lucide-react';
import {
  analyseMobile, normalizeMobile, parseISODate, relationTone, type YMD,
  type CompatibilityLevel, type Digit, type MobilePair, type MobileResult, type PairImpact, type PairRelation,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LEVEL_LABEL, LEVEL_NEEDS_BIRTH, LEVEL_TEXT, ROOT_FIT_TEXT, SAME_ROOT_TEXT, TONE_LABEL } from '@/data/numerology/mobileText';
import { IMPACT_LABEL, IMPACT_NOTE, RAJ_YOG_NOTE, YOGA_LABEL, pairReading } from '@/data/numerology/mobilePairText';
import { mobilePrint } from '@/lib/print/numerologyPrint';
import { localDateKey } from '@/engine/time';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { DateSelect } from '@/components/ui/DateSelect';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const H3 = 'mb-3 font-heading text-h5 text-white';
const TONE_BADGE = { supportive: 'success', mixed: 'neutral', challenging: 'warning' } as const;
const IMPACT_BADGE: Record<PairImpact, 'success' | 'cyan' | 'error'> = { benefic: 'success', neutral: 'cyan', malefic: 'error' };
const IMPACT_BAR: Record<PairImpact, string> = { benefic: 'bg-success', neutral: 'bg-brand-cyan', malefic: 'bg-error' };
const IMPACTS: readonly PairImpact[] = ['benefic', 'neutral', 'malefic'];
/** The meter takes the colour of its level; the level is always written beside it as well. */
const LEVEL_COLOUR: Record<CompatibilityLevel, string> = { 5: '#34D399', 4: '#34D399', 3: '#39B7F0', 2: '#FBBF24', 1: '#F87171' };

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const planetOf = (d: number) => (d === 0 ? 'Zero' : NUMBERS[d as Digit].planet);
const pairPlanets = (p: MobilePair) => (p.pair[0] === p.pair[1] ? `${planetOf(p.pair[0])}, doubled` : `${planetOf(p.pair[0])} and ${planetOf(p.pair[1])}`);

export default function MobileNumerologyTool() {
  const [number, setNumber] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<MobileResult | null>(null);
  /** The date of birth the result was read with, which can differ from the field once edited. */
  const [resultDob, setResultDob] = useState<YMD | null>(null);
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const analyse = () => {
    if (!normalizeMobile(number).valid) {
      setError('Please enter a phone number of 7 to 15 digits.');
      setResult(null);
      return;
    }
    setError('');
    const date = dob ? parseISODate(dob) : null;
    setResult(analyseMobile(number, date ? { date } : undefined));
    setResultDob(date);
  };

  useEffect(() => { if (result) heading.current?.focus(); }, [result]);

  const printable = useMemo(() => (result ? mobilePrint(result, resultDob, parseISODate(localDateKey())!) : null), [result, resultDob]);

  const fit = result?.withBirth ?? null;
  const level = fit?.compatibility.level ?? null;
  const levelWords = level ? `${LEVEL_LABEL[level]}, level ${level} of 5` : '';

  useShareResult(result
    ? `The mobile number I checked has the root number ${result.root} (${NUMBERS[result.root].planet})${level ? `. Compatibility with my date of birth: ${levelWords}` : ''}.`
    : null);

  const save = () => {
    if (!result) return;
    saveReading({
      toolId: 'mobile-numerology', toolName: 'Mobile Number Numerology',
      summary: `Root ${result.root} (${NUMBERS[result.root].planet}) · digit total ${result.total}${level ? ` · compatibility ${levelWords}` : ''}`,
    });
    notify('Result saved on this device');
  };

  const info = result ? NUMBERS[result.root] : null;
  const max = result ? Math.max(...result.frequency, 1) : 1;

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Input id="mobile-number" label="Mobile number" type="tel" inputMode="tel" autoComplete="off"
            placeholder="e.g. 98765 43210" value={number} error={error || undefined}
            aria-describedby="mobile-help" onChange={(e) => setNumber(e.target.value)} />
          <DateSelect value={dob} onChange={setDob} label="Your date of birth (for the compatibility level)" />
        </div>
        <p id="mobile-help" className="mt-3 text-xs leading-relaxed text-white/55">
          A leading +91 or 0 is left out, since every number in the country shares it. Add your date of birth to get the number’s compatibility level with your Mulank and Bhagyank. The number is not sent to us.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={analyse} disabled={!number.trim()}>
            <Smartphone className="mr-2 h-4 w-4" /> Read this number
          </Button>
          {result && (
            <Button variant="ghost" onClick={() => { setResult(null); setNumber(''); setDob(''); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start again
            </Button>
          )}
        </div>
      </Card>

      {result && info && (
        <div className="space-y-10">
          <section>
            <h3 ref={heading} tabIndex={-1} className={`${H3} outline-none`}>The number’s root</h3>
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-5">
                <span className="grid h-20 min-w-20 place-items-center rounded-2xl px-3 font-display text-4xl font-bold"
                  style={{ background: info.colour.fill, color: info.colour.ink }}>{result.root}</span>
                <div>
                  <p className="font-heading text-h4 text-white">Root {result.root} · {info.planet} · {info.keyword}</p>
                  <p className="mt-1 text-sm text-white/60">The digits add to {result.total}.</p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-body leading-relaxed text-white/75">{info.strength}</p>
            </Card>
          </section>

          <section>
            <h3 className={H3}>Compatibility with your date of birth</h3>
            {fit && level ? (
              <>
                <Card className="p-6 sm:p-8">
                  <div data-testid="mobile-compatibility">
                  <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/55">Compatibility level</p>
                      <p className="mt-1 font-heading text-h3 text-white">
                        {LEVEL_LABEL[level]} <span className="whitespace-nowrap font-sans text-base font-normal text-white/65">· level {level} of 5</span>
                      </p>
                    </div>
                    <LevelMeter level={level} animate={!reducedMotion} />
                  </div>
                  <p className="mt-5 max-w-3xl text-body leading-relaxed text-white/75">{LEVEL_TEXT[level]}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
                    Root {result.root} ({info.planet}) is compared with your Mulank {fit.driver} ({NUMBERS[fit.driver].planet}) and your Bhagyank {fit.conductor} ({NUMBERS[fit.conductor].planet}).
                    The two comparisons score {signed(fit.compatibility.driverPoints)} and {signed(fit.compatibility.conductorPoints)}, a total of {signed(fit.compatibility.points)} on a scale from −4 to +4.
                  </p>
                  </div>
                </Card>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Fit label={`Mulank (Driver) ${fit.driver}`} own={fit.driver} root={result.root} relation={fit.rootToDriver} points={fit.compatibility.driverPoints} />
                  <Fit label={`Bhagyank (Conductor) ${fit.conductor}`} own={fit.conductor} root={result.root} relation={fit.rootToConductor} points={fit.compatibility.conductorPoints} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {fit.suppliesMissing.length
                    ? `This number contains ${fit.suppliesMissing.join(', ')}, which ${fit.suppliesMissing.length === 1 ? 'is' : 'are'} missing from your Lo Shu grid. Some teachers count that in a number’s favour.`
                    : 'This number contains none of the numbers missing from your Lo Shu grid.'}
                </p>
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm leading-relaxed text-white/70">{LEVEL_NEEDS_BIRTH}</p>
            )}
          </section>

          <section>
            <h3 className={H3}>How often each digit appears</h3>
            <table className="w-full max-w-xl text-sm">
              <caption className="sr-only">How many times each digit from 0 to 9 appears in the number</caption>
              <thead className="sr-only"><tr><th scope="col">Digit</th><th scope="col">Times</th></tr></thead>
              <tbody>
                {result.frequency.map((count, digit) => (
                  <tr key={digit}>
                    <th scope="row" className="w-8 py-1 text-left font-heading text-base text-white">{digit}</th>
                    <td className="py-1">
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className="h-2.5 rounded-full bg-brand-cyan/70" style={{ width: `${(count / max) * 70}%`, minWidth: count ? '0.5rem' : 0 }} />
                        <span className="text-white/75">{count === 0 ? 'not present' : count === 1 ? 'once' : `${count} times`}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.heavy.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Appearing three times or more: {result.heavy.map((h) => `${h.digit} (${h.count} times)`).join(', ')}. A heavily repeated digit is read as that planet’s theme sounding strongly in the number.
              </p>
            )}
          </section>

          <section>
            <h3 className={H3}>Two-digit combinations</h3>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
              Every pair of neighbouring digits, in the order it appears, read against the two-digit combination chart of Indian mobile numerology.
            </p>
            <div className="mb-4 max-w-xl" data-testid="mobile-pair-tally">
              <p className="text-sm text-white/75">
                {result.pairs.length} {result.pairs.length === 1 ? 'combination' : 'combinations'}: {IMPACTS.map((k) => `${result.pairTally[k]} ${IMPACT_LABEL[k].toLowerCase()}`).join(', ')}.
              </p>
              <div aria-hidden="true" className="mt-2 flex h-2.5 gap-0.5 overflow-hidden rounded-full">
                {IMPACTS.filter((k) => result.pairTally[k] > 0).map((k) => (
                  <span key={k} className={IMPACT_BAR[k]} style={{ flexGrow: result.pairTally[k], flexBasis: 0 }} />
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <table className="w-full text-left text-sm" data-testid="mobile-pairs">
                <caption className="sr-only">Each pair of neighbouring digits, how the chart classes it, and its reading</caption>
                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/55">
                  <tr>
                    <th scope="col" className="p-3 font-medium sm:pl-5">Pair</th>
                    <th scope="col" className="hidden p-3 font-medium sm:table-cell">Impact</th>
                    <th scope="col" className="p-3 font-medium sm:pr-5">Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {result.pairs.map((p, i) => {
                    const badges = (
                      <>
                        <Badge tone={IMPACT_BADGE[p.impact]}>{IMPACT_LABEL[p.impact]}</Badge>
                        {p.yoga && <Badge tone="gold">{YOGA_LABEL[p.yoga]}</Badge>}
                      </>
                    );
                    return (
                      <motion.tr key={p.pair.join('')} className="border-b border-white/5 align-top last:border-0"
                        initial={reducedMotion ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: reducedMotion ? 0 : i * 0.04, duration: 0.25 }}>
                        <th scope="row" className="p-3 text-left font-normal sm:w-44 sm:pl-5">
                          <span className="block font-heading text-2xl leading-none text-white">{p.pair.join('')}</span>
                          <span className="mt-1 block text-xs text-white/60">{pairPlanets(p)}</span>
                          {p.count > 1 && <span className="block text-xs text-white/60">appears {p.count} times</span>}
                          {/* On a narrow screen the class sits under the pair; from 640px it has its own column. */}
                          <span className="mt-2 flex flex-col items-start gap-1 sm:hidden">{badges}</span>
                        </th>
                        <td className="hidden p-3 sm:table-cell sm:w-36">
                          <span className="flex flex-col items-start gap-1">{badges}</span>
                        </td>
                        <td className="p-3 leading-relaxed text-white/75 sm:pr-5">{pairReading(p.pair[0], p.pair[1])}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {result.rajYog && (
              <p className="mt-3 rounded-xl border border-gold-soft/30 bg-gold-bright/[0.07] p-4 text-sm leading-relaxed text-white/80" data-testid="mobile-raj-yog">
                <span className="font-medium text-gold-pale">Raj yog.</span> {result.rajYog.weakenedByEight ? RAJ_YOG_NOTE.weakened : RAJ_YOG_NOTE.clear}
              </p>
            )}
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-white/55">{IMPACT_NOTE}</p>
          </section>

          <section className="space-y-4">
            <HowCalculated steps={result.steps} />
            <NumerologyMethodLine method="The digits are added down to a root; the compatibility level follows the traditional friendships between the planets; pairs follow the two-digit combination chart." />
            <ResultActions toolSlug="mobile-numerology" onSave={save} />
          </section>

          {printable && <PrintReport report={printable} />}
        </div>
      )}
    </div>
  );
}

/** Five steps, filled up to the level. The level is written in words beside it, so the meter adds nothing a reader needs. */
function LevelMeter({ level, animate }: { level: CompatibilityLevel; animate: boolean }) {
  return (
    <div role="img" aria-label={`Level ${level} of 5`} className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((step) => (
        <span key={step} className="h-3 w-9 overflow-hidden rounded-full bg-white/10 sm:w-11">
          {step <= level && (
            <motion.span className="block h-full w-full origin-left rounded-full" style={{ background: LEVEL_COLOUR[level] }}
              initial={animate ? { scaleX: 0 } : false} animate={{ scaleX: 1 }}
              transition={{ delay: animate ? 0.15 + step * 0.12 : 0, duration: 0.35, ease: 'easeOut' }} />
          )}
        </span>
      ))}
    </div>
  );
}

function Fit({ label, own, root, relation, points }: { label: string; own: Digit; root: Digit; relation: PairRelation; points: number }) {
  const same = own === root;
  const tone = same ? 'supportive' : relationTone(relation.mutual);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-medium text-white">{label}</h4>
        <Badge tone={TONE_BADGE[tone]}>{TONE_LABEL[tone]} · {signed(points)}</Badge>
      </div>
      <p className="mt-1 text-xs text-white/55">{NUMBERS[root].planet} with {NUMBERS[own].planet}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{same ? SAME_ROOT_TEXT : ROOT_FIT_TEXT[relation.mutual]}</p>
    </div>
  );
}
