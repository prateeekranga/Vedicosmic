import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface Star { x: number; y: number; r: number; tw: number; phase: number; hue: string; drift: number }
interface Comet { x: number; y: number; vx: number; vy: number; life: number; len: number }

export function Starfield({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Skip canvas entirely when user prefers reduced motion
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    const cv = canvas;
    const ctx = context;

    let raf = 0;
    let isVisible = true;
    let stars: Star[] = [];
    let comets: Comet[] = [];
    let nextComet = 2500 + Math.random() * 4000;
    let last = performance.now();
    const isMobile = window.innerWidth < 768;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Fewer stars on mobile for better GPU performance
      const base = isMobile ? 60 : 150;
      const count = Math.round(base * density);
      const palette = ['#FFFFFF', '#F0D080', '#7DD3FC', '#FFD700', '#C9B8FF'];
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * 0.02 + 0.004,
        phase: Math.random() * Math.PI * 2,
        hue: palette[Math.floor(Math.random() * palette.length)],
        drift: Math.random() * 0.06 + 0.01,
      }));
    }

    function spawnComet() {
      if (isMobile) return; // skip comets on mobile
      const fromLeft = Math.random() > 0.5;
      const speed = 7 + Math.random() * 5;
      const ang = (Math.random() * 18 + 18) * (Math.PI / 180);
      comets.push({
        x: fromLeft ? -40 : window.innerWidth + 40,
        y: Math.random() * window.innerHeight * 0.5,
        vx: (fromLeft ? 1 : -1) * Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 1,
        len: 120 + Math.random() * 120,
      });
    }

    function draw(now: number) {
      // Skip rendering when off-screen but keep the loop alive
      if (!isVisible) { raf = requestAnimationFrame(draw); return; }

      const dt = Math.min(40, now - last); last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const s of stars) {
        s.phase += s.tw;
        s.y += s.drift;
        if (s.y > window.innerHeight + 2) { s.y = -2; s.x = Math.random() * window.innerWidth; }
        const alpha = 0.35 + Math.sin(s.phase) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.hue;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // comets
      nextComet -= dt;
      if (nextComet <= 0 && comets.length < 2) { spawnComet(); nextComet = 6000 + Math.random() * 8000; }
      comets = comets.filter((c) => c.life > 0 && c.x > -200 && c.x < window.innerWidth + 200);
      for (const c of comets) {
        c.x += c.vx; c.y += c.vy; c.life -= 0.004;
        const hypot = Math.hypot(c.vx, c.vy);
        const tx = c.x - c.vx / hypot * c.len;
        const ty = c.y - c.vy / hypot * c.len;
        const grad = ctx.createLinearGradient(c.x, c.y, tx, ty);
        grad.addColorStop(0, `rgba(255,255,255,${0.9 * c.life})`);
        grad.addColorStop(0.4, `rgba(125,211,252,${0.4 * c.life})`);
        grad.addColorStop(1, 'rgba(125,211,252,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.beginPath(); ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${c.life})`; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    // Pause rendering when the canvas is scrolled off-screen
    const observer = new IntersectionObserver(
      (entries) => { isVisible = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(cv);

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [density, reduced]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20" />
  );
}
