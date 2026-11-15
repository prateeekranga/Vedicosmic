import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useBlogPost } from '@/hooks/useBlogPost';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import { getBlogCategory } from '@/data/blogCategories';
import { getPerson } from '@/content/people';
import { getTool } from '@/content/routes';
import { estimateReadingTime } from '@/lib/blogUtils';
import { useSEO } from '@/hooks/useSEO';
import { breadcrumbList, blogPostingSchema, faqPageSchema, howToSchema } from '@/lib/schema';
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { BlogHero } from '@/components/blog/BlogHero';
import { KeyTakeaways } from '@/components/blog/KeyTakeaways';
import { TableOfContents, tocEntries } from '@/components/blog/TableOfContents';
import { OnThisPage, type OnThisPageItem } from '@/components/ui/OnThisPage';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { EditorialDisclaimer } from '@/components/blog/EditorialDisclaimer';
import { ShareBar } from '@/components/ShareBar';
import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SITE_URL } from '@/config/site';
import type { BlogPost } from '@/types/blog.types';
import { enter } from '@/lib/hydration';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, loading, notFound } = useBlogPost(slug);

  useEffect(() => { if (notFound) navigate('/blog', { replace: true }); }, [notFound, navigate]);

  const category = post ? getBlogCategory(post.category) : undefined;

  useSEO({
    key: `blog:${slug}`,
    path: `/blog/${slug}`,
    title: post ? (post.seoTitle ?? `${post.title} · VediCosmic`) : 'Blog · VediCosmic',
    description: post?.excerpt ?? '',
    type: 'article',
    ready: !loading,
    jsonLd: post ? [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        ...(category ? [{ name: category.label, path: `/blog/category/${category.id}` }] : []),
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
      blogPostingSchema(post),
      ...(post.howToSteps?.length ? [howToSchema(post)] : []),
      ...(post.faqs?.length ? [faqPageSchema(post.faqs)] : []),
    ] : undefined,
  });

  if (loading || !post) return null;

  return (
    <div className="container-vc pb-12 pt-20 sm:pb-16 sm:pt-24">
      <ScrollProgress />
      <BlogPostBody post={post} />
    </div>
  );
}

/** In the side column the headings become small labels, like the article menu's. */
const SIDE_H2 = 'font-heading text-h4 text-white xl:font-body xl:text-xs xl:font-semibold xl:uppercase xl:tracking-[0.2em] xl:text-gold-soft/80';

function BlogPostBody({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);
  const author = getPerson(post.authorId);
  const readingTime = post.readingTimeMin ?? estimateReadingTime(post.content);
  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const publishedDate = dateFmt(post.publishedAt);
  const updatedDate = post.updatedAt && post.updatedAt !== post.publishedAt ? dateFmt(post.updatedAt) : undefined;
  const { posts: allPosts } = useAllBlogPosts();
  const more = allPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);
  const toc = tocEntries(post.content);
  const menu: OnThisPageItem[] = [
    ...toc.map((e) => ({ id: e.id, label: e.text, level: e.level })),
    ...(post.faqs && post.faqs.length > 0 ? [{ id: 'faq', label: 'Frequently asked' }] : []),
  ];

  const shareUrl = `${SITE_URL}/blog/${post.slug}`;

  return (
    // Wide screens: the article's headings to its left, related tools and articles to its right.
    <div className="xl:grid xl:grid-cols-[12rem_minmax(0,1fr)_18rem] xl:items-start xl:gap-10 2xl:grid-cols-[14rem_minmax(0,1fr)_21rem] 2xl:gap-14">
      <div className="hidden xl:block xl:self-stretch">
        {toc.length > 0 && <OnThisPage items={menu} label="In this article" className="side-sticky xl:pt-12" />}
      </div>

      <motion.div initial={enter({ opacity: 0, y: 16 })} animate={{ opacity: 1, y: 0 }} className="mx-auto min-w-0 max-w-3xl xl:mx-0 xl:max-w-none">
        <div className="mb-6 flex items-center gap-x-2 text-sm text-white/40">
          <Link to="/" className="shrink-0 hover:text-white/70">Home</Link><span className="shrink-0">/</span>
          <Link to="/blog" className="shrink-0 hover:text-white/70">Blog</Link><span className="shrink-0">/</span>
          {category && <><Link to={`/blog/category/${category.id}`} className="shrink-0 hover:text-white/70">{category.label}</Link><span className="shrink-0">/</span></>}
          <span className="min-w-0 flex-1 truncate text-white/70">{post.title}</span>
        </div>

        <BlogHero category={post.category} heroImage={post.heroImage} title={post.title} />
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {category && <Badge tone="gold">{category.label}</Badge>}
          {post.isFeatured && <Badge tone="neutral">Featured</Badge>}
        </div>
        <h1 className="font-display text-h1 text-white">{post.title}</h1>
        <p data-speakable className="mt-4 text-lg leading-relaxed text-white/70">{post.excerpt}</p>
        {post.keyTakeaways && post.keyTakeaways.length > 0 && <KeyTakeaways items={post.keyTakeaways} />}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/45">
            {author && <span>{author.name}</span>}
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Published {publishedDate}</span>
            {updatedDate && <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Updated {updatedDate}</span>}
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {readingTime} min read</span>
          </div>
          <ShareBar url={shareUrl} title={post.title} text={post.excerpt} />
        </div>

        {/* On wide screens the same list is the side menu instead. */}
        <div className="mt-8 sm:mt-10 xl:hidden">
          <TableOfContents blocks={post.content} />
        </div>

        <div className="mt-8 sm:mt-10">
          <BlogContentRenderer blocks={post.content} />
        </div>

        {author && (
          <div className="mt-8 sm:mt-10">
            <AuthorBio person={author} />
          </div>
        )}

        <div className="mt-8 sm:mt-10 flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/60">Found this useful? Share it with someone who'd enjoy it.</p>
          <ShareBar url={shareUrl} title={post.title} text={post.excerpt} />
        </div>

        <div className="mt-8 sm:mt-10">
          <EditorialDisclaimer />
        </div>

        {post.faqs && post.faqs.length > 0 && (
          <div id="faq" className="mt-12 scroll-mt-24 sm:mt-16">
            <SectionHeading eyebrow="Good to Know" title="Frequently Asked" center={false} />
            <div className="mt-8">
              <Accordion items={post.faqs} defaultOpen={post.faqs[0]?.id} />
            </div>
          </div>
        )}
      </motion.div>

      <div className="mx-auto max-w-3xl xl:mx-0 xl:max-w-none xl:self-stretch">
        <div className="side-sticky xl:pt-12">
          <RelatedTools slugs={post.relatedToolSlugs ?? []} />

          {more.length > 0 && (
            <section className="mt-12 sm:mt-16 xl:mt-10 xl:first:mt-0">
              <h2 className={`mb-6 xl:mb-3 ${SIDE_H2}`}>More on {category?.label ?? post.category}</h2>
              <div className="grid gap-6 sm:grid-cols-2 xl:hidden">
                {more.map((p) => <BlogPostCard key={p.id} post={p} />)}
              </div>
              <ul className="hidden space-y-2 xl:block">
                {more.map((p) => (
                  <li key={p.id}>
                    <Link to={`/blog/${p.slug}`} className="group block rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-white/25">
                      <span className="block text-sm leading-snug text-white/80 group-hover:text-gold-pale">{p.title}</span>
                      <span className="mt-1 block text-xs text-white/60">{p.readingTimeMin ?? estimateReadingTime(p.content)} min read</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-white/8 pt-8 sm:mt-16 xl:mt-8 xl:pt-6">
            <Button variant="ghost" to="/blog"><ArrowLeft className="h-4 w-4" /> All articles</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The tools an article is about, as plain links. Coming-soon tools are left out. */
function RelatedTools({ slugs }: { slugs: string[] }) {
  const tools = slugs.flatMap((slug) => {
    const tool = getTool(slug);
    return tool && tool.status === 'live' ? [tool] : [];
  });
  if (!tools.length) return null;
  return (
    <section className="mt-12 sm:mt-16 xl:mt-0">
      <h2 className={`mb-5 xl:mb-3 ${SIDE_H2}`}>Tools for this article</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:gap-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link to={`/tools/${t.slug}`} className="group block h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/25 xl:p-3">
              <span className="block font-heading text-base text-white group-hover:text-gold-pale xl:text-sm">{t.name}</span>
              <span className="mt-1 block text-xs leading-snug text-white/60">{t.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
