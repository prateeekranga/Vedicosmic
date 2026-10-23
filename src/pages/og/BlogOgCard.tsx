import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost } from '@/data/blog';
import { OgCardVisual } from '@/components/blog/OgCardVisual';

/**
 * Bare 1200×630 card screenshotted by scripts/generate-og-images.mjs — never linked, and marked
 * noindex here (robots.txt must stay open for /og/ so crawlers can fetch the generated images).
 * Sets its own readiness flag rather than useSEO's, since useSEO would register it with the
 * SEO/prerender machinery.
 */
export default function BlogOgCard() {
  const { slug } = useParams();
  const post = slug ? getBlogPost(slug) : undefined;

  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => { robots.remove(); };
  }, []);

  useEffect(() => {
    (window as unknown as { __OG_CARD_READY__?: boolean }).__OG_CARD_READY__ = true;
  }, [post]);

  if (!post) return null;

  return <OgCardVisual title={post.title} category={post.category} />;
}
