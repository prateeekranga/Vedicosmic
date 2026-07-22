// Lightweight client-side astronomy for the MVP tools.
// Sidereal (Vedic) sign approximations use the Lahiri ayanamsa (~24°).

export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  tz: number; // UTC offset in hours
}

export const CITIES: City[] = [
  { name: 'Delhi', country: 'India', lat: 28.61, lng: 77.21, tz: 5.5 },
  { name: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88, tz: 5.5 },
  { name: 'Bengaluru', country: 'India', lat: 12.97, lng: 77.59, tz: 5.5 },
  { name: 'Kolkata', country: 'India', lat: 22.57, lng: 88.36, tz: 5.5 },
  { name: 'Chennai', country: 'India', lat: 13.08, lng: 80.27, tz: 5.5 },
  { name: 'Varanasi', country: 'India', lat: 25.32, lng: 82.97, tz: 5.5 },
  { name: 'Jaipur', country: 'India', lat: 26.91, lng: 75.79, tz: 5.5 },
  { name: 'Hyderabad', country: 'India', lat: 17.39, lng: 78.49, tz: 5.5 },
  { name: 'Pune', country: 'India', lat: 18.52, lng: 73.86, tz: 5.5 },
  { name: 'Rishikesh', country: 'India', lat: 30.09, lng: 78.27, tz: 5.5 },
  { name: 'London', country: 'UK', lat: 51.51, lng: -0.13, tz: 0 },
  { name: 'New York', country: 'USA', lat: 40.71, lng: -74.01, tz: -5 },
  { name: 'Los Angeles', country: 'USA', lat: 34.05, lng: -118.24, tz: -8 },
  { name: 'Dubai', country: 'UAE', lat: 25.2, lng: 55.27, tz: 4 },
  { name: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82, tz: 8 },
  { name: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21, tz: 11 },
  { name: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38, tz: -5 },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7, lng: 85.32, tz: 5.75 },
];

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];
export const RASHIS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const DEG = Math.PI / 180;
function rad(d: number) { return d * DEG; }
function deg(r: number) { return r / DEG; }
function norm360(d: number) { return ((d % 360) + 360) % 360; }

const AYANAMSA = 24.1; // Lahiri approximate for this era

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Approximate tropical solar longitude, then shift to sidereal. */
export function siderealSunLongitude(date: Date): number {
  const jd = julianDay(date);
  const n = jd - 2451545.0;
  const L = norm360(280.46 + 0.9856474 * n);
  const g = norm360(357.528 + 0.9856003 * n);
  const lambda = norm360(L + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g)));
  return norm360(lambda - AYANAMSA);
}

/** Very rough sidereal lunar longitude. */
export function siderealMoonLongitude(date: Date): number {
  const jd = julianDay(date);
  const n = jd - 2451545.0;
  const Lp = norm360(218.316 + 13.176396 * n);
  const M = norm360(134.963 + 13.064993 * n);
  const lambda = norm360(Lp + 6.289 * Math.sin(rad(M)));
  return norm360(lambda - AYANAMSA);
}

export function longitudeToRashi(lon: number): number {
  return Math.floor(norm360(lon) / 30);
}

/** Crude Lagna (ascendant) approximation from time + latitude. */
export function ascendantRashi(date: Date, lat: number, lng: number, tz: number): number {
  const jd = julianDay(date);
  const n = jd - 2451545.0;
  const gmst = norm360(280.46061837 + 360.98564736629 * n);
  const lst = norm360(gmst + lng);
  const sunLon = siderealSunLongitude(date);
  // Blend local sidereal time with latitude bias for a stable pseudo-lagna.
  const latBias = (lat / 90) * 15;
  const asc = norm360(sunLon + lst / 12 + latBias);
  return longitudeToRashi(asc);
}

// ---- Sunrise / sunset (NOAA simplified) ----
export interface SunTimes { sunrise: Date; sunset: Date; }

export function sunriseSunset(date: Date, lat: number, lng: number, tz: number): SunTimes {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const zenith = 90.833;

  function calc(rising: boolean): Date {
    const lngHour = lng / 15;
    const t = dayOfYear + ((rising ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = norm360(M + 1.916 * Math.sin(rad(M)) + 0.02 * Math.sin(rad(2 * M)) + 282.634);
    let RA = norm360(deg(Math.atan(0.91764 * Math.tan(rad(L)))));
    RA += (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90);
    RA /= 15;
    const sinDec = 0.39782 * Math.sin(rad(L));
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH =
      (Math.cos(rad(zenith)) - sinDec * Math.sin(rad(lat))) / (cosDec * Math.cos(rad(lat)));
    const H = rising ? 360 - deg(Math.acos(cosH)) : deg(Math.acos(cosH));
    const Hh = H / 15;
    const T = Hh + RA - 0.06571 * t - 6.622;
    const UT = norm360((T - lngHour) * 15) / 15;
    const local = UT + tz;
    const hours = ((local % 24) + 24) % 24;
    const d = new Date(date);
    d.setHours(Math.floor(hours), Math.floor((hours % 1) * 60), 0, 0);
    return d;
  }
  return { sunrise: calc(true), sunset: calc(false) };
}

// ---- Planetary hours (horas) ----
export const PLANETS = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
export const PLANET_SANSKRIT: Record<string, string> = {
  Sun: 'Surya', Venus: 'Shukra', Mercury: 'Budha', Moon: 'Chandra',
  Saturn: 'Shani', Jupiter: 'Guru', Mars: 'Mangala',
};
export const PLANET_COLOR: Record<string, string> = {
  Sun: '#FFB300', Venus: '#7DD3FC', Mercury: '#34D399', Moon: '#CBD5E1',
  Saturn: '#6366F1', Jupiter: '#FBBF24', Mars: '#F87171',
};
const DAY_RULER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']; // Sun..Sat

export interface Hora {
  index: number;
  planet: string;
  start: Date;
  end: Date;
  isNight: boolean;
}

export function planetaryHours(date: Date, lat: number, lng: number, tz: number): Hora[] {
  const { sunrise, sunset } = sunriseSunset(date, lat, lng, tz);
  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  const nextSunrise = sunriseSunset(next, lat, lng, tz).sunrise;

  const dayLen = (sunset.getTime() - sunrise.getTime()) / 12;
  const nightLen = (nextSunrise.getTime() - sunset.getTime()) / 12;

  const ruler = DAY_RULER[date.getDay()];
  const startIdx = PLANETS.indexOf(ruler);
  const horas: Hora[] = [];

  for (let i = 0; i < 12; i++) {
    const planet = PLANETS[(startIdx + i) % 7];
    horas.push({
      index: i,
      planet,
      start: new Date(sunrise.getTime() + i * dayLen),
      end: new Date(sunrise.getTime() + (i + 1) * dayLen),
      isNight: false,
    });
  }
  for (let i = 0; i < 12; i++) {
    const planet = PLANETS[(startIdx + 12 + i) % 7];
    horas.push({
      index: 12 + i,
      planet,
      start: new Date(sunset.getTime() + i * nightLen),
      end: new Date(sunset.getTime() + (i + 1) * nightLen),
      isNight: true,
    });
  }
  return horas;
}
