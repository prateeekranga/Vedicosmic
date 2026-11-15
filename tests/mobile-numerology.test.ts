/**
 * The mobile number report: the Number score and its four parts, the purpose weighting, the
 * ending, named yogas, digit balance, the Lo Shu grid with the number, and the help for choosing a
 * number. Worked examples are checked by hand in the comments; the loops check properties that must
 * hold for every number and every pair of birth numbers.
 */
import { describe, expect, it } from 'vitest';
import {
  DIGITS, MOBILE_STANDARD, PAIR_IMPACT, PAIR_YOGA, analyseMobile, chaldeanName, compatibilityLevel, loShu,
  mobileCompatibility, numberChecklist, pairRelation, rootsForBirth, weightedLevel, yogaImpact,
  type MobilePurpose,
} from '@/engine/numerology';

// 15 August 1990: Mulank 6, Bhagyank 6.
const DATE = { y: 1990, m: 8, d: 15 };
const PURPOSES: MobilePurpose[] = ['both', 'personal', 'business'];

/** A fixed list of ten-digit numbers, so the property tests are the same on every run. */
function sampleNumbers(count: number): string[] {
  let seed = 20261115;
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };
  return Array.from({ length: count }, () => String(6 + (next() % 4)) + Array.from({ length: 9 }, () => next() % 10).join(''));
}

describe('Number score', () => {
  it('adds four parts with their working: 98171 45678 for 15 August 1990', () => {
    const r = analyseMobile('9817145678', { date: DATE })!;
    const s = r.withBirth!.score;
    // Root 2 is strained with 6 on both sides: −2 of ±4, so 40 × 2 ÷ 8 = 10.
    // Pairs weigh 1, 1.25 … 3 (sum 18); benefic 17, 71, 56, 67 weigh 1.5 + 1.75 + 2.5 + 2.75 = 8.5; 8.5 ÷ 18 × 35 = 16.5 → 17.
    // Ending 5678 adds to 26, root 8, friends with 6 on both sides: +4, so 15.
    expect(s.parts.map((p) => [p.key, p.points, p.max])).toEqual([['birth', 10, 40], ['pairs', 17, 35], ['ending', 15, 15], ['balance', 10, 10]]);
    expect(s.total).toBe(52);
    expect(s.band).toBe(2);
    expect(s.parts[0].working).toContain('40 × (−2 + 4) ÷ 8 = 10');
    expect(s.parts[1].working).toContain('47% of 35 = 17');
  });

  it('takes points off the digit balance and the ending for zeros and repeats: 99990 00000', () => {
    const r = analyseMobile('9999000000', { date: DATE })!;
    expect(r.zeros).toEqual({ count: 6, trailing: 6, longestRun: 6 });
    expect(r.overloaded).toEqual([{ digit: 0, count: 6 }, { digit: 9, count: 4 }]);
    expect(r.runs.map((x) => [x.digit, x.length])).toEqual([[9, 4], [0, 6]]);
    expect(r.ending.root).toBeNull();
    expect(r.withBirth!.endingFit).toBeNull();
    const parts = Object.fromEntries(r.withBirth!.score.parts.map((p) => [p.key, p.points]));
    expect(parts.ending).toBe(0);
    expect(parts.balance).toBe(0);
    expect(r.cautions.map((c) => c.kind)).toEqual(['overloaded', 'overloaded', 'run', 'run', 'zeros', 'ends-in-zero']);
  });

  it('keeps every part within its range and the total equal to their sum', () => {
    const maxes = MOBILE_STANDARD.scoreParts;
    expect(maxes.birth + maxes.pairs + maxes.ending + maxes.balance).toBe(100);
    const dates = [DATE, { y: 1985, m: 6, d: 14 }, { y: 2001, m: 1, d: 31 }, { y: 1972, m: 12, d: 9 }];
    for (const n of sampleNumbers(300)) {
      for (const date of dates) {
        for (const purpose of PURPOSES) {
          const s = analyseMobile(n, { date, purpose })!.withBirth!.score;
          expect(s.total).toBe(s.parts.reduce((a, p) => a + p.points, 0));
          for (const p of s.parts) {
            expect(p.points >= 0 && p.points <= p.max, `${n} ${p.key}`).toBe(true);
            expect(p.working.length).toBeGreaterThan(20);
          }
          const b = MOBILE_STANDARD.bands;
          expect(s.band).toBe(s.total >= b[5] ? 5 : s.total >= b[4] ? 4 : s.total >= b[3] ? 3 : s.total >= b[2] ? 2 : 1);
        }
      }
    }
  });

  it('is present only with a date of birth', () => {
    expect(analyseMobile('9817145678')!.withBirth).toBeNull();
  });
});

describe('purpose weighting', () => {
  it('with equal weights gives exactly the level from the −4 to +4 points, for every root and pair of birth numbers', () => {
    for (const root of DIGITS) for (const driver of DIGITS) for (const conductor of DIGITS) {
      const c = mobileCompatibility(root, driver, conductor);
      expect(c.weighted).toBe(2 * c.points);
      expect(c.level).toBe(compatibilityLevel(c.points));
    }
    expect([-8, -6, -5, -2, -1, 0, 1, 2, 5, 6, 8].map(weightedLevel)).toEqual([1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5]);
  });

  it('leans towards the Mulank for a personal phone and the Bhagyank for a business one', () => {
    for (const root of DIGITS) for (const driver of DIGITS) for (const conductor of DIGITS) {
      const both = mobileCompatibility(root, driver, conductor, 'both');
      const personal = mobileCompatibility(root, driver, conductor, 'personal');
      const business = mobileCompatibility(root, driver, conductor, 'business');
      expect(personal.weighted).toBe(3 * both.driverPoints + both.conductorPoints);
      expect(business.weighted).toBe(both.driverPoints + 3 * both.conductorPoints);
      if (both.driverPoints > both.conductorPoints) {
        expect(personal.level).toBeGreaterThanOrEqual(both.level);
        expect(business.level).toBeLessThanOrEqual(both.level);
      }
      if (both.driverPoints === both.conductorPoints) {
        expect(personal.level).toBe(both.level);
        expect(business.level).toBe(both.level);
      }
    }
  });

  it('says which weighting it used in the working', () => {
    // 14 June 1985: Mulank 5, Bhagyank 7. Root 2 is mixed with 5 (0) and unfriendly with 7 (−2).
    const date = { y: 1985, m: 6, d: 14 };
    const personal = analyseMobile('9817145678', { date, purpose: 'personal' })!;
    expect(personal.withBirth!.compatibility).toMatchObject({ driverPoints: 0, conductorPoints: -2, weighted: -2, level: 2 });
    expect(personal.steps.at(-1)!.working).toContain('personal phone');
    expect(analyseMobile('9817145678', { date, purpose: 'business' })!.withBirth!.compatibility).toMatchObject({ weighted: -6, level: 1 });
  });
});

describe('pairs in order, the ending and named yogas', () => {
  it('weighs the pairs from 1 for the first to 3 for the last and marks the last four digits', () => {
    const r = analyseMobile('9817145678')!;
    expect(r.sequence.map((p) => p.weight)).toEqual([1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]);
    expect(r.sequence.filter((p) => p.inEnding).map((p) => p.pair.join(''))).toEqual(['56', '67', '78']);
    expect(r.ending).toEqual({ digits: [5, 6, 7, 8], total: 26, root: 8, lastPair: [7, 8], lastDigit: 8 });
    // Repeats count in the sequence but once in the list of distinct pairs.
    const repeat = analyseMobile('7171212345')!;
    expect(repeat.sequence).toHaveLength(9);
    expect(repeat.pairs.find((p) => p.pair.join('') === '71')!.count).toBe(2);
  });

  it('names each yoga only where the chart class agrees with it', () => {
    expect(Object.keys(PAIR_YOGA).sort()).toEqual(['14', '15', '17', '23', '24', '28', '29', '34', '45', '48', '49', '56']);
    for (const [key, yoga] of Object.entries(PAIR_YOGA)) {
      expect(PAIR_IMPACT[key], key).toBe(yogaImpact(yoga) === 'malefic' ? 'malefic' : 'benefic');
    }
    const r = analyseMobile('9817145678')!;
    expect(r.yogas.map((y) => [y.yoga, y.written.join(','), y.inEnding])).toEqual([
      ['raj', '17,71', false], ['grahan', '14', false], ['bandhan', '45', false], ['lakshmi-narayan', '56', true],
    ]);
    // Named malefic yogas come first; an unnamed malefic pair is a caution only in the ending.
    expect(r.cautions).toEqual([
      { kind: 'yoga', yoga: 'grahan', written: ['14'] },
      { kind: 'yoga', yoga: 'bandhan', written: ['45'] },
      { kind: 'ending-pair', pair: '78' },
    ]);
  });

  it('reads the total as a Cheiro compound number from 10 to 52', () => {
    expect(analyseMobile('9817145678')!.compoundKey).toBe(11); // 56 → 5 + 6 = 11
    expect(analyseMobile('9999000000')!.compoundKey).toBe(36);
    expect(analyseMobile('1000000000')!.compoundKey).toBeNull(); // a total of 1
    expect(analyseMobile('9817145678')!.steps.map((s) => s.key)).toEqual(['total', 'root', 'compound', 'ending']);
  });
});

describe('Lo Shu grid with the number', () => {
  it('adds the non-zero digits to the person’s full grid and says what changed', () => {
    for (const n of sampleNumbers(60)) {
      const g = analyseMobile(n, { date: DATE, gender: 'female' })!.withBirth!.grid;
      expect(g.person).toEqual(loShu(DATE, 'female'));
      for (const d of DIGITS) {
        const before = g.person.full.counts[d];
        expect(g.withNumber.counts[d]).toBe(before + g.added[d]);
        expect(g.status[d]).toBe(before === 0 ? (g.added[d] ? 'introduced' : 'missing') : g.added[d] ? 'strengthened' : 'unchanged');
      }
      for (const id of g.newLines) {
        expect(g.withNumber.lines.find((l) => l.id === id)!.status).toBe('full');
        expect(g.person.full.lines.find((l) => l.id === id)!.status).not.toBe('full');
      }
    }
    // 98171 45678 brings the 4 and 7 that 15 August 1990 lacks, completing the Golden Raj Yog 4-5-6.
    const g = analyseMobile('9817145678', { date: DATE })!.withBirth!.grid;
    expect(g.newLines).toContain('golden');
    expect([g.status[4], g.status[7], g.status[2]]).toEqual(['introduced', 'introduced', 'missing']);
  });
});

describe('choosing a number', () => {
  it('rates every root with the same comparison as the number itself', () => {
    for (const driver of DIGITS) for (const conductor of DIGITS) for (const purpose of PURPOSES) {
      const roots = rootsForBirth(driver, conductor, purpose);
      expect(roots.map((r) => r.root)).toEqual([...DIGITS]);
      for (const r of roots) expect(r.compatibility).toEqual(mobileCompatibility(r.root, driver, conductor, purpose));
    }
  });

  it('builds a checklist from the person’s numbers and grid', () => {
    const person = loShu(DATE, null);
    const c = numberChecklist(person.driver, person.conductor, person.full);
    const levels = rootsForBirth(person.driver, person.conductor).map((r) => r.compatibility.level);
    expect(c.bestLevel).toBe(Math.max(...levels));
    expect(c.best.every((d) => levels[d - 1] === c.bestLevel)).toBe(true);
    expect(c.include).toEqual(person.full.missing);
    expect(c.maxRepeats).toBe(3);
    const malefic = Object.keys(PAIR_IMPACT).filter((k) => PAIR_IMPACT[k] === 'malefic').sort();
    expect([...c.avoidNamed.map((a) => a.key), ...c.avoidOther].sort()).toEqual(malefic);
    expect(c.avoidOther).toEqual([...c.avoidOther].sort());
  });
});

describe('name number', () => {
  it('compares the Chaldean root of a name with the number’s root', () => {
    const r = analyseMobile('9817145678', { name: 'Asha Rao' })!;
    const name = chaldeanName('Asha Rao')!;
    expect(r.nameFit).toEqual({ compound: name.compound, root: name.root, relation: pairRelation(r.root, name.root) });
    expect(analyseMobile('9817145678', { name: '   ' })!.nameFit).toBeNull();
    expect(analyseMobile('9817145678', { name: 'राहुल' })!.nameFit).toBeNull();
  });
});
