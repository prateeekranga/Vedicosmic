import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const SEEN_KEY = 'vc:gate-seen';

interface Mote { x: number; y: number; r: number; hue: string; phase: number; tw: number }

const PALETTE = ['#FFFFFF', '#FFD700', '#E6B84A', '#7DD3FC', '#39B7F0'];

/**
 * A full-screen "portal" the site is entered through once per session: a comet
 * streaks across scattered stardust, the wordmark condenses out of the dust,
 * then an ENTER prompt invites a click which iris-wipes away to the site.
 * Skips entirely under reduced motion or on repeat visits within the tab.
 */
export function CosmicGate() {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'assemble' | 'ready' | 'leaving'>('assemble');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch { /* private mode etc. */ }
    setVisible(true);
    const t = setTimeout(() => setPhase('ready'), 1900);
    return () => clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const cv: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = context;

    let raf = 0;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.innerWidth < 768;

    function resize() {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const count = isMobile ? 140 : 260;
    const motes: Mote[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3 + 0.4,
      hue: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      phase: Math.random() * Math.PI * 2,
      tw: Math.random() * 0.03 + 0.01,
    }));

    const comet = { x: -80, y: window.innerHeight * 0.28, vx: 9, vy: 2.4, active: true };

    function draw() {
      if (cancelled) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const m of motes) {
        m.phase += m.tw;
        const drift = Math.sin(m.phase) * 6;
        ctx.beginPath();
        ctx.arc(m.x + drift * 0.2, m.y + drift * 0.1, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.hue;
        ctx.globalAlpha = 0.25 + Math.sin(m.phase) * 0.25;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (comet.active) {
        comet.x += comet.vx; comet.y += comet.vy;
        const len = 140;
        const grad = ctx.createLinearGradient(comet.x, comet.y, comet.x - len, comet.y - len * 0.27);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.5, 'rgba(255,215,0,0.35)');
        grad.addColorStop(1, 'rgba(57,183,240,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(comet.x - len, comet.y - len * 0.27); ctx.stroke();
        if (comet.x > window.innerWidth + 160) comet.active = false;
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { cancelled = true; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [visible]);

  function enter() {
    if (phase !== 'ready') return;
    setPhase('leaving');
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* */ }
    setTimeout(() => setVisible(false), 900);
  }

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Enter VediCosmic"
          onClick={enter}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') enter(); }}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#050510] select-none"
          initial={{ opacity: 1 }}
          animate={phase === 'leaving' ? { opacity: 0, scale: 1.15 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0" />

          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(230,184,74,0.10), transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.2em', filter: 'blur(6px)' }}
            animate={{ opacity: 1, letterSpacing: '0.35em', filter: 'blur(0px)' }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 font-display text-2xl text-gold-pale sm:text-4xl"
          >
            VEDICOSMIC
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="relative z-10 mt-3 text-xs uppercase tracking-[0.4em] text-white/50"
          >
            The Inner Journey
          </motion.p>

          <AnimatePresence>
            {phase === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 mt-14 flex flex-col items-center gap-3"
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="eyebrow text-[11px]"
                >
                  ✦ Tap to Enter ✦
                </motion.span>
                <motion.div
                  className="h-9 w-9 rounded-full border border-gold-soft/50"
                  animate={{ scale: [1, 1.3], opacity: [0.7, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
