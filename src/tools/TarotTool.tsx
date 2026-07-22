import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check } from 'lucide-react';
import { TAROT_DECK } from '@/data/tarot';
import { seededRandom, todayKey } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { ShareBar } from '@/components/ShareBar';
import { useShareResult } from '@/contexts/ShareContext';

export default function TarotTool() {
  const [flipped, setFlipped] = useState(false);
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);
  const { user, addJournalEntry } = useAuth();
  const { notify } = useToast();

  const card = useMemo(() => {
    const rnd = seededRandom('vedicosmic-' + todayKey());
    return TAROT_DECK[Math.floor(rnd() * TAROT_DECK.length)];
  }, []);

  useShareResult(flipped ? `My daily contemplation card is ${card.name} (${card.sanskrit}) ✨` : null);

  const alreadyJournaled = user?.journalEntries.some(
    (e) => e.tarotCardId === String(card.id) && e.date.slice(0, 10) === todayKey(),
  ) ?? false;

  const save = () => {
    if (!reflection.trim()) return;
    addJournalEntry({ tarotCardId: String(card.id), content: reflection.trim() });
    setSaved(true);
    notify('Reflection saved to your journal');
  };

  return (
    <div className="space-y-8">
      <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-white/60">
        One card is drawn for you each day — the same card from sunrise to sunrise, a single point of contemplation.
        Sit with its message, then journal what it stirs.
      </p>

      <div className="flex justify-center">
        <div className="relative" style={{ perspective: 1200 }}>
          <motion.div
            className="relative h-[420px] w-[280px] cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-gold-soft/30"
              style={{ backfaceVisibility: 'hidden', background: 'radial-gradient(circle at 50% 50%, rgba(57,183,240,0.12), #121228)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                className="text-7xl text-gold-soft/70">✦</motion.div>
              <p className="mt-6 font-display text-lg text-gold-pale">VediCosmic</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/40">Tap to reveal</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-gold-bright/40 p-6 text-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(160deg, #1E1E40, #121228)' }}>
              <Badge tone="gold">Card {card.id}</Badge>
              <div className="text-5xl text-gold-soft">✶</div>
              <h3 className="font-heading text-h3 text-white">{card.name}</h3>
              <p className="font-sacred text-sm text-brand-cyan-soft">{card.sanskrit}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-5">
            <Card className="p-6 text-center">
              <span className="eyebrow">Today’s message</span>
              <p className="mt-3 text-lg leading-relaxed text-white/80">{card.message}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-3.5">
                <p className="text-sm text-white/60">Share your card</p>
                <ShareBar url={window.location.href} title="Daily Contemplation Card · VediCosmic"
                  text={`My daily contemplation card is ${card.name} (${card.sanskrit}) ✨`} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-brand-cyan" />
                <span className="eyebrow">Contemplation</span></div>
              <p className="mt-2 italic text-gold-pale">{card.prompt}</p>
              {user ? (
                alreadyJournaled && !saved ? (
                  <p className="mt-4 rounded-xl bg-cosmic-light/30 p-4 text-sm text-white/60">
                    You’ve already journaled on this card today. Return tomorrow for a new draw. 🙏
                  </p>
                ) : saved ? (
                  <p className="mt-4 flex items-center gap-2 text-sm text-success"><Check className="h-4 w-4" /> Saved to your journal.</p>
                ) : (
                  <>
                    <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
                      rows={4} placeholder="What does this card stir in you today?"
                      className="mt-4 w-full rounded-xl border border-white/10 bg-cosmic-light/30 p-4 text-sm text-white/90 outline-none transition-colors focus:border-brand-cyan/50" />
                    <Button variant="outline" className="mt-3" onClick={save} disabled={!reflection.trim()}>Save reflection</Button>
                  </>
                )
              ) : (
                <button onClick={() => window.dispatchEvent(new CustomEvent('vc:open-auth'))}
                  className="mt-4 text-sm text-brand-cyan-soft hover:text-brand-cyan">Sign in to keep a tarot journal →</button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
