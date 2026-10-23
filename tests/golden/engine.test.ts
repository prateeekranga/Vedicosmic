import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lahiriAyanamsa } from '@/engine/ayanamsa';
import { castChart } from '@/engine/chart';
import { NAKSHATRAS, RASHIS, angleDiff, julianDay } from '@/engine/core';
import { ENGINE } from '@/engine/sky';
import { localToUtc } from '@/engine/time';
import vectors from './vectors.json';

// Golden vectors from Swiss Ephemeris (development only). The rules are the playbook's:
// Lagna sign exact and degree within 0.02°; graha longitudes within 0.02°; Moon sign and
// nakshatra exact, except where moon_borderline is set: then either side is accepted but
// the engine must flag the Moon as borderline. Do not loosen these tolerances.
const tol = vectors.meta.tolerances;
const birthUtc = (local: string, zone: string) => localToUtc(local.slice(0, 10), local.slice(11, 16), zone);

describe('golden: mean Lahiri ayanamsa', () => {
  it.each(vectors.ayanamsa)('$date_0h_ut', ({ date_0h_ut, lahiri_mean_ayanamsa_deg }) => {
    const jd = julianDay(Date.parse(`${date_0h_ut}T00:00:00Z`));
    expect(Math.abs(lahiriAyanamsa(jd) - lahiri_mean_ayanamsa_deg)).toBeLessThan(tol.ayanamsa_deg);
  });
});

describe('golden: Lagna and Moon (18 charts)', () => {
  it.each(vectors.lagna_cases)('$id $place $local', (c) => {
    const utcMs = birthUtc(c.local, c.timezone);
    expect(new Date(utcMs).toISOString().slice(0, 16) + 'Z').toBe(c.utc);

    const chart = castChart({ utcMs, lat: c.latitude, lon: c.longitude });
    expect(chart.lagna).not.toBeNull();
    expect(RASHIS[chart.lagna!.sign]).toBe(c.lagna_sign);
    expect(Math.abs(angleDiff(chart.lagna!.longitude, c.lagna_longitude))).toBeLessThan(tol.lagna_degree_deg);

    const moon = chart.grahas.find((g) => g.id === 'moon')!;
    expect(Math.abs(angleDiff(moon.longitude, c.moon_longitude))).toBeLessThan(tol.graha_longitude_deg);
    if (c.moon_borderline) {
      expect(moon.borderline).not.toBeNull();
    } else {
      expect(RASHIS[moon.sign]).toBe(c.moon_sign);
      expect(NAKSHATRAS[moon.nakshatra]).toBe(c.moon_nakshatra);
      expect(moon.pada).toBe(c.moon_pada);
    }
    const sun = chart.grahas.find((g) => g.id === 'sun')!;
    expect(RASHIS[sun.sign]).toBe(c.sun_sign);
  });
});

describe('golden: nine grahas (3 charts)', () => {
  const ID: Record<string, string> = { Sun: 'sun', Moon: 'moon', Mars: 'mars', Mercury: 'mercury', Jupiter: 'jupiter',
    Venus: 'venus', Saturn: 'saturn', Rahu: 'rahu', Ketu: 'ketu' };
  it.each(vectors.graha_cases)('$id $place $local', (c) => {
    const chart = castChart({ utcMs: birthUtc(c.local, c.timezone), lat: c.latitude, lon: c.longitude });
    for (const ref of c.grahas) {
      const g = chart.grahas.find((x) => x.id === ID[ref.graha.split(' ')[0]])!;
      expect(Math.abs(angleDiff(g.longitude, ref.longitude)), ref.graha).toBeLessThan(tol.graha_longitude_deg);
      expect(RASHIS[g.sign], ref.graha).toBe(ref.sign);
      expect(NAKSHATRAS[g.nakshatra], ref.graha).toBe(ref.nakshatra);
      expect(g.pada, ref.graha).toBe(ref.pada);
      if (g.id !== 'rahu' && g.id !== 'ketu') expect(g.retrograde, ref.graha).toBe(ref.retrograde);
    }
  });
});

describe('engine', () => {
  it('names the installed Astronomy Engine version on the method line', () => {
    const pkg = JSON.parse(fs.readFileSync('node_modules/astronomy-engine/package.json', 'utf8'));
    expect(ENGINE.version).toBe(pkg.version);
  });

  it('gives whole-sign houses from the Lagna sign', () => {
    const c = vectors.lagna_cases[0];
    const chart = castChart({ utcMs: birthUtc(c.local, c.timezone), lat: c.latitude, lon: c.longitude });
    expect(chart.houses[0]).toBe(chart.lagna!.sign);
    expect(chart.houses).toHaveLength(12);
    for (const g of chart.grahas) expect(chart.houses[g.house! - 1]).toBe(g.sign);
  });

  it('casts no Lagna beyond the polar limit or without a birth time', () => {
    const utcMs = Date.parse('2000-06-21T12:00:00Z');
    expect(castChart({ utcMs, lat: 69.6, lon: 18.9 }).lagna).toBeNull();
    const unknown = castChart({ utcMs, lat: 28.6, lon: 77.2, timeUnknown: true });
    expect(unknown.lagna).toBeNull();
    expect(unknown.houses).toEqual([]);
    expect(unknown.grahas.every((g) => g.house === null)).toBe(true);
  });
});
