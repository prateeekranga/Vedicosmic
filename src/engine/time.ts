/**
 * Civil time ↔ UTC for a named IANA time zone, using the tz database built into the browser
 * (and Node) through Intl. Handles daylight saving and historic offsets, e.g. India's +6:30
 * war time (1942–45) and Nepal's change from +5:30 to +5:45 in 1986, and never depends on
 * the time zone of the device doing the calculation. Pure: no UI imports.
 */

/** Local calendar date of the device as YYYY-MM-DD, so a "day" starts at the visitor's midnight, not UTC's. */
export function localDateKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

function wallParts(timeZone: string, utcMs: number): Record<string, number> {
  const parts: Record<string, number> = {};
  for (const p of formatterFor(timeZone).formatToParts(new Date(utcMs))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return parts;
}

/** UTC offset of `timeZone` at the instant `utcMs`, in minutes east of UTC (IST = 330). */
export function zoneOffsetMinutes(timeZone: string, utcMs: number): number {
  const parts = wallParts(timeZone, utcMs);
  // Years before 1 are not needed here; Date.UTC treats 0–99 as 1900–1999, so set the year explicitly.
  const wall = new Date(Date.UTC(2000, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
  wall.setUTCFullYear(parts.year);
  return Math.round((wall.getTime() - Math.floor(utcMs / 1000) * 1000) / 60000);
}

/** Whether the runtime knows this IANA zone name. */
export function isValidZone(timeZone: string): boolean {
  try { formatterFor(timeZone); return true; } catch { return false; }
}

/** "YYYY-MM-DD" + "HH:mm" read as if it were UTC, in milliseconds. */
function wallClockMs(date: string, time: string): number {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = (time || '00:00').split(':').map(Number);
  const asIfUtc = new Date(Date.UTC(2000, mo - 1, d, h, mi));
  asIfUtc.setUTCFullYear(y);
  return asIfUtc.getTime();
}

export interface ResolvedTime {
  utcMs: number;
  /** 'repeated': the clock showed this time twice (clocks went back); 'skipped': it never showed it. */
  kind: 'normal' | 'repeated' | 'skipped';
  /** For a repeated time, the second occurrence. */
  laterUtcMs?: number;
  /** Offset used, in minutes east of UTC. */
  offsetMinutes: number;
}

/**
 * Local civil date and time in `timeZone` → UTC. A repeated time resolves to its first
 * occurrence (the later one is returned too); a skipped time lands just after the gap.
 */
export function resolveLocalTime(date: string, time: string, timeZone: string): ResolvedTime {
  const wall = wallClockMs(date, time);
  // Offsets in force half a day either side cover any single clock change near this time.
  const offBefore = zoneOffsetMinutes(timeZone, wall - 12 * 3600000);
  const offAfter = zoneOffsetMinutes(timeZone, wall + 12 * 3600000);
  const candidates = [...new Set([wall - offBefore * 60000, wall - offAfter * 60000])];
  const valid = candidates
    .filter((utc) => utc + zoneOffsetMinutes(timeZone, utc) * 60000 === wall)
    .sort((a, b) => a - b);
  if (valid.length === 0) {
    const utcMs = wall - offBefore * 60000;
    return { utcMs, kind: 'skipped', offsetMinutes: zoneOffsetMinutes(timeZone, utcMs) };
  }
  const utcMs = valid[0];
  return {
    utcMs,
    kind: valid.length > 1 ? 'repeated' : 'normal',
    laterUtcMs: valid.length > 1 ? valid[1] : undefined,
    offsetMinutes: zoneOffsetMinutes(timeZone, utcMs),
  };
}

/** Local civil date ("YYYY-MM-DD") and time ("HH:mm") in `timeZone` → UTC milliseconds. */
export function localToUtc(date: string, time: string, timeZone: string): number {
  return resolveLocalTime(date, time, timeZone).utcMs;
}

/**
 * Local date and time with an explicit UTC offset in minutes (e.g. 353 for +5:53), for old
 * records kept in a city's own local mean time rather than its standard zone.
 */
export function utcFromOffset(date: string, time: string, offsetMinutes: number): number {
  return wallClockMs(date, time) - offsetMinutes * 60000;
}

/** Calendar date ("YYYY-MM-DD") of an instant in `timeZone`. */
export function dateInZone(utcMs: number, timeZone: string): string {
  const p = wallParts(timeZone, utcMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(p.year).padStart(4, '0')}-${pad(p.month)}-${pad(p.day)}`;
}

/** Clock time ("HH:mm") of an instant in `timeZone`, 24-hour. */
export function timeInZone(utcMs: number, timeZone: string): string {
  const p = wallParts(timeZone, utcMs);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

/** "+5:30"-style label for an offset in minutes. */
export function offsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '−' : '+';
  const abs = Math.abs(offsetMinutes);
  return `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
}
