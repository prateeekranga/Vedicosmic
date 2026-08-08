import type { BlogContentBlock } from '@/types/blog.types';
import type { CheckStatus, AnalysisCheck, Analysis } from '@/lib/readability';

function textOf(block: BlogContentBlock): string {
  switch (block.type) {
    case 'heading': return block.text;
    case 'paragraph': return block.text;
    case 'quote': return block.text;
    case 'list': return block.items.join(' ');
    default: return '';
  }
}
function wordsOf(text: string): string[] {
  return text.replace(/\*\*/g, '').split(/\s+/).map((w) => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')).filter(Boolean);
}
function contains(haystack: string, phrase: string): boolean {
  return haystack.toLowerCase().includes(phrase.toLowerCase());
}
/** Non-overlapping occurrences of `phrase` as a whole-word run inside `text`. */
function countOccurrences(text: string, phrase: string): number {
  const escaped = phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!escaped) return 0;
  const re = new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, 'gi');
  return (text.match(re) ?? []).length;
}

function overallScore(checks: AnalysisCheck[]): { score: CheckStatus; scoreLabel: string } {
  const points = checks.reduce((s, c) => s + (c.status === 'good' ? 2 : c.status === 'ok' ? 1 : 0), 0);
  const pct = checks.length ? (points / (checks.length * 2)) * 100 : 0;
  if (pct >= 80) return { score: 'good', scoreLabel: 'Good SEO score' };
  if (pct >= 50) return { score: 'ok', scoreLabel: 'OK SEO score' };
  return { score: 'bad', scoreLabel: 'Needs improvement' };
}

export interface SeoAnalysisInput {
  title: string;
  seoTitle: string;
  slug: string;
  metaDescription: string;
  focusKeyphrase: string;
  blocks: BlogContentBlock[];
  /** Every other post's tags — powers the "previously used keyphrase" check, the same way
   *  Yoast warns when a keyphrase is reused across posts (risk of duplicate/competing content). */
  otherPosts: { title: string; tags: string[] }[];
}

/** Yoast/Rank Math-style keyphrase analysis. Every check that needs an outbound-link block
 *  (Yoast's "add links to external sources" check) is intentionally left out — this content
 *  model has no generic hyperlink block type, only specific cta-tool/cta-course/internal-link
 *  blocks, so a real outbound-link check isn't possible without a content-model change. */
export function analyzeSeo(input: SeoAnalysisInput): Analysis {
  const { title, seoTitle, slug, metaDescription, focusKeyphrase, blocks, otherPosts } = input;
  const kp = focusKeyphrase.trim();
  const displayTitle = seoTitle.trim() || (title ? `${title} · VediCosmic` : '');

  if (!kp) {
    return {
      checks: [{ id: 'no-keyphrase', status: 'bad', text: 'No focus keyphrase set yet — add one above to see a full SEO analysis.' }],
      score: 'bad', scoreLabel: 'No focus keyphrase',
    };
  }

  const checks: AnalysisCheck[] = [];
  const kpWordCount = kp.split(/\s+/).filter(Boolean).length;

  checks.push({
    id: 'keyphrase-length',
    status: kpWordCount <= 4 ? 'good' : kpWordCount <= 6 ? 'ok' : 'bad',
    text: kpWordCount <= 4
      ? `Focus keyphrase is ${kpWordCount} word${kpWordCount === 1 ? '' : 's'} — a good, specific length.`
      : `Focus keyphrase is ${kpWordCount} words — consider shortening it to 2-4 words so people actually search for it.`,
  });

  const inTitle = contains(title, kp);
  checks.push({
    id: 'keyphrase-in-title',
    status: inTitle ? 'good' : 'bad',
    text: inTitle
      ? (title.toLowerCase().startsWith(kp.toLowerCase()) ? 'The title starts with the focus keyphrase.' : 'The focus keyphrase appears in the title.')
      : 'The focus keyphrase does not appear in the title.',
  });

  const inSlug = contains(slug.replace(/-/g, ' '), kp);
  checks.push({ id: 'keyphrase-in-slug', status: inSlug ? 'good' : 'bad', text: inSlug ? 'The focus keyphrase appears in the URL slug.' : 'The focus keyphrase does not appear in the URL slug.' });

  const inMeta = contains(metaDescription, kp);
  checks.push({ id: 'keyphrase-in-meta', status: inMeta ? 'good' : 'bad', text: inMeta ? 'The focus keyphrase appears in the meta description.' : 'The focus keyphrase does not appear in the meta description.' });

  const proseText = blocks.map(textOf).join(' ');
  const totalWords = wordsOf(proseText).length;
  const occurrences = countOccurrences(proseText, kp);
  const density = totalWords ? (occurrences / totalWords) * 100 : 0;
  checks.push({
    id: 'keyphrase-density',
    status: occurrences === 0 ? 'bad' : density < 0.5 ? 'ok' : density <= 3 ? 'good' : 'bad',
    text: occurrences === 0
      ? 'The focus keyphrase does not appear anywhere in the post content.'
      : density > 3
        ? `The keyphrase appears ${occurrences} times (${density.toFixed(1)}% density) — that's keyword stuffing; use it more sparingly.`
        : density < 0.5
          ? `The keyphrase appears only ${occurrences} time${occurrences === 1 ? '' : 's'} (${density.toFixed(2)}% density) — use it a little more often.`
          : `The keyphrase appears ${occurrences} times (${density.toFixed(1)}% density) — a healthy amount.`,
  });

  const firstParagraph = blocks.find((b) => b.type === 'paragraph');
  const inIntro = !!firstParagraph && contains(textOf(firstParagraph), kp);
  checks.push({
    id: 'keyphrase-in-intro',
    status: firstParagraph ? (inIntro ? 'good' : 'bad') : 'ok',
    text: !firstParagraph ? 'No introduction paragraph yet to check.' : inIntro ? 'The focus keyphrase appears in the opening paragraph.' : 'The focus keyphrase does not appear in the opening paragraph — mention it early.',
  });

  const headings = blocks.filter((b): b is Extract<BlogContentBlock, { type: 'heading' }> => b.type === 'heading');
  const inHeading = headings.some((h) => contains(h.text, kp));
  checks.push({
    id: 'keyphrase-in-heading',
    status: headings.length === 0 ? 'ok' : inHeading ? 'good' : 'bad',
    text: headings.length === 0 ? 'No subheadings yet to check.' : inHeading ? 'The focus keyphrase appears in at least one subheading.' : 'The focus keyphrase does not appear in any subheading — add it to one.',
  });

  const images = blocks.filter((b): b is Extract<BlogContentBlock, { type: 'image' }> => b.type === 'image');
  const inAlt = images.some((img) => contains(img.alt, kp));
  checks.push({
    id: 'keyphrase-in-alt',
    status: images.length === 0 ? 'ok' : inAlt ? 'good' : 'bad',
    text: images.length === 0 ? 'No images in the content yet to check alt text on.' : inAlt ? 'At least one image alt attribute contains the focus keyphrase.' : 'None of the image alt attributes contain the focus keyphrase.',
  });

  const reusedOn = otherPosts.find((p) => p.tags[0]?.toLowerCase() === kp.toLowerCase());
  checks.push({
    id: 'keyphrase-reuse',
    status: reusedOn ? 'ok' : 'good',
    text: reusedOn ? `This keyphrase is already the focus of "${reusedOn.title}" — consider a more specific keyphrase, or link the two posts together.` : 'This focus keyphrase isn\'t used by any other post.',
  });

  checks.push({
    id: 'title-length',
    status: displayTitle.length >= 40 && displayTitle.length <= 60 ? 'good' : displayTitle.length >= 30 && displayTitle.length <= 70 ? 'ok' : 'bad',
    text: `SEO title is ${displayTitle.length} characters — ${displayTitle.length < 40 ? 'a bit short, aim for 40-60.' : displayTitle.length > 60 ? 'a bit long; Google may truncate past ~60.' : 'a good length.'}`,
  });

  checks.push({
    id: 'meta-length',
    status: metaDescription.length >= 120 && metaDescription.length <= 156 ? 'good' : metaDescription.length >= 80 && metaDescription.length <= 170 ? 'ok' : 'bad',
    text: `Meta description is ${metaDescription.length} characters — ${metaDescription.length < 120 ? 'room for more, aim for 120-156.' : metaDescription.length > 156 ? 'Google may truncate past ~156.' : 'a good length.'}`,
  });

  return { checks, ...overallScore(checks) };
}
