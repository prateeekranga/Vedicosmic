import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Smartphone } from 'lucide-react';
import {
  LOSHU_LINES, PURPOSE_WORDS, RELATION_POINTS, analyseMobile, normalizeMobile, pairRelation, parseISODate, relationTone,
  type CalcStep, type CompatibilityLevel, type Digit, type MobilePair, type MobilePerson, type MobilePurpose,
  type MobileResult, type PairImpact, type PairRelation,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import { LINE_TEXT } from '@/data/numerology/loshuText';
import {
  ENDING_INTRO, ENDING_ZERO, GRID_INTRO, GRID_STATUS_LABEL, LEVEL_LABEL, LEVEL_NEEDS_BIRTH, LEVEL_TEXT, NAME_HELP,
  PURPOSE_HELP, PURPOSE_LABEL, ROOT_FIT_TEXT, SAME_ROOT_TEXT, SCORE_PART_LABEL, TONE_LABEL,
} from '@/data/numerology/mobileText';
import {
  IMPACT_LABEL, IMPACT_NOTE, RAJ_YOG_NOTE, YOGA_LABEL, YOGA_NOTE, YOGA_PLANETS, pairReading,
} from '@/data/numerology/mobilePairText';
import { mobilePrint } from '@/lib/print/numerologyPrint';
import { localDateKey } from '@/engine/time';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Field';
import { BirthFields, type GenderChoice } from '@/components/numerology/BirthFields';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { LoShuGrid } from '@/components/numerology/LoShuGrid';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { LEVEL_COLOUR, ReportCard } from '@/components/numerology/mobile/ReportCard';
import { CompareNumbers, NumberChecklist, RootsGrid, formatNumber } from '@/components/numerology/mobile/Choosing';
import { MobileRemedies } from '@/components/numerology/mobile/Remedies';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const H3 = 'mb-3 font-heading text-h5 text-white';
const TONE_BADGE = { supportive: 'success', mixed: 'neutral', challenging: 'warning' } as const;
const IMPACT_BADGE: Record<PairImpact, 'success' | 'cyan' | 'error'> = { benefic: 'success', neutral: 'cyan', malefic: 'error' };
const IMPACT_BAR: Record<PairImpact, string> = { benefic: 'bg-success', neutral: 'bg-brand-cyan', malefic: 'bg-error' };
const IMPACTS: readonly PairImpact[] = ['benefic', 'neutral', 'malefic'];
const PURPOSES: readonly MobilePurpose[] = ['both', 'personal', 'business'];

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const planetOf = (d: number) => (d === 0 ? 'Zero' : NUMBERS[d as Digit].planet);
const pairPlanets = (p: MobilePair) => (p.pair[0] === p.pair[1] ? `${planetOf(p.pair[0])}, doubled` : `${planetOf(p.pair[0])} and ${planetOf(p.pair[1])}`);
const listAnd = (xs: (string | number)[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : String(xs[0] ?? ''));

export default function MobileNumerologyTool() {
  const [number, setNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderChoice>('');
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState<MobilePurpose>('both');
  const [result, setResult] = useState<MobileResult | null>(null);
  /** What the result was read with, which can differ from the fields once they are edited. */
  const [person, setPerson] = useState<MobilePerson>({});
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
    const next: MobilePerson = { date, gender: gender || null, name: name.trim() || undefined, purpose };
    setPerson(next);
    setResult(analyseMobile(number, next));
  };

  useEffect(() => { if (result) heading.current?.focus(); }, [result]);

  const printable = useMemo(() => (result ? mobilePrint(result, person.date ?? null, parseISODate(localDateKey())!) : null), [result, person]);

  const fit = result?.withBirth ?? null;
  const level = fit?.compatibility.level ?? null;
  const levelWords = level ? `${LEVEL_LABEL[level]}, level ${level} of 5` : '';
  const scoreWords = fit ? `Number score ${fit.score.total} of 100 (${LEVEL_LABEL[fit.score.band]})` : '';

  useShareResult(result
    ? `The mobile number I checked has the root number ${result.root} (${NUMBERS[result.root].planet})${fit ? `. ${scoreWords}; compatibility with my date of birth: ${levelWords}` : ''}.`
    : null);

  const save = () => {
    if (!result) return;
    saveReading({
      toolId: 'mobile-numerology', toolName: 'Mobile Number Numerology',
      summary: `Root ${result.root} (${NUMBERS[result.root].planet}) · digit total ${result.total}${fit ? ` · score ${fit.score.total}/100 · compatibility ${levelWords}` : ''}`,
    });
    notify('Result saved on this device');
  };

  const info = result ? NUMBERS[result.root] : null;
  const max = result ? Math.max(...result.frequency, 1) : 1;
  const compound = result?.compoundKey ? compoundReading(result.compoundKey) : null;
  const endingPairs = new Set(result?.sequence.filter((p) => p.inEnding).map((p) => p.pair.join('')) ?? []);
  const steps: CalcStep[] = result ? [
    ...result.steps,
    ...(fit ? [
      ...fit.score.parts.map((p) => ({ key: `score-${p.key}`, label: SCORE_PART_LABEL[p.key], working: p.working, result: `${p.points} of ${p.max}` })),
      { key: 'score', label: 'Number score', working: `${fit.score.parts.map((p) => p.points).join(' + ')} = ${fit.score.total}`, result: `${fit.score.total} of 100` },
    ] : []),
  ] : [];

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Input id="mobile-number" label="Mobile number" type="tel" inputMode="tel" autoComplete="off"
            placeholder="e.g. 98765 43210" value={number} error={error || undefined}
            aria-describedby="mobile-help" onChange={(e) => setNumber(e.target.value)} />
          <div>
            <Select id="mobile-purpose" label="The phone is for" value={purpose} aria-describedby="mobile-purpose-help"
              onChange={(e) => setPurpose(e.target.value as MobilePurpose)}>
              {PURPOSES.map((p) => <option key={p} value={p}>{PURPOSE_LABEL[p]}</option>)}
            </Select>
            <p id="mobile-purpose-help" className="mt-1.5 text-xs leading-relaxed text-white/55">{PURPOSE_HELP}</p>
          </div>
        </div>
        <div className="mt-4">
          <BirthFields idPrefix="mobile" dob={dob} onDob={setDob} gender={gender} onGender={setGender} />
        </div>
        <div className="mt-4 md:max-w-[50%] md:pr-2">
          <Input id="mobile-name" label="Your name (optional)" autoComplete="off" value={name}
            aria-describedby="mobile-name-help" onChange={(e) => setName(e.target.value)} />
          <p id="mobile-name-help" className="mt-1.5 text-xs leading-relaxed text-white/55">{NAME_HELP}</p>
        </div>
        <p id="mobile-help" className="mt-4 text-xs leading-relaxed text-white/55">
          A leading +91 or 0 is left out, since every number in the country shares it. Add your date of birth for the Number score, the compatibility level with your Mulank and Bhagyank, your Lo Shu grid with the number, and help choosing a number. Nothing you type is sent to us.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={analyse} disabled={!number.trim()}>
            <Smartphone className="mr-2 h-4 w-4" /> Read this number
          </Button>
          {result && (
            <Button variant="ghost" onClick={() => { setResult(null); setNumber(''); setDob(''); setGender(''); setName(''); setPurpose('both'); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start again
            </Button>
          )}
        </div>
      </Card>

      {result && info && (
        <div className="space-y-10">
          <section>
            <h3 ref={heading} tabIndex={-1} className={`${H3} outline-none`}>Report for {formatNumber(result.digits)}</h3>
            <ReportCard result={result} animate={!reducedMotion} />
          </section>

          <section>
            <h3 className={H3}>The number’s root</h3>
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
              {compound && (
                <p className="mt-4 max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75" data-testid="mobile-compound">
                  <span className="font-medium text-gold-pale">Compound number {compound.number}{compound.symbol ? `, ${compound.symbol}` : ''}.</span>{' '}
                  {result.compoundKey !== result.total && `The total ${result.total} is above 52, so it is added down to ${compound.number}. `}
                  {compound.sameAs && `Cheiro reads it as ${compound.sameAs}. `}
                  {compound.text}
                </p>
              )}
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
                    {fit.compatibility.purpose !== 'both' && ` For a ${PURPOSE_WORDS[fit.compatibility.purpose]}, the weighted total is ${signed(fit.compatibility.weighted)} on a scale from −8 to +8.`}
                  </p>
                  </div>
                </Card>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Fit label={`Mulank (Driver) ${fit.driver}`} own={fit.driver} root={result.root} relation={fit.rootToDriver} points={fit.compatibility.driverPoints} />
                  <Fit label={`Bhagyank (Conductor) ${fit.conductor}`} own={fit.conductor} root={result.root} relation={fit.rootToConductor} points={fit.compatibility.conductorPoints} />
                  {result.nameFit && (
                    <Fit label={`Name number ${result.nameFit.root} (Chaldean ${result.nameFit.compound})`} own={result.nameFit.root} root={result.root}
                      relation={result.nameFit.relation} points={result.nameFit.root === result.root ? 2 : RELATION_POINTS[result.nameFit.relation.mutual]} />
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {fit.suppliesMissing.length
                    ? `This number contains ${fit.suppliesMissing.join(', ')}, which ${fit.suppliesMissing.length === 1 ? 'is' : 'are'} missing from your Lo Shu grid. Some teachers count that in a number’s favour.`
                    : 'This number contains none of the numbers missing from your Lo Shu grid.'}
                </p>
              </>
            ) : (
              <>
                <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm leading-relaxed text-white/70">{LEVEL_NEEDS_BIRTH}</p>
                {result.nameFit && (
                  <div className="mt-3 max-w-xl">
                    <Fit label={`Name number ${result.nameFit.root} (Chaldean ${result.nameFit.compound})`} own={result.nameFit.root} root={result.root}
                      relation={result.nameFit.relation} points={result.nameFit.root === result.root ? 2 : RELATION_POINTS[result.nameFit.relation.mutual]} />
                  </div>
                )}
              </>
            )}
          </section>

          <section>
            <h3 className={H3}>The last four digits</h3>
            <Card className="p-6 sm:p-8">
              <div data-testid="mobile-ending">
                <p className="max-w-3xl text-sm leading-relaxed text-white/65">{ENDING_INTRO}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <div className="flex items-center gap-1.5" aria-label={`Last four digits ${result.ending.digits.join(' ')}`} role="img">
                    {result.ending.digits.map((d, i) => (
                      <span key={i} className="grid h-12 w-10 place-items-center rounded-lg font-heading text-2xl font-bold"
                        style={d > 0 ? { background: NUMBERS[d as Digit].colour.fill, color: NUMBERS[d as Digit].colour.ink } : { border: '1px dashed rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}>{d}</span>
                    ))}
                  </div>
                  {result.ending.root ? (
                    <p className="text-white/80">
                      add to {result.ending.total}, root <span className="font-heading text-xl text-white">{result.ending.root}</span> · {NUMBERS[result.ending.root].planet}
                    </p>
                  ) : <p className="text-sm text-white/70">{ENDING_ZERO}</p>}
                  {fit?.endingFit && (
                    <p className="flex items-center gap-2 text-sm text-white/80">
                      <LevelMeter level={fit.endingFit.level} animate={false} small />
                      {LEVEL_LABEL[fit.endingFit.level]} with your birth numbers
                    </p>
                  )}
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70">
                  <span className="font-medium text-white">Last pair {result.ending.lastPair.join('')}</span>{' '}
                  <Badge tone={IMPACT_BADGE[result.sequence.at(-1)!.impact]}>{IMPACT_LABEL[result.sequence.at(-1)!.impact]}</Badge>{' '}
                  {pairReading(result.ending.lastPair[0], result.ending.lastPair[1])}
                </p>
              </div>
            </Card>
          </section>

          <section>
            <h3 className={H3}>Two-digit combinations</h3>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
              Every pair of neighbouring digits, in the order it appears, read against the two-digit combination chart of Indian mobile numerology. Pairs in the last four digits weigh most in the score.
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
            {result.yogas.length > 0 && (
              <div className="mb-4" data-testid="mobile-yogas">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">Named yogas in this number</p>
                <ul className="flex flex-wrap gap-2">
                  {result.yogas.map((y) => (
                    <li key={y.yoga} className={`rounded-xl border px-3 py-2 text-sm ${y.impact === 'benefic' ? 'border-success/40 bg-success/[0.07]' : 'border-error/40 bg-error/[0.07]'}`}>
                      <span className="font-medium text-white">{YOGA_LABEL[y.yoga]}</span>
                      <span className="text-white/70"> · {y.written.join(', ')} · {YOGA_PLANETS[y.yoga]} · {y.impact === 'benefic' ? 'favourable' : 'marked for care'}{y.inEnding ? ' · in the ending' : ''}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 max-w-3xl text-xs leading-relaxed text-white/55">{YOGA_NOTE}</p>
              </div>
            )}
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
                          {endingPairs.has(p.pair.join('')) && <span className="block text-xs text-gold-pale">in the last four digits</span>}
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

          <section>
            <h3 className={H3}>How often each digit appears</h3>
            <table className="w-full max-w-2xl text-sm" data-testid="mobile-digits">
              <caption className="sr-only">How many times each digit from 0 to 9 appears in the number{fit ? ', and how its planet regards your Mulank' : ''}</caption>
              <thead className="sr-only"><tr><th scope="col">Digit</th><th scope="col">Times</th>{fit && <th scope="col">With your Mulank</th>}</tr></thead>
              <tbody>
                {result.frequency.map((count, digit) => {
                  const tone = fit && digit > 0 ? (digit === fit.driver ? null : relationTone(pairRelation(digit as Digit, fit.driver).mutual)) : null;
                  return (
                    <tr key={digit}>
                      <th scope="row" className="w-8 py-1 text-left font-heading text-base text-white">{digit}</th>
                      <td className="py-1">
                        <span className="flex items-center gap-3">
                          <span aria-hidden="true" className="h-2.5 rounded-full"
                            style={{ width: `${(count / max) * 60}%`, minWidth: count ? '0.5rem' : 0, background: digit ? NUMBERS[digit as Digit].colour.fill : 'rgba(255,255,255,0.4)' }} />
                          <span className="whitespace-nowrap text-white/75">
                            {count === 0 ? 'not present' : count === 1 ? 'once' : `${count} times`}
                            {count >= 4 ? ' · overloaded' : count === 3 ? ' · strong' : ''}
                          </span>
                        </span>
                      </td>
                      {fit && (
                        <td className="py-1 pl-3 text-xs text-white/60">
                          {digit === 0 ? 'no planet' : digit === fit.driver ? `${NUMBERS[digit as Digit].planet} · your Mulank` : `${NUMBERS[digit as Digit].planet} · ${TONE_LABEL[tone!].toLowerCase()}`}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {result.heavy.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Appearing three times or more: {result.heavy.map((h) => `${h.digit} (${h.count} times)`).join(', ')}. A heavily repeated digit is read as that planet’s theme sounding strongly in the number; teachers prefer no digit more than three times.
              </p>
            )}
          </section>

          {fit && (
            <section>
              <h3 className={H3}>Your Lo Shu grid with this number</h3>
              <Card className="p-6 sm:p-8">
                <div data-testid="mobile-grid">
                  <p className="mb-5 max-w-3xl text-sm leading-relaxed text-white/65">{GRID_INTRO}</p>
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                    <LoShuGrid result={fit.grid.person}
                      addition={{ grid: fit.grid.withNumber, added: fit.grid.added, label: 'With this phone number', source: 'the phone number' }} />
                    <div className="space-y-3 text-sm leading-relaxed text-white/75">
                      {fit.grid.newLines.length > 0 ? (
                        <p className="rounded-xl border border-gold-soft/30 bg-gold-bright/[0.07] p-4 text-white/85">
                          With this number your grid completes {listAnd(fit.grid.newLines.map((id) => `the ${LINE_TEXT[id].name} (${LOSHU_LINES.find((l) => l.id === id)!.cells.join('-')})`))}.
                        </p>
                      ) : (
                        <p>This number completes no new line of three in your grid.</p>
                      )}
                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                        {(['introduced', 'strengthened', 'missing'] as const).map((s) => {
                          const ds = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).filter((d) => fit.grid.status[d] === s);
                          return ds.length ? (
                            <div key={s} className="contents">
                              <dt className="text-white/55">{GRID_STATUS_LABEL[s]}</dt>
                              <dd className="text-white/85">{ds.join(', ')}</dd>
                            </div>
                          ) : null;
                        })}
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {fit && (
            <section>
              <h3 className={H3}>Choosing a number</h3>
              <Card className="space-y-10 p-6 sm:p-8">
                <RootsGrid roots={fit.roots} current={result.root} />
                <NumberChecklist checklist={fit.checklist} />
                <CompareNumbers base={result} person={person} />
              </Card>
            </section>
          )}

          {fit && (
            <section>
              <h3 className={H3}>{fit.compatibility.level <= 3 ? 'If you keep this number' : 'Lucky details for you'}</h3>
              <MobileRemedies result={result} />
            </section>
          )}

          <section className="space-y-4">
            <HowCalculated steps={steps} />
            <NumerologyMethodLine method="The digits are added down to a root; the compatibility level and the fit of the ending follow the traditional friendships between the planets; pairs follow the two-digit combination chart; the Number score adds four parts, each shown with its arithmetic." />
            <ResultActions toolSlug="mobile-numerology" onSave={save} />
          </section>

          {printable && <PrintReport report={printable} />}
        </div>
      )}
    </div>
  );
}

/** Five steps, filled up to the level. The level is written in words beside it, so the meter adds nothing a reader needs. */
function LevelMeter({ level, animate, small = false }: { level: CompatibilityLevel; animate: boolean; small?: boolean }) {
  return (
    <div role="img" aria-label={`Level ${level} of 5`} className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((step) => (
        <span key={step} className={small ? 'h-2 w-5 overflow-hidden rounded-full bg-white/10' : 'h-3 w-9 overflow-hidden rounded-full bg-white/10 sm:w-11'}>
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
