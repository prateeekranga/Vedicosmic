import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { EASE } from '@/components/motion/Reveal';
import { cn } from '@/lib/cn';

/** Hover/click dropdown for a top-level nav item — used for Tools. */
export function NavDropdown({
  label, active, panel, panelClassName = '', onOpenChange, wide = false,
}: { label: string; active?: boolean; panel: ReactNode; panelClassName?: string; onOpenChange?: (open: boolean) => void; wide?: boolean }) {
  const [open, setOpenState] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  const openNow = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const panelBody = (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-gold-bright/[0.05] via-transparent to-brand-cyan/[0.05]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div className="relative p-4">{panel}</div>
    </>
  );

  return (
    // The wide (mega-menu) panel is positioned against the fixed header, not this item, so that
    // it centres on the page: this wrapper is therefore not a positioning context when `wide`.
    <div className={wide ? undefined : 'relative'} onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
          active ? 'text-gold-pale' : 'text-white/70 hover:text-white'
        }`}
      >
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      {wide ? (
        // Always in the page, so its links are part of the pre-rendered HTML that search engines
        // read. While closed it is invisible and `inert`: not focusable, not announced.
        <div
          {...(open ? {} : { inert: '' })}
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          className={cn(
            'absolute inset-x-0 top-full z-50 mx-auto mt-3 w-[min(96vw,940px)] origin-top transition-[opacity,transform,visibility] duration-200',
            open ? 'visible translate-y-0 scale-100 opacity-100' : 'pointer-events-none invisible translate-y-2 scale-[0.98] opacity-0',
          )}
        >
          <div className={`isolate overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_35px_90px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/60 ring-inset ${panelClassName}`}>
            {panelBody}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: EASE }}
              className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 isolate z-50 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_35px_90px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/60 ring-inset ${panelClassName}`}
            >
              {panelBody}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
