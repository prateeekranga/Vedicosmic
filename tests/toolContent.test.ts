/**
 * The written content of tool pages and hubs: lengths search engines accept, links that point
 * somewhere real, no question or sentence reused across pages, and worked examples that still
 * match what the calculators give.
 */
import { describe, expect, it } from 'vitest';
import vectors from './golden/numerology.vectors.json';
import { TOOLS, FEATURED_TOOLS, getTool, liveTools } from '@/content/routes';
import { ALL_TOOL_CONTENT, getToolContent } from '@/content/toolContent';
import { TOOL_GUIDES } from '@/content/toolGuides';
import { TOOL_HUBS, TOOLS_INDEX } from '@/content/toolHubs';
import { METHOD_SECTIONS } from '@/content/methodSections';
import { NUMEROLOGY_REFERENCE_CASES } from '@/content/referenceChecks';
import { getToolFaqs } from '@/data/toolFaqs';
import { BLOG_POSTS } from '@/data/blog';
import { HOME_CONTENT } from '@/data/homeContent';
import { CONTACT_CONTENT } from '@/data/contactContent';
import { toolPageDescription, toolPageJsonLd, toolPageTitle } from '@/lib/schema';
import { toolCrumbs, toolFaqs } from '@/pages/ToolPage';
import {
  analyseMobile, chaldeanName, expression, lifePath, loShu, normalizeName, soulUrge,
} from '@/engine/numerology';

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const live = liveTools();
const liveSlugs = new Set(live.map((t) => t.slug));

describe('titles and descriptions', () => {
  const pages = [
    ...TOOLS.filter((t) => t.indexable).map((t) => ({ path: `/tools/${t.slug}`, title: toolPageTitle(t), description: toolPageDescription(t), h1: t.h1 ?? t.name })),
    ...TOOL_HUBS.map((h) => ({ path: h.path, title: h.title, description: h.description, h1: h.h1 })),
    { path: TOOLS_INDEX.path, title: TOOLS_INDEX.title, description: TOOLS_INDEX.description, h1: TOOLS_INDEX.h1 },
  ];

  it('fit the lengths search results show, and are unique', () => {
    const titles = new Set<string>(), descriptions = new Set<string>(), headings = new Set<string>();
    for (const p of pages) {
      expect(p.title.length, `${p.path} title "${p.title}"`).toBeGreaterThanOrEqual(30);
      expect(p.title.length, `${p.path} title "${p.title}"`).toBeLessThanOrEqual(60);
      expect(p.description.length, `${p.path} description`).toBeGreaterThanOrEqual(70);
      expect(p.description.length, `${p.path} description`).toBeLessThanOrEqual(160);
      expect(titles.has(p.title), `${p.path} title is reused`).toBe(false);
      expect(descriptions.has(p.description), `${p.path} description is reused`).toBe(false);
      expect(headings.has(p.h1), `${p.path} h1 is reused`).toBe(false);
      expect(p.h1, `${p.path} h1 equals its title`).not.toBe(p.title);
      titles.add(p.title); descriptions.add(p.description); headings.add(p.h1);
    }
  });

  it('never claim a rating, a best or a guarantee', () => {
    for (const p of pages) {
      expect(`${p.title} ${p.description}`, p.path).not.toMatch(/\b(best|most accurate|100%|guarantee|#1|top-rated)\b/i);
    }
  });
});

describe('tool page content', () => {
  it('belongs to a live tool and is complete', () => {
    for (const c of ALL_TOOL_CONTENT) {
      const tool = getTool(c.slug);
      expect(tool?.status, c.slug).toBe('live');
      expect(c.lastReviewed, c.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.lastReviewed <= new Date().toISOString().slice(0, 10), `${c.slug} reviewed in the future`).toBe(true);
      expect(words(c.lede), `${c.slug} lede`).toBeGreaterThanOrEqual(25);
      expect(words(c.lede), `${c.slug} lede`).toBeLessThanOrEqual(55);
      expect(c.toolHeading, c.slug).not.toBe(tool!.h1 ?? tool!.name);
      expect(c.faq.items.length, `${c.slug} FAQ count`).toBeGreaterThanOrEqual(5);
      expect(c.faq.items.length, `${c.slug} FAQ count`).toBeLessThanOrEqual(7);
      expect(c.features.length, `${c.slug} features`).toBeGreaterThanOrEqual(3);
      expect(c.features.length, `${c.slug} features`).toBeLessThanOrEqual(6);
      expect(c.howToUse.steps.length, `${c.slug} steps`).toBeGreaterThanOrEqual(3);
      expect(c.howToRead.items.length, `${c.slug} reading items`).toBeGreaterThanOrEqual(3);
      const headings = [tool!.h1 ?? tool!.name, c.toolHeading, c.about.heading, c.howToUse.heading, c.howToRead.heading, c.method.heading, c.faq.heading];
      expect(new Set(headings).size, `${c.slug} repeats a heading`).toBe(headings.length);
    }
  });

  it('has enough unique words to stand as a page', () => {
    for (const c of ALL_TOOL_CONTENT) {
      const text = [
        c.lede, ...c.about.paragraphs, ...c.howToUse.steps.flatMap((s) => [s.name, s.text]),
        ...c.howToRead.items.flatMap((i) => [i.term, i.text]), ...c.method.paragraphs, c.method.example ?? '',
        ...(c.method.limits ?? []), ...c.faq.items.flatMap((f) => [f.header, f.body]),
      ].join(' ');
      expect(words(text), `${c.slug} word count`).toBeGreaterThanOrEqual(450);
      expect(words(text), `${c.slug} word count`).toBeLessThanOrEqual(1500);
    }
  });

  it('links related tools that exist, are live, and link back often enough', () => {
    const inbound = new Map<string, number>();
    for (const c of ALL_TOOL_CONTENT) {
      expect(c.relatedTools.length, `${c.slug} related tools`).toBeGreaterThanOrEqual(3);
      expect(c.relatedTools.length, `${c.slug} related tools`).toBeLessThanOrEqual(4);
      for (const r of c.relatedTools) {
        expect(liveSlugs.has(r.slug), `${c.slug} → ${r.slug}`).toBe(true);
        expect(r.slug, `${c.slug} links to itself`).not.toBe(c.slug);
        expect(words(r.why), `${c.slug} → ${r.slug} reason`).toBeGreaterThanOrEqual(6);
        expect(words(r.why), `${c.slug} → ${r.slug} reason`).toBeLessThanOrEqual(18);
        inbound.set(r.slug, (inbound.get(r.slug) ?? 0) + 1);
      }
    }
    for (const c of ALL_TOOL_CONTENT) {
      expect(inbound.get(c.slug) ?? 0, `${c.slug} is recommended by other tools`).toBeGreaterThanOrEqual(2);
    }
  });

  it('points its method link at a real section of How we calculate', () => {
    for (const c of ALL_TOOL_CONTENT) {
      if (!c.method.anchor) continue;
      expect(METHOD_SECTIONS[c.method.anchor], `${c.slug} → #${c.method.anchor}`).toBeDefined();
      expect(METHOD_SECTIONS[c.method.anchor], `${c.slug} is listed under #${c.method.anchor}`).toContain(c.slug);
    }
    for (const [id, slugs] of Object.entries(METHOD_SECTIONS)) {
      for (const slug of slugs) expect(liveSlugs.has(slug), `#${id} lists ${slug}`).toBe(true);
    }
  });

  it('never repeats a sentence between two tool pages', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const c of ALL_TOOL_CONTENT) {
      const text = [c.lede, ...c.about.paragraphs, ...c.howToUse.steps.map((s) => s.text), ...c.howToRead.items.map((i) => i.text),
        ...c.method.paragraphs, ...(c.method.limits ?? []), ...c.faq.items.map((f) => f.body)].join(' ');
      for (const sentence of text.split(/(?<=[.?!])\s+/).filter((s) => words(s) >= 8)) {
        const other = seen.get(sentence);
        if (other && other !== c.slug) clashes.push(`${other} and ${c.slug}: ${sentence}`);
        seen.set(sentence, c.slug);
      }
    }
    expect(clashes).toEqual([]);
  });
});

describe('questions', () => {
  it('are asked once on the whole site', () => {
    const all: [string, string][] = [
      ...HOME_CONTENT.faqs.map((f): [string, string] => ['home', f.header]),
      ...CONTACT_CONTENT.faqs.map((f): [string, string] => ['contact', f.header]),
      ...TOOLS_INDEX.faqs.map((f): [string, string] => ['/tools', f.header]),
      ...live.flatMap((t) => toolFaqs(t, getToolContent(t.slug)).map((f): [string, string] => [`/tools/${t.slug}`, f.header])),
      ...BLOG_POSTS.flatMap((p) => (p.faqs ?? []).map((f): [string, string] => [`/blog/${p.slug}`, f.header])),
    ];
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const [where, q] of all) {
      const key = q.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (seen.has(key)) clashes.push(`"${q}" on ${seen.get(key)} and ${where}`);
      seen.set(key, where);
    }
    expect(clashes).toEqual([]);
  });

  it('keep the old per-tool questions only for tools that have no page content yet', () => {
    for (const t of live) {
      if (!getToolContent(t.slug)) expect(getToolFaqs(t.id).length, `${t.slug} has a question`).toBeGreaterThan(0);
    }
  });
});

describe('structured data', () => {
  it('describes each tool page consistently', () => {
    for (const t of TOOLS) {
      const content = getToolContent(t.slug);
      const crumbs = toolCrumbs(t);
      const ld = toolPageJsonLd(t, content, crumbs, toolFaqs(t, content)) as Record<string, unknown>[];
      const types = ld.map((o) => o['@type']);
      expect(types.filter((x) => x === 'WebPage'), t.slug).toHaveLength(1);
      expect(types.filter((x) => x === 'BreadcrumbList'), t.slug).toHaveLength(1);
      expect(types.filter((x) => x === 'WebApplication').length, t.slug).toBe(t.status === 'live' ? 1 : 0);
      expect(JSON.stringify(ld), `${t.slug} claims a rating`).not.toMatch(/aggregateRating|"review"|ratingValue/);
      expect(crumbs[crumbs.length - 1]).toEqual({ name: t.name, path: `/tools/${t.slug}` });
      if (content?.howToUse.asHowTo) expect(types).toContain('HowTo');
    }
  });
});

describe('hubs, featured tools and guides', () => {
  it('give every category a hub whose guide points at its own live tools', () => {
    expect(TOOL_HUBS.map((h) => h.id).sort()).toEqual([...new Set(TOOLS.map((t) => t.category))].sort());
    for (const hub of TOOL_HUBS) {
      expect(words(hub.intro.join(' ')), `${hub.id} intro`).toBeGreaterThanOrEqual(100);
      for (const item of hub.guide.items) {
        const tool = getTool(item.toolSlug);
        expect(tool?.status, `${hub.id} guide → ${item.toolSlug}`).toBe('live');
        expect(tool?.category, `${hub.id} guide → ${item.toolSlug}`).toBe(hub.id);
      }
    }
  });

  it('feature only live tools', () => {
    for (const f of FEATURED_TOOLS) expect(liveSlugs.has(f.slug), f.slug).toBe(true);
  });

  it('list exactly the guides that name each tool', () => {
    const expected: Record<string, { slug: string; title: string }[]> = {};
    for (const post of BLOG_POSTS) {
      for (const slug of post.relatedToolSlugs ?? []) (expected[slug] ??= []).push({ slug: post.slug, title: post.title });
    }
    expect(TOOL_GUIDES).toEqual(expected);
  });
});

describe('worked examples still match the calculators', () => {
  const example = (slug: string) => getToolContent(slug)!.method.example!;
  const faq = (slug: string, id: string) => getToolContent(slug)!.faq.items.find((f) => f.id === id)!.body;

  it('Lo Shu grid: 15 August 1990, female', () => {
    const r = loShu({ y: 1990, m: 8, d: 15 }, 'female');
    const text = example('loshu-grid');
    expect(text).toContain(`The Driver is ${r.driver} and the Conductor is ${r.conductor}`);
    expect(text).toContain(`read as Kua ${r.kua!.mansion}`);
    expect(r.kua!.raw).toBe(5);
    expect(text).toContain(`${r.full.missing.slice(0, -1).join(', ')} and ${r.full.missing[r.full.missing.length - 1]} are missing`);
    expect([r.full.counts[1], r.full.counts[5], r.full.counts[6], r.full.counts[8], r.full.counts[9]]).toEqual([2, 1, 2, 2, 2]);
    const other = loShu({ y: 1990, m: 11, d: 23 }, null);
    expect(faq('loshu-grid', 'loshu-driver')).toContain(`Driver ${other.driver} (2 + 3) and Conductor ${other.conductor}`);
  });

  it('Life Path: 23 November 1990 and 15 August 1990', () => {
    expect(example('life-path')).toContain(`so the Life Path is ${lifePath({ y: 1990, m: 11, d: 23 }).value}`);
    const lp = lifePath({ y: 1990, m: 8, d: 15 });
    expect(faq('life-path', 'lp-how')).toContain(`${lp.parts.map((p) => p.reduced).join(' + ')} = 15, and 1 + 5 = ${lp.value}`);
  });

  it('Numerology calculator: John Smith', () => {
    const name = normalizeName('John Smith');
    expect(example('numerology')).toContain(`The Expression number is 2 + 6 = ${expression(name)!.value}`);
    expect(example('numerology')).toContain(`so the Soul Urge is ${soulUrge(name)!.value}`);
  });

  it('Chaldean: Narendra Modi', () => {
    const r = chaldeanName('Narendra Modi')!;
    expect(example('chaldean')).toContain(`${r.words[0].total} + ${r.words[1].total} = ${r.compound}`);
    expect(example('chaldean')).toContain(`gives the root ${r.root}`);
  });

  it('Mobile number: 98765 43210', () => {
    const r = analyseMobile('98765 43210')!;
    expect(example('mobile-numerology')).toContain(`the digits add to ${r.total}`);
    expect(example('mobile-numerology')).toContain(`so the root is ${r.root}`);
    expect(r.frequency.every((n) => n === 1)).toBe(true);
  });

  it('the method page states the real number of hand-worked numerology cases', () => {
    const count = Object.entries(vectors).filter(([, v]) => Array.isArray(v)).reduce((n, [, v]) => n + (v as unknown[]).length, 0);
    expect(NUMEROLOGY_REFERENCE_CASES).toBe(count);
  });
});
