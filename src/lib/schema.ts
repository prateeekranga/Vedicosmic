import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/config/site';
import type { FAQItem } from '@/types/content.types';
import type { Course } from '@/types/course.types';
import type { ToolMeta } from '@/types/tool.types';
import type { BlogPost } from '@/types/blog.types';
import { getAuthor } from '@/data/authors';
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

export function courseSchema(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: { '@type': 'Organization', name: SITE_NAME, sameAs: SITE_URL },
    ...(course.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: course.rating,
        reviewCount: course.reviewCount,
      },
    } : {}),
    ...(course.price != null ? {
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: course.currency,
        url: `${SITE_URL}/courses/${course.slug}`,
      },
    } : {}),
  };
}

export function blogPostingSchema(post: BlogPost) {
  const image = post.heroImage
    ? (post.heroImage.startsWith('http') ? post.heroImage : SITE_URL + post.heroImage)
    : SITE_URL + DEFAULT_OG_IMAGE;
  const author = post.authorId ? getAuthor(post.authorId) : undefined;
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
      ? { '@type': 'Person', name: author.name, jobTitle: author.title, description: author.bio, url: `${SITE_URL}/about` }
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
