import {
  AREA_IDS, formatYMD, mahaDashas, regardOf, windowPicks, type AreaId, type DashaGrid, type DashaNow, type LoShuResult, type PeriodTone, type WindowOutlook,
  type YearOutlook,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LINE_TEXT } from '@/data/numerology/loshuText';
import { DASHA_GRID_NONE, DASHA_INTRO, DASHA_ROLE, DASHA_TEXT } from '@/data/numerology/dashaText';
import {
  AREA_TEXT, DASHA_NOTE, FOCUS_LABEL, FOCUS_LINE, FOCUS_NONE, FOLD_OWN_YEARS, OUTLOOK_INTRO, OUTLOOK_NOTE, PANEL_TEXT, PERIOD_AREA_TEXT, TONE_RULE,
  TONE_TEXT, WINDOWS_INTRO, WINDOW_LABEL, WINDOW_NONE, YEARS_LIMITS, yearRegard,
} from '@/data/numerology/lifeAreaText';
import { NumberCard } from '@/components/numerology/NumberCard';
import { Fold, Notes, PanelSection, ToneChip } from './bits';

const TABLE = 'w-full text-left text-sm';
const TH = 'p-2.5 text-xs font-medium uppercase tracking-wide text-white/65';
const TD = 'p-2.5 align-top text-white/75';
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const lineNames = (ids: readonly string[]) => ids.map((id) => LINE_TEXT[id as keyof typeof LINE_TEXT].name).join(', ');

/** A tone with its score beside it, so a reader can see how near the edge of a band it is. */
function ToneCell({ t }: { t: PeriodTone }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <ToneChip tone={t.tone} />
      <span className="text-xs text-white/65"><span className="sr-only">score </span>{signed(t.score)}</span>
    </span>
  );
}

interface Props {
  result: LoShuResult;
  now: DashaNow;
  period: DashaGrid;
  years: YearOutlook[];
  windows: WindowOutlook[];
  focus: { lean: AreaId | null; gentle: AreaId | null };
}

/**
 * The years ahead. The main view is words: the three periods running now, how each coming year's
 * planet sits beside the Driver and Conductor (the classical part), and what the year's number is
 * read to bring to work, relationships and health. Every score, tone and short-period pick is
 * in a fold labelled as this page's own method.
 */
export function YearsPanel({ result, now, period, years, windows, focus }: Props) {
  const current = years[0];
  const mahas = mahaDashas(result.date, 90);

  return (
    <div className="space-y-10" data-testid="loshu-years">
      <PanelSection title="The years ahead, in words" lede={`${PANEL_TEXT.words} ${YEARS_LIMITS}`} id="loshu-outlook" testId="loshu-outlook">
        <ul className="space-y-2 sm:hidden">
          {years.map((row) => {
            const regard = regardOf(result, row.year.antar.number);
            return (
              <li key={row.year.antar.year} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
                <p className="font-medium text-white">
                  {formatYMD(row.year.antar.from)} to {row.year.antar.until.y}
                  {row.year.antar.year === now.antar.year && <span className="ml-2 text-xs font-normal text-gold-pale">now</span>}
                </p>
                <p className="mt-0.5 text-xs text-white/65">{row.year.maha.number} {NUMBERS[row.year.maha.number].planet} · {row.year.antar.number} {NUMBERS[row.year.antar.number].planet}</p>
                <p className="mt-2 leading-relaxed text-white/80">{yearRegard(result.driver, result.conductor, row.year.antar.number, regard.driver, regard.conductor)}.</p>
                <p className="mt-1 text-xs text-white/65">Lines completed: {row.year.grid.newlyComplete.length ? lineNames(row.year.grid.newlyComplete) : 'none added'}</p>
              </li>
            );
          })}
        </ul>
        <div role="region" aria-label="The next five dasha years" tabIndex={0} className="hidden overflow-x-auto rounded-xl border border-white/10 sm:block">
          <table className={TABLE}>
            <caption className="sr-only">For each of five dasha years: the Maha and Antar Dasha, how the Antar planet sits beside your Driver and Conductor, and the lines the year completes</caption>
            <thead>
              <tr>
                <th scope="col" className={TH}>Birthday to birthday</th>
                <th scope="col" className={TH}>Maha · Antar</th>
                <th scope="col" className={TH}>How your Driver’s and Conductor’s planets regard the year’s planet</th>
                <th scope="col" className={TH}>Lines completed</th>
              </tr>
            </thead>
            <tbody>
              {years.map((row) => {
                const regard = regardOf(result, row.year.antar.number);
                return (
                  <tr key={row.year.antar.year} className="border-t border-white/5">
                    <th scope="row" className={`${TD} whitespace-nowrap font-normal text-white`}>
                      {formatYMD(row.year.antar.from)} to {row.year.antar.until.y}
                      {row.year.antar.year === now.antar.year && <span className="ml-2 text-xs text-gold-pale">now</span>}
                    </th>
                    <td className={`${TD} whitespace-nowrap`}>{row.year.maha.number} {NUMBERS[row.year.maha.number].planet} · {row.year.antar.number} {NUMBERS[row.year.antar.number].planet}</td>
                    <td className={TD}>{yearRegard(result.driver, result.conductor, row.year.antar.number, regard.driver, regard.conductor)}</td>
                    <td className={TD}>{row.year.grid.newlyComplete.length ? lineNames(row.year.grid.newlyComplete) : 'None added'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h4 className="mt-6 font-medium text-white">This year, for work, relationships and health</h4>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {AREA_IDS.map((id) => (
            <li key={id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{AREA_TEXT[id].name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/75">{PERIOD_AREA_TEXT[now.antar.number][id]}</p>
            </li>
          ))}
        </ul>
        <Notes className="mt-4" items={[OUTLOOK_NOTE]} />
      </PanelSection>

      <PanelSection title="Running now" lede={DASHA_INTRO} testId="loshu-dasha">
        <div className="grid gap-3 md:grid-cols-3">
          <NumberCard label="Maha Dasha" value={now.maha.number} system="Indian numerology"
            note={`Age ${now.maha.fromAge} to ${now.maha.toAge}, until ${formatYMD(now.maha.until)}. ${DASHA_ROLE.maha}`}>
            {DASHA_TEXT[now.maha.number]}
          </NumberCard>
          <NumberCard label="Antar Dasha" value={now.antar.number} system="Indian numerology"
            note={`${formatYMD(now.antar.from)} until ${formatYMD(now.antar.until)}. ${DASHA_ROLE.antar}`}>
            {DASHA_TEXT[now.antar.number]}
          </NumberCard>
          <NumberCard label="Pratyantar Dasha" value={now.pratyantar.number} system="Indian numerology"
            note={`${formatYMD(now.pratyantar.from)} until ${formatYMD(now.pratyantar.until)}. ${DASHA_ROLE.pratyantar}`}>
            {DASHA_TEXT[now.pratyantar.number]}
          </NumberCard>
        </div>
        <div className="mt-4 rounded-xl border border-gold-soft/30 bg-gold-bright/[0.07] p-4 text-sm leading-relaxed text-white/80">
          <h4 className="font-medium text-gold-pale">Your grid in this period</h4>
          <p className="mt-1">
            Until {formatYMD(now.antar.until)} the grid is read with {now.maha.number} (Maha Dasha) and {now.antar.number} (Antar Dasha) added.{' '}
            {period.newlyComplete.length ? `That completes, for the time being: ${lineNames(period.newlyComplete)}.` : DASHA_GRID_NONE}{' '}
            Choose “With current dasha” under the grid on the Your grid tab to see it drawn.
          </p>
        </div>
        <Notes className="mt-4" items={[DASHA_NOTE]} />
      </PanelSection>

      <div className="space-y-3">
        <Fold title="Maha Dasha through life">
          <div role="region" aria-label="Maha Dasha through life" tabIndex={0} className="overflow-x-auto">
            <table className={TABLE}>
              <caption className="sr-only">Every Maha Dasha from birth, with the ages and years it covers</caption>
              <thead><tr><th scope="col" className={TH}>Ages</th><th scope="col" className={TH}>Years</th><th scope="col" className={TH}>Number</th><th scope="col" className={TH}>Theme</th></tr></thead>
              <tbody>
                {mahas.map((m) => (
                  <tr key={m.fromAge} className="border-t border-white/5">
                    <th scope="row" className={`${TD} whitespace-nowrap font-normal text-white`}>
                      {m.fromAge} to {m.toAge}{m.fromAge === now.maha.fromAge && <span className="ml-2 text-xs text-gold-pale">now</span>}
                    </th>
                    <td className={`${TD} whitespace-nowrap`}>{m.from.y} to {m.until.y}</td>
                    <td className={`${TD} whitespace-nowrap`}>{m.number} · {NUMBERS[m.number].planet}</td>
                    <td className={TD}>{NUMBERS[m.number].keyword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fold>

        <Fold title={FOLD_OWN_YEARS} testId="loshu-scores">
          <p className="max-w-3xl text-sm leading-relaxed text-white/70">{OUTLOOK_INTRO}</p>
          {current && (
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {AREA_IDS.map((id) => {
                const t = current.areas[id].year;
                const picks = windowPicks(windows, id, now.on);
                return (
                  <li key={id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-2"><span className="font-medium text-white">{AREA_TEXT[id].name}</span><ToneCell t={t} /></div>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">{TONE_TEXT[t.tone][id]}</p>
                    <p className="mt-3 text-xs text-white/70"><span className="text-white/65">{WINDOW_LABEL.best}: </span>
                      {picks.best ? `${formatYMD(picks.best.period.from)} until ${formatYMD(picks.best.period.until)}` : WINDOW_NONE}</p>
                    {picks.careful && <p className="mt-1 text-xs text-white/70"><span className="text-white/65">{WINDOW_LABEL.careful}: </span>
                      {formatYMD(picks.careful.period.from)} until {formatYMD(picks.careful.period.until)}</p>}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-sm leading-relaxed text-gold-pale">
            {focus.lean || focus.gentle ? (
              <>
                {focus.lean && <span className="block"><span className="font-medium">{FOCUS_LABEL.lean} {AREA_TEXT[focus.lean].name.toLowerCase()}.</span> {FOCUS_LINE.lean}</span>}
                {focus.gentle && <span className="mt-1 block"><span className="font-medium">{FOCUS_LABEL.gentle} {AREA_TEXT[focus.gentle].name.toLowerCase()}.</span> {FOCUS_LINE.gentle}</span>}
              </>
            ) : FOCUS_NONE}
          </p>

          <h4 className="mt-6 font-medium text-white">Year by year</h4>
          <div role="region" aria-label="Scores, year by year" tabIndex={0} className="mt-2 overflow-x-auto rounded-xl border border-white/10">
            <table className={TABLE}>
              <caption className="sr-only">How each of five dasha years reads for career, relationships and health, with the score</caption>
              <thead>
                <tr>
                  <th scope="col" className={TH}>Birthday to birthday</th>
                  <th scope="col" className={TH}>Maha · Antar</th>
                  {AREA_IDS.map((id) => <th key={id} scope="col" className={TH}>{AREA_TEXT[id].name}</th>)}
                </tr>
              </thead>
              <tbody>
                {years.map((row) => (
                  <tr key={row.year.antar.year} className="border-t border-white/5">
                    <th scope="row" className={`${TD} whitespace-nowrap font-normal text-white`}>{formatYMD(row.year.antar.from)} to {row.year.antar.until.y}</th>
                    <td className={`${TD} whitespace-nowrap`}>{row.year.maha.number} · {row.year.antar.number}</td>
                    {AREA_IDS.map((id) => <td key={id} className={TD}><ToneCell t={row.areas[id].year} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="mt-6 font-medium text-white">Short periods within this year (Pratyantar Dasha)</h4>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/70">{WINDOWS_INTRO}</p>
          <div role="region" aria-label="Scores, short periods of this year" tabIndex={0} className="mt-2 overflow-x-auto rounded-xl border border-white/10">
            <table className={TABLE}>
              <caption className="sr-only">The nine short periods of the running year, with dates, length in days, and how each reads for career, relationships and health</caption>
              <thead>
                <tr>
                  <th scope="col" className={TH}>From</th>
                  <th scope="col" className={TH}>Number</th>
                  <th scope="col" className={TH}>Days</th>
                  {AREA_IDS.map((id) => <th key={id} scope="col" className={TH}>{AREA_TEXT[id].name}</th>)}
                </tr>
              </thead>
              <tbody>
                {windows.map((w) => (
                  <tr key={w.period.number} className="border-t border-white/5">
                    <th scope="row" className={`${TD} whitespace-nowrap font-normal text-white`}>
                      {formatYMD(w.period.from)}{w.current && <span className="ml-2 text-xs text-gold-pale">now</span>}
                      <span className="block text-xs text-white/65">until {formatYMD(w.period.until)}</span>
                    </th>
                    <td className={`${TD} whitespace-nowrap`}>{w.period.number} · {NUMBERS[w.period.number].planet}</td>
                    <td className={TD}>{w.period.days}</td>
                    {AREA_IDS.map((id) => <td key={id} className={TD}><ToneCell t={w.areas[id]} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-white/65">{TONE_RULE}</p>
        </Fold>
      </div>
    </div>
  );
}
