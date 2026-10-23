import { computeBlueprint, type Blueprint } from './numerology';
import { NUMBER_MEANINGS } from '@/data/numerology';
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

export interface NumberPairResult { label: string; a: number; b: number; score: number; traditionallyCompatible: boolean }
export interface NumerologyMatchResult { lifePath: NumberPairResult; expression: NumberPairResult; overallPercent: number }

export interface MatchReport {
  blueprintA: Blueprint;
  blueprintB: Blueprint;
  numerology: NumerologyMatchResult;
  placementA: BirthMoonPlacement;
  placementB: BirthMoonPlacement;
  ashtakoot: AshtakootResult;
}

/** Same distance-to-percentage scoring already used for mobile-number compatibility in `analyseMobile()`. */
function pairScore(a: number, b: number): number {
  return Math.max(20, Math.round(100 - Math.abs(a - b) * 11));
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
  const blueprintA = computeBlueprint(a.name, a.day, a.month, a.year);
  const blueprintB = computeBlueprint(b.name, b.day, b.month, b.year);

  const lifePathScore = pairScore(blueprintA.lifePath.root, blueprintB.lifePath.root);
  const expressionScore = pairScore(blueprintA.expression.root, blueprintB.expression.root);
  const overallPercent = Math.round(lifePathScore * 0.65 + expressionScore * 0.35);

  const lifePath: NumberPairResult = {
    label: 'Life Path', a: blueprintA.lifePath.root, b: blueprintB.lifePath.root, score: lifePathScore,
    traditionallyCompatible: !!NUMBER_MEANINGS[blueprintA.lifePath.root]?.compatibleWith.includes(blueprintB.lifePath.root),
  };
  const expression: NumberPairResult = {
    label: 'Expression', a: blueprintA.expression.root, b: blueprintB.expression.root, score: expressionScore,
    traditionallyCompatible: !!NUMBER_MEANINGS[blueprintA.expression.root]?.compatibleWith.includes(blueprintB.expression.root),
  };

  const placementA = birthMoon(a);
  const placementB = birthMoon(b);
  const ashtakoot = ashtakootMilan(placementA, placementB, a.gender, b.gender);

  return {
    blueprintA, blueprintB,
    numerology: { lifePath, expression, overallPercent },
    placementA, placementB, ashtakoot,
  };
}
