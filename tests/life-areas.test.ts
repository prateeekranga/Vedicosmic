/**
 * Career, relationships and health from the Lo Shu grid: what the grid holds for each area, how a
 * dasha period sits beside the person's own numbers, which numbers to go carefully with, and where
 * remedies begin. The expected values for 14 June 1985 are worked out by hand in the comments.
 */
import { describe, expect, it } from 'vitest';
import {
  AREA_IDS, AREA_KEYS, DIGITS, LINE_NAME, RELATION_TABLE, areaSupport, bandOf, carefulNumbers, compareYMD, dashaOn, lifeAreaSteps,
  checkNumber, lifeAreas, loShu, periodTone, readingSummary, regardOf, remedyPriorities, repeatedForRemedy, toneOf, upcomingDates, windowOutlook, windowPicks, yearFocus, yearOutlook,
  type AreaId, type YMD,
} from '@/engine/numerology';
import { LINE_TEXT } from '@/data/numerology/loshuText';

const ymd = (y: number, m: number, d: number): YMD => ({ y, m, d });
const today = ymd(2026, 11, 15);

// 14 June 1985, male. Date digits 1 4 6 1 9 8 5; Driver 5 and Conductor 7 and Kua 6 are added, so the grid
// holds 1 ×2, 4, 5 ×2, 6 ×2, 7, 8, 9 and lacks 2 and 3. Complete lines: Golden (4-5-6), Practical (8-1-6), Will (9-5-1).
const person = loShu(ymd(1985, 6, 14), 'male');

describe('what the grid holds for each area', () => {
  it('counts the numbers and complete lines of an area, worked by hand for 14 June 1985', () => {
    const a = lifeAreas(person);
    // Career: 8, 1, 5 and 4 present (4 of 5), 3 missing; the arithmetic is 8 (2) + 1 (2) + 5 (2) + 4 (1) + Golden and Practical complete (2) = 9 of 10.
    expect(a.career).toMatchObject({ presentCount: 4, keyCount: 5, band: 'strong', points: 9, max: 10, missingKeys: [3] });
    // Relationships: 6, 5 and 9 present (3 of 5), 2 and 3 missing; 6 (2) + 5 (1) + 9 (1), Emotional (3-5-7) not complete = 4 of 8.
    expect(a.relationships).toMatchObject({ presentCount: 3, band: 'mixed', points: 4, max: 8, missingKeys: [2, 3] });
    // Health: 1, 9, 8 and 5 present (4 of 5), 2 missing; 1 (2) + 9 (2) + 8 (1) + 5 (1) + Will plane complete (1) = 7 of 9 (only the Will plane supports health).
    expect(a.health).toMatchObject({ presentCount: 4, band: 'strong', points: 7, max: 9, missingKeys: [2] });
  });

  it('writes the sum out so it can be checked', () => {
    expect(areaSupport(person.full, 'relationships').working)
      .toBe('6 present (2) + 2 missing (0) + 5 present (1) + 3 missing (0) + 9 present (1) + Emotional plane not complete (0) = 4 of 8.');
  });

  it('calls four or five key numbers present strong, three mixed and fewer thin, by a plain count', () => {
    expect([0, 1, 2, 3, 4, 5].map(bandOf)).toEqual(['thin', 'thin', 'thin', 'mixed', 'strong', 'strong']);
    // Every area has five key numbers, so the three are counted the same way and can be compared.
    for (const id of AREA_IDS) expect(AREA_KEYS[id].numbers).toHaveLength(5);
  });

  it('gives every area weights, lines and a driver and conductor weight that exist', () => {
    for (const id of AREA_IDS) {
      const def = AREA_KEYS[id];
      expect(def.numbers, id).toHaveLength(5);
      expect(new Set(def.numbers.map((k) => k.digit)).size, id).toBe(5);
      expect(def.numbers.some((k) => k.weight === 2), id).toBe(true);
      expect(def.lines.length, id).toBeGreaterThan(0);
    }
    // Work leans on the Conductor (the direction life takes); relationships and health on the Driver (everyday nature).
    expect([AREA_KEYS.career.driverWeight, AREA_KEYS.career.conductorWeight]).toEqual([1, 2]);
    expect([AREA_KEYS.relationships.driverWeight, AREA_KEYS.relationships.conductorWeight]).toEqual([2, 1]);
    expect([AREA_KEYS.health.driverWeight, AREA_KEYS.health.conductorWeight]).toEqual([2, 1]);
  });

  it('matches what the How we calculate page says, number by number', () => {
    const pairs = (id: AreaId) => AREA_KEYS[id].numbers.map((k) => [k.digit, k.weight]);
    expect(pairs('career')).toEqual([[8, 2], [1, 2], [5, 2], [3, 1], [4, 1]]);
    expect(pairs('relationships')).toEqual([[6, 2], [2, 2], [5, 1], [3, 1], [9, 1]]);
    expect(pairs('health')).toEqual([[1, 2], [2, 2], [9, 2], [8, 1], [5, 1]]);
    expect(AREA_KEYS.career.lines).toEqual(['golden', 'practical']);
    expect(AREA_KEYS.relationships.lines).toEqual(['emotional']);
    expect(AREA_KEYS.health.lines).toEqual(['will']);
  });

  it('keeps the engine’s line names in step with the readings', () => {
    for (const id of Object.keys(LINE_NAME) as (keyof typeof LINE_NAME)[]) expect(LINE_NAME[id]).toBe(LINE_TEXT[id].name);
  });

  it('never earns more than the maximum, for every date over several decades', () => {
    for (let y = 1930; y <= 2024; y++) {
      for (const m of [1, 4, 7, 10, 12]) {
        const grid = loShu(ymd(y, m, 1 + ((y + m) % 28)), null);
        for (const id of AREA_IDS) {
          const s = areaSupport(grid.full, id);
          expect(s.points, `${y}-${m} ${id}`).toBeGreaterThanOrEqual(0);
          expect(s.points, `${y}-${m} ${id}`).toBeLessThanOrEqual(s.max);
          expect(s.keys.filter((k) => !k.present).map((k) => k.digit).sort()).toEqual([...s.missingKeys].sort());
        }
      }
    }
  });
});

describe('how a period sits beside the person’s own numbers', () => {
  it('adds the friendship of the Driver and Conductor, counted by the area’s weights', () => {
    // Antar 2 (Moon) for Driver 5 (Mercury) and Conductor 7 (Ketu): both count the Moon unfriendly.
    expect(RELATION_TABLE[5][2]).toBe('enemy');
    expect(RELATION_TABLE[7][2]).toBe('enemy');
    // Career: Driver -1 + Conductor -1 x 2 = -3; 2 is not a career number and completes neither career line.
    expect(periodTone(person, 2, 'career')).toMatchObject({ score: -3, tone: 'testing' });
    // Relationships: Driver -1 x 2 + Conductor -1 = -3, then +1 because 2 is missing and is a relationship number.
    const rel = periodTone(person, 2, 'relationships');
    expect(rel).toMatchObject({ score: -2, tone: 'testing' });
    expect(rel.factors.map((f) => f.key)).toEqual(['driver', 'conductor', 'fills']);
    // Health: Driver -1 x 2 + Conductor -1 = -3, +1 because 2 is missing and is a health number = -2. Only the Will plane (9-5-1)
    // supports health, and 2 is not in it, so no point is added for completing a line.
    const health = periodTone(person, 2, 'health');
    expect(health).toMatchObject({ score: -2, tone: 'testing' });
    expect(health.factors.map((f) => f.key)).toEqual(['driver', 'conductor', 'fills']);
  });

  it('adds a point for a line only when the period’s number is the one that line lacks, and only for the area’s own lines', () => {
    // 2 would complete the Silver Raj Yog, the Action plane and the Mental plane, but none of them supports work or health here.
    expect(periodTone(person, 2, 'career').factors.map((f) => f.key)).not.toContain('completes');
    expect(periodTone(person, 2, 'health').factors.map((f) => f.key)).not.toContain('completes');
    // 3 would complete the Emotional plane (3-5-7), a relationships line, and is also a missing relationships number.
    expect(periodTone(person, 3, 'relationships').factors.map((f) => f.key)).toEqual(['driver', 'conductor', 'fills', 'completes']);
    // A number already in the grid completes nothing.
    expect(periodTone(person, 5, 'health').factors.map((f) => f.key)).not.toContain('completes');
  });

  it('takes a point off when the period adds to a number that is already repeated three times or more', () => {
    // 11 November 1111 is not a date to use; build a grid heavy in 1s instead: 11 January 2011 (Driver 2).
    const heavy = loShu(ymd(2011, 11, 11), null);
    expect(heavy.full.counts[1]).toBeGreaterThanOrEqual(3);
    const t = periodTone(heavy, 1, 'career');
    expect(t.factors.map((f) => f.key)).toContain('repeats');
    expect(t.factors.find((f) => f.key === 'repeats')!.points).toBe(-1);
  });

  it('reads +2 or more as supportive, −2 or less as testing, and between as steady', () => {
    expect([-4, -3, -2, -1, 0, 1, 2, 3, 4].map(toneOf))
      .toEqual(['testing', 'testing', 'testing', 'steady', 'steady', 'steady', 'supportive', 'supportive', 'supportive']);
  });

  it('writes each factor out, with the planets by name', () => {
    const t = periodTone(person, 2, 'career');
    expect(t.factors[0].working).toBe('Driver 5 (Mercury) regards Moon as unfriendly: −1');
    expect(t.factors[1].working).toBe('Conductor 7 (Ketu) regards Moon as unfriendly, counted twice for this area: −2');
  });

  it('gives a tone for every number, area and person without throwing, and uses all three tones', () => {
    const seen = { supportive: 0, steady: 0, testing: 0 };
    for (let y = 1940; y <= 2020; y++) {
      for (const m of [2, 5, 8, 11]) {
        const grid = loShu(ymd(y, m, 1 + ((y * m) % 28)), null);
        for (const d of DIGITS) for (const id of AREA_IDS) seen[periodTone(grid, d, id).tone] += 1;
      }
    }
    const total = seen.supportive + seen.steady + seen.testing;
    // None of the three may be rare, or the page would say nearly the same thing to everyone. "Testing" is the
    // rarest because the table of friendships is friendly overall (about 47% friend, 27% neutral, 26% unfriendly).
    expect(seen.supportive / total).toBeGreaterThan(0.25);
    expect(seen.steady / total).toBeGreaterThan(0.3);
    expect(seen.testing / total).toBeGreaterThan(0.08);
  });

  it('is the same on every call for the same person', () => {
    expect(periodTone(person, 8, 'health')).toEqual(periodTone(person, 8, 'health'));
  });
});

describe('the years and weeks ahead', () => {
  const now = dashaOn(person.date, today);

  it('gives one row per dasha year with both periods’ tones for every area', () => {
    const rows = yearOutlook(person, now.antar.year, 5);
    expect(rows).toHaveLength(5);
    expect(rows[0].year.antar.year).toBe(now.antar.year);
    for (const row of rows) {
      for (const id of AREA_IDS) {
        expect(row.areas[id].year.number).toBe(row.year.antar.number);
        expect(row.areas[id].background.number).toBe(row.year.maha.number);
      }
    }
    // The running year is Antar 2 for this person (see tests/numerology-depth.test.ts): testing for work and relationships.
    expect(now.antar.number).toBe(2);
    expect(rows[0].areas.career.year.tone).toBe('testing');
    expect(rows[0].areas.health.year.tone).toBe('testing');
  });

  it('gives the nine short periods of the year, one of them running', () => {
    const windows = windowOutlook(person, now);
    expect(windows).toHaveLength(9);
    expect(windows.filter((w) => w.current)).toHaveLength(1);
    expect(windows.find((w) => w.current)!.period.number).toBe(now.pratyantar.number);
  });

  it('picks the best and most testing period still ahead, never one that has ended', () => {
    const windows = windowOutlook(person, now);
    for (const id of AREA_IDS) {
      const { best, careful } = windowPicks(windows, id, today);
      if (best) {
        expect(best.areas[id].tone).toBe('supportive');
        expect(compareYMD(best.period.until, today)).toBeGreaterThan(0);
        const rivals = windows.filter((w) => compareYMD(w.period.until, today) > 0 && w.areas[id].tone === 'supportive');
        expect(best.areas[id].score).toBe(Math.max(...rivals.map((w) => w.areas[id].score)));
      }
      if (careful) {
        expect(careful.areas[id].tone).toBe('testing');
        expect(compareYMD(careful.period.until, today)).toBeGreaterThan(0);
      }
    }
    // Late in the year, periods that ended are skipped.
    const late = ymd(now.antar.until.y, now.antar.until.m, now.antar.until.d - 1 || 1);
    for (const id of AREA_IDS) {
      const { best } = windowPicks(windows, id, late);
      if (best) expect(compareYMD(best.period.until, late)).toBeGreaterThan(0);
    }
  });

  it('names the area to lean into and the area to go gently with only when the tones say so', () => {
    const rows = yearOutlook(person, now.antar.year, 1);
    expect(yearFocus(rows[0].areas)).toEqual({ lean: null, gentle: 'career' });
    // A year in which every area is supportive leans into the highest-scoring one.
    const kind = loShu(ymd(1990, 8, 15), null);
    for (let y = 2026; y < 2040; y++) {
      const [row] = yearOutlook(kind, y, 1);
      const focus = yearFocus(row.areas);
      if (focus.lean) expect(row.areas[focus.lean].year.tone).toBe('supportive');
      if (focus.gentle) expect(row.areas[focus.gentle].year.tone).toBe('testing');
    }
  });
});

describe('numbers and dates to go carefully with', () => {
  it('sorts unfriendly numbers into challenging, mixed and careful, by both of the person’s planets', () => {
    // Driver 5 (Mercury) counts only 2 as unfriendly; Conductor 7 (Ketu) counts 1 and 2.
    const c = carefulNumbers(5, 7);
    expect(c.numbers.map((n) => [n.digit, n.tier])).toEqual([[1, 'mixed'], [2, 'challenging']]);
    expect(c.dates.challenging).toEqual([2, 11, 20, 29]);
    expect(c.dates.mixed).toEqual([1, 10, 19, 28]);
    expect(c.dates.careful).toEqual([]);
  });

  it('puts a number unfriendly to one planet and neutral to the other in the careful tier', () => {
    // Driver 2 (Moon) counts 4 and 7 unfriendly; Conductor 3 (Jupiter) counts 5 and 6 unfriendly.
    // Jupiter is neutral to 4 and 7, so those two are careful. The Moon is a friend of 5 (mixed) and neutral to 6 (careful).
    const c = carefulNumbers(2, 3);
    expect(c.numbers.map((n) => [n.digit, n.tier])).toEqual([[4, 'careful'], [5, 'mixed'], [6, 'careful'], [7, 'careful']]);
    expect(c.dates.careful).toEqual([4, 6, 7, 13, 15, 16, 22, 24, 25, 31]);
    expect(c.dates.mixed).toEqual([5, 14, 23]);
  });

  it('does not list a number the person holds as Driver or Conductor, even when the other planet is cool towards it', () => {
    // Rahu (Conductor 4) counts the Sun unfriendly, but 1 is this person's own Driver.
    expect(RELATION_TABLE[4][1]).toBe('enemy');
    expect(carefulNumbers(1, 4).numbers.map((n) => n.digit)).not.toContain(1);
    expect(carefulNumbers(1, 4).numbers.map((n) => n.digit)).not.toContain(4);
  });

  it('never lists the person’s own numbers, and lists only numbers that one of the planets counts unfriendly', () => {
    for (const driver of DIGITS) {
      for (const conductor of DIGITS) {
        const c = carefulNumbers(driver, conductor);
        for (const n of c.numbers) {
          expect(n.digit).not.toBe(driver);
          expect(n.digit).not.toBe(conductor);
          expect([n.fromDriver, n.fromConductor]).toContain('enemy');
        }
        // A date is listed once at most.
        const all = [...c.dates.challenging, ...c.dates.mixed, ...c.dates.careful];
        expect(new Set(all).size).toBe(all.length);
      }
    }
  });

  it('uses the same friendship table as the rest of the site', () => {
    for (const driver of DIGITS) {
      const c = carefulNumbers(driver, driver);
      const enemies = DIGITS.filter((d) => RELATION_TABLE[driver][d] === 'enemy');
      expect(c.numbers.map((n) => n.digit)).toEqual(enemies);
      for (const n of c.numbers) expect(n.tier).toBe('challenging');
    }
  });
});

describe('where remedies begin', () => {
  it('puts the missing number that completes a Raj Yog first, then one that completes any line, then the rest by weight', () => {
    // Person (14 June 1985): 2 would complete the Mental plane (4-9-2), the Action plane (2-7-6) and the Silver Raj Yog (2-5-8); 3 the Emotional (3-5-7) and Thought (4-3-8) planes.
    const p = remedyPriorities(person);
    expect(p.map((x) => x.digit)).toEqual([2, 3]);
    expect(p[0]).toMatchObject({ completes: ['mental', 'action', 'silver'], total: 4, areas: [{ area: 'relationships', weight: 2 }, { area: 'health', weight: 2 }] });
    expect(p[1]).toMatchObject({ completes: ['emotional', 'thought'], total: 2 });
  });

  it('starts with the Golden Yog number, then the Silver, for 15 August 1990 (female: 2, 3, 4 and 7 missing)', () => {
    const k1 = loShu(ymd(1990, 8, 15), 'female');
    const p = remedyPriorities(k1);
    // 4 completes the Golden Yog (4-5-6); 2 completes the Silver (2-5-8); both are yogs, so the heavier weight (2 counts in two areas) is not what puts 4 first:
    // within the same rank the higher area weight wins, and 2 (weight 4) outweighs 4 (weight 1). So the order here is 2, 4, then 3.
    expect(p.map((x) => x.digit)).toEqual([2, 4, 3]);
    expect(p[1].completes).toEqual(['golden']);
    expect(p[0].completes).toEqual(['silver']);
    // 7 completes no line and counts in no area, so it is not among the first.
    expect(p.map((x) => x.digit)).not.toContain(7);
  });

  it('keeps to the limit, and lists only missing numbers that matter somewhere', () => {
    for (let y = 1930; y <= 2024; y++) {
      const g = loShu(ymd(y, 1 + (y % 12), 1 + (y % 27)), y % 2 ? 'male' : 'female');
      const list = remedyPriorities(g, 3);
      expect(list.length).toBeLessThanOrEqual(3);
      for (const x of list) {
        expect(g.full.missing).toContain(x.digit);
        expect(x.total > 0 || x.completes.length > 0).toBe(true);
      }
    }
    // 7 is not a key number of any area.
    const sevens: AreaId[] = AREA_IDS.filter((id) => AREA_KEYS[id].numbers.some((k) => k.digit === 7));
    expect(sevens).toEqual([]);
  });
});

describe('how a number sits beside the person’s own planets', () => {
  it('gives the regard of the Driver’s planet and the Conductor’s, the one classical element of a period', () => {
    // Driver 5 (Mercury) and Conductor 7 (Ketu) both count the Moon (2) unfriendly; Ketu counts Mars (9) a friend, Mercury is neutral to it.
    expect(regardOf(person, 2)).toEqual({ driver: 'enemy', conductor: 'enemy' });
    expect(regardOf(person, 9)).toEqual({ driver: 'neutral', conductor: 'friend' });
    expect(regardOf(person, 5)).toEqual({ driver: 'friend', conductor: 'neutral' });
  });
});

describe('the working shown under the result', () => {
  it('gives one step per area and, when a dasha is running, one for the outlook', () => {
    const now = dashaOn(person.date, today);
    expect(lifeAreaSteps(person, null).map((s) => s.key)).toEqual(['area-career', 'area-relationships', 'area-health']);
    const steps = lifeAreaSteps(person, now);
    expect(steps.map((s) => s.key)).toEqual(['area-career', 'area-relationships', 'area-health', 'outlook']);
    expect(steps[0].result).toBe('9 of 10');
    expect(steps[3].result).toBe('testing, testing, testing');
    expect(steps[3].working).toContain('Career −3 (testing)');
  });
});

describe('the reading in a few plain facts', () => {
  it('names what is strong, what to build and where to start, worked by hand for 14 June 1985', () => {
    const r = readingSummary(person);
    // Complete lines in the order the square lists them: Practical (8-1-6), Will (9-5-1), Golden (4-5-6).
    expect(r.completeLines).toEqual(['practical', 'will', 'golden']);
    expect(r.missing).toEqual([2, 3]);
    // 1, 5 and 6 each appear twice; the lowest digit wins a tie.
    expect(r.mostHeld).toBe(1);
    // Career and health each have 4 of 5 key numbers, so neither stands alone as the strongest; relationships, with 3, is the one fewest.
    expect(r.strongestArea).toBeNull();
    expect(r.weakestArea).toBe('relationships');
    expect(r.start).toEqual([2, 3]);
  });

  it('names the strongest or weakest area only when one stands alone at that count of key numbers', () => {
    // 15 August 1990 (female): health has 4 key numbers present, career and relationships 3 each, so health alone is the strongest and no area is the weakest.
    const k1 = readingSummary(loShu(ymd(1990, 8, 15), 'female'));
    expect(k1.strongestArea).toBe('health');
    expect(k1.weakestArea).toBeNull();
    for (let y = 1930; y <= 2024; y++) {
      const g = loShu(ymd(y, 1 + (y % 12), 1 + (y % 27)), y % 2 ? 'male' : 'female');
      const r = readingSummary(g);
      const present = AREA_IDS.map((id) => areaSupport(g.full, id).presentCount);
      const most = Math.max(...present), fewest = Math.min(...present);
      expect(r.strongestArea !== null).toBe(most > fewest && present.filter((n) => n === most).length === 1);
      expect(r.weakestArea !== null).toBe(most > fewest && present.filter((n) => n === fewest).length === 1);
      if (r.strongestArea && r.weakestArea) expect(r.strongestArea).not.toBe(r.weakestArea);
    }
  });
});

describe('dates that suit, counted from today', () => {
  // Today is Sunday 15 November 2026. Driver 5 (Mercury) counts 1, 4 and 6 as friends; 2 is the number to go carefully with.
  const dates = upcomingDates(person, today);
  const show = (xs: { date: YMD; weekday: string }[]) => xs.map((x) => `${x.weekday} ${x.date.d}/${x.date.m}`);

  it('lists the next dates that add down to the Driver, to a friend, and to a number to go carefully with', () => {
    expect(show(dates.own)).toEqual(['Monday 23/11', 'Saturday 5/12', 'Monday 14/12', 'Wednesday 23/12']);
    // Today itself counts: 15 is 1 + 5 = 6, a friend of 5.
    expect(show(dates.friendly)).toEqual(['Sunday 15/11', 'Thursday 19/11', 'Sunday 22/11', 'Tuesday 24/11']);
    expect(show(dates.careful)).toEqual(['Friday 20/11', 'Sunday 29/11', 'Wednesday 2/12', 'Friday 11/12']);
  });

  it('respects the limit, never goes backwards, and never lists a date twice', () => {
    for (const limit of [1, 3, 6]) {
      const d = upcomingDates(person, today, limit);
      for (const list of [d.own, d.friendly, d.careful]) expect(list.length).toBeLessThanOrEqual(limit);
      const all = [...d.own, ...d.friendly, ...d.careful].map((x) => x.date.y * 10000 + x.date.m * 100 + x.date.d);
      expect(new Set(all).size).toBe(all.length);
      for (const n of all) expect(n).toBeGreaterThanOrEqual(20261115);
    }
  });
});

describe('checking a phone, vehicle or house number', () => {
  it('adds the digits down to one number and says how it sits beside the Driver and Conductor', () => {
    // 919876543210 adds to 55, then 10, then 1: unfriendly to the Conductor (Ketu), friendly to the Driver (Mercury).
    expect(checkNumber('+91 98765 43210', person)).toMatchObject({ digits: '919876543210', total: 55, root: 1, fit: 'mixed' });
    expect(checkNumber('5', person)).toMatchObject({ root: 5, fit: 'yours' });
    expect(checkNumber('7', person)).toMatchObject({ root: 7, fit: 'yours' });
    expect(checkNumber('2', person)).toMatchObject({ root: 2, fit: 'challenging' });
    // Mercury and Ketu are both neutral or friendly to 9 and 8, and Mercury is a friend of 4.
    expect(checkNumber('9876543210', person)).toMatchObject({ total: 45, root: 9, fit: 'friendly' });
    expect(checkNumber('MH 12 AB 1234', person)).toMatchObject({ digits: '121234', total: 13, root: 4, fit: 'friendly' });
  });

  it('ignores letters and signs, and says nothing for text with no digit from 1 to 9', () => {
    expect(checkNumber('', person)).toBeNull();
    expect(checkNumber('abc', person)).toBeNull();
    expect(checkNumber('0000', person)).toBeNull();
    expect(checkNumber('  1-2 3 ', person)?.digits).toBe('123');
  });

  it('always lands on a number from 1 to 9 and a known fit, for any digits', () => {
    for (let n = 1; n <= 300; n += 7) {
      const c = checkNumber(String(n * 9973), person)!;
      expect(c.root).toBeGreaterThanOrEqual(1);
      expect(c.root).toBeLessThanOrEqual(9);
      expect(['yours', 'friendly', 'neutral', 'challenging', 'mixed', 'careful']).toContain(c.fit);
    }
  });
});

describe('numbers held more than once', () => {
  it('lists them most often first, and calls three or more times “often”', () => {
    // 1 January 2011 (no gender): the digits 1, 1, 2, 0, 1, 1 put four 1s in the grid.
    const heavy = loShu(ymd(2011, 1, 1), null);
    const list = repeatedForRemedy(heavy);
    expect(list[0]).toMatchObject({ digit: 1, often: true });
    expect(list[0].count).toBeGreaterThanOrEqual(4);
    const counts = list.map((r) => r.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    // 14 June 1985: 1, 5 and 6 each twice, so none is “often”, and the lowest number leads a tie.
    expect(repeatedForRemedy(person).map((r) => [r.digit, r.count, r.often])).toEqual([[1, 2, false], [5, 2, false], [6, 2, false]]);
  });

  it('agrees with the grid for every date: each listed number is held at least twice, and none is missed', () => {
    for (let y = 1930; y <= 2024; y++) {
      const g = loShu(ymd(y, 1 + (y % 12), 1 + (y % 27)), y % 2 ? 'male' : 'female');
      const list = repeatedForRemedy(g);
      expect(list.map((r) => r.digit).sort()).toEqual(DIGITS.filter((d) => g.full.counts[d] >= 2).sort());
      for (const r of list) { expect(r.count).toBe(g.full.counts[r.digit]); expect(r.often).toBe(r.count >= 3); }
    }
  });
});
