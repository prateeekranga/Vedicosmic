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
