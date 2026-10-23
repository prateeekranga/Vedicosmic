import { Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSEO } from '@/hooks/useSEO';

/** No course exists yet, so this page makes no claim about content, price or dates.
 *  It is noindex and out of the sitemap until a real course is published. */
export default function Courses() {
  useSEO({
    key: '/courses', path: '/courses', title: 'Courses · VediCosmic',
    description: 'VediCosmic courses are being prepared. Write to us to tell us what you would like to learn.',
    noindex: true,
  });

  return (
    <div className="container-vc py-16 sm:py-24">
      <SectionHeading as="h1" title="Courses"
        subtitle="Courses are being prepared. There is nothing to buy or sign up for yet." />
      <Card className="mx-auto mt-12 max-w-xl p-8 text-center sm:p-10">
        <p className="text-body leading-relaxed text-white/70">
          Tell us what you would like to learn, and we will take it into account as the first course takes shape.
        </p>
        <a href="mailto:hello@vedicosmic.com?subject=Course%20suggestion"
          className="mt-6 inline-flex items-center gap-2 text-brand-cyan-soft hover:underline">
          <Mail className="h-4 w-4" /> hello@vedicosmic.com
        </a>
      </Card>
    </div>
  );
}
