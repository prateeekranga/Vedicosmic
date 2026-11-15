/**
 * Properties of the numerology engine that must hold for every input: complete grids, config
 * options that change only what they say they change, and the same person getting the same
 * numbers from every function.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DIGITS, LOSHU_INDIAN_STANDARD, RELATION_POINTS, RELATION_TABLE, analyseMobile, birthdayNumber, chaldeanName,
  compatibilityLevel, daysInMonth, expression, gridDigits, isValidYMD, kua, lifePath, loShu, mobileCompatibility,
  normalizeMobile, normalizeName, pairImpact, pairRelation,
  parseISODate, personalCycles, pinnacles, profile, reduce, relationsOf, rootOf, soulUrge,
  type Digit, type Gender, type LoShuConfig, type YMD,
} from '@/engine/numerology';

function* everyDate(fromYear: number, toYear: number): Generator<YMD> {
  for (let y = fromYear; y <= toYear; y++) {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= daysInMonth(y, m); d++) yield { y, m, d };
    }
  }
}
const total = (c: Readonly<Record<Digit, number>>) => DIGITS.reduce((a, d) => a + c[d], 0);
const GENDERS: (Gender | null)[] = ['male', 'female', null];

describe('core arithmetic', () => {
  it('reduces to one digit, or stops at a master number when asked', () => {
    expect(reduce(1990).trail).toEqual([1990, 19, 10, 1]);
    expect(reduce(29).value).toBe(2);
    expect(reduce(29, 'keep')).toMatchObject({ value: 11, root: 2, master: true });
    expect(reduce(1948, 'keep').value).toBe(22);
    expect(reduce(13)).toMatchObject({ value: 4, karmicDebt: 13 });
    expect(reduce(7)).toMatchObject({ value: 7, trail: [7], karmicDebt: null });
    expect(reduce(0)).toMatchObject({ value: 0, root: 0 });
  });

  it('gives the digital root 1–9', () => {
    for (let n = 1; n <= 500; n++) expect(rootOf(n)).toBe(reduce(n).value);
    expect(() => rootOf(0)).toThrow();
  });

  it('accepts only real calendar dates', () => {
    expect(isValidYMD(2000, 2, 29)).toBe(true);
    expect(isValidYMD(1900, 2, 29)).toBe(false);
    expect(isValidYMD(2001, 2, 31)).toBe(false);
    expect(isValidYMD(2001, 4, 31)).toBe(false);
    expect(parseISODate('2000-02-31')).toBeNull();
    expect(parseISODate('2000-2-3')).toBeNull();
    expect(parseISODate('1990-08-15')).toEqual({ y: 1990, m: 8, d: 15 });
    expect(() => loShu({ y: 2000, m: 2, d: 31 }, null)).toThrow();
    expect(() => lifePath({ y: 2000, m: 2, d: 31 })).toThrow();
  });
});

describe('Lo Shu grid: every date from 1900 to 2099', () => {
  it('has all nine keys, counts that add up, and consistent missing numbers and lines', () => {
    // Plain checks collected into one list: 219,147 grids are too many for an assertion each.
    const problems: string[] = [];
    const STATUS = ['empty', 'single', 'partial', 'full'] as const;
    let checked = 0;
    for (const date of everyDate(1900, 2099)) {
      for (const gender of GENDERS) {
        const r = loShu(date, gender);
        const bad = (why: string) => { if (problems.length < 10) problems.push(`${date.y}-${date.m}-${date.d} ${gender}: ${why}`); };
        if (Object.keys(r.full.counts).join('') !== '123456789') bad('keys');
        const dateDigits = gridDigits(date).length;
        if (total(r.birth.counts) !== dateDigits) bad('birth total');
        const added = (r.driverAdded ? 1 : 0) + 1 + (gender ? 1 : 0);
        if (total(r.full.counts) !== dateDigits + added) bad('full total');
        for (const d of DIGITS) {
          const s = r.sources[d];
          if (s.birth + s.driver + s.conductor + s.kua !== r.full.counts[d]) bad(`sources of ${d}`);
          if ((r.full.counts[d] === 0) !== r.full.missing.includes(d)) bad(`missing ${d}`);
        }
        for (const line of r.full.lines) {
          if (line.present.length + line.absent.length !== 3 || line.status !== STATUS[line.present.length]) bad(`line ${line.id}`);
        }
        // The Driver and the Conductor are always somewhere in the full grid.
        if (r.full.counts[r.driver] === 0) bad('driver not in grid');
        if (r.full.counts[r.conductor] === 0) bad('conductor not in grid');
        checked++;
      }
    }
    expect(problems).toEqual([]);
    expect(checked).toBe(73049 * 3);
  });

  it('writes the Driver again only for two-digit days that do not end in zero', () => {
    for (let d = 1; d <= 31; d++) {
      const r = loShu({ y: 1990, m: 1, d }, null);
      expect(r.driverAdded, `day ${d}`).toBe(d >= 11 && d % 10 !== 0);
    }
  });

  it('agrees with the classical "last two digits" Kua rules', () => {
    const classic = (year: number, gender: Gender): number => {
      const s = rootOf((year % 100) || 9); // "00" counts as 9 in the two-digit rule (9 + 0 = 9)
      const n = year < 2000 ? (gender === 'male' ? 10 - s : 5 + s) : (gender === 'male' ? 9 - s : 6 + s);
      const k = n <= 0 ? n + 9 : rootOf(n);
      return k === 5 ? (gender === 'male' ? 2 : 8) : k;
    };
    for (let year = 1901; year <= 2099; year++) {
      if (year % 100 === 0) continue; // century years: the two-digit shortcut has no digits to add
      for (const gender of ['male', 'female'] as const) {
        expect(kua({ y: year, m: 6, d: 15 }, gender).mansion, `${year} ${gender}`).toBe(classic(year, gender));
      }
    }
  });
});

describe('Lo Shu config: each option changes only what it names', () => {
  const base = LOSHU_INDIAN_STANDARD;
  const diff = (date: YMD, gender: Gender | null, change: Partial<LoShuConfig>) => {
    const a = loShu(date, gender, base).full.counts;
    const b = loShu(date, gender, { ...base, ...change }).full.counts;
    return Object.fromEntries(DIGITS.filter((d) => a[d] !== b[d]).map((d) => [d, b[d] - a[d]]));
  };

  it('yearDigits: last-two drops the century digits', () => {
    // 15 Aug 1990: the "1" and "9" of "19" leave the grid.
    expect(diff({ y: 1990, m: 8, d: 15 }, 'female', { yearDigits: 'last-two' })).toEqual({ 1: -1, 9: -1 });
  });

  it('driverInGrid: always adds the Driver on single and round days too', () => {
    expect(diff({ y: 1984, m: 3, d: 5 }, 'male', { driverInGrid: 'always' })).toEqual({ 5: 1 });
    expect(diff({ y: 1975, m: 11, d: 20 }, 'female', { driverInGrid: 'always' })).toEqual({ 2: 1 });
    expect(diff({ y: 1990, m: 8, d: 15 }, 'female', { driverInGrid: 'always' })).toEqual({});
    expect(diff({ y: 1990, m: 8, d: 15 }, 'female', { driverInGrid: 'never' })).toEqual({ 6: -1 });
  });

  it('conductorInGrid and kuaInGrid: never removes exactly that number', () => {
    expect(diff({ y: 1984, m: 3, d: 5 }, 'male', { conductorInGrid: 'never' })).toEqual({ 3: -1 });
    expect(diff({ y: 1984, m: 3, d: 5 }, 'male', { kuaInGrid: 'never' })).toEqual({ 7: -1 });
  });

  it('kuaFive: keep writes 5 instead of the remapped number', () => {
    expect(diff({ y: 1990, m: 8, d: 15 }, 'female', { kuaFive: 'keep' })).toEqual({ 5: 1, 8: -1 });
    expect(diff({ y: 1986, m: 7, d: 13 }, 'male', { kuaFive: 'keep' })).toEqual({ 2: -1, 5: 1 });
    expect(diff({ y: 1984, m: 3, d: 5 }, 'male', { kuaFive: 'keep' })).toEqual({});
  });

  it('kuaYear: solar-feb4 moves only births before 4 February', () => {
    expect(diff({ y: 1992, m: 1, d: 28 }, 'male', { kuaYear: 'solar-feb4' })).toEqual({ 8: -1, 9: 1 });
    expect(diff({ y: 1992, m: 2, d: 3 }, 'male', { kuaYear: 'solar-feb4' })).toEqual({ 8: -1, 9: 1 });
    expect(diff({ y: 1992, m: 2, d: 4 }, 'male', { kuaYear: 'solar-feb4' })).toEqual({});
  });
});

describe('one person, the same numbers everywhere', () => {
  it('Conductor equals the Life Path digit and Driver equals the Birthday digit, for every date', () => {
    const problems: string[] = [];
    for (const date of everyDate(1900, 2099)) {
      const grid = loShu(date, null);
      if (lifePath(date).root !== grid.conductor || birthdayNumber(date).root !== grid.driver) {
        if (problems.length < 10) problems.push(`${date.y}-${date.m}-${date.d}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('profile() returns exactly what the separate functions return', () => {
    const date = { y: 1990, m: 8, d: 15 };
    const p = profile({ date, gender: 'female', name: 'Asha Rao' });
    expect(p.loShu).toEqual(loShu(date, 'female'));
    expect(p.western.lifePath).toEqual(lifePath(date));
    expect(p.western.pinnacles).toEqual(pinnacles(date));
    expect(p.western.expression).toEqual(expression(normalizeName('Asha Rao')));
    expect(p.chaldean).toEqual(chaldeanName('Asha Rao'));
    expect(analyseMobile('9876543210', { date, gender: 'female' })?.withBirth).toMatchObject({
      driver: p.loShu.driver, conductor: p.loShu.conductor,
    });
  });

  it('personal cycles are single digits and change with the calendar', () => {
    const birth = { y: 1990, m: 8, d: 15 };
    for (const on of everyDate(2026, 2027)) {
      const c = personalCycles(birth, on);
      for (const n of [c.year, c.month, c.day]) expect(n >= 1 && n <= 9).toBe(true);
    }
    expect(personalCycles(birth, { y: 2026, m: 12, d: 31 }).year).not.toBe(personalCycles(birth, { y: 2027, m: 1, d: 1 }).year);
  });
});

describe('names and phone numbers', () => {
  it('keeps A–Z, strips accents and flags other scripts', () => {
    expect(normalizeName('  José  María-Luisa ')).toMatchObject({ words: ['JOSE', 'MARIA', 'LUISA'], hasNonLatin: false });
    expect(normalizeName('राहुल')).toMatchObject({ words: [], letters: '', hasNonLatin: true });
    expect(normalizeName("O'Brien")).toMatchObject({ words: ['OBRIEN'] });
  });

  it('returns null instead of zero when nothing can be counted', () => {
    expect(chaldeanName('राहुल')).toBeNull();
    expect(chaldeanName('   ')).toBeNull();
    expect(expression(normalizeName('राहुल'))).toBeNull();
    expect(soulUrge(normalizeName('Glynn'))).toBeNull(); // no A, E, I, O or U
    expect(expression(normalizeName('Glynn'))?.value).toBeGreaterThan(0);
  });

  it('normalises Indian mobile numbers and rejects junk', () => {
    expect(normalizeMobile('+91-98765 43210')).toMatchObject({ strippedPrefix: '+91', valid: true });
    expect(normalizeMobile('12345').valid).toBe(false);
    expect(normalizeMobile('0000000000').valid).toBe(false);
    expect(analyseMobile('hello')).toBeNull();
  });

  it('classes neighbouring digit pairs by the two-digit combination chart', () => {
    const r = analyseMobile('9811005566')!;
    expect(r.root).toBe(rootOf(9 + 8 + 1 + 1 + 0 + 0 + 5 + 5 + 6 + 6));
    expect(r.pairs.map((p) => p.pair.join(''))).toEqual(['98', '81', '11', '10', '00', '05', '55', '56', '66']);
    expect(r.pairs.find((p) => p.pair.join('') === '98')).toMatchObject({ kind: 'planetary', impact: 'malefic', yoga: null });
    expect(r.pairs.find((p) => p.pair.join('') === '11')).toMatchObject({ kind: 'double', impact: 'benefic' });
    expect(r.pairs.find((p) => p.pair.join('') === '10')).toMatchObject({ kind: 'zero', impact: 'benefic' });
    expect(r.pairs.find((p) => p.pair.join('') === '00')).toMatchObject({ kind: 'double', impact: 'neutral' });
    expect(r.pairTally).toEqual({ benefic: 5, neutral: 2, malefic: 2 });
    expect(r.pairTally.benefic + r.pairTally.neutral + r.pairTally.malefic).toBe(r.pairs.length);
    expect(r.rajYog).toBeNull();
    expect(r.frequency.reduce((a, b) => a + b, 0)).toBe(10);
  });

  it('counts a repeated pair once and reads the chart the same both ways round, except 12 and 21', () => {
    const r = analyseMobile('7171212345')!;
    expect(r.pairs.find((p) => p.pair.join('') === '71')).toMatchObject({ count: 2, impact: 'benefic', yoga: 'raj' });
    expect(r.pairs.find((p) => p.pair.join('') === '45')).toMatchObject({ impact: 'malefic', yoga: 'bandhan' });
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        if (`${a}${b}` === '12' || `${a}${b}` === '21') continue;
        expect(pairImpact(a, b), `${a}${b}`).toBe(pairImpact(b, a));
      }
    }
    expect(pairImpact(1, 2)).toBe('benefic');
    expect(pairImpact(2, 1)).toBe('neutral');
  });

  it('flags the Raj yog of 1 and 7, and whether an 8 weakens it', () => {
    expect(analyseMobile('9417026530')!.rajYog).toEqual({ weakenedByEight: false });
    expect(analyseMobile('9817145678')!.rajYog).toEqual({ weakenedByEight: true });
    expect(analyseMobile('9876543210')!.rajYog).toBeNull();
  });

  it('gives a compatibility level from the two friendship comparisons', () => {
    // 15 August 1990: Driver 6, Conductor 6. A number with root 6 is the same number on both counts.
    const date = { y: 1990, m: 8, d: 15 };
    expect(analyseMobile('9999999996', { date })!.withBirth!.compatibility).toMatchObject({ driverPoints: 2, conductorPoints: 2, points: 4, weighted: 8, level: 5 });
    // Root 1 (Sun) and 6 (Venus) are unfriendly on both sides.
    expect(analyseMobile('9999999991', { date })!.withBirth!.compatibility).toMatchObject({ driverPoints: -2, conductorPoints: -2, points: -4, weighted: -8, level: 1 });
    expect(analyseMobile('9876543210')!.withBirth).toBeNull();
    expect(analyseMobile('9876543210', { date })!.steps.at(-1)).toMatchObject({ key: 'compatibility' });

    expect([-4, -3, -2, -1, 0, 1, 2, 3, 4].map(compatibilityLevel)).toEqual([1, 1, 2, 2, 3, 4, 4, 5, 5]);
    for (const root of DIGITS) {
      for (const driver of DIGITS) {
        for (const conductor of DIGITS) {
          const c = mobileCompatibility(root, driver, conductor);
          expect(c.driverPoints).toBe(RELATION_POINTS[pairRelation(root, driver).mutual]);
          expect(c.points).toBe(c.driverPoints + c.conductorPoints);
          expect(c.level).toBe(compatibilityLevel(c.points));
          // Swapping Driver and Conductor never changes the level: the two count equally.
          expect(mobileCompatibility(root, conductor, driver).level).toBe(c.level);
        }
      }
      expect(mobileCompatibility(root, root, root).level).toBe(5);
    }
  });
});

describe('friendship table', () => {
  it('is complete, with every number its own friend', () => {
    for (const a of DIGITS) {
      expect(Object.keys(RELATION_TABLE[a]).map(Number)).toEqual([...DIGITS]);
      expect(RELATION_TABLE[a][a]).toBe('friend');
      const r = relationsOf(a);
      expect(r.friends.length + r.neutral.length + r.enemies.length).toBe(8);
    }
  });

  it('follows the classical friendships of the seven visible planets', () => {
    // Sun 1, Moon 2, Jupiter 3, Mercury 5, Venus 6, Saturn 8, Mars 9 (Brihat Parashara Hora Shastra).
    expect(relationsOf(1)).toMatchObject({ friends: expect.arrayContaining([2, 3, 9]), enemies: expect.arrayContaining([6, 8]) });
    expect(RELATION_TABLE[1][5]).toBe('neutral');
    expect(relationsOf(2).enemies.filter((d) => ![4, 7].includes(d))).toEqual([]); // the Moon has no enemy among them
    expect(RELATION_TABLE[5][2]).toBe('enemy'); // Mercury is cold to the Moon, though the Moon is friendly to Mercury
    expect(RELATION_TABLE[2][5]).toBe('friend');
    expect(pairRelation(2, 5).mutual).toBe('mixed');
    expect(pairRelation(1, 8).mutual).toBe('opposed');
    expect(pairRelation(6, 8).mutual).toBe('mutual-friends');
    expect(pairRelation(3, 8).mutual).toBe('neutral');
  });

  it('treats Rahu and Ketu symmetrically', () => {
    for (const node of [4, 7] as const) {
      for (const d of DIGITS) expect(RELATION_TABLE[node][d]).toBe(RELATION_TABLE[d][node]);
    }
  });
});

describe('engine hygiene', () => {
  it('never uses the JavaScript Date object', () => {
    const dir = path.resolve(__dirname, '../src/engine/numerology');
    for (const file of fs.readdirSync(dir)) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8');
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      expect(/new Date\(|Date\.now\(|Date\.parse\(/.test(code), file).toBe(false);
    }
  });
});
