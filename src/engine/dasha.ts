/**
 * Vimshottari dasha from the Moon's sidereal longitude at birth. Years of 365.25 days.
 * Pure: no UI imports.
 */
import { NAKSHATRA_SPAN, norm360 } from './core';
import type { GrahaId } from './sky';

export const DASHA_YEAR_DAYS = 365.25;

/** Order and length in years; Ashwini, Magha and Mula begin with Ketu. */
export const DASHA_SEQUENCE: { lord: GrahaId; years: number }[] = [
  { lord: 'ketu', years: 7 }, { lord: 'venus', years: 20 }, { lord: 'sun', years: 6 },
  { lord: 'moon', years: 10 }, { lord: 'mars', years: 7 }, { lord: 'rahu', years: 18 },
  { lord: 'jupiter', years: 16 }, { lord: 'saturn', years: 19 }, { lord: 'mercury', years: 17 },
];

const YEAR_MS = DASHA_YEAR_DAYS * 86400000;

export interface DashaPeriod {
  lord: GrahaId;
  start: number;  // UTC ms
  end: number;
  /** Antardashas (sub-periods), for mahadashas only. */
  sub?: DashaPeriod[];
}

export interface Vimshottari {
  /** Years of the birth mahadasha still to run at birth. */
  balanceYears: number;
  /** Nine mahadashas from the one running at birth (whose start lies before birth). */
  periods: DashaPeriod[];
}

export function vimshottari(birthUtcMs: number, moonSiderealLongitude: number): Vimshottari {
  const lon = norm360(moonSiderealLongitude);
  const nakshatra = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  const elapsed = (lon - nakshatra * NAKSHATRA_SPAN) / NAKSHATRA_SPAN; // fraction of the nakshatra traversed
  const first = nakshatra % 9;
  const balanceYears = DASHA_SEQUENCE[first].years * (1 - elapsed);

  const periods: DashaPeriod[] = [];
  let start = birthUtcMs - DASHA_SEQUENCE[first].years * elapsed * YEAR_MS;
  for (let i = 0; i < 9; i++) {
    const maha = DASHA_SEQUENCE[(first + i) % 9];
    const end = start + maha.years * YEAR_MS;
    const sub: DashaPeriod[] = [];
    let subStart = start;
    for (let j = 0; j < 9; j++) {
      const antar = DASHA_SEQUENCE[(first + i + j) % 9];
      const subEnd = subStart + (maha.years * antar.years / 120) * YEAR_MS;
      sub.push({ lord: antar.lord, start: subStart, end: subEnd });
      subStart = subEnd;
    }
    periods.push({ lord: maha.lord, start, end, sub });
    start = end;
  }
  return { balanceYears, periods };
}
