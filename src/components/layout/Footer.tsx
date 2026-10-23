import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { SriYantra } from '@/components/effects/SriYantra';
import { LEGAL } from '@/content/legal';
import { RevealStagger, RevealItem } from '@/components/motion/Reveal';

const LEGAL_LINKS: [string, string][] = [
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms'],
  ['Refund Policy', '/refund-policy'],
  ['Disclaimer', '/disclaimer'],
  ...(LEGAL ? [['Legal & grievance officer', '/legal'] as [string, string]] : []),
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-cosmic-darker/60">
      {/* one calm, contained glow — fixed in place, sized to fade out well before any edge */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(57,183,240,0.12), transparent 70%)' }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-[420px] w-[420px] opacity-[0.05]">
        <SriYantra className="h-full w-full" stroke="#E6B84A" />
      </div>

      <RevealStagger className="container-vc grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
        <RevealItem>
          <Logo size="lg" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Free Vedic astrology, panchang, numerology and practice tools. Calculated in your browser. No ads.
          </p>
          <a href="mailto:hello@vedicosmic.com" className="mt-4 inline-block text-sm text-brand-cyan-soft hover:underline">
            hello@vedicosmic.com
          </a>
        </RevealItem>

        <RevealItem>
          <FooterCol title="Explore" links={[['Tools', '/tools'], ['Blog', '/blog'], ['About', '/about'], ['Contact', '/contact']]} />
        </RevealItem>
        <RevealItem>
          <FooterCol title="Tools" links={[['Numerology', '/tools/numerology'], ['Vedic Astrology', '/tools/astrology'], ['Chakra Test', '/tools/chakra-assessment'], ['Daily Tarot', '/tools/tarot'], ['Sleep & Chakra Sounds', '/tools/chakra-frequency-player']]} />
        </RevealItem>
        <RevealItem>
          <FooterCol title="Learn" links={[['Astrology articles', '/blog/category/astrology'], ['Numerology articles', '/blog/category/numerology'], ['Meditation & yoga', '/blog/category/meditation-yoga'], ['Rituals & festivals', '/blog/category/rituals-festivals']]} />
        </RevealItem>
        <RevealItem>
          <FooterCol title="Legal" links={LEGAL_LINKS} />
        </RevealItem>
      </RevealStagger>

      <div className="border-t border-white/8 py-5">
        <div className="container-vc flex flex-col items-center justify-between gap-3 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} VediCosmic — vedicosmic.com. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/privacy-policy" className="transition-colors hover:text-white/70">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-white/70">Terms</Link>
            <span className="hidden sm:inline text-white/20">·</span>
            <p className="w-full text-center sm:w-auto">Educational content; not a substitute for professional advice.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-soft/80">{title}</h2>
      <ul className="space-y-2.5">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-white/55 transition-colors hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
