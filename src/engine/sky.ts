/**
 * The only module that talks to Astronomy Engine (MIT). Everything else in the engine works
 * from the longitudes returned here. Pure: no UI imports.
 *
 * Sidereal longitudes follow Swiss Ephemeris: the apparent longitude referred to the mean
 * equinox of date (nutation in longitude removed) minus the mean Lahiri ayanamsa. Checked
 * against tests/golden/vectors.json.
 */
import {
  Body, Ecliptic, EclipticGeoMoon, GeoVector, MakeTime, Observer, SearchRiseSet, SunPosition, e_tilt,
  type AstroTime,
} from 'astronomy-engine';
import { julianDay, norm360, centuries } from './core';
import { lahiriAyanamsa } from './ayanamsa';

export const ENGINE = { name: 'Astronomy Engine', version: '2.1.19' } as const;

export type GrahaId = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu';

const BODY: Partial<Record<GrahaId, Body>> = {
  sun: Body.Sun, mars: Body.Mars, mercury: Body.Mercury, jupiter: Body.Jupiter, venus: Body.Venus, saturn: Body.Saturn,
};

const timeOf = (utcMs: number): AstroTime => MakeTime(new Date(utcMs));

/** Nutation in longitude plus the mean Lahiri ayanamsa: true-of-date longitude − this = sidereal. */
export function siderealOffset(utcMs: number): number {
  return e_tilt(timeOf(utcMs)).dpsi / 3600 + lahiriAyanamsa(julianDay(utcMs));
}

/** Mean longitude of the Moon's ascending node, mean equinox of date (Meeus 47.7). */
function meanNode(utcMs: number): number {
  const t = centuries(julianDay(utcMs));
  return norm360(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + t ** 3 / 467441 - t ** 4 / 60616000);
}

/** Apparent geocentric longitudes of the Sun and Moon, true equinox of date. */
export function sunMoonTropical(utcMs: number): { sun: number; moon: number } {
  const t = timeOf(utcMs);
  return { sun: SunPosition(t).elon, moon: EclipticGeoMoon(t).lon };
}

/** Sidereal (Lahiri) longitude of a graha. Rahu is the mean node; Ketu is opposite it. */
export function siderealLongitude(id: GrahaId, utcMs: number): number {
  if (id === 'rahu' || id === 'ketu') {
    const rahu = norm360(meanNode(utcMs) - lahiriAyanamsa(julianDay(utcMs)));
    return id === 'rahu' ? rahu : norm360(rahu + 180);
  }
  const t = timeOf(utcMs);
  const tropical = id === 'moon' ? EclipticGeoMoon(t).lon : Ecliptic(GeoVector(BODY[id]!, t, true)).elon;
  return norm360(tropical - siderealOffset(utcMs));
}

/**
 * Next sunrise (`rise` true) or sunset after `fromUtcMs` within `limitDays`: the Sun's upper
 * limb on a sea-level horizon with standard refraction. Null during polar day or night.
 */
export function nextSunEvent(fromUtcMs: number, lat: number, lon: number, rise: boolean, limitDays = 1): number | null {
  const found = SearchRiseSet(Body.Sun, new Observer(lat, lon, 0), rise ? +1 : -1, timeOf(fromUtcMs), limitDays);
  return found ? found.date.getTime() : null;
}

/** Next moonrise (upper limb, standard refraction) after `fromUtcMs` within `limitDays`, or null. */
export function nextMoonrise(fromUtcMs: number, lat: number, lon: number, limitDays = 1): number | null {
  const found = SearchRiseSet(Body.Moon, new Observer(lat, lon, 0), +1, timeOf(fromUtcMs), limitDays);
  return found ? found.date.getTime() : null;
}
