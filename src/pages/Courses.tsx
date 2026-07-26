import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Users, Clock, Check } from 'lucide-react';
import { visibleCourses, getFeatureFlags } from '@/lib/overrides';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Select } from '@/components/ui/Field';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { formatINR } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

export default function Courses() {
  const [level, setLevel] = useState<string>('All');
  const [sort, setSort] = useState<string>('popular');
  const { isEnrolled } = useAuth();
  const ov = useOverridesVersion();
  useSEO({
    key: '/courses', path: '/courses', title: 'Courses · VediCosmic',
    description: 'Structured courses in Vedic astrology, numerology, meditation, and sacred geometry — taught by experienced practitioners.',
  });

  const comingSoon = getFeatureFlags().coursesComingSoon;

  const list = useMemo(() => {
    const all = visibleCourses();
    let l = level === 'All' ? all : all.filter((c) => c.level === level);
    if (sort === 'popular') l.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    else if (sort === 'rating') l.sort((a, b) => b.rating - a.rating);
    else if (sort === 'price-low') l.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') l.sort((a, b) => b.price - a.price);
    return l;
  }, [level, sort, ov]);

  return (
    <div className="container-vc py-16 sm:py-24">
      <SectionHeading eyebrow="Courses"
        title={<>Learn to read the <span className="text-gradient-gold">cosmos</span> yourself</>}
        subtitle="Structured paths taught by experienced practitioners — from your first birth chart to advanced sadhana." />

      {comingSoon ? (
        <div className="mt-12">
          <ComingSoon title="Courses are on their way"
            blurb="We're building structured, practitioner-led paths in Vedic astrology, numerology, meditation, and sacred geometry. Check back soon." />
        </div>
      ) : (
      <>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`rounded-full border px-5 py-2 text-sm transition-all ${
                level === l ? 'border-gold-soft/60 bg-gold-bright/10 text-gold-pale' : 'border-white/10 text-white/60 hover:border-white/30'
              }`}>{l}</button>
          ))}
        </div>
        <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="max-w-[200px]">
          <option value="popular">Most popular</option>
          <option value="rating">Highest rated</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </Select>
      </div>

      <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((c, i) => {
            const enrolled = isEnrolled(c.id);
            return (
              <motion.div key={c.id} layout
                initial={{ opacity: 0, scale: 0.95, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.05, 0.4) }}>
                <Link to={`/courses/${c.slug}`}>
                  <Card hover className="group h-full overflow-hidden p-0">
                    <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${c.gradient}`}>
                      <span className="text-6xl opacity-80">{c.glyph}</span>
                      <span className="absolute right-3 top-3"><Badge tone="gold">{formatINR(c.price)}</Badge></span>
                      {enrolled && <span className="absolute left-3 top-3"><Badge tone="success"><Check className="h-3 w-3" /> Enrolled</Badge></span>}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2">
                        <Badge>{c.level}</Badge>
                        <span className="ml-auto flex items-center gap-1 text-sm text-gold-soft"><Star className="h-3.5 w-3.5 fill-current" /> {c.rating}</span>
                      </div>
                      <h3 className="mt-3 font-heading text-h3 text-white group-hover:text-gold-pale">{c.title}</h3>
                      <p className="mt-2 text-sm text-white/55">{c.subtitle}</p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.enrollmentCount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      </>
      )}
    </div>
  );
}
