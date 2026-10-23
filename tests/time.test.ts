import { describe, expect, it } from 'vitest';
import { localToUtc, zoneOffsetMinutes } from '@/engine/time';
import vectors from './golden/vectors.json';

// Run under different process time zones (see `npm test`): results must never depend on the device's zone.
describe(`localToUtc (process TZ: ${Intl.DateTimeFormat().resolvedOptions().timeZone})`, () => {
  it.each(vectors.lagna_cases.map((c) => [c.id, c] as const))('%s: local birth time → golden UTC', (_id, c) => {
    const [date, time] = c.local.split('T');
    expect(new Date(localToUtc(date, time, c.timezone)).toISOString()).toBe(c.utc.replace('Z', ':00.000Z'));
  });

  it('applies India’s wartime +6:30 offset (1942–45)', () => {
    expect(new Date(localToUtc('1943-06-01', '12:00', 'Asia/Kolkata')).toISOString()).toBe('1943-06-01T05:30:00.000Z');
  });

  it('applies Nepal’s change from +5:30 to +5:45 in 1986', () => {
    expect(zoneOffsetMinutes('Asia/Kathmandu', Date.UTC(1980, 0, 1))).toBe(330);
    expect(zoneOffsetMinutes('Asia/Kathmandu', Date.UTC(1990, 0, 1))).toBe(345);
  });

  it('picks the earlier occurrence of a repeated time (clocks go back)', () => {
    // 01:30 happens twice in New York on 2021-11-07: first at EDT (-4), then at EST (-5).
    expect(new Date(localToUtc('2021-11-07', '01:30', 'America/New_York')).toISOString()).toBe('2021-11-07T05:30:00.000Z');
  });

  it('moves a skipped time to just after the gap (clocks go forward)', () => {
    // 02:30 does not exist in New York on 2021-03-14; it lands at 03:30 EDT = 07:30 UTC.
    expect(new Date(localToUtc('2021-03-14', '02:30', 'America/New_York')).toISOString()).toBe('2021-03-14T07:30:00.000Z');
  });
});
