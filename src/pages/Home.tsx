import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Hash, Telescope, Flower2 } from 'lucide-react';
import { SriYantra } from '@/components/effects/SriYantra';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Accordion } from '@/components/ui/Accordion';
import { SparkleUnderline } from '@/components/motion/SparkleUnderline';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { liveTools } from '@/content/routes';
import { HOME_CONTENT } from '@/data/homeContent';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import { useSEO } from '@/hooks/useSEO';
import { faqPageSchema } from '@/lib/schema';
import { SITE_DESCRIPTION } from '@/config/site';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const PILLARS = [
  { glyph: '✶', title: 'Rooted in tradition', text: 'Jyotish, the panchang, numerology and yogic practice, explained plainly and with respect.' },
  { glyph: '◈', title: 'Calculated in your browser', text: 'What you enter is used on your device to compute the result. It is not sent to us.' },
  { glyph: '☾', title: 'No ads', text: 'No advertising, no paid readings and no remedies for sale.' },
];

const STEPS = [
  { n: '01', title: 'Choose a tool', text: 'Numerology, astrology, the panchang, or a breath and meditation practice.' },
  { n: '02', title: 'Enter your details', text: 'A name, a birth date or a place — used in your browser, not sent to us.' },
  { n: '03', title: 'Read the result', text: 'Each result says how it was worked out. Treat it as a prompt for reflection, not a prediction.' },
];

const PATHS = [
  { Icon: Hash, title: 'Numerology', text: 'Life Path, Lo Shu, Chaldean & your full blueprint.', tone: 'gold' as const },
  { Icon: Telescope, title: 'Astrology', text: 'Birth chart, planetary hours & the Navagraha mandala.', tone: 'cyan' as const },
  { Icon: Flower2, title: 'Energy & Meditation', text: 'Chakras, mantra japa, Trataka gaze & crystal guidance.', tone: 'violet' as const },
];

export default function Home() {
  const content = HOME_CONTENT;
  useSEO({
    key: '/', path: '/', title: 'VediCosmic: free Vedic tools and daily sādhana', description: SITE_DESCRIPTION,
    jsonLd: faqPageSchema(content.faqs),
  });
  const tools = liveTools();
  const featuredTools = tools.filter((t) => t.isNew).slice(0, 3);
  const { posts: latestPosts } = useAllBlogPosts();
  const featuredPosts = latestPosts.slice(0, 3);

  return (
    <div>
      {/* HERO — static HTML and CSS only, so the headline paints without waiting for JavaScript */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        {/* one calm glow, fixed in place and sized to fade out well inside the section */}
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

        <div className="container-vc relative z-10 flex flex-col items-center text-center">
          <h1 className="max-w-4xl font-display text-hero leading-[1.05] text-white">{content.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-body leading-relaxed text-white/65">{content.heroSubtitle}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button to="/tools/sadhana" size="lg">Begin today’s sādhana (17 min) <ArrowRight className="h-4 w-4" /></Button>
            <Button to="/tools" variant="outline" size="lg">Explore {tools.length} free tools</Button>
          </div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* PILLARS */}
      <section className="container-vc py-20 sm:py-28">
        <h2 className="sr-only">What VediCosmic is</h2>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
              <Card className="h-full p-7">
                <div className="mb-4 text-4xl text-gold-soft">{p.glyph}</div>
                <h3 className="font-heading text-h3 text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{p.text}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURED TOOLS */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="Interactive Tools" title="Three tools to start with"
          subtitle="Each one computes its result in your browser and says how it was worked out." glow />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((t) => (
            <motion.div key={t.id} variants={fadeUp}>
              <Link to={`/tools/${t.slug}`}>
                <Card hover accent={t.accent} className="group h-full p-7">
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
          <Button to="/tools" variant="ghost">See all {tools.length} tools <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="How it works" title="Three steps, nothing to sign up for" />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-6 sm:grid-cols-3">
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
        <SectionHeading eyebrow="Explore by path" title="Find the practice that suits you"
          subtitle="Numerology, Vedic astrology and practice tools, grouped by what you want to do." glow />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid gap-6 md:grid-cols-3">
          {PATHS.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
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

      {/* FROM THE BLOG */}
      {featuredPosts.length > 0 && (
        <section className="container-vc py-16 sm:py-24">
          <SectionHeading eyebrow="The Blog" title="Recent articles"
            subtitle="Guides to numerology, Vedic astrology, the panchang and daily practice." />
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((p) => (
              <motion.div key={p.id} variants={fadeUp}>
                <BlogPostCard post={p} />
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-10 text-center">
            <Button to="/blog" variant="ghost">Read all articles <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </section>
      )}

      {/* SACRED VERSE BAND */}
      <section className="relative overflow-hidden border-y border-white/8 py-20 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]">
          <SriYantra className="h-full w-full" stroke="#E6B84A" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="container-vc relative z-10 text-center"
        >
          <p lang="sa" className="font-sacred text-4xl leading-snug text-gold-pale sm:text-5xl">योगः कर्मसु कौशलम्</p>
          <SparkleUnderline className="mt-6" width={110} />
          <p className="mx-auto mt-6 max-w-xl font-heading text-h4 text-white">"Yoga is skill in action."</p>
          <p className="mt-2 text-sm text-white/45">— Bhagavad Gita 2.50</p>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="container-vc py-16 sm:py-24">
        <SectionHeading eyebrow="Questions" title="Common questions"
          subtitle="Short answers about cost, privacy and accuracy." />
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
          <h2 className="font-display text-h1 text-white">Start with today’s practice</h2>
          <p className="mx-auto mt-5 max-w-xl text-body text-white/60">
            The Daily Sādhana shows today’s tithi and nakshatra, a 17-minute guided practice of breath, gaze and
            energy work, and the next observance in the calendar. Free, with nothing to sign up for.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Button to="/tools/sadhana" size="lg">
              Begin today’s sādhana <ArrowRight className="h-4 w-4" />
            </Button>
            <Button to="/tools/numerology" variant="outline" size="lg">Try numerology</Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
