import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SriYantra } from '@/components/effects/SriYantra';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { mergedAboutContent } from '@/lib/siteContent';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';

export default function About() {
  useOverridesVersion();
  const content = mergedAboutContent();
  useSEO({
    key: '/about', path: '/about', title: 'About · VediCosmic',
    description: 'The story, mission, and teachers behind VediCosmic — honest Vedic tools and courses for the modern seeker.',
  });
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <motion.div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }} transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}>
          <SriYantra className="h-full w-full opacity-10" stroke="#39B7F0" />
        </motion.div>
        <div className="container-vc relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge tone="cyan">{content.heroBadge}</Badge>
            <h1 className="mt-5 font-display text-hero leading-tight text-white">{content.heroTitle}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-body leading-relaxed text-white/65">{content.heroSubtitle}</p>
          </motion.div>
        </div>
      </section>

      <RevealStagger className="container-vc grid gap-6 py-12 md:grid-cols-2">
        <RevealItem>
          <Card className="h-full p-8">
            <span className="eyebrow">Our mission</span>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{content.missionText}</p>
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="h-full p-8">
            <span className="eyebrow">Our vision</span>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{content.visionText}</p>
          </Card>
        </RevealItem>
      </RevealStagger>

      <section className="container-vc py-16">
        <SectionHeading eyebrow="What we stand for" title="Three principles guide everything" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.values.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full p-7">
                <div className="mb-4 text-4xl text-gold-soft">{v.glyph}</div>
                <h3 className="font-heading text-h3 text-white">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{v.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-vc py-16">
        <SectionHeading eyebrow="The journey so far" title="How we arrived here" />
        <div className="mx-auto mt-12 max-w-2xl">
          {content.timeline.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative flex gap-6 pb-10 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-soft/40 bg-gold-bright/10 font-display text-sm text-gold-pale">{t.year}</span>
                {i < content.timeline.length - 1 && <span className="mt-2 w-px flex-1 bg-gradient-to-b from-gold-soft/40 to-transparent" />}
              </div>
              <p className="pt-3 text-sm leading-relaxed text-white/65">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-vc py-16">
        <SectionHeading eyebrow="The people" title="Teachers & makers" />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {content.team.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="flex flex-col items-center p-7 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-bright/15 font-display text-2xl text-gold-soft">{m.initials}</span>
                <h3 className="mt-4 font-heading text-lg text-white">{m.name}</h3>
                <p className="mt-1 text-sm text-white/55">{m.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-vc py-12">
        <div className="glass rounded-3xl p-10 text-center sm:p-14">
          <h2 className="font-display text-h1 text-white">Begin where you are</h2>
          <p className="mx-auto mt-4 max-w-lg text-body text-white/60">Every tool is free to try. No account required to start.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/tools" size="lg">Explore the tools</Button>
            <Button to="/courses" variant="outline" size="lg">See the courses</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
