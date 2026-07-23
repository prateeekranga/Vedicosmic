import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementBanner } from './AnnouncementBanner';
import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { Starfield } from '@/components/effects/Starfield';
import { CosmicBackground } from '@/components/effects/CosmicBackground';
import { CosmicGate } from '@/components/motion/CosmicGate';
import { CosmicCursor } from '@/components/motion/CosmicCursor';
import { BackToTop } from './BackToTop';

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [pathname]);

  // Defer heavy background effects until after first paint — keeps main thread
  // free during React hydration, directly improving FCP and LCP.
  const [effectsMounted, setEffectsMounted] = useState(false);
  useEffect(() => {
    const cb = () => setEffectsMounted(true);
    if ('requestIdleCallback' in window) {
      const id = (window as Window & { requestIdleCallback: (cb: () => void, opts?: object) => number })
        .requestIdleCallback(cb, { timeout: 300 });
      return () => (window as Window & { cancelIdleCallback: (id: number) => void })
        .cancelIdleCallback(id);
    }
    // Fallback for Safari
    const id = setTimeout(cb, 150);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="relative min-h-screen">
      <CosmicGate />
      <CosmicCursor />
      {/* Render background effects only after first paint */}
      {effectsMounted && <CosmicBackground />}
      {effectsMounted && <Starfield />}
      <AnnouncementBanner />
      <SiteJsonLd />
      <Navbar />
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
