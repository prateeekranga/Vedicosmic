import { SITE_URL, SITE_NAME } from '@/config/site';
import type { FAQItem } from '@/types/content.types';
import type { Course } from '@/types/course.types';
import type { ToolMeta } from '@/types/tool.types';

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
