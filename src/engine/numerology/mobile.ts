/**
 * Mobile number numerology: the root and compound total of the number, how often each digit
 * appears, the neighbouring pairs of digits, the last four digits, and how the number sits with a
 * person's own birth numbers, Lo Shu grid and name.
 *
 * Two sources are used and kept apart. Neighbouring pairs are classed by the two-digit
 * combination chart (mobileChart.ts). Every comparison with a person (the compatibility level, the
 * fit of the ending, the roots that suit them) goes through the planetary friendship table
 * (relations.ts), the same table every other tool uses.
 *
 * Teachers differ on how much each check matters, so every weight and limit is one field of
 * MobileConfig, and the Number score shows the arithmetic of each of its four parts.
 */
import { DIGITS, reduce, rootOf, showReduction, type CalcStep, type Digit, type Gender, type YMD } from './core';
import { chaldeanName, compoundKeyOf } from './chaldean';
import {
  LOSHU_INDIAN_STANDARD, analyseGrid, loShu,
  type Counts, type GridAnalysis, type LineId, type LoShuConfig, type LoShuResult,
} from './loshu';
import { PAIR_IMPACT, PAIR_YOGA, pairImpact, pairYoga, yogaImpact, type PairImpact, type PairYoga } from './mobileChart';
import { pairRelation, type MutualRelation, type PairRelation } from './relations';

/** What the phone is mainly for. It decides how much the Mulank and the Bhagyank each count. */
export type MobilePurpose = 'both' | 'personal' | 'business';

export interface MobileConfig {
  id: string;
  /**
   * How many times the Mulank and the Bhagyank comparison each count. Each pair adds to 4, so the
   * weighted total always runs from −8 to +8. Teachers favour the Mulank for a personal phone and
   * the Bhagyank for a business one.
   */
  purposeWeights: Readonly<Record<MobilePurpose, { driver: number; conductor: number }>>;
  /** Points for each part of the Number score; they add to 100. */
  scoreParts: Readonly<{ birth: number; pairs: number; ending: number; balance: number }>;
  /** Weight of the first and of the last neighbouring pair; the pairs between rise evenly. */
  pairWeight: Readonly<{ first: number; last: number }>;
  /** What each class of pair is worth in the combinations part, as a share of a full pair. */
  pairValue: Readonly<Record<PairImpact, number>>;
  /** How many final digits make the ending. */
  endingLength: number;
  /** A digit appearing this many times or more is overloaded. */
  overloadAt: number;
  /** This many of the same digit in a row is flagged. */
  runAt: number;
  /** This many zeros or more is flagged. */
  manyZerosAt: number;
  /** Points taken off the digit balance part for each flag. */
  deductions: Readonly<{ overloaded: number; run: number; manyZeros: number; endsInZero: number }>;
  /** The lowest score for each band, from Excellent (5) down to Low (2); anything lower is Very low (1). */
  bands: Readonly<{ 5: number; 4: number; 3: number; 2: number }>;
}

export const MOBILE_STANDARD: MobileConfig = {
  id: 'indian-standard',
  purposeWeights: { both: { driver: 2, conductor: 2 }, personal: { driver: 3, conductor: 1 }, business: { driver: 1, conductor: 3 } },
  scoreParts: { birth: 40, pairs: 35, ending: 15, balance: 10 },
  pairWeight: { first: 1, last: 3 },
  pairValue: { benefic: 1, neutral: 0.5, malefic: 0 },
  endingLength: 4,
  overloadAt: 4,
  runAt: 3,
  manyZerosAt: 3,
  deductions: { overloaded: 3, run: 2, manyZeros: 2, endsInZero: 2 },
  bands: { 5: 85, 4: 70, 3: 55, 2: 40 },
};

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
  /** The yoga named for the pair, if any. */
  yoga: PairYoga | null;
}

/** One neighbouring pair at its place in the number. */
export interface MobilePairAt {
  /** Position of the pair's first digit, counting from 0. */
  index: number;
  pair: [number, number];
  impact: PairImpact;
  yoga: PairYoga | null;
  /** Its weight in the combinations part of the score, rising from the first pair to the last. */
  weight: number;
  /** Both digits are among the last four. */
  inEnding: boolean;
}

/** From 1, the weakest match with a date of birth, to 5, the strongest. */
export type CompatibilityLevel = 1 | 2 | 3 | 4 | 5;

export interface MobileCompatibility {
  /** The root against the Driver and against the Conductor, each from −2 to +2. */
  driverPoints: number; conductorPoints: number;
  /** The two added together, from −4 to +4. */
  points: number;
  /** The purpose the comparison was weighted for, and the weights it used. */
  purpose: MobilePurpose;
  weights: { driver: number; conductor: number };
  /** Each comparison times its weight, added: from −8 to +8. With equal weights it is twice `points`. */
  weighted: number;
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

/**
 * The same bands on the weighted scale from −8 to +8: 6 or more is level 5, 2 to 5 level 4, −1 to
 * +1 level 3, −5 to −2 level 2, lower level 1. With equal weights this gives exactly the level of
 * compatibilityLevel(); the odd totals that only unequal weights produce fall in between.
 */
export function weightedLevel(weighted: number): CompatibilityLevel {
  if (weighted >= 6) return 5;
  if (weighted >= 2) return 4;
  if (weighted >= -1) return 3;
  if (weighted >= -5) return 2;
  return 1;
}

/** How a number's root sits with a Driver and a Conductor, as points and a level from 1 to 5. */
export function mobileCompatibility(
  root: Digit, driver: Digit, conductor: Digit, purpose: MobilePurpose = 'both', config: MobileConfig = MOBILE_STANDARD,
): MobileCompatibility {
  const driverPoints = RELATION_POINTS[pairRelation(root, driver).mutual];
  const conductorPoints = RELATION_POINTS[pairRelation(root, conductor).mutual];
  const weights = config.purposeWeights[purpose];
  const weighted = weights.driver * driverPoints + weights.conductor * conductorPoints;
  return {
    driverPoints, conductorPoints, points: driverPoints + conductorPoints,
    purpose, weights: { ...weights }, weighted, level: weightedLevel(weighted),
  };
}

/** How every root from 1 to 9 would sit with a Driver and a Conductor. */
export function rootsForBirth(
  driver: Digit, conductor: Digit, purpose: MobilePurpose = 'both', config: MobileConfig = MOBILE_STANDARD,
): { root: Digit; compatibility: MobileCompatibility }[] {
  return DIGITS.map((root) => ({ root, compatibility: mobileCompatibility(root, driver, conductor, purpose, config) }));
}

export interface MobileEnding {
  /** The last four digits, as written. */
  digits: number[];
  total: number;
  /** Null when the ending is all zeros. */
  root: Digit | null;
  lastPair: [number, number];
  lastDigit: number;
}

export interface NamedYoga {
  yoga: PairYoga;
  impact: 'benefic' | 'malefic';
  /** The pairs as written in the number, in order of first appearance, without repeats. */
  written: string[];
  /** At least one of them lies in the ending. */
  inEnding: boolean;
}

/** Things a reader should see whatever the score, since a good total does not cancel a poor pair. */
export type MobileCaution =
  | { kind: 'yoga'; yoga: PairYoga; written: string[] }
  | { kind: 'ending-pair'; pair: string }
  | { kind: 'overloaded'; digit: number; count: number }
  | { kind: 'run'; digit: number; length: number }
  | { kind: 'zeros'; count: number }
  | { kind: 'ends-in-zero'; trailing: number };

export type ScorePartKey = 'birth' | 'pairs' | 'ending' | 'balance';
export interface ScorePart { key: ScorePartKey; points: number; max: number; working: string }
export interface MobileScore {
  /** 0 to 100: the four parts added. */
  total: number;
  /** The score's band, named with the same words as the compatibility level. */
  band: CompatibilityLevel;
  parts: ScorePart[];
}

/** What adding the phone number's digits does to one number of the Lo Shu grid. */
export type GridDigitStatus = 'introduced' | 'strengthened' | 'unchanged' | 'missing';

export interface MobileGrid {
  /** The person's own grid, as the Lo Shu page shows it. */
  person: LoShuResult;
  /** How many of each number 1–9 the phone number adds (zeros have no cell). */
  added: Counts;
  /** The person's full grid with the phone number's digits added. */
  withNumber: GridAnalysis;
  status: Readonly<Record<Digit, GridDigitStatus>>;
  /** Lines of three that are complete with the number and were not complete without it. */
  newLines: LineId[];
}

export interface NumberChecklist {
  /** Roots at the best level any root reaches for this person, and those one level below it. */
  best: Digit[];
  good: Digit[];
  bestLevel: CompatibilityLevel;
  /** Numbers missing from the person's grid, which teachers like a new number to contain. */
  include: Digit[];
  /** Most times one digit should appear, and most of one digit in a row. */
  maxRepeats: number;
  maxRun: number;
  /** Named malefic pairs first, then the chart's other malefic pairs, smaller digit first. */
  avoidNamed: { yoga: PairYoga; key: string }[];
  avoidOther: string[];
}

export interface MobilePerson {
  date?: YMD | null;
  gender?: Gender | null;
  /** For the name number's fit with the phone number. */
  name?: string;
  purpose?: MobilePurpose;
}

export interface MobileResult {
  digits: number[];
  strippedPrefix: string | null;
  total: number;
  /** The number's digits added down to one digit. */
  root: Digit;
  /** The total read as a Chaldean compound number (10–52), or null when it falls outside that range. */
  compoundKey: number | null;
  /** Index 0–9: how many times each digit appears. */
  frequency: number[];
  /** Digits that appear three times or more. */
  heavy: { digit: number; count: number }[];
  /** Digits that appear four times or more (MobileConfig.overloadAt). */
  overloaded: { digit: number; count: number }[];
  /** Numbers 1–9 that do not appear at all. */
  absent: Digit[];
  zeros: { count: number; trailing: number; longestRun: number };
  /** Three or more of the same digit in a row. */
  runs: { digit: number; length: number; index: number }[];
  /** Every distinct neighbouring pair, in the order it first appears. */
  pairs: MobilePair[];
  /** Every neighbouring pair at its place, repeats included. */
  sequence: MobilePairAt[];
  /** How many distinct pairs fall in each class of the combination chart. */
  pairTally: Readonly<Record<PairImpact, number>>;
  /** Named pairs found in the number. */
  yogas: NamedYoga[];
  /**
   * Set when 1 and 7 stand side by side, which the chart calls a Raj yog. Teachers add that the
   * number should not also contain an 8.
   */
  rajYog: { weakenedByEight: boolean } | null;
  ending: MobileEnding;
  cautions: MobileCaution[];
  purpose: MobilePurpose;
  /** Present when a name with countable letters was given. */
  nameFit: { compound: number; root: Digit; relation: PairRelation } | null;
  /** Present only when a date of birth was given. */
  withBirth: {
    driver: Digit; conductor: Digit;
    /** How the number's root sits with the Driver and with the Conductor. */
    rootToDriver: PairRelation; rootToConductor: PairRelation;
    /** The two comparisons as points and one level from 1 to 5. */
    compatibility: MobileCompatibility;
    /** Numbers missing from the person's Lo Shu grid that this mobile number contains. */
    suppliesMissing: Digit[];
    /** The ending's root against the same two numbers; null when the ending is all zeros. */
    endingFit: MobileCompatibility | null;
    score: MobileScore;
    grid: MobileGrid;
    /** Every root from 1 to 9 for this person, for choosing a number. */
    roots: { root: Digit; compatibility: MobileCompatibility }[];
    checklist: NumberChecklist;
  } | null;
  steps: CalcStep[];
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const RELATION_WORDS: Readonly<Record<MutualRelation, string>> = {
  'mutual-friends': 'friends on both sides', friendly: 'friendly', neutral: 'neutral', mixed: 'friendly one way and unfriendly the other',
  strained: 'strained', opposed: 'unfriendly on both sides',
};
/** How each purpose weights the two comparisons, in words that can follow "for a" or stand alone. */
export const PURPOSE_WORDS: Readonly<Record<MobilePurpose, string>> = {
  both: 'phone for every use, so the Mulank and the Bhagyank count equally',
  personal: 'personal phone, so the Mulank counts three times and the Bhagyank once',
  business: 'business phone, so the Bhagyank counts three times and the Mulank once',
};
const half = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function emptyCounts(): Record<Digit, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

/** The pair's weight: config.pairWeight.first for the first pair, rising evenly to .last for the last. */
function pairWeightAt(index: number, pairCount: number, config: MobileConfig): number {
  const { first, last } = config.pairWeight;
  return pairCount <= 1 ? last : first + ((last - first) * index) / (pairCount - 1);
}

/** Points on a −8..+8 weighted total, scaled to `max` and rounded. */
const scaled = (max: number, weighted: number) => Math.round((max * (weighted + 8)) / 16);

/**
 * The arithmetic that turns a comparison into points out of `max`, in words. With equal weights it
 * is written on the −4 to +4 scale the compatibility level uses; otherwise on the weighted scale.
 */
function fitWorking(max: number, c: MobileCompatibility): string {
  const points = scaled(max, c.weighted);
  const exact = (max * (c.weighted + 8)) / 16;
  const result = `${half(exact)}${Number.isInteger(exact) ? '' : `, rounded to ${points}`}`;
  if (c.purpose === 'both') {
    return `${signed(c.points)} on the scale from −4 to +4: ${max} × (${signed(c.points)} + 4) ÷ 8 = ${result}.`;
  }
  return `${signed(c.weighted)} on the weighted scale from −8 to +8 (${PURPOSE_WORDS[c.purpose]}): `
    + `${max} × (${signed(c.weighted)} + 8) ÷ 16 = ${result}.`;
}

function scoreOf(
  r: Pick<MobileResult, 'sequence' | 'ending' | 'overloaded' | 'runs' | 'zeros'>,
  compatibility: MobileCompatibility, endingFit: MobileCompatibility | null, config: MobileConfig,
): MobileScore {
  const { scoreParts: max, pairValue, deductions } = config;

  const birth = scaled(max.birth, compatibility.weighted);

  const weightSum = r.sequence.reduce((a, p) => a + p.weight, 0);
  const valueSum = r.sequence.reduce((a, p) => a + p.weight * pairValue[p.impact], 0);
  const share = weightSum ? valueSum / weightSum : 0;
  const pairs = Math.round(max.pairs * share);
  const count = (k: PairImpact) => r.sequence.filter((p) => p.impact === k).length;
  const pairsWorking = `${plural(r.sequence.length, 'pair')} in order, weighted from ${config.pairWeight.first} for the first to ${config.pairWeight.last} for the last: `
    + `${count('benefic')} benefic (full value), ${count('neutral')} neutral (half), ${count('malefic')} malefic (none). `
    + `Weighted share ${Math.round(share * 100)}% of ${max.pairs} = ${pairs}.`;

  const ending = endingFit ? scaled(max.ending, endingFit.weighted) : 0;
  const endingWords = r.ending.digits.join('');
  const endingWorking = endingFit
    ? `The last ${r.ending.digits.length} digits ${endingWords} have the root ${r.ending.root}, which compares with your Mulank and Bhagyank at ${fitWorking(max.ending, endingFit)}`
    : `The last ${r.ending.digits.length} digits are all zeros and have no root, so this part scores 0.`;

  const cuts: { points: number; why: string }[] = [
    ...r.overloaded.map((o) => ({ points: deductions.overloaded, why: `${o.digit} appears ${o.count} times` })),
    ...r.runs.map((run) => ({ points: deductions.run, why: `${String(run.digit).repeat(run.length)} in a row` })),
    ...(r.zeros.count >= config.manyZerosAt ? [{ points: deductions.manyZeros, why: `${r.zeros.count} zeros` }] : []),
    ...(r.zeros.trailing > 0 ? [{ points: deductions.endsInZero, why: 'the number ends in 0' }] : []),
  ];
  const balance = Math.max(0, max.balance - cuts.reduce((a, c) => a + c.points, 0));
  const balanceWorking = cuts.length
    ? `${max.balance} ${cuts.map((c) => `− ${c.points} (${c.why})`).join(' ')} = ${balance}${balance === 0 ? ' (the part does not go below 0)' : ''}.`
    : `No digit is overloaded, no digit runs three in a row, and the zeros are few and not at the end: ${max.balance}.`;

  const total = birth + pairs + ending + balance;
  const b = config.bands;
  const band: CompatibilityLevel = total >= b[5] ? 5 : total >= b[4] ? 4 : total >= b[3] ? 3 : total >= b[2] ? 2 : 1;
  return {
    total, band,
    parts: [
      { key: 'birth', points: birth, max: max.birth, working: `The compatibility total is ${fitWorking(max.birth, compatibility)}` },
      { key: 'pairs', points: pairs, max: max.pairs, working: pairsWorking },
      { key: 'ending', points: ending, max: max.ending, working: endingWorking },
      { key: 'balance', points: balance, max: max.balance, working: balanceWorking },
    ],
  };
}

/** What to look for in a new number, for one person. */
export function numberChecklist(
  driver: Digit, conductor: Digit, grid: GridAnalysis, purpose: MobilePurpose = 'both', config: MobileConfig = MOBILE_STANDARD,
): NumberChecklist {
  const roots = rootsForBirth(driver, conductor, purpose, config);
  const bestLevel = Math.max(...roots.map((r) => r.compatibility.level)) as CompatibilityLevel;
  // Keys such as "08" sort after "99" in Object.keys, so the lists are put in written order here.
  const named = Object.entries(PAIR_YOGA)
    .filter(([, yoga]) => yogaImpact(yoga) === 'malefic')
    .map(([key, yoga]) => ({ yoga, key }))
    .sort((a, b) => a.key.localeCompare(b.key));
  return {
    best: roots.filter((r) => r.compatibility.level === bestLevel).map((r) => r.root),
    good: roots.filter((r) => r.compatibility.level === bestLevel - 1 && r.compatibility.level >= 3).map((r) => r.root),
    bestLevel,
    include: grid.missing,
    maxRepeats: config.overloadAt - 1,
    maxRun: config.runAt - 1,
    avoidNamed: named,
    avoidOther: Object.keys(PAIR_IMPACT).filter((k) => PAIR_IMPACT[k] === 'malefic' && !PAIR_YOGA[k]).sort(),
  };
}

function mobileGrid(person: LoShuResult, digits: number[]): MobileGrid {
  const added = emptyCounts();
  for (const d of digits) if (d > 0) added[d as Digit] += 1;
  const before = person.full.counts;
  const after = emptyCounts();
  for (const d of DIGITS) after[d] = before[d] + added[d];
  const withNumber = analyseGrid(after);
  const status = {} as Record<Digit, GridDigitStatus>;
  for (const d of DIGITS) {
    status[d] = before[d] === 0 ? (added[d] ? 'introduced' : 'missing') : added[d] ? 'strengthened' : 'unchanged';
  }
  const wasFull = new Set(person.full.lines.filter((l) => l.status === 'full').map((l) => l.id));
  return {
    person, added, withNumber, status,
    newLines: withNumber.lines.filter((l) => l.status === 'full' && !wasFull.has(l.id)).map((l) => l.id),
  };
}

/** Null when the text is not a usable phone number. */
export function analyseMobile(
  raw: string,
  person?: MobilePerson,
  config: LoShuConfig = LOSHU_INDIAN_STANDARD,
  mobileConfig: MobileConfig = MOBILE_STANDARD,
): MobileResult | null {
  const { digits, strippedPrefix, valid } = normalizeMobile(raw);
  if (!valid) return null;
  const purpose = person?.purpose ?? 'both';
  const n = digits.length;

  const total = digits.reduce((a, b) => a + b, 0);
  const root = rootOf(total);
  const compoundKey = compoundKeyOf(total);
  const frequency = Array.from({ length: 10 }, (_, d) => digits.filter((x) => x === d).length);

  const pairs: MobilePair[] = [];
  const sequence: MobilePairAt[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = digits[i], b = digits[i + 1];
    const impact = pairImpact(a, b);
    const yoga = pairYoga(a, b);
    sequence.push({ index: i, pair: [a, b], impact, yoga, weight: pairWeightAt(i, n - 1, mobileConfig), inEnding: i >= n - mobileConfig.endingLength });
    const seen = pairs.find((p) => p.pair[0] === a && p.pair[1] === b);
    if (seen) { seen.count += 1; continue; }
    const kind: MobilePair['kind'] = a === b ? 'double' : a === 0 || b === 0 ? 'zero' : 'planetary';
    pairs.push({ pair: [a, b], count: 1, kind, impact, yoga });
  }
  const pairTally = { benefic: 0, neutral: 0, malefic: 0 };
  for (const p of pairs) pairTally[p.impact] += 1;
  const rajYog = pairs.some((p) => p.yoga === 'raj') ? { weakenedByEight: frequency[8] > 0 } : null;

  const yogas: NamedYoga[] = [];
  for (const p of sequence) {
    if (!p.yoga) continue;
    const written = p.pair.join('');
    const found = yogas.find((y) => y.yoga === p.yoga);
    if (found) {
      if (!found.written.includes(written)) found.written.push(written);
      found.inEnding ||= p.inEnding;
    } else {
      yogas.push({ yoga: p.yoga, impact: yogaImpact(p.yoga), written: [written], inEnding: p.inEnding });
    }
  }

  const endDigits = digits.slice(-mobileConfig.endingLength);
  const endTotal = endDigits.reduce((a, b) => a + b, 0);
  const ending: MobileEnding = {
    digits: endDigits, total: endTotal, root: endTotal > 0 ? rootOf(endTotal) : null,
    lastPair: [digits[n - 2], digits[n - 1]], lastDigit: digits[n - 1],
  };

  let trailing = 0;
  while (trailing < n && digits[n - 1 - trailing] === 0) trailing += 1;
  const runs: MobileResult['runs'] = [];
  let longestZeroRun = 0;
  for (let i = 0; i < n;) {
    let j = i;
    while (j < n && digits[j] === digits[i]) j += 1;
    const length = j - i;
    if (digits[i] === 0) longestZeroRun = Math.max(longestZeroRun, length);
    if (length >= mobileConfig.runAt) runs.push({ digit: digits[i], length, index: i });
    i = j;
  }
  const zeros = { count: frequency[0], trailing, longestRun: longestZeroRun };
  const overloaded = frequency.map((count, digit) => ({ digit, count })).filter((f) => f.count >= mobileConfig.overloadAt);

  const cautions: MobileCaution[] = [
    ...yogas.filter((y) => y.impact === 'malefic').map((y) => ({ kind: 'yoga' as const, yoga: y.yoga, written: y.written })),
    ...[...new Set(sequence.filter((p) => p.inEnding && p.impact === 'malefic' && !p.yoga).map((p) => p.pair.join('')))]
      .map((pair) => ({ kind: 'ending-pair' as const, pair })),
    ...overloaded.map((o) => ({ kind: 'overloaded' as const, digit: o.digit, count: o.count })),
    ...runs.map((r) => ({ kind: 'run' as const, digit: r.digit, length: r.length })),
    ...(zeros.count >= mobileConfig.manyZerosAt ? [{ kind: 'zeros' as const, count: zeros.count }] : []),
    ...(trailing > 0 ? [{ kind: 'ends-in-zero' as const, trailing }] : []),
  ];

  const name = person?.name?.trim() ? chaldeanName(person.name) : null;
  const nameFit = name ? { compound: name.compound, root: name.root, relation: pairRelation(root, name.root) } : null;

  const reduction = reduce(total);
  const steps: CalcStep[] = [
    ...(strippedPrefix ? [{ key: 'prefix', label: 'Number analysed', working: `The prefix ${strippedPrefix} is the same for every number in the country, so it is left out.`, result: digits.join('') }] : []),
    { key: 'total', label: 'Total', working: `${digits.join(' + ')} = ${total}`, result: String(total) },
    { key: 'root', label: 'Root number', working: reduction.trail.length > 1 ? showReduction(reduction) : `${total} is already a single digit`, result: String(root) },
  ];
  if (compoundKey !== null) {
    steps.push({
      key: 'compound', label: 'Compound number',
      working: compoundKey === total
        ? `The total ${total} is read as a compound number in Cheiro’s list from 10 to 52.`
        : `The total ${total} is above 52, so its digits are added until it falls in Cheiro’s list: ${compoundKey}.`,
      result: String(compoundKey),
    });
  }
  steps.push({
    key: 'ending', label: `Last ${endDigits.length} digits`,
    working: ending.root ? `${endDigits.join(' + ')} = ${endTotal}, which adds down to ${ending.root}` : `${endDigits.join(' + ')} = 0, so the ending has no root`,
    result: ending.root ? String(ending.root) : '—',
  });

  let withBirth: MobileResult['withBirth'] = null;
  if (person?.date) {
    const grid = loShu(person.date, person.gender ?? null, config);
    const rootToDriver = pairRelation(root, grid.driver);
    const rootToConductor = pairRelation(root, grid.conductor);
    const compatibility = mobileCompatibility(root, grid.driver, grid.conductor, purpose, mobileConfig);
    const endingFit = ending.root ? mobileCompatibility(ending.root, grid.driver, grid.conductor, purpose, mobileConfig) : null;
    withBirth = {
      driver: grid.driver, conductor: grid.conductor, rootToDriver, rootToConductor, compatibility,
      suppliesMissing: grid.full.missing.filter((d) => frequency[d] > 0),
      endingFit,
      score: scoreOf({ sequence, ending, overloaded, runs, zeros }, compatibility, endingFit, mobileConfig),
      grid: mobileGrid(grid, digits),
      roots: rootsForBirth(grid.driver, grid.conductor, purpose, mobileConfig),
      checklist: numberChecklist(grid.driver, grid.conductor, grid.full, purpose, mobileConfig),
    };
    const words = (own: Digit, rel: PairRelation) => (own === root ? 'the same number' : RELATION_WORDS[rel.mutual]);
    const c = compatibility;
    steps.push({
      key: 'compatibility', label: 'Compatibility level',
      working: `Root ${root} with Mulank ${grid.driver}: ${words(grid.driver, rootToDriver)}, ${signed(c.driverPoints)}. `
        + `Root ${root} with Bhagyank ${grid.conductor}: ${words(grid.conductor, rootToConductor)}, ${signed(c.conductorPoints)}. `
        + (purpose === 'both'
          ? `Total ${signed(c.points)} on a scale from −4 to +4.`
          : `For a ${PURPOSE_WORDS[purpose]}: ${c.weights.driver} × (${signed(c.driverPoints)}) + ${c.weights.conductor} × (${signed(c.conductorPoints)}) = ${signed(c.weighted)} on a scale from −8 to +8.`),
      // Kept last among the steps: the score's own working is shown with each of its four parts.
      result: `${c.level} of 5`,
    });
  }

  return {
    digits, strippedPrefix, total, root, compoundKey, frequency,
    heavy: frequency.map((count, digit) => ({ digit, count })).filter((f) => f.count >= 3),
    overloaded,
    absent: DIGITS.filter((d) => frequency[d] === 0),
    zeros, runs, pairs, sequence, pairTally, yogas, rajYog, ending, cautions, purpose, nameFit, withBirth, steps,
  };
}
