import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Volume2, VolumeX, ArrowRight, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { NavDropdown } from '@/components/layout/NavDropdown';
import { useSound } from '@/contexts/SoundContext';
import { TOOL_CATEGORIES, liveTools } from '@/content/routes';

function SoundToggle({ className = '' }: { className?: string }) {
  const { enabled, toggle } = useSound();
  return (
    <button
      onClick={toggle}
      data-sound="none"
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute background music' : 'Play background music'}
      title={enabled ? 'Background music on' : 'Background music off'}
      className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
        enabled ? 'border-gold-400/40 text-gold-300' : 'border-white/10 text-white/50'
      } hover:text-gold-300 hover:border-gold-400/50 ${className}`}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tools/chakra-frequency-player', label: 'Chakra Player' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const LEGAL_LINKS = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/refund-policy', label: 'Refund Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
];

// Coming-soon tools stay out of the navigation until they work.
const LIVE_TOOLS = liveTools();
const TOOLS_PER_CATEGORY = TOOL_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
  ...c,
  tools: LIVE_TOOLS.filter((t) => t.category === c.id),
}));
const MAX_PER_CATEGORY = 4;

function ToolsPanel() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        {TOOLS_PER_CATEGORY.map(({ id, label, tools }) => (
          <div key={id}>
            <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-cosmic-darker/40">{label}</p>
            <div className="space-y-0.5">
              {tools.slice(0, MAX_PER_CATEGORY).map((tool) => (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.slug}`}
                  className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-black/[0.04]"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-bright/10 text-gold-600">
                    <tool.Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-tight text-cosmic-darker group-hover:text-gold-600">{tool.name}</span>
                </Link>
              ))}
              {tools.length > MAX_PER_CATEGORY && (
                <Link to="/tools" className="block px-3 py-1.5 text-xs text-sky-700 hover:underline">
                  +{tools.length - MAX_PER_CATEGORY} more
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      <Link
        to="/tools"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-black/10 py-2.5 text-sm text-sky-700 transition-colors hover:border-sky-600/50 hover:bg-black/[0.03]"
      >
        View all {LIVE_TOOLS.length} tools <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<'tools' | null>(null);
  const [mobileMenuOverflowing, setMobileMenuOverflowing] = useState(false);
  const mobileListRef = useRef<HTMLUListElement>(null);
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { setScrolled(window.scrollY > 40); ticking = false; });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setMobileSection(null); }, [location.pathname]);

  // Shows a bottom fade + keeps it in sync with actual scroll position, so the
  // long mobile menu never looks abruptly "cut off" without a scroll affordance.
  useEffect(() => {
    const el = mobileListRef.current;
    if (!mobileOpen || !el) { setMobileMenuOverflowing(false); return; }
    const check = () => setMobileMenuOverflowing(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', check); ro.disconnect(); };
  }, [mobileOpen, mobileSection]);

  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  // Force a solid header whenever a mega menu is open, so its background never
  // shifts mid-interaction — only relevant on the transparent, unscrolled home hero.
  const solid = scrolled || mobileOpen || !isHome || toolsMenuOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          solid ? 'border-b border-white/8 bg-cosmic-darker/85 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <nav role="navigation" aria-label="Main navigation" className="container-vc flex h-[68px] items-center justify-between">
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            <li>
              <NavLink to="/" end
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-gold-pale' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Home
                    {isActive && (
                      <motion.span layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-cyan-sheen shadow-glow-cyan" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li><NavDropdown label="Tools" active={location.pathname.startsWith('/tools')} panel={<ToolsPanel />} onOpenChange={setToolsMenuOpen} wide /></li>
            {LINKS.slice(1).map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-gold-pale' : 'text-white/70 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <motion.span layoutId="nav-underline"
                          className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-cyan-sheen shadow-glow-cyan" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <SoundToggle />
            <Button variant="primary" size="sm" to="/tools/sadhana">Begin today’s sādhana</Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <SoundToggle />
            <button
              className="grid h-11 w-11 place-items-center text-white" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative min-h-[calc(100vh-68px)] overflow-hidden border-t border-white/8 bg-cosmic-darker/95 backdrop-blur-lg md:hidden"
              style={{ minHeight: 'calc(100dvh - 68px)' }}
            >
              <ul ref={mobileListRef}
                className="container-vc flex max-h-[calc(100vh-68px)] flex-col gap-1 overflow-y-auto py-4"
                style={{ maxHeight: 'calc(100dvh - 68px)' }}>
                <li>
                  <NavLink to="/" end
                    className={({ isActive }) => `block rounded-xl px-4 py-3 text-base ${isActive ? 'bg-white/5 text-gold-pale' : 'text-white/80'}`}>
                    Home
                  </NavLink>
                </li>

                <MobileAccordion
                  label="Tools" open={mobileSection === 'tools'}
                  onToggle={() => setMobileSection((s) => (s === 'tools' ? null : 'tools'))}
                >
                  {TOOLS_PER_CATEGORY.map(({ id, label, tools }) => (
                    <div key={id} className="mb-2">
                      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-white/35">{label}</p>
                      {tools.slice(0, MAX_PER_CATEGORY).map((tool) => (
                        <Link key={tool.id} to={`/tools/${tool.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white">
                          <tool.Icon className="h-4 w-4 text-gold-soft" /> {tool.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link to="/tools" className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-brand-cyan-soft">
                    View all {LIVE_TOOLS.length} tools <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </MobileAccordion>

                {LINKS.slice(1).map((l) => (
                  <li key={l.to}>
                    <NavLink to={l.to}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 text-base ${isActive ? 'bg-white/5 text-gold-pale' : 'text-white/80'}`}
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}

                <li className="mt-2 flex flex-col gap-2 px-1">
                  <Button variant="primary" to="/tools/sadhana">Begin today’s sādhana</Button>
                </li>

                <li className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/8 px-4 pt-3">
                  {LEGAL_LINKS.map((l) => (
                    <Link key={l.to} to={l.to} className="text-xs text-white/35 hover:text-white/60">{l.label}</Link>
                  ))}
                </li>
              </ul>
              {mobileMenuOverflowing && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-cosmic-darker/95 to-transparent" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function MobileAccordion({
  label, open, onToggle, children,
}: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base text-white/80"
      >
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-2"
          >
            <div className="flex flex-col gap-0.5 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
