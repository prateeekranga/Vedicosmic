import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Wind, Eye, Flame, Sparkles, ArrowRight, Flower2, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { panchang, upcomingVrats } from '@/lib/panchang';

/* ── the day's suggested three-step flow ── */
const FLOWS = [
  { key: 'ground', title: 'Ground & Breathe', to: '/tools/pranayama', Icon: Wind, mins: 5, desc: 'Settle the nervous system with paced breath.' },
  { key: 'focus', title: 'Gaze & Focus', to: '/tools/tratak', Icon: Eye, mins: 5, desc: 'Sharpen attention with one-pointed Trataka.' },
  { key: 'rise', title: 'Raise the Energy', to: '/tools/kundalini', Icon: Flame, mins: 7, desc: 'Draw prāṇa up the spine through the chakras.' },
];

/* time-of-day greeting + a matching micro-suggestion */
function dayContext() {
  const h = new Date().getHours();
  if (h < 5) return { g: 'The still hours', s: 'The world sleeps — a rare, quiet field for japa.', ideal: 'Brahma Muhurta is near — ideal for meditation.' };
  if (h < 9) return { g: 'Good morning', s: 'The freshest prāṇa of the day. Begin with breath.', ideal: 'Morning is best for pranayama and Trataka.' };
  if (h < 12) return { g: 'A bright forenoon', s: 'Sharp, focused energy — good for study and japa.', ideal: 'Abhijit muhurta arrives around midday.' };
  if (h < 16) return { g: 'Good afternoon', s: 'Let a short sitting steady the day’s momentum.', ideal: 'A brief breath practice resets the afternoon.' };
  if (h < 19) return { g: 'Golden evening', s: 'The twilight sandhya — a sacred seam of the day.', ideal: 'Pradosh twilight is auspicious for Shiva.' };
  return { g: 'Good night', s: 'The danger hour for the restless mind — fill it with mantra.', ideal: 'End the day with japa and gratitude.' };
}

function MiniMoon({ phase }: { phase: number }) {
  const lit = 1 - Math.abs(phase - 0.5) * 2;
  const waxing = phase < 0.5;
  const r = 26, cx = 30, cy = 30, k = Math.cos(lit * Math.PI), rx = Math.abs(k) * r;
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14" style={{ filter: `drop-shadow(0 0 ${6 + lit * 12}px rgba(244,241,228,0.4))` }}>
      <defs><clipPath id="dm"><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
      <g clipPath="url(#dm)">
        <rect width="60" height="60" fill="#2A2740" />
        <rect x={waxing ? cx : 0} width={cx} height="60" fill="#F4F1E4" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={r} fill={lit > 0.5 ? '#F4F1E4' : '#2A2740'} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" />
    </svg>
  );
}

export default function SadhanaTool() {
  const { user } = useAuth();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const pan = useMemo(() => panchang(new Date()), []);
  const nextVrat = useMemo(() => upcomingVrats(new Date(), 30)[0], []);
  const ctx = useMemo(dayContext, []);
  const streak = user?.mantraStreak?.currentStreak ?? 0;

  const completed = FLOWS.filter((f) => done[f.key]).length;
  const pct = Math.round((completed / FLOWS.length) * 100);

  const stars = useMemo(() => Array.from({ length: 26 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, r: Math.random() * 1.3 + 0.3, o: Math.random() * 0.5 + 0.15 })), []);

  return (
    <div className="space-y-8">
      {/* hero greeting */}
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 -z-0" style={{ background: 'radial-gradient(120% 120% at 85% 0%, rgba(255,215,0,0.08), transparent 55%)' }} />
        <svg className="pointer-events-none absolute inset-0 -z-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.35} fill="#fff" opacity={s.o} />)}
        </svg>
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <span className="eyebrow flex items-center gap-2"><Sun className="h-4 w-4" /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <h2 className="mt-1 font-heading text-h2 text-white">{ctx.g}{user ? `, ${user.displayName.split(' ')[0]}` : ''}</h2>
            <p className="mt-1 max-w-lg text-sm text-white/60">{ctx.s}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="gold">{pan.tithiName}</Badge>
              <Badge tone="cyan">Moon in {pan.nakshatra}</Badge>
              <Badge tone="neutral">{pan.paksha === 'Shukla' ? 'Waxing' : 'Waning'}</Badge>
            </div>
          </div>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <MiniMoon phase={pan.moonPhase} />
          </motion.div>
        </div>
      </Card>

      {/* today's flow */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow flex items-center gap-2"><Sparkles className="h-4 w-4" /> Today’s sādhana · {FLOWS.reduce((a, f) => a + f.mins, 0)} min</span>
          <span className="text-xs text-white/45">{completed}/{FLOWS.length} done</span>
        </div>

        {/* progress path */}
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/6">
          <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg,#39B7F0,#FFD700)' }} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {FLOWS.map((f, i) => (
            <motion.div key={f.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={`group h-full p-5 transition-colors ${done[f.key] ? 'border-gold-soft/40' : ''}`}>
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-bright/10">
                    <f.Icon className="h-5 w-5 text-gold-300" />
                  </span>
                  <button onClick={() => setDone((d) => ({ ...d, [f.key]: !d[f.key] }))} aria-label="Mark done"
                    className={`grid h-7 w-7 place-items-center rounded-full border transition-colors ${done[f.key] ? 'border-gold-soft/60 bg-gold-bright/20 text-gold-pale' : 'border-white/15 text-white/30 hover:text-white/60'}`}>
                    <Check className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm font-medium text-white">{i + 1}. {f.title}</p>
                <p className="mt-1 text-xs leading-snug text-white/50">{f.desc}</p>
                <Link to={f.to} className="mt-3 inline-flex items-center gap-1 text-xs text-gold-300 hover:gap-2 transition-all">
                  {f.mins} min · begin <ArrowRight className="h-3 w-3" />
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        {completed === FLOWS.length && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-sm text-gold-200">
            ✦ Today’s sādhana complete. The energy stays with you. ✦
          </motion.p>
        )}
      </div>

      {/* streak + next vrat + timing */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <motion.div className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
            animate={{ boxShadow: `0 0 ${14 + Math.min(streak, 90) / 3}px 3px rgba(255,215,0,${0.15 + Math.min(streak, 90) / 200})` }}
            style={{ background: 'radial-gradient(circle at 38% 34%, rgba(255,247,214,0.6), rgba(255,183,43,0.4))' }}>
            <span className="font-display text-2xl text-white">{streak}</span>
          </motion.div>
          <div>
            <p className="text-sm font-medium text-white">Practice streak</p>
            <p className="text-xs text-white/50">{user ? 'Days in a row of sādhana' : 'Sign in to track your streak'}</p>
          </div>
        </Card>

        {nextVrat && (
          <Link to="/tools/vrat-calendar">
            <Card hover className="flex h-full items-center gap-4 p-5">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: 'rgba(255,215,0,0.10)' }}>🌿</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Next: {nextVrat.name}</p>
                <p className="text-xs text-white/50">{nextVrat.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-gold-300">Open calendar <ArrowRight className="h-3 w-3" /></span>
              </div>
            </Card>
          </Link>
        )}

        <Card className="flex items-center gap-4 p-5">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-cyan-400/10"><Moon className="h-6 w-6 text-brand-cyan-300" /></span>
          <div>
            <p className="text-sm font-medium text-white">Timing</p>
            <p className="text-xs leading-snug text-white/50">{ctx.ideal}</p>
            <Link to="/tools/muhurta" className="mt-1 inline-flex items-center gap-1 text-xs text-gold-300">Muhurta wheel <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </Card>
      </div>

      {/* quick access */}
      <div>
        <span className="eyebrow flex items-center gap-2"><Flower2 className="h-4 w-4" /> Continue your journey</span>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/tools/mantra-timer', t: 'Japa Timer', e: '📿' },
            { to: '/tools/urdhva', t: 'Urdhva Shakti', e: '🛡️' },
            { to: '/tools/soundbath', t: 'Sound Bath', e: '🎛️' },
            { to: '/tools/chakra-assessment', t: 'Chakra Check', e: '🌈' },
          ].map((q) => (
            <Link key={q.to} to={q.to}>
              <Card hover className="flex items-center gap-2.5 p-3.5 text-sm text-white/75">
                <span className="text-lg">{q.e}</span> {q.t}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-white/35">Your daily checklist resets each visit and lives only on this device. Sign in to keep a lasting practice streak.</p>
    </div>
  );
}
