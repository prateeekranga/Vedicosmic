import type { ReactNode } from 'react';
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
import { Badge } from '@/components/ui/Badge';
import { DigitChip, Fold, PanelSection } from './bits';

const H5 = 'text-xs font-medium uppercase tracking-wide text-white/65';

/** The areas a number counts in, with its weight in each. */
const areasOf = (d: Digit) => AREA_IDS.flatMap((area) => {
  const key = AREA_KEYS[area].numbers.find((k) => k.digit === d);
  return key ? [{ area, weight: key.weight }] : [];
});

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h4 className={H5}>{label}</h4>
      <div className="mt-1.5 text-sm leading-relaxed text-white/80">{children}</div>
    </div>
  );
}

const List = ({ items }: { items: readonly string[] }) => (
  <ul className="list-disc space-y-1 pl-5 marker:text-gold-soft">{items.map((t) => <li key={t}>{t}</li>)}</ul>
);

const times = (n: number) => (n === 2 ? 'twice' : `${n} times`);

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
  const firstOften = repeated.find((r) => r.often)?.digit;

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
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                      <span className="inline-block text-white/60 transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                      <DigitChip digit={d} missing />
                      <span className="font-medium text-white">{n.planet} · {n.keyword}</span>
                      {p && <Badge tone="gold">{priorityWhy(p).replace(/\.$/, '')}</Badge>}
                    </summary>
                    <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
                      <p className="text-sm leading-relaxed text-white/85">{MISSING_TEXT[d].meaning}</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Block label={MISSING_LABEL.daily}><List items={m.daily} /></Block>
                        <Block label={MISSING_LABEL.offering}>
                          <p>{m.offering}</p>
                          <p className="mt-1.5">{mantraLine(d)}{' '}
                            <Link to="/tools/mantra-timer" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">Keep count with the Japa Counter</Link>
                          </p>
                        </Block>
                        <Block label={MISSING_LABEL.wear}><p>{m.wear}</p></Block>
                        <Block label={MISSING_LABEL.items}><List items={m.items} /></Block>
                        <Block label={MISSING_LABEL.wallpaper}><p>{m.wallpaper}</p></Block>
                        <Block label={MISSING_LABEL.use}><p>{m.use}</p></Block>
                        <Block label={MISSING_LABEL.give}><p>{r.charity}</p></Block>
                        <Block label={MISSING_LABEL.numbers}><p>{missingNumbersAdvice(d)}</p></Block>
                        <Block label={MISSING_LABEL.home}><p>{placeAdvice(d)}</p></Block>
                      </div>
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
            {repeated.map(({ digit: d, count, often }) => {
              const n = NUMBERS[d];
              const e = EXCESS_REMEDY[d];
              return (
                <details key={d} className="group rounded-xl border border-white/10 bg-white/[0.03]" open={d === firstOften} data-testid={`repeat-${d}`}>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="inline-block text-white/60 transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                    <DigitChip digit={d} count={count} />
                    <span className="font-medium text-white">{n.planet} · held {times(count)}</span>
                    <Badge tone={often ? 'warning' : 'neutral'}>{often ? REPEAT_OFTEN : REPEAT_TWICE}</Badge>
                  </summary>
                  <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Block label={often ? EXCESS_LABEL.signs : EXCESS_LABEL.signsTwice}><p>{e.signs}</p></Block>
                      <Block label={EXCESS_LABEL.balance}><List items={e.balance} /></Block>
                      <Block label={EXCESS_LABEL.colour}><p>{e.colour}</p></Block>
                      <Block label={EXCESS_LABEL.items}><List items={e.items} /></Block>
                      <Block label={EXCESS_LABEL.wallpaper}><p>{e.wallpaper}</p></Block>
                      <Block label={EXCESS_LABEL.give}><p>{e.give}</p></Block>
                      <Block label={EXCESS_LABEL.speak}><p>{e.speak}</p></Block>
                      <Block label={EXCESS_LABEL.numbers}><p>{excessNumbersAdvice(d)}</p></Block>
                      <Block label={EXCESS_LABEL.home}><p>{placeAdvice(d)}</p></Block>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </PanelSection>
      )}

      <div className="space-y-2">
        <p className="max-w-3xl text-xs leading-relaxed text-white/65">{REMEDY_PROVENANCE}</p>
        <p className="max-w-3xl text-xs leading-relaxed text-white/65">{GEM_NOTE}</p>
      </div>
    </div>
  );
}
