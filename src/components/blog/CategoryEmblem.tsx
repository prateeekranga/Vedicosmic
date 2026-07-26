import { LoshuGridEmblem } from '@/components/blog/emblems/LoshuGridEmblem';
import { NakshatraWheelEmblem } from '@/components/blog/emblems/NakshatraWheelEmblem';
import { ChakraColumnEmblem } from '@/components/blog/emblems/ChakraColumnEmblem';
import { OrbitalRingsEmblem } from '@/components/blog/emblems/OrbitalRingsEmblem';
import { SriYantraEmblem } from '@/components/blog/emblems/SriYantraEmblem';
import { FlowerOfLifeEmblem } from '@/components/blog/emblems/FlowerOfLifeEmblem';
import { BreathRingsEmblem } from '@/components/blog/emblems/BreathRingsEmblem';
import type { BlogCategoryId } from '@/types/blog.types';

/** Single source of truth for each blog category's SVG visual identity — reused by the
 *  build-time OG card, the live in-page hero banner, and in-body diagrams. */
export function CategoryEmblem({ category, className = '' }: { category: BlogCategoryId; className?: string }) {
  switch (category) {
    case 'numerology': return <LoshuGridEmblem className={className} />;
    case 'astrology': return <NakshatraWheelEmblem className={className} />;
    case 'energy': return <ChakraColumnEmblem className={className} />;
    case 'cosmology': return <OrbitalRingsEmblem className={className} />;
    case 'spiritual-living': return <SriYantraEmblem className={className} />;
    case 'rituals-festivals': return <FlowerOfLifeEmblem className={className} />;
    case 'meditation-yoga': return <BreathRingsEmblem className={className} />;
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}
