import { Link } from 'react-router-dom';
import logoFull from '@/assets/logo-full.png';

const SIZES = {
  // responsive heights — scales down on phones, up on larger screens
  md: 'h-11 sm:h-12 md:h-14',
  lg: 'h-20 sm:h-24',
} as const;

/**
 * VediCosmic logo — the complete brand lockup (etched seeker, halo, cyan
 * wordmark, bindi and tagline) shown whole and uncropped, recoloured white for
 * the dark canvas and resting in a soft sun reflection. Fully responsive.
 */
export function Logo({
  size = 'md', className = '',
}: { size?: keyof typeof SIZES; className?: string; showWordmark?: boolean }) {
  return (
    <Link to="/" aria-label="VediCosmic — The Inner Journey" className={`group relative inline-flex items-center ${className}`}>
      {/* sun reflection — sits directly behind the figure's halo */}
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-[32%] aspect-square w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-md animate-breathe"
        style={{ background: 'radial-gradient(circle, rgba(255,196,70,0.55) 0%, rgba(255,138,0,0.20) 45%, transparent 72%)' }} />
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-[32%] aspect-square w-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(255,224,140,0.75) 0%, rgba(255,183,43,0.30) 55%, transparent 75%)' }} />
      <img
        src={logoFull}
        alt="VediCosmic — The Inner Journey"
        className={`relative w-auto object-contain transition-transform duration-700 group-hover:scale-[1.04] ${SIZES[size]}`}
      />
    </Link>
  );
}
