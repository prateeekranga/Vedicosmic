import type { FAQItem } from '@/types/content.types';

export type BlogCategoryId =
  | 'numerology' | 'astrology' | 'energy' | 'cosmology'
  | 'spiritual-living' | 'rituals-festivals' | 'meditation-yoga';

export type BlogContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; style: 'bullet' | 'number'; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'callout'; tone: 'info' | 'tip' | 'warning'; title?: string; text: string }
  | { type: 'cta-tool'; toolSlug: string; label?: string }
  | { type: 'cta-course'; courseSlug: string; label?: string }
  | { type: 'internal-link'; postSlug: string; label?: string }
  | { type: 'diagram'; id: 'loshu-grid' | 'nakshatra-wheel' | 'chakra-column'; caption?: string }
  | { type: 'divider' };

export interface BlogPost {
  /** Always equal to `slug` — mirrors ToolMeta's id/slug convention. */
  id: string;
  slug: string;
  title: string;
  /** Richer, keyword-forward title used only for <title>/search snippets — falls back to `${title} · VediCosmic`. */
  seoTitle?: string;
  /** Meta description + card summary + search haystack field. */
  excerpt: string;
  category: BlogCategoryId;
  tags: string[];
  /** References a key in AUTHORS (src/data/authors.ts) — shared with course instructors for consistent E-E-A-T bios. */
  authorId?: string;
  /** ISO date, e.g. '2026-01-15'. */
  publishedAt: string;
  updatedAt?: string;
  /** Manual override; computed via estimateReadingTime() if unset. */
  readingTimeMin?: number;
  /** Falls back to DEFAULT_OG_IMAGE if unset. */
  heroImage?: string;
  isFeatured?: boolean;
  isPinned?: boolean;
  content: BlogContentBlock[];
  relatedToolSlugs?: string[];
  relatedCourseSlugs?: string[];
  /** Reuses existing FAQItem — feeds faqPageSchema() for AEO + an on-page Accordion. */
  faqs?: FAQItem[];
  /** Always-visible TL;DR bullets, rendered above the fold and marked data-speakable. */
  keyTakeaways?: string[];
  /** A single coherent step-by-step procedure this post teaches — feeds howToSchema(). Populate for
   *  exactly one canonical procedure per post; schema.org HowTo models one sequence, not parallel alternatives. */
  howToSteps?: { name: string; text: string }[];
}
