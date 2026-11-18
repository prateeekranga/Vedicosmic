import { Link } from 'react-router-dom';
import { AREA_IDS, AREA_KEYS, repeatedForRemedy, type Digit, type LoShuResult, type RemedyPriority } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { MISSING_TEXT } from '@/data/numerology/loshuText';
import {
  AREA_NUMBER_TEXT, AREA_TEXT, FOLD_MORE_CUSTOMS, GEM_NOTE, PANEL_TEXT, REMEDY_NONE, REMEDY_TEXT, mantraLine, placeAdvice, priorityWhy,
} from '@/data/numerology/lifeAreaText';
import {
  EXCESS_LABEL, EXCESS_REMEDY, MISSING_LABEL, MISSING_REMEDY, REMEDY_PROVENANCE, REPEAT_HEADING, REPEAT_INTRO, REPEAT_OFTEN, REPEAT_TWICE,
  excessNumbersAdvice, missingNumbersAdvice,
} from '@/data/numerology/remedyText';
import {
  GAYATRI, SEVENS_DOCTOR, SEVENS_HABITS, SEVENS_REMEDIES, SEVENS_REMEDY_INTRO, SEVENS_TITLE, sevensText,
} from '@/data/numerology/extrasText';
import { Badge } from '@/components/ui/Badge';
import { DigitChip, Fold, Notes, PanelSection, Rows } from './bits';

/** The areas a number counts in, with its weight in each. */
const areasOf = (d: Digit) => AREA_IDS.flatMap((area) => {
  const key = AREA_KEYS[area].numbers.find((k) => k.digit === d);
  return key ? [{ area, weight: key.weight }] : [];
});

const List = ({ items }: { items: readonly string[] }) => (
  <ul className="list-disc space-y-1 pl-5 marker:text-gold-soft">{items.map((t) => <li key={t}>{t}</li>)}</ul>
);

const times = (n: number) => (n === 2 ? 'twice' : `${n} times`);
/** The row that opens a remedy: the chip in a fixed column, so every title starts at the same place. */
const SUMMARY = 'grid cursor-pointer list-none grid-cols-[1rem_3.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-4 py-3.5 [&::-webkit-details-marker]:hidden sm:grid-cols-[1rem_3.25rem_minmax(0,1fr)_auto]';

/**
 * Remedies for the grid, in two parts. For each number the grid lacks: daily-life habits, an
 * offering and the planet's mantra, colours to wear, things to use, a gift, how a phone, house or
 * vehicle number can help, and the Lo Shu direction at home. For each number the grid holds more than
 * once: what too much of it can look like and the customs that balance it. The most useful missing
 * numbers come first (the one that would complete a Raj Yog or line), and a note says what is
 * traditional here, what is this page's own arrangement, and that no gemstone is recommended.
 */
export function LoShuRemedies({ result, priorities }: { result: LoShuResult; priorities: RemedyPriority[] }) {
  const first = new Set(priorities.map((p) => p.digit));
  const order = [...priorities.map((p) => p.digit), ...result.full.missing.filter((d) => !first.has(d))];
  const byDigit = new Map(priorities.map((p) => [p.digit, p]));
  const repeated = repeatedForRemedy(result);
  // The several-7s care is opened first when it applies; otherwise the first number held often.
  const firstOpen = repeated.find((r) => r.sevens)?.digit ?? repeated.find((r) => r.often)?.digit;

  return (
    <div className="space-y-10">
      <PanelSection title="Missing numbers and their remedies" lede={result.full.missing.length ? PANEL_TEXT.remedies : undefined} id="loshu-remedies" testId="loshu-remedies">
        {result.full.missing.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">Every number from 1 to 9 is present in this grid, so there is no missing number to work on.</p>
        ) : (
          <>
            {priorities.length === 0 && <p className="mb-3 text-sm text-white/70">{REMEDY_NONE}</p>}
            <div className="space-y-3">
              {order.map((d) => {
                const n = NUMBERS[d];
                const areas = areasOf(d);
                const p = byDigit.get(d);
                const r = REMEDY_TEXT[d];
                const m = MISSING_REMEDY[d];
                const areaHabits = areas.map((a) => `${AREA_TEXT[a.area].name}: ${AREA_NUMBER_TEXT[a.area][d]!.habit}`);
                return (
                  <details key={d} className="group rounded-xl border border-white/10 bg-white/[0.03]" open={d === priorities[0]?.digit} data-testid={`remedy-${d}`}>
                    <summary className={SUMMARY}>
                      <span className="text-white/60 transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                      <DigitChip digit={d} missing />
                      <span className="font-medium text-white">{n.planet} · {n.keyword}</span>
                      {p && <span className="col-start-3 sm:col-start-4 sm:justify-self-end"><Badge tone="gold">{priorityWhy(p).replace(/\.$/, '')}</Badge></span>}
                    </summary>
                    <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
                      <p className="text-sm leading-relaxed text-white/85">{MISSING_TEXT[d].meaning}</p>
                      <Rows rows={[
                        { label: MISSING_LABEL.daily, content: <List items={m.daily} /> },
                        { label: MISSING_LABEL.offering, content: (
                          <>
                            <p>{m.offering}</p>
                            <p className="mt-1.5">{mantraLine(d)}{' '}
                              <Link to="/tools/mantra-timer" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">Keep count with the Japa Counter</Link>
                            </p>
                          </>
                        ) },
                        { label: MISSING_LABEL.wear, content: m.wear },
                        { label: MISSING_LABEL.items, content: <List items={m.items} /> },
                        { label: MISSING_LABEL.wallpaper, content: m.wallpaper },
                        { label: MISSING_LABEL.use, content: m.use },
                        { label: MISSING_LABEL.give, content: r.charity },
                        { label: MISSING_LABEL.numbers, content: missingNumbersAdvice(d) },
                        { label: MISSING_LABEL.home, content: placeAdvice(d) },
                      ]} />
                      <Fold title={FOLD_MORE_CUSTOMS} className="!bg-transparent">
                        <dl className="space-y-2 text-sm leading-relaxed text-white/75">
                          {areaHabits.map((h) => <div key={h}><dt className="inline font-medium text-white">Habit · </dt><dd className="inline">{h}</dd></div>)}
                          <div><dt className="inline font-medium text-white">Traditionally suggested: </dt><dd className="inline">{MISSING_TEXT[d].practice.replace(/^Traditionally suggested: /, '')}</dd></div>
                          <div><dt className="inline font-medium text-white">Weekly observance: </dt><dd className="inline">{r.observance}</dd></div>
                          <div><dt className="inline font-medium text-white">Stone: </dt><dd className="inline">{n.gemstone}, linked with {n.planet}. See the note below.</dd></div>
                        </dl>
                      </Fold>
                    </div>
                  </details>
                );
              })}
            </div>
          </>
        )}
      </PanelSection>

      {repeated.length > 0 && (
        <PanelSection title={REPEAT_HEADING} lede={REPEAT_INTRO} id="loshu-repeats" testId="loshu-repeats">
          <div className="space-y-3">
            {repeated.map(({ digit: d, count, often, sevens }) => {
              const n = NUMBERS[d];
              const e = EXCESS_REMEDY[d];
              return (
                <details key={d} className="group rounded-xl border border-white/10 bg-white/[0.03]" open={d === firstOpen} data-testid={`repeat-${d}`}>
                  <summary className={SUMMARY}>
                    <span className="text-white/60 transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                    <DigitChip digit={d} count={count} />
                    <span className="font-medium text-white">{n.planet} · held {times(count)}</span>
                    <span className="col-start-3 sm:col-start-4 sm:justify-self-end">
                      <Badge tone={often || sevens ? 'warning' : 'neutral'}>{sevens ? 'Several 7s: take care' : often ? REPEAT_OFTEN : REPEAT_TWICE}</Badge>
                    </span>
                  </summary>
                  <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
                    {sevens && (
                      <div className="rounded-xl border border-warning/40 bg-warning/[0.07] p-4 sm:p-5" data-testid="sevens-remedies">
                        <h4 className="font-medium text-white">{SEVENS_TITLE}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-white/80">{sevensText(count)}</p>
                        <Rows className="mt-4" rows={[
                          { label: SEVENS_REMEDY_INTRO.replace(/:$/, ''), content: <List items={SEVENS_REMEDIES} /> },
                          { label: 'Gayatri mantra', content: <span lang="sa-Latn">{GAYATRI}</span> },
                          { label: 'Day to day', content: <List items={SEVENS_HABITS} /> },
                        ]} />
                        <p className="mt-3 text-xs text-white/65">{SEVENS_DOCTOR}</p>
                      </div>
                    )}
                    <Rows rows={[
                      { label: often ? EXCESS_LABEL.signs : EXCESS_LABEL.signsTwice, content: e.signs },
                      { label: EXCESS_LABEL.balance, content: <List items={e.balance} /> },
                      { label: EXCESS_LABEL.colour, content: e.colour },
                      { label: EXCESS_LABEL.items, content: <List items={e.items} /> },
                      { label: EXCESS_LABEL.wallpaper, content: e.wallpaper },
                      { label: EXCESS_LABEL.give, content: e.give },
                      { label: EXCESS_LABEL.speak, content: e.speak },
                      { label: EXCESS_LABEL.numbers, content: excessNumbersAdvice(d) },
                      { label: EXCESS_LABEL.home, content: placeAdvice(d) },
                    ]} />
                  </div>
                </details>
              );
            })}
          </div>
        </PanelSection>
      )}

      <Notes items={[REMEDY_PROVENANCE, GEM_NOTE]} />
    </div>
  );
}
