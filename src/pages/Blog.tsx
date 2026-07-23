import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { BLOG_CATEGORIES, getBlogCategory } from '@/data/blogCategories';
import { getAuthor } from '@/data/authors';
import { visibleBlogPosts } from '@/lib/blogOverrides';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import { breadcrumbList } from '@/lib/schema';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { SectionHeading } from '@/components/ui/SectionHeading';

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

  useSEO(
    categoryId && category
      ? {
          key: `blog-category:${categoryId}`,
          path: `/blog/category/${categoryId}`,
          title: `${category.label} Articles · VediCosmic Blog`,
          description: category.description,
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
          jsonLd: breadcrumbList([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
        },
  );

  const allPosts = visibleBlogPosts();
  const byCategory = useMemo(
    () => (categoryId ? allPosts.filter((p) => p.category === categoryId) : allPosts),
    [categoryId, ov], // eslint-disable-line react-hooks/exhaustive-deps
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
          return (
            <button key={c.id} onClick={() => navigate(c.id === 'all' ? '/blog' : `/blog/category/${c.id}`)}
              className={`relative rounded-full border px-5 py-2 text-sm transition-all ${
                active ? 'border-gold-soft/60 text-gold-pale' : 'border-white/10 text-white/60 hover:border-white/30'
              }`}>
              {active && <motion.span layoutId="blog-cat" className="absolute inset-0 -z-10 rounded-full bg-gold-bright/10" />}
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <AdSlot slot="blog-hub" />
      </div>

      {filtered.length > 0 ? (
        <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <motion.div key={post.id} layout
                initial={{ opacity: 0, scale: 0.95, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.05, 0.4) }}>
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-white/50">{query ? <>No articles match “{query}”.</> : 'No articles in this category yet.'}</p>
          <div className="mt-4 flex justify-center gap-4">
            {query && <button onClick={() => setQuery('')} className="text-sm text-brand-cyan-soft hover:underline">Clear search</button>}
            {categoryId && <Link to="/blog" className="text-sm text-brand-cyan-soft hover:underline">View all posts</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
