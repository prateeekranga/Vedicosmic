import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { DIGITS, LOSHU_LAYOUT, formatYMD, type Digit, type GridAnalysis, type LineResult, type LoShuResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LINE_TEXT, MISSING_TEXT, repeatReading } from '@/data/numerology/loshuText';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);
const listWords = (parts: string[]) => (parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0] ?? '');

/** The grid with the numbers of the running dasha periods added, for the "current dasha" view. */
export interface GridPeriod {
  grid: GridAnalysis;
  /** The Maha Dasha and Antar Dasha numbers that were added. */
  maha: Digit;
  antar: Digit;
}

type View = 'full' | 'birth' | 'period';

/** Where a number in the grid came from, in words: "twice from the date, once as the Conductor". */
function sourceWords(result: LoShuResult, d: Digit, view: View, period?: GridPeriod): string {
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
  return listWords(parts);
}

/**
 * Arrows are drawn in a 300 × 300 box laid over the table, inset by half the 8px cell spacing so
 * that each cell and its gap take exactly one third: cell centres fall on 50, 150 and 250.
 */
const CENTRE: Record<number, { x: number; y: number }> = {};
LOSHU_LAYOUT.forEach((row, r) => row.forEach((d, c) => { CENTRE[d] = { x: 50 + c * 100, y: 50 + r * 100 }; }));

type ArrowKind = 'golden' | 'silver' | 'row' | 'column';
/** Light colours, so the dark numbers stay readable where an arrow passes behind them. */
const ARROW_COLOUR: Record<ArrowKind, string> = { golden: '#FFD24A', silver: '#E4E8F2', row: '#6CCBF7', column: '#BBA4FF' };
const ARROW_ORDER: Record<ArrowKind, number> = { golden: 0, silver: 1, row: 2, column: 3 };
const arrowKind = (l: LineResult): ArrowKind => (l.id === 'golden' ? 'golden' : l.id === 'silver' ? 'silver' : l.kind === 'row' ? 'row' : 'column');

/** The arrow for one complete line: it starts near the outer edge of the first cell and ends near that of the third. */
function arrowGeometry(line: LineResult) {
  const a = CENTRE[line.cells[0]], b = CENTRE[line.cells[2]];
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / length, uy = (b.y - a.y) / length;
  // A diagonal has further to go to reach the corner of its cell than a row has to reach the edge.
  const overshoot = line.kind === 'diagonal' ? 44 : 35;
  const head = 15, halfWidth = 7.5;
  const start = { x: a.x - ux * overshoot, y: a.y - uy * overshoot };
  const tip = { x: b.x + ux * overshoot, y: b.y + uy * overshoot };
  const neck = { x: tip.x - ux * head, y: tip.y - uy * head };
  const headPath = `M${tip.x},${tip.y} L${neck.x - uy * halfWidth},${neck.y + ux * halfWidth} L${neck.x + uy * halfWidth},${neck.y - ux * halfWidth} Z`;
  // Evenly spaced points with a fixed wobble, so the glitter looks scattered but never jumps between renders.
  const sparkles = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 1) / 8;
    const wobble = Math.sin(i * 12.9898) * 6;
    return { x: start.x + (neck.x - start.x) * t - uy * wobble, y: start.y + (neck.y - start.y) * t + ux * wobble, delay: (i * 0.22) % 1.4 };
  });
  return { start, neck, headPath, sparkles };
}

/**
 * The Lo Shu square as a real table, so a screen reader announces three rows of three cells.
 * Each cell is a button that opens a short explanation below the grid. Present, repeated and
 * missing numbers differ in text and border as well as colour, and repeats are written "9 ×3".
 *
 * Every complete line of three gets an arrow drawn across it: gold for the Golden Raj Yog
 * (4-5-6), silver for the Silver Raj Yog (2-5-8), blue for a row and violet for a column. The
 * list under the grid names each arrow in words, so nothing depends on telling the colours apart.
 *
 * With `period`, a third view shows the grid as teachers read the current year: the numbers of
 * the running Maha Dasha and Antar Dasha added, and the arrows that then appear.
 */
export function LoShuGrid({
  result, period, compact = false, className,
}: { result: LoShuResult; period?: GridPeriod; compact?: boolean; className?: string }) {
  const [chosen, setChosen] = useState<View>('full');
  const [selected, setSelected] = useState<Digit | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const viewName = useId();
  const view: View = chosen === 'period' && !period ? 'full' : chosen;
  const grid = view === 'birth' ? result.birth : view === 'period' && period ? period.grid : result.full;
  const info = selected ? NUMBERS[selected] : null;
  const selectedCount = selected ? grid.counts[selected] : 0;
  const hasExtras = DIGITS.some((d) => result.sources[d].driver || result.sources[d].conductor || result.sources[d].kua);
  const complete = grid.lines.filter((l) => l.status === 'full').sort((a, b) => ARROW_ORDER[arrowKind(a)] - ARROW_ORDER[arrowKind(b)]);
  const unformedYogs = grid.lines.filter((l) => l.kind === 'diagonal' && l.status !== 'full');
  const lineLabel = (l: LineResult) => `${LINE_TEXT[l.id].name} ${l.cells.join('-')}`;
  const viewWords = view === 'birth' ? 'date digits only' : view === 'period' ? 'with Driver, Conductor, Kua and the running Maha Dasha and Antar Dasha added' : 'with Driver, Conductor and Kua added';
  const views: { id: View; label: string }[] = [
    { id: 'full', label: 'All numbers' },
    { id: 'birth', label: 'Date digits only' },
    ...(period ? [{ id: 'period' as const, label: 'With current dasha' }] : []),
  ];

  return (
    <div className={className}>
      <div className="relative isolate mx-auto w-full max-w-[380px]">
        <table className="w-full table-fixed border-separate border-spacing-2">
          <caption className="sr-only">
            Lo Shu grid for {formatYMD(result.date)}, {viewWords}.
            Rows read 4 9 2, 3 5 7 and 8 1 6.
            {complete.length ? ` Complete lines, each marked with an arrow: ${complete.map(lineLabel).join(', ')}.` : ' No line of three is complete.'}
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
                        <span className={cn('relative z-20 font-heading text-2xl font-bold leading-none sm:text-3xl', !present && 'text-white/70')}>
                          {d}{count > 1 && <span className="ml-1 text-base font-semibold sm:text-lg">×{count}</span>}
                        </span>
                        {' '}
                        <span className={cn('relative z-20 mt-1 text-[0.65rem] font-medium uppercase tracking-wide', !present && 'text-white/60')}>
                          {present ? n.planet : 'missing'}
                        </span>
                        <span className="sr-only">
                          {present ? `, appears ${times(count)}: ${sourceWords(result, d, view, period)}` : `, ${n.planet}`}
                        </span>
                        {marks.length > 0 && (
                          <span aria-hidden="true" className="absolute right-1 top-1 z-20 flex gap-0.5">
                            {marks.map((letter) => <Mark key={letter} letter={letter} period={letter === 'M' || letter === 'A'} />)}
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

      <div className="mx-auto mt-3 max-w-[380px]" data-testid="loshu-lines">
        {complete.length > 0 ? (
          <>
            <p className="text-xs font-medium text-white/75">
              {complete.length === 1 ? 'One line is complete, marked with an arrow:' : `${complete.length} lines are complete, each marked with an arrow:`}
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
          <p className="text-xs text-white/65">No line of three is complete in this grid, so no arrow is drawn.</p>
        )}
        {unformedYogs.length > 0 && (
          <p className="mt-2 text-xs leading-relaxed text-white/60">
            {unformedYogs.map((l) => `${LINE_TEXT[l.id].name} (${l.cells.join('-')}) is not formed: ${l.absent.join(' and ')} ${l.absent.length === 1 ? 'is' : 'are'} missing.`).join(' ')}
          </p>
        )}
      </div>

      <p className="mx-auto mt-3 max-w-[380px] text-xs leading-relaxed text-white/60">
        “×3” means the number appears three times. A dashed cell is a missing number.
        {view !== 'birth' && hasExtras && ' D, C and K mark a number added as the Driver, Conductor or Kua.'}
        {view === 'period' && ' M and A mark a number added for the running Maha Dasha and Antar Dasha.'}
      </p>

      {!compact && (
        <>
          <fieldset className="mx-auto mt-4 max-w-[380px]">
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

          <div aria-live="polite" className="mx-auto mt-4 min-h-[5.5rem] max-w-[380px] rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
            {info && selected ? (
              <>
                <p className="font-medium text-white">{selected} · {info.planet} ({info.sanskrit}) · {info.keyword}</p>
                <p className="mt-1">
                  {selectedCount > 0
                    ? <>Appears {times(selectedCount)}: {sourceWords(result, selected, view, period)}. {repeatReading(selected, selectedCount)}</>
                    : <>{MISSING_TEXT[selected].meaning} {MISSING_TEXT[selected].practice}</>}
                </p>
              </>
            ) : (
              <p>Choose any cell to read what its number means in this grid.</p>
            )}
          </div>
        </>
      )}
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
