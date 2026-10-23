/**
 * Monthly observances from tithi end times at a place. Each vrat uses the rule its tradition
 * most commonly follows: the tithi in force at sunrise (udaya tithi) for Ekadashi, Purnima,
 * Amavasya and Durga Ashtami; during Pradosh kaal (2 h 24 min after sunset) for Pradosh; at
 * moonrise for Sankashti Chaturthi. A tithi that begins and ends between two sunrises
 * (kshaya) belongs to the day it falls in. Regional and Vaishnava rules can move a date by a
 * day. Pure: no UI imports.
 */
import { addDays, daySunTimes, elementSpans, type Place, type Span, weekdayOf } from './panchang';
import { localToUtc } from './time';
import { nextMoonrise } from './sky';

export type VratKind = 'ekadashi' | 'purnima' | 'amavasya' | 'pradosh' | 'chaturthi' | 'ashtami';

export interface Vrat {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  kind: VratKind;
  name: string;
  paksha: 'Shukla' | 'Krishna';
}

const tithiAt = (spans: Span[], utcMs: number) => (spans.find((s) => s.ends > utcMs) ?? spans[spans.length - 1]).index;

const PRADOSH_KAAL_MS = 144 * 60000;
const PRADOSH_DAY = ['Ravi', 'Soma', 'Bhauma', 'Budha', 'Guru', 'Shukra', 'Shani'];

/** Vrats on the `days` local dates starting at `startDate`. Days without a sunrise are skipped. */
export function vratsBetween(startDate: string, days: number, place: Place): Vrat[] {
  const out: Vrat[] = [];
  const add = (date: string, kind: VratKind, name: string, paksha: 'Shukla' | 'Krishna') => {
    // A tithi in force on two consecutive days (vriddhi) is observed on the first of them.
    const already = out.some((v) => v.kind === kind && v.paksha === paksha && (v.date === date || v.date === addDays(date, -1)));
    if (!already) out.push({ date, kind, name, paksha });
  };

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const sun = daySunTimes(date, place);
    if (sun === null) continue;
    const { sunrise, sunset, nextSunrise } = sun;
    const spans = elementSpans('tithi', sunrise, nextSunrise);

    // The tithi at sunrise, plus any that begin and end before the next sunrise.
    const sunriseTithis = [spans[0].index, ...spans.slice(1).filter((s) => s.ends < nextSunrise).map((s) => s.index)];
    for (const t of sunriseTithis) {
      const paksha = t < 15 ? 'Shukla' : 'Krishna';
      if (t % 15 === 10) add(date, 'ekadashi', `${paksha} Ekadashi`, paksha);
      else if (t === 14) add(date, 'purnima', 'Purnima', paksha);
      else if (t === 29) add(date, 'amavasya', 'Amavasya', paksha);
      else if (t === 7) add(date, 'ashtami', 'Durga Ashtami', paksha);
    }

    const pradoshKaalEnd = sunset + PRADOSH_KAAL_MS;
    const inPradoshKaal = spans.filter((s, j) => s.ends > sunset && (j === 0 || spans[j - 1].ends < pradoshKaalEnd));
    const trayodashi = inPradoshKaal.find((s) => s.index % 15 === 12);
    if (trayodashi) {
      const paksha = trayodashi.index < 15 ? 'Shukla' : 'Krishna';
      add(date, 'pradosh', `${PRADOSH_DAY[weekdayOf(date)]} Pradosh (${paksha})`, paksha);
    }

    const midnight = localToUtc(date, '00:00', place.zone);
    const moonrise = nextMoonrise(midnight, place.lat, place.lon, 1);
    if (moonrise !== null && tithiAt(elementSpans('tithi', midnight, moonrise + 1000), moonrise) === 18) {
      add(date, 'chaturthi', 'Sankashti Chaturthi', 'Krishna');
    }
  }
  return out;
}
