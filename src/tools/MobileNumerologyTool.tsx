import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';
import {
  analyseMobile, normalizeMobile, parseISODate, relationTone, type Digit, type MobilePair, type MobileResult, type PairRelation,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { DOUBLE_TEXT, PAIR_TEXT, ROOT_FIT_TEXT, SAME_ROOT_TEXT, TONE_LABEL, ZERO_TEXT } from '@/data/numerology/mobileText';
import { REPORT_FOOTER, mobileSections } from '@/lib/numerologyReport';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { DateSelect } from '@/components/ui/DateSelect';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';

const H3 = 'mb-3 font-heading text-h5 text-white';
const TONE_BADGE = { supportive: 'success', mixed: 'neutral', challenging: 'warning' } as const;

function pairText(p: MobilePair): string {
  if (p.kind === 'zero') return ZERO_TEXT;
  if (p.kind === 'double') return DOUBLE_TEXT[p.pair[0] as Digit];
  return PAIR_TEXT[p.relation!];
}

export default function MobileNumerologyTool() {
  const [number, setNumber] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<MobileResult | null>(null);
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const analyse = () => {
    if (!normalizeMobile(number).valid) {
      setError('Please enter a phone number of 7 to 15 digits.');
      setResult(null);
      return;
    }
    setError('');
    const date = dob ? parseISODate(dob) : null;
    setResult(analyseMobile(number, date ? { date } : undefined));
  };

  useEffect(() => { if (result) heading.current?.focus(); }, [result]);

  useShareResult(result ? `The mobile number I checked has the root number ${result.root} (${NUMBERS[result.root].planet}).` : null);

  const save = () => {
    if (!result) return;
    saveReading({ toolId: 'mobile-numerology', toolName: 'Mobile Number Numerology', summary: `Root ${result.root} (${NUMBERS[result.root].planet}) · digit total ${result.total}` });
    notify('Result saved on this device');
  };

  const info = result ? NUMBERS[result.root] : null;
  const max = result ? Math.max(...result.frequency, 1) : 1;

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Input id="mobile-number" label="Mobile number" type="tel" inputMode="tel" autoComplete="off"
            placeholder="e.g. 98765 43210" value={number} error={error || undefined}
            aria-describedby="mobile-help" onChange={(e) => setNumber(e.target.value)} />
          <DateSelect value={dob} onChange={setDob} label="Your date of birth (optional)" />
        </div>
        <p id="mobile-help" className="mt-3 text-xs leading-relaxed text-white/55">
          A leading +91 or 0 is left out, since every number in the country shares it. Add your date of birth to see how the number sits with your Mulank and Bhagyank. The number is not sent to us.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={analyse} disabled={!number.trim()}>
            <Smartphone className="mr-2 h-4 w-4" /> Read this number
          </Button>
          {result && (
            <Button variant="ghost" onClick={() => { setResult(null); setNumber(''); setDob(''); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start again
            </Button>
          )}
        </div>
      </Card>

      {result && info && (
        <div className="space-y-10">
          <section>
            <h3 ref={heading} tabIndex={-1} className={`${H3} outline-none`}>The number’s root</h3>
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-5">
                <span className="grid h-20 min-w-20 place-items-center rounded-2xl px-3 font-display text-4xl font-bold"
                  style={{ background: info.colour.fill, color: info.colour.ink }}>{result.root}</span>
                <div>
                  <p className="font-heading text-h4 text-white">Root {result.root} · {info.planet} · {info.keyword}</p>
                  <p className="mt-1 text-sm text-white/60">The digits add to {result.total}.</p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-body leading-relaxed text-white/75">{info.strength}</p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
                No number is lucky or unlucky in itself. What tradition reads is how a number’s planet sits with the planets of your own birth numbers.
              </p>
            </Card>
          </section>

          {result.withBirth && (
            <section>
              <h3 className={H3}>With your birth numbers</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Fit label={`Mulank (Driver) ${result.withBirth.driver}`} own={result.withBirth.driver} root={result.root} relation={result.withBirth.rootToDriver} />
                <Fit label={`Bhagyank (Conductor) ${result.withBirth.conductor}`} own={result.withBirth.conductor} root={result.root} relation={result.withBirth.rootToConductor} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {result.withBirth.suppliesMissing.length
                  ? `This number contains ${result.withBirth.suppliesMissing.join(', ')}, which ${result.withBirth.suppliesMissing.length === 1 ? 'is' : 'are'} missing from your Lo Shu grid. Some teachers count that in a number’s favour.`
                  : 'This number contains none of the numbers missing from your Lo Shu grid.'}
              </p>
            </section>
          )}

          <section>
            <h3 className={H3}>How often each digit appears</h3>
            <table className="w-full max-w-xl text-sm">
              <caption className="sr-only">How many times each digit from 0 to 9 appears in the number</caption>
              <thead className="sr-only"><tr><th scope="col">Digit</th><th scope="col">Times</th></tr></thead>
              <tbody>
                {result.frequency.map((count, digit) => (
                  <tr key={digit}>
                    <th scope="row" className="w-8 py-1 text-left font-heading text-base text-white">{digit}</th>
                    <td className="py-1">
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className="h-2.5 rounded-full bg-brand-cyan/70" style={{ width: `${(count / max) * 70}%`, minWidth: count ? '0.5rem' : 0 }} />
                        <span className="text-white/75">{count === 0 ? 'not present' : count === 1 ? 'once' : `${count} times`}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.heavy.length > 0 && (
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Appearing three times or more: {result.heavy.map((h) => `${h.digit} (${h.count} times)`).join(', ')}. A heavily repeated digit is read as that planet’s theme sounding strongly in the number.
              </p>
            )}
          </section>

          <section>
            <h3 className={H3}>Neighbouring pairs</h3>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
              Each pair of digits side by side is read through the friendship between its two planets.
            </p>
            <ul className="grid gap-3 md:grid-cols-2">
              {result.pairs.map((p) => {
                const tone = p.relation ? relationTone(p.relation) : null;
                return (
                  <li key={p.pair.join('')} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-heading text-lg text-white">{p.pair.join('')}</h4>
                      {p.count > 1 && <span className="text-xs text-white/55">appears {p.count} times</span>}
                      {p.kind === 'planetary' && (
                        <span className="text-xs text-white/55">{NUMBERS[p.pair[0] as Digit].planet} and {NUMBERS[p.pair[1] as Digit].planet}</span>
                      )}
                      {tone && <Badge tone={TONE_BADGE[tone]}>{TONE_LABEL[tone]}</Badge>}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{pairText(p)}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-4">
            <HowCalculated steps={result.steps} />
            <NumerologyMethodLine method="The digits are added down to a root; pairs and fit follow the traditional friendships between the planets." />
            <ResultActions toolSlug="mobile-numerology" onSave={save} />
          </section>

          <PrintReport report={{ title: 'Mobile Number Numerology', subtitle: `Number: ${result.digits.join('')}`, sections: mobileSections(result), footer: REPORT_FOOTER }} />
        </div>
      )}
    </div>
  );
}

function Fit({ label, own, root, relation }: { label: string; own: Digit; root: Digit; relation: PairRelation }) {
  const same = own === root;
  const tone = same ? 'supportive' : relationTone(relation.mutual);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-medium text-white">{label}</h4>
        <Badge tone={TONE_BADGE[tone]}>{TONE_LABEL[tone]}</Badge>
      </div>
      <p className="mt-1 text-xs text-white/55">{NUMBERS[root].planet} with {NUMBERS[own].planet}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{same ? SAME_ROOT_TEXT : ROOT_FIT_TEXT[relation.mutual]}</p>
    </div>
  );
}
