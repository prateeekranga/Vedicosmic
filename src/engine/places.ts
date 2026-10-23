/**
 * Place search over the GeoNames shards in public/places/ (CC BY 4.0, built by
 * scripts/build-places.mjs). Prefix, word and typo-tolerant matching; ties go to the larger
 * place. "Sonipat, Haryana" or "Delhi, India" narrows by state or country. Pure: no UI imports.
 */

export interface PlaceResult {
  name: string;
  state: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  zone: string;
}

/** [name, state, country code, latitude, longitude, zone index, extra search keys]; largest place first. */
type Row = [string, string, string, number, number, number, string[]?];

export interface PlaceShard {
  zones: string[];
  countries: Record<string, string>;
  places: Row[];
}

export function normalizePlace(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** File that holds names starting like this query ("a" … "z", or "_"). */
export function shardFor(query: string): string | null {
  const q = normalizePlace(query.split(',')[0]);
  if (!q) return null;
  return /^[a-z]/.test(q) ? q[0] : '_';
}

/** Optimal-string-alignment distance (insertions, deletions, substitutions, adjacent swaps). */
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Lower is better; null if the key does not match. */
function score(key: string, q: string): number | null {
  if (key === q) return 0;
  if (key.startsWith(q)) return 1;
  if (key.includes(` ${q}`)) return 2;
  if (q.length < 4) return null;
  const allowed = q.length >= 7 ? 2 : 1;
  if (Math.abs(key.length - q.length) <= allowed) {
    const whole = editDistance(q, key);
    if (whole <= allowed) return 3 + whole;
  }
  const prefix = editDistance(q, key.slice(0, q.length));
  return prefix <= allowed ? 4 + prefix : null;
}

const keyCache = new WeakMap<PlaceShard, string[][]>();

/** Normalised search keys of every row, computed once per shard. */
function keysOf(shard: PlaceShard): string[][] {
  let keys = keyCache.get(shard);
  if (!keys) {
    keys = shard.places.map(([name, , , , , , extra]) => [normalizePlace(name), ...(extra ?? [])]);
    keyCache.set(shard, keys);
  }
  return keys;
}

export function searchShard(shard: PlaceShard, query: string, limit = 8): PlaceResult[] {
  const [main, ...rest] = query.split(',');
  const q = normalizePlace(main);
  const qualifier = normalizePlace(rest.join(' '));
  if (!q) return [];

  const keys = keysOf(shard);
  const hits: { row: Row; s: number }[] = [];
  shard.places.forEach((row, i) => {
    const [, state, cc] = row;
    if (qualifier) {
      const where = [normalizePlace(state), normalizePlace(shard.countries[cc] ?? cc), cc.toLowerCase()];
      if (!where.some((w) => w.startsWith(qualifier))) return;
    }
    let best: number | null = null;
    for (const key of keys[i]) {
      const s = score(key, q);
      if (s !== null && (best === null || s < best)) best = s;
      if (best === 0) break;
    }
    if (best !== null) hits.push({ row, s: best });
  });
  // Rows are stored largest first, so a stable sort keeps big places ahead within a score.
  hits.sort((a, b) => a.s - b.s);
  return hits.slice(0, limit).map(({ row: [name, state, cc, lat, lon, zone] }) => ({
    name, state, countryCode: cc, country: shard.countries[cc] ?? cc, lat, lon, zone: shard.zones[zone],
  }));
}
