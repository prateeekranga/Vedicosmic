/**
 * The text the numerology tools show: every key is present, nothing is over-long, nothing
 * promises an outcome for health, money, the law or relationships, and every number's colour is
 * readable.
 */
import { describe, expect, it } from 'vitest';
import { DIGITS, LOSHU_LINES, PAIR_IMPACT, PAIR_IMPACT_AS_WRITTEN, pairImpact } from '@/engine/numerology';
import { MASTER_TEXT, NUMBERS } from '@/data/numerology/numbers';
import {
  KUA_TEXT, LINE_TEXT, MISSING_TEXT, RELATION_TEXT, REPEAT_TEXT, SAME_NUMBER_TEXT, lineReading, repeatReading,
} from '@/data/numerology/loshuText';
import {
  CHALLENGE_TEXT, CYCLE_TEXT, KARMIC_DEBT_TEXT, KARMIC_LESSON_TEXT, LIFE_PATH_TEXT, NUMBER_TRAIT, PINNACLE_TEXT,
} from '@/data/numerology/westernText';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import { LEVEL_LABEL, LEVEL_NEEDS_BIRTH, LEVEL_TEXT, ROOT_FIT_TEXT, SAME_ROOT_TEXT } from '@/data/numerology/mobileText';
import {
  IMPACT_NOTE, PAIR_READING, PAIR_READING_AS_WRITTEN, RAJ_YOG_NOTE, pairReading,
} from '@/data/numerology/mobilePairText';

const words = (s: string) => s.trim().split(/\s+/).length;

/** Every sentence a visitor can be shown, gathered for the lint below. */
function allText(): string[] {
  const out: string[] = [SAME_NUMBER_TEXT, SAME_ROOT_TEXT, LEVEL_NEEDS_BIRTH, IMPACT_NOTE, RAJ_YOG_NOTE.clear, RAJ_YOG_NOTE.weakened];
  for (const d of DIGITS) {
    const n = NUMBERS[d];
    out.push(n.strength, n.growthEdge, n.keyword, MISSING_TEXT[d].meaning, MISSING_TEXT[d].practice,
      KARMIC_LESSON_TEXT[d], CYCLE_TEXT[d].year, CYCLE_TEXT[d].short, ...REPEAT_TEXT[d]);
  }
  for (const t of Object.values(MASTER_TEXT)) out.push(t.text);
  for (const t of Object.values(LINE_TEXT)) out.push(t.full, t.partial, t.empty, t.theme);
  for (const t of Object.values(KUA_TEXT)) out.push(t);
  for (const t of Object.values(RELATION_TEXT)) out.push(t.text);
  out.push(...Object.values(LIFE_PATH_TEXT), ...Object.values(NUMBER_TRAIT), ...Object.values(KARMIC_DEBT_TEXT),
    ...Object.values(PINNACLE_TEXT), ...Object.values(CHALLENGE_TEXT), ...Object.values(ROOT_FIT_TEXT),
    ...Object.values(LEVEL_TEXT), ...Object.values(PAIR_READING), ...Object.values(PAIR_READING_AS_WRITTEN));
  for (let n = 10; n <= 52; n++) out.push(compoundReading(n)!.text);
  return out;
}

describe('numerology text: completeness', () => {
  it('covers every number, line and state', () => {
    for (const d of DIGITS) {
      expect(NUMBERS[d].n).toBe(d);
      expect(REPEAT_TEXT[d]).toHaveLength(4);
      for (const count of [1, 2, 3, 4, 7]) expect(repeatReading(d, count).length).toBeGreaterThan(20);
      expect(MISSING_TEXT[d].practice).toMatch(/^Traditionally suggested:/);
      expect(CYCLE_TEXT[d]).toBeDefined();
      expect(KARMIC_LESSON_TEXT[d]).toBeDefined();
    }
    for (const line of LOSHU_LINES) {
      for (const status of ['full', 'partial', 'single', 'empty'] as const) {
        expect(lineReading(line.id, status).length, `${line.id} ${status}`).toBeGreaterThan(20);
      }
    }
    for (const k of [1, 2, 3, 4, 6, 7, 8, 9] as const) expect(KUA_TEXT[k]).toContain(`Kua ${k} `);
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
      expect(LIFE_PATH_TEXT[n], `Life Path ${n}`).toBeDefined();
      expect(NUMBER_TRAIT[n]).toBeDefined();
    }
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]) expect(PINNACLE_TEXT[n]).toBeDefined();
    for (let n = 0; n <= 8; n++) expect(CHALLENGE_TEXT[n]).toBeDefined();
    for (const n of [13, 14, 16, 19] as const) expect(KARMIC_DEBT_TEXT[n]).toBeDefined();
  });

  it('has a reading for every compound number from 10 to 52 and none outside', () => {
    for (let n = 10; n <= 52; n++) {
      const r = compoundReading(n);
      expect(r, `compound ${n}`).not.toBeNull();
      expect(words(r!.text)).toBeLessThanOrEqual(45);
    }
    expect(compoundReading(9)).toBeNull();
    expect(compoundReading(53)).toBeNull();
    expect(compoundReading(42)).toMatchObject({ sameAs: 24, text: compoundReading(24)!.text });
  });

  it('has a class and a reading for every pair of digits from 00 to 99', () => {
    expect(Object.keys(PAIR_READING).sort()).toEqual(Object.keys(PAIR_IMPACT).sort());
    expect(Object.keys(PAIR_READING)).toHaveLength(55);
    expect(Object.keys(PAIR_READING_AS_WRITTEN).sort()).toEqual(Object.keys(PAIR_IMPACT_AS_WRITTEN).sort());
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        expect(['benefic', 'neutral', 'malefic'], `${a}${b}`).toContain(pairImpact(a, b));
        const text = pairReading(a, b);
        expect(text?.length, `${a}${b}`).toBeGreaterThan(40);
        expect(words(text), `${a}${b}`).toBeLessThanOrEqual(34);
      }
    }
    // The chart reads 12 and 21 differently; every other pair reads the same both ways round.
    expect(pairReading(2, 1)).not.toBe(pairReading(1, 2));
    expect(pairReading(7, 1)).toBe(pairReading(1, 7));
    for (const level of [1, 2, 3, 4, 5] as const) {
      expect(LEVEL_LABEL[level].length).toBeGreaterThan(2);
      expect(words(LEVEL_TEXT[level])).toBeLessThanOrEqual(34);
    }
  });

  it('keeps each piece short enough to read at a glance', () => {
    for (const d of DIGITS) {
      expect(words(NUMBERS[d].strength)).toBeLessThanOrEqual(45);
      expect(words(NUMBERS[d].growthEdge)).toBeLessThanOrEqual(45);
      for (const t of REPEAT_TEXT[d]) expect(words(t)).toBeLessThanOrEqual(30);
    }
    for (const t of Object.values(LIFE_PATH_TEXT)) expect(words(t)).toBeLessThanOrEqual(65);
  });
});

describe('numerology text: no promises', () => {
  // Words that would turn a traditional reading into a claim about health, money, the law,
  // relationships or fate. A reading may name a theme; it may not predict or guarantee one.
  const BANNED = [
    /\bguarantee/i, /\bcure[sd]?\b/i, /\bdisease/i, /\billness/i, /\bcancer\b/i, /\bheart (attack|problem)/i, /\bparalys/i,
    /\bhospital/i, /\bcourt\b/i, /\blawsuit/i, /\bjail\b/i, /\bprison/i, /\bdeath\b/i, /\bdie[sd]?\b/i, /\baccident/i,
    /\bdivorce/i, /\bbankrupt/i, /\blottery/i, /\bjackpot/i, /\b(get|become|be) rich\b/i, /\bsure to\b/i, /\bwill (bring|make|give|get) you\b/i,
    /\bunlucky\b/i, /\bassassin/i, /\bruin(ed|s)?\b/i, /\bdepress(ed|ion)\b/i, /\bloan\b/i,
  ];

  it('avoids banned claim words everywhere', () => {
    const hits: string[] = [];
    for (const text of allText()) {
      for (const re of BANNED) if (re.test(text)) hits.push(`${re}: ${text}`);
    }
    expect(hits).toEqual([]);
  });

  it('never repeats a sentence across two readings', () => {
    const seen = new Map<string, number>();
    for (const text of allText()) seen.set(text, (seen.get(text) ?? 0) + 1);
    // Compound numbers that Cheiro reads the same share one text by design.
    const shared = new Set(Array.from({ length: 43 }, (_, i) => compoundReading(i + 10)!).filter((r) => r.sameAs).map((r) => r.text));
    const repeats = [...seen].filter(([text, count]) => count > 1 && !shared.has(text)).map(([text]) => text);
    expect(repeats).toEqual([]);
  });
});

describe('numerology colours', () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it('gives every number a distinct colour with readable ink (WCAG AA for normal text)', () => {
    const fills = DIGITS.map((d) => NUMBERS[d].colour.fill);
    expect(new Set(fills).size).toBe(9);
    for (const d of DIGITS) {
      const { fill, ink } = NUMBERS[d].colour;
      expect(contrast(fill, ink), `number ${d}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
