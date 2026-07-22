import { motion } from 'framer-motion';

/** Animated Sri Yantra — the signature mandala behind the hero. */
export function SriYantra({ className = '', stroke = '#FFD700' }: { className?: string; stroke?: string }) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i: number) => ({
      pathLength: 1,
      opacity: 0.85,
      transition: { pathLength: { duration: 2, delay: 0.3 + i * 0.12, ease: 'easeInOut' }, opacity: { duration: 0.4, delay: 0.3 + i * 0.12 } },
    }),
  };

  // upward + downward interlocking triangles
  const tris = [
    'M100,18 L168,150 L32,150 Z',
    'M100,40 L150,140 L50,140 Z',
    'M100,62 L134,128 L66,128 Z',
    'M100,182 L32,50 L168,50 Z',
    'M100,160 L50,60 L150,60 Z',
    'M100,138 L66,72 L134,72 Z',
  ];

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {/* outer lotus ring */}
      <motion.circle cx="100" cy="100" r="92" stroke={stroke} strokeWidth="0.6" opacity="0.25"
        initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '100px 100px' }} />
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.path key={i}
          d="M100,12 q6,10 0,20 q-6,-10 0,-20"
          stroke={stroke} strokeWidth="0.7" opacity="0.3"
          style={{ transformOrigin: '100px 100px', rotate: `${i * 22.5}deg` }}
          custom={i} variants={draw} initial="hidden" animate="show" />
      ))}
      <motion.g
        initial={{ rotate: 0 }} animate={{ rotate: -360 }}
        transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '100px 100px' }}
      >
        {tris.map((d, i) => (
          <motion.path key={i} d={d} stroke={stroke} strokeWidth="0.8"
            custom={i} variants={draw} initial="hidden" animate="show" />
        ))}
      </motion.g>
      {/* bindu */}
      <motion.circle cx="100" cy="100" r="3" fill={stroke}
        initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}
        transition={{ duration: 1, delay: 1.6 }} style={{ transformOrigin: '100px 100px' }} />
      <circle cx="100" cy="100" r="44" stroke={stroke} strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
