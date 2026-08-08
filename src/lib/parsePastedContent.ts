import type { BlogContentBlock } from '@/types/blog.types';

/** Best-effort Markdown-lite → BlogContentBlock[] converter for the admin editor's "paste &
 *  convert" tool, so a whole draft can be written in a text editor and dropped in at once
 *  instead of built block-by-block. Recognises the same `**bold**` convention the existing
 *  content blocks already use (left untouched — BlogContentRenderer handles it), plus
 *  headings, bullet/numbered lists, and blockquotes, split on blank lines. Anything
 *  unrecognised becomes a plain paragraph — nothing pasted is ever silently dropped. */
export function parsePastedContent(raw: string): BlogContentBlock[] {
  const chunks = raw.replace(/\r\n/g, '\n').split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  const blocks: BlogContentBlock[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (lines.length === 1 && /^###\s+/.test(lines[0])) {
      blocks.push({ type: 'heading', level: 3, text: lines[0].replace(/^###\s+/, '') });
      continue;
    }
    if (lines.length === 1 && /^#{1,2}\s+/.test(lines[0])) {
      blocks.push({ type: 'heading', level: 2, text: lines[0].replace(/^#{1,2}\s+/, '') });
      continue;
    }
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      blocks.push({ type: 'list', style: 'bullet', items: lines.map((l) => l.replace(/^[-*]\s+/, '')) });
      continue;
    }
    if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      blocks.push({ type: 'list', style: 'number', items: lines.map((l) => l.replace(/^\d+[.)]\s+/, '')) });
      continue;
    }
    if (lines.every((l) => /^>\s?/.test(l))) {
      blocks.push({ type: 'quote', text: lines.map((l) => l.replace(/^>\s?/, '')).join(' ') });
      continue;
    }
    blocks.push({ type: 'paragraph', text: lines.join(' ') });
  }

  return blocks;
}
