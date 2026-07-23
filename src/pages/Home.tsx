import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronDown, Star, Hash, Telescope, Flower2 } from 'lucide-react';
import { SriYantra } from '@/components/effects/SriYantra';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Accordion } from '@/components/ui/Accordion';
import { StardustText } from '@/components/motion/StardustText';
import { SparkleUnderline } from '@/components/motion/SparkleUnderline';
import { TOOLS } from '@/data/tools';
import { COURSES } from '@/data/courses';
import { formatINR } from '@/lib/format';
import { mergedHomeContent } from '@/lib/siteContent';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import { faqPageSchema } from '@/lib/schema';
import { SITE_DESCRIPTION } from '@/config/site';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

// LCP FIX: hero words start at opacity:1 (visible immediately for LCP measurement).
// Animation is purely a position/transform settle — never invisible.
const wordUp = {
  hidden: { opacity: 1, y: 28, rotateX: -15 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 140, damping: 16, mass: 0.8 } },
};

const cardFlyIn = (i: number) => ({
  hidden: { opacity: 0, y: 50, scale: 0.86, rotate: i % 2 === 0 ? -3 : 3 },
  show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 110, damping: 16, mass: 0.8 } },
});

const PILLARS = [
  { glyph: '✶', title: 'Ancient wisdom', text: 'Rooted in Jyotish, numerology, and the yogic sciences — presented with respect and clarity.' },
  { glyph: '◈', title: 'Interactive tools', text: 'Real, deterministic tools that calculate and visualise — not vague guesswork.' },
  { glyph: '☾', title: 'Modern clarity', text: 'Beautiful, honest design that treats you as a thoughtful seeker, never a mark.' },
];

const STEPS = [
  { n: '01', title: 'Choose a path', text: 'Pick from numerology, astrology, or energy & meditation tools.' },
  { n: '02', title: 'Enter your details', text: 'Your name, birth date, or a number — computed privately in your browser.' },
  { n: '03', title: 'See your blueprint', text: 'Animated numbers, charts, and a clear, honest reading appear instantly.' },
  { n: '04', title: 'Go deeper', text: 'Enroll in a course and learn to read the cosmos for yourself.' },
];

const PATHS = [
  { Icon: Hash, title: 'Numerology', text: 'Life Path, Lo Shu, Chaldean & your full blueprint.', tone: 'gold' as const },
  { Icon: Telescope, title: 'Astrology', text: 'Birth chart, planetary hours & the Navagraha mandala.', tone: 'cyan' as const },
  { Icon: Flower2, title: 'Energy & Meditation', text: 'Chakras, mantra japa, Trataka gaze & crystal guidance.', tone: 'violet' as const },
];

function CountUp({ to, dur = 1600, suffix = '' }: { to: number; dur?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0; let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started) {
          started = true; const t0 = performance.now();
          const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
          raf = requestAnimationFrame(tick); io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, dur]);
  return <span ref={ref}>{v.toLocaleString('en-IN')}{suffix}</span>;
}

export default function Home() {
  useOverridesVersion();
  const content = mergedHomeContent();
  const heroWords1 = content.heroLine1.split(' ');
  const heroWords2 = content.heroLine2.split(' ');
  useSEO({
    key: '/', path: '/', title: 'VediCosmic — The Inner Journey', description: SITE_DESCRIPTION,
    jsonLd: faqPageSchema(content.faqs),
  });
  const featuredTools = TOOLS.filter((t) => t.isNew).slice(0, 3);
  const featuredCourses = COURSES.filter((c) => c.isFeatured).slice(0, 3);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroFade = useTransform(heroProgress, [0, 0.9], [1, 0]);

  return (
    <div>
      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroFade }}
        className="relative flex min-h-[92vh] items-center justify-center overflow-hidden"
      >
        {/* one calm glow, fixed in place and sized to fade out well inside the section —
            no drift, so it can never end up sitting on top of a button or clipping at an edge */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
          style={{ background: 'radial-gradient(circle, rgba(230,184,74,0.35), rgba(57,183,240,0.08) 60%, transparent 75%)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* vignette scrim — keeps the headline crisp regardless of what sits behind it */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(5,5,16,0.6) 0%, transparent 70%)' }}
        />

        <motion.div variants={stagger} initial="hidden" animate="show"
          className="container-vc relative z-10 flex flex-col items-center text-center">
          <motion.div variants={fadeUp}>
            <Badge tone="cyan"><Sparkles className="h-3 w-3" /> {content.heroBadge}</Badge>
          </motion.div>
          <motion.h1
            variants={stagger}
            style={{ perspective: 1200 }}
            className="mt-6 max-w-4xl font-display text-hero leading-[1.05] text-white"
          >
            <span className="block" style={{ transformStyle: 'preserve-3d' }}>
              {heroWords1.map((w, i) => (
                <motion.span key={w + i} variants={wordUp} className="mr-[0.28em] inline-block">{w}</motion.span>
              ))}
            </span>
            <span className="block" style={{ transformStyle: 'preserve-3d' }}>
              <motion.span variants={wordUp} className="mr-[0.28em] inline-block">
                <StardustText text={content.heroHighlight} trigger="mount" delay={900} className="text-gradient-gold" />
              </motion.span>
              {heroWords2.map((w, i) => (
                <motion.span key={w + i} variants={wordUp} className="mr-[0.28em] inline-block">{w}</motion.span>
              ))}
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-body leading-relaxed text-white/65">
            {content.heroSubtitle}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button to="/tools" size="lg">Explore Tools <ArrowRight className="h-4 w-4" /></Button>
            <Button to="/courses" variant="outline" size="lg">View Courses</Button>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6 text-sm text-white/45">
            <span>{TOOLS.length} free tools</span><span className="h-1 w-1 rounded-full bg-white/30" />
            <span>{COURSES.length} courses</span><span className="h-1 w-1 rounded-full bg-white/30" />
            <span>60,000+ seekers</span>
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.section>

      {/* PILLARS */}
      <section className="container-vc py-20 sm:py-28">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          style={{ perspective: 1000 }}
          className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div key={p.title} variants={cardFlyIn(i)}>
              <Card className="h-full p-7">
                <div className="mb-4 text-4xl text-gold-soft">{p.glyph}</div>
                <h3 className="font-heading text-h3 text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{p.text}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* STATS BAND */}
      <section className="border-y border-white/8 bg-cosmic-light/20 py-14">
        <div className="container-vc grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { to: TOOLS.length, suffix: '', label: 'Interactive tools' },
            { to: COURSES.length, suffix: '', label: 'Guided courses' },
            { to: 60000, suffix: '+', label: 'Seekers worldwide' },
            { to: 432, suffix: ' Hz', label: 'Cosmic tuning' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="font-display text-h1 text-gradient-gold"><CountUp to={s.to} suffix={s.suffix} /></p>
              <p className="mt-1 text-sm text-white/50">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED TOOLS */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="Interactive Tools" title="Calculators for the curious soul"
          subtitle="Real, deterministic tools that compute and visualise — explore the ones the community loves most." glow />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((t) => (
            <motion.div key={t.id} variants={fadeUp}>
              <Link to={`/tools/${t.slug}`}>
                <Card hover className="group h-full p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-bright/10 text-gold-soft">
                      <t.Icon className="h-6 w-6" />
                    </span>
                    {t.isNew && <Badge tone="cyan">New</Badge>}
                  </div>
                  <h3 className="mt-5 font-heading text-h3 text-white group-hover:text-gold-pale">{t.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-cyan-soft">
                    Open tool <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 text-center">
          <Button to="/tools" variant="ghost">See all {TOOLS.length} tools <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="How it works" title="From curiosity to clarity in four steps"
          subtitle="No jargon, no pressure — just a calm, guided path inward." />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <motion.div key={s.n} variants={fadeUp}>
              <Card className="h-full p-7">
                <span className="font-display text-5xl text-gold-soft/30">{s.n}</span>
                <h3 className="mt-3 font-heading text-h4 text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.text}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* EXPLORE BY PATH */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="Explore by path" title="Find the practice that calls you"
          subtitle="Three doorways into the same inner cosmos — wander whichever feels right today." glow />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          style={{ perspective: 1000 }}
          className="mt-12 grid gap-6 md:grid-cols-3">
          {PATHS.map((p, i) => (
            <motion.div key={p.title} variants={cardFlyIn(i)}>
              <Link to="/tools">
                <Card hover className="group h-full p-8 text-center">
                  <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-gold-soft">
                    <p.Icon className="h-8 w-8" />
                  </span>
                  <h3 className="font-heading text-h3 text-white group-hover:text-gold-pale">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{p.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-cyan-soft">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURED COURSES */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="Learn the Craft" title="Courses to deepen your practice"
          subtitle="Go beyond the tools. Study with experienced teachers and learn to read the cosmos yourself." />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((c) => (
            <motion.div key={c.id} variants={fadeUp}>
              <Link to={`/courses/${c.slug}`}>
                <Card hover className="group h-full overflow-hidden p-0">
                  <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${c.gradient}`}>
                    <span className="text-6xl opacity-80">{c.glyph}</span>
                    <span className="absolute right-3 top-3"><Badge tone="gold">{formatINR(c.price)}</Badge></span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Badge>{c.level}</Badge>
                      <span className="ml-auto flex items-center gap-1 text-gold-soft"><Star className="h-3 w-3 fill-current" /> {c.rating}</span>
                    </div>
                    <h3 className="mt-3 font-heading text-h3 text-white group-hover:text-gold-pale">{c.title}</h3>
                    <p className="mt-2 text-sm text-white/55">{c.subtitle}</p>
                    <p className="mt-4 text-xs text-white/40">{c.lessonCount} lessons · {c.duration} · {c.enrollmentCount.toLocaleString('en-IN')} enrolled</p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 text-center">
          <Button to="/courses" variant="ghost">Browse all courses <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="Seekers" title="Loved by a curious community"
          subtitle="Thoughtful people, exploring honestly. Here's what a few of them say." />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-6 md:grid-cols-3">
          {content.testimonials.map((t) => (
            <motion.div key={t.id} variants={fadeUp}>
              <Card className="h-full p-7">
                <div className="mb-3 flex gap-0.5 text-gold-soft">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed text-white/70">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-sheen text-sm font-bold text-cosmic-darker">{t.initials}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-white/45">{t.place}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SACRED VERSE BAND */}
      <section className="relative overflow-hidden border-y border-white/8 py-20 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]">
          <SriYantra className="h-full w-full" stroke="#E6B84A" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ type: 'spring', stiffness: 90, damping: 16, mass: 1 }}
          className="container-vc relative z-10 text-center"
        >
          <p className="font-sacred text-4xl leading-snug text-gold-pale sm:text-5xl">योगः कर्मसु कौशलम्</p>
          <SparkleUnderline className="mt-6" width={110} />
          <p className="mx-auto mt-6 max-w-xl font-heading text-h4 text-white">"Yoga is skill in action."</p>
          <p className="mt-2 text-sm text-white/45">— Bhagavad Gita 2.50</p>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="Questions" title="Everything you might be wondering"
          subtitle="Straight answers — honesty is the whole point." />
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion items={content.faqs} defaultOpen="f1" />
        </div>
      </section>

      {/* CTA */}
      <section className="container-vc py-20 sm:py-28">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass relative overflow-hidden rounded-3xl p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-20">
            <SriYantra className="absolute -right-20 -top-20 h-80 w-80" stroke="#39B7F0" />
          </div>
          <h2 className="font-display text-h1 text-white">Your journey inward<br />starts with a single number.</h2>
          <p className="mx-auto mt-5 max-w-xl text-body text-white/60">
            Begin free — no payment, no pressure. Create an account to save your readings, track your mantra streak,
            and keep a personal journal across the cosmos of tools.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => window.dispatchEvent(new CustomEvent('vc:open-auth'))}>
              Begin Your Journey <ArrowRight className="h-4 w-4" />
            </Button>
            <Button to="/tools/numerology" variant="outline" size="lg">Try Numerology free</Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
