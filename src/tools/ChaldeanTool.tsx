import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { chaldean } from '@/lib/chaldean';
import { LOSHU_NUMBERS } from '@/data/loshu';
import { NUMBER_COLORS } from '@/data/predictions';
import { Card } from '@/components/ui/Card';

const KIND_LABEL: Record<string, string> = {
  name: 'Name vibration', number: 'Number vibration', mixed: 'Mixed vibration', date: 'Date vibration',
};

export default function ChaldeanTool() {
  const [raw, setRaw] = useState('');
  const result = useMemo(() => chaldean(raw), [raw]);
  const info = result ? LOSHU_NUMBERS[result.root] : null;
  const color = result ? NUMBER_COLORS[result.root] : '#5E7785';

  return (
    <div className="space-y-8">
      {/* Galaxy input */}
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-cosmic-darker/60 p-5 backdrop-blur-md sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative">
          <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-brand-cyan-300">Name or number or DOB</label>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-cosmic-dark/70 px-4 py-3">
            <input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="e.g. Parteek · 9876543210 · 15-08-1996"
              className="w-full bg-transparent font-heading text-2xl text-white outline-none placeholder:text-white/25"
              autoFocus
            />
            {raw && (
              <button onClick={() => setRaw('')} aria-label="Clear" className="text-white/40 transition-colors hover:text-white">
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          {result && <p className="mt-2 text-right text-sm text-white/40">{result.count} characters</p>}
        </div>
      </div>

      {result && info ? (
        <Card className="relative overflow-hidden p-6 sm:p-10">
          <motion.div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl"
            animate={{ backgroundColor: color }} transition={{ duration: 0.5 }} style={{ opacity: 0.18 }} />

          {/* the two-circle emblem — colour transitions live as you type */}
          <div className="relative flex items-center justify-center py-4">
            <motion.div
              animate={{ backgroundColor: color, boxShadow: `0 0 60px -8px ${color}` }}
              transition={{ duration: 0.5 }}
              className="relative grid h-40 w-40 place-items-center rounded-full sm:h-52 sm:w-52"
            >
              <AnimatePresence mode="popLayout">
                <motion.span key={result.root}
                  initial={{ opacity: 0, scale: 0.4, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.4, y: -10 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="font-display text-6xl font-bold text-white drop-shadow sm:text-7xl">
                  {result.root}
                </motion.span>
              </AnimatePresence>
            </motion.div>
            <div className="relative -ml-6 grid h-24 w-24 place-items-center rounded-full sm:-ml-8 sm:h-28 sm:w-28"
              style={{ background: '#1F8A50', boxShadow: '0 0 40px -10px #1F8A50' }}>
              <AnimatePresence mode="popLayout">
                <motion.span key={result.compound}
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                  className="font-heading text-xl font-semibold text-white sm:text-2xl">
                  Σ-{result.compound}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-2 text-center font-heading text-h4 text-gradient-gold">Chaldean Numerology</p>

          <div className="mx-auto mt-6 max-w-xl text-center">
            <p className="text-lg font-medium text-white">
              {KIND_LABEL[result.kind]} · ruled by {info.planet} <span className="text-white/40">({info.sanskrit})</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{info.trait}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-gold-400/5 px-3 py-1 text-xs text-gold-300">
              <Sparkles className="h-3.5 w-3.5" /> {info.keyword}
            </p>
          </div>

          {/* per-character breakdown — each glyph shows its Chaldean value */}
          <div className="mt-7 flex flex-wrap justify-center gap-1.5">
            {result.breakdown.map((b, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="inline-flex min-w-[2.4rem] flex-col items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                <span className="font-mono text-sm text-white">{b.ch}</span>
                <span className="text-[0.65rem]" style={{ color }}>{b.val}</span>
              </motion.span>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-white/40">
            {result.breakdown.map((b) => b.val).join(' + ')} = {result.compound} → {result.root}
          </p>
        </Card>
      ) : (
        <p className="py-10 text-center text-sm text-white/40">
          Start typing a name, phone number, or date — its Chaldean total appears instantly, and the colour shifts with every number.
        </p>
      )}
    </div>
  );
}
