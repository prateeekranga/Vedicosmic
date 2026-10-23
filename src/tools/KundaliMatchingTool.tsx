import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, RotateCcw, Sparkles, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { DateSelect } from '@/components/ui/DateSelect';
import { Accordion } from '@/components/ui/Accordion';
import { PlaceSearch } from '@/components/astro/PlaceSearch';
import type { ChosenPlace } from '@/lib/places';
import { matchPeople, type MatchReport, type PersonInput } from '@/lib/matchmaking';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { SaveOnDeviceButton } from '@/components/device/SaveOnDeviceButton';
import { useToast } from '@/contexts/ToastContext';

function useCountUp(target: number, dur = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

interface FormPerson { name: string; gender: 'male' | 'female'; dob: string; time: string; place: ChosenPlace | null }
const blankPerson = (): FormPerson => ({ name: '', gender: 'male', dob: '', time: '06:00', place: null });

/** DateSelect allows day 1-31 regardless of month — catch rollover dates like Feb 30. */
function isValidISODate(iso: string): boolean {
  if (!iso) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(iso + 'T00:00:00');
  return dt.getFullYear() === y && dt.getMonth() + 1 === m && dt.getDate() === d;
}

function sameEntry(a: FormPerson, b: FormPerson): boolean {
  return a.name.trim().toLowerCase() === b.name.trim().toLowerCase()
    && a.dob === b.dob && a.time === b.time && a.place?.label === b.place?.label
    && a.name.trim().length > 0;
}

function PersonForm({ label, p, setP }: { label: string; p: FormPerson; setP: (p: FormPerson) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading text-h5 text-gold-pale">{label}</h3>
      <Input label="Full name" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="e.g. Arjuna" />
      <div>
        <label className="mb-1.5 block text-sm text-white/70">Gender <span className="text-white/40">(used for the Varna koota's classical comparison)</span></label>
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as const).map((g) => (
            <button key={g} onClick={() => setP({ ...p, gender: g })} data-sound="tap"
              className={`rounded-xl border py-2 text-sm capitalize transition-all ${p.gender === g ? 'border-gold-400/60 bg-gold-400/10 text-gold-200' : 'border-white/12 text-white/60'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <DateSelect value={p.dob} onChange={(iso) => setP({ ...p, dob: iso })} label="Date of birth" />
      {p.dob && !isValidISODate(p.dob) && <p className="text-xs text-error">That date doesn't exist — check the day and month.</p>}
      <Input type="time" label="Time of birth" value={p.time} onChange={(e) => setP({ ...p, time: e.target.value })} />
      <PlaceSearch id={`${label.toLowerCase().replace(/\W+/g, '-')}-place`} label="Place of birth" value={p.place}
        onChange={(place) => setP({ ...p, place })} allowOffsetOverride />
    </div>
  );
}

export default function KundaliMatchingTool() {
  const [a, setA] = useState<FormPerson>(blankPerson());
  const [b, setB] = useState<FormPerson>(blankPerson());
  const [report, setReport] = useState<MatchReport | null>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const ready = a.name.trim().length > 1 && isValidISODate(a.dob) && !!a.place
    && b.name.trim().length > 1 && isValidISODate(b.dob) && !!b.place;
  const isSamePerson = sameEntry(a, b);
  const orb = useCountUp(report?.ashtakoot.total ?? 0);
  const swap = () => { setA(b); setB(a); };

  const calculate = () => {
    if (!ready) return;
    const toInput = (p: FormPerson): PersonInput => {
      const [y, m, d] = p.dob.split('-').map(Number);
      return { name: p.name.trim(), gender: p.gender, day: d, month: m, year: y, time: p.time, place: p.place! };
    };
    setReport(matchPeople(toInput(a), toInput(b)));
  };

  const save = () => {
    if (!report) return;
    saveReading({
      toolId: 'kundali-matching', toolName: 'Kundali Matching',
      summary: `${a.name.trim()} & ${b.name.trim()} — ${report.ashtakoot.total}/36 gunas, ${report.ashtakoot.tier.label}`,
    });
    notify('Match saved on this device');
  };

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-400/10 text-gold-300"><Heart className="h-6 w-6" /></span>
            <h2 className="font-heading text-h3 text-white">Kundali Matching</h2>
            <p className="mt-1 text-sm text-white/55">Enter both birth details to reveal your Ashtakoot (Guna Milan) score and numerology compatibility.</p>
          </div>
          <div className="mb-4 flex justify-center">
            <Button variant="ghost" size="sm" onClick={swap}><ArrowLeftRight className="mr-2 h-4 w-4" /> Swap Person A &amp; B</Button>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <PersonForm label="Person A" p={a} setP={setA} />
            <PersonForm label="Person B" p={b} setP={setB} />
          </div>
          {isSamePerson && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-gold-soft/20 bg-gold-bright/5 px-4 py-3 text-sm text-white/70">
              <AlertTriangle className="h-4 w-4 shrink-0 text-gold-soft" />
              These look like the same person — Kundali matching compares two different birth charts. You can still continue, but double-check Person B's details.
            </p>
          )}
          <Button className="mt-8 w-full" disabled={!ready} onClick={calculate}>
            <Sparkles className="mr-2 h-4 w-4" /> Reveal Compatibility
          </Button>
        </Card>
      </div>
    );
  }

  const { ashtakoot, numerology } = report;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-h3 text-white">{a.name.trim()} <span className="text-white/30">&amp;</span> {b.name.trim()}</h2>
        <Button variant="ghost" size="sm" onClick={() => setReport(null)}><RotateCcw className="mr-2 h-4 w-4" /> Recalculate</Button>
      </div>

      <Card className="p-6 text-center sm:p-8">
        <p className="text-sm uppercase tracking-wider text-white/40">Ashtakoot · Guna Milan</p>
        <p className="mt-2 font-display text-6xl text-gradient-gold">{orb}<span className="text-2xl text-white/30">/36</span></p>
        <div className="mt-4 flex justify-center"><Badge tone={ashtakoot.tier.tone}>{ashtakoot.tier.label}</Badge></div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h3 className="mb-3 font-heading text-h5 text-white">Overall picture</h3>
        <p className="text-sm leading-relaxed text-white/70">
          The 8-koota Ashtakoot system scores {ashtakoot.total} out of 36 — {ashtakoot.tier.label.toLowerCase()}.
          Numerologically, your Life Path and Expression numbers align at {numerology.overallPercent}%.
          Neither system alone tells the whole story — read both alongside your own lived experience of each other, never as a verdict.
        </p>
      </Card>

      <div>
        <h3 className="mb-3 font-heading text-h5 text-white">The eight kootas</h3>
        <Accordion items={[
          ...ashtakoot.kootas.map((k) => ({
            id: k.key,
            header: (
              <span className="flex w-full items-center justify-between pr-2">
                <span>{k.label}</span><span className="text-gold-soft">{k.score}/{k.max}</span>
              </span>
            ),
            body: (
              <div>
                <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gold-bright" style={{ width: `${(k.score / k.max) * 100}%` }} />
                </div>
                <p>{k.note}</p>
              </div>
            ),
          })),
          {
            id: 'manglik',
            header: <span className="flex items-center gap-2 text-white/50">Manglik (Mars) dosha <Badge tone="neutral">Coming soon</Badge></span>,
            body: <p>A genuine Manglik check needs Mars&apos; precise position, which needs a more careful planetary ephemeris than this site currently models. We&apos;d rather leave this out than guess on a factor some families treat seriously — it&apos;s on the roadmap.</p>,
          },
        ]} defaultOpen="nadi" />
      </div>

      <Card className="p-6 sm:p-8">
        <h3 className="mb-4 font-heading text-h5 text-white">Numerology compatibility</h3>
        <div className="space-y-4">
          {[numerology.lifePath, numerology.expression].map((n) => (
            <div key={n.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{n.label}: {n.a} &amp; {n.b}</span>
                <span className="text-gold-soft">{n.score}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-brand-cyan" style={{ width: `${n.score}%` }} />
              </div>
              {n.traditionallyCompatible && <Badge tone="cyan" className="mt-2">Traditionally compatible numbers</Badge>}
            </div>
          ))}
        </div>
      </Card>

      <p className="text-center text-xs text-white/40">
        Moon positions are calculated on your device (Lahiri ayanamsa), with each birth time read in the birth place’s own time zone. A score is one thing many families consider; it is not a verdict on a relationship.
      </p>

      <div className="text-center">
        <SaveOnDeviceButton label="Save this match" onSave={save} />
      </div>
    </motion.div>
  );
}
