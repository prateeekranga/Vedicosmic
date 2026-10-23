import { motion } from 'framer-motion';
import { SriYantra } from '@/components/effects/SriYantra';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { ABOUT_CONTENT } from '@/data/aboutContent';
import { getPerson } from '@/content/people';
import { useSEO } from '@/hooks/useSEO';

export default function About() {
  const content = ABOUT_CONTENT;
  const founder = getPerson('parikshiva');
  useSEO({
    key: '/about', path: '/about', title: 'About · VediCosmic',
    description: 'Who runs VediCosmic, what it is for, and how its free Vedic astrology, panchang and practice tools work.',
  });
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <motion.div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }} transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}>
          <SriYantra className="h-full w-full opacity-10" stroke="#39B7F0" />
        </motion.div>
        <div className="container-vc relative text-center">
          <h1 className="font-display text-hero leading-tight text-white">{content.heroTitle}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-body leading-relaxed text-white/65">{content.heroSubtitle}</p>
        </div>
      </section>

      <RevealStagger className="container-vc grid gap-6 py-12 md:grid-cols-2">
        <RevealItem>
          <Card className="h-full p-8">
            <h2 className="eyebrow">Our mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{content.missionText}</p>
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="h-full p-8">
            <h2 className="eyebrow">Our method</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{content.methodText}</p>
          </Card>
        </RevealItem>
      </RevealStagger>

      <section className="container-vc py-16">
        <SectionHeading eyebrow="What you can check" title="Three promises" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.promises.map((v, i) => (
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

      {founder && (
        <section className="container-vc py-16">
          <SectionHeading eyebrow="Who runs VediCosmic" title={founder.name} />
          <Card className="mx-auto mt-10 max-w-2xl p-8 text-center">
            <p className="text-body text-white/75">{founder.role}.</p>
            {founder.nameNote && <p className="mt-2 text-sm text-white/55">{founder.nameNote}</p>}
            {founder.bio && <p className="mt-4 text-sm leading-relaxed text-white/65">{founder.bio}</p>}
          </Card>
        </section>
      )}

      <section className="container-vc py-12">
        <div className="glass rounded-3xl p-10 text-center sm:p-14">
          <h2 className="font-display text-h1 text-white">Begin where you are</h2>
          <p className="mx-auto mt-4 max-w-lg text-body text-white/60">Every tool is free to try. No account required.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/tools" size="lg">Explore the tools</Button>
            <Button to="/tools/sadhana" variant="outline" size="lg">Begin today’s sādhana</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
