import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const supportsFineHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const BORDER_CHASE =
  'conic-gradient(from 0deg, transparent 0%, #FFD700 12%, transparent 28%, #39B7F0 50%, transparent 68%, #E6B84A 88%, transparent 100%)';

type Accent = 'gold' | 'cyan' | 'violet' | 'teal';

const ACCENT_LINE: Record<Accent, string> = {
  gold: 'via-gold-bright',
  cyan: 'via-brand-cyan',
  violet: 'via-violet-chakra',
  teal: 'via-teal-cosmic',
};

export function Card({
  children, className, hover = false, accent,
}: { children: ReactNode; className?: string; hover?: boolean; accent?: Accent }) {
  const reduced = usePrefersReducedMotion();
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 20 });
  const sry = useSpring(ry, { stiffness: 220, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${mx}% ${my}%, rgba(255,215,0,0.16), transparent 70%)`;

  const interactive = hover && !reduced && supportsFineHover();

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px * 100);
    my.set(py * 100);
    ry.set((px - 0.5) * 14);
    rx.set((0.5 - py) * 14);
  }

  function handleLeave() {
    if (!interactive) return;
    rx.set(0);
    ry.set(0);
  }

  // Only stretch the outer wrapper to fill its container when the caller actually
  // asked for that (className includes h-full) — e.g. equal-height cards in a grid.
  // Forcing it unconditionally caused stacked, non-full-height cards (like two
  // cards in a flex column) to each claim 100% of an already-stretched ancestor's
  // height and spill into whatever followed on the page.
  const wantsFill = className?.split(/\s+/).includes('h-full') ?? false;

  // Non-interactive (or reduced-motion) cards keep the plain CSS lift; interactive
  // cards drive every transform (tilt + lift + scale) through Framer Motion so it
  // all composes into one transform instead of fighting Tailwind's hover classes.
  return (
    <div className={cn('relative', wantsFill && 'h-full', interactive && 'group')}>
      {interactive && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-[3px] transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: BORDER_CHASE }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <motion.div
        data-sound={hover ? 'tone' : undefined}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={interactive ? { y: -6, scale: 1.02 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={interactive ? { rotateX: srx, rotateY: sry, transformPerspective: 800 } : undefined}
        className={cn(
          'relative h-full rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 shadow-card backdrop-blur-sm',
          hover && !interactive && 'transition-all duration-300 hover:-translate-y-1 hover:border-gold-soft/30 hover:shadow-card-hover',
          interactive && 'group border-white/10 hover:border-gold-soft/30 hover:shadow-card-hover',
          className,
        )}
      >
        {interactive && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: spotlight }}
          />
        )}
        {accent && (
          <span aria-hidden className={cn(
            'pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
            ACCENT_LINE[accent],
          )} />
        )}
        {children}
      </motion.div>
    </div>
  );
}
