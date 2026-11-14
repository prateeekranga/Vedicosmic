import { ashtakootMilan, type AshtakootResult, type BirthMoonPlacement } from './ashtakoot';
import { birthInstant } from './birthTime';
import type { ChosenPlace } from './places';
import { siderealLongitude } from '@/engine/sky';
import { zodiacPosition } from '@/engine/core';

export interface PersonInput {
  name: string;
  gender: 'male' | 'female';
  day: number; month: number; year: number;
  time: string;
  place: ChosenPlace;
}

// The old "numerology compatibility" percentage (a distance between two numbers) had no basis in
// any tradition and has been removed; matching rests on the Ashtakoota alone.
export interface MatchReport {
  placementA: BirthMoonPlacement;
  placementB: BirthMoonPlacement;
  ashtakoot: AshtakootResult;
}

function pad(n: number): string { return String(n).padStart(2, '0'); }
function isoOf(p: PersonInput): string { return `${p.year}-${pad(p.month)}-${pad(p.day)}`; }

/** Sidereal Moon at birth, the birth time read in the birth place's own time zone. */
function birthMoon(p: PersonInput): BirthMoonPlacement {
  const lon = siderealLongitude('moon', birthInstant(isoOf(p), p.time || '06:00', p.place).utcMs);
  const z = zodiacPosition(lon);
  return { nakshatraIndex: z.nakshatra, pada: z.pada, rashiIndex: z.sign, siderealMoonLon: lon };
}

export function matchPeople(a: PersonInput, b: PersonInput): MatchReport {
  const placementA = birthMoon(a);
  const placementB = birthMoon(b);
  const ashtakoot = ashtakootMilan(placementA, placementB, a.gender, b.gender);

  return { placementA, placementB, ashtakoot };
}
