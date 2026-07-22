import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Magnetic } from '@/components/motion/Magnetic';

/** Small "scroll to top" button that appears once you've scrolled past the hero. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > window.innerHeight * 0.7);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 right-5 z-40 sm:bottom-8 sm:right-8"
        >
          <Magnetic>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              data-sound="tap"
              className="grid h-11 w-11 place-items-center rounded-full border border-gold-soft/30 bg-cosmic-darker/80 text-gold-soft shadow-card backdrop-blur-md transition-colors hover:border-gold-bright/60 hover:text-gold-bright hover:shadow-glow-gold"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </Magnetic>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
