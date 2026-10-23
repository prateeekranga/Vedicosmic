/* Sunrise and sunset from the "Almanac for Computers" (1990) algorithm, zenith 90.833°
   (upper limb with standard refraction), accurate to a minute or two. Replaced by the
   tested engine in Phase 2. */

const rad = Math.PI / 180;

/**
 * UTC timestamp of sunrise (`rise`) or sunset on the local calendar date of `date` at the
 * given coordinates, or null during polar day/night.
 */
export function sunEventUTC(date: Date, lat: number, lng: number, rise: boolean): number | null {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const n = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
  const lngHour = lng / 15;
  const t = n + ((rise ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;
  RA += (Math.floor(L / 90) - Math.floor(RA / 90)) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;               // polar day/night
  let H = rise ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad;
  H /= 15;
  const T = H + RA - 0.06571 * t - 6.622;
  // T is local mean time on this date. Wrap T, not UT: UT may fall on the previous or next
  // UTC day (sunrise in India is often before 00:00 UTC), and wrapping it moved the event
  // by 24 hours, giving negative day lengths and wrong Rahu Kaal on those days.
  const localMean = ((T % 24) + 24) % 24;
  const UT = localMean - lngHour;
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + UT * 3600000;
}
