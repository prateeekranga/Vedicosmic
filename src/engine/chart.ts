/**
 * Birth chart: Lagna, the nine grahas and whole-sign houses. Pure: no UI imports.
 */
import { ENGINE_MARGIN_DEG, angleDiff, nearBoundary, zodiacPosition, type Boundary, type ZodiacPosition } from './core';
import { siderealAscendant } from './ascendant';
import { siderealLongitude, type GrahaId } from './sky';

export const GRAHAS: { id: GrahaId; en: string; sa: string }[] = [
  { id: 'sun', en: 'Sun', sa: 'Surya' },
  { id: 'moon', en: 'Moon', sa: 'Chandra' },
  { id: 'mars', en: 'Mars', sa: 'Mangala' },
  { id: 'mercury', en: 'Mercury', sa: 'Budha' },
  { id: 'jupiter', en: 'Jupiter', sa: 'Guru' },
  { id: 'venus', en: 'Venus', sa: 'Shukra' },
  { id: 'saturn', en: 'Saturn', sa: 'Shani' },
  { id: 'rahu', en: 'Rahu', sa: 'Rahu' },
  { id: 'ketu', en: 'Ketu', sa: 'Ketu' },
];

export interface GrahaPosition extends ZodiacPosition {
  id: GrahaId;
  /** Degrees per day; negative while retrograde. */
  speed: number;
  /** For the seven planets only. Rahu and Ketu, as mean nodes, always move backwards. */
  retrograde: boolean;
  /** Whole-sign house from the Lagna (1–12), or null when there is no Lagna. */
  house: number | null;
  /** Set when the longitude is within the engine's margin of a sign, nakshatra or pada edge. */
  borderline: Boundary | null;
}

export interface Chart {
  utcMs: number;
  /** Null beyond the polar latitude limit, or when the birth time is unknown. */
  lagna: (ZodiacPosition & { borderline: Boundary | null }) | null;
  grahas: GrahaPosition[];
  /** Sign index of houses 1–12 (whole-sign), empty without a Lagna. */
  houses: number[];
  /** Whether the result would change if the birth time were a few minutes different. */
  timeSensitive: { lagnaSign: boolean; moonSign: boolean; moonNakshatra: boolean };
}

const MINUTE = 60000;

export interface ChartInput {
  utcMs: number;
  lat: number;
  lon: number;
  /** Set when the birth time is unknown: no Lagna or houses are given. */
  timeUnknown?: boolean;
}

export function castChart({ utcMs, lat, lon, timeUnknown = false }: ChartInput): Chart {
  const asc = timeUnknown ? null : siderealAscendant(utcMs, lat, lon);
  const lagna = asc === null ? null : { ...zodiacPosition(asc), borderline: nearBoundary(asc, ENGINE_MARGIN_DEG) };

  const grahas = GRAHAS.map(({ id }): GrahaPosition => {
    const lonNow = siderealLongitude(id, utcMs);
    const speed = angleDiff(siderealLongitude(id, utcMs + 720 * MINUTE), siderealLongitude(id, utcMs - 720 * MINUTE));
    const pos = zodiacPosition(lonNow);
    return {
      id, ...pos, speed,
      retrograde: id !== 'rahu' && id !== 'ketu' && speed < 0,
      house: lagna ? ((pos.sign - lagna.sign + 12) % 12) + 1 : null,
      borderline: nearBoundary(lonNow, ENGINE_MARGIN_DEG),
    };
  });

  const moonAt = (dt: number) => zodiacPosition(siderealLongitude('moon', utcMs + dt));
  const moon = grahas[1];
  const lagnaAt = (dt: number) => siderealAscendant(utcMs + dt, lat, lon);
  const lagnaSignChanges = lagna !== null && [-5, 5].some((m) => {
    const other = lagnaAt(m * MINUTE);
    return other !== null && zodiacPosition(other).sign !== lagna.sign;
  });

  return {
    utcMs,
    lagna,
    grahas,
    houses: lagna ? Array.from({ length: 12 }, (_, i) => (lagna.sign + i) % 12) : [],
    timeSensitive: {
      lagnaSign: lagnaSignChanges,
      moonSign: [-30, 30].some((m) => moonAt(m * MINUTE).sign !== moon.sign),
      moonNakshatra: [-30, 30].some((m) => moonAt(m * MINUTE).nakshatra !== moon.nakshatra),
    },
  };
}

/**
 * For an unknown birth time: the Moon at the start and end of the local day, so the result can
 * say whether its sign or nakshatra changed during that day.
 */
export function moonOverDay(dayStartUtcMs: number, dayEndUtcMs: number) {
  const start = zodiacPosition(siderealLongitude('moon', dayStartUtcMs));
  const end = zodiacPosition(siderealLongitude('moon', dayEndUtcMs));
  return { start, end, signChanges: start.sign !== end.sign, nakshatraChanges: start.nakshatra !== end.nakshatra };
}
