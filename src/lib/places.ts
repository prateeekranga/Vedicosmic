import { searchShard, shardFor, type PlaceResult, type PlaceShard } from '@/engine/places';

/** A place chosen in a tool: from the search, or typed in by hand under "Advanced". */
export interface ChosenPlace {
  label: string;
  lat: number;
  lon: number;
  /** IANA time zone. */
  zone: string;
  /**
   * Minutes east of UTC that replace the zone's rules, for old records kept in a city's own
   * local time. Birth charts only.
   */
  offsetMinutes?: number | null;
}

export const DEFAULT_PLACE: ChosenPlace = { label: 'New Delhi, Delhi, India', lat: 28.6358, lon: 77.2245, zone: 'Asia/Kolkata' };

export function placeLabel(r: PlaceResult): string {
  return [r.name, r.state, r.country].filter((x, i, all) => x && all.indexOf(x) === i).join(', ');
}

export const placeFromResult = (r: PlaceResult): ChosenPlace => ({ label: placeLabel(r), lat: r.lat, lon: r.lon, zone: r.zone });

/** Loads place files from /places/ on first use; each is fetched once per visit. */
const shards = new Map<string, Promise<PlaceShard>>();

function loadShard(key: string): Promise<PlaceShard> {
  let p = shards.get(key);
  if (!p) {
    p = fetch(`/places/${key}.json`).then((r) => {
      if (!r.ok) throw new Error(`places/${key}.json: ${r.status}`);
      return r.json() as Promise<PlaceShard>;
    });
    p.catch(() => shards.delete(key));
    shards.set(key, p);
  }
  return p;
}

export async function searchPlaces(query: string, limit = 8): Promise<PlaceResult[]> {
  const key = shardFor(query);
  if (!key) return [];
  return searchShard(await loadShard(key), query, limit);
}
