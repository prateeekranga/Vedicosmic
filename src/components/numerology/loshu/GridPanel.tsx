import { DIGITS, LOSHU_LINES, type DashaGrid, type DashaNow, type Digit, type LineId, type LineStatus, type LoShuResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import {
  KUA_TEXT, LINE_STATUS_LABEL, LINE_TEXT, MISSING_TEXT, RELATION_TEXT, SAME_NUMBER_TEXT, lineReading, repeatReading,
} from '@/data/numerology/loshuText';
import { NUMBERS_NOTE, PANEL_TEXT } from '@/data/numerology/lifeAreaText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoShuGrid } from '@/components/numerology/LoShuGrid';
import { NumberCard } from '@/components/numerology/NumberCard';
import { DigitChip, Notes, PanelSection } from './bits';

const ORDER: Record<LineStatus, number> = { full: 0, partial: 1, single: 2, empty: 3 };
const TONE: Record<LineStatus, 'gold' | 'cyan' | 'neutral'> = { full: 'gold', partial: 'cyan', single: 'neutral', empty: 'neutral' };
const cells = (id: LineId) => LOSHU_LINES.find((l) => l.id === id)!.cells.join('-');

/**
 * The foundation of the reading: the interactive grid, what the core numbers mean, the eight lines
 * in one table (prose only for complete lines and lines one number short), and each number of the
 * square in the order the square lays them out. Everything the later tabs build on comes first.
 */
export function GridPanel({ result, now, period }: { result: LoShuResult; now: DashaNow | null; period: DashaGrid | null }) {
  const lines = [...result.full.lines].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const order: readonly Digit[] = DIGITS;

  return (
    <div className="space-y-10">
      {/* On a large screen the square stands on the left of its explanation inside one wide card, so the card is not a tall one beside an empty column. */}
      <Card className="p-5 sm:p-6">
        <LoShuGrid wide result={result} period={period && now ? { grid: period.grid, maha: now.maha.number, antar: now.antar.number } : undefined} />
      </Card>

      <PanelSection title="What your numbers mean" lede={PANEL_TEXT.meaning}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
          <NumberCard label="Mulank · Driver" value={result.driver} system="Lo Shu (Indian)" note="From the day you were born: your everyday nature.">
            {NUMBERS[result.driver].strength}
          </NumberCard>
          <NumberCard label="Bhagyank · Conductor" value={result.conductor} system="Lo Shu (Indian)" note="From the whole date: the direction your life takes.">
            Its theme is {NUMBERS[result.conductor].keyword.toLowerCase()}. {NUMBERS[result.conductor].growthEdge}
          </NumberCard>
          {result.kua && (
            <NumberCard label="Kua number" value={result.kua.mansion} system="Eight Mansions" note="From the year and gender: your favourable directions.">
              {KUA_TEXT[result.kua.mansion]}
            </NumberCard>
          )}
          {/* Laid out like the number cards beside it: the two numbers as chips, a title, a line, then the reading. */}
          <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <span className="flex flex-none gap-1">
                {[result.driver, result.conductor].map((d, i) => (
                  <span key={i} className="grid h-12 w-9 place-items-center rounded-lg font-heading text-lg font-bold"
                    style={{ background: NUMBERS[d].colour.fill, color: NUMBERS[d].colour.ink }}>{d}</span>
                ))}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-white">Driver and Conductor</h4>
                <p className="text-xs text-white/60">
                  {NUMBERS[result.driver].planet} and {NUMBERS[result.conductor].planet} · {result.driver === result.conductor ? 'the same number' : RELATION_TEXT[result.relation.mutual].label.toLowerCase()}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/75">{result.driver === result.conductor ? SAME_NUMBER_TEXT : RELATION_TEXT[result.relation.mutual].text}</p>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="The eight lines" lede={PANEL_TEXT.lines} testId="loshu-lines-table">
        {/* On a phone each line is a small card, so its reading is not squeezed into a narrow column. */}
        <ul className="space-y-2 sm:hidden">
          {lines.map((l) => (
            <li key={l.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">{LINE_TEXT[l.id].name}</span>
                <span className="text-xs text-white/65">{cells(l.id)}</span>
                <Badge tone={TONE[l.status]}>{LINE_STATUS_LABEL[l.status]}</Badge>
              </p>
              {(l.status === 'full' || l.status === 'partial') && (
                <p className="mt-2 leading-relaxed text-white/75">
                  {lineReading(l.id, l.status)}
                  {l.status === 'partial' && <span className="mt-1 block text-xs text-white/65">One number short: {l.absent[0]} completes it.</span>}
                </p>
              )}
            </li>
          ))}
        </ul>
        <div role="region" aria-label="The eight lines of the square" tabIndex={0} className="hidden overflow-x-auto rounded-xl border border-white/10 sm:block">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">The eight lines of the square, with the numbers in each, whether it is complete, and a reading for complete lines and lines one number short</caption>
            <thead>
              <tr>
                <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-white/65">Line</th>
                <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-white/65">State</th>
                <th scope="col" className="p-3 text-xs font-medium uppercase tracking-wide text-white/65">Reading</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-t border-white/5 align-top">
                  <th scope="row" className="whitespace-nowrap p-3 font-normal text-white">
                    {LINE_TEXT[l.id].name}<span className="ml-2 text-xs text-white/65">{cells(l.id)}</span>
                  </th>
                  <td className="p-3"><Badge tone={TONE[l.status]}>{LINE_STATUS_LABEL[l.status]}</Badge></td>
                  <td className="p-3 leading-relaxed text-white/75">
                    {l.status === 'full' || l.status === 'partial' ? (
                      <>
                        {lineReading(l.id, l.status)}
                        {l.status === 'partial' && <span className="mt-1 block text-xs text-white/65">One number short: {l.absent[0]} completes it.</span>}
                      </>
                    ) : <span className="text-white/55">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelSection>

      <PanelSection title="Number by number" lede={PANEL_TEXT.numbers} testId="loshu-numbers">
        <ul className="grid gap-2.5 md:grid-cols-2">
          {order.map((d) => {
            const count = result.full.counts[d];
            return (
              <li key={d} className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <DigitChip digit={d} count={count} missing={count === 0} />
                <div className="text-sm leading-relaxed text-white/75">
                  <p className="font-medium text-white">{NUMBERS[d].planet}</p>
                  <p className="mt-0.5">{count === 0 ? MISSING_TEXT[d].meaning : repeatReading(d, count)}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <Notes className="mt-4" items={[NUMBERS_NOTE]} />
      </PanelSection>
    </div>
  );
}
