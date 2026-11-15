import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { chaldeanName, expression, normalizeName, type ChaldeanResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { COMPOUND_SOURCE, compoundReading } from '@/data/numerology/chaldeanCompounds';
import { coreLabel } from '@/lib/numerologyReport';
import { chaldeanPrint } from '@/lib/print/numerologyPrint';
import { parseISODate } from '@/engine/numerology';
import { localDateKey } from '@/engine/time';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';

const H3 = 'mb-3 font-heading text-h5 text-white';

/** A name's compound and root with its colour chip. */
function Summary({ result, label }: { result: ChaldeanResult; label: string }) {
  const info = NUMBERS[result.root];
  const reading = result.compoundKey ? compoundReading(result.compoundKey) : null;
  return (
    <Card className="h-full p-6">
      <p className="text-xs uppercase tracking-wide text-white/55">{label}</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="grid h-16 min-w-16 place-items-center rounded-2xl px-2 font-display text-3xl font-bold"
          style={{ background: info.colour.fill, color: info.colour.ink }}>{result.root}</span>
        <div>
          <p className="font-heading text-h4 text-white">Root {result.root} · {info.planet}</p>
          <p className="text-sm text-white/60">Compound {result.compound} · Chaldean</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/75">{info.strength}</p>
      {reading && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h4 className="text-sm font-medium text-white">
            Compound {result.compoundKey}{reading.symbol ? ` · ${reading.symbol}` : ''}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-white/70">{reading.text}</p>
          {result.compoundKey !== result.compound && (
            <p className="mt-1 text-xs text-white/55">{result.compound} is above 52, so its digits are added to reach {result.compoundKey}.</p>
          )}
          {reading.sameAs && <p className="mt-1 text-xs text-white/55">Cheiro gives {reading.number} the same reading as {reading.sameAs}.</p>}
        </div>
      )}
    </Card>
  );
}

export default function ChaldeanTool() {
  const [raw, setRaw] = useState('');
  const [other, setOther] = useState('');
  const result = useMemo(() => chaldeanName(raw), [raw]);
  const second = useMemo(() => chaldeanName(other), [other]);
  const name = useMemo(() => normalizeName(raw), [raw]);
  const western = useMemo(() => (name.letters ? expression(name) : null), [name]);
  const printable = useMemo(
    () => (result ? chaldeanPrint({ entry: raw, result, second, secondEntry: other, western, today: parseISODate(localDateKey())! }) : null),
    [raw, result, second, other, western],
  );
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  useShareResult(result ? `A name I checked has the Chaldean compound number ${result.compound} and root ${result.root} (${NUMBERS[result.root].planet}).` : null);

  const save = () => {
    if (!result) return;
    saveReading({ toolId: 'chaldean', toolName: 'Chaldean Numerology', summary: `Compound ${result.compound} · Root ${result.root} (${NUMBERS[result.root].planet})` });
    notify('Name number saved on this device');
  };

  const typed = raw.trim().length > 0;

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Input id="chaldean-name" label="Name, word or number" value={raw} autoComplete="off"
              placeholder="e.g. Rahul Sharma" onChange={(e) => setRaw(e.target.value)}
              aria-describedby="chaldean-help" className="pr-11 text-lg" />
            {raw && (
              <button type="button" onClick={() => setRaw('')} aria-label="Clear the name"
                className="absolute bottom-3 right-3 text-white/55 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Input id="chaldean-other" label="Compare another spelling (optional)" value={other} autoComplete="off"
            placeholder="e.g. Rahull Sharma" onChange={(e) => setOther(e.target.value)} className="text-lg" />
        </div>
        <p id="chaldean-help" className="mt-3 text-xs leading-relaxed text-white/55">
          The result updates as you type. Use the spelling you actually sign with. A business or brand name works the same way, and digits keep their own value.
        </p>
        {typed && name.hasNonLatin && (
          <p role="alert" className="mt-3 text-sm text-warning">
            Chaldean values are defined for the English alphabet only, so letters from other scripts cannot be counted. Please type the name in English letters.
          </p>
        )}
        {typed && !result && !name.hasNonLatin && (
          <p role="alert" className="mt-3 text-sm text-warning">Nothing here can be counted yet. Type letters A to Z or digits.</p>
        )}
      </Card>

      {result && (
        <div className="space-y-10">
          {/* One short line for screen readers; the full result would be read out on every keystroke. */}
          <p role="status" className="sr-only">Compound {result.compound}, root {result.root}, {NUMBERS[result.root].planet}.</p>
          <section>
            <h3 className={H3}>Name number</h3>
            <div className={`grid gap-4 ${second ? 'md:grid-cols-2' : ''}`}>
              <Summary result={result} label={second ? 'First spelling' : 'Your entry'} />
              {second && <Summary result={second} label="Second spelling" />}
            </div>
            {second && (
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {second.root === result.root
                  ? `Both spellings come to the same root, ${result.root}; only the compound number differs (${result.compound} and ${second.compound}).`
                  : `The spellings give different roots: ${result.root} (${NUMBERS[result.root].planet}) and ${second.root} (${NUMBERS[second.root].planet}).`}
              </p>
            )}
          </section>

          <section>
            <h3 className={H3}>Letter by letter</h3>
            <div className="space-y-4">
              {result.words.map((w, i) => (
                <div key={`${w.word}-${i}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-heading text-lg text-white">{w.word}</h4>
                    <p className="text-sm text-white/65">Total {w.total}, root {w.root}</p>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Letter values for ${w.word}`}>
                    {w.letters.map((l, j) => (
                      <li key={j} className="grid w-9 rounded-md border border-white/10 py-1 text-center">
                        <span className="text-sm font-medium text-white">{l.ch}</span>
                        <span className="text-xs text-white/60">{l.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {result.words.length > 1 && (
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Some teachers add each word down first and then add the roots: {result.words.map((w) => w.root).join(' + ')} = {result.perWordTotal}. The root is the same either way.
              </p>
            )}
            {western && (
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                For comparison, the Western (Pythagorean) letter values give this name an Expression number of {coreLabel(western)}. The two systems use different tables, so the numbers need not match.
              </p>
            )}
          </section>

          <section className="space-y-4">
            <HowCalculated steps={result.steps} />
            <NumerologyMethodLine method={`Cheiro’s Chaldean letter values (1 to 8; no letter is 9). ${COMPOUND_SOURCE}`} />
            <ResultActions toolSlug="chaldean" onSave={save} saveLabel="Save these numbers" />
          </section>

          {printable && <PrintReport report={printable} />}
        </div>
      )}
    </div>
  );
}
