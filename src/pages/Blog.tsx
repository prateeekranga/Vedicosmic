import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { BLOG_CATEGORIES, getBlogCategory } from '@/data/blogCategories';
import { getAuthor } from '@/data/authors';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import { breadcrumbList } from '@/lib/schema';
import { estimateReadingTime } from '@/lib/blogUtils';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { CategoryEmblem } from '@/components/blog/CategoryEmblem';
import { AdSlot } from '@/components/ads/AdSlot';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { BlogPost } from '@/types/blog.types';

/** Editorial spotlight for the latest article — shown only on the unfiltered blog
 *  hub, so search/category/author views stay a plain, predictable grid. */
function SpotlightPost({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);
  const author = post.authorId ? getAuthor(post.authorId) : undefined;
  const readingTime = post.readingTimeMin ?? estimateReadingTime(post.content);
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Link to={`/blog/${post.slug}`}>
      <Card hover className="group grid overflow-hidden p-0 md:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden bg-cosmic-light md:aspect-auto">
          {post.heroImage && (
            <img
              src={post.heroImage} alt={post.title} loading="eager" decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
            />
          )}
          <CategoryEmblem category={post.category} className={`absolute inset-0 h-full w-full opacity-70 ${post.heroImage ? 'hidden' : ''}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-darker via-transparent to-transparent md:bg-gradient-to-r" />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">Latest Article</Badge>
            {category && <Badge>{category.label}</Badge>}
          </div>
          <h3 className="mt-4 font-heading text-h2 text-white group-hover:text-gold-pale">{post.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
            {author && <span>{author.name}</span>}
            {author && <span aria-hidden>·</span>}
            <span>{date}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {readingTime} min read</span>
          </div>
          <span className="mt-6 inline-flex items-center gap-1 text-sm text-brand-cyan-soft">
            Read article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

export default function Blog() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const ov = useOverridesVersion();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [searchParams, setSearchParams] = useSearchParams();
  const authorId = searchParams.get('author');
  const author = authorId ? getAuthor(authorId) : undefined;

  const category = categoryId ? getBlogCategory(categoryId) : undefined;
  useEffect(() => {
    if (categoryId && !category) navigate('/blog', { replace: true });
  }, [categoryId, category, navigate]);

  const { posts: allPosts, loading: postsLoading } = useAllBlogPosts();

  useSEO(
    categoryId && category
      ? {
          key: `blog-category:${categoryId}`,
          path: `/blog/category/${categoryId}`,
          title: `${category.label} Articles · VediCosmic Blog`,
          description: category.description,
          ready: !postsLoading,
          jsonLd: breadcrumbList([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: category.label, path: `/blog/category/${categoryId}` },
          ]),
        }
      : {
          key: '/blog',
          path: '/blog',
          title: 'Blog · VediCosmic — Vedic Astrology, Numerology & Spiritual Living',
          description: 'In-depth guides on numerology, Vedic astrology, energy healing, cosmology, rituals, and meditation — free to read, grounded in tradition.',
          ready: !postsLoading,
          jsonLd: breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
        },
  );

  const byCategory = useMemo(
    () => (categoryId ? allPosts.filter((p) => p.category === categoryId) : allPosts),
    [categoryId, allPosts, ov], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const byAuthor = useMemo(
    () => (authorId ? byCategory.filter((p) => p.authorId === authorId) : byCategory),
    [byCategory, authorId],
  );
  const filtered = useMemo(() => {
    const terms = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return byAuthor;
    return byAuthor.filter((p) => {
      const haystack = [p.title, p.excerpt, p.category, ...p.tags].join(' ').toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [byAuthor, deferredQuery]);

  // The spotlight only makes sense on the plain, unfiltered hub — surfacing the newest
  // post to read first, before the utility of search/category filtering takes over.
  const showSpotlight = !categoryId && !authorId && !query.trim();
  const spotlight = showSpotlight ? filtered[0] : undefined;
  const gridPosts = spotlight ? filtered.slice(1) : filtered;

  // Counts reflect the author filter (if any) but not the search box, so they read as a
  // stable overview of "how many articles live in each category" while typing.
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of byAuthor) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return counts;
  }, [byAuthor]);

  if (categoryId && !category) return null;

  return (
    <div className="container-vc py-16 sm:py-24">
      <SectionHeading
        eyebrow="The Blog"
        title={category ? <>{category.label} <span className="text-gradient-gold">articles</span></> : <>Guides for <span className="text-gradient-gold">the inner journey</span></>}
        subtitle={category ? category.description : 'In-depth, practical guides on numerology, Vedic astrology, energy healing, cosmology, rituals and meditation.'}
      />

      {author && (
        <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 rounded-full border border-white/10 bg-cosmic-light/40 px-5 py-2.5 text-sm text-white/60">
          <span>Showing articles by <span className="text-white">{author.name}</span></span>
          <button
            onClick={() => setSearchParams((prev) => { prev.delete('author'); return prev; })}
            className="inline-flex items-center gap-1 text-brand-cyan-soft hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      )}

      <div className="mx-auto mt-10 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search blog articles"
            className="w-full rounded-full border border-white/12 bg-cosmic-darker/60 py-3 pl-11 pr-11 text-white placeholder-white/30 transition-colors focus:border-brand-cyan focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {BLOG_CATEGORIES.map((c) => {
          const active = c.id === 'all' ? !categoryId : categoryId === c.id;
          const count = c.id === 'all' ? byAuthor.length : categoryCounts.get(c.id) ?? 0;
          return (
            <button key={c.id} onClick={() => navigate(c.id === 'all' ? '/blog' : `/blog/category/${c.id}`)}
              className={`relative inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm transition-all ${
                active ? 'border-gold-soft/60 text-gold-pale' : 'border-white/10 text-white/60 hover:border-white/30'
              }`}>
              {active && <motion.span layoutId="blog-cat" className="absolute inset-0 -z-10 rounded-full bg-gold-bright/10" />}
              {c.label}
              <span className={`text-xs ${active ? 'text-gold-soft/70' : 'text-white/35'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {spotlight && (
        <div className="mx-auto mt-12 max-w-5xl">
          <SpotlightPost post={spotlight} />
        </div>
      )}

      <div className="mx-auto mt-10 max-w-3xl">
        <AdSlot slot="blog-hub" />
      </div>

      {gridPosts.length > 0 ? (
        <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {gridPosts.map((post, i) => (
              <motion.div key={post.id} layout
                initial={{ opacity: 0, scale: 0.95, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.05, 0.4) }}>
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : !spotlight ? (
        <div className="mt-16 text-center">
          <p className="text-white/50">{query ? <>No articles match “{query}”.</> : 'No articles in this category yet.'}</p>
          <div className="mt-4 flex justify-center gap-4">
            {query && <button onClick={() => setQuery('')} className="text-sm text-brand-cyan-soft hover:underline">Clear search</button>}
            {categoryId && <Link to="/blog" className="text-sm text-brand-cyan-soft hover:underline">View all posts</Link>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
