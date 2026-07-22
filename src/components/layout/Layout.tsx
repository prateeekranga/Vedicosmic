import { useEffect } from 'react';
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

  return (
    <div className="relative min-h-screen">
      <CosmicGate />
      <CosmicCursor />
      <CosmicBackground />
      <Starfield />
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
