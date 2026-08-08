import type { BlogContentBlock } from '@/types/blog.types';

export type CheckStatus = 'good' | 'ok' | 'bad';
export interface AnalysisCheck { id: string; status: CheckStatus; text: string; }
export interface Analysis { checks: AnalysisCheck[]; score: CheckStatus; scoreLabel: string }

const TRANSITION_WORDS = [
  'however', 'therefore', 'moreover', 'furthermore', 'in addition', 'additionally', 'for example',
  'for instance', 'as a result', 'in contrast', 'on the other hand', 'in conclusion', 'consequently',
  'meanwhile', 'nevertheless', 'nonetheless', 'similarly', 'likewise', 'in fact', 'indeed', 'thus',
  'hence', 'also', 'first', 'second', 'third', 'finally', 'next', 'then', 'because', 'since',
  'although', 'though', 'unless', 'whereas', 'while', 'importantly', 'notably', 'specifically',
  'in other words', 'to summarize', 'in summary', 'overall', 'ultimately', 'this means', 'such as',
  'in particular', 'above all', 'in short', 'as well as', 'besides', 'accordingly', 'otherwise',
];

// Rough irregular past participles the "-ed" suffix check would miss — not exhaustive, just the
// common ones that show up in this site's kind of writing (guides, explainers).
const IRREGULAR_PARTICIPLES = new Set([
  'done', 'made', 'said', 'known', 'shown', 'given', 'taken', 'seen', 'found', 'kept', 'held',
  'built', 'brought', 'thought', 'taught', 'written', 'spoken', 'chosen', 'broken', 'worn', 'born',
]);

const textBlockTypes = new Set(['paragraph', 'quote']);

function blockText(block: BlogContentBlock): string {
  if (block.type === 'paragraph' || block.type === 'quote') return block.text;
  if (block.type === 'list') return block.items.join('. ');
  return '';
}

/** Strips the `**bold**` markers this content model uses inline, so they don't get counted as
 *  word characters or thrown off sentence splitting. */
function stripMarkup(text: string): string {
  return text.replace(/\*\*/g, '');
}

function splitSentences(text: string): string[] {
  return stripMarkup(text)
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitWords(text: string): string[] {
  return stripMarkup(text).split(/\s+/).map((w) => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')).filter(Boolean);
}

/** Approximate syllable counter (vowel-group heuristic with common English suffix adjustments) —
 *  the same kind of heuristic Yoast's own readability analysis uses; not dictionary-perfect, but
 *  accurate enough to make the Flesch score directionally useful. */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/e$/, '').replace(/^y/, '');
  const matches = trimmed.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function fleschReadingEase(sentences: string[], words: string[]): number {
  if (sentences.length === 0 || words.length === 0) return 0;
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  return 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
}

/** Heuristic-only, like the rest of this file — flags "be" verb + a likely past participle
 *  within the next couple of words. Will miss/over-flag some sentences; good enough to nudge
 *  toward more active phrasing, which is all this check is really for. */
function isPassiveSentence(sentence: string): boolean {
  const words = splitWords(sentence).map((w) => w.toLowerCase());
  const beForms = new Set(['is', 'are', 'was', 'were', 'be', 'been', 'being', 'am']);
  for (let i = 0; i < words.length; i++) {
    if (!beForms.has(words[i])) continue;
    for (let j = i + 1; j < Math.min(i + 4, words.length); j++) {
      const candidate = words[j];
      if (candidate === 'not' || candidate.length === 0) continue;
      if (IRREGULAR_PARTICIPLES.has(candidate) || /(?:ed|en)$/.test(candidate)) return true;
      break; // only check the first non-"not" word after the be-form
    }
  }
  return false;
}

function scoreFromRatio(ratio: number, goodMax: number, okMax: number): CheckStatus {
  if (ratio <= goodMax) return 'good';
  if (ratio <= okMax) return 'ok';
  return 'bad';
}

function overallScore(checks: AnalysisCheck[]): { score: CheckStatus; scoreLabel: string } {
  if (checks.length === 0) return { score: 'bad', scoreLabel: 'Not enough content yet' };
  const points = checks.reduce((s, c) => s + (c.status === 'good' ? 2 : c.status === 'ok' ? 1 : 0), 0);
  const pct = (points / (checks.length * 2)) * 100;
  if (pct >= 80) return { score: 'good', scoreLabel: 'Good readability' };
  if (pct >= 50) return { score: 'ok', scoreLabel: 'OK readability' };
  return { score: 'bad', scoreLabel: 'Needs improvement' };
}

/** Yoast-style readability analysis over the post's actual prose (paragraphs, quotes, list
 *  items) — Flesch Reading Ease plus the supporting checks (sentence length, paragraph length,
 *  passive voice, transition words, subheading distribution, repeated sentence openers) that
 *  make up the rest of a real readability metabox, not just a single score. */
export function analyzeReadability(blocks: BlogContentBlock[]): Analysis & { fleschScore: number } {
  const proseText = blocks.filter((b) => textBlockTypes.has(b.type)).map(blockText).join(' ');
  const allSentences = blocks.flatMap((b) => splitSentences(blockText(b)));
  const words = splitWords(proseText);
  const checks: AnalysisCheck[] = [];

  if (words.length < 30) {
    return {
      checks: [{ id: 'too-short', status: 'bad', text: 'Not enough written content yet to analyse readability — add a few paragraphs first.' }],
      score: 'bad', scoreLabel: 'Not enough content yet', fleschScore: 0,
    };
  }

  const flesch = fleschReadingEase(allSentences, words);
  checks.push({
    id: 'flesch',
    status: flesch >= 60 ? 'good' : flesch >= 30 ? 'ok' : 'bad',
    text: flesch >= 60
      ? `Flesch Reading Ease is ${flesch.toFixed(0)} — easy for most readers to follow.`
      : flesch >= 30
        ? `Flesch Reading Ease is ${flesch.toFixed(0)} — fairly difficult. Shorter sentences and simpler words would help.`
        : `Flesch Reading Ease is ${flesch.toFixed(0)} — hard to read. Break up long sentences and swap in simpler words.`,
  });

  const longSentences = allSentences.filter((s) => splitWords(s).length > 20);
  const longSentenceRatio = allSentences.length ? longSentences.length / allSentences.length : 0;
  checks.push({
    id: 'sentence-length',
    status: scoreFromRatio(longSentenceRatio, 0.25, 0.4),
    text: `${Math.round(longSentenceRatio * 100)}% of sentences are over 20 words${longSentenceRatio > 0.25 ? ' — aim for under 25%.' : '.'}`,
  });

  const paragraphs = blocks.filter((b) => b.type === 'paragraph');
  const longParagraphs = paragraphs.filter((b) => splitWords(blockText(b)).length > 150);
  checks.push({
    id: 'paragraph-length',
    status: paragraphs.length === 0 ? 'ok' : longParagraphs.length === 0 ? 'good' : longParagraphs.length <= 1 ? 'ok' : 'bad',
    text: longParagraphs.length === 0
      ? 'No paragraph runs longer than 150 words.'
      : `${longParagraphs.length} paragraph${longParagraphs.length === 1 ? '' : 's'} run over 150 words — consider splitting ${longParagraphs.length === 1 ? 'it' : 'them'} up.`,
  });

  const passiveCount = allSentences.filter(isPassiveSentence).length;
  const passiveRatio = allSentences.length ? passiveCount / allSentences.length : 0;
  checks.push({
    id: 'passive-voice',
    status: scoreFromRatio(passiveRatio, 0.1, 0.25),
    text: `Approximately ${Math.round(passiveRatio * 100)}% of sentences use passive voice${passiveRatio > 0.1 ? ' — try rephrasing some in active voice.' : '.'}`,
  });

  const transitionCount = allSentences.filter((s) => {
    const lower = s.toLowerCase();
    return TRANSITION_WORDS.some((t) => lower.includes(t));
  }).length;
  const transitionRatio = allSentences.length ? transitionCount / allSentences.length : 0;
  checks.push({
    id: 'transition-words',
    status: transitionRatio >= 0.3 ? 'good' : transitionRatio >= 0.15 ? 'ok' : 'bad',
    text: `${Math.round(transitionRatio * 100)}% of sentences contain a transition word${transitionRatio < 0.3 ? ' — aim for around 30% to help ideas flow.' : '.'}`,
  });

  // Subheading distribution: word count of prose between one heading and the next.
  let sinceHeading = 0; let maxRun = 0; let sawHeading = false;
  for (const b of blocks) {
    if (b.type === 'heading') { sawHeading = true; maxRun = Math.max(maxRun, sinceHeading); sinceHeading = 0; }
    else sinceHeading += splitWords(blockText(b)).length;
  }
  maxRun = Math.max(maxRun, sinceHeading);
  checks.push({
    id: 'subheading-distribution',
    status: !sawHeading ? (words.length > 300 ? 'bad' : 'ok') : maxRun <= 300 ? 'good' : maxRun <= 400 ? 'ok' : 'bad',
    text: !sawHeading
      ? (words.length > 300 ? 'No subheadings yet, and the post is long enough to need some — add H2s to break it up.' : 'No subheadings yet — fine for a short post, but add some if it grows.')
      : maxRun <= 300
        ? 'Text between subheadings stays under 300 words throughout.'
        : `One section runs to about ${maxRun} words without a subheading — consider adding one.`,
  });

  // Consecutive sentences sharing the same first word.
  let repeatRun = 1; let worstRun = 1;
  for (let i = 1; i < allSentences.length; i++) {
    const prevFirst = splitWords(allSentences[i - 1])[0]?.toLowerCase();
    const curFirst = splitWords(allSentences[i])[0]?.toLowerCase();
    if (prevFirst && curFirst && prevFirst === curFirst) { repeatRun++; worstRun = Math.max(worstRun, repeatRun); }
    else repeatRun = 1;
  }
  checks.push({
    id: 'consecutive-sentences',
    status: worstRun < 3 ? 'good' : worstRun === 3 ? 'ok' : 'bad',
    text: worstRun < 3
      ? 'No 3+ consecutive sentences start with the same word.'
      : `${worstRun} consecutive sentences start with the same word somewhere in the post — vary the openings.`,
  });

  return { checks, ...overallScore(checks), fleschScore: flesch };
}
