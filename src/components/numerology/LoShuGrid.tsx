import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { DIGITS, LOSHU_LAYOUT, formatYMD, type Counts, type Digit, type GridAnalysis, type LineResult, type LoShuResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LINE_TEXT, MISSING_TEXT, repeatReading } from '@/data/numerology/loshuText';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { ARROW_ORDER, arrowGeometry, arrowKind, type ArrowKind } from './loshuGeometry';
import { cn } from '@/lib/cn';

const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);
const listWords = (parts: string[]) => (parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0] ?? '');

/** The size of a cell's digits: the longer the run (22, 222, 2222), the smaller each digit, so that it always fits its cell. */
const digitSize = (count: number) => (count <= 2 ? 'text-2xl sm:text-3xl' : count === 3 ? 'text-2xl sm:text-[1.7rem]' : count <= 5 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl');

/** The grid with the numbers of the running dasha periods added, for the "current dasha" view. */
export interface GridPeriod {
  grid: GridAnalysis;
  /** The Maha Dasha and Antar Dasha numbers that were added. */
  maha: Digit;
  antar: Digit;
}

/**
 * The full grid with further numbers added, such as the digits of a phone number, for a view of
 * its own. Each cell shows how many it gained as a gold "+n".
 */
export interface GridAddition {
  grid: GridAnalysis;
  /** How many of each number 1–9 this view adds. */
  added: Counts;
  /** The view's name on its button, e.g. "With this phone number". */
  label: string;
  /** What was added, for the caption and cell text: "the phone number". */
  source: string;
}

type View = 'full' | 'birth' | 'period' | 'added';

/** Where a number in the grid came from, in words: "twice from the date, once as the Conductor". */
function sourceWords(result: LoShuResult, d: Digit, view: View, period?: GridPeriod, addition?: GridAddition): string {
  const s = result.sources[d];
  const parts: string[] = [];
  if (s.birth) parts.push(`${times(s.birth)} from the date`);
  if (view !== 'birth') {
    if (s.driver) parts.push('once as the Driver');
    if (s.conductor) parts.push('once as the Conductor');
    if (s.kua) parts.push('once as the Kua number');
  }
  if (view === 'period' && period) {
    if (period.maha === d) parts.push('once for the Maha Dasha');
    if (period.antar === d) parts.push('once for the Antar Dasha');
  }
  if (view === 'added' && addition && addition.added[d]) parts.push(`${times(addition.added[d])} from ${addition.source}`);
  return listWords(parts);
}

/** Light colours, so the dark numbers stay readable where an arrow passes behind them. */
const ARROW_COLOUR: Record<ArrowKind, string> = { golden: '#FFD24A', silver: '#E4E8F2', row: '#6CCBF7', column: '#BBA4FF' };

/**
 * The Lo Shu square as a real table, so a screen reader announces three rows of three cells.
 * Each cell is a button that opens a short explanation below the grid. Present, repeated and
 * missing numbers differ in text and border as well as colour, and a number that repeats is written as
 * many times as it appears: 99 for two 9s, 999 for three.
 *
 * Every complete line of three gets an arrow drawn across it: gold for the Golden Raj Yog
 * (4-5-6), silver for the Silver Raj Yog (2-5-8), blue for a row and violet for a column. The
 * list under the grid names each arrow in words, so nothing depends on telling the colours apart.
 *
 * With `period`, a third view shows the grid as teachers read the current year: the numbers of
 * the running Maha Dasha and Antar Dasha added, and the arrows that then appear. With `addition`,
 * the grid opens on a view with other numbers added, such as the digits of a phone number.
 */
export function LoShuGrid({
  result, period, addition, compact = false, wide = false, className,
}: { result: LoShuResult; period?: GridPeriod; addition?: GridAddition; compact?: boolean; wide?: boolean; className?: string }) {
  const [chosen, setChosen] = useState<View>(addition ? 'added' : 'full');
  const [selected, setSelected] = useState<Digit | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const viewName = useId();
  const view: View = (chosen === 'period' && !period) || (chosen === 'added' && !addition) ? 'full' : chosen;
  const grid = view === 'birth' ? result.birth : view === 'period' && period ? period.grid : view === 'added' && addition ? addition.grid : result.full;
  const info = selected ? NUMBERS[selected] : null;
  const selectedCount = selected ? grid.counts[selected] : 0;
  const repeatedDigit = DIGITS.find((d) => grid.counts[d] > 1);
  const firstRepeat = repeatedDigit ? grid.counts[repeatedDigit] : 0;
  const anyMissing = DIGITS.some((d) => grid.counts[d] === 0);
  const hasExtras = DIGITS.some((d) => result.sources[d].driver || result.sources[d].conductor || result.sources[d].kua);
  const complete = grid.lines.filter((l) => l.status === 'full').sort((a, b) => ARROW_ORDER[arrowKind(a)] - ARROW_ORDER[arrowKind(b)]);
  const unformedYogs = grid.lines.filter((l) => l.kind === 'diagonal' && l.status !== 'full');
  const lineLabel = (l: LineResult) => `${LINE_TEXT[l.id].name} ${l.cells.join('-')}`;
  const viewWords = view === 'birth' ? 'date digits only'
    : view === 'period' ? 'with Driver, Conductor, Kua and the running Maha Dasha and Antar Dasha added'
    : view === 'added' && addition ? `with Driver, Conductor, Kua and the digits of ${addition.source} added`
    : 'with Driver, Conductor and Kua added';
  const plus = (d: Digit) => (view === 'added' && addition ? addition.added[d] : 0);
  const views: { id: View; label: string }[] = [
    ...(addition ? [{ id: 'added' as const, label: addition.label }] : []),
    { id: 'full', label: addition ? 'Your grid alone' : 'All numbers' },
    { id: 'birth', label: 'Date digits only' },
    ...(period ? [{ id: 'period' as const, label: 'With current dasha' }] : []),
  ];

  // With `wide`, a large screen puts the square on the left and everything that explains it on the right, so a wide card is not a tall one with an empty side.
  const narrow = cn('mx-auto max-w-[380px]', wide && 'lg:mx-0 lg:max-w-none');

  return (
    <div className={cn(className, wide && 'lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-x-10')}>
      <div className="relative isolate mx-auto w-full max-w-[380px]">
        <table className="w-full table-fixed border-separate border-spacing-2">
          <caption className="sr-only">
            Lo Shu grid for {formatYMD(result.date)}, {viewWords}.
            Rows read 4 9 2, 3 5 7 and 8 1 6.
            {complete.length ? ` Complete lines, each drawn across the grid: ${complete.map(lineLabel).join(', ')}.` : ' No line of three is complete.'}
          </caption>
          <tbody>
            {LOSHU_LAYOUT.map((row) => (
              <tr key={row.join('')}>
                {row.map((d) => {
                  const count = grid.counts[d];
                  const n = NUMBERS[d];
                  const s = result.sources[d];
                  const present = count > 0;
                  const marks: string[] = [];
                  if (view !== 'birth') {
                    if (s.driver) marks.push('D');
                    if (s.conductor) marks.push('C');
                    if (s.kua) marks.push('K');
                  }
                  if (view === 'period' && period) {
                    if (period.maha === d) marks.push('M');
                    if (period.antar === d) marks.push('A');
                  }
                  // The button's name is its own text, starting with what is visible ("9 ×2 Mars"),
                  // so voice-control users can say what they see; the rest is for screen readers.
                  // The text sits above the arrow layer (z-20 over z-10) and the cell colour below it.
                  return (
                    <td key={d} className="p-0">
                      <button
                        type="button"
                        aria-pressed={selected === d}
                        onClick={() => setSelected(selected === d ? null : d)}
                        className={cn(
                          'relative flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 p-1 transition-shadow',
                          present ? 'border-transparent' : 'border-dashed border-white/40 bg-white/[0.03]',
                          selected === d && 'ring-2 ring-brand-cyan ring-offset-2 ring-offset-cosmic-darker',
                        )}
                        style={present ? { background: n.colour.fill, color: n.colour.ink } : undefined}
                      >
                        {/* The arrows run the full length of each line on a layer behind the cell text, uncropped; the numbers sit on top of them. */}
                        {/* A repeated number is written as many times as it appears (22, 222), a little smaller as the run grows. The digit is also given once, for a screen reader. */}
                        <span className={cn('relative z-20 font-heading font-bold leading-none tracking-tight', digitSize(count), !present && 'text-white/70')}>
                          {present ? <><span aria-hidden="true">{String(d).repeat(count)}</span>{count > 1 && <span className="sr-only">{d}</span>}</> : d}
                        </span>
                        {' '}
                        <span className={cn('relative z-20 mt-1 text-[0.65rem] font-medium uppercase tracking-wide', !present && 'text-white/60')}>
                          {present ? n.planet : 'missing'}
                        </span>
                        <span className="sr-only">
                          {present ? `, appears ${times(count)}: ${sourceWords(result, d, view, period, addition)}` : `, ${n.planet}`}
                        </span>
                        {marks.length > 0 && (
                          <span aria-hidden="true" className="absolute right-1 top-1 z-20 flex gap-0.5">
                            {marks.map((letter) => <Mark key={letter} letter={letter} period={letter === 'M' || letter === 'A'} />)}
                          </span>
                        )}
                        {plus(d) > 0 && (
                          <span aria-hidden="true" className="absolute left-1 top-1 z-20 rounded-full bg-gold-bright px-1.5 text-[0.65rem] font-bold leading-4 text-cosmic-darker ring-1 ring-cosmic-darker">
                            +{plus(d)}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {complete.length > 0 && (
          <svg aria-hidden="true" viewBox="0 0 300 300" data-testid="loshu-arrows"
            className="pointer-events-none absolute left-1 top-1 z-10 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] overflow-visible">
            {complete.map((line, i) => {
              const kind = arrowKind(line);
              const colour = ARROW_COLOUR[kind];
              const yog = kind === 'golden' || kind === 'silver';
              const { start, neck, headPath, sparkles } = arrowGeometry(line);
              const delay = reducedMotion ? 0 : 0.25 + i * 0.2;
              const draw = reducedMotion ? { duration: 0 } : { delay, duration: 0.7, ease: 'easeOut' as const };
              const width = yog ? 5.5 : 4.5;
              // Keyed by view as well, so switching view draws that view's arrows afresh.
              return (
                <g key={`${view}-${line.id}`} data-line={line.id}>
                  {/* A dark edge under the colour keeps the arrow visible on pale cells such as the gold 1. */}
                  <motion.line x1={start.x} y1={start.y} x2={neck.x} y2={neck.y} stroke="#1A1330" strokeOpacity={0.55}
                    strokeWidth={width + 3} strokeLinecap="round"
                    initial={{ pathLength: reducedMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={draw} />
                  <motion.line x1={start.x} y1={start.y} x2={neck.x} y2={neck.y} stroke={colour}
                    strokeWidth={width} strokeLinecap="round"
                    style={yog ? { filter: `drop-shadow(0 0 5px ${colour})` } : undefined}
                    initial={{ pathLength: reducedMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={draw} />
                  <motion.path d={headPath} fill={colour} stroke="#1A1330" strokeOpacity={0.55} strokeWidth={1.5} strokeLinejoin="round"
                    initial={{ opacity: reducedMotion ? 1 : 0 }} animate={{ opacity: 1 }}
                    transition={reducedMotion ? { duration: 0 } : { delay: delay + 0.6, duration: 0.25 }} />
                  {/* The two yogs glitter briefly once drawn; under five seconds, and not at all with reduced motion. */}
                  {yog && !reducedMotion && sparkles.map((p, si) => (
                    <motion.circle key={si} cx={p.x} cy={p.y} r={2.6} fill="#FFFFFF"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }}
                      transition={{ duration: 1.3, repeat: 1, delay: delay + 0.8 + p.delay, ease: 'easeInOut' }}
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
                  ))}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* From a wide screen the right-hand side has two columns: the legend and notes, then the view choice and the cell reading. */}
      <div className={wide ? 'min-w-0 xl:grid xl:grid-cols-2 xl:items-start xl:gap-x-8' : undefined}>
      <div>
      <div className={cn(narrow, 'mt-3', wide && 'lg:mt-0')} data-testid="loshu-lines">
        {complete.length > 0 ? (
          <>
            <p className="text-xs font-medium text-white/75">
              {complete.length === 1 ? 'One line is complete, drawn across the grid:' : `${complete.length} lines are complete, each drawn across the grid:`}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {complete.map((l) => {
                const colour = ARROW_COLOUR[arrowKind(l)];
                return (
                  <li key={l.id} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: `${colour}80`, background: `${colour}1A` }}>
                    <ArrowSwatch colour={colour} />
                    <span className="font-medium text-white">{LINE_TEXT[l.id].name}</span>
                    <span className="text-white/65">{l.cells.join('-')}</span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="text-xs text-white/65">No line of three is complete in this grid, so no line is drawn.</p>
        )}
        {!compact && unformedYogs.length > 0 && (
          <p className="mt-2 text-xs leading-relaxed text-white/60">
            {unformedYogs.map((l) => `${LINE_TEXT[l.id].name} (${l.cells.join('-')}) is not formed: ${l.absent.join(' and ')} ${l.absent.length === 1 ? 'is' : 'are'} missing.`).join(' ')}
          </p>
        )}
      </div>

      <p className={cn(narrow, 'mt-3 text-xs leading-relaxed text-white/60')}>
        {repeatedDigit && `A number is written as often as it appears: “${String(repeatedDigit).repeat(firstRepeat)}” means ${repeatedDigit} appears ${times(firstRepeat)}. `}
        {anyMissing && 'A dashed cell is a missing number: a quality to build, not a fault.'}
        {view !== 'birth' && hasExtras && ' D, C and K mark a number added as the Driver, Conductor or Kua.'}
        {view === 'period' && ' M and A mark a number added for the running Maha Dasha and Antar Dasha.'}
        {view === 'added' && addition && ` A gold +1 or +2 shows how many of that number come from ${addition.source}.`}
      </p>
      </div>

      {!compact && (
        <div>
          <fieldset className={cn(narrow, 'mt-4', wide && 'lg:mt-5 xl:mt-0')}>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">Numbers shown in the grid</legend>
            <div className="flex flex-wrap gap-2">
              {views.map((v) => (
                <label key={v.id} className="cursor-pointer">
                  <input type="radio" name={viewName} value={v.id} checked={view === v.id} onChange={() => setChosen(v.id)} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/75 transition-colors peer-checked:border-gold-soft/60 peer-checked:bg-gold-bright/15 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan">
                    {v.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div aria-live="polite" className={cn(narrow, 'mt-4 min-h-[5.5rem] rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75')}>
            {info && selected ? (
              <>
                <p className="font-medium text-white">{selected} · {info.planet} ({info.sanskrit}) · {info.keyword}</p>
                <p className="mt-1">
                  {selectedCount > 0
                    ? <>Appears {times(selectedCount)}: {sourceWords(result, selected, view, period, addition)}. {repeatReading(selected, selectedCount)}</>
                    : <>{MISSING_TEXT[selected].meaning} {MISSING_TEXT[selected].practice}</>}
                </p>
              </>
            ) : (
              <p>Choose any cell to read what its number means in this grid.</p>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/** D, C and K are fixed numbers of the birth; M and A are the passing dasha numbers, in gold. */
function Mark({ letter, period }: { letter: string; period: boolean }) {
  return (
    <span className={cn('grid h-4 w-4 place-items-center rounded-full text-[0.6rem] font-bold leading-none',
      period ? 'bg-gold-bright text-cosmic-darker ring-1 ring-cosmic-darker' : 'bg-cosmic-darker text-white')}>
      {letter}
    </span>
  );
}

/** A small copy of the arrow, in its colour, beside the line's name. */
function ArrowSwatch({ colour }: { colour: string }) {
  return (
    <svg aria-hidden="true" width="26" height="10" viewBox="0 0 26 10" className="flex-none">
      <line x1="2" y1="5" x2="17" y2="5" stroke={colour} strokeWidth="3" strokeLinecap="round" />
      <path d="M25,5 L16,0.5 L16,9.5 Z" fill={colour} />
    </svg>
  );
}
