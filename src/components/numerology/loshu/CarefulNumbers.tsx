import type { CarefulNumbers as Careful, CarefulTier, Digit } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { PAIR_DIFFERS } from '@/data/numerology/pairTips';
import {
  CAREFUL_DATES_LABEL, CAREFUL_DAYS_LABEL, CAREFUL_INTRO, CAREFUL_NONE, CAREFUL_TIER_TEXT, CAREFUL_USE, weekdaysOf,
} from '@/data/numerology/lifeAreaText';
import { DigitChip } from './bits';

const TIERS: readonly CarefulTier[] = ['challenging', 'mixed', 'careful'];
const TIER_STYLE: Readonly<Record<CarefulTier, string>> = {
  challenging: 'border-warning/40 bg-warning/[0.07]',
  mixed: 'border-white/15 bg-white/[0.04]',
  careful: 'border-white/10 bg-white/[0.03]',
};

/**
 * The numbers whose planets are unfriendly to the person's Driver or Conductor, in three strengths,
 * with the dates of the month and the weekdays that go with them. Popular lists of "bad" numbers
 * are the same for everyone; this one is worked out from the person's own two numbers.
 */
export function CarefulNumbers({ careful, driver, conductor, pair }: {
  careful: Careful; driver: number; conductor: number;
  /** The pair tables' lucky numbers and dates: a careful number they count lucky is marked, and their dates are left out here. */
  pair?: { lucky: readonly Digit[]; dates: readonly number[] };
}) {
  const differs = pair ? careful.numbers.filter((n) => pair.lucky.includes(n.digit)).map((n) => n.digit) : [];
  return (
    <section id="loshu-careful" className="scroll-mt-24" data-testid="loshu-careful">
      <h3 className="mb-3 font-heading text-h5 text-white">Numbers and dates to go carefully with</h3>
      <p className="mb-2 max-w-3xl text-sm leading-relaxed text-white/65">{CAREFUL_INTRO}</p>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
        Often called unlucky numbers and dates. They follow the traditional friendships between the planets that rule each number, and are a matter of preference, not of fortune.
      </p>

      {careful.numbers.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">{CAREFUL_NONE}</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-3">
          {TIERS.map((tier) => {
            const members = careful.numbers.filter((n) => n.tier === tier).map((n) => n.digit);
            if (!members.length) return null;
            const days = weekdaysOf(members);
            const dates = careful.dates[tier].filter((d) => !pair?.dates.includes(d));
            const leftOut = careful.dates[tier].filter((d) => pair?.dates.includes(d));
            return (
              <li key={tier} className={`rounded-xl border p-4 ${TIER_STYLE[tier]}`} data-testid={`careful-${tier}`}>
                <h4 className="font-medium text-white">{CAREFUL_TIER_TEXT[tier].label}</h4>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{CAREFUL_TIER_TEXT[tier].text}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {members.map((d) => (
                    <li key={d} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5 text-xs text-white/75">
                      <DigitChip digit={d} /><span>{NUMBERS[d].planet}</span>
                      {differs.includes(d) && <span className="text-gold-pale">· lucky for your pair</span>}
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 space-y-2 text-sm leading-relaxed text-white/75">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/65">{CAREFUL_DATES_LABEL}</dt>
                    <dd className="mt-0.5 text-white">{dates.length ? dates.join(', ') : 'None left'}</dd>
                    {leftOut.length > 0 && <dd className="mt-0.5 text-xs text-white/65">{leftOut.join(', ')} left out: the pair tables give them for your pair.</dd>}
                  </div>
                  {days.length > 0 && (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-white/65">{CAREFUL_DAYS_LABEL}</dt>
                      <dd className="mt-0.5 text-white">{days.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}

      {differs.length > 0 && (
        <p className="mt-4 max-w-3xl rounded-lg border border-gold-soft/25 bg-gold-bright/[0.05] p-3 text-xs leading-relaxed text-white/75" data-testid="pair-differs">
          {PAIR_DIFFERS} Here that is {differs.map((d) => `${d} (${NUMBERS[d as Digit].planet})`).join(', ')}.
        </p>
      )}
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70">{CAREFUL_USE}</p>
      <p className="mt-2 text-xs text-white/65">Worked out from your Driver {driver} and Conductor {conductor}.</p>
    </section>
  );
}
