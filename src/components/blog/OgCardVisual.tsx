import { getBlogCategory } from '@/data/blogCategories';
import { CategoryEmblem } from '@/components/blog/CategoryEmblem';
import type { BlogCategoryId } from '@/types/blog.types';

/**
 * Bare 1200×630 hero card visual — shared by the /og/blog/:slug screenshot route
 * (scripts/generate-og-images.mjs) and the admin panel's client-side hero image
 * generator (src/lib/generateHeroImage.ts, via html-to-image).
 */
export function OgCardVisual({ title, category }: { title: string; category: BlogCategoryId }) {
  const cat = getBlogCategory(category);

  return (
    <div
      id="og-card"
      style={{ width: 1200, height: 630 }}
      className="relative overflow-hidden bg-cosmic-darker"
    >
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 120% 85% at 50% -10%, #17143c 0%, #0c0b22 45%, #050510 100%)' }} />
      <CategoryEmblem category={category} className="absolute inset-0 m-auto h-[560px] w-[560px] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-cosmic-darker via-cosmic-darker/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-16">
        {cat && (
          <span className="mb-4 inline-flex w-fit items-center rounded-full border border-gold-soft/40 bg-gold-bright/10 px-4 py-1.5 text-sm uppercase tracking-wide text-gold-pale">
            {cat.label}
          </span>
        )}
        <h1 className="max-w-[900px] font-display text-[56px] leading-[1.1] text-white">{title}</h1>
        <div className="mt-8 flex items-center gap-3">
          <img src="/wordmark-white.png" className="h-9" alt="" />
        </div>
      </div>
    </div>
  );
}
