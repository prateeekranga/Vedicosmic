import { headingSlugs } from '@/lib/blogUtils';
import type { BlogContentBlock } from '@/types/blog.types';

/** Anchor-link TOC for headings only — renders nothing below 3 headings, where a TOC box
 *  would be pure clutter for a short post. */
export function TableOfContents({ blocks }: { blocks: BlogContentBlock[] }) {
  const ids = headingSlugs(blocks);
  const entries = blocks
    .map((b, i) => (b.type === 'heading' ? { id: ids[i], text: b.text, level: b.level } : null))
    .filter((e): e is { id: string; text: string; level: 2 | 3 } => e !== null);

  if (entries.length < 3) return null;

  return (
    <nav aria-label="Table of contents" className="mb-8 rounded-2xl border border-white/10 bg-cosmic-light/30 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">On this page</p>
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
