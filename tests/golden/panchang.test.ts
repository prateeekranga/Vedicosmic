import { describe, expect, it } from 'vitest';
import { dayPanchang } from '@/engine/panchang';
import { PANCHANG_REFERENCE_DAYS } from '@/content/referenceChecks';
import reference from './panchang-reference.json';

// Independent reference: Skyfield with JPL DE421 (scripts/reference/panchang_reference.py),
// 20 places × 12 dates. Playbook tolerances: sunrise and sunset within 1 minute; tithi,
// nakshatra, yoga and karana end times within 2 minutes. Do not loosen these tolerances.
const MIN = 60000;
const { sunrise_sunset_minutes: SUN_TOL, end_time_minutes: END_TOL } = reference.meta.tolerances;

describe('panchang against JPL DE421 references (240 days)', () => {
  it('matches the count stated on /how-we-calculate', () => {
    expect(reference.cases.length).toBe(PANCHANG_REFERENCE_DAYS);
  });

  it.each(reference.cases)('$city $date', (c) => {
    const p = dayPanchang(c.date, { lat: c.latitude, lon: c.longitude, zone: c.timezone });
    expect(p).not.toBeNull();
    expect(Math.abs(p!.sunrise - Date.parse(c.sunrise)) / MIN).toBeLessThan(SUN_TOL);
    expect(Math.abs(p!.sunset - Date.parse(c.sunset)) / MIN).toBeLessThan(SUN_TOL);
    for (const key of ['tithi', 'nakshatra', 'yoga', 'karana'] as const) {
      const first = p![key][0];
      expect(first.index, key).toBe(c[key].index_at_sunrise);
      expect(Math.abs(first.ends - Date.parse(c[key].ends)) / MIN, key).toBeLessThan(END_TOL);
    }
  });
});
