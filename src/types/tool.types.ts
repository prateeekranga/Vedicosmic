import type { ComponentType } from 'react';
import type { FAQItem } from '@/types/content.types';

export type ToolCategory = 'numerology' | 'astrology' | 'energy' | 'cosmology';

/** `coming-soon` tools keep their URL but render a notice instead of the tool. */
export type ToolStatus = 'live' | 'coming-soon';

/** Tool metadata only. The React component lives in `src/tools/registry.tsx` so that
 *  metadata consumers (nav, hubs, sitemap) don't pull every tool into their bundle. */
export interface ToolMeta {
  id: string;
  slug: string;
  /** Short label used in navigation, hubs, breadcrumbs and cards. */
  name: string;
  /** The page's main heading, when it should say more than the label; falls back to `name`. */
  h1?: string;
  subtitle: string;
  description: string;
  /** Head-only description (70–160 characters); the longer `description` shows on the Tools page. */
  metaDescription?: string;
  /** Richer, keyword-forward title used only for <title>/search snippets — falls back to `${name} · VediCosmic` if unset. */
  seoTitle?: string;
  category: ToolCategory;
  accent: 'gold' | 'cyan' | 'violet' | 'teal';
  isNew?: boolean;
  status: ToolStatus;
  /** False keeps the page out of the sitemap and adds a noindex robots tag. */
  indexable: boolean;
  Icon: ComponentType<{ className?: string }>;
}

/** Reserved height for the tool while it loads, so the page below it does not jump. */
export type ToolFrame = 'compact' | 'standard' | 'tall';

export type AppCategory =
  | 'LifestyleApplication' | 'UtilitiesApplication' | 'ReferenceApplication'
  | 'MultimediaApplication' | 'EducationalApplication';

/**
 * The written content of a tool page, one file per tool in `src/content/toolContent/`. Every field
 * is plain text with no inline links (links live in the structured slots), so the page text and the
 * structured data built from it are always identical.
 */
export interface ToolContent {
  /** Must equal a ToolMeta.slug. */
  slug: string;
  /** 'YYYY-MM-DD': the day a person last checked this copy against the tool. */
  lastReviewed: string;
  /** 30–50 words shown above the tool. */
  lede: string;
  /** Heading over the tool itself; must differ from the page's h1. */
  toolHeading: string;
  about: { heading: string; paragraphs: string[] };
  howToUse: {
    heading: string;
    steps: { name: string; text: string }[];
    /** True only when the steps are a procedure someone could follow without the tool. */
    asHowTo?: boolean;
  };
  /** One entry per part of the result. */
  howToRead: { heading: string; items: { term: string; text: string }[] };
  method: {
    heading: string;
    paragraphs: string[];
    /** A worked example with fixed input; a test recomputes it with the real function. */
    example?: string;
    limits?: string[];
    /** Section id on /how-we-calculate that documents this method. */
    anchor?: string;
  };
  /** Five to seven questions about this tool only. */
  faq: { heading: string; items: FAQItem[] };
  /** Three or four tools, each with the reason it follows from this one (8–16 words). */
  relatedTools: { slug: string; why: string }[];
  /** Three to six statements a visitor can check on the page. */
  features: string[];
  appCategory?: AppCategory;
  /** What the page is about, for structured data. */
  topic?: { name: string; sameAs?: string };
  /** Other truthful names for the tool. */
  aliases?: string[];
  frame?: ToolFrame;
  /** Writing guidance only; never rendered. */
  keywords?: { primary: string; secondary: string[] };
}
