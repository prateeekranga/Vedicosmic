/**
 * Mobile number numerology: the root of the number, how often each digit appears, and the
 * neighbouring pairs of digits, read through the same planetary friendships as everything else.
 * No number is called lucky or unlucky in itself; the reading is how it sits with a person's
 * own Driver and Conductor.
 */
import { DIGITS, reduce, rootOf, showReduction, type CalcStep, type Digit, type Gender, type YMD } from './core';
import { LOSHU_INDIAN_STANDARD, loShu, type LoShuConfig } from './loshu';
import { pairRelation, type MutualRelation, type PairRelation } from './relations';

export interface NormalizedMobile {
  /** The digits analysed, without country code or trunk zero. */
  digits: number[];
  /** What was removed from the front, if anything ("+91" or "0"). */
  strippedPrefix: string | null;
  /** Seven to fifteen digits with at least one that is not zero. */
  valid: boolean;
}

/** Keeps the digits and drops an Indian country code (91 before ten digits) or a leading trunk 0. */
export function normalizeMobile(raw: string): NormalizedMobile {
  let text = raw.replace(/\D/g, '');
  let strippedPrefix: string | null = null;
  if (text.length === 12 && text.startsWith('91')) { text = text.slice(2); strippedPrefix = '+91'; }
  else if (text.length === 11 && text.startsWith('0')) { text = text.slice(1); strippedPrefix = '0'; }
  const digits = text.split('').map(Number);
  return { digits, strippedPrefix, valid: digits.length >= 7 && digits.length <= 15 && digits.some((d) => d > 0) };
}

export interface MobilePair {
  /** Two neighbouring digits, as written. */
  pair: [number, number];
  /** How many times this pair occurs in the number. */
  count: number;
  /** A doubled digit, a pair containing zero, or two different planets side by side. */
  kind: 'double' | 'zero' | 'planetary';
  /** The planets' mutual regard, for a planetary pair. */
  relation: MutualRelation | null;
}

export interface MobileResult {
  digits: number[];
  strippedPrefix: string | null;
  total: number;
  /** The number's digits added down to one digit. */
  root: Digit;
  /** Index 0–9: how many times each digit appears. */
  frequency: number[];
  /** Digits that appear three times or more. */
  heavy: { digit: number; count: number }[];
  /** Numbers 1–9 that do not appear at all. */
  absent: Digit[];
  /** Every distinct neighbouring pair, in the order it first appears. */
  pairs: MobilePair[];
  /** Present only when a date of birth was given. */
  withBirth: {
    driver: Digit; conductor: Digit;
    /** How the number's root sits with the Driver and with the Conductor. */
    rootToDriver: PairRelation; rootToConductor: PairRelation;
    /** Numbers missing from the person's Lo Shu grid that this mobile number contains. */
    suppliesMissing: Digit[];
  } | null;
  steps: CalcStep[];
}

/** Null when the text is not a usable phone number. */
export function analyseMobile(
  raw: string,
  birth?: { date: YMD; gender?: Gender | null },
  config: LoShuConfig = LOSHU_INDIAN_STANDARD,
): MobileResult | null {
  const { digits, strippedPrefix, valid } = normalizeMobile(raw);
  if (!valid) return null;

  const total = digits.reduce((a, b) => a + b, 0);
  const root = rootOf(total);
  const frequency = Array.from({ length: 10 }, (_, n) => digits.filter((d) => d === n).length);

  const pairs: MobilePair[] = [];
  for (let i = 0; i < digits.length - 1; i++) {
    const a = digits[i], b = digits[i + 1];
    const seen = pairs.find((p) => p.pair[0] === a && p.pair[1] === b);
    if (seen) { seen.count += 1; continue; }
    const kind: MobilePair['kind'] = a === 0 || b === 0 ? 'zero' : a === b ? 'double' : 'planetary';
    pairs.push({ pair: [a, b], count: 1, kind, relation: kind === 'planetary' ? pairRelation(a as Digit, b as Digit).mutual : null });
  }

  let withBirth: MobileResult['withBirth'] = null;
  if (birth) {
    const grid = loShu(birth.date, birth.gender ?? null, config);
    withBirth = {
      driver: grid.driver, conductor: grid.conductor,
      rootToDriver: pairRelation(root, grid.driver),
      rootToConductor: pairRelation(root, grid.conductor),
      suppliesMissing: grid.full.missing.filter((d) => frequency[d] > 0),
    };
  }

  const reduction = reduce(total);
  const steps: CalcStep[] = [
    ...(strippedPrefix ? [{ key: 'prefix', label: 'Number analysed', working: `The prefix ${strippedPrefix} is the same for every number in the country, so it is left out.`, result: digits.join('') }] : []),
    { key: 'total', label: 'Total', working: `${digits.join(' + ')} = ${total}`, result: String(total) },
    { key: 'root', label: 'Root number', working: reduction.trail.length > 1 ? showReduction(reduction) : `${total} is already a single digit`, result: String(root) },
  ];

  return {
    digits, strippedPrefix, total, root, frequency,
    heavy: frequency.map((count, digit) => ({ digit, count })).filter((f) => f.count >= 3),
    absent: DIGITS.filter((d) => frequency[d] === 0),
    pairs, withBirth, steps,
  };
}
