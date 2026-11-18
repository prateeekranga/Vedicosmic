import { useId, useState } from 'react';
import { Heart } from 'lucide-react';
import { VIVAH_MATCH, mulankMaha, vivahYear, type LoShuResult, type VivahYear } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import {
  MARRIAGE_CHECK_HELP, MARRIAGE_CHECK_LABEL, MARRIAGE_LABEL, MARRIAGE_LEDE, MARRIAGE_LIST_NOTE, MARRIAGE_SOURCE, marriageRule,
} from '@/data/numerology/extrasText';
import { cn } from '@/lib/cn';
import { DigitChip, Fold, Notes, PanelSection } from './bits';

const TH = 'p-2.5 text-xs font-medium uppercase tracking-wide text-white/65';
const TD = 'p-2.5 align-top text-white/75';

/** One fact in a small box: the Mulank, the Mulank Maha, the Vivah Mulanks that suit. */
function Fact({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-white/65">{label}</p>
      <div className="mt-2 flex">{children}</div>
      {note && <p className="mt-2 text-xs leading-relaxed text-white/65">{note}</p>}
    </div>
  );
}

/** A year as a tile: gold when it favours marriage, quiet when not, with the word written so colour is never the only sign. */
function YearTile({ y }: { y: VivahYear }) {
  return (
    <li className={cn('flex flex-col items-center rounded-xl border p-3 text-center',
      y.match ? 'border-gold-soft/60 bg-gold-bright/[0.10]' : 'border-white/10 bg-white/[0.02]')}
    data-testid={y.match ? 'marriage-year-yes' : 'marriage-year-no'}>
      <span className={cn('font-heading text-xl font-bold', y.match ? 'text-gold-pale' : 'text-white/75')}>{y.year}</span>
      <span className="text-xs text-white/65">age {y.age}</span>
      <span className="mt-2"><DigitChip digit={y.vivah} /></span>
      <span className={cn('mt-2 flex items-center gap-1 text-xs', y.match ? 'font-medium text-gold-pale' : 'text-white/60')}>
        {y.match && <Heart className="h-3.5 w-3.5" aria-hidden="true" />}
        {y.match ? MARRIAGE_LABEL.yes : MARRIAGE_LABEL.no}
      </span>
    </li>
  );
}

/**
 * Marriage years by the Vivah Mulank: the person's Mulank and Mulank Maha, the Vivah Mulanks that suit
 * their Mulank, the coming years as tiles (the ones that favour marriage in gold), a box to check any
 * year with its working, and the whole working in a fold.
 */
export function MarriagePanel({ result, years }: { result: LoShuResult; years: VivahYear[] }) {
  const maha = mulankMaha(result.date);
  const suits = VIVAH_MATCH[maha.mulank];
  const [text, setText] = useState('');
  const id = useId();
  const typed = Number(text);
  const valid = /^\d{4}$/.test(text.trim()) && typed >= result.date.y && typed <= result.date.y + 100;
  const checked = valid ? vivahYear(result.date, typed) : null;

  return (
    <div className="space-y-10" data-testid="loshu-marriage">
      <PanelSection title="Marriage years" lede={MARRIAGE_LEDE} id="loshu-marriage-years">
        <div className="grid gap-3 sm:grid-cols-3">
          <Fact label="Your Mulank" note={`${NUMBERS[maha.mulank].planet}, from the birth day ${result.date.d}`}>
            <DigitChip digit={maha.mulank} />
          </Fact>
          <Fact label="Your Mulank Maha" note={`${maha.working}.`}>
            <DigitChip digit={maha.value} />
          </Fact>
          <Fact label="Vivah Mulanks that suit you" note={marriageRule(maha.mulank)}>
            <ul className="flex flex-wrap gap-1.5" aria-label="Vivah Mulanks that favour marriage">
              {suits.map((d) => <li key={d}><DigitChip digit={d} /></li>)}
            </ul>
          </Fact>
        </div>

        <h4 className="mt-6 font-medium text-white">The coming years</h4>
        <ol className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6" aria-label="The coming years, with their Vivah Mulank">
          {years.map((y) => <YearTile key={y.year} y={y} />)}
        </ol>

      </PanelSection>

      <PanelSection title={MARRIAGE_CHECK_LABEL} lede={MARRIAGE_CHECK_HELP} testId="marriage-check">
        <div className="max-w-xs">
          <label htmlFor={id} className="mb-1.5 block text-sm text-white/70">Year</label>
          <input id={id} value={text} onChange={(e) => setText(e.target.value)} inputMode="numeric" autoComplete="off" maxLength={4}
            placeholder={String(years[0]?.year ?? result.date.y + 25)}
            className="w-full rounded-lg border border-white/20 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright" />
        </div>
        <div aria-live="polite" className="mt-4">
          {checked ? (
            <div className={cn('flex max-w-2xl items-start gap-3 rounded-xl border p-4',
              checked.match ? 'border-gold-soft/60 bg-gold-bright/[0.08]' : 'border-white/10 bg-white/[0.03]')}>
              <DigitChip digit={checked.vivah} />
              <div className="text-sm leading-relaxed text-white/75">
                <p className="font-medium text-white">{checked.year}: Vivah Mulank {checked.vivah} · {checked.match ? MARRIAGE_LABEL.yes : MARRIAGE_LABEL.no}</p>
                <p className="mt-1 text-xs text-white/65">{checked.working}. {marriageRule(maha.mulank)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/65">
              {text.trim() ? `Type a four-digit year from ${result.date.y} to ${result.date.y + 100}.` : 'The result appears as you type.'}
            </p>
          )}
        </div>
      </PanelSection>

      <div className="space-y-3">
        <Fold title="The working, year by year" testId="marriage-working">
          <div role="region" aria-label="Vivah Mulank, year by year" tabIndex={0} className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">For each coming year: the age reached, the year plus the Mulank Maha added down to the Vivah Mulank, and whether it favours marriage</caption>
              <thead>
                <tr><th scope="col" className={TH}>Year</th><th scope="col" className={TH}>Age</th><th scope="col" className={TH}>Working</th><th scope="col" className={TH}>Vivah Mulank</th><th scope="col" className={TH}>Marriage</th></tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.year} className="border-t border-white/5">
                    <th scope="row" className={`${TD} font-normal text-white`}>{y.year}</th>
                    <td className={TD}>{y.age}</td>
                    <td className={TD}>{y.working}</td>
                    <td className={TD}>{y.vivah}</td>
                    <td className={cn(TD, y.match && 'text-gold-pale')}>{y.match ? MARRIAGE_LABEL.yes : MARRIAGE_LABEL.no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fold>
        <Notes items={[MARRIAGE_LIST_NOTE, MARRIAGE_SOURCE]} />
      </div>
    </div>
  );
}
