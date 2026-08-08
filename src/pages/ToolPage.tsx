import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { getTool, TOOL_CATEGORIES, TOOL_ACCENT_BG } from '@/data/tools';
import { getCourse } from '@/data/courses';
import { getToolFaqs } from '@/data/toolFaqs';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import { isToolComingSoon, visibleTools } from '@/lib/overrides';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Accordion } from '@/components/ui/Accordion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import { ShareBar } from '@/components/ShareBar';
import { ShareResultProvider, useShareText } from '@/contexts/ShareContext';
import { useSound } from '@/contexts/SoundContext';
import { useSEO } from '@/hooks/useSEO';
import { breadcrumbList, faqPageSchema, softwareApplicationSchema } from '@/lib/schema';
import type { ToolMeta } from '@/types/tool.types';
import type { Course } from '@/types/course.types';
import type { FAQItem } from '@/types/content.types';
import type { BlogPost } from '@/types/blog.types';

export default function ToolPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { enterTool, exitTool } = useSound();
  const tool = slug ? getTool(slug) : undefined;

  useEffect(() => { if (!tool) navigate('/tools', { replace: true }); }, [tool, navigate]);

  // each tool gets its own soundscape; some tools manage their own audio internally
  useEffect(() => {
    if (tool && !['tratak', 'kundalini', 'soundbath', 'puja-aarti'].includes(tool.slug)) {
      enterTool(tool.category, tool.id);
      return () => exitTool();
    }
  }, [tool?.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const { posts: allPosts, loading: postsLoading } = useAllBlogPosts();

  useSEO({
    key: `tool:${slug}`,
    path: `/tools/${slug}`,
    title: tool ? (tool.seoTitle ?? `${tool.name} · VediCosmic`) : 'Tool · VediCosmic',
    description: tool?.description ?? '',
    ready: !postsLoading,
    jsonLd: tool ? [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Tools', path: '/tools' },
        { name: tool.name, path: `/tools/${tool.slug}` },
      ]),
      softwareApplicationSchema(tool),
      faqPageSchema(getToolFaqs(tool.id)),
    ] : undefined,
  });

  if (!tool) return null;

  const course = tool.relatedCourseSlug ? getCourse(tool.relatedCourseSlug) : undefined;
  const faqs = getToolFaqs(tool.id);
  const relatedPosts = allPosts.filter((p) => p.relatedToolSlugs?.includes(tool.slug));
  const relatedTools = visibleTools().filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 4);

  return (
    <div className="container-vc pb-12 pt-20">
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/40">
        <Link to="/" className="hover:text-white/70">Home</Link><span>/</span>
        <Link to="/tools" className="hover:text-white/70">Tools</Link><span>/</span>
        <span className="text-white/70">{tool.name}</span>
      </div>

      {/* keyed by slug so a stale result's share text can't leak into the next tool navigated to */}
      <ShareResultProvider key={tool.slug}>
        <ToolBody tool={tool} course={course} faqs={faqs} relatedPosts={relatedPosts} relatedTools={relatedTools} />
      </ShareResultProvider>
    </div>
  );
}

function ToolBody({
  tool, course, faqs, relatedPosts, relatedTools,
}: { tool: ToolMeta; course: Course | undefined; faqs: FAQItem[]; relatedPosts: BlogPost[]; relatedTools: ToolMeta[] }) {
  const Tool = tool.Component;
  const shareText = useShareText();
  const url = window.location.href;
  const title = `${tool.name} · VediCosmic`;
  useOverridesVersion();
  const comingSoon = isToolComingSoon(tool.id);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${TOOL_ACCENT_BG[tool.accent]}`}>
              <tool.Icon className="h-6 w-6" />
            </span>
            {comingSoon ? <Badge tone="gold">Coming Soon</Badge> : tool.isNew && <Badge tone="cyan">New</Badge>}
          </div>
          <h1 className="font-display text-h1 text-white">{tool.name}</h1>
          <p className="mt-2 text-body text-white/60">{tool.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <ShareBar url={url} title={title} text={shareText ?? `Check out the ${tool.name} on VediCosmic — free Vedic tools`} />
          <Button variant="ghost" to="/tools"><ArrowLeft className="h-4 w-4" /> All tools</Button>
        </div>
      </motion.div>

      {comingSoon ? (
        <ComingSoon title={`${tool.name} is on its way`}
          blurb="We're polishing this tool before it goes live. Check back soon — or explore the rest of our free Vedic tools in the meantime." />
      ) : <Tool />}

      <div className="mx-auto mt-16 max-w-3xl">
        <SectionHeading eyebrow="Good to Know" title="Frequently Asked" />
        <div className="mt-8">
          <Accordion items={faqs} defaultOpen={faqs[0]?.id} />
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl">
          <SectionHeading eyebrow="Learn More" title="From the Blog" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {relatedPosts.slice(0, 4).map((p) => <BlogPostCard key={p.id} post={p} />)}
          </div>
        </div>
      )}

      {relatedTools.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl">
          <SectionHeading eyebrow="Keep Exploring" title={`More ${TOOL_CATEGORIES.find((c) => c.id === tool.category)?.label ?? ''} tools`} center={false} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {relatedTools.map((t) => (
              <Link key={t.id} to={`/tools/${t.slug}`}>
                <Card hover accent={t.accent} className="group flex items-center gap-4 p-5">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TOOL_ACCENT_BG[t.accent]}`}>
                    <t.Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-base text-white group-hover:text-gold-pale">{t.name}</span>
                    <span className="block truncate text-xs text-white/45">{t.subtitle}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-brand-cyan-soft" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {course && (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass mt-16 flex flex-col items-start gap-4 rounded-2xl p-7 sm:flex-row sm:items-center">
          <GraduationCap className="h-8 w-8 shrink-0 text-gold-soft" />
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-white/40">Go deeper</div>
            <div className="font-heading text-lg text-white">{course.title}</div>
            <p className="text-sm text-white/55">{course.subtitle}</p>
          </div>
          <Button to={`/courses/${course.slug}`} variant="outline">Explore course</Button>
        </motion.div>
      )}
    </>
  );
}
