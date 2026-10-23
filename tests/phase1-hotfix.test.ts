import { describe, expect, it } from 'vitest';
import { lahiriAyanamsa } from '@/engine/ayanamsa';
import { siderealMoonLongitude, longitudeToRashi, RASHIS } from '@/lib/astronomy';
import { NAK_NAMES } from '@/lib/panchang';
import { nearBoundary } from '@/lib/nakshatra';
import { sunEventUTC } from '@/lib/sunEvents';
import vectors from './golden/vectors.json';

const SEG = 360 / 27;
const julianDayAt0hUt = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86400000 + 2440587.5;

describe('mean Lahiri ayanamsa', () => {
  it.each(vectors.ayanamsa.map((a) => [a.date_0h_ut, a.lahiri_mean_ayanamsa_deg] as const))(
    '%s within 0.002° of the reference', (date, ref) => {
      expect(Math.abs(lahiriAyanamsa(julianDayAt0hUt(date)) - ref)).toBeLessThan(vectors.meta.tolerances.ayanamsa_deg);
    },
  );
});

/**
 * The Phase 1 Moon is the 6-term lunar theory (error ≈ 0.1–0.4°). It is not expected to meet
 * the Phase 2 tolerance of 0.02°, but its sign and nakshatra must match the reference for every
 * case that is not borderline, and any pada mismatch must come with a boundary note.
 */
describe('approximate Moon (Phase 1) against the golden charts', () => {
  const cases = vectors.lagna_cases;

  it.each(cases.map((c) => [c.id, c] as const))('%s: Moon sign and nakshatra', (_id, c) => {
    const lon = siderealMoonLongitude(new Date(c.utc));
    const sign = RASHIS[longitudeToRashi(lon)];
    const nakshatra = NAK_NAMES[Math.floor(lon / SEG) % 27];
    if (c.moon_borderline) {
      // Accept either side, but the tool must flag it.
      expect(nearBoundary(lon)).not.toBeNull();
      return;
    }
    expect(sign).toBe(c.moon_sign);
    expect(nakshatra).toBe(c.moon_nakshatra);
    const pada = Math.floor((lon % SEG) / (SEG / 4)) + 1;
    if (pada !== c.moon_pada) expect(nearBoundary(lon)).not.toBeNull();
  });
});

describe('sunrise and sunset (Muhurta date fix)', () => {
  it('Delhi has a positive, plausible day length on every day of 2026', () => {
    const bad: string[] = [];
    for (let day = 0; day < 365; day++) {
      const date = new Date(2026, 0, 1 + day, 12);
      const rise = sunEventUTC(date, 28.6139, 77.209, true);
      const set = sunEventUTC(date, 28.6139, 77.209, false);
      const hours = rise != null && set != null ? (set - rise) / 3600000 : NaN;
      if (!(hours > 10 && hours < 14.5)) bad.push(`${date.toDateString()}: ${hours.toFixed(2)} h`);
    }
    expect(bad).toEqual([]);
  });

  it('Delhi sunrise on 2026-06-15 falls on the right day (about 05:23 IST)', () => {
    const rise = sunEventUTC(new Date(2026, 5, 15, 12), 28.6139, 77.209, true)!;
    const ist = new Date(rise + 5.5 * 3600000);
    expect(ist.toISOString().slice(0, 10)).toBe('2026-06-15');
    expect(ist.getUTCHours() * 60 + ist.getUTCMinutes()).toBeGreaterThanOrEqual(5 * 60 + 15);
    expect(ist.getUTCHours() * 60 + ist.getUTCMinutes()).toBeLessThanOrEqual(5 * 60 + 30);
  });
});
