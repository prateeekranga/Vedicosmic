import { DateSelect } from '@/components/ui/DateSelect';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import {
  LOSHU_NUMBERS, LOSHU_LAYOUT, buildLoshuChart, kuaNumber, reduceTo9,
} from '@/data/loshu';
import { chaldean } from '@/lib/chaldean';
import {
  STRENGTH, WEAKNESS, LUCKY_COLORS, LUCKY_NUMBERS, CYCLE, CALCULATORS, type CalculatorId,
} from '@/data/predictions';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';

interface Result {
  calc: CalculatorId;
  name: string;
  driver: number; conductor: number; kua: number | null;
  counts: Record<number, number>;
  nameRoot: number; nameCompound: number;
  personal: number;
}

const todayLabel = () => new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

export default function LifePathTool() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'' | 'male' | 'female'>('');
  const [calc, setCalc] = useState<CalculatorId | ''>('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const needsDob: CalculatorId[] = ['free-dob', 'lucky-color', 'lucky-number', 'today', 'month', 'year'];
  const needsName: CalculatorId[] = ['name-number'];

  const run = () => {
    if (!calc) { setError('Please choose a calculator.'); return; }
    if (needsName.includes(calc) && !name.trim()) { setError('Please enter a name.'); return; }
    if (needsDob.includes(calc) && !dob) { setError('Please enter your date of birth.'); return; }
    setError('');

    const chart = dob ? buildLoshuChart(dob) : null;
    const nameRes = name.trim() ? chaldean(name) : null;
    const now = new Date();
    let personal = 0;
    if (chart) {
      const py = reduceTo9(reduceTo9(chart.day) + reduceTo9(chart.month) + reduceTo9(now.getFullYear()));
      const pm = reduceTo9(py + (now.getMonth() + 1));
      const pd = reduceTo9(pm + now.getDate());
      personal = calc === 'year' ? py : calc === 'month' ? pm : pd;
    }

    setResult({
      calc,
      name: name.trim(),
      driver: chart?.driver ?? 0,
      conductor: chart?.conductor ?? 0,
      kua: chart && gender ? kuaNumber(chart.year, gender) : null,
      counts: chart?.counts ?? {},
      nameRoot: nameRes?.root ?? 0,
      nameCompound: nameRes?.compound ?? 0,
      personal,
    });
  };

  return (
    <div className="space-y-8">
      {/* Galaxy form */}
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-cosmic-darker/55 p-6 backdrop-blur-md sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative grid gap-4 sm:grid-cols-2">
          <Input id="lp-name" label="Full name" placeholder="Enter name" value={name}
            onChange={(e) => setName(e.target.value)} />
          <DateSelect value={dob} onChange={setDob} />
          <Select id="lp-gender" label="Gender" value={gender}
            onChange={(e) => setGender(e.target.value as '' | 'male' | 'female')}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          <Select id="lp-calc" label="Select calculator" value={calc}
            onChange={(e) => setCalc(e.target.value as CalculatorId)}>
            <option value="">Select calculator</option>
            {CALCULATORS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </div>
        <div className="relative mt-6 flex items-center gap-4">
          <Button onClick={run}><Wand2 className="mr-2 h-4 w-4" /> Get results</Button>
          {error && <span className="text-sm text-error">{error}</span>}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result.calc + result.driver + result.nameCompound + result.personal}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-3xl border border-white/10 bg-cosmic-light/30 p-6 backdrop-blur-sm sm:p-8">
            <p className="mb-1 text-sm font-medium text-brand-cyan-300">Hey {result.name || 'seeker'},</p>
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-white/45">
              Your {CALCULATORS.find((c) => c.id === result.calc)?.label}
            </p>
            <ReportBody r={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-sm text-white/80">
      {color && <span className="h-3.5 w-3.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

function NumberBadge({ n }: { n: number }) {
  const info = LOSHU_NUMBERS[n] ?? LOSHU_NUMBERS[1];
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-[#1a1330]" style={{ background: info.color }}>{n}</span>
  );
}

function StrengthWeakness({ n }: { n: number }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-success/25 bg-success/5 p-5">
        <span className="inline-block rounded-full bg-success/20 px-3 py-0.5 text-xs font-medium text-success">Strength</span>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{STRENGTH[n]}</p>
      </div>
      <div className="rounded-2xl border border-error/25 bg-error/5 p-5">
        <span className="inline-block rounded-full bg-error/20 px-3 py-0.5 text-xs font-medium text-error">Weakness</span>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{WEAKNESS[n]}</p>
      </div>
    </div>
  );
}

function MiniGrid({ counts }: { counts: Record<number, number> }) {
  return (
    <div className="mx-auto grid w-full max-w-[280px] grid-cols-3 gap-2">
      {LOSHU_LAYOUT.flat().map((n) => {
        const info = LOSHU_NUMBERS[n];
        const c = counts[n] || 0;
        return (
          <div key={n} className="flex aspect-square flex-col items-center justify-center rounded-xl text-center"
            style={{ background: c ? info.color : 'rgba(255,255,255,0.04)', border: c ? 'none' : '1px dashed rgba(255,255,255,0.15)' }}>
            <span className="font-heading text-lg font-bold" style={{ color: c ? '#1a1330' : 'rgba(255,255,255,0.25)' }}>
              {c ? String(n).repeat(c) : n}
            </span>
            <span className="text-[0.6rem] font-semibold tracking-wider" style={{ color: c ? 'rgba(26,19,48,0.65)' : 'rgba(255,255,255,0.28)' }}>
              {info.planet.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ReportBody({ r }: { r: Result }) {
  switch (r.calc) {
    case 'free-dob':
      return (
        <div>
          <MiniGrid counts={r.counts} />
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Chip><span className="text-white/50">Driver</span> <NumberBadge n={r.driver} /></Chip>
            <Chip><span className="text-white/50">Conductor</span> <NumberBadge n={r.conductor} /></Chip>
            {r.kua != null && <Chip><span className="text-white/50">Kua</span> <NumberBadge n={r.kua} /></Chip>}
          </div>
          <StrengthWeakness n={r.driver} />
        </div>
      );
    case 'name-number':
      return (
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="grid h-28 w-28 place-items-center rounded-full font-display text-5xl font-bold text-white"
              style={{ background: LOSHU_NUMBERS[r.nameRoot]?.color, boxShadow: `0 0 50px -10px ${LOSHU_NUMBERS[r.nameRoot]?.color}` }}>
              {r.nameRoot}
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-full bg-teal-cosmic font-heading text-lg font-semibold text-white">Σ-{r.nameCompound}</div>
          </div>
          <p className="mt-4 text-lg font-medium text-white">{r.name} vibrates to {r.nameRoot} — {LOSHU_NUMBERS[r.nameRoot]?.planet}</p>
          <StrengthWeakness n={r.nameRoot} />
        </div>
      );
    case 'lucky-color': {
      const set = LUCKY_COLORS[r.driver];
      return (
        <div className="space-y-5">
          <p className="text-sm text-white/60">Based on your Driver number <b className="text-white">{r.driver}</b> ({LOSHU_NUMBERS[r.driver].planet}).</p>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-success">Lucky colours</p>
            <div className="flex flex-wrap gap-2">{set.lucky.map((c) => <Chip key={c.n} color={c.hex}>{c.n}</Chip>)}</div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-error">Colours to avoid</p>
            <div className="flex flex-wrap gap-2">{set.avoid.map((c) => <Chip key={c.n} color={c.hex}>{c.n}</Chip>)}</div>
          </div>
        </div>
      );
    }
    case 'lucky-number': {
      const set = LUCKY_NUMBERS[r.driver];
      const Row = ({ label, nums, tone }: { label: string; nums: number[]; tone: string }) => (
        <div>
          <p className={`mb-2 text-xs uppercase tracking-wider ${tone}`}>{label}</p>
          <div className="flex flex-wrap gap-2">{nums.map((n) => <NumberBadge key={n} n={n} />)}</div>
        </div>
      );
      return (
        <div className="space-y-5">
          <p className="text-sm text-white/60">Based on your Driver number <b className="text-white">{r.driver}</b> ({LOSHU_NUMBERS[r.driver].planet}).</p>
          <Row label="Friendly numbers" nums={set.friend} tone="text-success" />
          <Row label="Neutral numbers" nums={set.neutral} tone="text-white/55" />
          <Row label="Numbers to avoid" nums={set.avoid} tone="text-error" />
        </div>
      );
    }
    case 'today':
    case 'month':
    case 'year': {
      const frame = r.calc === 'today' ? `Today, ${todayLabel()}` : r.calc === 'month' ? 'This month' : 'This year';
      return (
        <div>
          <div className="flex items-center gap-3">
            <NumberBadge n={r.personal} />
            <p className="text-lg font-medium text-white">{frame} carries a {r.personal}-vibration</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/75">{CYCLE[r.personal]}</p>
          <p className="mt-3 text-xs text-white/40">Ruled by {LOSHU_NUMBERS[r.personal].planet} · {LOSHU_NUMBERS[r.personal].keyword}</p>
        </div>
      );
    }
    default:
      return null;
  }
}
