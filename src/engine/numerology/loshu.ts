/**
 * Lo Shu grid, Driver (Mulank), Conductor (Bhagyank) and Kua number.
 *
 * Teachers disagree on several rules. Each disputed rule is one field of LoShuConfig, and the
 * site uses a single named preset, so changing school is a one-line edit that the tests then
 * confirm cell by cell.
 */
import {
  DIGITS, digitSum, formatYMD, isValidYMD, reduce, rootOf, showReduction,
  type CalcStep, type Digit, type Gender, type YMD,
} from './core';
import { pairRelation, type PairRelation } from './relations';

export interface LoShuConfig {
  id: string;
  /** Year digits written into the grid. The Conductor always uses the whole date. */
  yearDigits: 'full' | 'last-two';
  /**
   * Whether the Driver is written into the grid as an extra number. The common Indian rule skips
   * it when the birth day is 1–9, 10, 20 or 30, because that day already is the Driver digit.
   */
  driverInGrid: 'skip-single-and-round-days' | 'always' | 'never';
  conductorInGrid: 'always' | 'never';
  kuaInGrid: 'always' | 'never';
  /** A Kua of 5 has no direction of its own; Eight Mansions reads it as 2 (male) or 8 (female). */
  kuaFive: 'remap' | 'keep';
  /** The year used for Kua: the calendar year, or the Chinese solar year that starts on 4 February. */
  kuaYear: 'calendar' | 'solar-feb4';
}

/** The method widely taught in India: date digits plus Driver, Conductor and Kua in the grid. */
export const LOSHU_INDIAN_STANDARD: LoShuConfig = {
  id: 'indian-standard',
  yearDigits: 'full',
  driverInGrid: 'skip-single-and-round-days',
  conductorInGrid: 'always',
  kuaInGrid: 'always',
  kuaFive: 'remap',
  kuaYear: 'calendar',
};

/** The fixed square, rows top to bottom. Every row, column and diagonal adds up to 15. */
export const LOSHU_LAYOUT: readonly (readonly Digit[])[] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export type LineId = 'mental' | 'emotional' | 'practical' | 'thought' | 'will' | 'action' | 'golden' | 'silver';
export interface LineDef { id: LineId; cells: readonly [Digit, Digit, Digit]; kind: 'row' | 'column' | 'diagonal' }

/** The eight lines of the square: three rows, three columns and two diagonals. */
export const LOSHU_LINES: readonly LineDef[] = [
  { id: 'mental', cells: [4, 9, 2], kind: 'row' },
  { id: 'emotional', cells: [3, 5, 7], kind: 'row' },
  { id: 'practical', cells: [8, 1, 6], kind: 'row' },
  { id: 'thought', cells: [4, 3, 8], kind: 'column' },
  { id: 'will', cells: [9, 5, 1], kind: 'column' },
  { id: 'action', cells: [2, 7, 6], kind: 'column' },
  { id: 'golden', cells: [4, 5, 6], kind: 'diagonal' },
  { id: 'silver', cells: [2, 5, 8], kind: 'diagonal' },
];

/** How much of a line is present: all three numbers, two, one or none. */
export type LineStatus = 'full' | 'partial' | 'single' | 'empty';
export interface LineResult extends LineDef { present: Digit[]; absent: Digit[]; status: LineStatus }

/** How many times each number 1–9 appears; every key is present, 0 when the number is missing. */
export type Counts = Readonly<Record<Digit, number>>;

export interface GridAnalysis {
  counts: Counts;
  missing: Digit[];
  repeated: { digit: Digit; count: number }[];
  lines: LineResult[];
}

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type KuaMansion = Exclude<Digit, 5>;

export interface KuaResult {
  /** The year the formula used (the previous year under the solar-year rule for early births). */
  year: number;
  /** The year's digits added down to one digit. */
  yearRoot: Digit;
  /** The formula's result before any remapping; may be 5. */
  raw: Digit;
  /** The Eight Mansions number: a raw 5 becomes 2 for a man and 8 for a woman. */
  mansion: KuaMansion;
  /** The digit written into the Lo Shu grid under the chosen config. */
  inGrid: Digit;
  group: 'east' | 'west';
  trigram: string;
  element: string;
  /** The four favourable directions of Eight Mansions. */
  directions: { shengQi: Direction; tianYi: Direction; yanNian: Direction; fuWei: Direction };
  /**
   * For births from 1 January to 3 February under the calendar-year rule: the result the
   * Chinese solar year would give instead, so the page can mention it.
   */
  solarYearAlternative: { year: number; raw: Digit; mansion: KuaMansion } | null;
}

export interface LoShuResult {
  date: YMD;
  gender: Gender | null;
  config: LoShuConfig;
  /** Mulank: the birth day added down to one digit. */
  driver: Digit;
  /** Bhagyank: the whole date added down to one digit. */
  conductor: Digit;
  /** Null when no gender was given. */
  kua: KuaResult | null;
  /** True when the Driver was written into the grid as an extra number. */
  driverAdded: boolean;
  /** Where each number in the full grid came from. */
  sources: Readonly<Record<Digit, { birth: number; driver: 0 | 1; conductor: 0 | 1; kua: 0 | 1 }>>;
  /** The grid from the date digits alone. */
  birth: GridAnalysis;
  /** The grid with Driver, Conductor and Kua added as the config directs. */
  full: GridAnalysis;
  /** How the Driver's planet and the Conductor's planet regard each other. */
  relation: PairRelation;
  steps: CalcStep[];
}

const EIGHT_MANSIONS: Readonly<Record<KuaMansion, Pick<KuaResult, 'group' | 'trigram' | 'element' | 'directions'>>> = {
  1: { group: 'east', trigram: 'Kan', element: 'Water', directions: { shengQi: 'SE', tianYi: 'E', yanNian: 'S', fuWei: 'N' } },
  2: { group: 'west', trigram: 'Kun', element: 'Earth', directions: { shengQi: 'NE', tianYi: 'W', yanNian: 'NW', fuWei: 'SW' } },
  3: { group: 'east', trigram: 'Zhen', element: 'Wood', directions: { shengQi: 'S', tianYi: 'N', yanNian: 'SE', fuWei: 'E' } },
  4: { group: 'east', trigram: 'Xun', element: 'Wood', directions: { shengQi: 'N', tianYi: 'S', yanNian: 'E', fuWei: 'SE' } },
  6: { group: 'west', trigram: 'Qian', element: 'Metal', directions: { shengQi: 'W', tianYi: 'NE', yanNian: 'SW', fuWei: 'NW' } },
  7: { group: 'west', trigram: 'Dui', element: 'Metal', directions: { shengQi: 'NW', tianYi: 'SW', yanNian: 'NE', fuWei: 'W' } },
  8: { group: 'west', trigram: 'Gen', element: 'Earth', directions: { shengQi: 'SW', tianYi: 'NW', yanNian: 'W', fuWei: 'NE' } },
  9: { group: 'east', trigram: 'Li', element: 'Fire', directions: { shengQi: 'E', tianYi: 'SE', yanNian: 'N', fuWei: 'S' } },
};

function requireDate(date: YMD): void {
  if (!isValidYMD(date.y, date.m, date.d)) throw new RangeError(`Not a calendar date: ${date.y}-${date.m}-${date.d}`);
}

const rawKua = (year: number, gender: Gender): Digit => {
  const yearRoot = rootOf(digitSum(year));
  return gender === 'male' ? rootOf(11 - yearRoot) : rootOf(4 + yearRoot);
};
const mansionOf = (raw: Digit, gender: Gender): KuaMansion => (raw === 5 ? (gender === 'male' ? 2 : 8) : raw);
/** Born before the Chinese solar year turns on 4 February. */
const beforeSolarNewYear = (date: YMD) => date.m === 1 || (date.m === 2 && date.d < 4);

/**
 * Kua number: add the year's digits down to one digit, then 11 minus that for a man or 4 plus
 * that for a woman, added down again. This gives the same result as the "last two digits" rules
 * quoted for before and after the year 2000.
 */
export function kua(date: YMD, gender: Gender, config: LoShuConfig = LOSHU_INDIAN_STANDARD): KuaResult {
  requireDate(date);
  const early = beforeSolarNewYear(date);
  const year = config.kuaYear === 'solar-feb4' && early ? date.y - 1 : date.y;
  const raw = rawKua(year, gender);
  const mansion = mansionOf(raw, gender);
  let solarYearAlternative: KuaResult['solarYearAlternative'] = null;
  if (config.kuaYear === 'calendar' && early) {
    const altRaw = rawKua(date.y - 1, gender);
    solarYearAlternative = { year: date.y - 1, raw: altRaw, mansion: mansionOf(altRaw, gender) };
  }
  return {
    year, yearRoot: rootOf(digitSum(year)), raw, mansion,
    inGrid: config.kuaFive === 'remap' ? mansion : raw,
    ...EIGHT_MANSIONS[mansion],
    solarYearAlternative,
  };
}

function emptyCounts(): Record<Digit, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

/** Missing and repeated numbers and the state of the eight lines, for one set of counts. */
export function analyseGrid(counts: Counts): GridAnalysis {
  return {
    counts,
    missing: DIGITS.filter((d) => counts[d] === 0),
    repeated: DIGITS.filter((d) => counts[d] >= 2).map((digit) => ({ digit, count: counts[digit] })),
    lines: LOSHU_LINES.map((line) => {
      const present = line.cells.filter((c) => counts[c] > 0);
      const absent = line.cells.filter((c) => counts[c] === 0);
      const status: LineStatus = present.length === 3 ? 'full' : present.length === 2 ? 'partial' : present.length === 1 ? 'single' : 'empty';
      return { ...line, present, absent, status };
    }),
  };
}

/** The non-zero digits of the date that go into the grid, in the order they are written. */
export function gridDigits(date: YMD, config: LoShuConfig = LOSHU_INDIAN_STANDARD): Digit[] {
  const year = config.yearDigits === 'full' ? String(date.y) : String(date.y % 100);
  return `${date.d}${date.m}${year}`.split('').map(Number).filter((n) => n >= 1 && n <= 9) as Digit[];
}

export function loShu(date: YMD, gender: Gender | null, config: LoShuConfig = LOSHU_INDIAN_STANDARD): LoShuResult {
  requireDate(date);

  const dayReduction = reduce(date.d);
  const driver = rootOf(date.d);
  const allDigits = `${date.d}${date.m}${date.y}`.split('').map(Number);
  const dateTotal = allDigits.reduce((a, b) => a + b, 0);
  const totalReduction = reduce(dateTotal);
  const conductor = rootOf(dateTotal);
  const kuaResult = gender ? kua(date, gender, config) : null;

  const birthCounts = emptyCounts();
  const written = gridDigits(date, config);
  for (const d of written) birthCounts[d] += 1;

  const driverAdded = config.driverInGrid === 'always'
    || (config.driverInGrid === 'skip-single-and-round-days' && date.d >= 10 && date.d % 10 !== 0);
  const conductorAdded = config.conductorInGrid === 'always';
  const kuaAdded = !!kuaResult && config.kuaInGrid === 'always';

  const fullCounts = { ...birthCounts };
  if (driverAdded) fullCounts[driver] += 1;
  if (conductorAdded) fullCounts[conductor] += 1;
  if (kuaAdded && kuaResult) fullCounts[kuaResult.inGrid] += 1;

  const sources = Object.fromEntries(DIGITS.map((d) => [d, {
    birth: birthCounts[d],
    driver: driverAdded && driver === d ? 1 : 0,
    conductor: conductorAdded && conductor === d ? 1 : 0,
    kua: kuaAdded && kuaResult?.inGrid === d ? 1 : 0,
  }])) as LoShuResult['sources'];

  const steps: CalcStep[] = [
    {
      key: 'digits', label: 'Date digits',
      working: `${formatYMD(date)} is written ${date.d}-${date.m}-${config.yearDigits === 'full' ? date.y : String(date.y % 100).padStart(2, '0')}. Zeros have no cell, so they are left out.`,
      result: written.join(', '),
    },
    {
      key: 'driver', label: 'Driver (Mulank)',
      working: dayReduction.trail.length > 1 ? `Birth day ${date.d}: ${showReduction(dayReduction)}.` : `Birth day ${date.d} is already a single digit.`,
      result: String(driver),
    },
    {
      key: 'conductor', label: 'Conductor (Bhagyank)',
      working: `${allDigits.join(' + ')} = ${dateTotal}${totalReduction.trail.length > 1 ? `, then ${showReduction(totalReduction)}` : ''}.`,
      result: String(conductor),
    },
  ];
  if (kuaResult && gender) {
    const yearDigits = String(kuaResult.year).split('').join(' + ');
    const yearSum = digitSum(kuaResult.year);
    const yearRed = reduce(yearSum);
    const base = gender === 'male' ? 11 - kuaResult.yearRoot : 4 + kuaResult.yearRoot;
    const baseRed = reduce(base);
    steps.push({
      key: 'kua', label: 'Kua number',
      working: `Year ${kuaResult.year}: ${yearDigits} = ${yearSum}${yearRed.trail.length > 1 ? `, then ${showReduction(yearRed)}` : ''}. `
        + (gender === 'male' ? `For a man, 11 − ${kuaResult.yearRoot} = ${base}` : `For a woman, 4 + ${kuaResult.yearRoot} = ${base}`)
        + (baseRed.trail.length > 1 ? `, then ${showReduction(baseRed)}` : '')
        + (kuaResult.raw === 5 ? `. A Kua of 5 has no direction of its own, so it is read as ${kuaResult.mansion}.` : '.'),
      result: String(kuaResult.mansion),
    });
  }
  const added: string[] = [];
  if (conductorAdded) added.push(`the Conductor ${conductor}`);
  if (driverAdded) added.unshift(`the Driver ${driver}`);
  if (kuaAdded && kuaResult) added.push(`the Kua ${kuaResult.inGrid}`);
  if (added.length || config.driverInGrid === 'skip-single-and-round-days') {
    const list = added.length > 1 ? `${added.slice(0, -1).join(', ')} and ${added[added.length - 1]}` : added[0] ?? 'nothing';
    steps.push({
      key: 'added', label: 'Added to the grid',
      working: `Besides the date digits, the grid also takes ${list}.`
        + (!driverAdded && config.driverInGrid === 'skip-single-and-round-days'
          ? ` The Driver is not written a second time, because the birth day ${date.d} already puts ${driver} in the grid.` : ''),
      result: DIGITS.filter((d) => fullCounts[d] > 0).map((d) => (fullCounts[d] > 1 ? `${d} ×${fullCounts[d]}` : String(d))).join(', '),
    });
  }

  return {
    date, gender, config, driver, conductor, kua: kuaResult, driverAdded, sources,
    birth: analyseGrid(birthCounts), full: analyseGrid(fullCounts),
    relation: pairRelation(driver, conductor), steps,
  };
}
