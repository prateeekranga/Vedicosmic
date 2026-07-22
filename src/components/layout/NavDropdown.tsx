import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { EASE } from '@/components/motion/Reveal';

/** Hover/click dropdown for a top-level nav item — used for Tools & Courses. */
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

  // Framer Motion's animate={{ scale, y }} sets an inline `transform` style that
  // fully overwrites any Tailwind `-translate-x-*` utility on the SAME element
  // (both target the `transform` CSS property; the inline style wins). So the
  // horizontal-centering offset must live on a separate, non-animated wrapper —
  // `left-0 right-0 mx-auto` centers via margins instead, with zero transform.
  const panelBody = (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-gold-bright/[0.05] via-transparent to-brand-cyan/[0.05]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div className="relative p-4">{panel}</div>
    </>
  );

  const panelNode = (
    <AnimatePresence>
      {open && (
        wide ? (
          <div className="fixed left-0 right-0 top-20 z-50 mx-auto w-[min(96vw,940px)]" onMouseEnter={openNow} onMouseLeave={closeSoon}>
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: EASE }}
              className={`isolate overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_35px_90px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/60 ring-inset ${panelClassName}`}
            >
              {panelBody}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 isolate z-50 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_35px_90px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/60 ring-inset ${panelClassName}`}
          >
            {panelBody}
          </motion.div>
        )
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
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

      {/* wide (mega-menu) panels are portaled to <body> so `fixed` centers on the
          real viewport — otherwise a transformed ancestor (Framer Motion page
          transitions use `transform`) turns `fixed` into `absolute`-like behaviour
          and the panel can clip off-screen instead of centering under the navbar */}
      {wide ? (typeof document !== 'undefined' ? createPortal(panelNode, document.body) : null) : panelNode}
    </div>
  );
}
