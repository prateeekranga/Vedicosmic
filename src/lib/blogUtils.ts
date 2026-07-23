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
    case 'cta-tool': case 'cta-course': case 'divider': return '';
  }
}

/** ~200 wpm over every text-bearing block, so reading time can never go stale relative to the content. */
export function estimateReadingTime(blocks: BlogContentBlock[]): number {
  const words = blocks.reduce((sum, b) => sum + textOf(b).split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
