import { SriYantra } from '@/components/effects/SriYantra';

/** Flower of Life — 19 overlapping circles, used as a faint sacred backdrop. */
function FlowerOfLife({ stroke = 'rgba(255,255,255,0.5)' }: { stroke?: string }) {
  const r = 26;
  const pts: [number, number][] = [[0, 0]];
  for (let k = 0; k < 6; k++) {
    const a = (k * 60) * (Math.PI / 180);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  for (let k = 0; k < 6; k++) {
    const a = (30 + k * 60) * (Math.PI / 180);
    pts.push([Math.cos(a) * r * Math.sqrt(3), Math.sin(a) * r * Math.sqrt(3)]);
  }
  for (let k = 0; k < 6; k++) {
    const a = (k * 60) * (Math.PI / 180);
    pts.push([Math.cos(a) * r * 2, Math.sin(a) * r * 2]);
  }
  return (
    <svg viewBox="-90 -90 180 180" className="h-full w-full" fill="none">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r} stroke={stroke} strokeWidth={0.4} />
      ))}
    </svg>
  );
}

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/**
 * Full-bleed living cosmic background: flowing gradient mesh, drifting nebula
 * auroras, a slow sacred-geometry layer, film grain and a vignette.
 * Pure CSS animation (GPU-friendly); pauses under prefers-reduced-motion.
 */
export function CosmicBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 120% 85% at 50% -10%, #17143c 0%, #0c0b22 45%, #050510 100%)' }} />

      {/* flowing gradient mesh */}
      <div className="absolute inset-[-20%] animate-gradient-flow opacity-60 mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(40% 40% at 20% 25%, rgba(109,93,246,0.22), transparent 60%),' +
            'radial-gradient(45% 45% at 80% 30%, rgba(57,183,240,0.18), transparent 60%),' +
            'radial-gradient(45% 45% at 70% 80%, rgba(255,183,43,0.14), transparent 60%),' +
            'radial-gradient(40% 40% at 25% 80%, rgba(13,148,136,0.16), transparent 60%)',
          backgroundSize: '200% 200%',
        }} />

      {/* drifting nebula auroras */}
      <div className="absolute -left-[12%] top-[-8%] h-[58vh] w-[58vh] rounded-full bg-violet-chakra/25 blur-[90px] animate-aurora mix-blend-screen" />
      <div className="absolute right-[-12%] top-[14%] h-[52vh] w-[52vh] rounded-full bg-brand-cyan/18 blur-[90px] animate-aurora-slow mix-blend-screen" />
      <div className="absolute bottom-[-16%] left-[22%] h-[56vh] w-[56vh] rounded-full bg-gold-soft/14 blur-[100px] animate-aurora mix-blend-screen" style={{ animationDelay: '7s' }} />
      <div className="absolute bottom-[6%] right-[8%] h-[44vh] w-[44vh] rounded-full bg-teal-cosmic/16 blur-[90px] animate-aurora-slow mix-blend-screen" style={{ animationDelay: '11s' }} />

      {/* sacred geometry — far, faint, slow */}
      <div className="absolute left-1/2 top-1/2 h-[150vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2 animate-spin-slower opacity-[0.05]">
        <FlowerOfLife stroke="rgba(180,200,255,0.6)" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[92vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
        style={{ animation: 'spin-slow 200s linear infinite reverse' }}>
        <SriYantra className="h-full w-full" stroke="#E6B84A" />
      </div>

      {/* film grain */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: '120px 120px' }} />

      {/* vignette */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 52%, rgba(5,5,16,0.7) 100%)' }} />
    </div>
  );
}
