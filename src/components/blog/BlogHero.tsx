import { motion } from 'framer-motion';
import { useState } from 'react';
import { CategoryEmblem } from '@/components/blog/CategoryEmblem';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { BlogCategoryId } from '@/types/blog.types';

/** Live, per-post hero banner. Uses the post's own photo/OG art when set — a slow Ken
 *  Burns drift gives it life — falling back to the category's SVG emblem (the old
 *  behaviour) when no image exists or it fails to load, so this never renders blank. */
export function BlogHero({ category, heroImage, title }: { category: BlogCategoryId; heroImage?: string; title: string }) {
  const reduced = usePrefersReducedMotion();
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!heroImage && !imgFailed;

  return (
    <div className="relative mb-8 h-52 overflow-hidden rounded-3xl border border-white/10 sm:h-80">
      {showImage ? (
        <motion.img
          src={heroImage}
          // There's no dedicated hero-image alt-text field (yet) — the post title is a
          // reasonable, always-present description of what the image represents.
          alt={title}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1 }}
          animate={reduced ? undefined : { scale: 1.08 }}
          transition={{ duration: 20, ease: 'easeOut' }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <CategoryEmblem category={category} className="absolute inset-0 m-auto h-full w-full opacity-70" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-cosmic-darker via-cosmic-darker/10 to-transparent" />
    </div>
  );
}
