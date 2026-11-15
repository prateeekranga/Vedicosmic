import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { TOOLS, TOOL_ACCENT_BG, getTool, liveTools } from '@/content/routes';
import { TOOL_HUBS, TOOLS_INDEX, getToolHub, type ToolHub } from '@/content/toolHubs';
import { useSEO } from '@/hooks/useSEO';
import { breadcrumbList, faqPageSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { SITE_URL } from '@/config/site';
import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';
import { Card } from '@/components/ui/Card';
import type { ToolMeta } from '@/types/tool.types';
import NotFound from '@/pages/NotFound';

const H2 = 'font-heading text-h3 text-white';
const PROSE = 'text-body leading-relaxed text-white/70';

export default function Tools() {
  const { categoryId } = useParams();
  const hub = getToolHub(categoryId);
  // An unknown category is a missing page, not the index.
  if (categoryId && !hub) return <NotFound />;
  return hub ? <HubPage key={hub.id} hub={hub} /> : <IndexPage />;
}

/** Links to the index and each hub; the current one is marked for assistive technology. */
function HubChips({ current }: { current: 'all' | ToolHub['id'] }) {
  const live = liveTools();
  const chips = [
    { id: 'all' as const, label: 'All tools', path: TOOLS_INDEX.path, count: live.length },
    ...TOOL_HUBS.map((h) => ({ id: h.id, label: h.label, path: h.path, count: live.filter((t) => t.category === h.id).length })),
  ];
  return (
    <nav aria-label="Tool categories" className="mt-8">
      <ul className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = c.id === current;
          return (
            <li key={c.id}>
              <Link to={c.path} aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm transition-colors ${
                  active ? 'border-gold-soft/60 bg-gold-bright/10 text-gold-pale' : 'border-white/10 text-white/70 hover:border-white/30'
                }`}>
                {c.label}
                <span className={`text-xs ${active ? 'text-gold-soft' : 'text-white/55'}`}>{c.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ToolCard({ tool }: { tool: ToolMeta }) {
  return (
    <Link to={`/tools/${tool.slug}`} className="block h-full">
      <Card hover accent={tool.accent} className="group h-full p-7">
        <div className="flex items-center justify-between">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${TOOL_ACCENT_BG[tool.accent]}`}>
            <tool.Icon className="h-6 w-6" />
          </span>
          {tool.status === 'coming-soon' && <Badge tone="neutral">Coming Soon</Badge>}
        </div>
        <h3 className="mt-5 font-heading text-h3 text-white group-hover:text-gold-pale">{tool.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-wide text-white/55">{tool.subtitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{tool.description}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm text-brand-cyan-soft">
          Open <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </Card>
    </Link>
  );
}

function ToolGrid({ tools }: { tools: ToolMeta[] }) {
  return (
    <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {tools.map((t) => <li key={t.id}><ToolCard tool={t} /></li>)}
    </ul>
  );
}

function IndexPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const crumbs: Crumb[] = [{ name: 'Home', path: '/' }, { name: 'Tools', path: TOOLS_INDEX.path }];
  const url = SITE_URL + TOOLS_INDEX.path;

  useSEO({
    key: '/tools', path: TOOLS_INDEX.path, title: TOOLS_INDEX.title, description: TOOLS_INDEX.description,
    jsonLd: [
      webPageSchema({ path: TOOLS_INDEX.path, name: TOOLS_INDEX.title, description: TOOLS_INDEX.description, type: 'CollectionPage', hasBreadcrumb: true, mainEntityId: `${url}#tools` }),
      itemListSchema(liveTools().map((t) => ({ name: t.name, path: `/tools/${t.slug}` })), `${url}#tools`),
      breadcrumbList(crumbs, `${url}#breadcrumb`),
      faqPageSchema(TOOLS_INDEX.faqs, `${url}#faq`),
    ],
  });

  const matches = useMemo(() => {
    const terms = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return null;
    return TOOLS.filter((t) => {
      const haystack = [t.name, t.h1 ?? '', t.subtitle, t.description].join(' ').toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [deferredQuery]);

  return (
    <div className="container-vc pb-16 pt-20 sm:pb-24">
      <Breadcrumbs items={crumbs} className="mb-6" />
      <header className="max-w-3xl">
        <h1 className="font-display text-h1 text-white">{TOOLS_INDEX.h1}</h1>
        <div className="mt-4 space-y-4">
          {TOOLS_INDEX.intro.map((p) => <p key={p} className={PROSE}>{p}</p>)}
        </div>
      </header>

      <div className="mt-8 max-w-xl">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
            className="w-full rounded-full border border-white/12 bg-cosmic-darker/60 py-3 pl-11 pr-11 text-white placeholder-white/40 transition-colors focus:border-brand-cyan focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <HubChips current="all" />

      {matches ? (
        <section className="mt-12" aria-live="polite">
          <h2 className={H2}>{matches.length} {matches.length === 1 ? 'tool matches' : 'tools match'} “{query.trim()}”</h2>
          {matches.length > 0 ? <ToolGrid tools={matches} /> : (
            <button onClick={() => setQuery('')} className="mt-4 text-sm text-brand-cyan-soft hover:underline">Clear the search</button>
          )}
        </section>
      ) : (
        TOOL_HUBS.map((hub) => (
          <section key={hub.id} className="mt-14">
            <h2 className={H2}>
              <Link to={hub.path} className="hover:text-gold-pale">{hub.h1}</Link>
            </h2>
            <ToolGrid tools={TOOLS.filter((t) => t.category === hub.id)} />
          </section>
        ))
      )}

      {/* Wide screens: the heading and note to the left, the questions to the right. */}
      <section id="faq" className="mx-auto mt-20 max-w-3xl lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12 xl:gap-16">
        <div>
          <h2 className={H2}>{TOOLS_INDEX.faqHeading}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 lg:mt-5 lg:max-w-sm">
            The methods behind the astrology and calendar tools are written up on the{' '}
            <Link to="/how-we-calculate" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">How we calculate</Link> page.
          </p>
        </div>
        <div className="mt-6 lg:mt-0">
          <Accordion items={TOOLS_INDEX.faqs} defaultOpen={TOOLS_INDEX.faqs[0]?.id} />
        </div>
      </section>
    </div>
  );
}

function HubPage({ hub }: { hub: ToolHub }) {
  const tools = TOOLS.filter((t) => t.category === hub.id);
  const live = tools.filter((t) => t.status === 'live');
  const crumbs: Crumb[] = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: TOOLS_INDEX.path },
    { name: hub.label, path: hub.path },
  ];
  const url = SITE_URL + hub.path;

  useSEO({
    key: hub.path, path: hub.path, title: hub.title, description: hub.description,
    jsonLd: [
      webPageSchema({ path: hub.path, name: hub.title, description: hub.description, type: 'CollectionPage', hasBreadcrumb: true, mainEntityId: `${url}#tools` }),
      itemListSchema(live.map((t) => ({ name: t.name, path: `/tools/${t.slug}` })), `${url}#tools`),
      breadcrumbList(crumbs, `${url}#breadcrumb`),
    ],
  });

  return (
    <div className="container-vc pb-16 pt-20 sm:pb-24">
      <Breadcrumbs items={crumbs} className="mb-6" />
      <header className="max-w-3xl">
        <h1 className="font-display text-h1 text-white">{hub.h1}</h1>
        <div className="mt-4 space-y-4">
          {hub.intro.map((p) => <p key={p} className={PROSE}>{p}</p>)}
        </div>
      </header>

      <HubChips current={hub.id} />

      <section className="mt-12">
        <h2 className={H2}>{hub.guide.heading}</h2>
        <ul className="mt-5 grid gap-4 lg:grid-cols-2">
          {hub.guide.items.map((item) => {
            const tool = getTool(item.toolSlug);
            if (!tool) return null;
            return (
              <li key={item.question} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="font-medium text-white">{item.question}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/65">
                  {item.answer}{' '}
                  <Link to={`/tools/${tool.slug}`} className="whitespace-nowrap text-brand-cyan-soft underline underline-offset-2 hover:text-white">Open the {tool.name}</Link>
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className={H2}>All {hub.label.toLowerCase()} tools</h2>
        <ToolGrid tools={tools} />
      </section>

      <p className="mt-12 text-sm">
        <Link to={TOOLS_INDEX.path} className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">See every tool</Link>
      </p>
    </div>
  );
}
