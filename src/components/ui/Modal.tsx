import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // kept in a ref (not an effect dep) so a parent re-render that hands us a
  // new `onClose` identity — e.g. an inline arrow function — never re-fires
  // the effect below and steals focus from whatever the user is typing into.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // focus trap entry
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input,button,textarea,select')?.focus(), 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          role="dialog" aria-modal="true" aria-label={title}
        >
          <div className="absolute inset-0 bg-cosmic-darker/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            ref={ref}
            className={`glass relative w-full ${maxWidth} rounded-3xl p-7 shadow-card-hover`}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <button
              onClick={onClose} aria-label="Close dialog"
              className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {title && <h2 className="mb-5 font-heading text-2xl text-gold-pale">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
