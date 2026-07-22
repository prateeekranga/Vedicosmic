import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { useSEO } from '@/hooks/useSEO';

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

/** Shared chrome for the legal/policy pages — mirrors About.tsx's hero + card pattern. */
export function LegalLayout({
  eyebrow, title, updated, intro, sections,
}: { eyebrow: string; title: string; updated: string; intro: string; sections: LegalSection[] }) {
  const { pathname } = useLocation();
  useSEO({ key: pathname, path: pathname, title: `${title} · VediCosmic`, description: intro });
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="container-vc relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge tone="cyan">{eyebrow}</Badge>
            <h1 className="mt-5 font-display text-h1 text-white">{title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/45">Last updated {updated}</p>
            <p className="mx-auto mt-6 max-w-2xl text-body leading-relaxed text-white/65">{intro}</p>
          </motion.div>
        </div>
      </section>

      <RevealStagger className="container-vc mx-auto max-w-3xl space-y-5 pb-4">
        {sections.map((s, i) => (
          <RevealItem key={s.heading}>
            <Card className="p-7 sm:p-8">
              <h2 className="font-heading text-h4 text-gold-pale">
                <span className="mr-2 text-white/30">{String(i + 1).padStart(2, '0')}</span>
                {s.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">{s.body}</div>
            </Card>
          </RevealItem>
        ))}
      </RevealStagger>
    </div>
  );
}
