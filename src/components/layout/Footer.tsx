import { motion } from 'framer-motion';
import { Instagram, Send, Youtube, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { SriYantra } from '@/components/effects/SriYantra';
import { Magnetic } from '@/components/motion/Magnetic';
import { RevealStagger, RevealItem } from '@/components/motion/Reveal';

const LEGAL_LINKS: [string, string][] = [
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms'],
  ['Refund Policy', '/refund-policy'],
  ['Disclaimer', '/disclaimer'],
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

      {/* newsletter */}
      <div className="border-b border-white/8">
        <div className="container-vc flex flex-col items-center justify-between gap-5 py-10 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="font-heading text-h4 text-white">Join the inner circle</h3>
            <p className="mt-1 text-sm text-white/50">New tools, courses and cosmic notes — no spam, unsubscribe anytime.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pl-5 focus-within:border-gold-soft/40"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <Button type="submit" size="sm" className="shrink-0">
              Subscribe <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>

      <RevealStagger className="container-vc grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
        <RevealItem>
          <Logo size="lg" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Ancient Vedic wisdom, interactive cosmic tools, and structured courses — for the modern seeker walking the inner journey.
          </p>
          <div className="mt-5 flex gap-3">
            {[Youtube, Instagram, Send].map((Icon, i) => (
              <Magnetic key={i}>
                <a href="#" aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-brand-cyan hover:text-brand-cyan hover:shadow-glow-cyan">
                  <Icon className="h-5 w-5" />
                </a>
              </Magnetic>
            ))}
          </div>
        </RevealItem>

        <RevealItem>
          <FooterCol title="Explore" links={[['Tools', '/tools'], ['Courses', '/courses'], ['About', '/about'], ['Contact', '/contact']]} />
        </RevealItem>
        <RevealItem>
          <FooterCol title="Tools" links={[['Numerology', '/tools/numerology'], ['Vedic Astrology', '/tools/astrology'], ['Chakra Test', '/tools/chakra-assessment'], ['Daily Tarot', '/tools/tarot']]} />
        </RevealItem>
        <RevealItem>
          <FooterCol title="Learn" links={[['Vedic Astrology', '/courses/intro-vedic-astrology'], ['Numerology Mastery', '/courses/numerology-mastery'], ['Chakra Healing', '/courses/chakra-healing'], ['Mantra Science', '/courses/vedic-mantra-science']]} />
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
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-soft/80">{title}</h3>
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
