/**
 * The day overview behind the Panchang page: one call that joins the panchang, Moon times, lunar
 * month, named windows and Choghadiya. The astronomy is checked against JPL references in
 * tests/golden; these tests check that the parts fit together.
 */
import { describe, expect, it } from 'vitest';
import { activeAt, dayOverview } from '@/engine/day';
import { CHOGHADIYA_QUALITY } from '@/engine/muhurta';
import { clockLabel, clockLabelOn, durationLabel } from '@/lib/format';

const DELHI = { lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata' };
const NEW_YORK = { lat: 40.7128, lon: -74.006, zone: 'America/New_York' };

describe('day overview', () => {
  it('fits its parts inside one sunrise-to-sunrise day', () => {
    for (const place of [DELHI, NEW_YORK]) {
      for (const date of ['2026-01-14', '2026-06-21', '2026-11-15', '2027-03-28']) {
        const day = dayOverview(date, place)!;
        const { sunrise, sunset, nextSunrise } = day.panchang;
        expect(day.dayLength + day.nightLength).toBe(nextSunrise - sunrise);
        for (const w of [day.rahuKaal, day.yamaganda, day.gulikaKaal, day.abhijit]) {
          expect(w.start).toBeGreaterThanOrEqual(sunrise);
          expect(w.end).toBeLessThanOrEqual(sunset);
          expect(w.end).toBeGreaterThan(w.start);
        }
        expect(day.brahmaMuhurta.end).toBe(sunrise - 48 * 60000);

        expect(day.choghadiya).toHaveLength(16);
        expect(day.choghadiya[0].start).toBe(sunrise);
        expect(day.choghadiya[7].end).toBeCloseTo(sunset, 3);
        expect(day.choghadiya[15].end).toBeCloseTo(nextSunrise, 3);
        day.choghadiya.forEach((c, i) => {
          expect(c.night).toBe(i >= 8);
          expect(CHOGHADIYA_QUALITY[c.name]).toBeDefined();
          if (i > 0) expect(c.start).toBeCloseTo(day.choghadiya[i - 1].end, 3);
        });

        for (const key of ['moonrise', 'moonset'] as const) {
          const t = day.moon[key];
          if (t !== null) { expect(t).toBeGreaterThanOrEqual(sunrise); expect(t).toBeLessThan(nextSunrise); }
        }
        expect(day.month.starts).toBeLessThanOrEqual(sunrise);
        expect(day.month.ends).toBeGreaterThan(sunrise);
        expect(day.month.paksha).toBe(day.panchang.paksha);
      }
    }
  });

  it('skips Abhijit on a Wednesday only', () => {
    expect(dayOverview('2026-11-18', DELHI)!.abhijitSkipped).toBe(true); // Wednesday
    expect(dayOverview('2026-11-19', DELHI)!.abhijitSkipped).toBe(false);
  });

  it('reports a month that changes during the day', () => {
    // 19 March 2026: the new moon is at 6:54 am in Delhi, after sunrise, so Phalguna gives way to Chaitra.
    const ugadi = dayOverview('2026-03-19', DELHI)!;
    expect(ugadi.month.amanta.name).toBe('Phalguna');
    expect(ugadi.monthChange?.month.amanta.name).toBe('Chaitra');
    expect(ugadi.monthChange?.month.purnimanta.name).toBe('Chaitra');
    expect(ugadi.monthChange!.at).toBeGreaterThan(ugadi.panchang.sunrise);
    // 3 March 2026: Purnima ends in the evening, and the purnimanta month moves on to Chaitra.
    const holi = dayOverview('2026-03-03', DELHI)!;
    expect(holi.month.purnimanta.name).toBe('Phalguna');
    expect(holi.monthChange?.month.purnimanta.name).toBe('Chaitra');
    expect(holi.monthChange?.month.amanta.name).toBe('Phalguna');
    // An ordinary day has no change.
    expect(dayOverview('2026-11-15', DELHI)!.monthChange).toBeNull();
  });

  it('is null where the Sun does not rise', () => {
    expect(dayOverview('2026-12-21', { lat: 78.2232, lon: 15.6267, zone: 'Arctic/Longyearbyen' })).toBeNull();
  });

  it('finds the window in force at an instant', () => {
    const day = dayOverview('2026-11-15', DELHI)!;
    const third = day.choghadiya[2];
    expect(activeAt(day.choghadiya, third.start)).toBe(third);
    expect(activeAt(day.choghadiya, third.end - 1)).toBe(third);
    expect(activeAt(day.choghadiya, day.panchang.sunrise - 1)).toBeNull();
  });
});

describe('clock labels', () => {
  // 15 November 2026, 06:42:20 in Delhi is 01:12:20 UTC.
  const t = Date.UTC(2026, 10, 15, 1, 12, 20);

  it('prints the same text in every runtime, rounded to the minute', () => {
    expect(clockLabel(t, 'Asia/Kolkata')).toBe('6:42 am');
    expect(clockLabel(t + 40000, 'Asia/Kolkata')).toBe('6:43 am');
    expect(clockLabel(Date.UTC(2026, 10, 15, 6, 30), 'Asia/Kolkata')).toBe('12:00 pm');
    expect(clockLabel(Date.UTC(2026, 10, 15, 18, 30), 'Asia/Kolkata')).toBe('12:00 am');
    expect(clockLabel(t, 'America/New_York')).toBe('8:12 pm');
  });

  it('adds the date when the time falls on another day', () => {
    expect(clockLabelOn(t, 'Asia/Kolkata', '2026-11-15')).toBe('6:42 am');
    expect(clockLabelOn(t + 24 * 3600000, 'Asia/Kolkata', '2026-11-15')).toBe('6:42 am, 16 Nov');
    expect(clockLabelOn(t - 6 * 3600000, 'Asia/Kolkata', '2026-11-15')).toBe('12:42 am');
    expect(clockLabelOn(t - 7 * 3600000, 'Asia/Kolkata', '2026-11-15')).toBe('11:42 pm, 14 Nov');
  });

  it('writes a length of time in hours and minutes', () => {
    expect(durationLabel(10 * 3600000 + 42 * 60000 + 31000)).toBe('10 h 43 min');
    expect(durationLabel(45 * 60000)).toBe('45 min');
  });
});
