/**
 * Divisions of the day from sunrise, sunset and the next sunrise: Rahu Kaal, Yamaganda,
 * Gulika Kaal, Abhijit and Brahma muhurta, Choghadiya and planetary hours (horas).
 * Pure: no UI imports.
 */

export interface Window { start: number; end: number }

const MINUTE = 60000;

// 1-based eighth of the daytime that each period occupies, by weekday (0 = Sunday).
const RAHU = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA = [5, 4, 3, 2, 1, 7, 6];
const GULIKA = [7, 6, 5, 4, 3, 2, 1];

function eighth(sunrise: number, sunset: number, part: number): Window {
  const len = (sunset - sunrise) / 8;
  return { start: sunrise + (part - 1) * len, end: sunrise + part * len };
}

export const rahuKaal = (sunrise: number, sunset: number, vara: number) => eighth(sunrise, sunset, RAHU[vara]);
export const yamaganda = (sunrise: number, sunset: number, vara: number) => eighth(sunrise, sunset, YAMAGANDA[vara]);
export const gulikaKaal = (sunrise: number, sunset: number, vara: number) => eighth(sunrise, sunset, GULIKA[vara]);

/** The 8th of the 15 daytime muhurtas, around local noon. Traditionally not used on Wednesdays. */
export function abhijit(sunrise: number, sunset: number): Window {
  const muhurta = (sunset - sunrise) / 15;
  return { start: sunrise + 7 * muhurta, end: sunrise + 8 * muhurta };
}

/** 96 to 48 minutes before sunrise. */
export const brahmaMuhurta = (sunrise: number): Window => ({ start: sunrise - 96 * MINUTE, end: sunrise - 48 * MINUTE });

export type ChoghadiyaName = 'Udveg' | 'Char' | 'Labh' | 'Amrit' | 'Kaal' | 'Shubh' | 'Rog';

export const CHOGHADIYA_QUALITY: Record<ChoghadiyaName, 'good' | 'neutral' | 'bad'> = {
  Amrit: 'good', Shubh: 'good', Labh: 'good', Char: 'neutral', Udveg: 'bad', Kaal: 'bad', Rog: 'bad',
};

const DAY_CYCLE: ChoghadiyaName[] = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];
const NIGHT_CYCLE: ChoghadiyaName[] = ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'];
// First daytime choghadiya by weekday (the weekday lord's): Sun Udveg, Mon Amrit, Tue Rog, …
const DAY_START = [0, 3, 6, 2, 5, 1, 4];

export interface Choghadiya extends Window { name: ChoghadiyaName; night: boolean }

export function choghadiya(sunrise: number, sunset: number, nextSunrise: number, vara: number): Choghadiya[] {
  const out: Choghadiya[] = [];
  const day = (sunset - sunrise) / 8;
  const night = (nextSunrise - sunset) / 8;
  const dayStart = DAY_START[vara];
  const nightStart = NIGHT_CYCLE.indexOf(DAY_CYCLE[(dayStart + 5) % 7]);
  for (let i = 0; i < 8; i++) {
    out.push({ name: DAY_CYCLE[(dayStart + i) % 7], night: false, start: sunrise + i * day, end: sunrise + (i + 1) * day });
  }
  for (let i = 0; i < 8; i++) {
    out.push({ name: NIGHT_CYCLE[(nightStart + i) % 7], night: true, start: sunset + i * night, end: sunset + (i + 1) * night });
  }
  return out;
}

/** Chaldean order, from which each hour's lord follows the previous one. */
export const HORA_PLANETS = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'] as const;
export type HoraPlanet = (typeof HORA_PLANETS)[number];
const WEEKDAY_LORD: HoraPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export interface Hora extends Window { index: number; planet: HoraPlanet; night: boolean }

/** 12 daytime and 12 night-time hours from sunrise; the first is ruled by the weekday's lord. */
export function horas(sunrise: number, sunset: number, nextSunrise: number, vara: number): Hora[] {
  const first = HORA_PLANETS.indexOf(WEEKDAY_LORD[vara]);
  const day = (sunset - sunrise) / 12;
  const night = (nextSunrise - sunset) / 12;
  return Array.from({ length: 24 }, (_, i) => {
    const isNight = i >= 12;
    const start = isNight ? sunset + (i - 12) * night : sunrise + i * day;
    return { index: i, planet: HORA_PLANETS[(first + i) % 7], night: isNight, start, end: start + (isNight ? night : day) };
  });
}
