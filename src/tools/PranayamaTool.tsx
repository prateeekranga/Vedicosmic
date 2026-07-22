import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Wind, Mic, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useSound } from '@/contexts/SoundContext';

/* ─────────────────────────── techniques ─────────────────────────── */

type Act = 'in' | 'out' | 'hold';
interface Ph { act: Act; secs: number; nostril?: 'L' | 'R'; label: string; say?: string; sayHi?: string }
type TechId = 'box' | '478' | 'nadi' | 'bhastrika' | 'calm';

const TECHS: { id: TechId; name: string; sub: string; rounds: number[]; note: string }[] = [
  { id: 'box', name: 'Box Breathing', sub: 'Sama Vritti · 4-4-4-4', rounds: [6, 8, 12], note: 'Equal inhale, hold, exhale, hold — steadies the nervous system like a square drawn in breath.' },
  { id: '478', name: '4 · 7 · 8', sub: 'The relaxing breath', rounds: [4, 6, 8], note: 'Inhale 4, hold 7, exhale 8 — a natural tranquiliser famed for easing the body toward sleep.' },
  { id: 'nadi', name: 'Nadi Shodhana', sub: 'Alternate nostril', rounds: [4, 6, 9], note: 'Alternate-nostril breathing balances ida and pingala — the lunar and solar channels.' },
  { id: 'bhastrika', name: 'Bhastrika', sub: 'Bellows breath', rounds: [2, 3, 4], note: 'Rapid bellows pumping followed by retention — heating, energising, awakening.' },
  { id: 'calm', name: 'Deep Calm', sub: 'Slow belly breath · 5-5', rounds: [8, 12, 16], note: 'Simple, slow diaphragmatic breathing — the foundation of every practice.' },
];

const SAY = {
  en: { in: 'Breathe in', out: 'Breathe out', hold: 'Hold', inL: 'Breathe in, left nostril', inR: 'Breathe in, right nostril', outL: 'Breathe out, left nostril', outR: 'Breathe out, right nostril', pump: 'Rapid bellows breaths' },
  hi: { in: 'साँस भरिए', out: 'साँस छोड़िए', hold: 'रोकिए', inL: 'बाएँ नथुने से साँस भरिए', inR: 'दाएँ नथुने से साँस भरिए', outL: 'बाएँ नथुने से साँस छोड़िए', outR: 'दाएँ नथुने से साँस छोड़िए', pump: 'तेज़ भस्त्रिका श्वास' },
};

function buildPhases(t: TechId, rounds: number): Ph[] {
  const ph: Ph[] = [];
  for (let r = 0; r < rounds; r++) {
    if (t === 'box') ph.push(
      { act: 'in', secs: 4, label: 'Inhale', say: SAY.en.in, sayHi: SAY.hi.in },
      { act: 'hold', secs: 4, label: 'Hold', say: SAY.en.hold, sayHi: SAY.hi.hold },
      { act: 'out', secs: 4, label: 'Exhale', say: SAY.en.out, sayHi: SAY.hi.out },
      { act: 'hold', secs: 4, label: 'Hold', say: SAY.en.hold, sayHi: SAY.hi.hold },
    );
    else if (t === '478') ph.push(
      { act: 'in', secs: 4, label: 'Inhale', say: SAY.en.in, sayHi: SAY.hi.in },
      { act: 'hold', secs: 7, label: 'Hold', say: SAY.en.hold, sayHi: SAY.hi.hold },
      { act: 'out', secs: 8, label: 'Exhale', say: SAY.en.out, sayHi: SAY.hi.out },
    );
    else if (t === 'nadi') ph.push(
      { act: 'in', secs: 4, nostril: 'L', label: 'Inhale · Left', say: SAY.en.inL, sayHi: SAY.hi.inL },
      { act: 'hold', secs: 4, label: 'Hold', say: SAY.en.hold, sayHi: SAY.hi.hold },
      { act: 'out', secs: 6, nostril: 'R', label: 'Exhale · Right', say: SAY.en.outR, sayHi: SAY.hi.outR },
      { act: 'in', secs: 4, nostril: 'R', label: 'Inhale · Right', say: SAY.en.inR, sayHi: SAY.hi.inR },
      { act: 'hold', secs: 4, label: 'Hold', say: SAY.en.hold, sayHi: SAY.hi.hold },
      { act: 'out', secs: 6, nostril: 'L', label: 'Exhale · Left', say: SAY.en.outL, sayHi: SAY.hi.outL },
    );
    else if (t === 'bhastrika') {
      for (let p = 0; p < 15; p++) ph.push(
        { act: 'in', secs: 1, label: 'Pump', say: p === 0 ? SAY.en.pump : undefined, sayHi: p === 0 ? SAY.hi.pump : undefined },
        { act: 'out', secs: 1, label: 'Pump' },
      );
      ph.push(
        { act: 'in', secs: 4, label: 'Deep inhale', say: SAY.en.in, sayHi: SAY.hi.in },
        { act: 'hold', secs: 12, label: 'Retain', say: SAY.en.hold, sayHi: SAY.hi.hold },
        { act: 'out', secs: 6, label: 'Slow exhale', say: SAY.en.out, sayHi: SAY.hi.out },
      );
    }
    else ph.push(
      { act: 'in', secs: 5, label: 'Inhale', say: SAY.en.in, sayHi: SAY.hi.in },
      { act: 'out', secs: 5, label: 'Exhale', say: SAY.en.out, sayHi: SAY.hi.out },
    );
  }
  return ph;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ─────────────────────────────  tool  ───────────────────────────── */

export default function PranayamaTool() {
  const [tech, setTech] = useState<TechId>('box');
  const [rounds, setRounds] = useState(8);
  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>('en');
  const [phase, setPhase] = useState<'setup' | 'session' | 'done'>('setup');
  const [idx, setIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const T = TECHS.find((x) => x.id === tech)!;
  const phases = useMemo(() => buildPhases(tech, rounds), [tech, rounds]);
  const total = useMemo(() => phases.reduce((a, p) => a + p.secs, 0), [phases]);
  const cur = phases[Math.min(idx, phases.length - 1)];
  const roundLen = phases.length / rounds;
  const curRound = Math.min(rounds, Math.floor(idx / roundLen) + 1);

  const hideTimer = useRef<number | null>(null);
  const { user, recordMantraSession } = useAuth();
  const { notify } = useToast();
  const { speak, stopSpeak } = useSound();

  // orb scale target: last in/out decides
  const scaleTarget = useMemo(() => {
    for (let i = Math.min(idx, phases.length - 1); i >= 0; i--) {
      if (phases[i].act === 'in') return 1;
      if (phases[i].act === 'out') return 0.42;
    }
    return 0.42;
  }, [idx, phases]);

  const start = () => {
    setIdx(0); setPhaseLeft(phases[0].secs); setPhase('session');
    document.documentElement.requestFullscreen?.().catch(() => {});
    if (voiceOn && phases[0].say) window.setTimeout(() => speak(voiceLang === 'hi' ? phases[0].sayHi! : phases[0].say!, voiceLang), 500);
  };
  const exitFs = () => { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); };
  const finish = useCallback(() => { setPhase('setup'); stopSpeak(); exitFs(); }, [stopSpeak]);
  useEffect(() => () => stopSpeak(), [stopSpeak]);

  // phase clock
  useEffect(() => {
    if (phase !== 'session') return;
    const id = window.setInterval(() => {
      setPhaseLeft((s) => {
        if (s > 1) return s - 1;
        // advance phase
        setIdx((i) => {
          const next = i + 1;
          if (next >= phases.length) {
            window.clearInterval(id);
            setPhase('done');
            if (user) recordMantraSession(Math.max(1, Math.round(total / 60)));
            if (voiceOn) speak(voiceLang === 'hi' ? 'अभ्यास पूर्ण हुआ। कुछ क्षण सहज साँस के साथ बैठिए।' : 'Practice complete. Sit for a few moments with the natural breath.', voiceLang);
            return i;
          }
          const p = phases[next];
          if (voiceOn && p.say) speak(voiceLang === 'hi' ? p.sayHi! : p.say!, voiceLang);
          setPhaseLeft(p.secs);
          return next;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, phases, total, user, recordMantraSession, voiceOn, voiceLang, speak]);

  // esc + auto-hide
  useEffect(() => {
    if (phase === 'setup') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    const onMove = () => {
      setShowControls(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setShowControls(false), 2800);
    };
    window.addEventListener('keydown', onKey); window.addEventListener('mousemove', onMove); onMove();
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousemove', onMove); };
  }, [phase, finish]);

  const elapsed = useMemo(() => phases.slice(0, idx).reduce((a, p) => a + p.secs, 0) + (cur ? cur.secs - phaseLeft : 0), [phases, idx, cur, phaseLeft]);

  /* ── setup ── */
  if (phase === 'setup') {
    return (
      <div className="space-y-8">
        <Card className="p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-white/65">
            <b className="text-white">Pranayama</b> (प्राणायाम) — the extension of prana through breath. Choose a technique and let the
            glowing orb pace you: it swells as you inhale, rests as you hold, and softens as you exhale, with a gentle voice keeping time.
          </p>
        </Card>

        <Card className="p-6 sm:p-8">
          <p className="eyebrow mb-3">✦ Choose your technique</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TECHS.map((t) => (
              <button key={t.id} onClick={() => { setTech(t.id); setRounds(t.rounds[1]); }}
                className={`rounded-2xl border p-4 text-left transition-all ${tech === t.id ? 'border-gold-400/60 bg-gold-400/5' : 'border-white/10 bg-white/4 hover:border-white/25'}`}>
                <p className="font-heading text-h5 text-white">{t.name}</p>
                <p className="text-xs text-brand-cyan-300/80">{t.sub}</p>
                <p className="mt-1.5 text-xs leading-snug text-white/55">{t.note}</p>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="eyebrow mb-3">✦ Rounds</p>
            <div className="flex flex-wrap gap-2.5">
              {T.rounds.map((r) => (
                <button key={r} onClick={() => setRounds(r)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-all ${rounds === r ? 'border-gold-400/60 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/60 hover:text-white'}`}>
                  {r} rounds · {fmt(buildPhases(tech, r).reduce((a, p) => a + p.secs, 0))}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setVoiceOn((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${voiceOn ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/50'}`}>
              <Mic className="h-4 w-4" /> Voice pacing {voiceOn ? (voiceLang === 'hi' ? '· हिन्दी' : '· English') : 'off'}
            </button>
            {voiceOn && ([{ id: 'en', label: 'English' }, { id: 'hi', label: 'हिन्दी' }] as const).map((l) => (
              <button key={l.id} onClick={() => setVoiceLang(l.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-all ${voiceLang === l.id ? 'border-gold-400/60 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/60 hover:text-white'}`}>
                {l.label}
              </button>
            ))}
          </div>

          <Button size="lg" className="mt-8 w-full sm:w-auto" onClick={start}>
            <Play className="mr-2 h-4 w-4" /> Begin {T.name} · {fmt(total)}
          </Button>
          {tech === 'bhastrika' && (
            <p className="mt-3 text-xs text-amber-200/70">
              ⚠ Bhastrika is a vigorous practice — skip it during pregnancy, or with high blood pressure or heart conditions, and stop if dizzy.
            </p>
          )}
          <p className="mt-2 text-xs text-white/40">Opens a distraction-free full screen. Press Esc anytime to return.</p>
        </Card>
      </div>
    );
  }

  /* ── session / done overlay ── */
  const orbColor = cur?.act === 'in' ? '#39B7F0' : cur?.act === 'out' ? '#8B5CF6' : '#FFD700';
  return (
    <div data-sound="none" className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #0b0a1f 0%, #050510 55%, #000 100%)', cursor: showControls ? 'default' : 'none' }}>

      {/* phase label */}
      <AnimatePresence mode="wait">
        <motion.div key={idx + (phase === 'done' ? 'd' : '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="pointer-events-none absolute top-[12%] text-center">
          <p className="font-heading text-2xl text-white/90 sm:text-3xl">{phase === 'done' ? 'Complete' : cur.label}</p>
          {phase === 'session' && <p className="mt-1 font-mono text-4xl text-white/70">{phaseLeft}</p>}
        </motion.div>
      </AnimatePresence>

      {/* breathing orb */}
      <div className="relative grid place-items-center">
        <motion.div className="absolute h-[62vmin] w-[62vmin] rounded-full border"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <motion.div className="absolute h-[62vmin] w-[62vmin] rounded-full blur-3xl"
          animate={{ scale: phase === 'done' ? 1 : scaleTarget, background: `radial-gradient(circle, ${orbColor}33, transparent 70%)` }}
          transition={{ duration: phase === 'done' ? 1 : cur.secs, ease: 'easeInOut' }} />
        <motion.div className="h-[38vmin] w-[38vmin] rounded-full"
          animate={{ scale: phase === 'done' ? 1 : scaleTarget }}
          transition={{ duration: phase === 'done' ? 1 : cur.secs, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle at 40% 36%, #FFFFFFcc, ${orbColor})`, boxShadow: `0 0 80px -10px ${orbColor}` }} />
      </div>

      {/* nostril indicator for nadi shodhana */}
      {phase === 'session' && tech === 'nadi' && (
        <div className="pointer-events-none absolute bottom-[20%] flex items-center gap-10 text-sm">
          {(['L', 'R'] as const).map((n) => (
            <div key={n} className="flex flex-col items-center gap-1.5">
              <span className={`h-4 w-4 rounded-full transition-all duration-500 ${cur.nostril === n ? 'scale-125 bg-gold-400 shadow-glow-gold' : 'bg-white/15'}`} />
              <span className={cur.nostril === n ? 'text-gold-300' : 'text-white/35'}>{n === 'L' ? 'Left' : 'Right'}</span>
            </div>
          ))}
        </div>
      )}

      {/* controls */}
      <AnimatePresence>
        {phase === 'session' && showControls && (
          <>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={finish} aria-label="End practice"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:text-white">
              <X className="h-5 w-5" />
            </motion.button>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              className="absolute bottom-8 font-mono text-sm tracking-widest text-white/60">
              Round {curRound}/{rounds} · {fmt(Math.max(0, total - elapsed))} left
            </motion.p>
          </>
        )}
      </AnimatePresence>

      {/* completion */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="mx-5 max-w-md rounded-3xl border border-white/12 bg-cosmic-light/70 p-8 text-center backdrop-blur-md">
              <Wind className="mx-auto mb-4 h-10 w-10 text-brand-cyan-300" />
              <p className="font-sacred text-h4 text-gradient-gold">ॐ शान्तिः</p>
              <h3 className="mt-2 font-heading text-h4 text-white">Practice complete</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {rounds} rounds of {T.name}. Sit quietly and let the breath return to its own natural rhythm — notice how still the mind has become.
              </p>
              {user && <p className="mt-3 text-xs text-white/40">Session added to your practice streak.</p>}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={start}><RotateCcw className="mr-2 h-4 w-4" /> Practice again</Button>
                <Button variant="outline" onClick={() => { finish(); notify('Breathe easy.'); }}>Finish</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
