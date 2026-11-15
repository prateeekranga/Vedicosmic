import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Sparkles } from 'lucide-react';
import {
  formatYMD, normalizeName, parseISODate, personalCycles, profile,
  type CalcStep, type CoreNumber, type NumerologyProfile, type PersonalCycles,
} from '@/engine/numerology';
import { localDateKey } from '@/engine/time';
import { KUA_TEXT, LINE_TEXT, MISSING_TEXT } from '@/data/numerology/loshuText';
import { CORE_ROLE, CYCLE_TEXT, KARMIC_DEBT_TEXT, KARMIC_LESSON_TEXT, NUMBER_TRAIT } from '@/data/numerology/westernText';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import {
  REPORT_FOOTER, chaldeanSections, coreLabel, coreWorking, loShuSections, westernSections, type Report,
} from '@/lib/numerologyReport';
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

interface Result { displayName: string; profile: NumerologyProfile; cycles: PersonalCycles }

function steps(p: NumerologyProfile): CalcStep[] {
  const w = p.western;
  const step = (key: string, label: string, n: CoreNumber | null): CalcStep[] =>
    (n ? [{ key, label, working: `${coreWorking(n)}.`, result: coreLabel(n) }] : []);
  return [
    ...step('lp', 'Life Path (month, day and year)', w.lifePath),
    ...step('ex', 'Expression (every letter, word by word)', w.expression),
    ...step('su', 'Soul Urge (vowels A, E, I, O, U)', w.soulUrge),
    ...step('pe', 'Personality (consonants; Y counts as a consonant)', w.personality),
    ...step('ma', 'Maturity', w.maturity),
    ...p.loShu.steps,
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
    setResult({
      displayName: name.trim(),
      profile: profile({ date, gender: gender || null, name }),
      cycles: personalCycles(date, parseISODate(localDateKey())!),
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

  const report: Report | null = result && w && grid ? {
    title: 'Numerology Report',
    subtitle: `${result.displayName} · born ${formatYMD(grid.date)}`,
    sections: [...westernSections(w), ...loShuSections(grid), ...(ch ? chaldeanSections(ch) : [])],
    footer: REPORT_FOOTER,
  } : null;

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
            <HowCalculated steps={steps(result.profile)} />
            <NumerologyMethodLine method="Western numbers use Pythagorean letter values and the component method; the grid, Mulank and Bhagyank follow the Indian Lo Shu method; the name number uses Cheiro’s Chaldean values." />
            <ResultActions toolSlug="numerology" onSave={save} saveLabel="Save this report" />
          </section>

          <PrintReport report={report} />
          <p className="text-xs text-white/55">Printing gives the full report, including every plane, repeated number and missing number in the grid.</p>
        </div>
      )}
    </div>
  );
}
