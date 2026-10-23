/**
 * Shared constants and helpers for the calculation engine. Pure: no UI imports.
 * Longitudes are in degrees; instants are UTC milliseconds (as from Date.getTime()).
 */

export const DEG = Math.PI / 180;

export const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Signed difference a − b in degrees, in (−180, 180]. */
export function angleDiff(a: number, b: number): number {
  const d = norm360(a - b);
  return d > 180 ? d - 360 : d;
}

/** Julian Day (UT) of a UTC instant. */
export const julianDay = (utcMs: number) => utcMs / 86400000 + 2440587.5;

/** Julian centuries since J2000.0 for a Julian Day. */
export const centuries = (jd: number) => (jd - 2451545.0) / 36525;

export const NAKSHATRA_SPAN = 360 / 27; // 13°20′
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3°20′

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
] as const;

export const RASHIS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
] as const;

/** Where a sidereal longitude falls: sign, degree within the sign, nakshatra and pada. */
export interface ZodiacPosition {
  longitude: number;
  sign: number;          // 0 = Mesha … 11 = Meena
  degreeInSign: number;
  nakshatra: number;     // 0 = Ashwini … 26 = Revati
  pada: number;          // 1–4
}

export function zodiacPosition(longitude: number): ZodiacPosition {
  const lon = norm360(longitude);
  const nakshatra = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  return {
    longitude: lon,
    sign: Math.floor(lon / 30) % 12,
    degreeInSign: lon % 30,
    nakshatra,
    pada: Math.floor((lon - nakshatra * NAKSHATRA_SPAN) / PADA_SPAN) + 1,
  };
}

export type Boundary = 'sign' | 'nakshatra' | 'pada';

/**
 * The most significant division edge (sign, then nakshatra, then pada) that a longitude lies
 * within `margin` degrees of, or null.
 */
export function nearBoundary(longitude: number, margin: number): Boundary | null {
  const lon = norm360(longitude);
  const distanceTo = (step: number) => { const r = lon % step; return Math.min(r, step - r); };
  if (distanceTo(30) < margin) return 'sign';
  if (distanceTo(NAKSHATRA_SPAN) < margin) return 'nakshatra';
  if (distanceTo(PADA_SPAN) < margin) return 'pada';
  return null;
}

/** Positions closer than this to a division edge could fall on either side within the engine's error. */
export const ENGINE_MARGIN_DEG = 0.05;
