import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  carefulNumbers, checkNumber, favourableDates, reduce, relationsOf, showReduction, upcomingDates, type LoShuResult, type UpcomingDate, type YMD,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import {
  CHECK_INTRO, CHECK_LABEL, CHECK_MOBILE_NOTE, CHECK_TEXT, DATES_INTRO, DATES_LABEL, DATES_NONE, STONE_LINE,
} from '@/data/numerology/lifeAreaText';
import { FAVOURABLE_NOTE } from '@/data/numerology/dashaText';
import { CarefulNumbers } from './CarefulNumbers';
import { DigitChip, PanelSection } from './bits';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (d: UpcomingDate) => `${d.weekday.slice(0, 3)} ${d.date.d} ${MONTHS[d.date.m - 1]}`;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <dt className="text-xs uppercase tracking-wide text-white/65">{label}</dt>
      <dd className="mt-1 font-heading text-lg text-white">{children}</dd>
    </div>
  );
}

/**
 * What suits the person and what to go carefully with, in one place: the friendly numbers, colours
 * and weekday of the Driver, the coming dates that suit, the careful numbers, and a check that turns
 * any phone, vehicle or house number into a plain verdict.
 */
export function LuckyPanel({ result, today }: { result: LoShuResult; today: YMD | null }) {
  const friends = relationsOf(result.driver).friends;
  const month = favourableDates(result.driver);
  const driver = NUMBERS[result.driver];
  const careful = carefulNumbers(result.driver, result.conductor);
  const coming = today ? upcomingDates(result, today) : null;

  return (
    <div className="space-y-10">
      <PanelSection title={`What suits you: Driver ${result.driver}`} lede={FAVOURABLE_NOTE} testId="loshu-lucky">
        <dl className="grid gap-3 sm:grid-cols-3">
          <Fact label="Friendly numbers">{friends.join(', ') || 'None'}</Fact>
          <Fact label={`Colours of ${driver.planet}`}>{driver.colours.join(', ')}</Fact>
          <Fact label="Favourable day">{driver.day ?? 'None of its own'}</Fact>
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Dates of any month that add down to {result.driver}: <span className="text-white">{month.own.join(', ')}</span>.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/65">{STONE_LINE} It is {driver.gemstone}.</p>
      </PanelSection>

      {coming && (
        <PanelSection title="Coming dates" lede={DATES_INTRO} testId="loshu-dates">
          <div className="grid gap-3 sm:grid-cols-2">
            {(['own', 'friendly'] as const).map((kind) => (
              <div key={kind} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="text-xs font-medium uppercase tracking-wide text-white/65">{DATES_LABEL[kind]}</h4>
                {coming[kind].length ? (
                  <ul className="mt-2 space-y-1 text-sm text-white">{coming[kind].map((d) => <li key={`${d.date.m}-${d.date.d}`}>{short(d)}</li>)}</ul>
                ) : <p className="mt-2 text-sm text-white/65">{DATES_NONE}</p>}
              </div>
            ))}
          </div>
        </PanelSection>
      )}

      <CarefulNumbers careful={careful} driver={result.driver} conductor={result.conductor} />

      <NumberCheck result={result} />
    </div>
  );
}

/** A phone, vehicle or house number, turned into one number and a plain verdict beside the person's own. */
function NumberCheck({ result }: { result: LoShuResult }) {
  const [text, setText] = useState('');
  const id = useId();
  const check = checkNumber(text, result);
  const working = check
    ? `${check.digits.split('').join(' + ')} = ${check.total}${check.total > 9 ? `, then ${showReduction(reduce(check.total))}` : ''}`
    : '';

  return (
    <PanelSection title="Check a number" lede={CHECK_INTRO} testId="loshu-check">
      <div className="max-w-xl">
        <label htmlFor={id} className="mb-1.5 block text-sm text-white/70">Phone, vehicle or house number</label>
        <input id={id} value={text} onChange={(e) => setText(e.target.value)} inputMode="text" autoComplete="off" spellCheck={false}
          placeholder="For example 98765 43210 or MH 12 AB 1234"
          className="w-full rounded-lg border border-white/20 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright" />
      </div>
      <div aria-live="polite" className="mt-4">
        {check ? (
          <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <DigitChip digit={check.root} />
            <div className="text-sm leading-relaxed text-white/75">
              <p className="font-medium text-white">{CHECK_LABEL[check.fit]} · {NUMBERS[check.root].planet}</p>
              <p className="mt-1">{CHECK_TEXT[check.fit]}</p>
              <p className="mt-1 text-xs text-white/65">{working}</p>
            </div>
          </div>
        ) : <p className="text-sm text-white/65">{text ? 'No digit from 1 to 9 found yet.' : 'The result appears as you type.'}</p>}
      </div>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/65">
        {CHECK_MOBILE_NOTE}{' '}
        <Link to="/tools/mobile-numerology" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">Open the Mobile Number Numerology tool</Link>.
      </p>
    </PanelSection>
  );
}
