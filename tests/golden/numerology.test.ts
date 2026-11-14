/**
 * Hand-worked numerology cases (tests/golden/numerology.vectors.json). The first five Lo Shu
 * cases are the owner's spot-check kit: each was chosen so that one disputed rule would change a
 * visible cell, so a difference from a reference calculator points at a single config option.
 */
import { describe, expect, it } from 'vitest';
import vectors from './numerology.vectors.json';
import {
  DIGITS, LOSHU_INDIAN_STANDARD, analyseMobile, chaldeanName, expression, karmicLessons, kua, lifePath, loShu,
  normalizeName, parseISODate, personalCycles, personality, pinnacles, soulUrge,
  type Gender, type YMD,
} from '@/engine/numerology';

const ymd = (iso: string): YMD => {
  const d = parseISODate(iso);
  if (!d) throw new Error(`bad test date ${iso}`);
  return d;
};
const counts = (c: Readonly<Record<number, number>>) => DIGITS.map((d) => c[d]);

describe('Lo Shu grid: hand-worked cases', () => {
  for (const c of vectors.loShu) {
    it(`${c.id} ${c.date} ${c.gender ?? 'no gender'}`, () => {
      const r = loShu(ymd(c.date), c.gender as Gender | null);
      expect(r.driver).toBe(c.driver);
      expect(r.conductor).toBe(c.conductor);
      expect(r.kua?.raw ?? null).toBe(c.kuaRaw);
      expect(r.kua?.mansion ?? null).toBe(c.kua);
      expect(r.driverAdded).toBe(c.driverAdded);
      expect(counts(r.birth.counts)).toEqual(c.birthCounts);
      expect(counts(r.full.counts)).toEqual(c.fullCounts);
      expect(r.full.missing).toEqual(c.missing);
    });
  }

  it('K5: the solar-year rule would give a different Kua, and the result says so', () => {
    const c = vectors.loShu.find((x) => x.id === 'K5')!;
    const r = loShu(ymd(c.date), 'male');
    expect(r.kua?.solarYearAlternative).toEqual({ year: 1991, raw: c.solarYearKua, mansion: c.solarYearKua });
    expect(kua(ymd(c.date), 'male', { ...LOSHU_INDIAN_STANDARD, kuaYear: 'solar-feb4' }).mansion).toBe(c.solarYearKua);
  });
});

describe('Kua number: hand-worked years', () => {
  for (const c of vectors.kua) {
    it(`${c.year}: male ${c.male}, female ${c.female}`, () => {
      const date = { y: c.year, m: 6, d: 15 };
      expect(kua(date, 'male').mansion).toBe(c.male);
      expect(kua(date, 'female').mansion).toBe(c.female);
    });
  }
});

describe('Life Path: component method with master numbers', () => {
  for (const c of vectors.lifePath) {
    it(c.date, () => {
      const lp = lifePath(ymd(c.date));
      expect(lp.parts.map((p) => p.reduced)).toEqual(c.parts);
      expect(lp.value).toBe(c.value);
      expect(lp.master).toBe(c.master);
      expect(lp.karmicDebt).toBe(c.karmicDebt);
      expect(lp.alternative?.value ?? null).toBe(c.alternative);
    });
  }
});

describe('Pinnacles, challenges and personal cycles', () => {
  for (const c of vectors.pinnacles) {
    it(c.date, () => {
      const p = pinnacles(ymd(c.date));
      expect(p.map((x) => x.number)).toEqual(c.numbers);
      expect(p.map((x) => x.challenge)).toEqual(c.challenges);
      expect(p.map((x) => [x.fromAge, x.toAge])).toEqual(c.ages);
    });
  }
  for (const c of vectors.personalCycles) {
    it(`${c.birth} on ${c.on}`, () => {
      const cycles = personalCycles(ymd(c.birth), ymd(c.on));
      expect([cycles.year, cycles.month, cycles.day]).toEqual([c.year, c.month, c.day]);
    });
  }
});

describe('Name numbers', () => {
  for (const c of vectors.pythagoreanNames) {
    it(`Pythagorean: ${c.name}`, () => {
      const name = normalizeName(c.name);
      expect(expression(name)?.value).toBe(c.expression);
      expect(soulUrge(name)?.value).toBe(c.soulUrge);
      expect(personality(name)?.value).toBe(c.personality);
      expect(karmicLessons(name)).toEqual(c.karmicLessons);
    });
  }
  for (const c of vectors.chaldean) {
    it(`Chaldean: ${c.name}`, () => {
      const r = chaldeanName(c.name)!;
      expect(r.words.map((w) => w.total)).toEqual(c.wordTotals);
      expect(r.compound).toBe(c.compound);
      expect(r.root).toBe(c.root);
      expect(r.perWordTotal).toBe(c.perWordTotal);
    });
  }
});

describe('Mobile numbers', () => {
  for (const c of vectors.mobile) {
    it(c.input, () => {
      const r = analyseMobile(c.input)!;
      expect(r.digits.join('')).toBe(c.digits);
      expect(r.total).toBe(c.total);
      expect(r.root).toBe(c.root);
      expect(r.strippedPrefix).toBe(c.strippedPrefix);
    });
  }
});
