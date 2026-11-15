/**
 * Mobile number numerology: the root of the number, how often each digit appears, the
 * neighbouring pairs of digits, and how the number sits with a person's own birth numbers.
 *
 * Two sources are used and kept apart. Neighbouring pairs are classed by the two-digit
 * combination chart (mobileChart.ts). The compatibility level compares the number's root with a
 * person's Driver and Conductor through the planetary friendship table (relations.ts), the same
 * table every other tool uses.
 */
import { DIGITS, reduce, rootOf, showReduction, type CalcStep, type Digit, type Gender, type YMD } from './core';
import { LOSHU_INDIAN_STANDARD, loShu, type LoShuConfig } from './loshu';
import { pairImpact, pairYoga, type PairImpact, type PairYoga } from './mobileChart';
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
  /** How the two-digit combination chart classes the pair. */
  impact: PairImpact;
  /** The yoga the chart names for the pair, if any. */
  yoga: PairYoga | null;
}

/** From 1, the weakest match with a date of birth, to 5, the strongest. */
export type CompatibilityLevel = 1 | 2 | 3 | 4 | 5;

export interface MobileCompatibility {
  /** The root against the Driver and against the Conductor, each from −2 to +2. */
  driverPoints: number; conductorPoints: number;
  /** The two added together, from −4 to +4. */
  points: number;
  level: CompatibilityLevel;
}

/**
 * Points for one comparison: +2 when the planets are friends on both sides (or the two numbers
 * are the same), +1 friendly, 0 neutral or mixed, −1 strained, −2 unfriendly on both sides.
 */
export const RELATION_POINTS: Readonly<Record<MutualRelation, number>> = {
  'mutual-friends': 2, friendly: 1, neutral: 0, mixed: 0, strained: -1, opposed: -2,
};

/** Total points to level: 3 or 4 is level 5, 1 or 2 is level 4, 0 is level 3, −1 or −2 is level 2, lower is level 1. */
export function compatibilityLevel(points: number): CompatibilityLevel {
  if (points >= 3) return 5;
  if (points >= 1) return 4;
  if (points === 0) return 3;
  if (points >= -2) return 2;
  return 1;
}

/** How a number's root sits with a Driver and a Conductor, as points and a level from 1 to 5. */
export function mobileCompatibility(root: Digit, driver: Digit, conductor: Digit): MobileCompatibility {
  const driverPoints = RELATION_POINTS[pairRelation(root, driver).mutual];
  const conductorPoints = RELATION_POINTS[pairRelation(root, conductor).mutual];
  const points = driverPoints + conductorPoints;
  return { driverPoints, conductorPoints, points, level: compatibilityLevel(points) };
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
  /** How many distinct pairs fall in each class of the combination chart. */
  pairTally: Readonly<Record<PairImpact, number>>;
  /**
   * Set when 1 and 7 stand side by side, which the chart calls a Raj yog. Teachers add that the
   * number should not also contain an 8.
   */
  rajYog: { weakenedByEight: boolean } | null;
  /** Present only when a date of birth was given. */
  withBirth: {
    driver: Digit; conductor: Digit;
    /** How the number's root sits with the Driver and with the Conductor. */
    rootToDriver: PairRelation; rootToConductor: PairRelation;
    /** The two comparisons as points and one level from 1 to 5. */
    compatibility: MobileCompatibility;
    /** Numbers missing from the person's Lo Shu grid that this mobile number contains. */
    suppliesMissing: Digit[];
  } | null;
  steps: CalcStep[];
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const RELATION_WORDS: Readonly<Record<MutualRelation, string>> = {
  'mutual-friends': 'friends on both sides', friendly: 'friendly', neutral: 'neutral', mixed: 'friendly one way and unfriendly the other',
  strained: 'strained', opposed: 'unfriendly on both sides',
};

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
    const kind: MobilePair['kind'] = a === b ? 'double' : a === 0 || b === 0 ? 'zero' : 'planetary';
    pairs.push({ pair: [a, b], count: 1, kind, impact: pairImpact(a, b), yoga: pairYoga(a, b) });
  }
  const pairTally = { benefic: 0, neutral: 0, malefic: 0 };
  for (const p of pairs) pairTally[p.impact] += 1;
  const rajYog = pairs.some((p) => p.yoga === 'raj') ? { weakenedByEight: frequency[8] > 0 } : null;

  const reduction = reduce(total);
  const steps: CalcStep[] = [
    ...(strippedPrefix ? [{ key: 'prefix', label: 'Number analysed', working: `The prefix ${strippedPrefix} is the same for every number in the country, so it is left out.`, result: digits.join('') }] : []),
    { key: 'total', label: 'Total', working: `${digits.join(' + ')} = ${total}`, result: String(total) },
    { key: 'root', label: 'Root number', working: reduction.trail.length > 1 ? showReduction(reduction) : `${total} is already a single digit`, result: String(root) },
  ];

  let withBirth: MobileResult['withBirth'] = null;
  if (birth) {
    const grid = loShu(birth.date, birth.gender ?? null, config);
    const rootToDriver = pairRelation(root, grid.driver);
    const rootToConductor = pairRelation(root, grid.conductor);
    const compatibility = mobileCompatibility(root, grid.driver, grid.conductor);
    withBirth = {
      driver: grid.driver, conductor: grid.conductor, rootToDriver, rootToConductor, compatibility,
      suppliesMissing: grid.full.missing.filter((d) => frequency[d] > 0),
    };
    const words = (own: Digit, rel: PairRelation) => (own === root ? 'the same number' : RELATION_WORDS[rel.mutual]);
    steps.push({
      key: 'compatibility', label: 'Compatibility level',
      working: `Root ${root} with Mulank ${grid.driver}: ${words(grid.driver, rootToDriver)}, ${signed(compatibility.driverPoints)}. `
        + `Root ${root} with Bhagyank ${grid.conductor}: ${words(grid.conductor, rootToConductor)}, ${signed(compatibility.conductorPoints)}. `
        + `Total ${signed(compatibility.points)} on a scale from −4 to +4.`,
      result: `${compatibility.level} of 5`,
    });
  }

  return {
    digits, strippedPrefix, total, root, frequency,
    heavy: frequency.map((count, digit) => ({ digit, count })).filter((f) => f.count >= 3),
    absent: DIGITS.filter((d) => frequency[d] === 0),
    pairs, pairTally, rajYog, withBirth, steps,
  };
}
