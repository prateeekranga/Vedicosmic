/**
 * Ascendant (Lagna) from mean sidereal time, mean obliquity and latitude, with the mean
 * Lahiri ayanamsa — the model that reproduces tests/golden/vectors.json. Pure: no UI imports.
 */
import { DEG, centuries, julianDay, norm360 } from './core';
import { lahiriAyanamsa } from './ayanamsa';

/** Beyond this latitude some signs never rise and the Ascendant can jump; charts are not cast. */
export const POLAR_LATITUDE = 66;

/** Greenwich mean sidereal time in degrees (Meeus 12.4), from a UT Julian Day. */
export function greenwichMeanSiderealTime(jd: number): number {
  const t = centuries(jd);
  return norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - t ** 3 / 38710000);
}

/** Mean obliquity of the ecliptic in degrees (Meeus 22.2). */
export function meanObliquity(jd: number): number {
  const t = centuries(jd);
  return 23.4392911111 - (46.815 * t + 0.00059 * t * t - 0.001813 * t ** 3) / 3600;
}

/** Tropical Ascendant in degrees for a UTC instant at latitude/longitude (east positive). */
export function tropicalAscendant(utcMs: number, lat: number, lon: number): number {
  const jd = julianDay(utcMs);
  const ramc = norm360(greenwichMeanSiderealTime(jd) + lon) * DEG;
  const eps = meanObliquity(jd) * DEG;
  const phi = lat * DEG;
  // ASC = atan2(cos RAMC, −(sin RAMC · cos ε + tan φ · sin ε))
  return norm360(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / DEG);
}

/** Sidereal (Lahiri) Ascendant, or null beyond the polar latitude limit. */
export function siderealAscendant(utcMs: number, lat: number, lon: number): number | null {
  if (Math.abs(lat) > POLAR_LATITUDE) return null;
  return norm360(tropicalAscendant(utcMs, lat, lon) - lahiriAyanamsa(julianDay(utcMs)));
}
