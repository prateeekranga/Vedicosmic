import { describe, expect, it } from 'vitest';
import { DASHA_SEQUENCE, DASHA_YEAR_DAYS, vimshottari } from '@/engine/dasha';
import { abhijit, choghadiya, horas, rahuKaal } from '@/engine/muhurta';
import { dayPanchang, daySunTimes, karanaName, sunTimesAt } from '@/engine/panchang';
import { dateInZone, resolveLocalTime, timeInZone, utcFromOffset } from '@/engine/time';
import { vratsBetween } from '@/engine/vrat';

const DELHI = { lat: 28.6139, lon: 77.209, zone: 'Asia/Kolkata' };
const DAY = 86400000;
const YEAR = DASHA_YEAR_DAYS * DAY;

describe('local time resolution', () => {
  it('flags a time the clock showed twice and returns both instants', () => {
    // New York falls back from 02:00 EDT to 01:00 EST on 1 Nov 2026.
    const r = resolveLocalTime('2026-11-01', '01:30', 'America/New_York');
    expect(r.kind).toBe('repeated');
    expect(new Date(r.utcMs).toISOString()).toBe('2026-11-01T05:30:00.000Z');
    expect(new Date(r.laterUtcMs!).toISOString()).toBe('2026-11-01T06:30:00.000Z');
  });

  it('flags a time skipped by the clock', () => {
    // London jumps from 01:00 GMT to 02:00 BST on 29 Mar 2026.
    const r = resolveLocalTime('2026-03-29', '01:30', 'Europe/London');
    expect(r.kind).toBe('skipped');
  });

  it('reads an ordinary time as normal', () => {
    const r = resolveLocalTime('1988-03-20', '02:00', 'Asia/Kolkata');
    expect(r).toMatchObject({ kind: 'normal', offsetMinutes: 330 });
  });

  it('accepts an explicit offset for old local-mean-time records', () => {
    // Bombay Time, +4:51, was used until 1955.
    expect(new Date(utcFromOffset('1950-01-01', '12:00', 4 * 60 + 51)).toISOString()).toBe('1950-01-01T07:09:00.000Z');
  });
});

describe('sunrise and sunset', () => {
  it('gives Delhi a plausible day length on every day of 2026', () => {
    const bad: string[] = [];
    for (let i = 0; i < 365; i++) {
      const date = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
      const sun = daySunTimes(date, DELHI);
      const hours = sun ? (sun.sunset - sun.sunrise) / 3600000 : NaN;
      if (!(hours > 10 && hours < 14.5) || !sun || dateInZone(sun.sunrise, DELHI.zone) !== date) bad.push(`${date}: ${hours.toFixed(2)} h`);
    }
    expect(bad).toEqual([]);
  });

  it('puts Delhi sunrise on 15 June 2026 at about 05:23 IST', () => {
    // Rounded to the nearest minute, as almanacs (and the site) show times.
    expect(timeInZone(daySunTimes('2026-06-15', DELHI)!.sunrise + 30000, DELHI.zone)).toBe('05:23');
  });

  it('counts the hours before sunrise as the previous panchang day', () => {
    const beforeDawn = Date.parse('2026-06-15T23:00:00Z'); // 04:30 IST on 16 June
    expect(sunTimesAt(beforeDawn, DELHI)!.date).toBe('2026-06-15');
    expect(sunTimesAt(beforeDawn + 2 * 3600000, DELHI)!.date).toBe('2026-06-16');
  });
});

describe('day divisions', () => {
  const p = dayPanchang('2026-01-12', DELHI)!; // a Monday

  it('puts Monday Rahu Kaal in the second eighth of the day', () => {
    const r = rahuKaal(p.sunrise, p.sunset, p.vara);
    const eighth = (p.sunset - p.sunrise) / 8;
    expect(p.vara).toBe(1);
    expect(r.start).toBeCloseTo(p.sunrise + eighth, -2);
    expect(r.end).toBeCloseTo(p.sunrise + 2 * eighth, -2);
  });

  it('centres Abhijit on the middle of the day', () => {
    const a = abhijit(p.sunrise, p.sunset);
    expect((a.start + a.end) / 2).toBeCloseTo((p.sunrise + p.sunset) / 2, -2);
  });

  it('gives the traditional Choghadiya order', () => {
    const c = choghadiya(p.sunrise, p.sunset, p.nextSunrise, p.vara).map((x) => x.name);
    expect(c.slice(0, 8)).toEqual(['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit']);
    expect(c.slice(8)).toEqual(['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char']);
    const sunday = choghadiya(0, 8, 16, 0).map((x) => x.name);
    expect(sunday.slice(0, 8)).toEqual(['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg']);
    expect(sunday.slice(8)).toEqual(['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh']);
  });

  it('starts the horas with the weekday lord and covers sunrise to sunrise', () => {
    const h = horas(p.sunrise, p.sunset, p.nextSunrise, p.vara);
    expect(h).toHaveLength(24);
    expect(h[0].planet).toBe('Moon');
    expect(h[0].start).toBe(p.sunrise);
    expect(h[23].end).toBeCloseTo(p.nextSunrise, -1);
  });

  it('names karanas in their fixed order', () => {
    expect([0, 1, 7, 8, 56, 57, 58, 59].map(karanaName))
      .toEqual(['Kimstughna', 'Bava', 'Vishti', 'Bava', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga']);
  });
});

describe('vrats', () => {
  const year = vratsBetween('2026-01-01', 365, DELHI);
  const ekadashis = year.filter((v) => v.kind === 'ekadashi');

  it('finds every Ekadashi of 2026 in Delhi, about a fortnight apart', () => {
    // Ekadashis come every ~14.8 days, so a calendar year holds 24 or 25 of them.
    expect(ekadashis).toHaveLength(24);
    expect(ekadashis[23].date).toBe('2026-12-20');
    for (let i = 1; i < ekadashis.length; i++) {
      const gap = (Date.parse(ekadashis[i].date) - Date.parse(ekadashis[i - 1].date)) / DAY;
      expect(gap).toBeGreaterThanOrEqual(13);
      expect(gap).toBeLessThanOrEqual(16);
      expect(ekadashis[i].paksha).not.toBe(ekadashis[i - 1].paksha);
    }
  });

  it('marks Shattila Ekadashi on 14 January 2026', () => {
    expect(ekadashis[0]).toMatchObject({ date: '2026-01-14', paksha: 'Krishna' });
  });

  it('finds both Pradosh days of every lunar month', () => {
    const pradosh = year.filter((v) => v.kind === 'pradosh');
    expect(pradosh.length).toBeGreaterThanOrEqual(24);
    expect(pradosh.length).toBeLessThanOrEqual(25);
    for (let i = 1; i < pradosh.length; i++) {
      const gap = (Date.parse(pradosh[i].date) - Date.parse(pradosh[i - 1].date)) / DAY;
      expect(gap).toBeGreaterThanOrEqual(13);
      expect(gap).toBeLessThanOrEqual(16);
    }
  });

  it('has one Purnima and one Amavasya per lunar month', () => {
    expect(year.filter((v) => v.kind === 'purnima').length).toBeGreaterThanOrEqual(12);
    expect(year.filter((v) => v.kind === 'purnima').length).toBeLessThanOrEqual(13);
    expect(year.filter((v) => v.kind === 'amavasya').length).toBeGreaterThanOrEqual(12);
    expect(year.filter((v) => v.kind === 'amavasya').length).toBeLessThanOrEqual(13);
  });
});

describe('Vimshottari dasha', () => {
  const birth = Date.parse('2000-01-01T00:00:00Z');

  it('runs the full Ketu dasha from the start of Ashwini, half of it from the middle', () => {
    expect(vimshottari(birth, 0).balanceYears).toBeCloseTo(7, 9);
    expect(vimshottari(birth, 360 / 54).balanceYears).toBeCloseTo(3.5, 9);
    expect(vimshottari(birth, 360 / 27 * 9 + 0.0001).periods[0].lord).toBe('ketu'); // Magha
  });

  it('covers 120 years without gaps, and each set of sub-periods fills its mahadasha', () => {
    const { periods } = vimshottari(birth, 123.4);
    expect((periods[8].end - periods[0].start) / YEAR).toBeCloseTo(120, 6);
    for (let i = 1; i < 9; i++) expect(periods[i].start).toBe(periods[i - 1].end);
    for (const p of periods) {
      expect(p.sub![0].lord).toBe(p.lord);
      expect(p.sub![8].end).toBeCloseTo(p.end, -1);
    }
    expect(periods[0].start).toBeLessThanOrEqual(birth);
    expect(periods[0].end).toBeGreaterThan(birth);
    expect(DASHA_SEQUENCE.reduce((s, d) => s + d.years, 0)).toBe(120);
  });
});
