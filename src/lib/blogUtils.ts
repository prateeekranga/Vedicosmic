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
