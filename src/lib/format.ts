import { dateInZone, timeInZone } from '@/engine/time';

export function formatDuration(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

export function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'course';
}

export function formatINR(amount: number): string {
  if (amount === 0) return 'Free';
  return '₹' + amount.toLocaleString('en-IN');
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function daysAlive(birth: Date, target: Date): number {
  return Math.floor((target.getTime() - birth.getTime()) / 86400000);
}

export function biorhythm(days: number, cycle: number): number {
  return Math.sin((2 * Math.PI * days) / cycle);
}

/** Deterministic seeded PRNG from a string (mulberry32). */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Clock time of an instant in a given IANA zone, rounded to the nearest minute, e.g. "6:42 am". */
export function formatClock(utcMs: number, zone: string): string {
  return new Date(Math.round(utcMs / 60000) * 60000).toLocaleTimeString('en-IN', { timeZone: zone, hour: 'numeric', minute: '2-digit' });
}

/** Date of an instant in a given IANA zone, e.g. "Mon, 12 Jan 2026". */
export function formatDateIn(utcMs: number, zone: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }): string {
  return new Date(utcMs).toLocaleDateString('en-IN', { timeZone: zone, ...opts });
}

/** A YYYY-MM-DD calendar date for display, without any time-zone shift. */
export function formatIsoDate(date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', ...opts });
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * A YYYY-MM-DD date written out as "14 November 2026". Uses a fixed month list rather than the
 * runtime's locale data, so the static build and every browser print exactly the same text.
 */
export function formatLongDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/**
 * Clock time of an instant in an IANA zone, rounded to the nearest minute: "6:42 am". Built from
 * numbers, not from the runtime's locale data, so Node and every browser print the same text.
 */
export function clockLabel(utcMs: number, zone: string): string {
  const [h, m] = timeInZone(Math.round(utcMs / 60000) * 60000, zone).split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Like clockLabel, with the day added ("2:14 am, 16 Nov") when the instant falls on another local date than `date`. */
export function clockLabelOn(utcMs: number, zone: string, date: string): string {
  const local = dateInZone(Math.round(utcMs / 60000) * 60000, zone);
  const label = clockLabel(utcMs, zone);
  if (local === date) return label;
  const [, m, d] = local.split('-').map(Number);
  return `${label}, ${d} ${SHORT_MONTHS[m - 1]}`;
}

/** A length of time as "10 h 43 min", rounded to the minute. */
export function durationLabel(ms: number): string {
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  return h ? `${h} h ${minutes % 60} min` : `${minutes} min`;
}
