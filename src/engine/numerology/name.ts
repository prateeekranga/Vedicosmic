/** Turns what a visitor typed into the letters the name systems can count. */

export interface NameInput {
  raw: string;
  /** Words in order, upper case, A–Z and digits only. */
  words: string[];
  /** All the words joined, without spaces. */
  letters: string;
  /** True when the text held letters from another script (for example Devanagari) that were dropped. */
  hasNonLatin: boolean;
}

/**
 * Accents are removed (é counts as E), punctuation is dropped, and words split on spaces and
 * hyphens. Both name systems here are defined for the Latin alphabet only, so letters from other
 * scripts cannot be counted; `hasNonLatin` lets the page ask for the English spelling instead of
 * silently returning zero.
 */
export function normalizeName(raw: string): NameInput {
  const stripped = raw.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  const hasNonLatin = /[^\p{ASCII}]/u.test(stripped.replace(/[^\p{L}]/gu, ''));
  const words = stripped
    .split(/[\s\-–—_/]+/u)
    .map((w) => w.replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean);
  return { raw, words, letters: words.join(''), hasNonLatin };
}
