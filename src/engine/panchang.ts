/**
 * Panchang for a local date at a place: vara, sunrise and sunset, and the tithi, nakshatra,
 * yoga and karana in force at sunrise with the times each one ends. The day runs from sunrise
 * to the next sunrise. Checked against independent JPL-based values in
 * tests/golden/panchang-reference.json. Pure: no UI imports.
 */
import { NAKSHATRAS, NAKSHATRA_SPAN, angleDiff, norm360 } from './core';
import { dateInZone, localToUtc } from './time';
import {
  newMoonAfter, newMoonBefore, nextMoonrise, nextMoonset, nextSunEvent, siderealLongitude, siderealOffset, sunMoonTropical,
} from './sky';

export interface Place {
  lat: number;
  lon: number;
  /** IANA time zone, e.g. "Asia/Kolkata". */
  zone: string;
}

const TITHI_BASE = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami',
  'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];

/** 0–14 Shukla Pratipada … Purnima, 15–29 Krishna Pratipada … Amavasya. */
export const TITHIS = [
  ...TITHI_BASE.map((n) => `Shukla ${n}`), 'Purnima',
  ...TITHI_BASE.map((n) => `Krishna ${n}`), 'Amavasya',
];

export const YOGAS = ['Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
  'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha',
  'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];

const MOVABLE_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

/** Karana for half-tithi 0–59: Kimstughna, eight cycles of the seven movable ones, then the three fixed. */
export function karanaName(index: number): string {
  if (index === 0) return 'Kimstughna';
  if (index >= 57) return ['Shakuni', 'Chatushpada', 'Naga'][index - 57];
  return MOVABLE_KARANAS[(index - 1) % 7];
}

export const VARAS = ['Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara'];

type Element = 'tithi' | 'karana' | 'nakshatra' | 'yoga';

const STEP: Record<Element, number> = { tithi: 12, karana: 6, nakshatra: NAKSHATRA_SPAN, yoga: NAKSHATRA_SPAN };
const COUNT: Record<Element, number> = { tithi: 30, karana: 60, nakshatra: 27, yoga: 27 };

/** The angle whose 12°, 6° or 13°20′ steps define each element. All of them only ever increase. */
function angle(element: Element, utcMs: number): number {
  const { sun, moon } = sunMoonTropical(utcMs);
  if (element === 'tithi' || element === 'karana') return norm360(moon - sun);
  const off = siderealOffset(utcMs);
  return element === 'nakshatra' ? norm360(moon - off) : norm360(sun + moon - 2 * off);
}

export const elementIndex = (element: Element, utcMs: number) =>
  Math.floor(angle(element, utcMs) / STEP[element]) % COUNT[element];

/** First instant after `utcMs` at which the element's angle reaches `target` (Newton's method, < 1 s). */
function reach(element: Element, target: number, utcMs: number): number {
  let t = utcMs;
  for (let i = 0; i < 25; i++) {
    const a = angle(element, t);
    const rate = angleDiff(angle(element, t + 600000), a) / 600000; // degrees per ms
    const dt = angleDiff(target, a) / rate;
    t += dt;
    if (Math.abs(dt) < 500) break;
  }
  return t;
}

export interface Span {
  index: number;
  name: string;
  /** UTC ms at which this element ends. */
  ends: number;
}

function nameOf(element: Element, index: number): string {
  if (element === 'tithi') return TITHIS[index];
  if (element === 'nakshatra') return NAKSHATRAS[index];
  if (element === 'yoga') return YOGAS[index];
  return karanaName(index);
}

/** Every value the element takes from `fromMs` until after `untilMs`, with end times. */
export function elementSpans(element: Element, fromMs: number, untilMs: number): Span[] {
  const spans: Span[] = [];
  let index = elementIndex(element, fromMs);
  let t = fromMs;
  while (t < untilMs && spans.length < 8) {
    const ends = reach(element, ((index + 1) % COUNT[element]) * STEP[element], t);
    spans.push({ index, name: nameOf(element, index), ends });
    index = (index + 1) % COUNT[element];
    t = ends + 1000;
  }
  return spans;
}

export interface DayPanchang {
  date: string;
  /** 0 = Sunday. */
  vara: number;
  sunrise: number;
  sunset: number;
  nextSunrise: number;
  paksha: 'Shukla' | 'Krishna';
  /** Each list starts with the value in force at sunrise and runs past the next sunrise. */
  tithi: Span[];
  nakshatra: Span[];
  yoga: Span[];
  karana: Span[];
  /** 0 = new moon, 0.5 = full moon, at sunrise. */
  moonPhase: number;
}

/** Weekday of a YYYY-MM-DD calendar date (0 = Sunday), independent of any time zone. */
export const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

export interface SunTimes {
  date: string;
  vara: number;
  sunrise: number;
  sunset: number;
  nextSunrise: number;
}

/** Sunrise, sunset and the next sunrise for a local date, or null if the Sun does not rise and set. */
export function daySunTimes(date: string, place: Place): SunTimes | null {
  const midnight = localToUtc(date, '00:00', place.zone);
  const sunrise = nextSunEvent(midnight, place.lat, place.lon, true, 1);
  if (sunrise === null) return null;
  const sunset = nextSunEvent(sunrise, place.lat, place.lon, false, 1);
  const nextSunrise = nextSunEvent(sunrise + 3600000, place.lat, place.lon, true, 1.5);
  if (sunset === null || nextSunrise === null) return null;
  return { date, vara: weekdayOf(date), sunrise, sunset, nextSunrise };
}

/** Shifts a YYYY-MM-DD date by whole days. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Sun times of the panchang day (sunrise to sunrise) that contains `utcMs`: before today's
 * sunrise, that is still yesterday's day.
 */
export function sunTimesAt(utcMs: number, place: Place): SunTimes | null {
  const today = dateInZone(utcMs, place.zone);
  const times = daySunTimes(today, place);
  if (times && utcMs < times.sunrise) return daySunTimes(addDays(today, -1), place);
  return times;
}

/** Panchang for a local calendar date at a place, or null when the Sun does not rise there that day. */
export function dayPanchang(date: string, place: Place): DayPanchang | null {
  const times = daySunTimes(date, place);
  if (times === null) return null;
  const { sunrise, sunset, nextSunrise } = times;

  const tithi = elementSpans('tithi', sunrise, nextSunrise);
  const { sun, moon } = sunMoonTropical(sunrise);
  return {
    date, vara: weekdayOf(date), sunrise, sunset, nextSunrise,
    paksha: tithi[0].index < 15 ? 'Shukla' : 'Krishna',
    tithi,
    nakshatra: elementSpans('nakshatra', sunrise, nextSunrise),
    yoga: elementSpans('yoga', sunrise, nextSunrise),
    karana: elementSpans('karana', sunrise, nextSunrise),
    moonPhase: norm360(moon - sun) / 360,
  };
}

/** Tithi in force at an instant (for "right now" displays). */
export function tithiAt(utcMs: number): { index: number; name: string; paksha: 'Shukla' | 'Krishna' } {
  const index = elementIndex('tithi', utcMs);
  return { index, name: TITHIS[index], paksha: index < 15 ? 'Shukla' : 'Krishna' };
}

/** Tithi, Moon nakshatra and phase at an instant. These do not depend on the place. */
export function skyAt(utcMs: number) {
  const tithi = tithiAt(utcMs);
  const { sun, moon } = sunMoonTropical(utcMs);
  return {
    tithi,
    nakshatra: NAKSHATRAS[elementIndex('nakshatra', utcMs)],
    /** 0 = new moon, 0.5 = full moon. */
    moonPhase: norm360(moon - sun) / 360,
  };
}

export interface MoonTimes {
  /** UTC ms, or null when the Moon does not rise during the panchang day. */
  moonrise: number | null;
  /** UTC ms, or null when the Moon does not set during the panchang day. */
  moonset: number | null;
}

/**
 * Moonrise and moonset within a panchang day, which runs from sunrise to the next sunrise. The
 * Moon rises about fifty minutes later each day, so roughly once a month a day has no moonrise,
 * and another has no moonset.
 */
export function moonTimes(sunrise: number, nextSunrise: number, place: Place): MoonTimes {
  const days = (nextSunrise - sunrise) / 86400000;
  return {
    moonrise: nextMoonrise(sunrise, place.lat, place.lon, days),
    moonset: nextMoonset(sunrise, place.lat, place.lon, days),
  };
}

/** Lunar months in order; Chaitra is the month in which the Sun enters sidereal Mesha (Aries). */
export const LUNAR_MONTHS = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika',
  'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];

export interface MonthName {
  /** 0 = Chaitra … 11 = Phalguna. */
  index: number;
  name: string;
  /** An extra (intercalary) month: the Sun does not change sign during it. */
  adhika: boolean;
}

export interface LunarMonth {
  /** Month ending at the new moon: the reckoning of the south and west of India. */
  amanta: MonthName;
  /** Month ending at the full moon: the reckoning of the north. It differs in the dark fortnight. */
  purnimanta: MonthName;
  paksha: 'Shukla' | 'Krishna';
  /** The new moons that open and close the amanta month, UTC ms. */
  starts: number;
  ends: number;
  /**
   * True when the Sun is within a quarter of a degree of changing sign at either new moon. A
   * calendar using a different ayanamsa could then name the month differently.
   */
  borderline: boolean;
  /** The Sun changes sign twice in the month (a kshaya month, last in 1983 and next in 2124). */
  kshaya: boolean;
}

const sunSign = (utcMs: number) => Math.floor(siderealLongitude('sun', utcMs) / 30);
const nearSignChange = (utcMs: number) => {
  const inSign = siderealLongitude('sun', utcMs) % 30;
  return Math.min(inSign, 30 - inSign) < 0.25;
};

/**
 * The lunar month containing an instant, in both reckonings.
 *
 * A lunar month runs from new moon to new moon and takes its name from the sign the Sun enters
 * during it: Chaitra when the Sun enters Mesha, and so on. If the Sun stays in one sign for the
 * whole month, that month is adhika (extra) and shares the name of the month after it.
 *
 * In the purnimanta count the bright fortnight has the same name, and the dark fortnight takes
 * the name of the following month. An adhika month keeps its own name in both fortnights.
 */
export function lunarMonth(utcMs: number): LunarMonth {
  // The search gives each new moon to within a minute; it is then settled on the instant Amavasya
  // ends by this module's own tithi angle, so the month and the tithi always change together.
  const settle = (approx: number) => Math.round(reach('tithi', 0, approx));
  let starts = settle(newMoonBefore(utcMs));
  let ends = settle(newMoonAfter(utcMs));
  // Within that minute of a new moon the two searches can land on the same lunation's wrong side.
  if (starts > utcMs) { ends = starts; starts = settle(newMoonBefore(starts - 86400000)); }
  if (ends <= utcMs) { starts = ends; ends = settle(newMoonAfter(ends + 86400000)); }
  const s0 = sunSign(starts), s1 = sunSign(ends);
  const adhika = s0 === s1;
  const month = (index: number, extra: boolean): MonthName => ({ index, name: LUNAR_MONTHS[index], adhika: extra });
  const amanta = month((s0 + 1) % 12, adhika);
  const paksha = elementIndex('tithi', utcMs) < 15 ? 'Shukla' : 'Krishna';
  const purnimanta = paksha === 'Krishna' && !adhika ? month((s1 + 1) % 12, false) : amanta;
  return {
    amanta, purnimanta, paksha, starts, ends,
    borderline: nearSignChange(starts) || nearSignChange(ends),
    kshaya: (s1 - s0 + 12) % 12 === 2,
  };
}
