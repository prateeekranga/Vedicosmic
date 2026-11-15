/**
 * Western (Pythagorean) numerology: the core numbers from a date of birth and a name.
 *
 * One rule throughout, the "component" method: each part (month, day, year; or each word of the
 * name) is added down on its own first, keeping 11, 22 and 33, and the parts are then added and
 * reduced again. Where adding every digit in one go would give a different answer, that other
 * answer is reported too, so the page can show both instead of hiding the disagreement.
 */
import {
  DIGITS, MASTER_NUMBERS, ageOn, digitSum, isValidYMD, reduce, rootOf,
  type Digit, type Reduction, type YMD,
} from './core';
import type { NameInput } from './name';

export const PYTHAGOREAN_VALUES: Readonly<Record<string, number>> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

/** A, E, I, O and U. Y is counted as a consonant throughout. */
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export interface CoreNumber extends Reduction {
  /** The parts that were added: month, day and year, or the words of the name. */
  parts: { label: string; total: number; reduced: number }[];
  /** The answer from adding everything in one go, when it differs from `value`. */
  alternative: { method: 'all-digits' | 'whole-name'; value: number } | null;
}

function fromParts(parts: { label: string; total: number }[], wholeTotal: number, method: 'all-digits' | 'whole-name'): CoreNumber {
  const reducedParts = parts.map((p) => ({ ...p, reduced: reduce(p.total, 'keep').value }));
  const sum = reducedParts.reduce((a, p) => a + p.reduced, 0);
  const result = reduce(sum, 'keep');
  const other = reduce(wholeTotal, 'keep').value;
  return { ...result, parts: reducedParts, alternative: other !== result.value ? { method, value: other } : null };
}

function requireDate(date: YMD): void {
  if (!isValidYMD(date.y, date.m, date.d)) throw new RangeError(`Not a calendar date: ${date.y}-${date.m}-${date.d}`);
}

/** Life Path: month, day and year each added down (masters kept), then added together and reduced. */
export function lifePath(date: YMD): CoreNumber {
  requireDate(date);
  const everyDigit = digitSum(date.d) + digitSum(date.m) + digitSum(date.y);
  return fromParts(
    [{ label: 'Month', total: date.m }, { label: 'Day', total: date.d }, { label: 'Year', total: date.y }],
    everyDigit, 'all-digits',
  );
}

/** Birthday number: the day of the month, reduced (11 and 22 kept). */
export function birthdayNumber(date: YMD): CoreNumber {
  requireDate(date);
  return { ...reduce(date.d, 'keep'), parts: [{ label: 'Day', total: date.d, reduced: reduce(date.d, 'keep').value }], alternative: null };
}

const letterTotal = (word: string, keep: (ch: string) => boolean) =>
  word.split('').reduce((sum, ch) => sum + (keep(ch) ? PYTHAGOREAN_VALUES[ch] ?? 0 : 0), 0);

function nameNumber(name: NameInput, keep: (ch: string) => boolean): CoreNumber | null {
  const parts = name.words
    .map((w) => ({ label: w, total: letterTotal(w, keep) }))
    .filter((p) => p.total > 0);
  if (!parts.length) return null;
  return fromParts(parts, parts.reduce((a, p) => a + p.total, 0), 'whole-name');
}

const isLetter = (ch: string) => ch >= 'A' && ch <= 'Z';

/** Expression (Destiny) number: every letter of the name. Null when the name has no A–Z letters. */
export function expression(name: NameInput): CoreNumber | null {
  return nameNumber(name, isLetter);
}

/** Soul Urge (Heart's Desire) number: the vowels. Null when the name has none. */
export function soulUrge(name: NameInput): CoreNumber | null {
  return nameNumber(name, (ch) => VOWELS.has(ch));
}

/** Personality number: the consonants. Null when the name has none. */
export function personality(name: NameInput): CoreNumber | null {
  return nameNumber(name, (ch) => isLetter(ch) && !VOWELS.has(ch));
}

/** Maturity number: Life Path plus Expression, reduced (masters kept). */
export function maturity(lp: CoreNumber, ex: CoreNumber): CoreNumber {
  const total = lp.value + ex.value;
  return {
    ...reduce(total, 'keep'),
    parts: [{ label: 'Life Path', total: lp.value, reduced: lp.value }, { label: 'Expression', total: ex.value, reduced: ex.value }],
    alternative: null,
  };
}

/** Karmic lessons: the numbers 1–9 that no letter of the name carries. */
export function karmicLessons(name: NameInput): Digit[] {
  const present = new Set(name.letters.split('').map((ch) => PYTHAGOREAN_VALUES[ch]).filter(Boolean));
  return DIGITS.filter((d) => !present.has(d));
}

/** Karmic debt numbers found among a person's core numbers, with the number that carries each. */
export function karmicDebts(numbers: { label: string; number: CoreNumber | null }[]): { debt: 13 | 14 | 16 | 19; from: string }[] {
  return numbers.flatMap(({ label, number }) => (number?.karmicDebt ? [{ debt: number.karmicDebt, from: label }] : []));
}

export interface Pinnacle {
  index: 1 | 2 | 3 | 4;
  /** The pinnacle number (11 and 22 kept). */
  number: number;
  /** The challenge that runs beside it, 0–8. */
  challenge: number;
  fromAge: number;
  /** Null for the last pinnacle, which runs for the rest of life. */
  toAge: number | null;
}

/**
 * The four pinnacles and challenges. Month, day and year are each taken down to one digit; the
 * first pinnacle ends at 36 minus the Life Path digit and the next two last nine years each.
 */
export function pinnacles(date: YMD): Pinnacle[] {
  requireDate(date);
  const m = rootOf(date.m), d = rootOf(date.d), y = rootOf(digitSum(date.y));
  // Sums of two single digits reach 18 at most, so 11 is the only master number a pinnacle can be.
  const keep = (n: number) => reduce(n, 'keep').value;
  const p1 = keep(m + d), p2 = keep(d + y);
  const numbers = [p1, p2, keep(digitOf(p1) + digitOf(p2)), keep(m + y)];
  const c1 = Math.abs(m - d), c2 = Math.abs(d - y);
  const challenges = [c1, c2, Math.abs(c1 - c2), Math.abs(m - y)];
  const firstEnd = 36 - lifePath(date).root;
  const bounds: [number, number | null][] = [[0, firstEnd], [firstEnd, firstEnd + 9], [firstEnd + 9, firstEnd + 18], [firstEnd + 18, null]];
  return bounds.map(([fromAge, toAge], i) => ({
    index: (i + 1) as Pinnacle['index'], number: numbers[i], challenge: challenges[i], fromAge, toAge,
  }));
}
/** A pinnacle's value as it enters the third pinnacle's sum: a master number comes down to its digit first. */
function digitOf(n: number): number {
  return MASTER_NUMBERS.includes(n) ? rootOf(n) : n;
}

/** The pinnacle in force at a given age. */
export function pinnacleAt(list: Pinnacle[], age: number): Pinnacle {
  return list.find((p) => age >= p.fromAge && (p.toAge === null || age < p.toAge)) ?? list[list.length - 1];
}

export interface PersonalCycles { year: Digit; month: Digit; day: Digit; age: number }

/**
 * Personal year, month and day for a calendar date. The personal year is the birth month and day
 * added to the calendar year, and it changes on 1 January (some teachers change it on the
 * birthday instead).
 */
export function personalCycles(birth: YMD, on: YMD): PersonalCycles {
  requireDate(birth);
  requireDate(on);
  const year = rootOf(digitSum(birth.m) + digitSum(birth.d) + digitSum(on.y));
  const month = rootOf(year + digitSum(on.m));
  const day = rootOf(month + digitSum(on.d));
  return { year, month, day, age: ageOn(birth, on) };
}

/** How many letters of the name carry each number 1–9. */
export function letterCounts(name: NameInput): Readonly<Record<Digit, number>> {
  const counts: Record<Digit, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const ch of name.letters) {
    const v = PYTHAGOREAN_VALUES[ch] as Digit | undefined;
    if (v) counts[v] += 1;
  }
  return counts;
}

export interface HiddenPassion {
  /** The number carried by the most letters; more than one when they tie. */
  numbers: Digit[];
  /** How many letters carry it. */
  count: number;
}

/** Hidden Passion: the number that the most letters of the name carry. Null when the name has no letters. */
export function hiddenPassion(name: NameInput): HiddenPassion | null {
  const counts = letterCounts(name);
  const count = Math.max(...DIGITS.map((d) => counts[d]));
  return count > 0 ? { numbers: DIGITS.filter((d) => counts[d] === count), count } : null;
}

/** Subconscious Self: how many of the nine numbers the name carries, which is 9 minus the karmic lessons. */
export function subconsciousSelf(name: NameInput): number | null {
  const counts = letterCounts(name);
  const present = DIGITS.filter((d) => counts[d] > 0).length;
  return present > 0 ? present : null;
}

export interface BalanceNumber { value: Digit; initials: { letter: string; value: number }[]; total: number }

/** Balance number: the first letter of each word of the name, added and brought down to one digit. */
export function balanceNumber(name: NameInput): BalanceNumber | null {
  const initials = name.words
    .map((w) => w.split('').find(isLetter))
    .filter((ch): ch is string => !!ch)
    .map((letter) => ({ letter, value: PYTHAGOREAN_VALUES[letter] }));
  if (!initials.length) return null;
  const total = initials.reduce((a, i) => a + i.value, 0);
  return { value: rootOf(total), initials, total };
}

/** The first word of the name that has a letter in it: the name a person is called by. */
function firstName(name: NameInput): string | null {
  return name.words.map((w) => w.split('').filter(isLetter).join('')).find((w) => w.length > 0) ?? null;
}

/** Rational Thought number: the letters of the first name plus the day of birth, reduced (masters kept). */
export function rationalThought(name: NameInput, date: YMD): CoreNumber | null {
  requireDate(date);
  const first = firstName(name);
  if (!first) return null;
  const nameTotal = letterTotal(first, isLetter);
  return {
    ...reduce(nameTotal + date.d, 'keep'),
    parts: [{ label: first, total: nameTotal, reduced: nameTotal }, { label: 'Day', total: date.d, reduced: date.d }],
    alternative: null,
  };
}

export interface SpecialLetters {
  /** The first letter of the first name. */
  cornerstone: string;
  /** The last letter of the first name. */
  capstone: string;
  /** The first of A, E, I, O, U in the first name; null when it has none. */
  firstVowel: string | null;
}

/** Cornerstone, Capstone and First Vowel, all read from the first name. */
export function specialLetters(name: NameInput): SpecialLetters | null {
  const first = firstName(name);
  if (!first) return null;
  return { cornerstone: first[0], capstone: first[first.length - 1], firstVowel: first.split('').find((ch) => VOWELS.has(ch)) ?? null };
}

export type ExpressionPlane = 'physical' | 'mental' | 'emotional' | 'intuitive';

/** The plane each letter belongs to in the Planes of Expression. */
export const LETTER_PLANE: Readonly<Record<string, ExpressionPlane>> = {
  D: 'physical', E: 'physical', M: 'physical', W: 'physical',
  A: 'mental', G: 'mental', H: 'mental', J: 'mental', L: 'mental', N: 'mental', P: 'mental',
  B: 'emotional', I: 'emotional', O: 'emotional', R: 'emotional', S: 'emotional', T: 'emotional', X: 'emotional', Z: 'emotional',
  C: 'intuitive', F: 'intuitive', K: 'intuitive', Q: 'intuitive', U: 'intuitive', V: 'intuitive', Y: 'intuitive',
};

export interface PlanesOfExpression {
  counts: Readonly<Record<ExpressionPlane, number>>;
  /** The plane with the most letters; more than one when they tie. */
  strongest: ExpressionPlane[];
  letters: number;
}

/** Planes of Expression: how the letters of the whole name divide between four ways of working. */
export function planesOfExpression(name: NameInput): PlanesOfExpression | null {
  const counts: Record<ExpressionPlane, number> = { physical: 0, mental: 0, emotional: 0, intuitive: 0 };
  let letters = 0;
  for (const ch of name.letters) {
    const plane = LETTER_PLANE[ch];
    if (plane) { counts[plane] += 1; letters += 1; }
  }
  if (!letters) return null;
  const top = Math.max(...Object.values(counts));
  return { counts, strongest: (Object.keys(counts) as ExpressionPlane[]).filter((p) => counts[p] === top), letters };
}
