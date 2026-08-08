import { motion, useScroll, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Thin fixed bar under the navbar tracking document scroll progress — gives long-form
 *  pages (blog posts) a sense of how much is left, without a heavier reading-time widget. */
export function ScrollProgress() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 32, restDelta: 0.001 });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-[68px] z-40 h-[2px] origin-left bg-gold-sheen"
      style={{ scaleX }}
    />
  );
}
