import { reduceTo9 } from '@/data/loshu';
import { lookupCombination, type CombinationImpact } from '@/data/mobileCombinations';
// Pythagorean numerology engine — deterministic, client-side.

const PYTHAGOREAN: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const MASTER = new Set([11, 22, 33]);

/** Reduce to a single digit, preserving master numbers 11/22/33. */
export function reduceNumber(n: number): number {
  while (n > 9 && !MASTER.has(n)) {
    n = String(n)
      .split('')
      .reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

export interface ReductionStep {
  value: number;
  digits: number[];
}

export function reductionTrail(n: number): ReductionStep[] {
  const steps: ReductionStep[] = [];
  let cur = n;
  steps.push({ value: cur, digits: String(cur).split('').map(Number) });
  while (cur > 9 && !MASTER.has(cur)) {
    cur = String(cur).split('').reduce((s, d) => s + Number(d), 0);
    steps.push({ value: cur, digits: String(cur).split('').map(Number) });
  }
  return steps;
}

function sumName(name: string, filter: (ch: string) => boolean): number {
  const total = name
    .toLowerCase()
    .split('')
    .filter((ch) => /[a-z]/.test(ch) && filter(ch))
    .reduce((sum, ch) => sum + (PYTHAGOREAN[ch] ?? 0), 0);
  return reduceNumber(total);
}

export interface NumerologyResult {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}

export function computeNumerology(fullName: string, isoDate: string): NumerologyResult {
  const digits = isoDate.replace(/\D/g, '').split('').map(Number);
  const lifePath = reduceNumber(digits.reduce((s, d) => s + d, 0));
  return {
    lifePath,
    expression: sumName(fullName, () => true),
    soulUrge: sumName(fullName, (ch) => VOWELS.has(ch)),
    personality: sumName(fullName, (ch) => !VOWELS.has(ch)),
  };
}

/** Mobile-number analysis. */
export interface MobileCombinationHit {
  pair: string;
  impact: CombinationImpact;
  result: string;
}

export interface MobileResult {
  cleaned: string;
  total: number;
  root: number;
  trail: ReductionStep[];
  frequency: { digit: number; count: number }[];
  repeats: string[];
  combinations: MobileCombinationHit[];
  verdict: 'Highly Auspicious' | 'Neutral' | 'Challenging';
  compatibility?: number;
}

const AUSPICIOUS_ROOTS = new Set([1, 3, 5, 6, 9]);
const CHALLENGING_ROOTS = new Set([4, 8]);

export function analyseMobile(raw: string, lifePath?: number): MobileResult {
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.length > 10 && cleaned.startsWith('91')) cleaned = cleaned.slice(2);
  if (cleaned.length > 10 && cleaned.startsWith('1')) cleaned = cleaned.slice(1);

  const all = cleaned.split('').map(Number);
  const total = all.reduce((s, d) => s + d, 0);
  const root = reduceNumber(total);
  const trail = reductionTrail(total);

  const frequency = Array.from({ length: 10 }, (_, d) => ({
    digit: d,
    count: all.filter((x) => x === d).length,
  }));

  const repeats: string[] = [];
  for (let i = 0; i < cleaned.length - 1; i++) {
    if (cleaned[i] === cleaned[i + 1]) {
      const pair = cleaned[i] + cleaned[i + 1];
      if (!repeats.includes(pair)) repeats.push(pair);
    }
  }

  // Every adjacent pair of digits, in the order they occur, each read
  // against the classical Two-Digit Combination chart (see data/mobileCombinations.ts).
  const combinations: MobileCombinationHit[] = [];
  const seenPairs = new Set<string>();
  for (let i = 0; i < cleaned.length - 1; i++) {
    const pair = cleaned[i] + cleaned[i + 1];
    if (seenPairs.has(pair)) continue;
    seenPairs.add(pair);
    const hit = lookupCombination(pair);
    if (hit) combinations.push({ pair, impact: hit.impact, result: hit.result });
  }

  let verdict: MobileResult['verdict'] = 'Neutral';
  if (AUSPICIOUS_ROOTS.has(root)) verdict = 'Highly Auspicious';
  else if (CHALLENGING_ROOTS.has(root)) verdict = 'Challenging';

  let compatibility: number | undefined;
  if (lifePath && lifePath > 0) {
    const diff = Math.abs(reduceNumber(lifePath) - root);
    compatibility = Math.max(20, Math.round(100 - diff * 11));
  }

  return { cleaned, total, root, trail, frequency, repeats, combinations, verdict, compatibility };
}

// ---- Numerology Blueprint additions (name + DOB core numbers) ----

const PYTHAG_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};
const VOWEL_SET = new Set(['a', 'e', 'i', 'o', 'u']);
const isMasterNum = (n: number) => n === 11 || n === 22 || n === 33;

export interface NumResult { value: number; root: number; master: boolean; raw: number }

function finalizeNum(sum: number): NumResult {
  let n = sum;
  while (n > 9 && !isMasterNum(n)) n = String(n).split('').reduce((a, d) => a + Number(d), 0);
  return { value: n, root: isMasterNum(n) ? reduceTo9(n) : n, master: isMasterNum(n), raw: sum };
}
const digitSum = (s: string) => s.split('').reduce((a, c) => a + Number(c), 0);

export const lifePathNum = (d: number, m: number, y: number) => finalizeNum(digitSum(`${d}${m}${y}`));
export const birthdayNum = (d: number) => finalizeNum(d);
export const personalYearNum = (d: number, m: number) => finalizeNum(digitSum(`${d}${m}${new Date().getFullYear()}`));

function nameSum(name: string, keep: (ch: string) => boolean) {
  return name.toLowerCase().replace(/[^a-z]/g, '').split('').filter(keep).reduce((a, c) => a + (PYTHAG_MAP[c] ?? 0), 0);
}
export const expressionNum = (name: string) => finalizeNum(nameSum(name, () => true));
export const soulUrgeNum = (name: string) => finalizeNum(nameSum(name, (c) => VOWEL_SET.has(c)));
export const personalityNum = (name: string) => finalizeNum(nameSum(name, (c) => !VOWEL_SET.has(c)));

export interface Blueprint {
  lifePath: NumResult; expression: NumResult; soulUrge: NumResult;
  personality: NumResult; birthday: NumResult; personalYear: NumResult;
}
export function computeBlueprint(name: string, d: number, m: number, y: number): Blueprint {
  return {
    lifePath: lifePathNum(d, m, y),
    expression: expressionNum(name),
    soulUrge: soulUrgeNum(name),
    personality: personalityNum(name),
    birthday: birthdayNum(d),
    personalYear: personalYearNum(d, m),
  };
}
