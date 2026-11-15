/**
 * Everything the Panchang page shows for one local date at one place, from a single call: the
 * five limbs of the panchang with their end times, Sun and Moon times, the lunar month, the
 * named windows of the day and the Choghadiya. Pure: no UI imports.
 */
import {
  abhijit, brahmaMuhurta, choghadiya, gulikaKaal, rahuKaal, yamaganda, type Choghadiya, type Window,
} from './muhurta';
import { dayPanchang, lunarMonth, moonTimes, type DayPanchang, type LunarMonth, type MoonTimes, type Place } from './panchang';

export interface DayOverview {
  date: string;
  panchang: DayPanchang;
  moon: MoonTimes;
  /** The lunar month in force at sunrise. */
  month: LunarMonth;
  /**
   * Set when the month's name changes before the next sunrise: at the new moon in both counts,
   * or at the full moon in the purnimanta count.
   */
  monthChange: { at: number; month: LunarMonth } | null;
  /** Daytime and night-time lengths in ms. */
  dayLength: number;
  nightLength: number;
  brahmaMuhurta: Window;
  abhijit: Window;
  /** Abhijit is traditionally left unused on Wednesdays. */
  abhijitSkipped: boolean;
  rahuKaal: Window;
  yamaganda: Window;
  gulikaKaal: Window;
  /** Eight daytime parts, then eight night-time parts. */
  choghadiya: Choghadiya[];
}

const sameName = (a: LunarMonth, b: LunarMonth) =>
  a.amanta.index === b.amanta.index && a.amanta.adhika === b.amanta.adhika
  && a.purnimanta.index === b.purnimanta.index && a.purnimanta.adhika === b.purnimanta.adhika;

/** Null when the Sun does not rise and set at the place on that date (polar day or night). */
export function dayOverview(date: string, place: Place): DayOverview | null {
  const panchang = dayPanchang(date, place);
  if (!panchang) return null;
  const { sunrise, sunset, nextSunrise, vara } = panchang;
  const month = lunarMonth(sunrise);

  // The name can only change where Purnima (index 14) or Amavasya (index 29) ends.
  let monthChange: DayOverview['monthChange'] = null;
  for (const span of panchang.tithi) {
    if ((span.index === 14 || span.index === 29) && span.ends < nextSunrise) {
      const after = lunarMonth(span.ends + 60000);
      if (!sameName(month, after)) monthChange = { at: span.ends, month: after };
    }
  }

  return {
    date, panchang, month, monthChange,
    moon: moonTimes(sunrise, nextSunrise, place),
    dayLength: sunset - sunrise,
    nightLength: nextSunrise - sunset,
    brahmaMuhurta: brahmaMuhurta(sunrise),
    abhijit: abhijit(sunrise, sunset),
    abhijitSkipped: vara === 3,
    rahuKaal: rahuKaal(sunrise, sunset, vara),
    yamaganda: yamaganda(sunrise, sunset, vara),
    gulikaKaal: gulikaKaal(sunrise, sunset, vara),
    choghadiya: choghadiya(sunrise, sunset, nextSunrise, vara),
  };
}

/** The window that contains an instant, or null. */
export function activeAt<T extends Window>(windows: readonly T[], utcMs: number): T | null {
  return windows.find((w) => utcMs >= w.start && utcMs < w.end) ?? null;
}
