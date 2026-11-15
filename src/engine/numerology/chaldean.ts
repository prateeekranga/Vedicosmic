/**
 * Chaldean name numerology, in the form set out by Cheiro (Book of Numbers, 1926): letters carry
 * the values 1–8 (no letter is 9), the total of the whole name is its compound number, and the
 * compound added down to one digit is the root. Digits typed into a name keep their own value.
 */
import { digitSum, reduce, rootOf, showReduction, type CalcStep, type Digit } from './core';
import { normalizeName, type NameInput } from './name';

export const CHALDEAN_VALUES: Readonly<Record<string, number>> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

/** Cheiro describes the compound numbers from 10 to 52; a larger total is added down until it falls in that range. */
export const COMPOUND_MIN = 10;
export const COMPOUND_MAX = 52;

/** The compound number whose reading applies to a total: the total, added down while above 52; null below 10. */
export function compoundKeyOf(total: number): number | null {
  let key = total;
  while (key > COMPOUND_MAX) key = digitSum(key);
  return key >= COMPOUND_MIN ? key : null;
}

export interface ChaldeanWord {
  word: string;
  letters: { ch: string; value: number }[];
  total: number;
  root: Digit;
}

export interface ChaldeanResult {
  name: NameInput;
  words: ChaldeanWord[];
  /** The total of every letter and digit in the name. */
  compound: number;
  /** The compound number whose meaning applies (10–52), or null when the total is a single digit. */
  compoundKey: number | null;
  root: Digit;
  /** The other common method: each word added down first, then the word roots added. */
  perWordTotal: number;
  steps: CalcStep[];
}

const valueOf = (ch: string): number => (ch >= '0' && ch <= '9' ? Number(ch) : CHALDEAN_VALUES[ch] ?? 0);

/** Null when the text has nothing that can be counted (no A–Z letters and no non-zero digits). */
export function chaldeanName(raw: string): ChaldeanResult | null {
  const name = normalizeName(raw);
  const words: ChaldeanWord[] = name.words
    .map((word) => {
      const letters = word.split('').map((ch) => ({ ch, value: valueOf(ch) }));
      const total = letters.reduce((a, l) => a + l.value, 0);
      return { word, letters, total };
    })
    .filter((w) => w.total > 0)
    .map((w) => ({ ...w, root: rootOf(w.total) }));
  if (!words.length) return null;

  const compound = words.reduce((a, w) => a + w.total, 0);
  const root = rootOf(compound);
  const compoundKey = compoundKeyOf(compound);
  const perWordTotal = words.reduce((a, w) => a + w.root, 0);

  const reduction = reduce(compound);
  const steps: CalcStep[] = [
    ...words.map((w, i) => ({
      key: `word-${i}`, label: w.word,
      working: `${w.letters.map((l) => `${l.ch} ${l.value}`).join(' + ')}`,
      result: String(w.total),
    })),
    {
      key: 'compound', label: 'Compound number',
      working: words.length > 1 ? `${words.map((w) => w.total).join(' + ')} = ${compound}` : `The whole name adds to ${compound}`,
      result: String(compound),
    },
    {
      key: 'root', label: 'Root number',
      working: reduction.trail.length > 1 ? showReduction(reduction) : `${compound} is already a single digit`,
      result: String(root),
    },
  ];

  return { name, words, compound, compoundKey, root, perWordTotal, steps };
}
