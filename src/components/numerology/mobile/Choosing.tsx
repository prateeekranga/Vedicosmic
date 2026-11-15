import { useState } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';
import {
  analyseMobile, normalizeMobile, type CompatibilityLevel, type Digit, type MobileCompatibility, type MobilePerson,
  type MobileResult, type NumberChecklist as Checklist, type PairYoga,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { CHECKLIST_INTRO, COMPARE_INTRO, LEVEL_LABEL, ROOTS_GROUP, ROOTS_INTRO } from '@/data/numerology/mobileText';
import { YOGA_LABEL } from '@/data/numerology/mobilePairText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { LEVEL_COLOUR } from './ReportCard';
import { cn } from '@/lib/cn';

const H4 = 'mb-2 font-heading text-lg text-white';
const list = (xs: (string | number)[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}` : String(xs[0] ?? ''));
/** Ten digits are written 5 + 5, the way Indian numbers are usually spoken; other lengths as they are. */
export const formatNumber = (digits: number[]) => (digits.length === 10 ? `${digits.slice(0, 5).join('')} ${digits.slice(5).join('')}` : digits.join(''));

/** Five small steps filled up to a level, in its colour. The level is always written beside it. */
export function MiniMeter({ level }: { level: CompatibilityLevel }) {
  return (
    <span aria-hidden="true" className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="h-1.5 w-3 rounded-full" style={{ background: s <= level ? LEVEL_COLOUR[level] : 'rgba(255,255,255,0.12)' }} />
      ))}
    </span>
  );
}

/** Every root from 1 to 9 for this person, grouped by how well it suits them, with this number's root marked. */
export function RootsGrid({ roots, current }: { roots: { root: Digit; compatibility: MobileCompatibility }[]; current: Digit }) {
  const groups = [
    { label: ROOTS_GROUP.suits, items: roots.filter((r) => r.compatibility.level >= 4) },
    { label: ROOTS_GROUP.neutral, items: roots.filter((r) => r.compatibility.level === 3) },
    { label: ROOTS_GROUP.weak, items: roots.filter((r) => r.compatibility.level <= 2) },
  ].filter((g) => g.items.length);
  return (
    <div data-testid="mobile-roots">
      <h4 className={H4}>Which totals suit you</h4>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">{ROOTS_INTRO}</p>
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">{g.label}</p>
            <ul className="flex flex-wrap gap-2">
              {g.items.sort((a, b) => b.compatibility.level - a.compatibility.level || a.root - b.root).map(({ root, compatibility }) => {
                const info = NUMBERS[root];
                const here = root === current;
                return (
                  <li key={root} className={cn('relative flex w-[7.25rem] items-center gap-2.5 rounded-xl border bg-white/[0.03] p-2.5',
                    here ? 'border-gold-soft/70 ring-1 ring-gold-soft/50' : 'border-white/10')}>
                    {here && (
                      <span className="absolute -top-2 right-2 rounded-full bg-gold-bright px-1.5 text-[0.6rem] font-bold uppercase leading-4 tracking-wide text-cosmic-darker">
                        this number
                      </span>
                    )}
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-lg font-heading text-xl font-bold"
                      style={{ background: info.colour.fill, color: info.colour.ink }}>{root}</span>
                    <span className="min-w-0">
                      <span className="block text-xs text-white/70">{info.planet}</span>
                      <MiniMeter level={compatibility.level} />
                      <span className="mt-0.5 block text-[0.7rem] text-white/60">{LEVEL_LABEL[compatibility.level]}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** What to look for in a new number, from the person's own numbers and grid. */
export function NumberChecklist({ checklist }: { checklist: Checklist }) {
  const byYoga = new Map<PairYoga, string[]>();
  for (const a of checklist.avoidNamed) byYoga.set(a.yoga, [...(byYoga.get(a.yoga) ?? []), a.key]);
  const flip = (k: string) => (k[0] === k[1] ? k : `${k}/${k[1]}${k[0]}`);
  const items = [
    `A total that adds down to ${list(checklist.best)}, ${LEVEL_LABEL[checklist.bestLevel].toLowerCase()} for you${checklist.good.length ? `; or else ${list(checklist.good)}` : ''}.`,
    'Last four digits that add down to one of those as well, and a last digit other than 0.',
    checklist.include.length
      ? `${list(checklist.include)} somewhere in the number: ${checklist.include.length === 1 ? 'it is' : 'they are'} missing from your Lo Shu grid.`
      : 'Your Lo Shu grid already has every number, so nothing needs adding.',
    `No digit more than ${checklist.maxRepeats} times, and no more than ${checklist.maxRun} of one digit in a row.`,
    `None of the named malefic pairs, in either order: ${[...byYoga].map(([y, keys]) => `${YOGA_LABEL[y]} ${keys.map(flip).join(', ')}`).join('; ')}.`,
    `Fewer of the chart’s other malefic pairs: ${checklist.avoidOther.map(flip).join(', ')}.`,
  ];
  return (
    <div data-testid="mobile-checklist">
      <h4 className={H4}>What to look for in a new number</h4>
      <p className="mb-3 max-w-3xl text-sm leading-relaxed text-white/65">{CHECKLIST_INTRO}</p>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-white/80">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-gold-soft" aria-hidden="true" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MAX_EXTRA = 4;

/**
 * Up to four more numbers beside this one, each read with the same date of birth, purpose and
 * name. Nothing leaves the page: the numbers live only in this component's state.
 */
export function CompareNumbers({ base, person }: { base: MobileResult; person: MobilePerson }) {
  const [inputs, setInputs] = useState<string[]>(['', '']);
  const [rows, setRows] = useState<MobileResult[] | null>(null);
  const [errors, setErrors] = useState<boolean[]>([]);

  const compare = () => {
    const errs = inputs.map((t) => t.trim() !== '' && !normalizeMobile(t).valid);
    setErrors(errs);
    const others = inputs.filter((t, i) => t.trim() && !errs[i]).map((t) => analyseMobile(t, person)).filter((r): r is MobileResult => r !== null);
    setRows(others.length ? [base, ...others] : null);
  };
  const best = rows ? Math.max(...rows.map((r) => r.withBirth?.score.total ?? 0)) : 0;

  return (
    <div data-testid="mobile-compare">
      <h4 className={H4}>Compare numbers</h4>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">{COMPARE_INTRO}</p>
      <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
        {inputs.map((value, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Input id={`compare-${i}`} label={`Number ${i + 2}`} type="tel" inputMode="tel" autoComplete="off" value={value}
                placeholder="e.g. 99887 66554" error={errors[i] ? 'Use 7 to 15 digits.' : undefined}
                onChange={(e) => setInputs(inputs.map((v, j) => (j === i ? e.target.value : v)))} />
            </div>
            {inputs.length > 1 && (
              <button type="button" aria-label={`Remove number ${i + 2}`} onClick={() => { setInputs(inputs.filter((_, j) => j !== i)); setErrors([]); }}
                className="mb-1 grid h-10 w-10 flex-none place-items-center rounded-lg border border-white/15 text-white/70 hover:text-white">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={compare} disabled={!inputs.some((t) => t.trim())}>Compare</Button>
        {inputs.length < MAX_EXTRA && (
          <Button variant="ghost" onClick={() => setInputs([...inputs, ''])}><Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Add another</Button>
        )}
      </div>

      {rows && (
        <div className="mt-5">
          {/* A table from 768px; cards below, where six columns will not fit. */}
          <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">The numbers compared, each scored against the same date of birth</caption>
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/55">
                <tr>
                  <th scope="col" className="p-3 pl-5 font-medium">Number</th>
                  <th scope="col" className="p-3 font-medium">Score</th>
                  <th scope="col" className="p-3 font-medium">Root</th>
                  <th scope="col" className="p-3 font-medium">Fit level</th>
                  <th scope="col" className="p-3 font-medium">Pairs</th>
                  <th scope="col" className="p-3 pr-5 font-medium">Ending</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => <CompareRow key={i} r={r} first={i === 0} top={(r.withBirth?.score.total ?? -1) === best} />)}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {rows.map((r, i) => <CompareCard key={i} r={r} first={i === 0} top={(r.withBirth?.score.total ?? -1) === best} />)}
          </ul>
        </div>
      )}
    </div>
  );
}

function summary(r: MobileResult) {
  const b = r.withBirth!;
  const t = r.sequence.reduce((a, p) => ({ ...a, [p.impact]: a[p.impact] + 1 }), { benefic: 0, neutral: 0, malefic: 0 });
  const malefic = r.yogas.filter((y) => y.impact === 'malefic').map((y) => YOGA_LABEL[y.yoga]);
  return {
    pairs: `${t.benefic} benefic · ${t.neutral} neutral · ${t.malefic} malefic`,
    yogas: malefic.length ? malefic.join(', ') : null,
    ending: b.endingFit ? `root ${r.ending.root}, ${LEVEL_LABEL[b.endingFit.level].toLowerCase()}` : 'all zeros',
  };
}

function NumberLabel({ r, first, top }: { r: MobileResult; first: boolean; top: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-heading text-base text-white">{formatNumber(r.digits)}</span>
      {first && <Badge tone="neutral">this number</Badge>}
      {top && <Badge tone="gold">highest score</Badge>}
    </span>
  );
}

function CompareRow({ r, first, top }: { r: MobileResult; first: boolean; top: boolean }) {
  const b = r.withBirth!;
  const s = summary(r);
  return (
    <tr className={cn('border-b border-white/5 align-top last:border-0', top && 'bg-gold-bright/[0.05]')}>
      <th scope="row" className="p-3 pl-5 font-normal"><NumberLabel r={r} first={first} top={top} /></th>
      <td className="p-3"><span className="font-heading text-lg text-white">{b.score.total}</span> <span className="text-white/60">· {LEVEL_LABEL[b.score.band]}</span></td>
      <td className="p-3 text-white/80">{r.root} · {NUMBERS[r.root].planet}</td>
      <td className="p-3"><span className="flex items-center gap-2 text-white/80"><MiniMeter level={b.compatibility.level} />{LEVEL_LABEL[b.compatibility.level]}</span></td>
      <td className="p-3 text-white/75">{s.pairs}{s.yogas && <span className="block text-xs text-warning">{s.yogas}</span>}</td>
      <td className="p-3 pr-5 text-white/75">{s.ending}</td>
    </tr>
  );
}

function CompareCard({ r, first, top }: { r: MobileResult; first: boolean; top: boolean }) {
  const b = r.withBirth!;
  const s = summary(r);
  return (
    <li className={cn('rounded-xl border bg-white/[0.03] p-4', top ? 'border-gold-soft/50' : 'border-white/10')}>
      <NumberLabel r={r} first={first} top={top} />
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-white/55">Score</dt><dd className="text-white"><span className="font-heading">{b.score.total}</span> · {LEVEL_LABEL[b.score.band]}</dd>
        <dt className="text-white/55">Root</dt><dd className="text-white/80">{r.root} · {NUMBERS[r.root].planet}</dd>
        <dt className="text-white/55">Fit level</dt><dd className="flex items-center gap-2 text-white/80"><MiniMeter level={b.compatibility.level} />{LEVEL_LABEL[b.compatibility.level]}</dd>
        <dt className="text-white/55">Pairs</dt><dd className="text-white/80">{s.pairs}{s.yogas && <span className="block text-xs text-warning">{s.yogas}</span>}</dd>
        <dt className="text-white/55">Ending</dt><dd className="text-white/80">{s.ending}</dd>
      </dl>
    </li>
  );
}
