import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost } from '@/data/blog';
import { getBlogCategory } from '@/data/blogCategories';
import { CategoryEmblem } from '@/components/blog/CategoryEmblem';

/**
 * Bare 1200×630 card screenshotted by scripts/generate-og-images.mjs — never linked or indexed
 * (robots.txt disallows /og/, and this route sits outside the real prerender pass). Sets its own
 * readiness flag rather than useSEO's, since useSEO would register it with the SEO/prerender machinery.
 */
export default function BlogOgCard() {
  const { slug } = useParams();
  const post = slug ? getBlogPost(slug) : undefined;

  useEffect(() => {
    (window as unknown as { __OG_CARD_READY__?: boolean }).__OG_CARD_READY__ = true;
  }, [post]);

  if (!post) return null;
  const category = getBlogCategory(post.category);

  return (
    <div
      id="og-card"
      style={{ width: 1200, height: 630 }}
      className="relative overflow-hidden bg-cosmic-darker"
    >
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 120% 85% at 50% -10%, #17143c 0%, #0c0b22 45%, #050510 100%)' }} />
      <CategoryEmblem category={post.category} className="absolute inset-0 m-auto h-[560px] w-[560px] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-cosmic-darker via-cosmic-darker/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-16">
        {category && (
          <span className="mb-4 inline-flex w-fit items-center rounded-full border border-gold-soft/40 bg-gold-bright/10 px-4 py-1.5 text-sm uppercase tracking-wide text-gold-pale">
            {category.label}
          </span>
        )}
        <h1 className="max-w-[900px] font-display text-[56px] leading-[1.1] text-white">{post.title}</h1>
        <div className="mt-8 flex items-center gap-3">
          <img src="/wordmark-white.png" className="h-9" alt="" />
        </div>
      </div>
    </div>
  );
}
