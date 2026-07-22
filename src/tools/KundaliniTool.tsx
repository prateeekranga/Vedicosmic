import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Youtube, Flame, Music2, Mic, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useSound } from '@/contexts/SoundContext';
import KundaliniBreathGuide from '@/tools/KundaliniBreathGuide';
import { RealisticSerpent, NadiChannels, CrownRays } from '@/components/effects/RealisticSerpent';

/* ─────────────────────────────  data  ───────────────────────────── */

interface Chakra { id: string; en: string; sa: string; bija: string; bijaDev: string; color: string; freq: number; element: string; note: string }
const CHAKRAS: Chakra[] = [
  { id: 'muladhara', en: 'Root', sa: 'मूलाधार', bija: 'LAM', bijaDev: 'लं', color: '#EF4444', freq: 396, element: 'Earth', note: 'Grounding · survival · stillness of stone' },
  { id: 'svadhisthana', en: 'Sacral', sa: 'स्वाधिष्ठान', bija: 'VAM', bijaDev: 'वं', color: '#F97316', freq: 417, element: 'Water', note: 'Flow · creativity · the sweetness of life' },
  { id: 'manipura', en: 'Solar Plexus', sa: 'मणिपुर', bija: 'RAM', bijaDev: 'रं', color: '#FACC15', freq: 528, element: 'Fire', note: 'Will · radiance · the city of jewels' },
  { id: 'anahata', en: 'Heart', sa: 'अनाहत', bija: 'YAM', bijaDev: 'यं', color: '#34D399', freq: 639, element: 'Air', note: 'Love · the unstruck sound' },
  { id: 'vishuddha', en: 'Throat', sa: 'विशुद्ध', bija: 'HAM', bijaDev: 'हं', color: '#38BDF8', freq: 741, element: 'Ether', note: 'Truth · purification · clear expression' },
  { id: 'ajna', en: 'Third Eye', sa: 'आज्ञा', bija: 'OM', bijaDev: 'ॐ', color: '#6366F1', freq: 852, element: 'Mind', note: 'Insight · the command centre' },
  { id: 'sahasrara', en: 'Crown', sa: 'सहस्रार', bija: 'AUM', bijaDev: 'ॐ', color: '#A78BFA', freq: 963, element: 'Spirit', note: 'The thousand-petalled lotus · union' },
];

const MUSICS = [
  { id: 'serpent', name: 'Serpent Drone', desc: 'Deep, coiling bass — primal & grounding' },
  { id: 'chakra', name: 'Chakra Tones', desc: 'Pure rising solfeggio tones per centre' },
  { id: 'celestial', name: 'Celestial', desc: 'Airy shimmer — light and expansive' },
] as const;
type MusicId = (typeof MUSICS)[number]['id'];

const PER_CHAKRA = [30, 45, 60, 90];
const VIDEO_ID = 'PaU0aIyWPlE';
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ───────────────────────  local audio engine  ───────────────────── */

interface Eng { ctx: AudioContext; master: GainNode; tone: OscillatorNode; toneHi: OscillatorNode; toneGain: GainNode; nodes: OscillatorNode[] }
function startEngine(style: MusicId, freq0: number): Eng | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.4; lp.connect(master);
    const nodes: OscillatorNode[] = [];

    const addDrone = (f: number, g: number, type: OscillatorType = 'sine') => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      const og = ctx.createGain(); og.gain.value = g; o.connect(og); og.connect(lp); o.start(); nodes.push(o);
    };

    if (style === 'serpent') {
      lp.frequency.value = 320;
      addDrone(65.41, 0.16, 'triangle'); addDrone(98.0, 0.09, 'triangle'); addDrone(32.7, 0.12);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lg = ctx.createGain(); lg.gain.value = 120; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); nodes.push(lfo);
    } else if (style === 'celestial') {
      lp.frequency.value = 2400;
      addDrone(196.0, 0.05); addDrone(293.66, 0.045); addDrone(1568, 0.012);
    } else {
      lp.frequency.value = 1600;
      addDrone(130.81, 0.05);
    }

    // the rising chakra tone (frequency glides per centre)
    const toneGain = ctx.createGain(); toneGain.gain.value = style === 'chakra' ? 0.14 : 0.09; toneGain.connect(lp);
    const tone = ctx.createOscillator(); tone.type = 'sine'; tone.frequency.value = freq0; tone.connect(toneGain); tone.start(); nodes.push(tone);
    const toneHi = ctx.createOscillator(); toneHi.type = 'sine'; toneHi.frequency.value = freq0 * 2;
    const hg = ctx.createGain(); hg.gain.value = style === 'chakra' ? 0.04 : 0.02; toneHi.connect(hg); hg.connect(lp); toneHi.start(); nodes.push(toneHi);

    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 3);
    return { ctx, master, tone, toneHi, toneGain, nodes };
  } catch { return null; }
}
function glideTone(e: Eng, freq: number) {
  const t = e.ctx.currentTime;
  e.tone.frequency.cancelScheduledValues(t); e.toneHi.frequency.cancelScheduledValues(t);
  e.tone.frequency.exponentialRampToValueAtTime(freq, t + 1.4);
  e.toneHi.frequency.exponentialRampToValueAtTime(freq * 2, t + 1.4);
  // gentle swell to mark the new centre
  e.toneGain.gain.cancelScheduledValues(t);
  const base = e.toneGain.gain.value;
  e.toneGain.gain.setValueAtTime(base, t);
  e.toneGain.gain.linearRampToValueAtTime(Math.min(0.2, base + 0.07), t + 0.5);
  e.toneGain.gain.linearRampToValueAtTime(base, t + 2.2);
}
function stopEngine(e: Eng | null) {
  if (!e) return;
  try {
    e.master.gain.linearRampToValueAtTime(0, e.ctx.currentTime + 1.2);
    window.setTimeout(() => { e.nodes.forEach((o) => { try { o.stop(); } catch { /* */ } }); void e.ctx.close(); }, 1400);
  } catch { /* */ }
}
function crownBell(e: Eng | null) {
  if (!e) return;
  const t = e.ctx.currentTime;
  [963, 1926, 2889].forEach((f, i) => {
    const o = e.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const g = e.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(i ? 0.05 : 0.14, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    o.connect(g); g.connect(e.master); o.start(t); o.stop(t + 4.8);
  });
}

/* ─────────────────────────────  tool  ───────────────────────────── */

type Mode = 'video' | 'journey';
type Phase = 'setup' | 'journey' | 'done';

export default function KundaliniTool() {
  const [mode, setMode] = useState<Mode>('journey');
  const [phase, setPhase] = useState<Phase>('setup');
  const [music, setMusic] = useState<MusicId>('serpent');
  const [per, setPer] = useState(45);
  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>('en');
  const [elapsed, setElapsed] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const total = per * CHAKRAS.length;
  const progress = phase === 'journey' ? Math.min(1, elapsed / total) : phase === 'done' ? 1 : 0;
  const active = Math.min(CHAKRAS.length - 1, Math.floor(elapsed / per));
  const chakra = CHAKRAS[active];

  const engRef = useRef<Eng | null>(null);
  const hideTimer = useRef<number | null>(null);
  const { user, recordMantraSession } = useAuth();
  const { notify } = useToast();
  const { beginTratak, endTratak, speak, stopSpeak } = useSound();

  const say = useCallback((c: Chakra) => {
    if (!voiceOn) return;
    const text = voiceLang === 'hi'
      ? `${c.sa}। बीज मंत्र ${c.bijaDev}। ${c.element === 'Earth' ? 'स्थिर होइए।' : 'ऊर्जा को ऊपर उठने दीजिए।'}`
      : `${c.en} chakra. ${c.sa}. Bija mantra, ${c.bija}. Let the energy rise.`;
    speak(text, voiceLang);
  }, [voiceOn, voiceLang, speak]);

  const start = () => {
    beginTratak(false);              // duck the site music
    engRef.current = startEngine(music, CHAKRAS[0].freq);
    setElapsed(0); setPhase('journey');
    document.documentElement.requestFullscreen?.().catch(() => {});
    if (voiceOn) window.setTimeout(() => say(CHAKRAS[0]), 900);
  };
  const exitFs = () => { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); };
  const finish = useCallback(() => {
    stopEngine(engRef.current); engRef.current = null;
    endTratak(); stopSpeak(); exitFs(); setPhase('setup');
  }, [endTratak, stopSpeak]);

  useEffect(() => () => { stopEngine(engRef.current); endTratak(); stopSpeak(); }, [endTratak, stopSpeak]);

  // keep the site music out of the way on this page (video + journey have their own sound)
  useEffect(() => { beginTratak(false); return () => endTratak(); }, [beginTratak, endTratak]);

  // journey clock
  useEffect(() => {
    if (phase !== 'journey') return;
    const id = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= total) {
          window.clearInterval(id);
          crownBell(engRef.current);
          if (voiceOn) window.setTimeout(() => speak(
            voiceLang === 'hi'
              ? 'सहस्रार। हज़ार पंखुड़ियों वाला कमल खिल गया है। इस प्रकाश में विश्राम कीजिए।'
              : 'Sahasrara. The thousand-petalled lotus has opened. Rest in this light.',
            voiceLang), 600);
          setPhase('done');
          if (user) recordMantraSession(Math.round(total / 60));
          return total;
        }
        if (next % per === 0) {
          const idx = Math.min(CHAKRAS.length - 1, Math.floor(next / per));
          if (engRef.current) glideTone(engRef.current, CHAKRAS[idx].freq);
          say(CHAKRAS[idx]);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, per, total, user, recordMantraSession, say, speak, voiceOn, voiceLang]);

  // esc + auto-hide controls
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

  /* ── serpent geometry ── */
  const YS = useMemo(() => CHAKRAS.map((_, i) => 596 - i * 88), []);   // muladhara 596 → sahasrara 68

  /* ─────────────────────────  setup screen  ───────────────────────── */
  if (phase === 'setup') {
    return (
      <div className="space-y-8">
        <Card className="p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-white/65">
            <b className="text-white">Kundalini</b> (कुण्डलिनी) is the dormant serpent-power said to lie coiled three-and-a-half
            times at the base of the spine. Through breath, mantra and meditation she uncoils and rises along the sushumna,
            piercing the seven chakras one by one until she unites with pure consciousness at the crown.
          </p>
        </Card>

        {/* mode tabs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => setMode('journey')}
            className={`rounded-2xl border p-5 text-left transition-all ${mode === 'journey' ? 'border-gold-400/60 bg-gold-400/5' : 'border-white/10 bg-white/4 hover:border-white/25'}`}>
            <p className="flex items-center gap-2 font-heading text-h5 text-white"><Flame className="h-4 w-4 text-gold-300" /> Immersive Journey</p>
            <p className="mt-1 text-xs leading-snug text-white/55">A full-screen animated ascent — the serpent rises through all seven chakras with sound, mantra and light.</p>
          </button>
          <button onClick={() => setMode('video')}
            className={`rounded-2xl border p-5 text-left transition-all ${mode === 'video' ? 'border-gold-400/60 bg-gold-400/5' : 'border-white/10 bg-white/4 hover:border-white/25'}`}>
            <p className="flex items-center gap-2 font-heading text-h5 text-white"><Youtube className="h-4 w-4 text-rose-400" /> Guided Video</p>
            <p className="mt-1 text-xs leading-snug text-white/55">Follow the full guided Kundalini meditation video, right here.</p>
          </button>
        </div>

        {mode === 'video' ? (
          <>
            <Card className="overflow-hidden p-0">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  width="560" height="315"
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?si=OInXmyMd21mnlzN5`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <p className="text-xs text-white/45">
                  Sit comfortably with the spine tall, use headphones, and let the guide lead you. Site music pauses on this page
                  so the video plays clean. (Video streams from YouTube, so it needs an internet connection.)
                </p>
              </div>
            </Card>
            <KundaliniBreathGuide />
          </>
        ) : (
          <Card className="p-6 sm:p-8">
            <p className="eyebrow mb-3">✦ Choose your music</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {MUSICS.map((m) => (
                <button key={m.id} onClick={() => setMusic(m.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${music === m.id ? 'border-gold-400/60 bg-gold-400/5' : 'border-white/10 bg-white/4 hover:border-white/25'}`}>
                  <p className="flex items-center gap-2 text-sm font-medium text-white"><Music2 className="h-4 w-4 text-brand-cyan-300" /> {m.name}</p>
                  <p className="mt-1 text-xs leading-snug text-white/55">{m.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <p className="eyebrow mb-3">✦ Time at each chakra</p>
              <div className="flex flex-wrap gap-2.5">
                {PER_CHAKRA.map((s) => (
                  <button key={s} onClick={() => setPer(s)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-all ${per === s ? 'border-gold-400/60 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/60 hover:text-white'}`}>
                    {s}s · {fmt(s * 7)} total
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setVoiceOn((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${voiceOn ? 'border-gold-400/50 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/50'}`}>
                <Mic className="h-4 w-4" /> Mantra voice {voiceOn ? (voiceLang === 'hi' ? '· हिन्दी' : '· English') : 'off'}
              </button>
              {voiceOn && ([{ id: 'en', label: 'English' }, { id: 'hi', label: 'हिन्दी' }] as const).map((l) => (
                <button key={l.id} onClick={() => setVoiceLang(l.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-all ${voiceLang === l.id ? 'border-gold-400/60 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/60 hover:text-white'}`}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* chakra legend */}
            <div className="mt-6 flex flex-wrap gap-2">
              {CHAKRAS.map((ch) => (
                <span key={ch.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ch.color, boxShadow: `0 0 6px ${ch.color}` }} />
                  {ch.sa} <span className="font-sacred">{ch.bijaDev}</span>
                </span>
              ))}
            </div>

            <Button size="lg" className="mt-8 w-full sm:w-auto" onClick={start}>
              <Play className="mr-2 h-4 w-4" /> Awaken the Serpent · {fmt(total)}
            </Button>
            <p className="mt-3 text-xs text-white/40">Opens a distraction-free full screen. Press Esc anytime to return.</p>
          </Card>
        )}
      </div>
    );
  }

  /* ─────────────────────  immersive journey overlay  ───────────────────── */
  return (
    <div data-sound="none" className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at 50% 30%, #120b2e 0%, #070515 55%, #000 100%)', cursor: showControls ? 'default' : 'none' }}>

      {/* ambient halo of the active chakra */}
      <motion.div aria-hidden className="absolute h-[90vmin] w-[90vmin] rounded-full blur-3xl"
        animate={{ background: `radial-gradient(circle, ${chakra.color}22, transparent 65%)` }} transition={{ duration: 2 }} />

      {/* current chakra info */}
      <AnimatePresence mode="wait">
        <motion.div key={phase === 'done' ? 'crown' : chakra.id}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.6 }}
          className="pointer-events-none absolute top-[7%] z-10 text-center">
          <p className="font-sacred text-4xl sm:text-5xl" style={{ color: chakra.color, textShadow: `0 0 30px ${chakra.color}` }}>
            {chakra.bijaDev}
          </p>
          <p className="mt-1 font-heading text-lg text-white/90">{chakra.sa} · {chakra.en}</p>
          <p className="text-xs tracking-wide text-white/45">{chakra.bija} · {chakra.freq} Hz · {chakra.element}</p>
        </motion.div>
      </AnimatePresence>

      {/* spine + chakras + serpent */}
      <svg viewBox="0 0 260 660" className="relative h-[86vh] max-h-[720px] w-auto" aria-hidden>
        {/* sushumna */}
        <line x1="130" y1="640" x2="130" y2="60" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" strokeDasharray="2 6" />

        {/* iḍā & piṅgalā weaving the central channel */}
        <NadiChannels cx={130} yBase={596} yTop={68} amp={48} />

        {/* the serpent — uncoils from 2½ basal coils and climbs, slithering live */}
        <RealisticSerpent progress={progress} cx={130} yBase={596} yTop={68} amp={38} wMax={9} />

        {/* chakra lotuses */}
        {CHAKRAS.map((ch, i) => {
          const y = YS[i];
          const lit = phase === 'done' || i < active || (i === active && phase === 'journey');
          const isActive = phase === 'journey' && i === active;
          return (
            <g key={ch.id}>
              {/* petals — spin in 3D-ish fashion when active */}
              <motion.g
                style={{ transformOrigin: `130px ${y}px`, transformBox: 'view-box' as never }}
                animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                transition={isActive ? { duration: 14, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}>
                {Array.from({ length: 8 }, (_, p) => {
                  const a = (p / 8) * 2 * Math.PI;
                  return (
                    <ellipse key={p} cx={130 + 24 * Math.cos(a)} cy={y + 24 * Math.sin(a)} rx="7.5" ry="3.6"
                      transform={`rotate(${(a * 180) / Math.PI} ${130 + 24 * Math.cos(a)} ${y + 24 * Math.sin(a)})`}
                      fill={ch.color} opacity={lit ? (isActive ? 0.55 : 0.3) : 0.08} />
                  );
                })}
              </motion.g>
              {/* halo + core */}
              {isActive && (
                <motion.circle cx="130" cy={y} r="30" fill="none" stroke={ch.color} strokeWidth="1"
                  animate={{ r: [26, 40], opacity: [0.5, 0] }} transition={{ duration: 2.4, repeat: Infinity }} />
              )}
              <circle cx="130" cy={y} r="14" fill={lit ? `${ch.color}2e` : 'rgba(255,255,255,0.03)'}
                stroke={ch.color} strokeWidth={isActive ? 2 : 1} opacity={lit ? 1 : 0.35}
                style={{ filter: lit ? `drop-shadow(0 0 ${isActive ? 14 : 6}px ${ch.color})` : 'none', transition: 'all 0.8s' }} />
              <text x="130" y={y + 4} textAnchor="middle" className="font-sacred" fontSize="11"
                fill={lit ? '#fff' : 'rgba(255,255,255,0.3)'}>{ch.bijaDev}</text>
            </g>
          );
        })}

        {/* radiant crown halo — brightens fully at completion */}
        {progress > 0.82 && <CrownRays cx={130} cy={68} r={30} active={phase === 'done'} />}

        {/* crown burst when done */}
        {phase === 'done' && (
          <motion.g style={{ transformOrigin: '130px 68px', transformBox: 'view-box' as never }}
            initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: [0.6, 1.15, 1], opacity: 1 }} transition={{ duration: 1.6 }}>
            {Array.from({ length: 16 }, (_, p) => {
              const a = (p / 16) * 2 * Math.PI;
              return <line key={p} x1={130 + 20 * Math.cos(a)} y1={68 + 20 * Math.sin(a)}
                x2={130 + 44 * Math.cos(a)} y2={68 + 44 * Math.sin(a)} stroke="#A78BFA" strokeWidth="1.4" opacity="0.8" />;
            })}
          </motion.g>
        )}
      </svg>

      {/* controls */}
      <AnimatePresence>
        {phase === 'journey' && showControls && (
          <>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={finish} aria-label="End journey"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:text-white">
              <X className="h-5 w-5" />
            </motion.button>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.65 }} exit={{ opacity: 0 }}
              className="absolute bottom-7 flex items-center gap-3 font-mono text-sm tracking-widest text-white/60">
              <span>{fmt(total - elapsed)}</span>
              <span className="text-white/30">·</span>
              <span style={{ color: chakra.color }}>{active + 1} / 7</span>
            </motion.div>
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
              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.75, 1, 0.75] }} transition={{ duration: 4, repeat: Infinity }}
                className="mx-auto mb-5 h-16 w-16 rounded-full"
                style={{ background: 'radial-gradient(circle, #F5F0FF, #A78BFA)', boxShadow: '0 0 50px -4px #A78BFA' }} />
              <p className="font-sacred text-h4 text-gradient-gold">ॐ शान्तिः शान्तिः</p>
              <h3 className="mt-2 font-heading text-h4 text-white">The lotus has opened</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                The serpent has risen through all seven centres to the thousand-petalled crown.
                Sit quietly for a few breaths and let the energy settle back down the spine like warm light.
              </p>
              {user && <p className="mt-3 text-xs text-white/40">Session added to your practice streak.</p>}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={() => {
                  stopEngine(engRef.current);
                  engRef.current = startEngine(music, CHAKRAS[0].freq);
                  setElapsed(0); setPhase('journey');
                  if (voiceOn) window.setTimeout(() => say(CHAKRAS[0]), 800);
                }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Rise again
                </Button>
                <Button variant="outline" onClick={() => { finish(); notify('May the light stay with you.'); }}>Finish</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
