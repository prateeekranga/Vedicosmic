/**
 * The written content of each tool page (see ToolContent). A tool without an entry here still
 * gets the full page template with its short description, FAQ and links; scripts/verify-prerender
 * lists those tools as "copy pending" and fails once a listed tool no longer needs the exemption.
 */
import type { ToolContent } from '@/types/tool.types';

const CONTENT: ToolContent[] = [];

const BY_SLUG = new Map(CONTENT.map((c) => [c.slug, c]));

/** `locale` is the slot for translated copy; only English exists today. */
export function getToolContent(slug: string, locale: 'en' = 'en'): ToolContent | undefined {
  return locale === 'en' ? BY_SLUG.get(slug) : undefined;
}

export const ALL_TOOL_CONTENT: readonly ToolContent[] = CONTENT;
