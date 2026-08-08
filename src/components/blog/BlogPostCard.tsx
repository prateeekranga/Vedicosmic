import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CategoryEmblem } from '@/components/blog/CategoryEmblem';
import { estimateReadingTime } from '@/lib/blogUtils';
import { getBlogCategory } from '@/data/blogCategories';
import { getAuthor } from '@/data/authors';
import type { BlogPost, BlogCategoryId } from '@/types/blog.types';

const CATEGORY_ACCENT: Record<BlogCategoryId, 'gold' | 'cyan' | 'violet' | 'teal'> = {
  numerology: 'gold', astrology: 'cyan', energy: 'violet', cosmology: 'teal',
  'spiritual-living': 'gold', 'rituals-festivals': 'cyan', 'meditation-yoga': 'violet',
};

/** Post thumbnail — the real photo/OG art when set, falling back to the category's
 *  SVG emblem (same asset BlogHero uses) so a card is never a bare gradient. Swapping
 *  fallbacks on image error, not on load, keeps the emblem hidden in the common case. */
function CardThumb({ post }: { post: BlogPost }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-cosmic-light">
      {post.heroImage && (
        <img
          src={post.heroImage}
          // No dedicated hero-image alt field exists yet — the post title is a reasonable,
          // always-present description of what the image represents.
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      )}
      <CategoryEmblem category={post.category} className={`absolute inset-0 h-full w-full opacity-70 ${post.heroImage ? 'hidden' : ''}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-cosmic-darker via-cosmic-darker/5 to-transparent" />
    </div>
  );
}

export function BlogPostCard({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);
  const author = post.authorId ? getAuthor(post.authorId) : undefined;
  const readingTime = post.readingTimeMin ?? estimateReadingTime(post.content);
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link to={`/blog/${post.slug}`}>
      <Card hover className="group flex h-full flex-col overflow-hidden p-0">
        <CardThumb post={post} />
        <div className="flex flex-1 flex-col p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={CATEGORY_ACCENT[post.category]}>{category?.label ?? post.category}</Badge>
            {post.isFeatured && <Badge tone="neutral">Featured</Badge>}
          </div>
          <h3 className="mt-4 font-heading text-h4 text-white group-hover:text-gold-pale">{post.title}</h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/40">
            {author && <span>{author.name}</span>}
            {author && <span aria-hidden>·</span>}
            <span>{date}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {readingTime} min read</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
