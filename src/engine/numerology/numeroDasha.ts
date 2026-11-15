/**
 * The dasha periods of Indian numerology: Maha Dasha (several years), Antar Dasha (one year,
 * birthday to birthday) and Pratyantar Dasha (weeks). Teachers read the Lo Shu grid again with the
 * numbers of the running periods added, to see which lines are complete for the time being.
 *
 * This is numerology's own scheme, built from the date of birth. It is not the Vimshottari dasha
 * of astrology, which starts from the Moon's nakshatra (see src/engine/dasha.ts).
 *
 * The method, as it is commonly taught:
 * - Maha Dasha starts at birth with the Driver (Mulank). Each number runs for as many years as
 *   the number itself, and the numbers follow in order, 9 being followed by 1.
 * - Antar Dasha for a year is birth day + birth month + the last two digits of the year the
 *   birthday falls in + the number of that birthday's weekday, added down to one digit. Weekday
 *   numbers are the planets': Sunday 1, Monday 2, Tuesday 9, Wednesday 5, Thursday 3, Friday 6,
 *   Saturday 8.
 * - Pratyantar Dasha divides the year into nine parts starting with the Antar Dasha number;
 *   number n lasts 8 × n days, with the longer ones a day over so the nine fill 365 days.
 *
 * Each rule teachers differ on is one field of DashaConfig. Dates are plain numbers and the
 * weekday is worked out arithmetically, so nothing depends on the visitor's time zone.
 */
import { compareYMD, daysInMonth, isValidYMD, rootOf, type CalcStep, type Digit, type YMD } from './core';
import { analyseGrid, type GridAnalysis, type LineId, type LoShuResult } from './loshu';

export interface DashaConfig {
  id: string;
  /** Year digits in the Antar Dasha sum: the last two (2026 counts as 26) or all four. */
  yearDigits: 'last-two' | 'full';
  /** Where the year turns for someone born on 29 February, in a year without one. */
  leapBirthday: 'feb-28' | 'mar-1';
  /** Pratyantar lengths: 8 days per number adjusted to fill 365 days, or exactly 8 per number (360). */
  pratyantarDays: 'fill-365' | 'eight-per-number';
}

export const DASHA_INDIAN_STANDARD: DashaConfig = {
  id: 'indian-standard', yearDigits: 'last-two', leapBirthday: 'feb-28', pratyantarDays: 'fill-365',
};

/** The number of each weekday's planet, Sunday first. */
export const WEEKDAY_NUMBER: readonly Digit[] = [1, 2, 9, 5, 3, 6, 8];
export const WEEKDAY_NAME: readonly string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PRATYANTAR_DAYS: Readonly<Record<DashaConfig['pratyantarDays'], readonly number[]>> = {
  // Index 0 is unused; numbers 1 to 9.
  'fill-365': [0, 8, 16, 24, 32, 41, 49, 57, 65, 73],
  'eight-per-number': [0, 8, 16, 24, 32, 40, 48, 56, 64, 72],
};

/** Days since a fixed origin (the Julian day number at noon), for date arithmetic without Date. */
export function dayNumber({ y, m, d }: YMD): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function fromDayNumber(jdn: number): YMD {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return { d: e - Math.floor((153 * m + 2) / 5) + 1, m: m + 3 - 12 * Math.floor(m / 10), y: 100 * b + d - 4800 + Math.floor(m / 10) };
}

export const addDays = (date: YMD, days: number): YMD => fromDayNumber(dayNumber(date) + days);

/** 0 for Sunday to 6 for Saturday. */
export const weekdayOf = (date: YMD): number => (dayNumber(date) + 1) % 7;

function requireDate(date: YMD): void {
  if (!isValidYMD(date.y, date.m, date.d)) throw new RangeError(`Not a calendar date: ${date.y}-${date.m}-${date.d}`);
}

/** The day the dasha year turns in a given calendar year: the birthday, moved for 29 February when needed. */
export function birthdayIn(birth: YMD, year: number, config: DashaConfig = DASHA_INDIAN_STANDARD): YMD {
  if (birth.m === 2 && birth.d === 29 && daysInMonth(year, 2) === 28) {
    return config.leapBirthday === 'feb-28' ? { y: year, m: 2, d: 28 } : { y: year, m: 3, d: 1 };
  }
  return { y: year, m: birth.m, d: birth.d };
}

export interface MahaDasha {
  number: Digit;
  /** Age at the birthday it begins and the birthday it ends. */
  fromAge: number; toAge: number;
  /** First day, and the day the next one begins. */
  from: YMD; until: YMD;
}

/** Every Maha Dasha from birth until at least the given age. */
export function mahaDashas(birth: YMD, untilAge = 100, config: DashaConfig = DASHA_INDIAN_STANDARD): MahaDasha[] {
  requireDate(birth);
  const list: MahaDasha[] = [];
  let number = rootOf(birth.d);
  let age = 0;
  while (age < untilAge) {
    const toAge = age + number;
    list.push({
      number, fromAge: age, toAge,
      from: age === 0 ? birth : birthdayIn(birth, birth.y + age, config),
      until: birthdayIn(birth, birth.y + toAge, config),
    });
    age = toAge;
    number = (number % 9 + 1) as Digit;
  }
  return list;
}

export interface AntarDasha {
  number: Digit;
  /** The calendar year in which this dasha year begins. */
  year: number;
  /** The birthday it begins on, and the birthday the next one begins on. */
  from: YMD; until: YMD;
  /** 0 Sunday to 6 Saturday: the weekday of `from`. */
  weekday: number;
  /** The four numbers that are added: day, month, year digits and weekday number. */
  parts: { day: number; month: number; year: number; weekday: Digit };
  total: number;
}

/** The Antar Dasha that begins on the birthday in the given calendar year. */
export function antarDasha(birth: YMD, year: number, config: DashaConfig = DASHA_INDIAN_STANDARD): AntarDasha {
  requireDate(birth);
  const from = birthdayIn(birth, year, config);
  const weekday = weekdayOf(from);
  const parts = { day: birth.d, month: birth.m, year: config.yearDigits === 'last-two' ? year % 100 : year, weekday: WEEKDAY_NUMBER[weekday] };
  const total = parts.day + parts.month + parts.year + parts.weekday;
  return { number: rootOf(total), year, from, until: birthdayIn(birth, year + 1, config), weekday, parts, total };
}

export interface PratyantarDasha { number: Digit; from: YMD; until: YMD; days: number }

/** The nine Pratyantar Dashas of one Antar Dasha year; the last one runs up to the next birthday. */
export function pratyantarDashas(antar: AntarDasha, config: DashaConfig = DASHA_INDIAN_STANDARD): PratyantarDasha[] {
  const lengths = PRATYANTAR_DAYS[config.pratyantarDays];
  const end = dayNumber(antar.until);
  const list: PratyantarDasha[] = [];
  let start = dayNumber(antar.from);
  let number = antar.number;
  for (let i = 0; i < 9; i++) {
    const stop = i === 8 ? end : Math.min(start + lengths[number], end);
    list.push({ number, from: fromDayNumber(start), until: fromDayNumber(stop), days: stop - start });
    start = stop;
    number = (number % 9 + 1) as Digit;
  }
  return list;
}

export interface DashaNow {
  on: YMD;
  maha: MahaDasha;
  antar: AntarDasha;
  pratyantar: PratyantarDasha;
  /** All nine Pratyantar Dashas of the running year. */
  pratyantars: PratyantarDasha[];
  steps: CalcStep[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const show = ({ y, m, d }: YMD) => `${d} ${MONTHS[m - 1]} ${y}`;

/** The three periods running on a given day. Throws for a day before the birth. */
export function dashaOn(birth: YMD, on: YMD, config: DashaConfig = DASHA_INDIAN_STANDARD): DashaNow {
  requireDate(birth);
  requireDate(on);
  if (compareYMD(on, birth) < 0) throw new RangeError('dashaOn: the day is before the date of birth');

  const turnsThisYear = birthdayIn(birth, on.y, config);
  const year = compareYMD(on, turnsThisYear) >= 0 ? on.y : on.y - 1;
  // In the year of birth the first dasha year starts on the day of birth itself.
  const antar = antarDasha(birth, Math.max(year, birth.y), config);
  const age = antar.year - birth.y;
  const maha = mahaDashas(birth, age + 1, config).find((p) => age >= p.fromAge && age < p.toAge)!;
  const pratyantars = pratyantarDashas(antar, config);
  const today = dayNumber(on);
  const pratyantar = pratyantars.find((p) => today >= dayNumber(p.from) && today < dayNumber(p.until)) ?? pratyantars[pratyantars.length - 1];

  const p = antar.parts;
  const steps: CalcStep[] = [
    {
      key: 'maha', label: 'Maha Dasha',
      working: `It starts at birth with the Driver ${rootOf(birth.d)}, each number runs for as many years as the number, and the numbers follow in order. At age ${age} that gives ${maha.number}, from age ${maha.fromAge} to ${maha.toAge}.`,
      result: String(maha.number),
    },
    {
      key: 'antar', label: 'Antar Dasha',
      working: `Birth day ${p.day} + birth month ${p.month} + ${config.yearDigits === 'last-two' ? `${String(p.year).padStart(2, '0')}, the last two digits of ${antar.year}` : `the year ${p.year}`} + ${p.weekday} for ${WEEKDAY_NAME[antar.weekday]}, the weekday of ${show(antar.from)}, = ${antar.total}, added down to ${antar.number}. It runs until the next birthday.`,
      result: String(antar.number),
    },
    {
      key: 'pratyantar', label: 'Pratyantar Dasha',
      working: `The year is divided into nine parts starting with the Antar Dasha number ${antar.number}; number n lasts about 8 × n days. On ${show(on)} the part running is ${pratyantar.number}, from ${show(pratyantar.from)}.`,
      result: String(pratyantar.number),
    },
  ];
  return { on, maha, antar, pratyantar, pratyantars, steps };
}

export interface DashaGrid {
  /** The numbers added to the birth grid for the period. */
  added: Digit[];
  /** The grid with those numbers added. */
  grid: GridAnalysis;
  /** Lines that are complete only while these numbers are added. */
  newlyComplete: LineId[];
}

/** A person's full Lo Shu grid with the numbers of running periods added, as teachers read a year. */
export function dashaGrid(natal: LoShuResult, added: Digit[]): DashaGrid {
  const counts = { ...natal.full.counts };
  for (const d of added) counts[d] += 1;
  const grid = analyseGrid(counts);
  const before = new Set(natal.full.lines.filter((l) => l.status === 'full').map((l) => l.id));
  return { added, grid, newlyComplete: grid.lines.filter((l) => l.status === 'full' && !before.has(l.id)).map((l) => l.id) };
}

export interface DashaYear {
  antar: AntarDasha;
  /** The Maha Dasha running at that birthday. */
  maha: MahaDasha;
  /** The grid with both numbers added, and the lines that completes. */
  grid: DashaGrid;
}

/** One row per dasha year, starting with the year that begins on the birthday in `fromYear`. */
export function dashaYears(natal: LoShuResult, fromYear: number, count: number, config: DashaConfig = DASHA_INDIAN_STANDARD): DashaYear[] {
  const birth = natal.date;
  const first = Math.max(fromYear, birth.y);
  const mahas = mahaDashas(birth, first - birth.y + count + 1, config);
  return Array.from({ length: count }, (_, i) => {
    const antar = antarDasha(birth, first + i, config);
    const age = antar.year - birth.y;
    const maha = mahas.find((p) => age >= p.fromAge && age < p.toAge)!;
    return { antar, maha, grid: dashaGrid(natal, [maha.number, antar.number]) };
  });
}
