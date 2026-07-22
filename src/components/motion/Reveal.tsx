import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Single element that fades + slides up as it scrolls into view. */
export function Reveal({
  children, className, delay = 0, y = 30,
}: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const parentVar: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };

/** Wrap a list; children using <RevealItem> animate in one after another. */
export function RevealStagger({
  children, className, stagger = 0.09,
}: { children: ReactNode; className?: string; stagger?: number }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-70px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } } }}
    >
      {children}
    </motion.div>
  );
}

const itemVar: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return <motion.div className={className} variants={itemVar}>{children}</motion.div>;
}

// keep parentVar referenced for tree-shakers
void parentVar;
