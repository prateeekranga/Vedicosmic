/**
 * Panchang for a local date at a place: vara, sunrise and sunset, and the tithi, nakshatra,
 * yoga and karana in force at sunrise with the times each one ends. The day runs from sunrise
 * to the next sunrise. Checked against independent JPL-based values in
 * tests/golden/panchang-reference.json. Pure: no UI imports.
 */
import { NAKSHATRAS, NAKSHATRA_SPAN, angleDiff, norm360 } from './core';
import { dateInZone, localToUtc } from './time';
import { nextSunEvent, siderealOffset, sunMoonTropical } from './sky';

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
