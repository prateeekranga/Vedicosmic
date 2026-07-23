import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { estimateReadingTime } from '@/lib/blogUtils';
import { getBlogCategory } from '@/data/blogCategories';
import type { BlogPost, BlogCategoryId } from '@/types/blog.types';

const CATEGORY_ACCENT: Record<BlogCategoryId, 'gold' | 'cyan' | 'violet' | 'teal'> = {
  numerology: 'gold', astrology: 'cyan', energy: 'violet', cosmology: 'teal',
  'spiritual-living': 'gold', 'rituals-festivals': 'cyan', 'meditation-yoga': 'violet',
};

export function BlogPostCard({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);
  const readingTime = post.readingTimeMin ?? estimateReadingTime(post.content);
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link to={`/blog/${post.slug}`}>
      <Card hover className="group flex h-full flex-col p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={CATEGORY_ACCENT[post.category]}>{category?.label ?? post.category}</Badge>
          {post.isFeatured && <Badge tone="neutral">Featured</Badge>}
        </div>
        <h3 className="mt-5 font-heading text-h4 text-white group-hover:text-gold-pale">{post.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/40">
          {post.author && <span>{post.author.name}</span>}
          {post.author && <span aria-hidden>·</span>}
          <span>{date}</span>
          <span aria-hidden>·</span>
          <span>{readingTime} min read</span>
        </div>
      </Card>
    </Link>
  );
}
