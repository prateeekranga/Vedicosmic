/**
 * The numerology added after round 1: dasha periods, the further name numbers, the directions of
 * the square and favourable dates. As with the rest of numerology there is no outside reference
 * to measure against; these tests fix the published method and hand-worked cases.
 */
import { describe, expect, it } from 'vitest';
import {
  DASHA_INDIAN_STANDARD, DIGITS, LETTER_PLANE, LOSHU_LAYOUT, NUMBER_DIRECTION, PYTHAGOREAN_VALUES, WEEKDAY_NUMBER,
  addDays, antarDasha, balanceNumber, birthdayIn, dashaGrid, dashaOn, dayNumber, favourableDates, fromDayNumber,
  hiddenPassion, karmicLessons, loShu, mahaDashas, normalizeName, planesOfExpression, pratyantarDashas, profile,
  rationalThought, relationsOf, rootOf, specialLetters, subconsciousSelf, weekdayOf,
  type DashaConfig, type YMD,
} from '@/engine/numerology';

const ymd = (y: number, m: number, d: number): YMD => ({ y, m, d });

describe('calendar arithmetic without Date', () => {
  it('knows the weekday of well-known dates', () => {
    expect(weekdayOf(ymd(2000, 1, 1))).toBe(6); // Saturday
    expect(weekdayOf(ymd(1947, 8, 15))).toBe(5); // Friday
    expect(weekdayOf(ymd(2025, 10, 14))).toBe(2); // Tuesday
    expect(weekdayOf(ymd(2026, 11, 15))).toBe(0); // Sunday
    expect(weekdayOf(ymd(1900, 1, 1))).toBe(1); // Monday
  });

  it('converts every day from 1900 to 2100 to a day number and back, one day apart', () => {
    let n = dayNumber(ymd(1900, 1, 1));
    let weekday = 1;
    for (let y = 1900; y <= 2100; y++) {
      for (let m = 1; m <= 12; m++) {
        const days = m === 2 ? ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31;
        for (let d = 1; d <= days; d++) {
          const date = ymd(y, m, d);
          expect(dayNumber(date)).toBe(n);
          expect(fromDayNumber(n)).toEqual(date);
          expect(weekdayOf(date)).toBe(weekday);
          n += 1;
          weekday = (weekday + 1) % 7;
        }
      }
    }
    expect(addDays(ymd(2024, 2, 28), 2)).toEqual(ymd(2024, 3, 1));
    expect(addDays(ymd(2025, 2, 28), 1)).toEqual(ymd(2025, 3, 1));
  });
});

describe('Maha Dasha', () => {
  it('starts with the Driver and gives each number as many years as the number', () => {
    // Born on the 14th: Driver 5.
    const list = mahaDashas(ymd(1990, 10, 14), 50);
    expect(list.map((p) => p.number)).toEqual([5, 6, 7, 8, 9, 1, 2, 3, 4, 5]);
    expect(list.map((p) => [p.fromAge, p.toAge])).toEqual([[0, 5], [5, 11], [11, 18], [18, 26], [26, 35], [35, 36], [36, 38], [38, 41], [41, 45], [45, 50]]);
    expect(list[0].from).toEqual(ymd(1990, 10, 14));
    expect(list[1].from).toEqual(ymd(1995, 10, 14));
    expect(list[0].until).toEqual(list[1].from);
  });

  it('covers every age without a gap, for every Driver', () => {
    for (let day = 1; day <= 31; day++) {
      const list = mahaDashas(ymd(1988, 1, day), 100);
      expect(list[0].number).toBe(rootOf(day));
      expect(list[0].fromAge).toBe(0);
      for (let i = 1; i < list.length; i++) {
        expect(list[i].fromAge).toBe(list[i - 1].toAge);
        expect(list[i].toAge - list[i].fromAge).toBe(list[i].number);
        expect(list[i].number).toBe(list[i - 1].number % 9 + 1);
      }
      expect(list[list.length - 1].toAge).toBeGreaterThanOrEqual(100);
    }
  });
});

describe('Antar Dasha', () => {
  it('adds day, month, the last two digits of the year and the weekday number', () => {
    // 14 October 2025 is a Tuesday (9): 14 + 10 + 25 + 9 = 58, 5 + 8 = 13, 1 + 3 = 4.
    const a = antarDasha(ymd(1990, 10, 14), 2025);
    expect(a.parts).toEqual({ day: 14, month: 10, year: 25, weekday: 9 });
    expect(a.total).toBe(58);
    expect(a.number).toBe(4);
    expect(a.from).toEqual(ymd(2025, 10, 14));
    expect(a.until).toEqual(ymd(2026, 10, 14));
    // 15 August 2026 is a Saturday (8): 15 + 8 + 26 + 8 = 57, 5 + 7 = 12, 3.
    expect(antarDasha(ymd(1990, 8, 15), 2026)).toMatchObject({ number: 3, weekday: 6, total: 57 });
  });

  it('uses the planets’ numbers for the weekdays', () => {
    expect([...WEEKDAY_NUMBER]).toEqual([1, 2, 9, 5, 3, 6, 8]);
  });

  it('changes only as its options say', () => {
    const fullYear: DashaConfig = { ...DASHA_INDIAN_STANDARD, yearDigits: 'full' };
    // 2025 as a whole adds 2025, which is 20 more hundreds-and-thousands than 25: the root moves by 2.
    expect(antarDasha(ymd(1990, 10, 14), 2025, fullYear).number).toBe(rootOf(14 + 10 + 2025 + 9));
    const marchFirst: DashaConfig = { ...DASHA_INDIAN_STANDARD, leapBirthday: 'mar-1' };
    expect(birthdayIn(ymd(1992, 2, 29), 2025)).toEqual(ymd(2025, 2, 28));
    expect(birthdayIn(ymd(1992, 2, 29), 2025, marchFirst)).toEqual(ymd(2025, 3, 1));
    expect(birthdayIn(ymd(1992, 2, 29), 2028)).toEqual(ymd(2028, 2, 29));
  });
});

describe('Pratyantar Dasha', () => {
  it('starts with the Antar Dasha number and fills the year exactly', () => {
    for (const [birth, year] of [[ymd(1990, 10, 14), 2025], [ymd(1984, 3, 5), 2023], [ymd(1992, 2, 29), 2027], [ymd(1975, 11, 20), 2031]] as const) {
      const antar = antarDasha(birth, year);
      const parts = pratyantarDashas(antar);
      expect(parts).toHaveLength(9);
      expect(parts[0].number).toBe(antar.number);
      expect(parts[0].from).toEqual(antar.from);
      expect(parts[8].until).toEqual(antar.until);
      for (let i = 1; i < 9; i++) {
        expect(parts[i].from).toEqual(parts[i - 1].until);
        expect(parts[i].number).toBe(parts[i - 1].number % 9 + 1);
      }
      expect(parts.reduce((a, p) => a + p.days, 0)).toBe(dayNumber(antar.until) - dayNumber(antar.from));
    }
    // Antar 4 from 14 October 2025: 4 runs 32 days, then 5 runs 41.
    const parts = pratyantarDashas(antarDasha(ymd(1990, 10, 14), 2025));
    expect(parts.slice(0, 2).map((p) => [p.number, p.days])).toEqual([[4, 32], [5, 41]]);
    expect(parts[1].from).toEqual(ymd(2025, 11, 15));
  });
});

describe('the periods running on a day', () => {
  it('takes the dasha year from the last birthday', () => {
    const birth = ymd(1990, 10, 14);
    const before = dashaOn(birth, ymd(2025, 10, 13));
    const after = dashaOn(birth, ymd(2025, 10, 14));
    expect(before.antar.year).toBe(2024);
    expect(after.antar.year).toBe(2025);
    expect(after.antar.number).toBe(4);
    // Age 35: the tenth year of... 5, 6, 7, 8, 9 end at 35, so 1 runs from 35 to 36.
    expect(after.maha).toMatchObject({ number: 1, fromAge: 35, toAge: 36 });
    expect(before.maha).toMatchObject({ number: 9, fromAge: 26, toAge: 35 });
    expect(after.pratyantar.number).toBe(4);
    expect(after.steps.map((s) => s.key)).toEqual(['maha', 'antar', 'pratyantar']);
    expect(() => dashaOn(birth, ymd(1990, 10, 13))).toThrow(RangeError);
    expect(dashaOn(birth, birth).antar.from).toEqual(birth);
  });

  it('always finds a running period, for every day of a leap-day birth’s life', () => {
    const birth = ymd(1992, 2, 29);
    for (let n = dayNumber(birth); n < dayNumber(birth) + 366 * 12; n += 17) {
      const on = fromDayNumber(n);
      const now = dashaOn(birth, on);
      expect(n).toBeGreaterThanOrEqual(dayNumber(now.antar.from));
      expect(n).toBeLessThan(dayNumber(now.antar.until));
      expect(n).toBeGreaterThanOrEqual(dayNumber(now.pratyantar.from));
      expect(n).toBeLessThan(dayNumber(now.pratyantar.until));
    }
  });

  it('adds the period numbers to the grid and reports the lines they complete', () => {
    // 15 August 1990, female: 4 is missing, so 4-5-6 lacks only the 4.
    const natal = loShu(ymd(1990, 8, 15), 'female');
    expect(natal.full.lines.find((l) => l.id === 'golden')!.status).toBe('partial');
    const withFour = dashaGrid(natal, [4, 1]);
    expect(withFour.newlyComplete).toEqual(['golden']);
    expect(withFour.grid.counts[4]).toBe(1);
    expect(withFour.grid.counts[1]).toBe(natal.full.counts[1] + 1);
    expect(dashaGrid(natal, [1, 9]).newlyComplete).toEqual([]);
    // The birth grid itself is not changed.
    expect(natal.full.counts[4]).toBe(0);
  });
});

describe('further numbers from the name', () => {
  // ASHA RAO: A1 S1 H8 A1, R9 A1 O6.
  const name = normalizeName('Asha Rao');
  const date = ymd(1990, 8, 15);

  it('finds the Hidden Passion and the Subconscious Self', () => {
    expect(hiddenPassion(name)).toEqual({ numbers: [1], count: 4 });
    expect(subconsciousSelf(name)).toBe(4);
    expect(subconsciousSelf(name)).toBe(9 - karmicLessons(name).length);
    // A tie is reported as a tie: A1 B2.
    expect(hiddenPassion(normalizeName('Ab'))).toEqual({ numbers: [1, 2], count: 1 });
    expect(hiddenPassion(normalizeName('123'))).toBeNull();
  });

  it('adds the initials for the Balance number', () => {
    expect(balanceNumber(name)).toEqual({ value: 1, total: 10, initials: [{ letter: 'A', value: 1 }, { letter: 'R', value: 9 }] });
    expect(balanceNumber(normalizeName('Mohandas Karamchand Gandhi'))?.value).toBe(rootOf(4 + 2 + 7));
  });

  it('adds the first name to the day of birth for Rational Thought', () => {
    // ASHA = 1 + 1 + 8 + 1 = 11; 11 + 15 = 26; 2 + 6 = 8.
    expect(rationalThought(name, date)).toMatchObject({ value: 8, input: 26 });
    expect(rationalThought(normalizeName('99'), date)).toBeNull();
  });

  it('reads Cornerstone, Capstone and First Vowel from the first name', () => {
    expect(specialLetters(name)).toEqual({ cornerstone: 'A', capstone: 'A', firstVowel: 'A' });
    expect(specialLetters(normalizeName('Prateek Kumar'))).toEqual({ cornerstone: 'P', capstone: 'K', firstVowel: 'A' });
    expect(specialLetters(normalizeName('Glynn'))?.firstVowel).toBeNull();
  });

  it('places every letter on one plane of expression', () => {
    expect(Object.keys(LETTER_PLANE).sort()).toEqual(Object.keys(PYTHAGOREAN_VALUES).sort());
    const planes = planesOfExpression(name)!;
    expect(planes.counts).toEqual({ physical: 0, mental: 4, emotional: 3, intuitive: 0 });
    expect(planes.strongest).toEqual(['mental']);
    expect(planes.letters).toBe(name.letters.length);
  });

  it('is what profile() reports', () => {
    const p = profile({ date, name: 'Asha Rao' }).western;
    expect(p.hiddenPassion).toEqual(hiddenPassion(name));
    expect(p.subconsciousSelf).toBe(subconsciousSelf(name));
    expect(p.balance).toEqual(balanceNumber(name));
    expect(p.rationalThought).toEqual(rationalThought(name, date));
    expect(p.specialLetters).toEqual(specialLetters(name));
    expect(p.planes).toEqual(planesOfExpression(name));
    expect(profile({ date }).western.hiddenPassion).toBeNull();
  });
});

describe('directions and favourable dates', () => {
  it('puts each number in the direction its cell faces, with South at the top', () => {
    const facing = [['SE', 'S', 'SW'], ['E', 'centre', 'W'], ['NE', 'N', 'NW']];
    LOSHU_LAYOUT.forEach((row, r) => row.forEach((d, c) => expect(NUMBER_DIRECTION[d], `number ${d}`).toBe(facing[r][c])));
  });

  it('lists the dates that add down to the Driver and to its friends', () => {
    const six = favourableDates(6);
    expect(six.own).toEqual([6, 15, 24]);
    expect(six.friendly.every((d) => relationsOf(6).friends.includes(rootOf(d)))).toBe(true);
    for (const driver of DIGITS) {
      const f = favourableDates(driver);
      expect(f.own.every((d) => rootOf(d) === driver)).toBe(true);
      expect(f.own.some((d) => f.friendly.includes(d))).toBe(false);
    }
  });
});
