import { useState } from 'react';
import { motion } from 'framer-motion';
import { DIGITS, LOSHU_LAYOUT, formatYMD, type Digit, type LineResult, type LoShuResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LINE_TEXT, MISSING_TEXT, repeatReading } from '@/data/numerology/loshuText';
import { Switch } from '@/components/ui/Switch';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);

/** Where a number in the grid came from, in words: "twice from the date, once as the Conductor". */
function sourceWords(result: LoShuResult, d: Digit, view: 'full' | 'birth'): string {
  const s = result.sources[d];
  const parts: string[] = [];
  if (s.birth) parts.push(`${times(s.birth)} from the date`);
  if (view === 'full') {
    if (s.driver) parts.push('once as the Driver');
    if (s.conductor) parts.push('once as the Conductor');
    if (s.kua) parts.push('once as the Kua number');
  }
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0] ?? '';
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
 */
export function LoShuGrid({
  result, compact = false, className,
}: { result: LoShuResult; compact?: boolean; className?: string }) {
  const [dateOnly, setDateOnly] = useState(false);
  const [selected, setSelected] = useState<Digit | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const view = dateOnly ? 'birth' : 'full';
  const grid = dateOnly ? result.birth : result.full;
  const info = selected ? NUMBERS[selected] : null;
  const selectedCount = selected ? grid.counts[selected] : 0;
  const hasExtras = DIGITS.some((d) => result.sources[d].driver || result.sources[d].conductor || result.sources[d].kua);
  const complete = grid.lines.filter((l) => l.status === 'full').sort((a, b) => ARROW_ORDER[arrowKind(a)] - ARROW_ORDER[arrowKind(b)]);
  const unformedYogs = grid.lines.filter((l) => l.kind === 'diagonal' && l.status !== 'full');
  const lineLabel = (l: LineResult) => `${LINE_TEXT[l.id].name} ${l.cells.join('-')}`;

  return (
    <div className={className}>
      <div className="relative isolate mx-auto w-full max-w-[380px]">
        <table className="w-full table-fixed border-separate border-spacing-2">
          <caption className="sr-only">
            Lo Shu grid for {formatYMD(result.date)}, {dateOnly ? 'date digits only' : 'with Driver, Conductor and Kua added'}.
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
                          {present ? `, appears ${times(count)}: ${sourceWords(result, d, view)}` : `, ${n.planet}`}
                        </span>
                        {!dateOnly && (s.driver || s.conductor || s.kua) ? (
                          <span aria-hidden="true" className="absolute right-1 top-1 z-20 flex gap-0.5">
                            {s.driver ? <Mark letter="D" /> : null}
                            {s.conductor ? <Mark letter="C" /> : null}
                            {s.kua ? <Mark letter="K" /> : null}
                          </span>
                        ) : null}
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
              // Keyed by view as well, so switching to the date-only grid draws its arrows afresh.
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
        {!dateOnly && hasExtras && ' D, C and K mark a number added as the Driver, Conductor or Kua.'}
      </p>

      {!compact && (
        <>
          <div className="mx-auto mt-3 flex max-w-[380px] items-center gap-3">
            <Switch checked={dateOnly} onChange={setDateOnly} label="Show the date digits only" id="loshu-date-only" />
            <label htmlFor="loshu-date-only" className="text-sm text-white/75">Show the date digits only</label>
          </div>

          <div aria-live="polite" className="mx-auto mt-4 min-h-[5.5rem] max-w-[380px] rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
            {info && selected ? (
              <>
                <p className="font-medium text-white">{selected} · {info.planet} ({info.sanskrit}) · {info.keyword}</p>
                <p className="mt-1">
                  {selectedCount > 0
                    ? <>Appears {times(selectedCount)}: {sourceWords(result, selected, view)}. {repeatReading(selected, selectedCount)}</>
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

function Mark({ letter }: { letter: 'D' | 'C' | 'K' }) {
  return (
    <span className="grid h-4 w-4 place-items-center rounded-full bg-cosmic-darker text-[0.6rem] font-bold leading-none text-white">
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
