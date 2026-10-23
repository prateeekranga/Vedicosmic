import type { ComponentType } from 'react';

export type ToolCategory = 'numerology' | 'astrology' | 'energy' | 'cosmology';

/** `coming-soon` tools keep their URL but render a notice instead of the tool. */
export type ToolStatus = 'live' | 'coming-soon';

/** Tool metadata only. The React component lives in `src/tools/registry.tsx` so that
 *  metadata consumers (nav, hubs, sitemap) don't pull every tool into their bundle. */
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
  status: ToolStatus;
  /** False keeps the page out of the sitemap and adds a noindex robots tag. */
  indexable: boolean;
  Icon: ComponentType<{ className?: string }>;
}
