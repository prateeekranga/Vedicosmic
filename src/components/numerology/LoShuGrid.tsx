import { useState } from 'react';
import { DIGITS, LOSHU_LAYOUT, formatYMD, type Digit, type LoShuResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { MISSING_TEXT, repeatReading } from '@/data/numerology/loshuText';
import { Switch } from '@/components/ui/Switch';
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
 * The Lo Shu square as a real table, so a screen reader announces three rows of three cells.
 * Each cell is a button that opens a short explanation below the grid. Present, repeated and
 * missing numbers differ in text and border as well as colour, and repeats are written "9 ×3".
 */
export function LoShuGrid({
  result, compact = false, className,
}: { result: LoShuResult; compact?: boolean; className?: string }) {
  const [dateOnly, setDateOnly] = useState(false);
  const [selected, setSelected] = useState<Digit | null>(null);
  const view = dateOnly ? 'birth' : 'full';
  const grid = dateOnly ? result.birth : result.full;
  const info = selected ? NUMBERS[selected] : null;
  const selectedCount = selected ? grid.counts[selected] : 0;
  const hasExtras = DIGITS.some((d) => result.sources[d].driver || result.sources[d].conductor || result.sources[d].kua);

  return (
    <div className={className}>
      <table className="mx-auto w-full max-w-[380px] table-fixed border-separate border-spacing-2">
        <caption className="sr-only">
          Lo Shu grid for {formatYMD(result.date)}, {dateOnly ? 'date digits only' : 'with Driver, Conductor and Kua added'}.
          Rows read 4 9 2, 3 5 7 and 8 1 6.
        </caption>
        <tbody>
          {LOSHU_LAYOUT.map((row) => (
            <tr key={row.join('')}>
              {row.map((d) => {
                const count = grid.counts[d];
                const n = NUMBERS[d];
                const s = result.sources[d];
                const present = count > 0;
                const label = present
                  ? `${d}, ${n.planet}, appears ${times(count)}: ${sourceWords(result, d, view)}`
                  : `${d}, ${n.planet}, missing`;
                return (
                  <td key={d} className="p-0">
                    <button
                      type="button"
                      aria-label={label}
                      aria-pressed={selected === d}
                      onClick={() => setSelected(selected === d ? null : d)}
                      className={cn(
                        'relative flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 p-1 transition-shadow',
                        present ? 'border-transparent' : 'border-dashed border-white/40 bg-white/[0.03]',
                        selected === d && 'ring-2 ring-brand-cyan ring-offset-2 ring-offset-cosmic-darker',
                      )}
                      style={present ? { background: n.colour.fill, color: n.colour.ink } : undefined}
                    >
                      <span aria-hidden="true" className={cn('font-heading text-2xl font-bold leading-none sm:text-3xl', !present && 'text-white/70')}>
                        {d}{count > 1 && <span className="ml-1 text-base font-semibold sm:text-lg">×{count}</span>}
                      </span>
                      <span aria-hidden="true" className={cn('mt-1 text-[0.65rem] font-medium uppercase tracking-wide', !present && 'text-white/60')}>
                        {present ? n.planet : 'missing'}
                      </span>
                      {!dateOnly && (s.driver || s.conductor || s.kua) ? (
                        <span aria-hidden="true" className="absolute right-1 top-1 flex gap-0.5">
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
