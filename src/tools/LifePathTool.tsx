import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, RotateCcw } from 'lucide-react';
import {
  birthdayNumber, formatYMD, lifePath, loShu, parseISODate, personalCycles, pinnacleAt, pinnacles, relationsOf, toISODate,
  type CalcStep, type CoreNumber, type LoShuResult, type PersonalCycles, type Pinnacle, type YMD,
} from '@/engine/numerology';
import { localDateKey } from '@/engine/time';
import { NUMBERS, masterNote } from '@/data/numerology/numbers';
import {
  CHALLENGE_TEXT, CORE_ROLE, CYCLE_TEXT, KARMIC_DEBT_TEXT, LIFE_PATH_TEXT, NUMBER_TRAIT, PINNACLE_TEXT,
} from '@/data/numerology/westernText';
import { REPORT_FOOTER, coreLabel, coreWorking, lifePathSections, type Report } from '@/lib/numerologyReport';
import { takeResultLink } from '@/lib/resultLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BirthFields } from '@/components/numerology/BirthFields';
import { NumberCard } from '@/components/numerology/NumberCard';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';

interface Result {
  date: YMD;
  today: YMD;
  lifePath: CoreNumber;
  birthday: CoreNumber;
  grid: LoShuResult;
  pinnacles: Pinnacle[];
  cycles: PersonalCycles;
}

const H3 = 'mb-3 font-heading text-h5 text-white';

function build(date: YMD): Result {
  // "Today" is the visitor's own calendar date.
  const today = parseISODate(localDateKey())!;
  return {
    date, today,
    lifePath: lifePath(date), birthday: birthdayNumber(date), grid: loShu(date, null),
    pinnacles: pinnacles(date), cycles: personalCycles(date, today),
  };
}

function steps(r: Result): CalcStep[] {
  const lp = r.lifePath;
  return [
    ...lp.parts.map((p) => ({
      key: `part-${p.label}`, label: p.label,
      working: p.total === p.reduced ? `${p.total} is kept as it is.` : `${String(p.total).split('').join(' + ')} added down gives ${p.reduced}.`,
      result: String(p.reduced),
    })),
    { key: 'lp', label: 'Life Path', working: `${coreWorking(lp)}.`, result: coreLabel(lp) },
    { key: 'py', label: 'Personal year', working: `Birth month ${r.date.m} and day ${r.date.d} added to the year ${r.today.y}, then added down to one digit.`, result: String(r.cycles.year) },
    { key: 'pm', label: 'Personal month', working: `Personal year ${r.cycles.year} plus the calendar month ${r.today.m}, added down.`, result: String(r.cycles.month) },
    { key: 'pd', label: 'Personal day', working: `Personal month ${r.cycles.month} plus the day of the month ${r.today.d}, added down.`, result: String(r.cycles.day) },
  ];
}

export default function LifePathTool() {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const compute = (iso: string) => {
    const date = parseISODate(iso);
    if (date) setResult(build(date));
  };

  useEffect(() => {
    const link = takeResultLink();
    if (!link) return;
    setDob(link.dob);
    compute(link.dob);
  }, []);

  useEffect(() => { if (result) heading.current?.focus(); }, [result]);

  useShareResult(result ? `My Life Path number is ${coreLabel(result.lifePath)} (${NUMBER_TRAIT[result.lifePath.value]}).` : null);

  const save = () => {
    if (!result) return;
    saveReading({
      toolId: 'life-path', toolName: 'Life Path Number',
      summary: `Life Path ${coreLabel(result.lifePath)} · Mulank ${result.grid.driver} · Bhagyank ${result.grid.conductor} · Personal year ${result.cycles.year}`,
    });
    notify('Life Path report saved on this device');
  };

  const lp = result?.lifePath;
  const master = lp ? masterNote(lp.value) : null;
  const friends = result ? relationsOf(result.grid.driver) : null;
  const current = result ? pinnacleAt(result.pinnacles, result.cycles.age) : null;
  const report: Report | null = result ? {
    title: 'Life Path Report', subtitle: `Date of birth: ${formatYMD(result.date)}`,
    sections: lifePathSections(result.date, result.lifePath, result.birthday, result.grid, result.pinnacles, result.cycles, result.today),
    footer: REPORT_FOOTER,
  } : null;

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="sm:max-w-md">
          <BirthFields idPrefix="lifepath" dob={dob} onDob={setDob} withGender={false} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => compute(dob)} disabled={!dob}>
            <Compass className="mr-2 h-4 w-4" /> Show my Life Path
          </Button>
          {result && (
            <Button variant="ghost" onClick={() => { setResult(null); setDob(''); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start again
            </Button>
          )}
        </div>
      </Card>

      {result && lp && friends && current && report && (
        <div className="space-y-10">
          <section>
            <h3 ref={heading} tabIndex={-1} className={`${H3} outline-none`}>Your Life Path number</h3>
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-5">
                <span className="grid h-20 min-w-20 place-items-center rounded-2xl px-3 font-display text-4xl font-bold"
                  style={{ background: NUMBERS[result.grid.conductor].colour.fill, color: NUMBERS[result.grid.conductor].colour.ink }}>
                  {lp.value}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-h4 text-white">
                    Life Path {coreLabel(lp)} · {master ? master.archetype : NUMBERS[result.grid.conductor].archetype}
                  </p>
                  <p className="mt-1 text-sm text-white/60">Pythagorean (Western) · {coreWorking(lp)}</p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-body leading-relaxed text-white/75">{LIFE_PATH_TEXT[lp.value]}</p>
              {lp.karmicDebt && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">{KARMIC_DEBT_TEXT[lp.karmicDebt]}</p>}
              {lp.alternative && (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
                  Other calculators may show {lp.alternative.value}. That comes from adding every digit of the date in one go. This page reduces the month, day and year separately first, which is the method most teachers use for master numbers; the single digit, {lp.root}, is the same either way.
                </p>
              )}
            </Card>
          </section>

          <section>
            <h3 className={H3}>Mulank, Bhagyank and Birthday number</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <NumberCard label="Mulank · Driver" value={result.grid.driver} system="Lo Shu (Indian)" note="From the day you were born.">
                {NUMBERS[result.grid.driver].strength}
              </NumberCard>
              <NumberCard label="Bhagyank · Conductor" value={result.grid.conductor} system="Lo Shu (Indian)" note="From the whole date. Always the same digit as the Life Path.">
                {NUMBERS[result.grid.conductor].growthEdge}
              </NumberCard>
              <NumberCard label="Birthday number" value={result.birthday.value} system="Pythagorean (Western)" note={CORE_ROLE.birthday}>
                Read as {NUMBER_TRAIT[result.birthday.value]}.
              </NumberCard>
            </div>
            <p className="mt-3 text-sm text-white/65">
              To see these numbers placed in the square, with missing and repeated numbers, open the{' '}
              <Link to="/tools/loshu-grid" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">Lo Shu Grid Calculator</Link>.
            </p>
          </section>

          <section>
            <h3 className={H3}>Friendly numbers and colours for Mulank {result.grid.driver}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Fact label="Friendly numbers" value={friends.friends.join(', ') || 'None'} />
              <Fact label="Neutral numbers" value={friends.neutral.join(', ') || 'None'} />
              <Fact label="Numbers its planet is cool towards" value={friends.enemies.join(', ') || 'None'} />
              <Fact label={`Colours linked with ${NUMBERS[result.grid.driver].planet}`} value={NUMBERS[result.grid.driver].colours.join(', ')} />
            </div>
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-white/60">
              Often called lucky and unlucky numbers and colours. They follow the traditional friendships between the planets that rule each number, and are a matter of preference, not of fortune.
            </p>
          </section>

          <section>
            <h3 className={H3}>Your personal year, month and day</h3>
            <p className="mb-4 text-sm text-white/65">For {formatYMD(result.today)}. The personal year changes on 1 January.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <NumberCard label={`Personal year · ${CYCLE_TEXT[result.cycles.year].keyword}`} value={result.cycles.year} system="Pythagorean (Western)">
                {CYCLE_TEXT[result.cycles.year].year}
              </NumberCard>
              <NumberCard label={`Personal month · ${CYCLE_TEXT[result.cycles.month].keyword}`} value={result.cycles.month} system="Pythagorean (Western)">
                {CYCLE_TEXT[result.cycles.month].short}
              </NumberCard>
              <NumberCard label={`Personal day · ${CYCLE_TEXT[result.cycles.day].keyword}`} value={result.cycles.day} system="Pythagorean (Western)">
                {CYCLE_TEXT[result.cycles.day].short}
              </NumberCard>
            </div>
          </section>

          <section>
            <h3 className={H3}>Pinnacles and challenges</h3>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
              Western numerology divides a life into four long chapters. Each has a pinnacle, its main theme, and a challenge that runs beside it.
            </p>
            <ol className="grid gap-3 md:grid-cols-2">
              {result.pinnacles.map((p) => (
                <li key={p.index} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-white">
                      Ages {p.fromAge}{p.toAge === null ? ' onwards' : `–${p.toAge}`}: pinnacle {p.number}
                    </h4>
                    {p.index === current.index && <Badge tone="gold">Now</Badge>}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{PINNACLE_TEXT[p.number]}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{CHALLENGE_TEXT[p.challenge]}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-4">
            <HowCalculated steps={steps(result)} />
            <NumerologyMethodLine method="Life Path by the component method: month, day and year are each added down first, keeping 11, 22 and 33." />
            <ResultActions toolSlug="life-path" link={{ dob: toISODate(result.date), gender: null }} onSave={save} saveLabel="Save this report" />
          </section>

          <PrintReport report={report} />
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h4 className="text-xs uppercase tracking-wide text-white/55">{label}</h4>
      <p className="mt-1 font-heading text-lg text-white">{value}</p>
    </div>
  );
}
