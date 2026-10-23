import { julianDay, moonLongitude, lahiriAyanamsa } from './panchang';
import { longitudeToRashi, type City } from './astronomy';
import { localToUtc } from '@/engine/time';

export interface BirthMoonPlacement {
  nakshatraIndex: number; // 0-26
  pada: number;           // 1-4
  rashiIndex: number;     // 0-11 (Aries=0)
  siderealMoonLon: number;
}

const SEG = 360 / 27;
const norm = (x: number) => ((x % 360) + 360) % 360;

/** UTC instant of a birth given as local date + time at a city, in that city's own time zone. */
export function birthUtc(dateIso: string, time: string, city: City): Date {
  return new Date(localToUtc(dateIso, time || '06:00', city.zone));
}

/** Birth Moon nakshatra/pada/rashi for a person, given local date+time+city. */
export function computeBirthMoon(dateIso: string, time: string, city: City): BirthMoonPlacement {
  const jd = julianDay(birthUtc(dateIso, time, city));
  const tropicalMoon = moonLongitude(jd);
  const siderealMoonLon = norm(tropicalMoon - lahiriAyanamsa(jd));
  const nakshatraIndex = Math.floor(siderealMoonLon / SEG) % 27;
  const pada = Math.floor((siderealMoonLon % SEG) / (SEG / 4)) + 1;
  const rashiIndex = longitudeToRashi(siderealMoonLon);
  return { nakshatraIndex, pada, rashiIndex, siderealMoonLon };
}

export type Boundary = 'sign' | 'nakshatra' | 'pada';

/**
 * The most significant edge (sign, then nakshatra, then pada) that a sidereal longitude lies
 * within `margin` degrees of, or null. The default margin covers the approximate lunar
 * formula's error of about ±0.3°.
 */
export function nearBoundary(longitude: number, margin = 0.5): Boundary | null {
  const lon = norm(longitude);
  const distanceTo = (step: number) => { const r = lon % step; return Math.min(r, step - r); };
  if (distanceTo(30) < margin) return 'sign';
  if (distanceTo(SEG) < margin) return 'nakshatra';
  if (distanceTo(SEG / 4) < margin) return 'pada';
  return null;
}
