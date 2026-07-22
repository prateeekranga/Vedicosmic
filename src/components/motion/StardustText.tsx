import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  size: number;
  hue: string;
  phase: number;
  tw: number;
  swirl: number;
  spin: number;
}

const PALETTE = ['#FFD700', '#E6B84A', '#F3D98B', '#39B7F0', '#7DD3FC'];
const ASSEMBLE_MS = 1400;
const SWIRL_DAMP = 18;

/**
 * A word rendered from scattered stardust that converges into shape, then
 * idles with a soft shimmer. Falls back to a plain gradient span when the
 * user prefers reduced motion, so it never blocks reading the headline.
 */
export function StardustText({
  text, className, trigger = 'mount', delay = 0,
}: { text: string; className?: string; trigger?: 'mount' | 'inView'; delay?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    if (trigger === 'mount') {
      const t = setTimeout(() => setReady(true), delay);
      return () => clearTimeout(t);
    }
    const el = wrapRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { t = setTimeout(() => setReady(true), delay); io.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [trigger, reduced, delay]);

  useEffect(() => {
    if (reduced || !ready) return;
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const cv: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = context;

    let raf = 0;
    let cancelled = false;
    let started = false;
    let startTime = 0;
    const isMobile = window.innerWidth < 768;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = size.w * dpr;
    cv.height = size.h * dpr;
    cv.style.width = size.w + 'px';
    cv.style.height = size.h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Sample glyph coverage from an offscreen render of the text.
    const sample = document.createElement('canvas');
    sample.width = Math.round(size.w);
    sample.height = Math.round(size.h);
    const sctx = sample.getContext('2d')!;
    const computed = wrapRef.current ? getComputedStyle(wrapRef.current) : null;
    const fontSize = computed ? parseFloat(computed.fontSize) : 48;
    const fontFamily = computed ? computed.fontFamily : 'serif';
    const fontWeight = computed ? computed.fontWeight : '700';
    sctx.fillStyle = '#fff';
    sctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    sctx.textBaseline = 'middle';
    sctx.textAlign = 'left';
    sctx.fillText(text, 1, sample.height / 2);
    const img = sctx.getImageData(0, 0, sample.width, sample.height).data;

    const step = isMobile ? 3 : 2;
    const points: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < sample.height; y += step) {
      for (let x = 0; x < sample.width; x += step) {
        const alpha = img[(y * sample.width + x) * 4 + 3];
        if (alpha > 120) points.push({ x, y });
      }
    }
    const maxPts = isMobile ? 420 : 850;
    const picked: Array<{ x: number; y: number }> = [];
    if (points.length > maxPts) {
      const strideF = points.length / maxPts;
      for (let i = 0; i < maxPts; i++) picked.push(points[Math.floor(i * strideF)]);
    } else {
      picked.push(...points);
    }

    // Scatter each particle's origin in a wide burst radius around its target
    // point, so the word looks like it's condensing out of a swirling nebula
    // of dust rather than flying in from off-screen on a straight line.
    const particles: Particle[] = picked.map((p) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 160 + Math.random() * 420;
      return {
        x: p.x + Math.cos(angle) * radius,
        y: p.y + Math.sin(angle) * radius,
        tx: p.x, ty: p.y,
        size: Math.random() * 1.8 + 0.7,
        hue: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        phase: Math.random() * Math.PI * 2,
        tw: Math.random() * 0.03 + 0.015,
        swirl: (Math.random() - 0.5) * 140,
        spin: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5),
      };
    });

    function draw(now: number) {
      if (cancelled) return;
      if (!started) { startTime = now; started = true; }
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / ASSEMBLE_MS);
      // overshoot-then-settle spring feel instead of a flat ease-out
      const ease = p < 1 ? 1 - Math.pow(1 - p, 3) : 1;
      const overshoot = p < 1 ? Math.sin(p * Math.PI) * (1 - p) * SWIRL_DAMP : 0;

      ctx.clearRect(0, 0, size.w, size.h);
      for (const particle of particles) {
        const baseX = particle.x + (particle.tx - particle.x) * ease;
        const baseY = particle.y + (particle.ty - particle.y) * ease;
        // perpendicular swirl offset that decays to zero as particles land
        const perpAngle = Math.atan2(particle.ty - particle.y, particle.tx - particle.x) + Math.PI / 2;
        const swirlAmt = particle.swirl * (1 - ease) * particle.spin;
        const cx = baseX + Math.cos(perpAngle) * swirlAmt + Math.cos(particle.phase) * overshoot;
        const cy = baseY + Math.sin(perpAngle) * swirlAmt + Math.sin(particle.phase) * overshoot;
        particle.phase += particle.tw;
        const shimmer = p >= 1 ? 0.55 + Math.sin(particle.phase) * 0.4 : 0.5 + p * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.hue;
        ctx.globalAlpha = Math.max(0.15, shimmer);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [reduced, ready, size, text]);

  useEffect(() => {
    if (reduced || !ready) return;
    const t = setTimeout(() => setSettled(true), ASSEMBLE_MS);
    return () => clearTimeout(t);
  }, [reduced, ready]);

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      ref={wrapRef}
      className={cn('relative inline-block align-baseline', className)}
      style={{ color: 'transparent' }}
      aria-label={text}
    >
      {text}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
      {settled && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-gold-bright/60"
          style={{ translateX: '-50%', translateY: '-50%', width: 10, height: 10 }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 14, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </span>
  );
}
