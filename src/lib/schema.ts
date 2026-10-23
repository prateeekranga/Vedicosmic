import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/config/site';
import type { FAQItem } from '@/types/content.types';
import type { ToolMeta } from '@/types/tool.types';
import type { BlogPost } from '@/types/blog.types';
import { getPerson } from '@/content/people';
import { getBlogCategory } from '@/data/blogCategories';
import { estimateWordCount } from '@/lib/blogUtils';

export function faqPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.header,
      acceptedAnswer: { '@type': 'Answer', text: f.body },
    })),
  };
}

export function breadcrumbList(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path,
    })),
  };
}

export function softwareApplicationSchema(tool: ToolMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (runs in browser)',
    url: `${SITE_URL}/tools/${tool.slug}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  };
}

export function audioObjectSchema(tool: ToolMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: tool.name,
    description: tool.description,
    contentUrl: `${SITE_URL}/tools/${tool.slug}`,
    embedUrl: `${SITE_URL}/tools/${tool.slug}`,
    isAccessibleForFree: true,
  };
}

/** Per-tool extra JSON-LD beyond the generic SoftwareApplication/FAQPage/BreadcrumbList every
 *  tool page already gets — keyed by slug, mirrors src/data/toolFaqs.ts's lookup shape. */
const TOOL_EXTRA_SCHEMA: Record<string, (tool: ToolMeta) => object[]> = {
  'chakra-frequency-player': (tool) => [audioObjectSchema(tool)],
};

export function getToolExtraJsonLd(tool: ToolMeta): object[] {
  return TOOL_EXTRA_SCHEMA[tool.slug]?.(tool) ?? [];
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
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.excerpt,
    step: (post.howToSteps ?? []).map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
