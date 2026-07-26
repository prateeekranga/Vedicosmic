import { FlowerOfLife } from '@/components/effects/FlowerOfLife';

/** Rituals & festivals' category emblem — reuses the site's Flower of Life motif. */
export function FlowerOfLifeEmblem({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <FlowerOfLife stroke="rgba(255,183,43,0.55)" />
    </div>
  );
}
