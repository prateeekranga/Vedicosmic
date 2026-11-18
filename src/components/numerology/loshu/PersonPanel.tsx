import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { LINE_NAME, type LoShuResult, type MobileResult, type NameReading } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { CHECK_LABEL, CHECK_TEXT } from '@/data/numerology/lifeAreaText';
import { LEVEL_LABEL, LEVEL_TEXT } from '@/data/numerology/mobileText';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import { nameSuitsPair, pairTips } from '@/data/numerology/pairTips';
import {
  MOBILE_INTRO, NAME_INTRO, NAME_NON_LATIN, PERSON_EMPTY, PERSON_LEDE, mobileInPair, mobileSupplies, nameBest, nameInPair, nameNotInPair, nameSupplies,
} from '@/data/numerology/extrasText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MiniMeter, formatNumber } from '@/components/numerology/mobile/Choosing';
import { DigitChip, PanelSection } from './bits';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-3">
      <p className="text-xs uppercase tracking-wide text-white/65">{label}</p>
      <div className="mt-1 text-sm leading-relaxed text-white/80">{children}</div>
    </div>
  );
}

/**
 * The name and the mobile number set beside the date of birth. The name: its Chaldean compound and
 * root, how the root sits with the Mulank and Bhagyank, and whether the total is one the pair tables
 * give for this exact pair. The mobile number: its root, the 1 to 5 level and the score out of 100 of
 * the Mobile Number Numerology tool, the missing numbers it carries and the lines it completes.
 */
export function PersonPanel({ result, name, named, phone, onEdit }: {
  result: LoShuResult; name: string; named: NameReading | null; phone: MobileResult | null; onEdit: () => void;
}) {
  const tips = pairTips(result.driver, result.conductor);

  if (!name && !phone) {
    return (
      <PanelSection title="Name and mobile number" lede={PERSON_LEDE} testId="loshu-person">
        <div className="flex max-w-2xl flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="flex-1 text-sm leading-relaxed text-white/75">{PERSON_EMPTY}</p>
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-4 w-4" /> Add name and mobile</Button>
        </div>
      </PanelSection>
    );
  }

  const ch = named?.chaldean ?? null;
  const compound = ch?.compoundKey ? compoundReading(ch.compoundKey) : null;
  const fit = phone?.withBirth ?? null;

  return (
    <PanelSection title="Name and mobile number" lede={PERSON_LEDE} testId="loshu-person">
      <div className="grid gap-4 lg:grid-cols-2">
        {name && (
          <Card className="p-5 sm:p-6">
            <article data-testid="person-name">
              <h4 className="font-heading text-lg text-white">Your name</h4>
              <p className="mt-0.5 text-sm text-white/75">{name}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{NAME_INTRO}</p>
              {!ch ? (
                <p className="mt-4 text-sm text-white/75">{NAME_NON_LATIN}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <DigitChip digit={ch.root} />
                    <p className="text-white">
                      <span className="font-heading text-2xl font-bold">{ch.compound}</span>
                      <span className="text-white/65"> / {ch.root} · {NUMBERS[ch.root].planet}</span>
                    </p>
                  </div>
                  <p className="text-xs text-white/65">{ch.words.map((w) => `${w.word} ${w.total}`).join(' + ')}{ch.words.length > 1 ? ` = ${ch.compound}` : ''}</p>
                  {ch.name.hasNonLatin && <p className="text-xs text-white/65">{NAME_NON_LATIN}</p>}

                  <Row label={`Beside your Mulank ${result.driver} and Bhagyank ${result.conductor}`}>
                    <p><span className="font-medium text-white">{CHECK_LABEL[named!.fit]}. </span>{CHECK_TEXT[named!.fit]}</p>
                    {named!.suppliesMissing && <p className="mt-1">{nameSupplies(ch.root)}</p>}
                  </Row>
                  <Row label={`Name totals for the pair ${result.driver} & ${result.conductor}`}>
                    <p className={nameSuitsPair(tips, ch.compound) ? 'text-gold-pale' : undefined}>
                      {nameSuitsPair(tips, ch.compound) ? nameInPair(ch.compound, result.driver, result.conductor) : nameNotInPair(ch.compound, tips.names)}
                    </p>
                    {tips.bestName && <p className="mt-1">{nameBest(tips.bestName)}</p>}
                  </Row>
                  {compound && (
                    <Row label={`Compound ${compound.number}${compound.symbol ? `: ${compound.symbol}` : ''}`}>
                      <p>{compound.text}</p>
                    </Row>
                  )}
                </div>
              )}
            </article>
          </Card>
        )}

        {phone && (
          <Card className="p-5 sm:p-6">
            <article data-testid="person-mobile">
              <h4 className="font-heading text-lg text-white">Your mobile number</h4>
              <p className="mt-0.5 text-sm text-white/75">{formatNumber(phone.digits)}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{MOBILE_INTRO}</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <DigitChip digit={phone.root} />
                  <p className="text-white">
                    <span className="font-heading text-2xl font-bold">{phone.total}</span>
                    <span className="text-white/65"> / {phone.root} · {NUMBERS[phone.root].planet}</span>
                  </p>
                </div>
                {fit && (
                  <>
                    <Row label="Fit with your date of birth">
                      <p className="flex flex-wrap items-center gap-2">
                        <MiniMeter level={fit.compatibility.level} />
                        <span className="font-medium text-white">{LEVEL_LABEL[fit.compatibility.level]}, level {fit.compatibility.level} of 5</span>
                        <span className="text-white/65">· Number score {fit.score.total} of 100</span>
                      </p>
                      <p className="mt-1">{LEVEL_TEXT[fit.compatibility.level]}</p>
                    </Row>
                    <Row label="With your grid and your pair">
                      <p>{mobileSupplies(fit.suppliesMissing)}</p>
                      {fit.grid.newLines.length > 0 && <p className="mt-1">It completes {fit.grid.newLines.map((id) => LINE_NAME[id]).join(', ')} while you use it.</p>}
                      <p className="mt-1">{mobileInPair(phone.root, tips.numbers.includes(phone.root))}</p>
                    </Row>
                  </>
                )}
                <p className="pt-1 text-sm">
                  <Link to="/tools/mobile-numerology" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">
                    Read the whole number, pair by pair, on the Mobile Number Numerology tool
                  </Link>
                </p>
              </div>
            </article>
          </Card>
        )}
      </div>
      {(!name || !phone) && (
        <p className="mt-4 text-sm text-white/70">
          {!name ? 'Add your name' : 'Add your mobile number'} under{' '}
          <button type="button" onClick={onEdit} className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">Edit details</button>{' '}
          to see it here too.
        </p>
      )}
    </PanelSection>
  );
}
