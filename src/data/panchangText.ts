/**
 * Words for the Panchang page: what each limb and window is, and what tradition uses it for.
 * Readings describe tradition. Nothing here promises an outcome.
 */
import type { ChoghadiyaName } from '@/engine/muhurta';

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** The graha each weekday is named after. */
export const VARA_LORD = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const LIMB_TEXT = {
  tithi: 'The lunar day: one of thirty steps of 12° in the Moon’s distance from the Sun.',
  nakshatra: 'The lunar mansion: which of 27 divisions of the zodiac the Moon is in.',
  yoga: 'One of 27 combinations, from the longitudes of the Sun and Moon added together.',
  karana: 'Half a tithi. Sixty karanas make a lunar month.',
  vara: 'The weekday, counted from sunrise to the next sunrise.',
} as const;

export interface WindowText { name: string; devanagari: string; kind: 'good' | 'avoid'; note: string }

export const WINDOW_TEXT: Readonly<Record<'brahma' | 'abhijit' | 'rahu' | 'yamaganda' | 'gulika', WindowText>> = {
  brahma: {
    name: 'Brahma Muhurta', devanagari: 'ब्रह्म मुहूर्त', kind: 'good',
    note: 'The 48 minutes that end 48 minutes before sunrise. Tradition keeps it for meditation, japa and study.',
  },
  abhijit: {
    name: 'Abhijit Muhurta', devanagari: 'अभिजित मुहूर्त', kind: 'good',
    note: 'The eighth of fifteen parts of the daytime, around local noon. Traditionally favoured for beginning most kinds of work.',
  },
  rahu: {
    name: 'Rahu Kaal', devanagari: 'राहु काल', kind: 'avoid',
    note: 'Rahu’s eighth of the daytime. New ventures, journeys and ceremonies are traditionally not begun in it; work already under way continues.',
  },
  yamaganda: {
    name: 'Yamaganda', devanagari: 'यमगण्ड', kind: 'avoid',
    note: 'Yama’s eighth of the daytime. Traditionally avoided for beginnings.',
  },
  gulika: {
    name: 'Gulika Kaal', devanagari: 'गुलिक काल', kind: 'avoid',
    note: 'The eighth of the daytime given to Gulika, son of Saturn. Tradition says what is begun in it tends to be repeated.',
  },
};

export const ABHIJIT_WEDNESDAY_NOTE = 'It is Wednesday, when tradition leaves Abhijit unused.';

/** Words for the three classes of Choghadiya, shown as text so they never depend on colour. */
export const CHOGHADIYA_LABEL = { good: 'Good', neutral: 'Neutral', bad: 'Avoid' } as const;

export const CHOGHADIYA_TEXT: Readonly<Record<ChoghadiyaName, { meaning: string; lord: string; use: string }>> = {
  Amrit: { meaning: 'Nectar', lord: 'Moon', use: 'Counted the best part for any kind of work.' },
  Shubh: { meaning: 'Auspicious', lord: 'Jupiter', use: 'Favoured for ceremonies, weddings and beginnings.' },
  Labh: { meaning: 'Gain', lord: 'Mercury', use: 'Favoured for trade, study and starting something new.' },
  Char: { meaning: 'Moving', lord: 'Venus', use: 'Favoured for travel; ordinary for other work.' },
  Udveg: { meaning: 'Anxiety', lord: 'Sun', use: 'Avoided for beginnings; tradition allows official business.' },
  Kaal: { meaning: 'Time', lord: 'Saturn', use: 'Avoided for beginning new work.' },
  Rog: { meaning: 'Unease', lord: 'Mars', use: 'Avoided for beginning new work or a journey.' },
};

export const CHOGHADIYA_INTRO = 'Choghadiya divides the daytime into eight equal parts and the night into eight more. Each part belongs to a planet and is classed as good, neutral or to be avoided for starting something. It is used mostly in western and northern India.';

/** A short description of the Moon's phase from its fraction of the lunar month (0 new, 0.5 full). */
export function phaseName(phase: number): string {
  if (phase < 0.02 || phase > 0.98) return 'New moon';
  if (phase < 0.23) return 'Waxing crescent';
  if (phase < 0.27) return 'First quarter';
  if (phase < 0.48) return 'Waxing gibbous';
  if (phase < 0.52) return 'Full moon';
  if (phase < 0.73) return 'Waning gibbous';
  if (phase < 0.77) return 'Last quarter';
  return 'Waning crescent';
}

/** The share of the Moon's disc that is lit, 0 to 100, from the same fraction. */
export const illumination = (phase: number): number => Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100);

export const MONTH_BORDERLINE_NOTE = 'The Sun changes sign within a few hours of a new moon this month, so a panchang that uses a different ayanamsa may give the month another name.';
