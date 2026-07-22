import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Play, X, RotateCcw, Wind, Timer, Maximize2, Volume2, Mic } from 'lucide-react';
import { SriYantra } from '@/components/effects/SriYantra';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useSound } from '@/contexts/SoundContext';
import { audioConfig } from '@/config/audio';

type Phase = 'setup' | 'focus' | 'done';
type ObjectId = 'bindu' | 'flame' | 'om' | 'yantra';

const OBJECTS: { id: ObjectId; name: string; note: string }[] = [
  { id: 'bindu', name: 'Luminous Bindu', note: 'A single glowing point — the purest object of concentration.' },
  { id: 'flame', name: 'Candle Flame', note: 'The classic diya gaze; the living flame steadies the restless mind.' },
  { id: 'om', name: 'Om · ॐ', note: 'The primordial sound made visible — gaze and let it resonate.' },
  { id: 'yantra', name: 'Sri Yantra', note: 'Sacred geometry that draws the eye gently toward its centre.' },
];

const COLORS: { id: string; name: string; core: string; glow: string }[] = [
  { id: 'gold', name: 'Gold · Clarity', core: '#FFF4D6', glow: '#FFC83D' },
  { id: 'indigo', name: 'Indigo · Ajna', core: '#E4E2FF', glow: '#6D5DF6' },
  { id: 'white', name: 'White · Sahasrara', core: '#FFFFFF', glow: '#CFE3FF' },
  { id: 'blue', name: 'Blue · Calm', core: '#DCF0FF', glow: '#39B7F0' },
  { id: 'green', name: 'Green · Heart', core: '#E3FFE9', glow: '#34D399' },
];

const DURATIONS = [1, 3, 5, 10, 15];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function bell(ctx: AudioContext) {
  const now = ctx.currentTime;
  [528, 792].forEach((f, i) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(i ? 0.12 : 0.22, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
    o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 3.6);
  });
}

export default function TratakTool() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [object, setObject] = useState<ObjectId>('bindu');
  const [colorId, setColorId] = useState('indigo');
  const [minutes, setMinutes] = useState(5);
  const [breath, setBreath] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [ambientOn, setAmbientOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(audioConfig.tratak.voice.enabled);
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>(audioConfig.tratak.voice.lang);
  const [remaining, setRemaining] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const total = minutes * 60;
  const color = COLORS.find((c) => c.id === colorId) ?? COLORS[1];
  const audioRef = useRef<AudioContext | null>(null);
  const hideTimer = useRef<number | null>(null);
  const { user, recordMantraSession } = useAuth();
  const { notify } = useToast();
  const { beginTratak, endTratak, speak, stopSpeak } = useSound();
  const VL = audioConfig.tratak.voice.lines[voiceLang];

  const start = () => {
    try {
      audioRef.current = audioRef.current ?? new (window.AudioContext || (window as any).webkitAudioContext)();
      audioRef.current.resume?.();
    } catch { /* audio optional */ }
    setRemaining(total);
    setPhase('focus');
    beginTratak(ambientOn);
    if (voiceOn) setTimeout(() => speak(VL.start, voiceLang), 600);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const exitFs = () => { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); };
  const finish = useCallback(() => { setPhase('setup'); endTratak(); stopSpeak(); exitFs(); }, [endTratak, stopSpeak]);

  // stop all tratak audio if the tool unmounts
  useEffect(() => () => { endTratak(); stopSpeak(); }, [endTratak, stopSpeak]);

  // countdown
  useEffect(() => {
    if (phase !== 'focus') return;
    const mid = Math.floor(total / 2);
    const id = window.setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        if (r <= 1) {
          window.clearInterval(id);
          if (audioRef.current) bell(audioRef.current);
          if (voiceOn) setTimeout(() => speak(VL.end, voiceLang), 700);
          setPhase('done');
          if (user) recordMantraSession(minutes);
          return 0;
        }
        if (next === total - 22 && total > 60 && voiceOn) speak(VL.settle, voiceLang);
        if (next === mid && voiceOn) speak(VL.mid, voiceLang);
        if (next === 25 && total > 70 && voiceOn) speak(VL.nearEnd, voiceLang);
        // gentle periodic reminders on longer sessions, away from the staged cues
        const elapsed = total - next;
        if (voiceOn && total > 150 && elapsed > 0 && elapsed % 80 === 0 && next > 45 && Math.abs(next - mid) > 12) {
          speak(VL.reminders[Math.floor(elapsed / 80 - 1) % VL.reminders.length], voiceLang);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, user, minutes, recordMantraSession, total, voiceOn, voiceLang, speak, VL]);

  // esc to exit, auto-hide controls
  useEffect(() => {
    if (phase === 'setup') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    const onMove = () => {
      setShowControls(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setShowControls(false), 2600);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousemove', onMove);
    onMove();
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousemove', onMove); };
  }, [phase, finish]);

  const progress = total ? 1 - remaining / total : 0;

  // ---- setup screen ----
  if (phase === 'setup') {
    return (
      <div className="space-y-8">
        <Card className="p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-white/65">
            <b className="text-white">Trataka</b> (त्राटक) is the yogic practice of steady, unblinking gaze at a single point.
            One of the six classical purifications, it gathers a scattered mind into one-pointed focus (dharana) and awakens the
            ajna chakra. Gaze softly without straining; when the eyes water, close them and watch the glowing afterimage drift
            to the centre of your brow.
          </p>
        </Card>

        <Card className="p-6 sm:p-8">
          <p className="eyebrow mb-3">✦ Choose your object</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {OBJECTS.map((o) => (
              <button key={o.id} onClick={() => setObject(o.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${object === o.id ? 'border-gold-400/60 bg-gold-400/5' : 'border-white/10 bg-white/4 hover:border-white/25'}`}>
                <p className="font-heading text-h5 text-white">{o.name}</p>
                <p className="mt-1 text-xs leading-snug text-white/55">{o.note}</p>
              </button>
            ))}
          </div>

          {object === 'bindu' && (
            <div className="mt-6">
              <p className="eyebrow mb-3">✦ Light colour</p>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button key={c.id} onClick={() => setColorId(c.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all ${colorId === c.id ? 'border-white/40 text-white' : 'border-white/10 text-white/55 hover:text-white/80'}`}>
                    <span className="h-4 w-4 rounded-full" style={{ background: c.glow, boxShadow: `0 0 8px ${c.glow}` }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="eyebrow mb-3">✦ Duration</p>
            <div className="flex flex-wrap gap-2.5">
              {DURATIONS.map((m) => (
                <button key={m} onClick={() => setMinutes(m)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-all ${minutes === m ? 'border-gold-400/60 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/60 hover:text-white'}`}>
                  {m} min
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setBreath((b) => !b)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${breath ? 'border-brand-cyan-400/50 bg-brand-cyan-400/10 text-brand-cyan-300' : 'border-white/12 text-white/60'}`}>
              <Wind className="h-4 w-4" /> Breath pacer {breath ? 'on' : 'off'}
            </button>
            <button onClick={() => setShowTimer((t) => !t)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${showTimer ? 'border-white/30 text-white' : 'border-white/12 text-white/50'}`}>
              <Timer className="h-4 w-4" /> Timer {showTimer ? 'visible' : 'hidden'}
            </button>
            <button onClick={() => setAmbientOn((a) => !a)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${ambientOn ? 'border-violet-chakra/50 bg-violet-chakra/10 text-white' : 'border-white/12 text-white/50'}`}>
              <Volume2 className="h-4 w-4" /> Ambient {ambientOn ? 'on' : 'off'}
            </button>
            <button onClick={() => setVoiceOn((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${voiceOn ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/50'}`}>
              <Mic className="h-4 w-4" /> Guided voice {voiceOn ? (voiceLang === 'hi' ? '· हिन्दी' : '· English') : 'off'}
            </button>
          </div>

          {voiceOn && (
            <div className="mt-4">
              <p className="eyebrow mb-2">✦ Guided voice language</p>
              <div className="flex gap-2.5">
                {([{ id: 'en', label: 'English' }, { id: 'hi', label: 'हिन्दी' }] as const).map((l) => (
                  <button key={l.id} onClick={() => { setVoiceLang(l.id); speak(audioConfig.tratak.voice.lines[l.id].settle, l.id); }}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-all ${voiceLang === l.id ? 'border-gold-400/60 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/60 hover:text-white'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/35">Tap a language to hear a short sample. Uses your device’s built-in voices.</p>
            </div>
          )}

          <Button size="lg" className="mt-8 w-full sm:w-auto" onClick={start}>
            <Play className="mr-2 h-4 w-4" /> Begin Trataka · {minutes} min
          </Button>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/40">
            <Maximize2 className="h-3 w-3" /> Opens a distraction-free full screen. Press Esc anytime to return.
          </p>
        </Card>
      </div>
    );
  }

  // ---- immersive focus + done overlay ----
  return (
    <div data-sound="none" className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #0b0a1f 0%, #050510 55%, #000000 100%)', cursor: showControls ? 'default' : 'none' }}>

      {breath && phase === 'focus' && (
        <div aria-hidden className="absolute h-[60vmin] w-[60vmin] rounded-full border animate-breath-cycle"
          style={{ borderColor: `${color.glow}55` }} />
      )}

      {/* progress ring */}
      {phase === 'focus' && (
        <svg className="absolute h-[42vmin] w-[42vmin] -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="48" fill="none" stroke={color.glow} strokeWidth="0.7" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear', opacity: 0.5 }} />
        </svg>
      )}

      {/* focus object */}
      <FocusObject object={object} color={color} />

      {/* timer + controls */}
      <AnimatePresence>
        {phase === 'focus' && showControls && (
          <>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={finish} aria-label="End session"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:text-white">
              <X className="h-5 w-5" />
            </motion.button>
            {showTimer && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                className="absolute bottom-8 font-mono text-lg tracking-widest text-white/60">{fmt(remaining)}</motion.p>
            )}
          </>
        )}
      </AnimatePresence>

      {/* completion popup */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="mx-5 max-w-md rounded-3xl border border-white/12 bg-cosmic-light/70 p-8 text-center backdrop-blur-md">
              <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity }}
                className="mx-auto mb-5 h-16 w-16 rounded-full"
                style={{ background: `radial-gradient(circle, ${color.core}, ${color.glow})`, boxShadow: `0 0 50px -6px ${color.glow}` }} />
              <p className="font-sacred text-h4 text-gradient-gold">ॐ शान्तिः</p>
              <h3 className="mt-2 font-heading text-h4 text-white">Practice complete</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                You held your gaze for {minutes} minute{minutes > 1 ? 's' : ''}. Now gently close your eyes and watch the
                glowing afterimage settle at the centre of your brow — the ajna. Rest there until it fades.
              </p>
              {user && <p className="mt-3 text-xs text-white/40">Session added to your practice streak.</p>}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={() => { setRemaining(total); setPhase('focus'); if (voiceOn) setTimeout(() => speak(VL.start, voiceLang), 500); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Gaze again
                </Button>
                <Button variant="outline" onClick={() => { finish(); notify('May your focus stay steady.'); }}>Finish</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FocusObject({ object, color }: { object: ObjectId; color: { core: string; glow: string } }) {
  if (object === 'flame') {
    return (
      <div className="relative grid place-items-center">
        <div className="absolute h-[34vmin] w-[34vmin] rounded-full blur-3xl animate-breathe" style={{ background: 'radial-gradient(circle,#FF8A0055,transparent 70%)' }} />
        <svg viewBox="0 0 100 160" className="relative h-[40vmin] w-auto">
          <defs>
            <radialGradient id="flameG" cx="50%" cy="62%" r="55%">
              <stop offset="0%" stopColor="#FFFDF0" /><stop offset="35%" stopColor="#FFD24D" />
              <stop offset="70%" stopColor="#FF8A00" /><stop offset="100%" stopColor="#E5391F" />
            </radialGradient>
          </defs>
          <g className="origin-bottom animate-flicker" style={{ transformOrigin: '50px 150px' }}>
            <path d="M50 18 C70 55 78 78 64 108 C58 122 70 126 60 142 C56 149 44 149 40 142 C30 126 42 122 36 108 C22 78 30 55 50 18 Z" fill="url(#flameG)" />
            <path d="M50 70 C60 88 60 104 50 128 C40 104 40 88 50 70 Z" fill="#2A1B6B" opacity="0.55" />
          </g>
          <ellipse cx="50" cy="150" rx="9" ry="3" fill="#FFB72B" opacity="0.5" />
        </svg>
      </div>
    );
  }
  if (object === 'om') {
    return (
      <div className="relative grid place-items-center">
        <div className="absolute h-[42vmin] w-[42vmin] rounded-full blur-3xl animate-breathe" style={{ background: `radial-gradient(circle, ${color.glow}44, transparent 70%)` }} />
        <span className="relative font-sacred leading-none animate-breathe"
          style={{ fontSize: '34vmin', color: color.core, textShadow: `0 0 40px ${color.glow}, 0 0 80px ${color.glow}` }}>ॐ</span>
      </div>
    );
  }
  if (object === 'yantra') {
    return (
      <div className="relative grid h-[46vmin] w-[46vmin] place-items-center">
        <div className="absolute inset-0 rounded-full blur-3xl animate-breathe" style={{ background: `radial-gradient(circle, ${color.glow}33, transparent 70%)` }} />
        <SriYantra className="relative h-full w-full" stroke={color.glow} />
      </div>
    );
  }
  // bindu
  return (
    <div className="relative grid place-items-center">
      <div className="absolute h-[30vmin] w-[30vmin] rounded-full blur-3xl animate-breathe" style={{ background: `radial-gradient(circle, ${color.glow}66, transparent 70%)` }} />
      <div className="absolute h-[15vmin] w-[15vmin] rounded-full blur-xl animate-pulse-glow" style={{ background: `radial-gradient(circle, ${color.glow}, transparent 72%)` }} />
      <div className="relative h-[8vmin] w-[8vmin] rounded-full"
        style={{ background: `radial-gradient(circle at 42% 38%, ${color.core}, ${color.glow} 70%)`, boxShadow: `0 0 40px 4px ${color.glow}` }} />
    </div>
  );
}
