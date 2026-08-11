import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { CHAKRAS } from '@/data/chakras';

/**
 * A simple, hand-built SVG meditating silhouette with a glowing chakra column up the
 * spine — the seated-silhouette shapes are adapted from KundaliniBreathGuide.tsx (the
 * closest existing asset to this reference), re-implemented with framer-motion instead of
 * raw SMIL: the sitewide prefers-reduced-motion CSS rule zeroes CSS animation/transition
 * durations, but does not cover SMIL <animate> tags, so SMIL would otherwise ignore that
 * setting. Purely decorative background art, kept at very low opacity.
 */
export function ChakraFigureArt() {
  const { activePreset } = useChakraPlayer();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMid slice" aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]">
      {/* flat mountain silhouettes for cosmic depth */}
      <polygon points="0,220 40,150 80,220" fill="rgba(255,255,255,0.05)" />
      <polygon points="60,220 120,120 180,220" fill="rgba(255,255,255,0.07)" />
      <polygon points="130,220 175,160 200,220" fill="rgba(255,255,255,0.05)" />

      {/* seated silhouette */}
      <circle cx="100" cy="46" r="18" fill="rgba(255,255,255,0.16)" />
      <path d="M100 64 C 76 74 70 106 72 138 L 128 138 C 130 106 124 74 100 64 Z" fill="rgba(255,255,255,0.14)" />
      <path d="M40 168 Q 100 132 160 168 Q 130 186 100 184 Q 70 186 40 168 Z" fill="rgba(255,255,255,0.12)" />

      {/* the chakra column, up the spine */}
      <line x1="100" y1="150" x2="100" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 4" />
      {CHAKRAS.map((c, i) => {
        const y = 150 - (i * 110) / 6;
        const isActive = c.id === activePreset;
        const r = isActive ? 6.5 : 5;
        const glow = isActive ? 8 : 3;
        return reducedMotion ? (
          <circle key={c.id} cx="100" cy={y} r={r} fill={c.color} opacity={isActive ? 1 : 0.55}
            style={{ filter: `drop-shadow(0 0 ${glow}px ${c.color})` }} />
        ) : (
          <motion.circle key={c.id} cx="100" cy={y} r={r} fill={c.color}
            animate={{ opacity: isActive ? [0.7, 1, 0.7] : 0.4, scale: isActive ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 2.2, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 ${glow}px ${c.color})`, transformOrigin: `100px ${y}px`, transformBox: 'fill-box' as never }} />
        );
      })}
    </svg>
  );
}
