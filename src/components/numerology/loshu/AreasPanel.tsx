import type { ReactNode } from 'react';
import { Briefcase, Heart, HeartPulse, TriangleAlert, Wallet, type LucideIcon } from 'lucide-react';
import {
  AREA_IDS, LOSHU_LINES, sevensCaution, type AreaId, type AreaSupport, type Digit, type LineId, type LineStatus, type LoShuResult, type MoneyReading,
  type SupportBand,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LINE_STATUS_LABEL, LINE_TEXT, repeatReading } from '@/data/numerology/loshuText';
import {
  AREA_BAND_TEXT, AREA_NUMBER_TEXT, AREA_STEP_NONE, AREA_TEXT, FOLD_OWN_AREAS, HEALTH_NOTE, OWN_AREAS_NOTE, PANEL_TEXT,
} from '@/data/numerology/lifeAreaText';
import {
  MONEY_GOLDEN, MONEY_INTRO, MONEY_NOTE, MONEY_NUMBER_TEXT, MONEY_SOURCE, MONEY_STATE_TEXT, MONEY_TEXT, SEVENS_TITLE, sevensText,
} from '@/data/numerology/extrasText';
import { CountDots, DigitChip, Fold, Notes, PanelSection } from './bits';

const ICON: Readonly<Record<AreaId, LucideIcon>> = { career: Briefcase, relationships: Heart, health: HeartPulse };
const cells = (id: LineId) => LOSHU_LINES.find((l) => l.id === id)!.cells.join('-');

/** One number in an area: its digit, how often it is held, and the readings for the fold. */
interface KeyRow { digit: Digit; count: number; role: string; reading: string; habit: string | null; extra: string | null }

interface AreaCardProps {
  testId: string;
  anchor?: string;
  icon: LucideIcon;
  name: string;
  blurb: string;
  present: number;
  of: number;
  band: SupportBand;
  missing: Digit[];
  reading: ReactNode;
  keys: KeyRow[];
  lines: { id: LineId; status: LineStatus }[];
  step: ReactNode;
  foldIntro?: string;
  foldFoot?: string;
}

/**
 * One life area. Every card has the same seven rows, laid on the rows of the grid around it
 * (subgrid), so the count, the numbers, the reading, the line, the step and the fold sit at the
 * same height in the cards beside each other, however long a reading runs.
 */
function AreaCard(p: AreaCardProps) {
  const Icon = p.icon;
  return (
    <article id={p.anchor} data-testid={p.testId}
      className="grid scroll-mt-28 gap-y-4 rounded-2xl border border-white/10 bg-cosmic-light/40 p-5 shadow-card backdrop-blur-sm sm:p-6"
      style={{ gridTemplateRows: 'subgrid', gridRow: 'span 7' }}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 font-heading text-lg text-white"><Icon className="h-5 w-5 text-gold-soft" aria-hidden="true" />{p.name}</h4>
          <p className="mt-0.5 text-xs text-white/65">{p.blurb}</p>
        </div>
        <span className="flex-none rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-sm font-medium text-white">
          {p.present}<span className="text-white/55"> / {p.of}</span><span className="sr-only"> present</span>
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <CountDots value={p.present} max={p.of} band={p.band} />
        <span className="text-sm text-white/75">{p.missing.length ? <>To build: <span className="text-white">{p.missing.join(', ')}</span></> : 'Nothing missing'}</span>
      </div>

      <ul className="flex flex-wrap content-start gap-2" aria-label={`Numbers for ${p.name.toLowerCase()}`}>
        {p.keys.map((k) => <li key={k.digit} title={k.role}><DigitChip digit={k.digit} count={k.count} missing={k.count === 0} /></li>)}
      </ul>

      <p className="text-sm leading-relaxed text-white/80">{p.reading}</p>

      <ul className="space-y-1 text-xs text-white/70">
        {p.lines.map((l) => (
          <li key={l.id} className="flex flex-wrap gap-x-1.5">
            <span className="text-white/85">{LINE_TEXT[l.id].name}</span><span className="text-white/55">{cells(l.id)}</span>
            <span>· {LINE_STATUS_LABEL[l.status].toLowerCase()}</span>
          </li>
        ))}
      </ul>

      <div className="self-start rounded-lg border border-gold-soft/20 bg-gold-bright/[0.05] p-3 text-sm leading-relaxed">{p.step}</div>

      <Fold title="Read each number" className="self-end" testId={`${p.testId}-detail`}>
        {p.foldIntro && <p className="mb-3 text-sm leading-relaxed text-white/70">{p.foldIntro}</p>}
        <ul className="space-y-3">
          {p.keys.map((k) => (
            <li key={k.digit} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 text-sm leading-relaxed text-white/75">
              <DigitChip digit={k.digit} count={k.count} missing={k.count === 0} />
              <div>
                <p className="text-white"><span className="font-medium">{k.role}</span><span className="text-white/65"> · {NUMBERS[k.digit].planet}</span></p>
                <p className="mt-0.5">{k.reading}</p>
                {k.extra && <p className="mt-0.5 text-white/65">{k.extra}</p>}
                {k.habit && <p className="mt-0.5 text-gold-pale"><span className="font-medium">Try: </span>{k.habit}</p>}
              </div>
            </li>
          ))}
        </ul>
        {p.foldFoot && <p className="mt-3 text-xs leading-relaxed text-white/65">{p.foldFoot}</p>}
      </Fold>
    </article>
  );
}

const tryLine = (habit: string) => <p className="text-gold-pale"><span className="font-medium">Try: </span>{habit}</p>;

/**
 * Career, relationships, health and money as four cards in two columns, all of one shape. The care
 * note for several 7s stands above them, and the notes on health, money and the method sit once
 * beneath them, so no card carries extra rows the others do not.
 */
export function AreasPanel({ result, support, money }: { result: LoShuResult; support: Record<AreaId, AreaSupport>; money: MoneyReading }) {
  const sevens = sevensCaution(result);
  const golden = result.full.lines.find((l) => l.id === 'golden')!.status;
  const moneyKeys: KeyRow[] = ([5, 6] as const).map((d) => {
    const count = d === 5 ? money.five : money.six;
    const t = MONEY_NUMBER_TEXT[d];
    return { digit: d, count, role: t.role, reading: count ? t.gives : t.gap, habit: count ? null : t.habit, extra: count >= 3 ? t.heavy : null };
  });

  return (
    <PanelSection title="Career, money, relationships and health" lede={PANEL_TEXT.areas} id="loshu-areas" testId="loshu-areas">
      {sevens && (
        <div className="mb-5 flex gap-3 rounded-xl border border-warning/40 bg-warning/[0.07] p-4 text-sm leading-relaxed" data-testid="area-sevens">
          <TriangleAlert className="mt-0.5 h-5 w-5 flex-none text-warning" aria-hidden="true" />
          <div>
            <p className="font-medium text-white">{SEVENS_TITLE}</p>
            <p className="mt-1 text-white/80">{sevensText(sevens.count)} Its remedies are under Remedies, with the number 7.</p>
          </div>
        </div>
      )}

      <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
        {AREA_IDS.map((id) => {
          const s = support[id];
          const text = AREA_NUMBER_TEXT[id];
          const firstGap = s.missingKeys[0];
          return (
            <AreaCard key={id} testId={`area-${id}`} icon={ICON[id]} name={AREA_TEXT[id].name} blurb={AREA_TEXT[id].blurb}
              present={s.presentCount} of={s.keyCount} band={s.band} missing={s.missingKeys}
              reading={AREA_BAND_TEXT[id][s.band]}
              keys={s.keys.map((k) => ({
                digit: k.digit, count: k.count, role: text[k.digit]!.role, reading: k.present ? text[k.digit]!.gives : text[k.digit]!.gap,
                habit: k.present ? null : text[k.digit]!.habit, extra: k.count >= 3 ? repeatReading(k.digit, k.count) : null,
              }))}
              lines={s.lines}
              step={firstGap ? tryLine(text[firstGap]!.habit) : <p className="text-white/75">{AREA_STEP_NONE}</p>} />
          );
        })}
        <AreaCard testId="area-money" anchor="loshu-money" icon={Wallet} name={MONEY_TEXT.name} blurb={MONEY_TEXT.blurb}
          present={money.present} of={2} band={money.present === 2 ? 'strong' : money.present === 1 ? 'mixed' : 'thin'} missing={money.missing}
          reading={<>{MONEY_STATE_TEXT[money.state]}{money.golden && <span className="mt-1.5 block text-gold-pale">{MONEY_GOLDEN}</span>}</>}
          keys={moneyKeys}
          lines={[{ id: 'golden', status: golden }]}
          step={money.missing.length ? tryLine(MONEY_NUMBER_TEXT[money.missing[0] as 5 | 6].habit) : <p className="text-white/75">Both money numbers are in your grid, so no step is needed here.</p>}
          foldIntro={MONEY_INTRO} foldFoot={MONEY_SOURCE} />
      </div>

      <Notes className="mt-5" items={[HEALTH_NOTE, MONEY_NOTE]} />

      <Fold title={FOLD_OWN_AREAS} className="mt-3" testId="area-working">
        <p className="text-sm leading-relaxed text-white/70">{OWN_AREAS_NOTE}</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/75">
          {AREA_IDS.map((id) => <li key={id}><span className="font-medium text-white">{AREA_TEXT[id].name}: </span>{support[id].working}</li>)}
        </ul>
      </Fold>
    </PanelSection>
  );
}
