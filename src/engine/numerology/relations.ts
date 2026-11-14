/**
 * How the nine numbers get along, through the planets that rule them in Indian numerology:
 * 1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars.
 *
 * This table is the only source for "friendly", "neutral" and "challenging" numbers anywhere on
 * the site (lucky numbers, name and mobile number fit, Driver and Conductor harmony).
 *
 * The rows for the seven visible planets are the natural friendships (naisargika maitri) given in
 * the Brihat Parashara Hora Shastra. Rahu and Ketu have no row there; theirs is the convention
 * most teachers use (Rahu sides with Saturn, Venus and Mercury; Ketu with Mars, Venus and Saturn)
 * and each planet returns the same regard to them. Schools differ on these details, so a change
 * of school means editing this one table.
 */
import { DIGITS, type Digit } from './core';

export type Relation = 'friend' | 'neutral' | 'enemy';

export const PLANET_OF: Readonly<Record<Digit, string>> = {
  1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu', 5: 'Mercury', 6: 'Venus', 7: 'Ketu', 8: 'Saturn', 9: 'Mars',
};

const F: Relation = 'friend';
const N: Relation = 'neutral';
const E: Relation = 'enemy';

/** RELATION_TABLE[a][b]: how the planet of `a` regards the planet of `b`. A number is its own friend. */
export const RELATION_TABLE: Readonly<Record<Digit, Readonly<Record<Digit, Relation>>>> = {
  //        Sun   Moon  Jup   Rahu  Merc  Ven   Ketu  Sat   Mars
  1: { 1: F, 2: F, 3: F, 4: E, 5: N, 6: E, 7: E, 8: E, 9: F }, // Sun
  2: { 1: F, 2: F, 3: N, 4: E, 5: F, 6: N, 7: E, 8: N, 9: N }, // Moon
  3: { 1: F, 2: F, 3: F, 4: N, 5: E, 6: E, 7: N, 8: N, 9: F }, // Jupiter
  4: { 1: E, 2: E, 3: N, 4: F, 5: F, 6: F, 7: N, 8: F, 9: E }, // Rahu
  5: { 1: F, 2: E, 3: N, 4: F, 5: F, 6: F, 7: N, 8: N, 9: N }, // Mercury
  6: { 1: E, 2: E, 3: N, 4: F, 5: F, 6: F, 7: F, 8: F, 9: N }, // Venus
  7: { 1: E, 2: E, 3: N, 4: N, 5: N, 6: F, 7: F, 8: F, 9: F }, // Ketu
  8: { 1: E, 2: E, 3: N, 4: F, 5: F, 6: F, 7: F, 8: F, 9: E }, // Saturn
  9: { 1: F, 2: F, 3: F, 4: E, 5: E, 6: N, 7: F, 8: N, 9: F }, // Mars
};

/** Both directions together, from warmest to coldest. */
export type MutualRelation = 'mutual-friends' | 'friendly' | 'neutral' | 'mixed' | 'strained' | 'opposed';

export interface PairRelation {
  a: Digit; b: Digit;
  /** How a's planet regards b's, and the reverse. */
  aToB: Relation; bToA: Relation;
  mutual: MutualRelation;
}

function combine(x: Relation, y: Relation): MutualRelation {
  const pair = [x, y].sort().join('+');
  switch (pair) {
    case 'friend+friend': return 'mutual-friends';
    case 'friend+neutral': return 'friendly';
    case 'neutral+neutral': return 'neutral';
    case 'enemy+friend': return 'mixed';
    case 'enemy+neutral': return 'strained';
    default: return 'opposed';
  }
}

export function pairRelation(a: Digit, b: Digit): PairRelation {
  const aToB = RELATION_TABLE[a][b];
  const bToA = RELATION_TABLE[b][a];
  return { a, b, aToB, bToA, mutual: combine(aToB, bToA) };
}

/** The numbers a given number's planet counts as friends, neutrals and enemies (itself left out). */
export function relationsOf(n: Digit): { friends: Digit[]; neutral: Digit[]; enemies: Digit[] } {
  const others = DIGITS.filter((d) => d !== n);
  return {
    friends: others.filter((d) => RELATION_TABLE[n][d] === 'friend'),
    neutral: others.filter((d) => RELATION_TABLE[n][d] === 'neutral'),
    enemies: others.filter((d) => RELATION_TABLE[n][d] === 'enemy'),
  };
}

/** A three-way reading of a mutual relation, for labels that must not rely on colour alone. */
export function relationTone(m: MutualRelation): 'supportive' | 'mixed' | 'challenging' {
  if (m === 'mutual-friends' || m === 'friendly') return 'supportive';
  if (m === 'neutral' || m === 'mixed') return 'mixed';
  return 'challenging';
}
