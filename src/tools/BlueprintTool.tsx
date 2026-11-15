import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Sparkles } from 'lucide-react';
import {
  compareYMD, dashaOn, formatYMD, normalizeName, parseISODate, personalCycles, profile,
  type CalcStep, type CoreNumber, type DashaNow, type YMD, type ExpressionPlane, type NumerologyProfile, type PersonalCycles,
} from '@/engine/numerology';
import { localDateKey } from '@/engine/time';
import { KUA_TEXT, LINE_TEXT, MISSING_TEXT } from '@/data/numerology/loshuText';
import { CORE_ROLE, CYCLE_TEXT, KARMIC_DEBT_TEXT, KARMIC_LESSON_TEXT, NUMBER_TRAIT } from '@/data/numerology/westernText';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import { DASHA_ROLE, DASHA_TEXT } from '@/data/numerology/dashaText';
import {
  BALANCE_TEXT, EXTRA_ROLE, HIDDEN_PASSION_TEXT, PLANE_TEXT, letterReading, rationalThoughtReading, subconsciousReading,
} from '@/data/numerology/nameExtraText';
import { coreLabel, coreWorking } from '@/lib/numerologyReport';
import { numerologyPrint } from '@/lib/print/numerologyPrint';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { BirthFields, type GenderChoice } from '@/components/numerology/BirthFields';
import { LoShuGrid } from '@/components/numerology/LoShuGrid';
import { NumberCard } from '@/components/numerology/NumberCard';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';

const H3 = 'mb-3 font-heading text-h5 text-white';
const LINK = 'text-brand-cyan-soft underline underline-offset-2 hover:text-white';

interface Result { displayName: string; profile: NumerologyProfile; cycles: PersonalCycles; now: DashaNow | null; today: YMD }
const PLANES: readonly ExpressionPlane[] = ['physical', 'mental', 'emotional', 'intuitive'];

function steps(p: NumerologyProfile, now: DashaNow | null): CalcStep[] {
  const w = p.western;
  const step = (key: string, label: string, n: CoreNumber | null): CalcStep[] =>
    (n ? [{ key, label, working: `${coreWorking(n)}.`, result: coreLabel(n) }] : []);
  return [
    ...step('lp', 'Life Path (month, day and year)', w.lifePath),
    ...step('ex', 'Expression (every letter, word by word)', w.expression),
    ...step('su', 'Soul Urge (vowels A, E, I, O, U)', w.soulUrge),
    ...step('pe', 'Personality (consonants; Y counts as a consonant)', w.personality),
    ...step('ma', 'Maturity', w.maturity),
    ...step('rt', 'Rational Thought (first name plus the day of birth)', w.rationalThought),
    ...(w.balance ? [{ key: 'ba', label: 'Balance (initials)', working: `${w.balance.initials.map((i) => `${i.letter} ${i.value}`).join(' + ')} = ${w.balance.total}.`, result: String(w.balance.value) }] : []),
    ...p.loShu.steps,
    ...(now?.steps ?? []),
    ...(p.chaldean ? p.chaldean.steps.filter((s) => s.key === 'compound' || s.key === 'root').map((s) => ({ ...s, key: `ch-${s.key}`, label: `Chaldean ${s.label.toLowerCase()}` })) : []),
  ];
}

export default function BlueprintTool() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderChoice>('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const compute = () => {
    const date = parseISODate(dob);
    if (!date) return;
    const parsed = normalizeName(name);
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!/[A-Z]/.test(parsed.letters)) {
      setError(parsed.hasNonLatin
        ? 'The name numbers are defined for the English alphabet. Please type your name in English letters.'
        : 'Please type your name using the letters A to Z.');
      return;
    }
    setError('');
    const today = parseISODate(localDateKey())!;
    setResult({
      displayName: name.trim(),
      profile: profile({ date, gender: gender || null, name }),
      cycles: personalCycles(date, today), today,
      // The dasha periods are read for today's date on this device.
      now: compareYMD(today, date) >= 0 ? dashaOn(date, today) : null,
    });
  };

  useEffect(() => { if (result) heading.current?.focus(); }, [result]);

  const w = result?.profile.western;
  const grid = result?.profile.loShu;
  const ch = result?.profile.chaldean;
  // The two Raj Yogs first, then the planes, in the order the grid draws their arrows.
  const completeLines = grid
    ? [...grid.full.lines.filter((l) => l.status === 'full')].sort((a, b) => Number(b.kind === 'diagonal') - Number(a.kind === 'diagonal'))
    : [];

  useShareResult(w ? `My numerology: Life Path ${coreLabel(w.lifePath)}${w.expression ? `, Expression ${coreLabel(w.expression)}` : ''}.` : null);

  const save = () => {
    if (!w || !grid) return;
    saveReading({
      toolId: 'numerology', toolName: 'Numerology Calculator',
      summary: `Life Path ${coreLabel(w.lifePath)}${w.expression ? ` · Expression ${coreLabel(w.expression)}` : ''}${w.soulUrge ? ` · Soul Urge ${coreLabel(w.soulUrge)}` : ''} · Mulank ${grid.driver} · Bhagyank ${grid.conductor}`,
    });
    notify('Numerology report saved on this device');
  };

  const report = useMemo(
    () => (result ? numerologyPrint({ ...result, steps: steps(result.profile, result.now) }) : null),
    [result],
  );

  const cards: { label: string; role: string; n: CoreNumber | null }[] = w ? [
    { label: 'Life Path', role: CORE_ROLE.lifePath, n: w.lifePath },
    { label: 'Expression', role: CORE_ROLE.expression, n: w.expression },
    { label: 'Soul Urge', role: CORE_ROLE.soulUrge, n: w.soulUrge },
    { label: 'Personality', role: CORE_ROLE.personality, n: w.personality },
    { label: 'Birthday', role: CORE_ROLE.birthday, n: w.birthday },
    { label: 'Maturity', role: CORE_ROLE.maturity, n: w.maturity },
  ] : [];

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Input id="blueprint-name" label="Full name" autoComplete="off" placeholder="As you usually write it"
            value={name} error={error || undefined} onChange={(e) => setName(e.target.value)} />
          <BirthFields idPrefix="blueprint" dob={dob} onDob={setDob} gender={gender} onGender={setGender} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/55">
          Use the name you go by day to day, in English letters. Your name and date of birth stay on this device.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={compute} disabled={!dob || !name.trim()}>
            <Sparkles className="mr-2 h-4 w-4" /> Show my numbers
          </Button>
          {result && (
            <Button variant="ghost" onClick={() => { setResult(null); setName(''); setDob(''); setGender(''); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start again
            </Button>
          )}
        </div>
      </Card>

      {result && w && grid && report && (
        <div className="space-y-10">
          <section>
            <h3 ref={heading} tabIndex={-1} className={`${H3} outline-none`}>Core numbers (Western)</h3>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
              The Pythagorean system reads six numbers from a date of birth and a name. Master numbers 11, 22 and 33 are kept and written with their digit, for example 11/2.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(({ label, role, n }) => (n ? (
                <NumberCard key={label} label={`${label} ${n.master ? coreLabel(n) : ''}`.trim()} value={n.value} system="Pythagorean (Western)" note={role}>
                  Read as {NUMBER_TRAIT[n.value]}.
                </NumberCard>
              ) : (
                <div key={label} className="rounded-xl border border-dashed border-white/20 p-4 text-sm leading-relaxed text-white/65">
                  <h4 className="font-medium text-white">{label}</h4>
                  <p className="mt-1">{label === 'Soul Urge' ? 'This name has no vowels (A, E, I, O, U), so it has no Soul Urge number.' : 'This number could not be worked out from the name as typed.'}</p>
                </div>
              )))}
            </div>
            {w.lifePath.alternative && (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
                Other calculators may show a Life Path of {w.lifePath.alternative.value}, from adding every digit of the date in one go. This page reduces month, day and year separately; the single digit, {w.lifePath.root}, is the same either way.
              </p>
            )}
          </section>

          {(w.karmicDebts.length > 0 || w.karmicLessons.length > 0) && (
            <section>
              <h3 className={H3}>Karmic numbers</h3>
              <ul className="space-y-2 text-sm leading-relaxed text-white/70">
                {w.karmicDebts.map((k) => <li key={`${k.from}-${k.debt}`}><span className="font-medium text-white">{k.from}.</span> {KARMIC_DEBT_TEXT[k.debt]}</li>)}
                {w.karmicLessons.map((d) => <li key={d}>{KARMIC_LESSON_TEXT[d]}</li>)}
              </ul>
            </section>
          )}

          {w.hiddenPassion && (
            <section data-testid="numerology-more">
              <h3 className={H3}>More from your name</h3>
              <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
                Four further numbers, three letters and the planes of expression, all read from the name as you typed it.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {w.hiddenPassion.numbers.map((d) => (
                  <NumberCard key={d} label="Hidden Passion" value={d} system="Pythagorean (Western)" note={EXTRA_ROLE.hiddenPassion}>
                    {HIDDEN_PASSION_TEXT[d]} {w.hiddenPassion!.count} of your {w.planes?.letters ?? ''} letters carry it.
                  </NumberCard>
                ))}
                {w.subconsciousSelf && (
                  <NumberCard label="Subconscious Self" value={w.subconsciousSelf} system="Pythagorean (Western)" note={EXTRA_ROLE.subconsciousSelf}>
                    {subconsciousReading(w.subconsciousSelf)}
                  </NumberCard>
                )}
                {w.balance && (
                  <NumberCard label="Balance" value={w.balance.value} system="Pythagorean (Western)" note={EXTRA_ROLE.balance}>
                    {BALANCE_TEXT[w.balance.value]}
                  </NumberCard>
                )}
                {w.rationalThought && (
                  <NumberCard label={`Rational Thought ${w.rationalThought.master ? coreLabel(w.rationalThought) : ''}`.trim()} value={w.rationalThought.value} system="Pythagorean (Western)" note={EXTRA_ROLE.rationalThought}>
                    {rationalThoughtReading(w.rationalThought.value)}
                  </NumberCard>
                )}
              </div>
              {w.specialLetters && (
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <LetterCard label="Cornerstone" letter={w.specialLetters.cornerstone} role={EXTRA_ROLE.cornerstone} />
                  <LetterCard label="Capstone" letter={w.specialLetters.capstone} role={EXTRA_ROLE.capstone} />
                  {w.specialLetters.firstVowel
                    ? <LetterCard label="First Vowel" letter={w.specialLetters.firstVowel} role={EXTRA_ROLE.firstVowel} />
                    : (
                      <div className="rounded-xl border border-dashed border-white/20 p-4 text-sm leading-relaxed text-white/65">
                        <h4 className="font-medium text-white">First Vowel</h4>
                        <p className="mt-1">Your first name has none of A, E, I, O, U, so it has no First Vowel.</p>
                      </div>
                    )}
                </div>
              )}
              {w.planes && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <h4 className="font-medium text-white">Planes of Expression</h4>
                  <table className="mt-2 w-full text-sm">
                    <caption className="sr-only">How many letters of the name fall on each of the four planes of expression</caption>
                    <thead className="sr-only"><tr><th scope="col">Plane</th><th scope="col">Letters</th></tr></thead>
                    <tbody>
                      {PLANES.map((plane) => {
                        const count = w.planes!.counts[plane];
                        const top = Math.max(...PLANES.map((k) => w.planes!.counts[k]), 1);
                        return (
                          <tr key={plane}>
                            <th scope="row" className="w-36 py-1.5 pr-3 text-left font-normal align-top">
                              <span className="block text-white">{PLANE_TEXT[plane].name}</span>
                              <span className="block text-xs text-white/55">{PLANE_TEXT[plane].letters}</span>
                            </th>
                            <td className="py-1.5">
                              <span className="flex items-center gap-3">
                                <span aria-hidden="true" className="h-2.5 rounded-full bg-brand-cyan/70" style={{ width: `${(count / top) * 60}%`, minWidth: count ? '0.5rem' : 0 }} />
                                <span className="text-white/75">{count === 1 ? '1 letter' : `${count} letters`}{w.planes!.strongest.includes(plane) && count > 0 ? ', strongest' : ''}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {w.planes.strongest.map((plane) => `${PLANE_TEXT[plane].name}. ${PLANE_TEXT[plane].text}`).join(' ')}
                  </p>
                </div>
              )}
            </section>
          )}

          <section>
            <h3 className={H3}>Indian numbers and Lo Shu grid</h3>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
              <Card className="p-5">
                <LoShuGrid result={grid} compact />
              </Card>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <NumberCard label="Mulank · Driver" value={grid.driver} system="Lo Shu (Indian)" note="From the day you were born." />
                  <NumberCard label="Bhagyank · Conductor" value={grid.conductor} system="Lo Shu (Indian)" note="From the whole date; the same digit as the Life Path." />
                  {grid.kua && <NumberCard label="Kua number" value={grid.kua.mansion} system="Eight Mansions" note={KUA_TEXT[grid.kua.mansion]} />}
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  {grid.full.missing.length
                    ? <>Missing from the grid: {grid.full.missing.join(', ')}. {MISSING_TEXT[grid.full.missing[0]].meaning}</>
                    : 'Every number from 1 to 9 is present in the grid.'}
                </p>
                {completeLines.length > 0 ? (
                  <ul className="space-y-2">
                    {completeLines.map((l) => (
                      <li key={l.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-white/70">
                        <span className="font-medium text-white">{LINE_TEXT[l.id].name} ({l.cells.join('-')}).</span> {LINE_TEXT[l.id].full}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-relaxed text-white/70">No line of three is complete in this grid, so it forms no plane or yog yet.</p>
                )}
                <p className="text-sm text-white/65">
                  For every plane and yog, the repeated numbers and the Kua directions, open the{' '}
                  <Link to="/tools/loshu-grid" className={LINK}>Lo Shu Grid Calculator</Link>.
                </p>
              </div>
            </div>
          </section>

          {result.now && (
            <section data-testid="numerology-dasha">
              <h3 className={H3}>Dasha periods now</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <NumberCard label="Maha Dasha" value={result.now.maha.number} system="Indian numerology"
                  note={`Age ${result.now.maha.fromAge} to ${result.now.maha.toAge}. ${DASHA_ROLE.maha}`}>
                  {DASHA_TEXT[result.now.maha.number]}
                </NumberCard>
                <NumberCard label="Antar Dasha" value={result.now.antar.number} system="Indian numerology"
                  note={`Until ${formatYMD(result.now.antar.until)}. ${DASHA_ROLE.antar}`}>
                  {DASHA_TEXT[result.now.antar.number]}
                </NumberCard>
                <NumberCard label="Pratyantar Dasha" value={result.now.pratyantar.number} system="Indian numerology"
                  note={`Until ${formatYMD(result.now.pratyantar.until)}. ${DASHA_ROLE.pratyantar}`}>
                  {DASHA_TEXT[result.now.pratyantar.number]}
                </NumberCard>
              </div>
              <p className="mt-3 text-sm text-white/65">
                The <Link to="/tools/loshu-grid" className={LINK}>Lo Shu Grid Calculator</Link> draws your grid with these numbers added and lists the next five years.
              </p>
            </section>
          )}

          {ch && (
            <section>
              <h3 className={H3}>Name number (Chaldean)</h3>
              <div className="grid gap-3 md:grid-cols-[minmax(0,280px)_1fr]">
                <NumberCard label={`Compound ${ch.compound}`} value={ch.root} system="Chaldean" note="The older letter table used for name numbers in India." />
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/70">
                  {ch.compoundKey && compoundReading(ch.compoundKey)
                    ? <p>{compoundReading(ch.compoundKey)!.text}</p>
                    : <p>The name adds to a single digit, so it has a root number but no compound number.</p>}
                  <p className="mt-2 text-white/65">
                    To compare spellings letter by letter, open the <Link to="/tools/chaldean" className={LINK}>Chaldean Numerology Calculator</Link>.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className={H3}>Your personal year</h3>
            <div className="grid gap-3 md:grid-cols-[minmax(0,280px)_1fr]">
              <NumberCard label={`Personal year · ${CYCLE_TEXT[result.cycles.year].keyword}`} value={result.cycles.year} system="Pythagorean (Western)" />
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/70">
                <p>{CYCLE_TEXT[result.cycles.year].year}</p>
                <p className="mt-2 text-white/65">
                  The <Link to="/tools/life-path" className={LINK}>Life Path report</Link> adds your personal month and day and the four pinnacles of your life.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <HowCalculated steps={steps(result.profile, result.now)} />
            <NumerologyMethodLine method="Western numbers use Pythagorean letter values and the component method; the grid, Mulank, Bhagyank and dasha follow the Indian Lo Shu method; the name number uses Cheiro’s Chaldean values." />
            <ResultActions toolSlug="numerology" onSave={save} saveLabel="Save this report" />
          </section>

          <PrintReport report={report} />
          <p className="text-xs text-white/55">The printed report has every number above with its working. Choose the sections, add a name, notes and a cover page, and print in colour or black and white, or save it as a PDF.</p>
        </div>
      )}
    </div>
  );
}

/** One of the three special letters of the first name, with its role and reading. */
function LetterCard({ label, letter, role }: { label: string; letter: string; role: string }) {
  return (
    <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-12 min-w-12 flex-none place-items-center rounded-lg border border-gold-soft/40 bg-gold-bright/10 px-2 font-heading text-xl font-bold text-gold-pale">{letter}</span>
        <h4 className="text-sm font-medium text-white">{label}</h4>
      </div>
      <p className="mt-2 text-xs leading-snug text-white/60">{role}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{letterReading(letter)}</p>
    </div>
  );
}
