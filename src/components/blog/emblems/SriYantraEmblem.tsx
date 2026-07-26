import { SriYantra } from '@/components/effects/SriYantra';

/** Spiritual-living's category emblem — reuses the site's signature Sri Yantra mandala. */
export function SriYantraEmblem({ className = '' }: { className?: string }) {
  return <SriYantra className={className} stroke="#E6B84A" />;
}
