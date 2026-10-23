/**
 * Mean Lahiri (Chitrapaksha) ayanamsa, without nutation: the value at the reference epoch
 * 1956-03-21 0h (JD 2435553.5) used by Swiss Ephemeris, carried to other dates by the
 * IAU 1976 general precession in longitude. Matches the reference values in
 * tests/golden/vectors.json to within 0.0001° from 1900 to 2100 (tolerance 0.002°).
 * Pure: no UI imports.
 */
const T0_JD = 2435553.5;
const AYANAMSA_AT_T0 = 23.245524743;

/** General precession in longitude since J2000, in degrees, for T Julian centuries from J2000. */
function generalPrecession(t: number): number {
  return (5029.0966 * t + 1.11113 * t * t - 0.000006 * t * t * t) / 3600;
}

const centuries = (jd: number) => (jd - 2451545.0) / 36525;

export function lahiriAyanamsa(jd: number): number {
  return AYANAMSA_AT_T0 + generalPrecession(centuries(jd)) - generalPrecession(centuries(T0_JD));
}
