import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TOOL_CATEGORIES } from '@/data/tools';
import { visibleTools } from '@/lib/overrides';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';

const ACCENT_BG: Record<string, string> = {
  gold: 'bg-gold-bright/10 text-gold-soft',
  cyan: 'bg-brand-cyan/10 text-brand-cyan-soft',
  violet: 'bg-violet-chakra/10 text-violet-chakra',
  teal: 'bg-teal-cosmic/15 text-teal-cosmic',
};

export default function Tools() {
  const [cat, setCat] = useState<string>('all');
  const ov = useOverridesVersion();
  useSEO({
    key: '/tools', path: '/tools', title: 'Interactive Tools · VediCosmic',
    description: 'Free Vedic numerology, astrology, and energy tools — real calculations, running entirely in your browser.',
  });
  const allTools = visibleTools();
  const filtered = useMemo(
    () => cat === 'all' ? allTools : allTools.filter((t) => t.category === cat),
    [cat, ov],
  );

  return (
    <div className="container-vc py-16 sm:py-24">
      <SectionHeading eyebrow="Interactive Tools"
        title={<>{allTools.length} ways to read <span className="text-gradient-gold">your cosmos</span></>}
        subtitle="Every tool runs entirely in your browser with real calculations. Free to use — sign in to save what resonates." />

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {TOOL_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`relative rounded-full border px-5 py-2 text-sm transition-all ${
              cat === c.id ? 'border-gold-soft/60 text-gold-pale' : 'border-white/10 text-white/60 hover:border-white/30'
            }`}>
            {cat === c.id && (
              <motion.span layoutId="tool-cat" className="absolute inset-0 -z-10 rounded-full bg-gold-bright/10" />
            )}
            {c.label}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((t, i) => (
            <motion.div key={t.id} layout
              initial={{ opacity: 0, scale: 0.95, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.05, 0.4) }}>
              <Link to={`/tools/${t.slug}`}>
                <Card hover className="group h-full p-7">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${ACCENT_BG[t.accent]}`}>
                      <t.Icon className="h-6 w-6" />
                    </span>
                    {t.isNew && <Badge tone="cyan">New</Badge>}
                  </div>
                  <h3 className="mt-5 font-heading text-h3 text-white group-hover:text-gold-pale">{t.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-white/40">{t.subtitle}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{t.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-cyan-soft">
                    Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
