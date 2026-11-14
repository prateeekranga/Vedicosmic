import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, ORGANIZATION_ID, WEBSITE_ID } from '@/config/site';
import type { FAQItem } from '@/types/content.types';
import type { ToolContent, ToolMeta } from '@/types/tool.types';
import type { BlogPost } from '@/types/blog.types';
import { getPerson } from '@/content/people';
import { getBlogCategory } from '@/data/blogCategories';
import { estimateWordCount } from '@/lib/blogUtils';
import { shareImageFor } from '@/lib/seoHead';

/** Only list questions whose answers are visible on the page (scripts/verify-prerender checks this). */
export function faqPageSchema(faqs: FAQItem[], id?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(id ? { '@id': id } : {}),
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.header,
      acceptedAnswer: { '@type': 'Answer', text: f.body },
    })),
  };
}

export function breadcrumbList(items: { name: string; path: string }[], id?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(id ? { '@id': id } : {}),
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path,
    })),
  };
}

const toolPath = (tool: ToolMeta) => `/tools/${tool.slug}`;
export const toolPageTitle = (tool: ToolMeta) => tool.seoTitle ?? `${tool.name} · VediCosmic`;
export const toolPageDescription = (tool: ToolMeta) => tool.metaDescription ?? tool.description;

/** The page itself: what it is about, where it sits in the site and what its main content is. */
export function webPageSchema(page: {
  path: string; name: string; description: string;
  type?: 'WebPage' | 'CollectionPage';
  dateModified?: string;
  about?: { name: string; sameAs?: string };
  hasBreadcrumb?: boolean;
  mainEntityId?: string;
}) {
  const url = SITE_URL + page.path;
  return {
    '@context': 'https://schema.org',
    '@type': page.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    inLanguage: 'en-IN',
    ...(page.dateModified ? { dateModified: page.dateModified } : {}),
    isPartOf: { '@id': WEBSITE_ID },
    ...(page.about ? { about: { '@type': 'Thing', name: page.about.name, ...(page.about.sameAs ? { sameAs: page.about.sameAs } : {}) } } : {}),
    ...(page.hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    ...(page.mainEntityId ? { mainEntity: { '@id': page.mainEntityId } } : {}),
    primaryImageOfPage: { '@type': 'ImageObject', url: SITE_URL + shareImageFor(page.path), width: 1200, height: 630 },
  };
}

/**
 * A working tool, described as a free web application. No ratings or reviews: the site collects
 * none, so it claims none (scripts/check-claims.mjs enforces this).
 */
export function webApplicationSchema(tool: ToolMeta, content?: ToolContent) {
  const url = SITE_URL + toolPath(tool);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${url}#app`,
    url,
    name: tool.name,
    ...(content?.aliases?.length ? { alternateName: content.aliases } : {}),
    description: toolPageDescription(tool),
    applicationCategory: content?.appCategory ?? 'LifestyleApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    ...(content?.features.length ? { featureList: content.features } : {}),
    image: SITE_URL + shareImageFor(toolPath(tool)),
    ...(content ? { dateModified: content.lastReviewed } : {}),
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}

/** A list of pages, in order (the tools on a hub). */
export function itemListSchema(items: { name: string; path: string }[], id?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(id ? { '@id': id } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: SITE_URL + it.path,
    })),
  };
}

/** A procedure someone could follow without the page; the steps must be visible on it. */
export function howToFromSteps(name: string, description: string, steps: { name: string; text: string }[], id?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    ...(id ? { '@id': id } : {}),
    name,
    description,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** Every structured-data object for a tool page, in one place so the page and its tests agree. */
export function toolPageJsonLd(
  tool: ToolMeta, content: ToolContent | undefined, crumbs: { name: string; path: string }[], faqs: FAQItem[],
): object[] {
  const path = toolPath(tool);
  const url = SITE_URL + path;
  const live = tool.status === 'live';
  return [
    webPageSchema({
      path, name: toolPageTitle(tool), description: toolPageDescription(tool),
      dateModified: content?.lastReviewed, about: content?.topic, hasBreadcrumb: true,
      mainEntityId: live ? `${url}#app` : undefined,
    }),
    // Only working tools are described as applications.
    ...(live ? [webApplicationSchema(tool, content)] : []),
    breadcrumbList(crumbs, `${url}#breadcrumb`),
    ...(faqs.length ? [faqPageSchema(faqs, `${url}#faq`)] : []),
    ...(content?.howToUse.asHowTo
      ? [howToFromSteps(content.howToUse.heading, content.lede, content.howToUse.steps, `${url}#howto`)]
      : []),
  ];
}

export function blogPostingSchema(post: BlogPost) {
  const image = post.heroImage
    ? (post.heroImage.startsWith('http') ? post.heroImage : SITE_URL + post.heroImage)
    : SITE_URL + DEFAULT_OG_IMAGE;
  const author = getPerson(post.authorId);
  const category = getBlogCategory(post.category);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    // An unattributed post is credited to the Organization, not a fabricated Person named after the site.
    author: author
      ? { '@type': 'Person', name: author.name, jobTitle: author.role, ...(author.bio ? { description: author.bio } : {}), url: `${SITE_URL}/about` }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: SITE_URL + DEFAULT_OG_IMAGE } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    url: `${SITE_URL}/blog/${post.slug}`,
    articleSection: category?.label,
    keywords: post.tags.join(', '),
    wordCount: estimateWordCount(post.content),
    inLanguage: 'en',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
  };
}

export function howToSchema(post: BlogPost) {
  return howToFromSteps(post.title, post.excerpt, post.howToSteps ?? []);
}
