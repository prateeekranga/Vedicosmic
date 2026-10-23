import { resolveLocalTime, utcFromOffset, zoneOffsetMinutes, type ResolvedTime } from '@/engine/time';
import type { ChosenPlace } from '@/lib/places';

/** Noon is used when the birth time is unknown; results that depend on the time are then hidden. */
export const UNKNOWN_TIME = '12:00';

/**
 * UTC instant of a birth at a place: by the zone's rules, or by the fixed offset entered under
 * "Advanced" for old local-time records. `useLater` picks the second of a repeated clock time.
 */
export function birthInstant(date: string, time: string, place: ChosenPlace, useLater = false): ResolvedTime & { fixedOffset: boolean } {
  if (place.offsetMinutes != null) {
    return { utcMs: utcFromOffset(date, time, place.offsetMinutes), kind: 'normal', offsetMinutes: place.offsetMinutes, fixedOffset: true };
  }
  const r = resolveLocalTime(date, time, place.zone);
  if (useLater && r.kind === 'repeated' && r.laterUtcMs !== undefined) {
    return { ...r, utcMs: r.laterUtcMs, offsetMinutes: zoneOffsetMinutes(place.zone, r.laterUtcMs), fixedOffset: false };
  }
  return { ...r, fixedOffset: false };
}
