import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, Flame, Flower2, Wind, Bookmark, Check, Sparkles } from 'lucide-react';
import { DEITIES, type Deity } from '@/data/deities';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sound } from '@/lib/sound';
import { Ambient } from '@/lib/ambient';
import { useSound } from '@/contexts/SoundContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function PujaTool() {
  const [selected, setSelected] = useState<Deity | null>(null);

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <ShrineView deity={selected} onBack={() => setSelected(null)} />
          </motion.div>
        ) : (
          <motion.div key="gallery" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <DeityGallery onSelect={setSelected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeityGallery({ onSelect }: { onSelect: (d: Deity) => void }) {
  return (
    <>
      <Card className="p-6 sm:p-8">
        <p className="text-sm leading-relaxed text-white/60">
          Choose a deity to begin — ring the temple bell, offer flowers, blow the conch, or perform a full
          Aarti with a live circling flame, a rhythmic ghanti and the deity's traditional invocation.
        </p>
      </Card>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DEITIES.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 20, scale: 0.94 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 160, damping: 18 }}>
            <button onClick={() => onSelect(d)} data-sound="tone" className="block w-full text-left">
              <Card hover className="group h-full p-6 text-center">
                <div className="relative mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full"
                  style={{ background: `radial-gradient(circle, ${d.glow}, transparent 72%)` }}>
                  <span className="font-sacred text-4xl" style={{ color: d.color }}>{d.bija}</span>
                </div>
                <h3 className="font-heading text-h4 text-white group-hover:text-gold-pale">{d.name}</h3>
                <p className="text-xs text-white/40">{d.sanskrit}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/55">{d.epithet}</p>
              </Card>
            </button>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function IncenseWisps({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute bottom-16 left-[22%] h-28 w-10 -translate-x-1/2">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="absolute bottom-0 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-white/10 blur-md"
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.35, 0], y: -90, x: [0, 8, -6, 0], scale: [0.5, 1.3, 1.8] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: i * 1.5, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

function Diya({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 40" className="h-10 w-16">
      <ellipse cx="30" cy="30" rx="26" ry="8" fill="#8a5a2b" opacity={0.9} />
      <path d="M6 28 Q30 42 54 28 Q54 34 30 38 Q6 34 6 28 Z" fill="#5c3a1a" />
      <motion.g style={{ transformOrigin: '30px 20px' }}
        animate={{ rotate: [-2, 2, -1, 1.5, -2], scaleY: [1, 1.08, 0.95, 1.05, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M30 4 C 36 12 34 20 30 22 C 26 20 24 12 30 4 Z" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        <path d="M30 10 C 33 15 32 19 30 20 C 28 19 27 15 30 10 Z" fill="#FFF3C4" />
      </motion.g>
    </svg>
  );
}

function ShrineView({ deity, onBack }: { deity: Deity; onBack: () => void }) {
  const reduced = usePrefersReducedMotion();
  const { enabled: soundEnabled } = useSound();
  const { user, saveReading } = useAuth();
  const { notify } = useToast();

  const [petalBurst, setPetalBurst] = useState(0);
  const [bellSwing, setBellSwing] = useState(0);
  const [conchPulse, setConchPulse] = useState(0);
  const [aartiActive, setAartiActive] = useState(false);
  const [circles, setCircles] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  const circleTimer = useRef<ReturnType<typeof setInterval>>();
  const elapsedTimer = useRef<ReturnType<typeof setInterval>>();
  const CIRCLE_SECONDS = 3;

  useEffect(() => () => {
    clearInterval(circleTimer.current);
    clearInterval(elapsedTimer.current);
    if (aartiActive) Ambient.endAarti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ringBell() {
    if (soundEnabled) Sound.play('chime');
    setBellSwing((n) => n + 1);
    if (navigator.vibrate) navigator.vibrate(10);
  }
  function offerFlowers() {
    if (soundEnabled) Sound.play('petals');
    setPetalBurst((n) => n + 1);
  }
  function blowConch() {
    if (soundEnabled) Sound.play('conch');
    setConchPulse((n) => n + 1);
  }

  function beginAarti() {
    setAartiActive(true);
    setCircles(0);
    setElapsed(0);
    setJustSaved(false);
    if (soundEnabled) Ambient.beginAarti(deity.id);
    circleTimer.current = setInterval(() => setCircles((c) => c + 1), CIRCLE_SECONDS * 1000);
    elapsedTimer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }
  function concludeAarti() {
    setAartiActive(false);
    clearInterval(circleTimer.current);
    clearInterval(elapsedTimer.current);
    if (soundEnabled) Ambient.endAarti();
  }

  function save() {
    saveReading({
      toolId: 'puja-aarti',
      toolName: 'Puja & Aarti',
      summary: `Aarti for ${deity.name} — ${circles} circle${circles === 1 ? '' : 's'}, ${Math.round(elapsed / 60) || 1} min`,
    });
    setJustSaved(true);
    notify(`Aarti for ${deity.name} logged to your journal 🙏`);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <button onClick={onBack} data-sound="tone"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Choose a different deity
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* the shrine */}
        <Card className="relative flex flex-col items-center overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(circle at 50% 38%, ${deity.glow}, transparent 65%)` }} />

          <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
            {/* slow halo ring */}
            {!reduced && (
              <motion.div className="absolute inset-0 rounded-full border border-dashed"
                style={{ borderColor: `${deity.color}40` }}
                animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }} />
            )}

            {/* conch ripple */}
            <AnimatePresence>
              {conchPulse > 0 && (
                <motion.div key={conchPulse} className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: deity.color }}
                  initial={{ opacity: 0.6, scale: 0.6 }} animate={{ opacity: 0, scale: 1.5 }} exit={{ opacity: 0 }}
                  transition={{ duration: 2.6, ease: 'easeOut' }} />
              )}
            </AnimatePresence>

            {/* deity bija symbol */}
            <motion.div
              animate={reduced ? undefined : { scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="font-sacred text-8xl sm:text-9xl"
              style={{ color: deity.color, filter: `drop-shadow(0 0 30px ${deity.glow})` }}
            >
              {deity.bija}
            </motion.div>

            {/* orbiting aarti flame */}
            {aartiActive && (
              <motion.div className="absolute inset-0" style={{ transformOrigin: '50% 50%' }}
                animate={reduced ? undefined : { rotate: 360 }}
                transition={{ duration: CIRCLE_SECONDS, repeat: Infinity, ease: 'linear' }}>
                <div className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%, -160%)' }}>
                  <Flame className="h-7 w-7 text-gold-bright" style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }} />
                </div>
              </motion.div>
            )}

            <IncenseWisps reduced={reduced} />

            {/* petal shower */}
            {!reduced && petalBurst > 0 && (
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.span key={`${petalBurst}-${i}`}
                    className="absolute left-1/2 top-0 block h-2.5 w-2 rounded-full"
                    style={{ background: i % 2 ? '#F3D34A' : '#F4A8C2' }}
                    initial={{ opacity: 0, x: 0, y: -10, rotate: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], x: (i - 5) * 22, y: 220, rotate: 180 + i * 20 }}
                    transition={{ duration: 1.8, delay: i * 0.04, ease: 'easeIn' }} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-2"><Diya color={deity.color} /></div>

          {/* aarti verse — shown while performing aarti */}
          <AnimatePresence>
            {aartiActive && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 max-w-md text-center">
                <p className="font-sacred text-lg leading-relaxed text-gold-pale">{deity.aarti.devanagari}</p>
                <p className="mt-1 text-xs italic text-white/50">{deity.aarti.transliteration}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ritual actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <motion.button onClick={ringBell} data-sound="none"
              animate={bellSwing > 0 && !reduced ? { rotate: [0, -18, 14, -8, 0] } : undefined}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 px-4 py-3 text-white/70 transition-colors hover:border-gold-soft/40 hover:text-gold-pale">
              <Bell className="h-5 w-5" /><span className="text-xs">Ring Bell</span>
            </motion.button>
            <button onClick={offerFlowers} data-sound="none"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 px-4 py-3 text-white/70 transition-colors hover:border-gold-soft/40 hover:text-gold-pale">
              <Flower2 className="h-5 w-5" /><span className="text-xs">Offer Flowers</span>
            </button>
            <button onClick={blowConch} data-sound="none"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 px-4 py-3 text-white/70 transition-colors hover:border-gold-soft/40 hover:text-gold-pale">
              <Wind className="h-5 w-5" /><span className="text-xs">Blow Conch</span>
            </button>
            {!aartiActive ? (
              <Button onClick={beginAarti} data-sound="none">
                <Flame className="h-4 w-4" /> Begin Aarti
              </Button>
            ) : (
              <Button variant="outline" onClick={concludeAarti} data-sound="none">
                Conclude Aarti
              </Button>
            )}
          </div>

          {(aartiActive || circles > 0) && (
            <div className="mt-5 flex items-center gap-4 text-sm text-white/50">
              <span>{circles} circle{circles === 1 ? '' : 's'}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{fmt(elapsed)}</span>
              {!aartiActive && circles > 0 && (
                user ? (
                  <Button variant="ghost" size="sm" onClick={save} disabled={justSaved}>
                    {justSaved ? <><Check className="h-3.5 w-3.5" /> Logged</> : <><Bookmark className="h-3.5 w-3.5" /> Save to journal</>}
                  </Button>
                ) : (
                  <button onClick={() => window.dispatchEvent(new CustomEvent('vc:open-auth'))}
                    className="text-xs text-white/40 underline decoration-dotted hover:text-gold-300">
                    Sign in to save
                  </button>
                )
              )}
            </div>
          )}
        </Card>

        {/* deity info */}
        <div className="space-y-5">
          <Card className="p-6">
            <span className="eyebrow"><Sparkles className="h-3 w-3" /> {deity.name}</span>
            <h3 className="mt-2 font-heading text-h4 text-white">{deity.sanskrit}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{deity.epithet}</p>
          </Card>
          <Card className="p-6">
            <span className="eyebrow">Mantra</span>
            <p className="mt-3 font-sacred text-xl leading-relaxed text-gold-pale">{deity.mantra.devanagari}</p>
            <p className="mt-2 text-sm italic text-white/70">{deity.mantra.transliteration}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{deity.mantra.meaning}</p>
          </Card>
          <Card className="p-6">
            <span className="eyebrow">Aarti — opening verse</span>
            <p className="mt-3 font-sacred text-lg leading-relaxed text-gold-pale">{deity.aarti.devanagari}</p>
            <p className="mt-2 text-sm italic text-white/70">{deity.aarti.transliteration}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{deity.aarti.translation}</p>
          </Card>
          <p className="flex items-center gap-1.5 text-xs text-white/35">
            <Badge tone="neutral" className="shrink-0">Note</Badge>
            Offered in a spirit of reflection and respect — a devotional practice, not a substitute for guidance
            from your own tradition or teacher.
          </p>
        </div>
      </div>
    </div>
  );
}
