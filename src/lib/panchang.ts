/* Lightweight Hindu lunar-calendar math (approximate, ±1 tithi).
   Computes Sun & Moon longitudes → tithi, paksha, nakshatra, and scans
   forward for the major vrats (Ekadashi, Purnima, Amavasya, Pradosh, etc.). */

const rad = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;

export function julianDay(dt: Date): number { return dt.getTime() / 86400000 + 2440587.5; }

export function sunLongitude(jd: number): number {
  const d = jd - 2451545.0;
  const g = norm(357.529 + 0.98560028 * d);
  const q = norm(280.459 + 0.98564736 * d);
  return norm(q + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad));
}

export function moonLongitude(jd: number): number {
  const d = jd - 2451545.0;
  const L = 218.316 + 13.176396 * d;
  const M = 134.963 + 13.064993 * d;
  const D = 297.850 + 12.190749 * d;
  const F = 93.272 + 13.229350 * d;
  const Ms = 357.529 + 0.98560028 * d;
  const lon = L
    + 6.289 * Math.sin(M * rad)
    + 1.274 * Math.sin((2 * D - M) * rad)
    + 0.658 * Math.sin(2 * D * rad)
    + 0.214 * Math.sin(2 * M * rad)
    - 0.186 * Math.sin(Ms * rad)
    - 0.114 * Math.sin(2 * F * rad);
  return norm(lon);
}

export const NAK_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];
/** Linearised Lahiri ayanamsa (degrees) for a given Julian Day. */
export function lahiriAyanamsa(jd: number): number { return 23.856 + (jd - 2451545.0) * 0.0000382; }
const AYAN = lahiriAyanamsa;

const TITHI_NAMES = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];

export interface Panchang {
  tithiIndex: number;      // 0..29 (0-14 shukla, 15-29 krishna)
  tithiName: string;       // e.g. 'Shukla Ekadashi'
  paksha: 'Shukla' | 'Krishna';
  nakshatra: string;
  nakshatraIndex: number;
  moonPhase: number;       // 0..1 (0 = new, 0.5 = full)
}

export function panchang(dt: Date): Panchang {
  const jd = julianDay(dt);
  const sun = sunLongitude(jd);
  const moon = moonLongitude(jd);
  const diff = norm(moon - sun);
  const tithiIndex = Math.floor(diff / 12);           // 0..29
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const within = tithiIndex % 15;                      // 0..14
  const name = within === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : TITHI_NAMES[within];
  const sidMoon = norm(moon - AYAN(jd));
  const nakIndex = Math.floor(sidMoon / (360 / 27)) % 27;
  return {
    tithiIndex, paksha, tithiName: within === 14 ? name : `${paksha} ${name}`,
    nakshatra: NAK_NAMES[nakIndex], nakshatraIndex: nakIndex,
    moonPhase: diff / 360,
  };
}

/* ── vrat detection ── */
export type VratKind = 'ekadashi' | 'purnima' | 'amavasya' | 'pradosh' | 'chaturthi' | 'ashtami';
export interface Vrat { date: Date; kind: VratKind; name: string; paksha: 'Shukla' | 'Krishna'; note: string }

const KIND_META: Record<VratKind, { label: string; note: string }> = {
  ekadashi: { label: 'Ekadashi', note: 'The 11th tithi — sacred to Vishnu. A day of fasting, japa and lightness; the mind turns easily inward.' },
  purnima: { label: 'Purnima', note: 'The full moon — high tide of the mind and emotions. Ideal for meditation, charity and satsang.' },
  amavasya: { label: 'Amavasya', note: 'The new moon — a dark, inward day for ancestral remembrance (tarpana) and quiet rest.' },
  pradosh: { label: 'Pradosh', note: 'The 13th tithi at dusk — sacred to Shiva. Worship in the twilight hour dissolves obstacles.' },
  chaturthi: { label: 'Sankashti Chaturthi', note: 'The 4th tithi of Krishna paksha — sacred to Ganesha, remover of obstacles.' },
  ashtami: { label: 'Ashtami', note: 'The 8th tithi — often kept for the Divine Mother (Durga Ashtami).' },
};

/** Scan forward `days` from `from` and return the vrats that fall in that window. */
export function upcomingVrats(from: Date, days = 40): Vrat[] {
  const out: Vrat[] = [];
  let prev = panchang(from).tithiIndex;
  for (let i = 1; i <= days; i++) {
    const d = new Date(from); d.setDate(d.getDate() + i); d.setHours(6, 0, 0, 0);
    const p = panchang(d);
    const within = p.tithiIndex % 15;
    // fire on the day a tithi becomes current (edge), to avoid duplicates
    if (p.tithiIndex !== prev) {
      const add = (kind: VratKind, name?: string) =>
        out.push({ date: d, kind, name: name ?? KIND_META[kind].label, paksha: p.paksha, note: KIND_META[kind].note });
      if (within === 10) add('ekadashi', `${p.paksha} Ekadashi`);
      else if (within === 14 && p.paksha === 'Shukla') add('purnima');
      else if (within === 14 && p.paksha === 'Krishna') add('amavasya');
      else if (within === 12) add('pradosh', `${p.paksha} Pradosh`);
      else if (within === 3 && p.paksha === 'Krishna') add('chaturthi');
      else if (within === 7 && p.paksha === 'Shukla') add('ashtami', 'Durga Ashtami');
    }
    prev = p.tithiIndex;
  }
  return out;
}
