import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, Flame, Check } from 'lucide-react';
import { MANTRAS } from '@/data/mantras';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const MALA = 108;

export default function MantraTimerTool() {
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [logged, setLogged] = useState(false);
  const pulseRef = useRef<HTMLButtonElement>(null);
  const { user, recordMantraSession } = useAuth();
  const { notify } = useToast();
  const mantra = MANTRAS[idx];

  const rounds = Math.floor(count / MALA);
  const inRound = count % MALA;
  const ratio = inRound / MALA;

  // Keyboard: space to count
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault(); tick();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const tick = () => {
    setCount((c) => {
      const next = c + 1;
      if (next % MALA === 0) notify(`Mala complete — ${next / MALA} round${next / MALA > 1 ? 's' : ''} 🙏`, 'success');
      return next;
    });
    if (navigator.vibrate) navigator.vibrate(8);
  };

  const reset = () => { setCount(0); setLogged(false); };

  const complete = () => {
    if (count === 0) return;
    recordMantraSession(count);
    setLogged(true);
    notify(`Session logged: ${count} repetitions`);
  };

  // Circle geometry
  const R = 130, C = 2 * Math.PI * R;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {MANTRAS.map((m, i) => (
          <button key={m.id} onClick={() => { setIdx(i); reset(); }}
            className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
              i === idx ? 'border-gold-soft/60 bg-gold-bright/10 text-gold-pale' : 'border-white/10 text-white/60 hover:border-white/30'
            }`}>{m.name}</button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <Card className="flex flex-col items-center p-8">
          <button ref={pulseRef} onClick={tick}
            className="relative flex items-center justify-center focus-visible:outline-none"
            aria-label="Count one repetition">
            <svg width="300" height="300" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <motion.circle cx="150" cy="150" r={R} fill="none" stroke="#FFD700" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={C} transform="rotate(-90 150 150)"
                animate={{ strokeDashoffset: C - ratio * C }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
            </svg>
            <motion.div key={count} initial={{ scale: 0.85 }} animate={{ scale: 1 }}
              className="absolute flex flex-col items-center">
              <span className="font-display text-6xl text-gradient-gold">{inRound}</span>
              <span className="mt-1 text-xs text-white/40">of {MALA} · tap or press space</span>
            </motion.div>
          </button>
          <div className="mt-6 flex gap-3">
            <Button onClick={tick}><Plus className="h-4 w-4" /> Count</Button>
            <Button variant="ghost" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
          </div>
          {rounds > 0 && <Badge tone="gold" className="mt-4">{rounds} mala{rounds > 1 ? 's' : ''} · {count} total</Badge>}
        </Card>

        <div className="space-y-5">
          <Card className="p-6">
            <span className="eyebrow">{mantra.deity} · {mantra.purpose}</span>
            <p className="mt-3 font-sacred text-2xl leading-relaxed text-gold-pale">{mantra.devanagari}</p>
            <p className="mt-3 text-sm italic text-white/70">{mantra.transliteration}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{mantra.meaning}</p>
          </Card>

          {user ? (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <div className="font-medium text-white">Your japa streak</div>
                  <div className="text-xs text-white/45">Keep the daily flame alive</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl text-gradient-gold">{user.mantraStreak.currentStreak}</div>
                  <div className="text-xs text-white/45">day{user.mantraStreak.currentStreak !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl bg-cosmic-light/30 py-3">
                  <div className="text-xl text-white">{user.mantraStreak.totalSessions}</div>
                  <div className="text-xs text-white/45">sessions</div>
                </div>
                <div className="rounded-xl bg-cosmic-light/30 py-3">
                  <div className="text-xl text-white">{user.mantraStreak.totalRepetitions.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-white/45">repetitions</div>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={complete} disabled={count === 0 || logged}>
                {logged ? <><Check className="h-4 w-4" /> Logged</> : `Log this session (${count})`}
              </Button>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-white/60">Sign in to track your daily streak and total repetitions.</p>
              <Button variant="outline" className="mt-4" onClick={() => window.dispatchEvent(new CustomEvent('vc:open-auth'))}>
                Sign in
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
