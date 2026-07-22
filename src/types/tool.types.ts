import type { ComponentType } from 'react';

export type ToolCategory = 'numerology' | 'astrology' | 'energy' | 'cosmology';

export interface ToolMeta {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  /** Richer, keyword-forward title used only for <title>/search snippets — falls back to `${name} · VediCosmic` if unset. */
  seoTitle?: string;
  category: ToolCategory;
  accent: 'gold' | 'cyan' | 'violet' | 'teal';
  isNew?: boolean;
  Icon: ComponentType<{ className?: string }>;
  Component: ComponentType;
  relatedCourseSlug?: string;
}
