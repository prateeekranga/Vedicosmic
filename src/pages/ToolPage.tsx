import { Suspense, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTool, liveTools, TOOL_ACCENT_BG } from '@/content/routes';
import { getToolContent } from '@/content/toolContent';
import { getToolHub } from '@/content/toolHubs';
import { guidesFor } from '@/content/toolGuides';
import { TOOL_COMPONENTS, preloadTool } from '@/tools/registry';
import { getToolFaqs } from '@/data/toolFaqs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Accordion } from '@/components/ui/Accordion';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { ResultNote } from '@/components/ui/ResultNote';
import { ShareBar } from '@/components/ShareBar';
import { ShareResultProvider, useShareText } from '@/contexts/ShareContext';
import { useSound } from '@/contexts/SoundContext';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { useSEO } from '@/hooks/useSEO';
import { SITE_URL } from '@/config/site';
import { toolPageDescription, toolPageJsonLd, toolPageTitle } from '@/lib/schema';
import { trackEvent } from '@/lib/analytics';
import { formatLongDate } from '@/lib/format';
import type { ToolContent, ToolFrame, ToolMeta } from '@/types/tool.types';
import type { FAQItem } from '@/types/content.types';
import { enter, useHydrated } from '@/lib/hydration';
import NotFound from '@/pages/NotFound';

// These four tools each build their own independent AudioContext graph, completely outside
// ChakraPlayerEngine/Ambient. chakra-frequency-player is also self-managed but is excluded
// from the ambient-ducking list separately below, since it's not one of the 4 collision risks.
const SELF_MANAGED_AUDIO_SLUGS = ['tratak', 'kundalini', 'soundbath', 'puja-aarti'] as const;
const AMBIENT_EXCLUDED_SLUGS = [...SELF_MANAGED_AUDIO_SLUGS, 'chakra-frequency-player'] as const;

/** Space kept for the tool from the first paint, so the sections under it never jump. */
const FRAME_CLASS: Record<ToolFrame, string> = {
  compact: 'min-h-[22rem]',
  standard: 'min-h-[32rem]',
  tall: 'min-h-[44rem]',
};

/** The trail shown on the page and described in its structured data. */
export function toolCrumbs(tool: ToolMeta): Crumb[] {
  const hub = getToolHub(tool.category);
  return [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    ...(hub ? [{ name: hub.label, path: hub.path }] : []),
    { name: tool.name, path: `/tools/${tool.slug}` },
  ];
}

/**
 * Related tools for a page without curated ones yet: the next four in its category, wrapping
 * round, so every tool is linked from its neighbours instead of only the first few being linked.
 */
function neighbours(tool: ToolMeta): ToolMeta[] {
  const group = liveTools().filter((t) => t.category === tool.category);
  const i = group.findIndex((t) => t.slug === tool.slug);
  if (i < 0) return group.slice(0, 4);
  return [...group.slice(i + 1), ...group.slice(0, i)].slice(0, 4);
}

/** The questions shown (and marked up) on a tool page. */
export function toolFaqs(tool: ToolMeta, content: ToolContent | undefined): FAQItem[] {
  return content ? content.faq.items : getToolFaqs(tool.id);
}

export default function ToolPage() {
  const { slug } = useParams();
  const tool = slug ? getTool(slug) : undefined;
  // An unknown tool is a missing page: show the 404 page and keep the address as it is.
  if (!tool) return <NotFound />;
  return <ToolPageInner key={tool.slug} tool={tool} />;
}

function ToolPageInner({ tool }: { tool: ToolMeta }) {
  const { enterTool, exitTool } = useSound();
  const { pauseIfPlaying } = useChakraPlayer();
  const content = getToolContent(tool.slug);
  const crumbs = toolCrumbs(tool);
  const faqs = toolFaqs(tool, content);

  // each tool gets its own soundscape; some tools manage their own audio internally
  useEffect(() => {
    if (!(AMBIENT_EXCLUDED_SLUGS as readonly string[]).includes(tool.slug)) {
      enterTool(tool.category, tool.id);
      return () => exitTool();
    }
  }, [tool.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // The chakra player now persists across the whole site (docked mini player), so visiting
  // one of the 4 other self-managed-audio tools risks two independent AudioContexts running
  // at once — a collision that couldn't happen while the chakra player was page-scoped.
  useEffect(() => {
    if ((SELF_MANAGED_AUDIO_SLUGS as readonly string[]).includes(tool.slug)) pauseIfPlaying();
  }, [tool.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useSEO({
    key: `tool:${tool.slug}`,
    path: `/tools/${tool.slug}`,
    title: toolPageTitle(tool),
    description: toolPageDescription(tool),
    noindex: !tool.indexable,
    jsonLd: toolPageJsonLd(tool, content, crumbs, faqs),
  });

  return (
    <div className="container-vc pb-12 pt-20">
      <Breadcrumbs items={crumbs} className="mb-6" />
      {/* keyed by slug so a stale result's share text can't leak into the next tool navigated to */}
      <ShareResultProvider key={tool.slug}>
        <ToolBody tool={tool} content={content} faqs={faqs} />
      </ShareResultProvider>
    </div>
  );
}

const SECTION = 'mx-auto mt-16 max-w-3xl';
const H2 = 'font-heading text-h3 text-white';
const PROSE = 'text-body leading-relaxed text-white/70';

function ToolBody({ tool, content, faqs }: { tool: ToolMeta; content: ToolContent | undefined; faqs: FAQItem[] }) {
  const Tool = TOOL_COMPONENTS[tool.slug];
  const hydrated = useHydrated();
  const shareText = useShareText();
  const url = `${SITE_URL}/tools/${tool.slug}`;
  const title = `${tool.name} · VediCosmic`;
  const comingSoon = tool.status === 'coming-soon';
  const hub = getToolHub(tool.category);
  const heading = tool.h1 ?? tool.name;
  const frame = FRAME_CLASS[content?.frame ?? 'standard'];
  const guides = guidesFor(tool.slug);

  // Start fetching the tool's code as soon as this page's own code runs.
  if (typeof window !== 'undefined' && !comingSoon) preloadTool(tool.slug);

  // One "used" event per visit, on the first interaction inside the tool.
  const used = useRef(false);
  const markUsed = () => {
    if (used.current) return;
    used.current = true;
    trackEvent('tool_used', { tool: tool.slug });
  };
  // One "result" event per visit, when the tool first reports a result to share.
  const sawResult = useRef(false);
  useEffect(() => {
    if (shareText && !sawResult.current) {
      sawResult.current = true;
      trackEvent('result_viewed', { tool: tool.slug });
    }
  }, [shareText, tool.slug]);

  const related: { tool: ToolMeta; why: string }[] = content
    ? content.relatedTools.flatMap((r) => {
      const t = getTool(r.slug);
      return t && t.status === 'live' ? [{ tool: t, why: r.why }] : [];
    })
    : neighbours(tool).map((t) => ({ tool: t, why: t.subtitle }));

  const placeholder = (
    // Pre-rendered pages carry the tool's surroundings; the tool itself starts in the browser.
    <div className={`grid ${frame} place-items-center rounded-2xl border border-white/10 p-8 text-center text-sm text-white/60`}>
      <p>Loading the {tool.name}…</p>
      <noscript><p>This tool runs in your browser and needs JavaScript switched on.</p></noscript>
    </div>
  );

  return (
    <>
      <motion.header initial={enter({ opacity: 0, y: 16 })} animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${TOOL_ACCENT_BG[tool.accent]}`}>
              <tool.Icon className="h-6 w-6" />
            </span>
            {comingSoon ? <Badge tone="gold">Coming Soon</Badge> : tool.isNew && <Badge tone="cyan">New</Badge>}
          </div>
          <h1 className="font-display text-h1 text-white">{heading}</h1>
          {content ? (
            <p className={`mt-3 ${PROSE}`}>{content.lede}</p>
          ) : (
            <>
              <p className="mt-2 text-body text-white/60">{tool.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{tool.description}</p>
            </>
          )}
          {!comingSoon && (
            <p className="mt-3 text-xs uppercase tracking-wide text-white/55">Free · No sign-up · Calculated in your browser</p>
          )}
        </div>
        <div className="flex gap-3">
          <ShareBar url={url} title={title} text={shareText ?? `Check out the ${tool.name} on VediCosmic — free Vedic tools`} />
          <Button variant="ghost" to="/tools"><ArrowLeft className="h-4 w-4" /> All tools</Button>
        </div>
      </motion.header>

      {comingSoon ? (
        <ComingSoon title={`${tool.name} is on its way`}
          blurb="This tool is being rebuilt and checked against reference charts before it goes live. The rest of the tools are free to use in the meantime." />
      ) : (
        // The h2 keeps heading levels in order: the page h1 above, the tools' own h3 sections below.
        <section id="tool" aria-labelledby="tool-heading" className={frame}
          onPointerDownCapture={markUsed} onKeyDownCapture={markUsed} onChangeCapture={markUsed}>
          <h2 id="tool-heading" className="sr-only">{content?.toolHeading ?? `Use the ${tool.name}`}</h2>
          {hydrated ? <Suspense fallback={placeholder}><Tool /></Suspense> : placeholder}
          <ResultNote category={tool.category} />
        </section>
      )}

      {content && (
        <>
          <section id="about" className={SECTION}>
            <h2 className={H2}>{content.about.heading}</h2>
            <div className="mt-4 space-y-4">
              {content.about.paragraphs.map((p) => <p key={p} className={PROSE}>{p}</p>)}
            </div>
          </section>

          <section id="how-to-use" className={SECTION}>
            <h2 className={H2}>{content.howToUse.heading}</h2>
            <ol className="mt-5 space-y-4">
              {content.howToUse.steps.map((s, i) => (
                <li key={s.name} className="flex gap-4">
                  <span aria-hidden="true" className="grid h-8 w-8 flex-none place-items-center rounded-full border border-gold-soft/40 text-sm text-gold-pale">{i + 1}</span>
                  <div>
                    <h3 className="font-medium text-white">{s.name}</h3>
                    <p className={`mt-1 ${PROSE}`}>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="reading" className={SECTION}>
            <h2 className={H2}>{content.howToRead.heading}</h2>
            <div className="mt-5 space-y-5">
              {content.howToRead.items.map((it) => (
                <div key={it.term}>
                  <h3 className="font-medium text-white">{it.term}</h3>
                  <p className={`mt-1 ${PROSE}`}>{it.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="method" className={SECTION}>
            <h2 className={H2}>{content.method.heading}</h2>
            <div className="mt-4 space-y-4">
              {content.method.paragraphs.map((p) => <p key={p} className={PROSE}>{p}</p>)}
              {content.method.example && (
                <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
                  <span className="font-medium text-white">Worked example. </span>{content.method.example}
                </p>
              )}
              {content.method.limits && content.method.limits.length > 0 && (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/65">
                  {content.method.limits.map((l) => <li key={l}>{l}</li>)}
                </ul>
              )}
              <p className="text-sm text-white/60">
                <Link to={`/how-we-calculate${content.method.anchor ? `#${content.method.anchor}` : ''}`}
                  className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">How we calculate</Link>
                {' '}· Page reviewed {formatLongDate(content.lastReviewed)}
              </p>
            </div>
          </section>
        </>
      )}

      {faqs.length > 0 && (
        <section id="faq" className={SECTION}>
          <h2 className={H2}>{content?.faq.heading ?? `${tool.name}: common questions`}</h2>
          <div className="mt-6">
            <Accordion items={faqs} defaultOpen={faqs[0]?.id} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section id="related-tools" className={SECTION}>
          <h2 className={H2}>Related tools</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map(({ tool: t, why }) => (
              <li key={t.id}>
                <Link to={`/tools/${t.slug}`} className="block h-full">
                  <Card hover accent={t.accent} className="group flex h-full items-center gap-4 p-5">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TOOL_ACCENT_BG[t.accent]}`}>
                      <t.Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-base text-white group-hover:text-gold-pale">{t.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-white/60">{why}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-brand-cyan-soft" />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          {hub && (
            <p className="mt-5 text-sm">
              <Link to={hub.path} className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">All {hub.label.toLowerCase()} tools</Link>
            </p>
          )}
        </section>
      )}

      {guides.length > 0 && (
        <section id="guides" className={SECTION}>
          <h2 className={H2}>Guides to read next</h2>
          <ul className="mt-5 space-y-3">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link to={`/blog/${g.slug}`} className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/25">
                  <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-gold-soft" />
                  <span className="text-sm leading-snug text-white/80 group-hover:text-white">{g.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
