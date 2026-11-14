/**
 * Numerology engine: shared arithmetic. Pure functions with no UI imports and no use of the
 * JavaScript Date object (dates are plain year, month and day numbers), so results never shift
 * with the visitor's time zone.
 *
 * Numerology has no independent reference to test against the way astronomy does. The tests fix
 * the method described here and keep every tool on it; they do not prove the method.
 */

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Gender = 'male' | 'female';
export interface YMD { y: number; m: number; d: number }

export const DIGITS: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const MASTER_NUMBERS: readonly number[] = [11, 22, 33];
/** Totals read as "karmic debt" in the Western system when they appear before the final digit. */
export const KARMIC_DEBTS: readonly number[] = [13, 14, 16, 19];

/**
 * Which numbers keep 11, 22 and 33 and which always come down to 1–9.
 * Indian numbers and timing cycles are single digits; the Western core numbers keep masters.
 */
export const MASTER_POLICY = {
  driver: 'reduce', conductor: 'reduce', kua: 'reduce',
  chaldeanRoot: 'reduce', mobileRoot: 'reduce',
  personalYear: 'reduce', personalMonth: 'reduce', personalDay: 'reduce', challenge: 'reduce',
  lifePath: 'keep', birthday: 'keep', expression: 'keep', soulUrge: 'keep', personality: 'keep',
  maturity: 'keep', pinnacle: 'keep',
} as const satisfies Record<string, 'keep' | 'reduce'>;

/** Sum of the decimal digits of a whole number. */
export function digitSum(n: number): number {
  let x = Math.abs(Math.trunc(n));
  let sum = 0;
  while (x > 0) { sum += x % 10; x = Math.floor(x / 10); }
  return sum;
}

export interface Reduction {
  /** The number that was reduced. */
  input: number;
  /** The result: 1–9, or 11/22/33 when masters are kept (0 only for an input of 0). */
  value: number;
  /** Always the single digit, even when `value` is a master number. */
  root: Digit | 0;
  master: boolean;
  /** Every total on the way down, starting with the input and ending with `value`. */
  trail: number[];
  /** Set when 13, 14, 16 or 19 appears on the way down. */
  karmicDebt: 13 | 14 | 16 | 19 | null;
}

/** Adds digits repeatedly until one digit is left; with `masters: 'keep'` it stops at 11, 22 or 33. */
export function reduce(n: number, masters: 'keep' | 'reduce' = 'reduce'): Reduction {
  const input = Math.abs(Math.trunc(n));
  const trail = [input];
  let x = input;
  while (x > 9 && !(masters === 'keep' && MASTER_NUMBERS.includes(x))) {
    x = digitSum(x);
    trail.push(x);
  }
  const debt = trail.find((t) => KARMIC_DEBTS.includes(t)) ?? null;
  return {
    input, value: x, root: input === 0 ? 0 : rootOf(input),
    master: MASTER_NUMBERS.includes(x), trail,
    karmicDebt: debt as Reduction['karmicDebt'],
  };
}

/** The single digit 1–9 a positive whole number reduces to. */
export function rootOf(n: number): Digit {
  const x = Math.abs(Math.trunc(n));
  if (x === 0) throw new RangeError('rootOf: zero has no root digit');
  return ((x - 1) % 9 + 1) as Digit;
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}

/** A real calendar date (proleptic Gregorian), years 1 to 9999. */
export function isValidYMD(y: number, m: number, d: number): boolean {
  return Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d)
    && y >= 1 && y <= 9999 && m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

/** Parses "YYYY-MM-DD" strictly; null for anything else, including impossible dates such as 31 February. */
export function parseISODate(iso: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
  return isValidYMD(y, m, d) ? { y, m, d } : null;
}

export function toISODate({ y, m, d }: YMD): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Negative when `a` is earlier than `b`, zero when equal, positive when later. */
export function compareYMD(a: YMD, b: YMD): number {
  return a.y - b.y || a.m - b.m || a.d - b.d;
}

/** Completed years between a birth date and another date. */
export function ageOn(birth: YMD, on: YMD): number {
  const hadBirthday = on.m > birth.m || (on.m === birth.m && on.d >= birth.d);
  return on.y - birth.y - (hadBirthday ? 0 : 1);
}

/** One line of working shown to the visitor, e.g. "1 + 5 + 8 + 1 + 9 + 9 = 33, then 3 + 3 = 6". */
export interface CalcStep { key: string; label: string; working: string; result: string }

/** Writes a reduction as plain arithmetic: "33 → 3 + 3 = 6". Empty when nothing was reduced. */
export function showReduction(r: Reduction): string {
  const parts: string[] = [];
  for (let i = 1; i < r.trail.length; i++) {
    parts.push(`${String(r.trail[i - 1]).split('').join(' + ')} = ${r.trail[i]}`);
  }
  return parts.join(', then ');
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "15 August 1990", from a fixed month list so every runtime prints the same text. */
export function formatYMD({ y, m, d }: YMD): string {
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}
