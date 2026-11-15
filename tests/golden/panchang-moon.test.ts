import { describe, expect, it } from 'vitest';
import { dayOverview } from '@/engine/day';
import { LUNAR_MONTHS, lunarMonth } from '@/engine/panchang';
import reference from './panchang-moon-reference.json';

// Independent reference: Skyfield with JPL DE421 (scripts/reference/panchang_reference.py).
// Moonrise and moonset for 20 places × 12 dates, and the lunar month for the 1st and 16th of
// every month from 2019 to 2032. Do not loosen these tolerances.
const MIN = 60000;
const { moonrise_moonset_minutes: MOON_TOL, new_moon_minutes: NEW_MOON_TOL } = reference.meta.tolerances;

describe('moonrise and moonset against JPL DE421 references', () => {
  it.each(reference.moon)('$city $date', (c) => {
    const day = dayOverview(c.date, { lat: c.latitude, lon: c.longitude, zone: c.timezone });
    expect(day).not.toBeNull();
    expect(Math.abs(day!.panchang.nextSunrise - Date.parse(c.next_sunrise)) / MIN).toBeLessThan(1);
    for (const key of ['moonrise', 'moonset'] as const) {
      const ours = day!.moon[key];
      const theirs = c[key] === null ? null : Date.parse(c[key]!);
      if (ours === null || theirs === null) {
        // Both must agree that the day has no such event.
        expect(ours, key).toBe(theirs);
      } else {
        expect(Math.abs(ours - theirs) / MIN, key).toBeLessThan(MOON_TOL);
      }
    }
  });

  it('includes days with no moonrise and days with no moonset', () => {
    expect(reference.moon.some((c) => c.moonrise === null)).toBe(true);
    expect(reference.moon.some((c) => c.moonset === null)).toBe(true);
  });
});

describe('lunar month against JPL DE421 references (2019 to 2032)', () => {
  it.each(reference.months)('$instant', (c) => {
    const m = lunarMonth(Date.parse(c.instant));
    expect(Math.abs(m.starts - Date.parse(c.new_moon_before)) / MIN).toBeLessThan(NEW_MOON_TOL);
    expect(Math.abs(m.ends - Date.parse(c.new_moon_after)) / MIN).toBeLessThan(NEW_MOON_TOL);
    expect(m.amanta.index).toBe(c.amanta_index);
    expect(m.amanta.name).toBe(LUNAR_MONTHS[c.amanta_index]);
    expect(m.amanta.adhika).toBe(c.adhika);
    expect(m.purnimanta.index).toBe(c.purnimanta_index);
    expect(m.paksha).toBe(c.paksha);
    // The reference's own margin and the engine's flag agree on which months are close calls.
    expect(m.borderline).toBe(c.sun_degrees_from_sign_change < 0.25);
    expect(m.kshaya).toBe(false);
  });

  it('names the adhika months of 2020, 2023, 2026, 2029 and 2031', () => {
    const at = (iso: string) => lunarMonth(Date.parse(iso)).amanta;
    expect(at('2020-10-01T00:30:00Z')).toEqual({ index: 6, name: 'Ashwin', adhika: true });
    expect(at('2023-08-01T00:30:00Z')).toEqual({ index: 4, name: 'Shravana', adhika: true });
    expect(at('2026-06-01T00:30:00Z')).toEqual({ index: 2, name: 'Jyeshtha', adhika: true });
    expect(at('2029-04-01T00:30:00Z')).toEqual({ index: 0, name: 'Chaitra', adhika: true });
    expect(at('2031-09-01T00:30:00Z')).toEqual({ index: 5, name: 'Bhadrapada', adhika: true });
    // The month after an adhika month has the same name and is not adhika.
    expect(at('2026-06-20T00:30:00Z')).toEqual({ index: 2, name: 'Jyeshtha', adhika: false });
  });

  it('gives the dark fortnight the next month’s name in the purnimanta count', () => {
    // Diwali, 8 November 2026: Ashwin by the amanta count, Kartika by the purnimanta count.
    const diwali = lunarMonth(Date.parse('2026-11-08T01:00:00Z'));
    expect([diwali.amanta.name, diwali.purnimanta.name, diwali.paksha]).toEqual(['Ashwin', 'Kartika', 'Krishna']);
    // Holi, 3 March 2026: the full moon of Phalguna in both counts.
    const holi = lunarMonth(Date.parse('2026-03-03T01:00:00Z'));
    expect([holi.amanta.name, holi.purnimanta.name, holi.paksha]).toEqual(['Phalguna', 'Phalguna', 'Shukla']);
    // Janmashtami, 4 September 2026: Shravana (amanta), Bhadrapada (purnimanta).
    const janmashtami = lunarMonth(Date.parse('2026-09-04T01:00:00Z'));
    expect([janmashtami.amanta.name, janmashtami.purnimanta.name]).toEqual(['Shravana', 'Bhadrapada']);
    // The dark fortnight of an adhika month keeps the adhika name in both counts.
    const adhika = lunarMonth(Date.parse('2026-06-05T01:00:00Z'));
    expect(adhika.paksha).toBe('Krishna');
    expect(adhika.purnimanta).toEqual(adhika.amanta);
  });
});
