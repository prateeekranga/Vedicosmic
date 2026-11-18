/**
 * Marriage years by the Vivah Mulank, a lineage teaching passed to VediCosmic's founder by a
 * spiritual guru. It is used here exactly as taught:
 *
 * 1. Mulank Maha = Mulank + the month of birth (1 for January … 12 for December), added down to one
 *    digit when it reaches 10 or more.
 * 2. For a calendar year, Vivah Mulank = the year + the Mulank Maha, added down to one digit.
 *    Born 1 January 2001: Mulank 1, Mulank Maha 1 + 1 = 2; for 2027, 2027 + 2 = 2029, 2 + 0 + 2 + 9 = 13,
 *    1 + 3 = 4.
 * 3. The year favours marriage when its Vivah Mulank is in the Mulank's row of VIVAH_MATCH. Mulank 1
 *    takes 1, 4, 5, 7 and 9, so 2027 (Vivah Mulank 4) is a marriage year for that person.
 *
 * Adding the Mulank Maha before or after adding the year's digits gives the same final digit, so
 * the working shown is the plain sum the teaching uses.
 */
import { reduce, rootOf, showReduction, type CalcStep, type Digit, type YMD } from './core';

/** VIVAH_MATCH[mulank]: the Vivah Mulanks of the years that favour marriage, as taught. */
export const VIVAH_MATCH: Readonly<Record<Digit, readonly Digit[]>> = {
  1: [1, 4, 5, 7, 9],
  2: [1, 2, 5, 6, 8],
  3: [3, 6, 7, 9],
  4: [1, 2, 4, 7, 8],
  5: [2, 3, 5, 7, 9],
  6: [1, 2, 3, 5, 6, 9],
  7: [1, 2, 4, 8],
  8: [1, 2, 4, 6, 8],
  9: [1, 2, 3, 6, 7],
};

/** The list of years starts at this age, or at the current year when that is later. */
export const MARRIAGE_FROM_AGE = 18;
/** How many years the list shows. */
export const MARRIAGE_YEARS_SHOWN = 12;

export interface MulankMaha {
  mulank: Digit;
  month: number;
  /** Mulank + month, before it is added down. */
  sum: number;
  value: Digit;
  working: string;
}

export function mulankMaha(date: YMD): MulankMaha {
  const mulank = rootOf(date.d);
  const sum = mulank + date.m;
  const value = rootOf(sum);
  const working = sum > 9
    ? `Mulank ${mulank} + month ${date.m} = ${sum}, then ${showReduction(reduce(sum))}`
    : `Mulank ${mulank} + month ${date.m} = ${sum}`;
  return { mulank, month: date.m, sum, value, working };
}

export interface VivahYear {
  year: number;
  /** The age reached on the birthday in that year. */
  age: number;
  /** The year plus the Mulank Maha. */
  total: number;
  vivah: Digit;
  /** The year favours marriage by the table. */
  match: boolean;
  working: string;
}

export function vivahYear(date: YMD, year: number): VivahYear {
  const maha = mulankMaha(date);
  const total = year + maha.value;
  const vivah = rootOf(total);
  return {
    year, age: year - date.y, total, vivah,
    match: VIVAH_MATCH[maha.mulank].includes(vivah),
    working: `${year} + ${maha.value} = ${total}, then ${showReduction(reduce(total))}`,
  };
}

/** The first year of the list: the current year, or the year of the 18th birthday when that is later. */
export const marriageListStart = (date: YMD, currentYear: number): number => Math.max(currentYear, date.y + MARRIAGE_FROM_AGE);

export function marriageYears(date: YMD, fromYear: number, count = MARRIAGE_YEARS_SHOWN): VivahYear[] {
  return Array.from({ length: count }, (_, i) => vivahYear(date, fromYear + i));
}

export function marriageSteps(date: YMD, example: VivahYear | undefined): CalcStep[] {
  const maha = mulankMaha(date);
  const steps: CalcStep[] = [
    { key: 'maha', label: 'Mulank Maha', working: `${maha.working}.`, result: String(maha.value) },
  ];
  if (example) {
    steps.push({
      key: 'vivah', label: `Vivah Mulank for ${example.year}`,
      working: `${example.working}. Mulank ${maha.mulank} takes ${VIVAH_MATCH[maha.mulank].join(', ')}, so ${example.year} ${example.match ? 'is' : 'is not'} a marriage year by this method.`,
      result: String(example.vivah),
    });
  }
  return steps;
}
