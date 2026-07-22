import { julianDay, moonLongitude, lahiriAyanamsa } from './panchang';
import { longitudeToRashi, type City } from './astronomy';

export interface BirthMoonPlacement {
  nakshatraIndex: number; // 0-26
  pada: number;           // 1-4
  rashiIndex: number;     // 0-11 (Aries=0)
  siderealMoonLon: number;
}

const SEG = 360 / 27;
const norm = (x: number) => ((x % 360) + 360) % 360;

/** Birth Moon nakshatra/pada/rashi for a person, given local date+time+city. Same date/timezone convention as `AstrologyTool.tsx`. */
export function computeBirthMoon(dateIso: string, time: string, city: City): BirthMoonPlacement {
  const local = new Date(`${dateIso}T${time || '06:00'}:00`);
  const utc = new Date(local.getTime() - city.tz * 3600000);
  const jd = julianDay(utc);
  const tropicalMoon = moonLongitude(jd);
  const siderealMoonLon = norm(tropicalMoon - lahiriAyanamsa(jd));
  const nakshatraIndex = Math.floor(siderealMoonLon / SEG) % 27;
  const pada = Math.floor((siderealMoonLon % SEG) / (SEG / 4)) + 1;
  const rashiIndex = longitudeToRashi(siderealMoonLon);
  return { nakshatraIndex, pada, rashiIndex, siderealMoonLon };
}
