import type { BlogContentBlock } from '@/types/blog.types';

const WORDS_PER_MINUTE = 200;

function textOf(block: BlogContentBlock): string {
  switch (block.type) {
    case 'heading': return block.text;
    case 'paragraph': return block.text;
    case 'list': return block.items.join(' ');
    case 'quote': return block.text;
    case 'callout': return block.text;
    case 'image': return block.caption ?? '';
    case 'diagram': return block.caption ?? '';
    case 'cta-tool': case 'cta-course': case 'internal-link': case 'divider': return '';
  }
}

function wordCountOf(blocks: BlogContentBlock[]): number {
  return blocks.reduce((sum, b) => sum + textOf(b).split(/\s+/).filter(Boolean).length, 0);
}

/** ~200 wpm over every text-bearing block, so reading time can never go stale relative to the content. */
export function estimateReadingTime(blocks: BlogContentBlock[]): number {
  return Math.max(1, Math.round(wordCountOf(blocks) / WORDS_PER_MINUTE));
}

/** Total word count across all text-bearing blocks — feeds BlogPosting JSON-LD's `wordCount`. */
export function estimateWordCount(blocks: BlogContentBlock[]): number {
  return wordCountOf(blocks);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** One id per block (empty string for non-headings), deduped so repeated heading text never collides —
 *  shared by BlogContentRenderer (renders the id) and TableOfContents (links to it), so they can't drift apart. */
export function headingSlugs(blocks: BlogContentBlock[]): string[] {
  const seen = new Map<string, number>();
  return blocks.map((b) => {
    if (b.type !== 'heading') return '';
    const base = slugify(b.text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}
