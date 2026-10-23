import { Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Accordion } from '@/components/ui/Accordion';
import { CONTACT_CONTENT } from '@/data/contactContent';
import { useSEO } from '@/hooks/useSEO';
import { faqPageSchema } from '@/lib/schema';

/** Email only: the site has no form backend, so it does not pretend to have one. */
export default function Contact() {
  const content = CONTACT_CONTENT;
  useSEO({
    key: '/contact', path: '/contact', title: 'Contact VediCosmic: Questions and Corrections',
    description: 'Questions, corrections or feedback about VediCosmic’s tools and articles: write to hello@vedicosmic.com.',
    jsonLd: faqPageSchema(content.faqs),
  });

  return (
    <div className="container-vc py-20">
      <SectionHeading as="h1" title={content.heroTitle} subtitle={content.heroSubtitle} />

      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
        <Card className="p-7">
          <h2 className="font-heading text-h5 text-white">Email</h2>
          <a href={`mailto:${content.email}`}
            className="mt-4 inline-flex items-center gap-3 text-body text-brand-cyan-soft hover:underline">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-400/10 text-gold-400"><Mail className="h-5 w-5" /></span>
            {content.email}
          </a>
          <p className="mt-4 text-sm text-white/55">
            Corrections are especially welcome: if a result looks wrong for your birth details, tell us the date,
            time and place and what you expected.
          </p>
        </Card>
        <Card className="p-7">
          <p lang="sa" className="font-sacred text-h5 text-gradient-gold">ॐ शान्तिः</p>
          <p className="mt-2 text-sm text-white/55">
            <em>Oṃ śāntiḥ</em> — “Om, peace”. The words that close many Vedic recitations.
          </p>
        </Card>
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <SectionHeading eyebrow="Good to Know" title="Frequently Asked" />
        <div className="mt-8">
          <Accordion items={content.faqs} defaultOpen="f1" />
        </div>
      </div>
    </div>
  );
}
