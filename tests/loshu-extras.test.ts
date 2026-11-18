/**
 * The parts of the Lo Shu report from the founder's lineage teaching: marriage years by the Vivah
 * Mulank, money through 5 and 6, the care for several 7s, the pair tables, and the name and mobile
 * number beside the date of birth. The owner's worked example and table are pinned exactly.
 */
import { describe, expect, it } from 'vitest';
import { claimHits } from './helpers/claims';
import {
  DIGITS, MARRIAGE_FROM_AGE, VIVAH_MATCH, analyseMobile, loShu, marriageListStart, marriageYears, moneyReading, mulankMaha, nameReading,
  repeatedForRemedy, rootOf, sevensCaution, upcomingFromList, vivahYear, type Digit, type YMD,
} from '@/engine/numerology';
import { ALL_PAIRS, PAIR_TIPS, nameSuitsPair, pairTips } from '@/data/numerology/pairTips';
import * as PAIR from '@/data/numerology/pairTips';
import * as X from '@/data/numerology/extrasText';

const ymd = (y: number, m: number, d: number): YMD => ({ y, m, d });

describe('marriage years by the Vivah Mulank', () => {
  it('follows the owner’s worked example: born 1 January 2001, the year 2027', () => {
    const date = ymd(2001, 1, 1);
    const grid = loShu(date, null);
    expect(grid.driver).toBe(1);
    expect(grid.conductor).toBe(5);
    const maha = mulankMaha(date);
    expect(maha.value).toBe(2);
    expect(maha.working).toBe('Mulank 1 + month 1 = 2');
    const y = vivahYear(date, 2027);
    expect(y.total).toBe(2029);
    expect(y.vivah).toBe(4);
    expect(y.match).toBe(true);
    expect(y.working).toBe('2027 + 2 = 2029, then 2 + 0 + 2 + 9 = 13, then 1 + 3 = 4');
  });

  it('uses the owner’s table exactly', () => {
    expect(VIVAH_MATCH).toEqual({
      1: [1, 4, 5, 7, 9], 2: [1, 2, 5, 6, 8], 3: [3, 6, 7, 9], 4: [1, 2, 4, 7, 8], 5: [2, 3, 5, 7, 9],
      6: [1, 2, 3, 5, 6, 9], 7: [1, 2, 4, 8], 8: [1, 2, 4, 6, 8], 9: [1, 2, 3, 6, 7],
    });
  });

  it('adds a two-digit Mulank Maha down before using it, which gives the same year digit either way', () => {
    const maha = mulankMaha(ymd(1990, 12, 28));
    expect(maha).toMatchObject({ mulank: 1, sum: 13, value: 4 });
    expect(maha.working).toBe('Mulank 1 + month 12 = 13, then 1 + 3 = 4');
    for (const m of [1, 5, 9, 10, 11, 12]) {
      for (const d of [1, 9, 18, 27, 31]) {
        if (m === 2 && d > 28) continue;
        const date = ymd(1985, m, d);
        const sum = rootOf(d) + m;
        for (let year = 2020; year < 2040; year++) {
          expect(vivahYear(date, year).vivah).toBe(rootOf(year + sum));
        }
      }
    }
  });

  it('lists twelve years from this year, or from the 18th birthday year when that is later', () => {
    expect(marriageListStart(ymd(1990, 5, 5), 2026)).toBe(2026);
    expect(marriageListStart(ymd(2015, 5, 5), 2026)).toBe(2015 + MARRIAGE_FROM_AGE);
    const years = marriageYears(ymd(2001, 1, 1), 2026);
    expect(years.map((y) => y.year)).toEqual(Array.from({ length: 12 }, (_, i) => 2026 + i));
    expect(years.find((y) => y.year === 2027)!.age).toBe(26);
    // The Vivah Mulank steps through all nine digits in turn, so every Mulank has a marriage year within nine years.
    for (const d of DIGITS) expect(marriageYears(ymd(1995, 3, d), 2026, 9).some((y) => y.match)).toBe(true);
  });
});

describe('money through 5 and 6, and several 7s', () => {
  it('reads both, one or neither', () => {
    expect(moneyReading(loShu(ymd(1956, 5, 16), null)).state).toBe('both');
    const none = loShu(ymd(1990, 1, 1), null);
    expect(none.full.counts[5] + none.full.counts[6]).toBe(0);
    expect(moneyReading(none)).toMatchObject({ state: 'none', present: 0, missing: [5, 6] });
  });

  it('notes the Golden Raj Yog when 4-5-6 is complete', () => {
    const r = loShu(ymd(1946, 5, 4), null);
    expect(r.full.lines.find((l) => l.id === 'golden')!.status).toBe('full');
    expect(moneyReading(r).golden).toBe(true);
  });

  it('flags two or more 7s, and marks the 7 for its own remedies', () => {
    const r = loShu(ymd(1977, 7, 7), null);
    expect(r.full.counts[7]).toBeGreaterThanOrEqual(2);
    expect(sevensCaution(r)).toEqual({ count: r.full.counts[7] });
    expect(repeatedForRemedy(r).find((x) => x.digit === 7)!.sevens).toBe(true);
    const one = loShu(ymd(1990, 1, 1), null);
    expect(sevensCaution(one)).toBeNull();
  });
});

describe('pair tables', () => {
  it('cover all 81 pairs with sane values', () => {
    expect(ALL_PAIRS).toHaveLength(81);
    for (const [a, b] of ALL_PAIRS) {
      const t = PAIR_TIPS[a][b];
      const where = `${a} & ${b}`;
      expect(t.numbers.length, where).toBeGreaterThan(0);
      for (const n of t.numbers) expect(DIGITS, where).toContain(n);
      for (const d of [...t.dates, ...t.carefulDates]) expect(d >= 1 && d <= 31, where).toBe(true);
      expect(t.dates.filter((d) => t.carefulDates.includes(d)), `${where}: a date both suits and needs care`).toEqual([]);
      const lower = (xs: string[]) => xs.map((x) => x.toLowerCase());
      expect(lower(t.colours).filter((c) => lower(t.carefulColours).includes(c)), `${where}: a colour on both lists`).toEqual([]);
      expect(t.names.length, where).toBeGreaterThan(0);
      expect(t.business.length, where).toBeGreaterThan(0);
      expect(t.work.length, where).toBeGreaterThan(0);
      expect(t.stones.length, where).toBeGreaterThan(0);
      if (t.bestName) expect(t.names, where).toContain(t.bestName);
    }
  });

  it('keeps the source’s lists, with the noted corrections', () => {
    expect(pairTips(1, 1).numbers).toEqual([1, 6]);
    expect(pairTips(1, 1).names).toEqual([1, 6, 15, 19, 24, 33, 37, 42, 46, 64, 69]);
    expect(pairTips(1, 2).dates).toContain(16);
    expect(pairTips(1, 6).dates).toEqual([1, 6, 9, 10, 15, 18, 19, 24, 27, 28]);
    expect(pairTips(4, 9).colours).toContain('Red');
    expect(pairTips(4, 9).carefulColours).not.toContain('Red');
    expect(pairTips(3, 3).bestName).toBe(45);
    expect(pairTips(8, 2).stonesToSkip).toEqual(['Blue diamond']);
    expect(pairTips(5, 8).carefulDates).toEqual([]);
  });

  it('checks a name total against the pair', () => {
    expect(nameSuitsPair(pairTips(1, 1), 37)).toBe(true);
    expect(nameSuitsPair(pairTips(1, 1), 38)).toBe(false);
  });
});

describe('name and mobile beside the date of birth', () => {
  const r = loShu(ymd(2001, 1, 1), 'male');

  it('reads the name in the Chaldean system and sets its root beside the Mulank and Bhagyank', () => {
    const n = nameReading('Prateek Sharma', r)!;
    expect(n.chaldean.compound).toBe(n.chaldean.words.reduce((a, w) => a + w.total, 0));
    expect(n.chaldean.root).toBe(rootOf(n.chaldean.compound));
    expect(['yours', 'friendly', 'neutral', 'challenging', 'mixed', 'careful']).toContain(n.fit);
    expect(n.suppliesMissing).toBe(r.full.counts[n.chaldean.root] === 0);
    expect(nameReading('१२३', r)).toBeNull();
  });

  it('scores a mobile number with the Mobile Number Numerology engine', () => {
    const m = analyseMobile('98765 43210', { date: r.date, gender: r.gender })!;
    expect(m.withBirth!.compatibility.level).toBeGreaterThanOrEqual(1);
    expect(m.withBirth!.score.total).toBeLessThanOrEqual(100);
  });

  it('lays the pair’s dates out on the calendar, own number first', () => {
    const t = pairTips(r.driver, r.conductor);
    const out = upcomingFromList(ymd(2026, 11, 18), r.driver, t.dates, t.carefulDates);
    for (const d of out.own) expect(rootOf(d.date.d)).toBe(r.driver);
    for (const d of [...out.own, ...out.other]) expect(t.dates).toContain(d.date.d);
    for (const d of out.careful) expect(t.carefulDates).toContain(d.date.d);
  });
});

describe('wording', () => {
  const texts = (): string[] => {
    const out: string[] = [];
    for (const v of [...Object.values(X), ...Object.values(PAIR)]) {
      if (typeof v === 'string') out.push(v);
      else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out.push(...(v as string[]));
      else if (v && typeof v === 'object' && !Array.isArray(v)) {
        for (const w of Object.values(v)) {
          if (typeof w === 'string') out.push(w);
          else if (w && typeof w === 'object') out.push(...Object.values(w).filter((x): x is string => typeof x === 'string'));
        }
      }
    }
    for (const d of DIGITS) out.push(X.marriageRule(d as Digit), X.nameSupplies(d as Digit), X.mobileInPair(d as Digit, true), X.mobileInPair(d as Digit, false));
    out.push(X.marriageSummary([]), X.marriageSummary([2027, 2029]), X.sevensText(2), X.sevensText(4), X.mobileSupplies([]), X.mobileSupplies([3, 4]),
      X.nameInPair(37, 1, 1), X.nameNotInPair(38, [19, 37]), X.nameBest(42), X.MONEY_COUNT(1));
    for (const [a, b] of ALL_PAIRS) {
      const t = PAIR_TIPS[a][b];
      out.push(...t.work, ...t.colours, ...t.carefulColours, ...t.stones, ...t.stonesToSkip);
    }
    return out;
  };

  it('avoids banned claim words', () => {
    expect(claimHits(texts())).toEqual([]);
  });

  it('says where the lineage readings come from', () => {
    expect(X.MARRIAGE_SOURCE).toMatch(/lineage teaching/);
    expect(X.MARRIAGE_SOURCE).toMatch(/not a promise/);
    expect(X.MONEY_SOURCE).toMatch(/lineage teaching/);
    expect(X.sevensText(2)).toMatch(/lineage teaching/);
    expect(X.SEVENS_DOCTOR).toMatch(/Not medical advice/);
  });
});
