import { CategoryEmblem } from '@/components/blog/CategoryEmblem';
import type { BlogCategoryId } from '@/types/blog.types';

/** Live, per-post hero banner — communicates this specific post's category at a glance,
 *  unlike the global CosmicBackground, which is faint and identical on every page. */
export function BlogHero({ category }: { category: BlogCategoryId }) {
  return (
    <div className="relative mb-8 h-40 overflow-hidden rounded-3xl border border-white/10 sm:h-56">
      <CategoryEmblem category={category} className="absolute inset-0 m-auto h-full w-full opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-cosmic-darker via-transparent to-transparent" />
    </div>
  );
}
