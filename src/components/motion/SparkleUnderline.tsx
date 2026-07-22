import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { EASE } from './Reveal';
import { cn } from '@/lib/cn';

const DOTS = Array.from({ length: 10 }, (_, i) => i);

/**
 * A gradient line that draws itself left-to-right beneath a heading, with a
 * scatter of stardust rising off it. Used as a ceremonial flourish under key
 * section titles and the sacred verse.
 */
export function SparkleUnderline({ className, width = 140 }: { className?: string; width?: number }) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <div
        className={cn('mx-auto h-px bg-gradient-to-r from-transparent via-gold-soft to-transparent', className)}
        style={{ width }}
      />
    );
  }

  return (
    <div className={cn('relative mx-auto h-6', className)} style={{ width }} aria-hidden="true">
      {DOTS.map((i) => {
        const left = 8 + (i / (DOTS.length - 1)) * (width - 16);
        return (
          <motion.span
            key={i}
            className="absolute bottom-2 h-[3px] w-[3px] rounded-full bg-gold-pale"
            style={{ left, boxShadow: '0 0 6px 1px rgba(255,215,0,0.7)' }}
            initial={{ opacity: 0, y: 6, scale: 0.5 }}
            whileInView={{ opacity: [0, 1, 0.6], y: [6, -8, -14], scale: [0.5, 1, 0.8] }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 1.6, delay: 0.15 + i * 0.05, ease: EASE, repeat: Infinity, repeatDelay: 2 + (i % 4) * 0.4 }}
          />
        );
      })}
      <motion.div
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-transparent via-gold-bright to-transparent"
        style={{ boxShadow: '0 0 8px 1px rgba(230,184,74,0.6)' }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </div>
  );
}
