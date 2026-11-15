import { headingSlugs } from '@/lib/blogUtils';
import type { BlogContentBlock } from '@/types/blog.types';

export interface TocEntry { id: string; text: string; level: 2 | 3 }

/** The post's headings with their anchors; empty below 3 headings, where a menu would be clutter. */
export function tocEntries(blocks: BlogContentBlock[]): TocEntry[] {
  const ids = headingSlugs(blocks);
  const entries = blocks
    .map((b, i) => (b.type === 'heading' ? { id: ids[i], text: b.text, level: b.level } : null))
    .filter((e): e is TocEntry => e !== null);
  return entries.length < 3 ? [] : entries;
}

/** Anchor-link TOC for headings only — renders nothing below 3 headings, where a TOC box
 *  would be pure clutter for a short post. Wide screens show the same list in a side column. */
export function TableOfContents({ blocks }: { blocks: BlogContentBlock[] }) {
  const entries = tocEntries(blocks);
  if (!entries.length) return null;

  return (
    <nav aria-label="Table of contents" className="mb-8 rounded-2xl border border-white/10 bg-cosmic-light/40 p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-white/55">On this page</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {entries.map((e) => (
          <li key={e.id} className={e.level === 3 ? 'pl-4' : ''}>
            <a href={`#${e.id}`} className="text-white/60 hover:text-gold-pale">{e.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
