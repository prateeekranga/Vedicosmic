/**
 * The two-digit combination chart of Indian mobile numerology: every pair of neighbouring digits
 * is classed as benefic, neutral or malefic, and a few pairs carry the name of a yoga.
 *
 * The chart is a tradition of its own. It mostly agrees with the planetary friendships in
 * relations.ts, but not always (it calls 1 with 7 a Raj yog, though the Sun and Ketu are not
 * friends), so it is kept as its own table and never derived from the friendship table.
 *
 * Sources. The pairs that contain a 1, the chain 23, 34, 45, 56, 67, 78, 89 and the doubled
 * digits follow the chart that circulates among Indian teachers. The remaining pairs are not on
 * that chart; they are classed from the same planets' friendship and from the yogas of the same
 * name in the birth chart (Moon with Saturn, Moon with Mars, Rahu with Saturn). Zero has no
 * planet and is read as strengthening the digit beside it.
 *
 * The wording shown for each pair lives in src/data/numerology/mobilePairText.ts.
 */

export type PairImpact = 'benefic' | 'neutral' | 'malefic';
/** The yogas the chart itself names: Raj yog for 1 with 7, Bandhan yog for 4 with 5. */
export type PairYoga = 'raj' | 'bandhan';

const B: PairImpact = 'benefic';
const N: PairImpact = 'neutral';
const M: PairImpact = 'malefic';

/** Impact by pair, keyed with the smaller digit first; the order of the digits does not matter here. */
export const PAIR_IMPACT: Readonly<Record<string, PairImpact>> = {
  // Doubled digits.
  '00': N, '11': B, '22': B, '33': B, '44': M, '55': B, '66': B, '77': N, '88': M, '99': M,
  // Zero beside each number.
  '01': B, '02': N, '03': B, '04': N, '05': N, '06': B, '07': N, '08': M, '09': B,
  // 1 (Sun) with each other number.
  '12': B, '13': B, '14': M, '15': B, '16': N, '17': B, '18': M, '19': B,
  // 2 (Moon).
  '23': B, '24': M, '25': N, '26': N, '27': B, '28': M, '29': B,
  // 3 (Jupiter).
  '34': M, '35': M, '36': M, '37': B, '38': N, '39': B,
  // 4 (Rahu).
  '45': M, '46': B, '47': N, '48': M, '49': M,
  // 5 (Mercury).
  '56': B, '57': M, '58': B, '59': M,
  // 6 (Venus), 7 (Ketu), 8 (Saturn).
  '67': B, '68': B, '69': N,
  '78': M, '79': B,
  '89': M,
};

/** Pairs the chart reads differently when written the other way round, keyed as written. */
export const PAIR_IMPACT_AS_WRITTEN: Readonly<Record<string, PairImpact>> = {
  // 12 is careful spending; 21 is money slipping away.
  '21': N,
};

/** Pairs that carry the name of a yoga, keyed with the smaller digit first. */
export const PAIR_YOGA: Readonly<Record<string, PairYoga>> = { '17': 'raj', '45': 'bandhan' };

/** The key of a pair in the tables above: the two digits, smaller first. */
export const pairKey = (a: number, b: number): string => (a <= b ? `${a}${b}` : `${b}${a}`);

export function pairImpact(a: number, b: number): PairImpact {
  return PAIR_IMPACT_AS_WRITTEN[`${a}${b}`] ?? PAIR_IMPACT[pairKey(a, b)];
}

export function pairYoga(a: number, b: number): PairYoga | null {
  return PAIR_YOGA[pairKey(a, b)] ?? null;
}
