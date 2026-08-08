import { lazy, Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementBanner } from './AnnouncementBanner';
import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { Starfield } from '@/components/effects/Starfield';
import { CosmicBackground } from '@/components/effects/CosmicBackground';
import { BackToTop } from './BackToTop';

// Lazy-load cosmetic-only components — they add no LCP value
const CosmicGate   = lazy(() => import('@/components/motion/CosmicGate').then(m => ({ default: m.CosmicGate })));
const CosmicCursor = lazy(() => import('@/components/motion/CosmicCursor').then(m => ({ default: m.CosmicCursor })));

// Only mount cursor/gate on non-touch devices
const isDesktop = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [pathname]);

  // The admin dashboard is its own self-contained "app" (WordPress-style admin bar + sidebar,
  // built inside Admin.tsx) — it doesn't wear the public site's marketing chrome, the same way
  // wp-admin never shows the active theme's header/footer. SiteJsonLd stays on everywhere — it's
  // invisible structured data, harmless either way — everything else here is public-site-only.
  const isAdmin = pathname.startsWith('/vc-portal-x7');

  return (
    <div className="relative min-h-screen">
      {!isAdmin && (
        <>
          {/* Heavy cosmetic effects — lazy, desktop-only */}
          {isDesktop && (
            <Suspense fallback={null}>
              {pathname === '/' && <CosmicGate />}
              <CosmicCursor />
            </Suspense>
          )}

          {/* Background layers */}
          <CosmicBackground />
          <Starfield />

          <AnnouncementBanner />
        </>
      )}
      <SiteJsonLd />
      {!isAdmin && <Navbar />}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </div>
  );
}
