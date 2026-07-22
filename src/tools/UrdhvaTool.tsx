import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Flame, ArrowUp, Wind, Eye, X, Check, RotateCcw, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSound } from '@/contexts/SoundContext';
import { useToast } from '@/contexts/ToastContext';
import { SerpentAscentLoop } from '@/components/effects/RealisticSerpent';

/* ─────────────────────────── persistence ─────────────────────────── */

interface Store { start: string; best: number; vow: string; sealed: string[] }
const KEY = 'vc.urdhva.v1';
const todayISO = () => new Date().toISOString().slice(0, 10);
const load = (): Store => {
  try { const s = JSON.parse(localStorage.getItem(KEY) || ''); if (s && s.start) return s; } catch { /* */ }
  return { start: todayISO(), best: 0, vow: '', sealed: [] };
};
const save = (s: Store) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* */ } };
const daysBetween = (a: string, b: string) => Math.max(0, Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000));

/* ─────────────────────────── milestones ─────────────────────────── */

const MILESTONES = [
  { d: 1, t: 'The first stand', s: 'The hardest step is behind you. The wave rose — and you did not follow it.' },
  { d: 3, t: 'Fog begins to lift', s: 'The mind starts to quieten. Practitioners often notice the first clarity here.' },
  { d: 7, t: 'One full week', s: 'Energy and confidence rise. The habit’s grip loosens noticeably.' },
  { d: 14, t: 'Focus deepens', s: 'Study and reading start to hold your attention again.' },
  { d: 21, t: 'A new groove', s: 'Three weeks — the classic mark where a new pattern begins to feel natural.' },
  { d: 30, t: 'Ojas glow', s: 'Tradition says conserved energy now shows as tejas — a visible calm brightness.' },
  { d: 60, t: 'The witness', s: 'Urges still visit, but you watch them pass like weather. This is real power.' },
  { d: 90, t: 'Urdhvaretas', s: 'The traditional 90-day mark of transmutation. The energy flows upward by habit.' },
];

/* ───────────────────────── SOS guided steps ───────────────────────── */

interface SosStep { id: string; secs: number; title: string; sub: string; say: string; sayHi: string }
const SOS: SosStep[] = [
  { id: 'wave', secs: 10, title: 'A wave has risen', sub: 'You are not the wave — you are the ocean it moves through. Don’t fight it. Just watch it.', say: 'A wave has risen. You are not the wave. You are the ocean it moves through. Just watch it.', sayHi: 'एक लहर उठी है। आप लहर नहीं हैं — आप वह सागर हैं जिसमें वह उठती है। बस उसे देखिए।' },
  { id: 'breath', secs: 60, title: 'Ride it with the breath', sub: 'Breathe with the orb — in for 4, out for 6. Six slow rounds. The wave cannot grow while the breath is long.', say: 'Now breathe with the orb. In for four. Out for six. Long, slow breaths.', sayHi: 'अब गोले के साथ साँस लीजिए। चार गिनती में भरिए, छह में छोड़िए। लंबी, धीमी साँसें।' },
  { id: 'rise', secs: 40, title: 'Draw the energy upward', sub: 'This force is prāṇa — raw power. With every inhale, feel it rise from the base of the spine to the point between the eyebrows.', say: 'This energy is power. With every inhale, draw it up the spine, to the point between your eyebrows.', sayHi: 'यह ऊर्जा शक्ति है। हर साँस के साथ इसे रीढ़ से ऊपर, भौंहों के बीच तक खींचिए।' },
  { id: 'mantra', secs: 25, title: 'Seal it with mantra', sub: 'Repeat silently: ॐ नमः शिवाय — the destroyer of what binds you.', say: 'Repeat silently. Om Namah Shivaya. Om Namah Shivaya.', sayHi: 'मन में दोहराइए — ॐ नमः शिवाय। ॐ नमः शिवाय।' },
  { id: 'ground', secs: 12, title: 'The wave passes', sub: 'Now stand up. Drink a glass of water. Step out of the room, away from the screen. You won this round.', say: 'The wave passes. Stand up, drink water, and step away from the screen. You won this round.', sayHi: 'लहर बीत गई। उठिए, पानी पीजिए, और स्क्रीन से दूर हो जाइए। यह दौर आपने जीत लिया।' },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ───────────────── transmutation diagram (animated) ───────────────── */

function TransmutationDiagram() {
  const CH = ['#EF4444', '#F97316', '#FACC15', '#34D399', '#38BDF8', '#6366F1', '#A78BFA'];
  return (
    <div className="relative" style={{ perspective: '800px' }}>
      <motion.svg viewBox="0 0 360 300" className="w-full"
        animate={{ rotateY: [-5, 5, -5] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}>
        {/* central figure */}
        <circle cx="180" cy="58" r="16" fill="rgba(255,255,255,0.14)" />
        <path d="M180 74 C 158 84 152 116 154 150 L 206 150 C 208 116 202 84 180 74 Z" fill="rgba(255,255,255,0.12)" />
        <path d="M126 178 Q 180 146 234 178 Q 208 194 180 192 Q 152 194 126 178 Z" fill="rgba(255,255,255,0.10)" />
        {/* chakra column */}
        {CH.map((c, i) => (
          <circle key={i} cx="180" cy={168 - i * 18} r="4.5" fill={c} opacity="0.85" style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
        ))}

        {/* downward path (left) — depletion */}
        <path d="M164 160 C 120 190 100 230 96 268" fill="none" stroke="#F87171" strokeWidth="2" strokeDasharray="4 5" opacity="0.55" />
        {[0, 1, 2].map((i) => (
          <motion.circle key={'d' + i} r="3.4" fill="#F87171"
            initial={{ cx: 164, cy: 160, opacity: 0.9 }}
            animate={{ cx: [164, 120, 96], cy: [160, 210, 268], opacity: [0.9, 0.6, 0] }}
            transition={{ duration: 2.6, delay: i * 0.9, repeat: Infinity, ease: 'easeIn' }} />
        ))}
        <text x="86" y="288" textAnchor="middle" fontSize="10" fill="#FCA5A5">bhoga · spent downward</text>
        <text x="86" y="299" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">restlessness · fog · guilt</text>

        {/* upward path (right) — transmutation */}
        <path d="M196 160 C 220 130 214 90 196 52" fill="none" stroke="#FFD700" strokeWidth="2.2" opacity="0.6" />
        {[0, 1, 2, 3].map((i) => (
          <motion.circle key={'u' + i} r="3.6" fill="#FFD700" style={{ filter: 'drop-shadow(0 0 6px #FFD700)' }}
            initial={{ cx: 196, cy: 160, opacity: 0 }}
            animate={{ cx: [196, 218, 196], cy: [160, 106, 52], opacity: [0, 1, 0.9] }}
            transition={{ duration: 3, delay: i * 0.75, repeat: Infinity, ease: 'easeOut' }} />
        ))}
        {/* crown radiance */}
        <motion.circle cx="180" cy="40" fill="none" stroke="#FFD700" strokeWidth="1"
          initial={{ r: 20, opacity: 0.55 }}
          animate={{ r: [20, 34], opacity: [0.55, 0] }} transition={{ duration: 2.4, repeat: Infinity }} />
        <text x="272" y="72" textAnchor="middle" fontSize="10" fill="#FDE68A">yoga · drawn upward</text>
        <text x="272" y="83" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.45)">ojas · focus · radiance</text>

        <text x="180" y="228" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.6)">one energy · two directions</text>
      </motion.svg>
    </div>
  );
}

/* ─────────────────────────────── tool ─────────────────────────────── */

export default function UrdhvaTool() {
  const [store, setStore] = useState<Store>(load);
  const [vowDraft, setVowDraft] = useState(store.vow);
  const [confirmSlip, setConfirmSlip] = useState(false);
  const [sos, setSos] = useState(false);
  const [step, setStep] = useState(0);
  const [stepLeft, setStepLeft] = useState(0);
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>('en');
  const [voiceOn, setVoiceOn] = useState(true);

  const { speak, stopSpeak, beginTratak, endTratak } = useSound();
  const { notify } = useToast();

  const streak = daysBetween(store.start, todayISO());
  const sealedToday = store.sealed.includes(todayISO());
  const glow = Math.min(1, streak / 90);
  const next = MILESTONES.find((m) => m.d > streak);

  const update = useCallback((s: Store) => { setStore(s); save(s); }, []);

  const sealDay = () => {
    if (sealedToday) return;
    update({ ...store, sealed: [...store.sealed.slice(-120), todayISO()] });
    notify(`Day ${streak} sealed. The energy stays with you.`);
  };
  const slip = () => {
    update({ ...store, start: todayISO(), best: Math.max(store.best, streak), sealed: [] });
    setConfirmSlip(false);
    notify('The vow renews now. No shame — only the next step.');
  };

  /* ── SOS session ── */
  const startSos = () => {
    setSos(true); setStep(0); setStepLeft(SOS[0].secs);
    beginTratak(false);
    if (voiceOn) window.setTimeout(() => speak(voiceLang === 'hi' ? SOS[0].sayHi : SOS[0].say, voiceLang), 500);
  };
  const endSos = useCallback((completed: boolean) => {
    setSos(false); stopSpeak(); endTratak();
    if (completed) notify('The wave passed — and you stood firm.');
  }, [stopSpeak, endTratak, notify]);
  useEffect(() => () => { stopSpeak(); endTratak(); }, [stopSpeak, endTratak]);

  useEffect(() => {
    if (!sos) return;
    const id = window.setInterval(() => {
      setStepLeft((s) => {
        if (s > 1) return s - 1;
        setStep((i) => {
          const nx = i + 1;
          if (nx >= SOS.length) { window.clearInterval(id); endSos(true); return i; }
          if (voiceOn) speak(voiceLang === 'hi' ? SOS[nx].sayHi : SOS[nx].say, voiceLang);
          setStepLeft(SOS[nx].secs);
          return nx;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [sos, voiceOn, voiceLang, speak, endSos]);

  useEffect(() => {
    if (!sos) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') endSos(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sos, endSos]);

  const cur = SOS[Math.min(step, SOS.length - 1)];
  const totalLeft = useMemo(() => SOS.slice(step + 1).reduce((a, x) => a + x.secs, 0) + stepLeft, [step, stepLeft]);
  const breathing = cur.id === 'breath' || cur.id === 'rise';
  const breathT = 10; // 4 in + 6 out
  const orbRef = useRef(0); orbRef.current++;

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <div className="space-y-8">
      {/* intro */}
      <Card className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/65">
          The old yogis had a name for the one whose energy rises: <b className="text-white">ūrdhvaretas</b> (ऊर्ध्वरेतस्).
          The pull you feel is not something dirty — it is <b className="text-white">prāṇa</b>, the most concentrated power a
          young body makes. Fed to a screen, it drains downward into fog and guilt. Drawn upward, the same force becomes
          <b className="text-gold-300"> ojas</b> — the fuel of memory, confidence and calm fire. This is your companion for the turning.
        </p>
      </Card>

      {/* SOS + dashboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="eyebrow">When the wave rises</p>
          <motion.button onClick={startSos}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            animate={{ boxShadow: ['0 0 0px rgba(255,215,0,0.0)', '0 0 34px rgba(255,215,0,0.35)', '0 0 0px rgba(255,215,0,0.0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="grid h-36 w-36 place-items-center rounded-full border border-gold-400/50 bg-gradient-to-b from-gold-400/20 to-transparent">
            <span className="flex flex-col items-center gap-1 font-heading text-white">
              <Shield className="h-7 w-7 text-gold-300" />
              <span className="text-lg leading-tight">Urge<br />SOS</span>
            </span>
          </motion.button>
          <p className="max-w-xs text-xs leading-relaxed text-white/45">
            A 2½-minute guided rescue: breath · upward redirection · mantra · grounding.
            Urges are waves — they crest and pass in minutes when you don’t feed them.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setVoiceOn((v) => !v)}
              className={`rounded-full border px-3 py-1 text-xs transition-all ${voiceOn ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/45'}`}>
              Voice {voiceOn ? 'on' : 'off'}
            </button>
            {voiceOn && (['en', 'hi'] as const).map((l) => (
              <button key={l} onClick={() => setVoiceLang(l)}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${voiceLang === l ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/45'}`}>
                {l === 'en' ? 'English' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </Card>

        {/* streak / ojas */}
        <Card className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Your ascent</span>
            {store.best > 0 && <Badge tone="cyan">Best · {Math.max(store.best, streak)} days</Badge>}
          </div>
          <div className="mt-4 flex items-center gap-6">
            <motion.div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
              animate={{ boxShadow: `0 0 ${18 + glow * 42}px ${4 + glow * 10}px rgba(255,215,0,${0.12 + glow * 0.4})` }}
              style={{ background: `radial-gradient(circle at 38% 34%, rgba(255,247,214,${0.35 + glow * 0.6}), rgba(255,183,43,${0.25 + glow * 0.55}))` }}>
              <div className="text-center">
                <p className="font-display text-4xl leading-none text-white">{streak}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/60">days</p>
              </div>
            </motion.div>
            <div className="min-w-0">
              <p className="text-sm text-white/75">The ojas glow grows with every day the energy is kept and turned upward.</p>
              {next && <p className="mt-2 text-xs text-white/45">Next milestone: <b className="text-gold-300">Day {next.d}</b> · {next.t} ({next.d - streak} to go)</p>}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button size="sm" onClick={sealDay} disabled={sealedToday}>
              <Check className="mr-1.5 h-4 w-4" /> {sealedToday ? 'Today sealed' : `Seal day ${streak}`}
            </Button>
            {!confirmSlip ? (
              <button onClick={() => setConfirmSlip(true)} className="rounded-xl border border-white/12 px-3.5 py-2 text-sm text-white/50 transition-colors hover:text-white/80">
                I slipped
              </button>
            ) : (
              <span className="flex items-center gap-2 text-xs text-white/60">
                No shame — a slip is data, not identity.
                <button onClick={slip} className="rounded-lg border border-rose-400/40 px-2.5 py-1.5 text-rose-200"><RotateCcw className="mr-1 inline h-3 w-3" />Renew the vow</button>
                <button onClick={() => setConfirmSlip(false)} className="text-white/40 hover:text-white/70">cancel</button>
              </span>
            )}
          </div>
          {/* sankalpa */}
          <div className="mt-5">
            <p className="eyebrow mb-1.5">Sankalpa · your vow</p>
            <div className="flex gap-2">
              <input value={vowDraft} onChange={(e) => setVowDraft(e.target.value)} maxLength={140}
                placeholder="e.g. I keep my fire for my dreams — my studies, my body, my future."
                className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-gold-400/50" />
              <Button size="sm" variant="outline" onClick={() => { update({ ...store, vow: vowDraft }); notify('Sankalpa saved.'); }}>Save</Button>
            </div>
            {store.vow && <p className="mt-2 text-sm italic text-gold-200/85">“{store.vow}”</p>}
          </div>
        </Card>
      </div>

      {/* science of transmutation */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <span className="eyebrow">One energy · two directions</span>
          <div className="mt-2"><TransmutationDiagram /></div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-white"><Flame className="h-4 w-4 text-rose-300" /> Why it hooks the mind</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/55">
              Adult content is a <i>supernormal stimulus</i> — endless novelty the brain’s reward circuit was never built for.
              Each hit teaches the mind to crave the next, while dulling the joy of ordinary life: study, sport, friends.
              Understanding the loop is half of breaking it — the craving is chemistry, not character.
            </p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-white"><ArrowUp className="h-4 w-4 text-gold-300" /> What transmutation means</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/55">
              Yoga doesn’t ask you to suppress the force — suppression bursts. It asks you to <b className="text-white/80">use</b> it:
              hard exercise, deep breath, one-pointed study, creation. Tradition says conserved vīrya refines into ojas and tejas —
              the steadiness in the eyes and mind that everyone can sense. The reward circuit rewires the same way it was wired: by repetition.
            </p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-white"><Shield className="h-4 w-4 text-brand-cyan-300" /> Guard the gates</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/55">
              Willpower is a poor gatekeeper at midnight. Move the battle earlier: no phone in the bedroom, screens in shared
              spaces, filters on by default, and a full evening — the urge feeds on boredom, secrecy and fatigue.
            </p>
          </Card>
        </div>
      </div>

      {/* daily sadhana */}
      <Card className="p-6 sm:p-8">
        <span className="eyebrow">Daily sādhana · where the energy goes instead</span>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/tools/pranayama', Icon: Wind, t: 'Morning Pranayama', d: 'Bhastrika + Nadi Shodhana burn the restlessness clean.' },
            { to: '/tools/tratak', Icon: Eye, t: 'Trataka Focus', d: 'One-pointed gazing rebuilds the attention porn scattered.' },
            { to: '/tools/kundalini', Icon: Flame, t: 'Kundalini Journey', d: 'Practise drawing the energy up the spine, chakra by chakra.' },
            { to: '/tools/mantra-timer', Icon: HeartHandshake, t: 'Japa at night', d: 'The danger hour is late night — fill it with mantra instead.' },
          ].map(({ to, Icon, t, d }) => (
            <motion.div key={t} whileHover={{ y: -3 }}>
              <Card hover className="h-full p-4">
                <Link to={to} className="block">
                  <Icon className="h-5 w-5 text-gold-soft" />
                  <p className="mt-2 text-sm font-medium text-white">{t}</p>
                  <p className="mt-1 text-xs leading-snug text-white/50">{d}</p>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/35">Cold showers, hard exercise and a full, social day are the unglamorous half of every transmutation story.</p>
      </Card>

      {/* milestones */}
      <Card className="p-6 sm:p-8">
        <span className="eyebrow">The road of 90 days</span>
        <div className="mt-4 space-y-0">
          {MILESTONES.map((m, i) => {
            const reached = streak >= m.d;
            return (
              <motion.div key={m.d} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="relative flex gap-4 pb-5 last:pb-0">
                {i < MILESTONES.length - 1 && <span className="absolute left-[13px] top-7 h-full w-px bg-white/10" />}
                <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${reached ? 'border-gold-soft/60 bg-gold-bright/15 text-gold-pale' : 'border-white/15 text-white/40'}`}>
                  {m.d}
                </span>
                <div>
                  <p className={`text-sm font-medium ${reached ? 'text-gold-200' : 'text-white/80'}`}>{m.t} {reached && '✓'}</p>
                  <p className="text-xs leading-relaxed text-white/50">{m.s}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <p className="text-xs leading-relaxed text-white/35">
        A gentle truth: if the pull feels compulsive — hours lost, promises to yourself repeatedly broken — that is not weakness,
        it is a pattern that deserves real support. Talking to a counsellor, therapist or a trusted elder alongside this practice
        is strength, not failure. Everything here stays on your device; nothing is uploaded.
      </p>

      {/* ───────── SOS overlay ───────── */}
      <AnimatePresence>
        {sos && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-sound="none"
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden px-6"
            style={{ background: 'radial-gradient(circle at 50% 35%, #101031 0%, #06040f 60%, #000 100%)' }}>

            <button onClick={() => endSos(false)} aria-label="Exit"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>

            {/* step content */}
            <AnimatePresence mode="wait">
              <motion.div key={cur.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                className="pointer-events-none absolute top-[10%] max-w-md text-center">
                <p className="font-heading text-2xl text-white sm:text-3xl">{cur.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{cur.sub}</p>
              </motion.div>
            </AnimatePresence>

            {/* visual: breathing orb or rising light or mantra */}
            <div className="relative grid place-items-center">
              {cur.id === 'mantra' ? (
                <motion.p key="m" animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }} transition={{ duration: 4, repeat: Infinity }}
                  className="font-sacred text-5xl text-gold-300 sm:text-6xl" style={{ textShadow: '0 0 34px rgba(255,215,0,0.5)' }}>
                  ॐ नमः शिवाय
                </motion.p>
              ) : cur.id === 'rise' ? (
                <SerpentAscentLoop className="h-[46vh] w-auto" />
              ) : (
                <>
                  <motion.div className="absolute h-[52vmin] w-[52vmin] rounded-full blur-3xl"
                    animate={breathing ? { scale: [0.55, 1, 0.55] } : { scale: 0.8 }}
                    transition={breathing ? { duration: breathT, times: [0, 0.4, 1], repeat: Infinity, ease: 'easeInOut' } : {}}
                    style={{ background: 'radial-gradient(circle, #39B7F033, transparent 70%)' }} />
                  <motion.div className="h-[30vmin] w-[30vmin] rounded-full"
                    animate={breathing ? { scale: [0.55, 1, 0.55] } : { scale: [0.8, 0.86, 0.8] }}
                    transition={{ duration: breathing ? breathT : 5, times: breathing ? [0, 0.4, 1] : undefined, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: 'radial-gradient(circle at 40% 35%, #ffffffcc, #39B7F0)', boxShadow: '0 0 70px -8px #39B7F0' }} />
                  {cur.id === 'breath' && (
                    <p className="absolute -bottom-9 text-xs tracking-widest text-white/50">in 4 · out 6</p>
                  )}
                </>
              )}
            </div>

            {/* progress */}
            <div className="absolute bottom-7 flex items-center gap-3 font-mono text-xs tracking-widest text-white/50">
              <span>step {Math.min(step + 1, SOS.length)}/{SOS.length}</span>
              <span className="text-white/25">·</span>
              <span>{fmt(totalLeft)}</span>
              <span className="text-white/25">·</span>
              <button onClick={() => endSos(true)} className="pointer-events-auto text-white/40 underline-offset-2 hover:text-white/80 hover:underline">I’m okay now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
