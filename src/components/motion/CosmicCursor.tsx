import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-cursor="interactive"]';

/** A glowing cosmic dot that trails the pointer and blooms over interactive elements. Desktop-only, reduced-motion-safe. */
export function CosmicCursor() {
  const reduced = usePrefersReducedMotion();
  const [supported, setSupported] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const trailX = useSpring(x, { stiffness: 120, damping: 22, mass: 0.7 });
  const trailY = useSpring(y, { stiffness: 120, damping: 22, mass: 0.7 });

  useEffect(() => {
    setSupported(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!supported || reduced) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as Element | null;
      setHovering(!!target?.closest(INTERACTIVE_SELECTOR));
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [supported, reduced, x, y]);

  if (!supported || reduced) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] rounded-full"
        style={{
          x: trailX, y: trailY, translateX: '-50%', translateY: '-50%',
          width: hovering ? 46 : 26, height: hovering ? 46 : 26,
          background: 'radial-gradient(circle, rgba(230,184,74,0.20), transparent 70%)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] rounded-full mix-blend-screen"
        style={{
          x: sx, y: sy, translateX: '-50%', translateY: '-50%',
          background: hovering
            ? 'radial-gradient(circle, #FFD700, rgba(255,215,0,0.2) 70%)'
            : 'radial-gradient(circle, #F0D080, rgba(240,208,128,0.3) 70%)',
        }}
        animate={{ width: down ? 8 : hovering ? 14 : 7, height: down ? 8 : hovering ? 14 : 7, opacity: hovering ? 0.95 : 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </>
  );
}
