import { useEffect, useMemo, useRef, useState } from 'react';
import { Grid3x3, RotateCcw } from 'lucide-react';
import { loShu, parseISODate, relationsOf, toISODate, type LineStatus, type LoShuResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import {
  DIRECTION_NAME, KUA_DIRECTION_TEXT, KUA_GROUP_TEXT, KUA_TEXT, LINE_STATUS_LABEL, LINE_TEXT, MISSING_TEXT,
  RELATION_TEXT, SAME_NUMBER_TEXT, lineReading, repeatReading,
} from '@/data/numerology/loshuText';
import { loShuReport } from '@/lib/numerologyReport';
import { takeResultLink } from '@/lib/resultLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BirthFields, type GenderChoice } from '@/components/numerology/BirthFields';
import { LoShuGrid } from '@/components/numerology/LoShuGrid';
import { NumberCard } from '@/components/numerology/NumberCard';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';

const STATUS_ORDER: Record<LineStatus, number> = { full: 0, partial: 1, single: 2, empty: 3 };
const STATUS_TONE: Record<LineStatus, 'gold' | 'cyan' | 'neutral'> = { full: 'gold', partial: 'cyan', single: 'neutral', empty: 'neutral' };
const H3 = 'mb-3 font-heading text-h5 text-white';

export default function LoshuGridTool() {
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderChoice>('');
  const [result, setResult] = useState<LoShuResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const compute = (iso: string, g: GenderChoice) => {
    const date = parseISODate(iso);
    if (!date) return;
    setResult(loShu(date, g || null));
  };

  // A shared link reopens the tool with its result.
  useEffect(() => {
    const link = takeResultLink();
    if (!link) return;
    setDob(link.dob);
    setGender(link.gender ?? '');
    compute(link.dob, link.gender ?? '');
  }, []);

  // Move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => { if (result) heading.current?.focus(); }, [result]);

  useShareResult(result ? `My Lo Shu grid: Driver ${result.driver} (${NUMBERS[result.driver].planet}), Conductor ${result.conductor} (${NUMBERS[result.conductor].planet}).` : null);

  const lines = useMemo(
    () => (result ? [...result.full.lines].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) : []),
    [result],
  );

  const save = () => {
    if (!result) return;
    const kua = result.kua ? ` · Kua ${result.kua.mansion}` : '';
    saveReading({
      toolId: 'loshu-grid', toolName: 'Lo Shu Grid',
      summary: `Driver ${result.driver} (${NUMBERS[result.driver].planet}) · Conductor ${result.conductor} (${NUMBERS[result.conductor].planet})${kua} · Missing: ${result.full.missing.length ? result.full.missing.join(', ') : 'none'}`,
    });
    notify('Lo Shu grid saved on this device');
  };

  const friends = result ? relationsOf(result.driver) : null;

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="sm:max-w-xl">
          <BirthFields idPrefix="loshu" dob={dob} onDob={setDob} gender={gender} onGender={setGender} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => compute(dob, gender)} disabled={!dob}>
            <Grid3x3 className="mr-2 h-4 w-4" /> Make my grid
          </Button>
          {result && (
            <Button variant="ghost" onClick={() => { setResult(null); setDob(''); setGender(''); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start again
            </Button>
          )}
        </div>
      </Card>

      {result && (
        <div className="space-y-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
            <Card className="p-5 sm:p-7">
              <h3 ref={heading} tabIndex={-1} className={`${H3} outline-none`}>Your Lo Shu grid</h3>
              <LoShuGrid result={result} />
            </Card>

            <div className="space-y-8">
              <section>
                <h3 className={H3}>Your three numbers</h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <NumberCard label="Driver · Mulank" value={result.driver} system="Lo Shu (Indian)" note="From the day you were born: your everyday nature.">
                    {NUMBERS[result.driver].strength}
                  </NumberCard>
                  <NumberCard label="Conductor · Bhagyank" value={result.conductor} system="Lo Shu (Indian)" note="From the whole date: the direction your life takes.">
                    Its theme is {NUMBERS[result.conductor].keyword.toLowerCase()}. {NUMBERS[result.conductor].growthEdge}
                  </NumberCard>
                  {result.kua ? (
                    <NumberCard label="Kua number" value={result.kua.mansion} system="Eight Mansions" note="From the year and gender: your favourable directions.">
                      {KUA_TEXT[result.kua.mansion]}
                    </NumberCard>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/20 p-4 text-sm leading-relaxed text-white/65">
                      <h4 className="font-medium text-white">Kua number</h4>
                      <p className="mt-1">Choose a gender above to add the Kua number and its directions. The formula differs for men and women.</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className={H3}>Driver and Conductor together</h3>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
                  {result.driver === result.conductor ? (
                    <p>{SAME_NUMBER_TEXT}</p>
                  ) : (
                    <>
                      <p className="font-medium text-white">
                        {NUMBERS[result.driver].planet} and {NUMBERS[result.conductor].planet}: {RELATION_TEXT[result.relation.mutual].label}
                      </p>
                      <p className="mt-1">{RELATION_TEXT[result.relation.mutual].text}</p>
                    </>
                  )}
                </div>
              </section>

              {friends && (
                <section>
                  <h3 className={H3}>Friendly numbers and colours for Driver {result.driver}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Fact label="Friendly numbers" value={friends.friends.join(', ') || 'None'} />
                    <Fact label="Neutral numbers" value={friends.neutral.join(', ') || 'None'} />
                    <Fact label="Numbers its planet is cool towards" value={friends.enemies.join(', ') || 'None'} />
                    <Fact label={`Colours linked with ${NUMBERS[result.driver].planet}`} value={NUMBERS[result.driver].colours.join(', ')} />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-white/60">
                    Often called lucky and unlucky numbers. They follow the traditional friendships between the planets that rule each number, and are a matter of preference, not of fortune.
                  </p>
                </section>
              )}
            </div>
          </div>

          <section>
            <h3 className={H3}>Planes and yogs</h3>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
              The square has eight lines: three rows, three columns and two diagonals. A line is complete when all three of its numbers are in your grid.
            </p>
            <ul className="grid gap-3 md:grid-cols-2">
              {lines.filter((l) => l.status !== 'single').map((l) => (
                <li key={l.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-white">{LINE_TEXT[l.id].name}</h4>
                    <span className="text-xs text-white/55">{l.cells.join('-')}</span>
                    <Badge tone={STATUS_TONE[l.status]}>{LINE_STATUS_LABEL[l.status]}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{lineReading(l.id, l.status)}</p>
                  {l.status === 'partial' && <p className="mt-1 text-xs text-white/55">Missing from this line: {l.absent.join(', ')}.</p>}
                </li>
              ))}
            </ul>
            {lines.some((l) => l.status === 'single') && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="font-medium text-white">Lightly drawn lines (one number of three)</h4>
                <ul className="mt-2 space-y-1 text-sm leading-relaxed text-white/70">
                  {lines.filter((l) => l.status === 'single').map((l) => (
                    <li key={l.id}>
                      <span className="text-white">{LINE_TEXT[l.id].name}</span> ({l.cells.join('-')}): has {l.present[0]}, about {LINE_TEXT[l.id].theme}.
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-relaxed text-white/55">
                  Tradition treats a line with a single number as an area to build with practice, neither a strength nor a gap.
                </p>
              </div>
            )}
          </section>

          <div className="grid gap-10 lg:grid-cols-2">
            <section>
              <h3 className={H3}>Repeated numbers</h3>
              {result.full.repeated.length ? (
                <ul className="space-y-3">
                  {result.full.repeated.map(({ digit, count }) => (
                    <li key={digit} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="grid h-9 min-w-9 flex-none place-items-center rounded-lg px-1.5 text-sm font-bold"
                        style={{ background: NUMBERS[digit].colour.fill, color: NUMBERS[digit].colour.ink }}>{digit} ×{count}</span>
                      <p className="text-sm leading-relaxed text-white/70">{repeatReading(digit, count)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/65">No number appears more than once in this grid.</p>
              )}
            </section>

            <section>
              <h3 className={H3}>Missing numbers</h3>
              {result.full.missing.length ? (
                <ul className="space-y-3">
                  {result.full.missing.map((d) => (
                    <li key={d} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border-2 border-dashed border-white/40 text-sm font-bold text-white/75">{d}</span>
                      <div className="text-sm leading-relaxed text-white/70">
                        <p><span className="font-medium text-white">{NUMBERS[d].planet}.</span> {MISSING_TEXT[d].meaning}</p>
                        <p className="mt-1 text-white/60">{MISSING_TEXT[d].practice}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/65">Every number from 1 to 9 is present in this grid.</p>
              )}
            </section>
          </div>

          {result.kua && (
            <section>
              <h3 className={H3}>Kua {result.kua.mansion}: favourable directions</h3>
              <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
                {KUA_GROUP_TEXT[result.kua.group]} These come from the Eight Mansions school of feng shui, which sits beside the Lo Shu grid in Indian practice.
              </p>
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(['shengQi', 'tianYi', 'yanNian', 'fuWei'] as const).map((key) => (
                  <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <dt className="text-xs uppercase tracking-wide text-white/55">{KUA_DIRECTION_TEXT[key].name}</dt>
                    <dd className="mt-1 font-heading text-lg text-white">{DIRECTION_NAME[result.kua!.directions[key]]}</dd>
                    <dd className="mt-1 text-xs leading-snug text-white/60">For {KUA_DIRECTION_TEXT[key].use}.</dd>
                  </div>
                ))}
              </dl>
              {result.kua.raw === 5 && (
                <p className="mt-3 text-xs leading-relaxed text-white/60">
                  The formula gives 5, the centre of the square, which has no direction of its own. Eight Mansions reads it as {result.kua.mansion} for a {result.gender === 'male' ? 'man' : 'woman'}.
                </p>
              )}
              {result.kua.solarYearAlternative && result.kua.solarYearAlternative.mansion !== result.kua.mansion && (
                <p className="mt-3 text-xs leading-relaxed text-white/60">
                  You were born before 4 February. Feng shui teachers who count the Chinese solar year would use {result.kua.solarYearAlternative.year} and give Kua {result.kua.solarYearAlternative.mansion}. This page uses the calendar year, as Indian numerology usually does.
                </p>
              )}
            </section>
          )}

          <section className="space-y-4">
            <HowCalculated steps={result.steps} />
            <NumerologyMethodLine method="Date digits with the Driver, Conductor and Kua added to the grid; zeros have no cell." />
            <ResultActions toolSlug="loshu-grid" link={{ dob: toISODate(result.date), gender: result.gender }} onSave={save} saveLabel="Save this grid" />
          </section>

          <PrintReport report={loShuReport(result)} />
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
