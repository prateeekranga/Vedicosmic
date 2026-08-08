import { useDeferredValue, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { TOOL_CATEGORIES, TOOL_ACCENT_BG } from '@/data/tools';
import { visibleTools, isToolComingSoon } from '@/lib/overrides';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function Tools() {
  const [cat, setCat] = useState<string>('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const ov = useOverridesVersion();
  useSEO({
    key: '/tools', path: '/tools', title: 'Interactive Tools · VediCosmic',
    description: 'Free Vedic numerology, astrology, and energy tools — real calculations, running entirely in your browser.',
  });
  const allTools = visibleTools();
  const byCategory = useMemo(
    () => cat === 'all' ? allTools : allTools.filter((t) => t.category === cat),
    [cat, ov], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const filtered = useMemo(() => {
    const terms = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return byCategory;
    return byCategory.filter((t) => {
      const haystack = [t.name, t.subtitle, t.description].join(' ').toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [byCategory, deferredQuery]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of allTools) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
    return counts;
  }, [allTools]);

  return (
    <div className="container-vc py-16 sm:py-24">
      <SectionHeading eyebrow="Interactive Tools"
        title={<>{allTools.length} ways to read <span className="text-gradient-gold">your cosmos</span></>}
        subtitle="Every tool runs entirely in your browser with real calculations. Free to use — sign in to save what resonates." />

      <div className="mx-auto mt-10 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
            className="w-full rounded-full border border-white/12 bg-cosmic-darker/60 py-3 pl-11 pr-11 text-white placeholder-white/30 transition-colors focus:border-brand-cyan focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {TOOL_CATEGORIES.map((c) => {
          const count = c.id === 'all' ? allTools.length : categoryCounts.get(c.id) ?? 0;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`relative inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm transition-all ${
                cat === c.id ? 'border-gold-soft/60 text-gold-pale' : 'border-white/10 text-white/60 hover:border-white/30'
              }`}>
              {cat === c.id && (
                <motion.span layoutId="tool-cat" className="absolute inset-0 -z-10 rounded-full bg-gold-bright/10" />
              )}
              {c.label}
              <span className={`text-xs ${cat === c.id ? 'text-gold-soft/70' : 'text-white/35'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, i) => (
              <motion.div key={t.id} layout
                initial={{ opacity: 0, scale: 0.95, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.05, 0.4) }}>
                <Link to={`/tools/${t.slug}`}>
                  <Card hover accent={t.accent} className="group h-full p-7">
                    <div className="flex items-center justify-between">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${TOOL_ACCENT_BG[t.accent]}`}>
                        <t.Icon className="h-6 w-6" />
                      </span>
                      {isToolComingSoon(t.id) ? <Badge tone="neutral">Coming Soon</Badge> : t.isNew && <Badge tone="cyan">New</Badge>}
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
      ) : (
        <div className="mt-16 text-center">
          <p className="text-white/50">No tools match “{query}”.</p>
          <button onClick={() => { setQuery(''); setCat('all'); }} className="mt-4 text-sm text-brand-cyan-soft hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
