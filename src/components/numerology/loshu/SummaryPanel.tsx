import { Briefcase, CalendarClock, CheckCircle2, Compass, Heart, HeartPulse, Plus, Repeat } from 'lucide-react';
import type { AreaId, AreaSupport, DashaNow, LoShuResult, ReadingSummary, RemedyPriority } from '@/engine/numerology';
import { AREA_IDS, regardOf } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { RELATION_TEXT, SAME_NUMBER_TEXT } from '@/data/numerology/loshuText';
import {
  AREA_TEXT, GRID_WHAT, KUA_NOTE, START_HEADING, START_LEDE, START_NONE, SUMMARY_HEADING, SUMMARY_LABEL, SUMMARY_LEDE, WORDS_LINK,
  priorityHabit, priorityWhy, summaryAreas, summaryBuild, summaryRepeated, summaryStrong, summaryYear, yearRegard,
} from '@/data/numerology/lifeAreaText';
import { Card } from '@/components/ui/Card';
import { LoShuGrid } from '@/components/numerology/LoShuGrid';
import { CountDots, DigitChip, PanelSection } from './bits';

const ICON = { career: Briefcase, relationships: Heart, health: HeartPulse } as const;

export type TabId = 'summary' | 'grid' | 'areas' | 'years' | 'remedies' | 'lucky' | 'more';

interface Props {
  result: LoShuResult;
  now: DashaNow | null;
  support: Record<AreaId, AreaSupport>;
  summary: ReadingSummary;
  priorities: RemedyPriority[];
  /** Opens a tab, and scrolls to a part of it when an anchor is given. */
  onGo: (tab: TabId, anchor?: string) => void;
}

/** A number as a small vertical tile, so the three sit in one row even on a phone. */
function CoreNumber({ label, value, note, planet, extra = false }: { label: string; value: number | null; note: string; planet: string; extra?: boolean }) {
  const info = value ? NUMBERS[value as keyof typeof NUMBERS] : null;
  return (
    <div className={`flex flex-col items-center rounded-xl border p-2.5 text-center sm:p-3.5 ${extra ? 'border-dashed border-white/20 bg-white/[0.02]' : 'border-white/10 bg-white/[0.04]'}`}>
      <span className={`grid h-11 w-11 place-items-center rounded-lg font-heading text-xl font-bold sm:h-12 sm:w-12 sm:text-2xl ${info ? '' : 'border-2 border-dashed border-white/30 text-white/60'}`}
        style={info ? { background: info.colour.fill, color: info.colour.ink } : undefined}>
        {value ?? '–'}
      </span>
      <p className="mt-2 text-xs font-medium leading-tight text-white sm:text-sm">{label}</p>
      <p className="mt-0.5 text-xs text-white/75">{planet}</p>
      <p className="mt-0.5 text-[0.7rem] leading-snug text-white/65 sm:text-xs">{note}</p>
    </div>
  );
}

/**
 * The first screen after the button: the core numbers in one row, the grid, a few plain facts about
 * what is strong, what is missing and where the year stands, the three life areas as a count of key
 * numbers present, and where to start. Everything else in the report is one tap away.
 */
export function SummaryPanel({ result, now, support, summary, priorities, onGo }: Props) {
  const day = result.date.d;
  const dayNote = day < 10 ? `Born on day ${day}` : `Day ${day}: ${day}/${result.driver}`;
  const relation = result.driver === result.conductor
    ? SAME_NUMBER_TEXT.split('.')[0]
    : `${NUMBERS[result.driver].planet} and ${NUMBERS[result.conductor].planet}: ${RELATION_TEXT[result.relation.mutual].label.toLowerCase()}`;
  const regard = now ? regardOf(result, now.antar.number) : null;

  const rows: { key: keyof typeof SUMMARY_LABEL; icon: typeof CheckCircle2; text: string }[] = [
    { key: 'strong', icon: CheckCircle2, text: summaryStrong(summary.completeLines, summary.mostHeld) },
    { key: 'repeated', icon: Repeat, text: summaryRepeated(summary.repeated) },
    { key: 'build', icon: Plus, text: summaryBuild(summary.missing) },
    { key: 'areas', icon: Compass, text: summaryAreas(summary.strongestArea, summary.weakestArea) },
    ...(now && regard
      ? [{ key: 'year' as const, icon: CalendarClock, text: summaryYear(now.antar.number, yearRegard(result.driver, result.conductor, now.antar.number, regard.driver, regard.conductor)) }]
      : []),
  ];

  return (
    <div className="space-y-8" data-testid="loshu-summary">
      {/* On a phone the order is the numbers, the grid, the plain facts, then the areas. From a laptop the grid stands left with the numbers and facts beside it, and the areas run full width beneath; from a wide screen the areas join the right-hand column, so the tall grid card has company down its whole height. */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,400px)_1fr] lg:items-start lg:gap-x-6 lg:gap-y-5">
        <div className="order-1 lg:col-start-2 lg:row-start-1">
          <h3 className="font-heading text-h5 text-white">Your numbers</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <CoreNumber label="Mulank · Driver" value={result.driver} planet={NUMBERS[result.driver].planet} note={dayNote} />
            <CoreNumber label="Bhagyank · Conductor" value={result.conductor} planet={NUMBERS[result.conductor].planet} note="Whole date added down" />
            {result.kua
              ? <CoreNumber label="Kua · feng shui" value={result.kua.mansion} planet={`${result.kua.element}, ${result.kua.group}`} note={KUA_NOTE} extra />
              : <CoreNumber label="Kua · feng shui" value={null} planet="Needs a gender" note="Add one under Edit details" extra />}
          </div>
          <p className="mt-2 text-xs text-white/65">{relation}.</p>
        </div>

        <div className="order-3 rounded-2xl border border-gold-soft/25 bg-gold-bright/[0.05] p-4 sm:p-5 lg:col-start-2 lg:row-start-2">
          <h3 className="font-heading text-h5 text-white">{SUMMARY_HEADING}</h3>
          <ul className="mt-3 space-y-3">
            {rows.map(({ key, icon: Icon, text }) => (
              <li key={key} className="flex gap-3">
                <Icon className="mt-0.5 h-4 w-4 flex-none text-gold-soft" aria-hidden="true" />
                <p className="text-sm leading-relaxed">
                  <span className="font-medium text-white">{SUMMARY_LABEL[key]}: </span>
                  <span className="text-white/80">{text}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/65">{SUMMARY_LEDE}</p>
        </div>
        <div className="order-4 max-lg:mt-3 lg:col-span-2 lg:row-start-3 lg:mt-3 xl:col-span-1 xl:col-start-2 xl:mt-0">
        <PanelSection title="Career, relationships and health" lede="How many of the five numbers the tradition links with each area are in your grid, and which are to build.">
          <ul className="grid gap-3 md:grid-cols-3">
            {AREA_IDS.map((id) => {
              const s = support[id];
              const Icon = ICON[id];
              return (
                <li key={id}>
                  <button type="button" onClick={() => onGo('areas')}
                    className="h-full w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-gold-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright">
                    <span className="flex items-center gap-2 font-medium text-white"><Icon className="h-4 w-4 text-gold-soft" aria-hidden="true" />{AREA_TEXT[id].name}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1"><CountDots value={s.presentCount} band={s.band} small /><span className="text-xs text-white/75">{s.presentCount} of {s.keyCount} present</span></span>
                    <span className="mt-1.5 block text-sm text-white/80">{s.missingKeys.length ? `To build: ${s.missingKeys.join(', ')}` : 'All five present'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </PanelSection>
        </div>

        {/* The order and the column go on a wrapper: Card puts its className on an inner element, which would not take part in this layout. */}
        <div className="order-2 lg:col-start-1 lg:row-span-2 lg:row-start-1 xl:row-span-3">
        <Card className="p-5 sm:p-6">
          <h3 className="font-heading text-h5 text-white">Your Lo Shu grid</h3>
          <p className="mb-3 mt-1 text-xs leading-relaxed text-white/70">
            {GRID_WHAT}{' '}
            <button type="button" onClick={() => onGo('more', 'loshu-glossary')}
              className="text-brand-cyan-soft underline underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright">
              {WORDS_LINK}
            </button>
          </p>
          <LoShuGrid result={result} compact />
        </Card>
        </div>
      </div>

      <PanelSection title={START_HEADING} lede={priorities.length ? START_LEDE : START_NONE}>
        {priorities.length > 0 && (
          <>
            <ol className="grid gap-3 md:grid-cols-3">
              {priorities.map((p, i) => {
                const habit = priorityHabit(p.digit, p.areas);
                return (
                  <li key={p.digit} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <DigitChip digit={p.digit} missing />
                    <div className="text-sm leading-relaxed text-white/75">
                      <p className="text-white"><span className="text-white/65">{i + 1}. </span><span className="font-medium">{NUMBERS[p.digit].planet}</span></p>
                      <p className="mt-0.5">{priorityWhy(p)}</p>
                      {habit && <p className="mt-1.5 text-gold-pale"><span className="font-medium">Try: </span>{habit}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
            <button type="button" onClick={() => onGo('remedies')}
              className="mt-3 text-sm text-brand-cyan-soft underline underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright">
              See every remedy
            </button>
          </>
        )}
      </PanelSection>
    </div>
  );
}
