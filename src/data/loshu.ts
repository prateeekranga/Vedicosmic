/**
 * Lo Shu Grid (Vedic numerology) — the 3×3 magic square in which every row,
 * column and diagonal sums to 15. Each fixed position carries a number and its
 * ruling planet. Birth-date digits are dropped into their home cells; the
 * resulting pattern of repetitions, missing numbers and complete lines
 * ("arrows" / planes) forms the reading.
 */

export interface LoshuNumber {
  n: number;
  planet: string;
  sanskrit: string;
  color: string;     // vivid cell fill, mirroring the traditional chart
  keyword: string;
  trait: string;
}

export const LOSHU_NUMBERS: Record<number, LoshuNumber> = {
  1: { n: 1, planet: 'Sun',     sanskrit: 'Surya',       color: '#F4A8C2', keyword: 'Identity & Will', trait: 'Leadership, individuality and a clear sense of self.' },
  2: { n: 2, planet: 'Moon',    sanskrit: 'Chandra',     color: '#A9C4E0', keyword: 'Emotion & Intuition', trait: 'Sensitivity, relationships and the inner tides of feeling.' },
  3: { n: 3, planet: 'Jupiter', sanskrit: 'Brihaspati',  color: '#A7D08C', keyword: 'Wisdom & Expression', trait: 'Optimism, learning and the urge to teach and create.' },
  4: { n: 4, planet: 'Rahu',    sanskrit: 'Rahu',        color: '#E5594F', keyword: 'Order & Ambition', trait: 'Discipline, structure and an unconventional material drive.' },
  5: { n: 5, planet: 'Mercury', sanskrit: 'Budha',       color: '#B7BFE8', keyword: 'Balance & Mind', trait: 'Communication, adaptability and the calm centre of the grid.' },
  6: { n: 6, planet: 'Venus',   sanskrit: 'Shukra',      color: '#F3D34A', keyword: 'Love & Harmony', trait: 'Beauty, comfort, devotion and creative pleasure.' },
  7: { n: 7, planet: 'Ketu',    sanskrit: 'Ketu',        color: '#82CFE6', keyword: 'Spirit & Detachment', trait: 'Introspection, research and the pull toward the unseen.' },
  8: { n: 8, planet: 'Saturn',  sanskrit: 'Shani',       color: '#F2B27A', keyword: 'Karma & Structure', trait: 'Endurance, responsibility and lessons earned through time.' },
  9: { n: 9, planet: 'Mars',    sanskrit: 'Mangal',      color: '#BFD98E', keyword: 'Energy & Courage', trait: 'Action, drive, protectiveness and raw vitality.' },
};

/** Fixed Lo Shu layout (rows top→bottom). */
export const LOSHU_LAYOUT: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export interface Plane {
  id: string;
  name: string;
  cells: [number, number, number];
  kind: 'row' | 'col' | 'diag';
  present: string;  // meaning when all three are present
  absent: string;   // meaning when all three are missing
}

export const PLANES: Plane[] = [
  { id: 'mental',    name: 'Mental Plane',     cells: [4, 9, 2], kind: 'row',
    present: 'A sharp, organised mind — strong intellect, memory and analytical power.',
    absent:  'Concentration and self-belief are lessons to cultivate consciously.' },
  { id: 'emotional', name: 'Emotional Plane',  cells: [3, 5, 7], kind: 'row',
    present: 'Rich emotional intelligence — balanced feeling, intuition and freedom.',
    absent:  'Learning to trust feelings and express them openly is a growth path.' },
  { id: 'practical', name: 'Practical Plane',  cells: [8, 1, 6], kind: 'row',
    present: 'A natural doer — ideas reliably take physical, tangible form.',
    absent:  'Turning plans into finished action is the muscle to strengthen.' },
  { id: 'thought',   name: 'Thought Plane',    cells: [4, 3, 8], kind: 'col',
    present: 'A planner and strategist — patient, methodical and far-seeing.',
    absent:  'Following long-term plans through to the end asks for extra focus.' },
  { id: 'will',      name: 'Will Plane',       cells: [9, 5, 1], kind: 'col',
    present: 'Powerful willpower and determination — hard to knock off course.',
    absent:  'Steady self-discipline and resolve are worth deliberate practice.' },
  { id: 'action',    name: 'Action Plane',     cells: [2, 7, 6], kind: 'col',
    present: 'Active, capable hands — sensitivity expressed through real-world skill.',
    absent:  'Beginning and sustaining practical activity is an area to nurture.' },
  { id: 'golden',    name: 'Golden Diagonal',        cells: [4, 5, 6], kind: 'diag',
    present: 'The rare Golden Diagonal is complete — exceptional resolve and the will to finish what you start.',
    absent:  'Persistence in the face of obstacles is a quiet lifelong teacher.' },
  { id: 'spiritual', name: 'Silver Diagonal',        cells: [2, 5, 8], kind: 'diag',
    present: 'The Silver Diagonal shines through — deep compassion and a spiritual, service-oriented temperament.',
    absent:  'Opening to empathy and the inner life rewards gentle attention.' },
];

export function repetitionMeaning(n: number, count: number): string {
  const name = LOSHU_NUMBERS[n].planet;
  if (count === 0) return `Missing ${name} — its qualities are a lesson to develop in this life.`;
  if (count === 1) return `One ${n} — the ${name} energy sits in healthy balance.`;
  if (count === 2) return `Two ${n}s — ${name} is strengthened and expressed with ease.`;
  if (count === 3) return `Three ${n}s — ${name} is highly dominant; channel it with awareness.`;
  return `${count} ${n}s — an intense concentration of ${name}; powerful, but easily excessive.`;
}

export const LOSHU_INTRO =
  'Enter your date of birth and watch its digits settle into the ancient Lo Shu square — ' +
  'a 3×3 grid where every line sums to 15. Repeated numbers reveal amplified energies, ' +
  'empty cells reveal lessons to grow into, and complete lines form the classic "arrows" of strength.';

/** Reduce to a single 1–9 digit (no master numbers in the Lo Shu system). */
export function reduceTo9(n: number): number {
  let x = Math.abs(n);
  while (x > 9) x = String(x).split('').reduce((a, d) => a + Number(d), 0);
  return x;
}

/** Kua (8-Mansions) number from birth year + gender. */
export function kuaNumber(year: number, gender: 'male' | 'female'): number {
  const ys = reduceTo9(year);
  let k: number;
  if (gender === 'male') { k = reduceTo9(11 - ys); if (k === 5) k = 2; }
  else { k = reduceTo9(ys + 4); if (k === 5) k = 8; }
  if (k === 0) k = 9;
  return k;
}

export interface LoshuChart {
  counts: Record<number, number>;
  driver: number;   // Mulank
  conductor: number; // Bhagyank
  day: number; month: number; year: number;
}

/** Drop the digits of an ISO (yyyy-mm-dd) date into the grid. */
export function buildLoshuChart(iso: string): LoshuChart {
  const [y, m, d] = iso.split('-').map(Number);
  const counts: Record<number, number> = {};
  let sum = 0;
  for (const ch of `${d}${m}${y}`) {
    const v = Number(ch);
    sum += v;
    if (v >= 1 && v <= 9) counts[v] = (counts[v] || 0) + 1;
  }
  return { counts, driver: reduceTo9(d), conductor: reduceTo9(sum), day: d, month: m, year: y };
}

/**
 * The "complete" grid: birth-date digit counts plus the Mulank (Driver),
 * Bhagyank (Conductor) and Kua number. A cell that's otherwise empty is
 * marked present (count 1) if it hosts one of these three — they're real
 * energies of the chart even when the raw date digits don't include them.
 * An already-repeated cell is left untouched (this fills gaps, it doesn't
 * inflate repetition counts used for the "Amplified Energies" reading).
 */
export function effectiveCounts(
  counts: Record<number, number>,
  driver?: number | null,
  conductor?: number | null,
  kua?: number | null,
): Record<number, number> {
  const eff = { ...counts };
  for (const n of [driver, conductor, kua]) {
    if (n != null && !(eff[n] > 0)) eff[n] = 1;
  }
  return eff;
}

/** Gentle, practical suggestions for working with a missing number's energy. */
export const MISSING_REMEDIES: Record<number, string> = {
  1: 'Spend a few quiet minutes in morning sunlight. Wear warm gold or orange, and practise small, honest acts of leadership and self-expression.',
  2: 'Keep a short dream or feelings journal. Wear soft white or pearl tones, and give a little more time to your closest relationships.',
  3: 'Read, write or teach something you love each week. Wear yellow or gold, and keep a simple gratitude practice.',
  4: 'Build one small daily routine and keep it. Declutter a space regularly — grounding, structure-building habits suit this energy best.',
  5: 'Practise a few minutes of mindful breathing or pranayama daily. Wear green, and choose honest conversation over silence.',
  6: 'Spend time around beauty and creativity — music, art, a tidy home. Wear soft pastels, and let yourself receive care as well as give it.',
  7: 'Sit in silence for a few minutes daily, or spend time in nature. A simple meditation or Trataka gazing practice suits this energy well.',
  8: 'Take on one long-term responsibility and see it through. Wear dark blue or black, and practise patience with process, not just outcome.',
  9: 'Move the body — walk, exercise, or a martial practice. Wear red, and channel raw energy toward one clear, worthy goal.',
};
