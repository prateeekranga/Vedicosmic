import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, RefreshCw } from 'lucide-react';
import { getBlogPost } from '@/data/blog';
import { getBlogCategory } from '@/data/blogCategories';
import { getAuthor } from '@/data/authors';
import { estimateReadingTime } from '@/lib/blogUtils';
import { useSEO } from '@/hooks/useSEO';
import { breadcrumbList, blogPostingSchema, faqPageSchema } from '@/lib/schema';
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { EditorialDisclaimer } from '@/components/blog/EditorialDisclaimer';
import { AdSlot } from '@/components/ads/AdSlot';
import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { visibleBlogPosts } from '@/lib/blogOverrides';
import type { BlogPost } from '@/types/blog.types';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = slug ? getBlogPost(slug) : undefined;

  useEffect(() => { if (!post) navigate('/blog', { replace: true }); }, [post, navigate]);

  const category = post ? getBlogCategory(post.category) : undefined;

  useSEO({
    key: `blog:${slug}`,
    path: `/blog/${slug}`,
    title: post ? (post.seoTitle ?? `${post.title} · VediCosmic`) : 'Blog · VediCosmic',
    description: post?.excerpt ?? '',
    image: post?.heroImage,
    type: 'article',
    jsonLd: post ? [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        ...(category ? [{ name: category.label, path: `/blog/category/${category.id}` }] : []),
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
      blogPostingSchema(post),
      ...(post.faqs?.length ? [faqPageSchema(post.faqs)] : []),
    ] : undefined,
  });

  if (!post) return null;

  return (
    <div className="container-vc pb-12 pt-20">
      <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/40">
        <Link to="/" className="hover:text-white/70">Home</Link><span>/</span>
        <Link to="/blog" className="hover:text-white/70">Blog</Link><span>/</span>
        {category && <><Link to={`/blog/category/${category.id}`} className="hover:text-white/70">{category.label}</Link><span>/</span></>}
        <span className="text-white/70">{post.title}</span>
      </div>

      <BlogPostBody post={post} />
    </div>
  );
}

function BlogPostBody({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);
  const author = post.authorId ? getAuthor(post.authorId) : undefined;
  const readingTime = post.readingTimeMin ?? estimateReadingTime(post.content);
  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const publishedDate = dateFmt(post.publishedAt);
  const updatedDate = post.updatedAt && post.updatedAt !== post.publishedAt ? dateFmt(post.updatedAt) : undefined;
  const more = visibleBlogPosts().filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {category && <Badge tone="gold">{category.label}</Badge>}
        {post.isFeatured && <Badge tone="neutral">Featured</Badge>}
      </div>
      <h1 className="font-display text-h1 text-white">{post.title}</h1>
      <p data-speakable className="mt-4 text-lg leading-relaxed text-white/70">{post.excerpt}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/45">
        {author && <span>{author.name}</span>}
        <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Published {publishedDate}</span>
        {updatedDate && <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Updated {updatedDate}</span>}
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {readingTime} min read</span>
      </div>

      <div className="mt-8">
        <AdSlot slot="blog-post-top" />
      </div>

      <div className="mt-8">
        <BlogContentRenderer blocks={post.content} />
      </div>

      <div className="mt-10">
        <AdSlot slot="blog-post-bottom" />
      </div>

      {author && post.authorId && (
        <div className="mt-10">
          <AuthorBio author={author} slug={post.authorId} />
        </div>
      )}

      <div className="mt-6">
        <EditorialDisclaimer />
      </div>

      {post.faqs && post.faqs.length > 0 && (
        <div className="mt-16">
          <SectionHeading eyebrow="Good to Know" title="Frequently Asked" center={false} />
          <div className="mt-8">
            <Accordion items={post.faqs} defaultOpen={post.faqs[0]?.id} />
          </div>
        </div>
      )}

      <div className="mt-16 flex items-center justify-between border-t border-white/8 pt-8">
        <Button variant="ghost" to="/blog"><ArrowLeft className="h-4 w-4" /> All articles</Button>
      </div>

      {more.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-heading text-h4 text-white">More on {category?.label ?? post.category}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {more.map((p) => <BlogPostCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}
