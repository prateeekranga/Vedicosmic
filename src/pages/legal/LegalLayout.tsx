import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTool } from '@/content/routes';
import { LEGAL } from '@/content/legal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OnThisPage } from '@/components/ui/OnThisPage';
import { RevealStagger, RevealItem } from '@/components/motion/Reveal';
import { useSEO } from '@/hooks/useSEO';
import { slugify } from '@/lib/blogUtils';
import { enter } from '@/lib/hydration';

export interface LegalSection {
  heading: string;
  body: ReactNode;
  /** Anchor for links from other pages, e.g. /how-we-calculate#panchang. */
  id?: string;
  /** Slugs of the tools that rely on this section; listed under it as links. */
  tools?: readonly string[];
}

/** The site's policy and method pages, listed beside each of them on wide screens. */
const RELATED_PAGES: [string, string][] = [
  ['How we calculate', '/how-we-calculate'],
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms'],
  ['Refund Policy', '/refund-policy'],
  ['Disclaimer', '/disclaimer'],
  ...(LEGAL ? [['Legal & grievance officer', '/legal'] as [string, string]] : []),
];

/** Every section gets an anchor for the page menu: its own id, or one made from its heading. */
function sectionIds(sections: LegalSection[]): string[] {
  const seen = new Map<string, number>();
  return sections.map((s) => {
    if (s.id) return s.id;
    const base = slugify(s.heading) || 'section';
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

/** Shared chrome for the legal/policy pages — mirrors About.tsx's hero + card pattern. */
export function LegalLayout({
  eyebrow, title, seoTitle, updated, intro, sections,
}: {
  eyebrow: string; title: string;
  /** Browser-tab and search title, when "<title> · VediCosmic" would be too short. */
  seoTitle?: string;
  updated: string; intro: string; sections: LegalSection[];
}) {
  const { pathname } = useLocation();
  useSEO({ key: pathname, path: pathname, title: seoTitle ?? `${title} · VediCosmic`, description: intro });
  const ids = sectionIds(sections);
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="container-vc relative text-center">
          <motion.div initial={enter({ opacity: 0, y: 20 })} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge tone="cyan">{eyebrow}</Badge>
            <h1 className="mt-5 font-display text-h1 text-white">{title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/45">Last updated {updated}</p>
            <p className="mx-auto mt-6 max-w-2xl text-body leading-relaxed text-white/65">{intro}</p>
          </motion.div>
        </div>
      </section>

      {/* Wide screens: the section menu to the left of the text, the other policy pages to its right. */}
      <div className="container-vc lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[15rem_minmax(0,54rem)_15rem] xl:justify-center xl:gap-12">
        <div className="hidden lg:block lg:self-stretch">
          <OnThisPage items={sections.map((s, i) => ({ id: ids[i], label: s.heading }))} className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-4" />
        </div>

        <RevealStagger className="mx-auto min-w-0 max-w-3xl space-y-5 pb-4 lg:mx-0 lg:max-w-none">
          {sections.map((s, i) => (
            <RevealItem key={s.heading}>
              <Card className="p-7 sm:p-8">
                <h2 id={ids[i]} className="scroll-mt-24 font-heading text-h4 text-gold-pale">
                  <span className="mr-2 text-white/60">{String(i + 1).padStart(2, '0')}</span>
                  {s.heading}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">{s.body}</div>
                {s.tools && s.tools.length > 0 && (
                  <p className="mt-4 text-xs leading-relaxed text-white/60">
                    Tools that use this:{' '}
                    {s.tools.flatMap((slug) => {
                      const tool = getTool(slug);
                      return tool && tool.status === 'live' ? [tool] : [];
                    }).map((tool, j) => (
                      <span key={tool.slug}>
                        {j > 0 && ', '}
                        <Link to={`/tools/${tool.slug}`} className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">{tool.name}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </Card>
            </RevealItem>
          ))}
        </RevealStagger>

        <div className="hidden xl:block xl:self-stretch">
          <nav aria-label="Policies and methods" className="xl:sticky xl:top-24">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft/80">Related pages</p>
            <ul className="space-y-1 text-sm">
              {RELATED_PAGES.map(([label, to]) => {
                const current = to === pathname;
                return (
                  <li key={to}>
                    <Link to={to} aria-current={current ? 'page' : undefined}
                      className={`block rounded-lg px-3 py-2 transition-colors ${current ? 'bg-white/[0.06] text-gold-pale' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'}`}>
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/60">
              Questions about this page?{' '}
              <a href="mailto:hello@vedicosmic.com" className="text-brand-cyan-soft hover:underline">hello@vedicosmic.com</a>
            </p>
          </nav>
        </div>
      </div>
    </div>
  );
}
