/**
 * Reference tables for Ashtakoot (Guna Milan) — the classical 8-factor Vedic
 * astrology compatibility system. Each table below is the standard, widely
 * published classical assignment. Where a factor has genuine gender-directional
 * or half-sign nuance across different classical texts, a documented
 * simplification is used (noted inline) rather than fabricating precision
 * this codebase can't actually verify against a primary source.
 */

export const YONI_NAMES = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat',
  'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion',
];

// The 7 classically-recognized "natural enemy" yoni pairs (by index into YONI_NAMES).
const YONI_ENEMY_PAIRS: [number, number][] = [
  [7, 9],   // Cow ↔ Tiger
  [1, 13],  // Elephant ↔ Lion
  [0, 8],   // Horse ↔ Buffalo
  [4, 10],  // Dog ↔ Deer
  [3, 12],  // Serpent ↔ Mongoose
  [6, 5],   // Rat ↔ Cat
  [2, 11],  // Sheep ↔ Monkey
];

/**
 * Simplified symmetric scoring: same yoni = 4 (max), one of the 7 classical
 * enemy pairs = 0, everything else = 2 (neutral). Classical texts assign finer
 * friend/neutral distinctions to some of the remaining pairs, but those vary
 * across sources — treating the rest as neutral avoids overclaiming precision.
 */
export const YONI_COMPATIBILITY: number[][] = Array.from({ length: 14 }, (_, i) =>
  Array.from({ length: 14 }, (_, j) => {
    if (i === j) return 4;
    const isEnemy = YONI_ENEMY_PAIRS.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
    return isEnemy ? 0 : 2;
  }),
);

export type Varna = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
/** Hierarchy for the Varna koota's boy-should-rank-≥-girl rule (higher = higher rank). */
export const VARNA_RANK: Record<Varna, number> = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
/** Rashi index (0=Aries..11=Pisces, matching `RASHI_INFO`/`longitudeToRashi`) → Varna. */
export const VARNA_BY_RASHI: Varna[] = [
  'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin', 'Kshatriya', 'Vaishya',
  'Shudra', 'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Brahmin',
];

export type VashyaGroup = 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanachara' | 'Keeta';
/** Rashi index → Vashya group. Simplified to whole-sign (classical Sagittarius/Capricorn are half-sign splits). */
export const VASHYA_GROUP_BY_RASHI: VashyaGroup[] = [
  'Chatushpada', 'Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Manava',
  'Manava', 'Keeta', 'Chatushpada', 'Jalachara', 'Manava', 'Jalachara',
];
const VASHYA_ORDER: VashyaGroup[] = ['Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Keeta'];
/** Simplified symmetric 0-2 point table (classical texts add directional dominance rules this collapses). */
const VASHYA_MATRIX = [
  [2, 1, 1, 0, 1],
  [1, 2, 1, 1, 1],
  [1, 1, 2, 1, 0],
  [0, 1, 1, 2, 1],
  [1, 1, 0, 1, 2],
];
export function vashyaPoints(a: VashyaGroup, b: VashyaGroup): number {
  return VASHYA_MATRIX[VASHYA_ORDER.indexOf(a)][VASHYA_ORDER.indexOf(b)];
}

/** Rashi index → its Vedic lord (the 7 classical grahas only — Rahu/Ketu have no rashi lordship here). */
export const RASHI_LORD: string[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];
const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
/** Classical Panchadha Maitri (five-fold planetary friendship) points, 0-5, derived from Parashara's natural relationships. */
const GRAHA_MAITRI_MATRIX = [
  [5, 5, 5, 4, 5, 0, 0],
  [5, 5, 4, 3, 4, 1, 1],
  [5, 4, 5, 1, 5, 3, 1],
  [4, 3, 1, 5, 1, 5, 4],
  [5, 4, 5, 1, 5, 1, 3],
  [0, 1, 3, 5, 1, 5, 5],
  [0, 1, 1, 4, 3, 5, 5],
];
export function grahaMaitriPoints(a: string, b: string): number {
  return GRAHA_MAITRI_MATRIX[PLANET_ORDER.indexOf(a)][PLANET_ORDER.indexOf(b)];
}

/** Tara positions (1-9, counted from one person's nakshatra to the other's) that are traditionally inauspicious: Vipat (3rd), Pratyak (5th), Naidhana (7th). */
export const TARA_INAUSPICIOUS_POSITIONS = new Set([3, 5, 7]);

export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
const GANA_ORDER: Gana[] = ['Deva', 'Manushya', 'Rakshasa'];
/** Simplified symmetric 0-6 point table (classical texts add boy/girl-direction nuance for the Deva/Manushya pairing this collapses). */
const GANA_MATRIX = [
  [6, 6, 0],
  [6, 6, 0],
  [0, 0, 6],
];
export function ganaPoints(a: Gana, b: Gana): number {
  return GANA_MATRIX[GANA_ORDER.indexOf(a)][GANA_ORDER.indexOf(b)];
}

export const GUNA_MILAN_TIERS = [
  { min: 0, max: 17, label: 'Worth a thoughtful conversation', tone: 'warning' as const },
  { min: 18, max: 24, label: 'A workable match', tone: 'cyan' as const },
  { min: 25, max: 32, label: 'A strong match', tone: 'gold' as const },
  { min: 33, max: 36, label: 'An excellent match', tone: 'success' as const },
];
