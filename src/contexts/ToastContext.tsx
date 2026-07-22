import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface Toast { id: string; message: string; tone: 'success' | 'info' }
interface ToastCtx { notify: (message: string, tone?: Toast['tone']) => void }

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              className="glass pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card"
            >
              {t.tone === 'success'
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                : <Info className="h-5 w-5 shrink-0 text-brand-cyan" />}
              <span className="flex-1 text-sm text-white/90">{t.message}</span>
              <button
                aria-label="Dismiss"
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
