import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTool, liveTools, TOOL_CATEGORIES, TOOL_ACCENT_BG } from '@/content/routes';
import { TOOL_COMPONENTS } from '@/tools/registry';
import { getToolFaqs } from '@/data/toolFaqs';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
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
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { useSEO } from '@/hooks/useSEO';
import { breadcrumbList, faqPageSchema, softwareApplicationSchema, getToolExtraJsonLd } from '@/lib/schema';
import type { ToolMeta } from '@/types/tool.types';
import type { FAQItem } from '@/types/content.types';
import type { BlogPost } from '@/types/blog.types';

// These four tools each build their own independent AudioContext graph, completely outside
// ChakraPlayerEngine/Ambient. chakra-frequency-player is also self-managed but is excluded
// from the ambient-ducking list separately below, since it's not one of the 4 collision risks.
const SELF_MANAGED_AUDIO_SLUGS = ['tratak', 'kundalini', 'soundbath', 'puja-aarti'] as const;
const AMBIENT_EXCLUDED_SLUGS = [...SELF_MANAGED_AUDIO_SLUGS, 'chakra-frequency-player'] as const;

export default function ToolPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { enterTool, exitTool } = useSound();
  const { pauseIfPlaying } = useChakraPlayer();
  const tool = slug ? getTool(slug) : undefined;

  useEffect(() => { if (!tool) navigate('/tools', { replace: true }); }, [tool, navigate]);

  // each tool gets its own soundscape; some tools manage their own audio internally
  useEffect(() => {
    if (tool && !(AMBIENT_EXCLUDED_SLUGS as readonly string[]).includes(tool.slug)) {
      enterTool(tool.category, tool.id);
      return () => exitTool();
    }
  }, [tool?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // The chakra player now persists across the whole site (docked mini player), so visiting
  // one of the 4 other self-managed-audio tools risks two independent AudioContexts running
  // at once — a collision that couldn't happen while the chakra player was page-scoped.
  useEffect(() => {
    if (tool && (SELF_MANAGED_AUDIO_SLUGS as readonly string[]).includes(tool.slug)) pauseIfPlaying();
  }, [tool?.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const { posts: allPosts, loading: postsLoading } = useAllBlogPosts();

  useSEO({
    key: `tool:${slug}`,
    path: `/tools/${slug}`,
    title: tool ? (tool.seoTitle ?? `${tool.name} · VediCosmic`) : 'Tool · VediCosmic',
    description: tool?.description ?? '',
    ready: !postsLoading,
    noindex: tool ? !tool.indexable : false,
    jsonLd: tool ? [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Tools', path: '/tools' },
        { name: tool.name, path: `/tools/${tool.slug}` },
      ]),
      // Only working tools are described as software applications.
      ...(tool.status === 'live' ? [softwareApplicationSchema(tool), ...getToolExtraJsonLd(tool)] : []),
      faqPageSchema(getToolFaqs(tool.id)),
    ] : undefined,
  });

  if (!tool) return null;

  const faqs = getToolFaqs(tool.id);
  const relatedPosts = allPosts.filter((p) => p.relatedToolSlugs?.includes(tool.slug));
  const relatedTools = liveTools().filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 4);

  return (
    <div className="container-vc pb-12 pt-20">
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/40">
        <Link to="/" className="hover:text-white/70">Home</Link><span>/</span>
        <Link to="/tools" className="hover:text-white/70">Tools</Link><span>/</span>
        <span className="text-white/70">{tool.name}</span>
      </div>

      {/* keyed by slug so a stale result's share text can't leak into the next tool navigated to */}
      <ShareResultProvider key={tool.slug}>
        <ToolBody tool={tool} faqs={faqs} relatedPosts={relatedPosts} relatedTools={relatedTools} />
      </ShareResultProvider>
    </div>
  );
}

function ToolBody({
  tool, faqs, relatedPosts, relatedTools,
}: { tool: ToolMeta; faqs: FAQItem[]; relatedPosts: BlogPost[]; relatedTools: ToolMeta[] }) {
  const Tool = TOOL_COMPONENTS[tool.slug];
  const shareText = useShareText();
  const url = window.location.href;
  const title = `${tool.name} · VediCosmic`;
  const comingSoon = tool.status === 'coming-soon';

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
          blurb="This tool is being rebuilt and checked against reference charts before it goes live. The rest of the tools are free to use in the meantime." />
      ) : (
        // The h2 keeps heading levels in order: the page h1 above, the tools' own h3 sections below.
        <section aria-labelledby="tool-heading">
          <h2 id="tool-heading" className="sr-only">{tool.name}</h2>
          <Tool />
        </section>
      )}

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
    </>
  );
}
