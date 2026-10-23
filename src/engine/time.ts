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

/** UTC offset of `timeZone` at the instant `utcMs`, in minutes east of UTC (IST = 330). */
export function zoneOffsetMinutes(timeZone: string, utcMs: number): number {
  const parts: Record<string, number> = {};
  for (const p of formatterFor(timeZone).formatToParts(new Date(utcMs))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  // Years before 1 are not needed here; Date.UTC treats 0–99 as 1900–1999, so set the year explicitly.
  const wall = new Date(Date.UTC(2000, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
  wall.setUTCFullYear(parts.year);
  return Math.round((wall.getTime() - Math.floor(utcMs / 1000) * 1000) / 60000);
}

/**
 * Local civil date ("YYYY-MM-DD") and time ("HH:mm") in `timeZone` → UTC milliseconds.
 * For a time skipped by a clock change, the result falls just after the gap; for a repeated
 * time, it picks the first (earlier-offset) occurrence. Phase 2 surfaces both cases to the user.
 */
export function localToUtc(date: string, time: string, timeZone: string): number {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = (time || '00:00').split(':').map(Number);
  const asIfUtc = new Date(Date.UTC(2000, mo - 1, d, h, mi));
  asIfUtc.setUTCFullYear(y);
  const wall = asIfUtc.getTime();
  // Offsets in force half a day either side cover any single clock change near this time.
  const offBefore = zoneOffsetMinutes(timeZone, wall - 12 * 3600000);
  const offAfter = zoneOffsetMinutes(timeZone, wall + 12 * 3600000);
  const candidates = [...new Set([wall - offBefore * 60000, wall - offAfter * 60000])];
  const valid = candidates.filter((utc) => utc + zoneOffsetMinutes(timeZone, utc) * 60000 === wall);
  if (valid.length) return Math.min(...valid);   // normal time, or the earlier of a repeated time
  return wall - offBefore * 60000;               // skipped time: lands just after the gap
}
