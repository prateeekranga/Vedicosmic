// Builds the place-search data in public/places/ from GeoNames (CC BY 4.0, https://www.geonames.org/).
// Download cities15000.zip, cities1000.zip, admin1CodesASCII.txt and countryInfo.txt from
// https://download.geonames.org/export/dump/, unzip into one folder, then run:
//   node scripts/build-places.mjs <that-folder>
// Output: one JSON file per first letter of a search name (a.json … z.json, _.json for others),
// each self-contained, so a search loads one small file. Commit the output.
import fs from 'node:fs';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) { console.error('usage: node scripts/build-places.mjs <geonames-folder>'); process.exit(1); }
const OUT = path.resolve('public/places');

// Every town of 1,000+ people in these countries; cities of 15,000+ everywhere else.
const DETAILED = new Set(['IN', 'NP']);
// Names people still search by that GeoNames may not list in plain ASCII.
const ALIASES = {
  Mumbai: ['Bombay'], Kolkata: ['Calcutta'], Chennai: ['Madras'], Bengaluru: ['Bangalore'], Gurugram: ['Gurgaon'],
  Varanasi: ['Benares', 'Banaras', 'Kashi'], Prayagraj: ['Allahabad'], Pune: ['Poona'], Vadodara: ['Baroda'],
  Thiruvananthapuram: ['Trivandrum'], Kochi: ['Cochin'], Kozhikode: ['Calicut'], Shimla: ['Simla'],
  Puducherry: ['Pondicherry'], Mangaluru: ['Mangalore'], Mysuru: ['Mysore'], Visakhapatnam: ['Vizag'],
  Sonipat: ['Sonepat'], Kanpur: ['Cawnpore'], Belagavi: ['Belgaum'], Kalaburagi: ['Gulbarga'],
};

const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const readTsv = (file) => fs.readFileSync(path.join(SRC, file), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));

const countries = Object.fromEntries(readTsv('countryInfo.txt').map((r) => [r[0], r[4]]));
const states = Object.fromEntries(readTsv('admin1CodesASCII.txt').map((r) => [r[0], r[2]]));

const rows = [
  ...readTsv('cities15000.txt').filter((r) => !DETAILED.has(r[8])),
  ...readTsv('cities1000.txt').filter((r) => DETAILED.has(r[8])),
];

const places = rows.map((r) => {
  const [, name, ascii, alternates, lat, lon, , , cc, , admin1, , , , population, , , zone] = r;
  // Indian and Nepali names read better without scholarly diacritics (Karnal, not Karnāl).
  const display = DETAILED.has(cc) ? ascii : name;
  const keys = new Set([normalize(display), normalize(name), normalize(ascii)]);
  if (DETAILED.has(cc) && Number(population) >= 20000) {
    alternates.split(',')
      .filter((a) => /^[A-Z][A-Za-z' -]{2,}$/.test(a) && a.split(' ').length <= 2 && !/^[A-Z]{2,4}$/.test(a))
      .slice(0, 12)
      .forEach((a) => keys.add(normalize(a)));
  }
  for (const a of ALIASES[ascii] ?? []) keys.add(normalize(a));
  keys.delete('');
  return {
    display, state: states[`${cc}.${admin1}`] ?? '', cc, zone,
    lat: Number(Number(lat).toFixed(4)), lon: Number(Number(lon).toFixed(4)), population: Number(population),
    keys: [...keys],
  };
}).filter((p) => p.zone);

const shardOf = (key) => (/^[a-z]/.test(key) ? key[0] : '_');
const shards = new Map();
for (const p of places) {
  for (const letter of new Set(p.keys.map(shardOf))) {
    if (!shards.has(letter)) shards.set(letter, []);
    shards.get(letter).push(p);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let total = 0;
for (const [letter, list] of [...shards].sort()) {
  list.sort((a, b) => b.population - a.population);
  const zones = [...new Set(list.map((p) => p.zone))];
  const ccs = [...new Set(list.map((p) => p.cc))];
  const data = {
    zones,
    countries: Object.fromEntries(ccs.map((c) => [c, countries[c] ?? c])),
    // [name, state, country code, latitude, longitude, zone index, extra search keys]; largest place first.
    places: list.map((p) => {
      const extra = p.keys.filter((k) => k !== normalize(p.display));
      return [p.display, p.state, p.cc, p.lat, p.lon, zones.indexOf(p.zone), ...(extra.length ? [extra] : [])];
    }),
  };
  const json = JSON.stringify(data);
  fs.writeFileSync(path.join(OUT, `${letter}.json`), json);
  total += json.length;
}
fs.writeFileSync(path.join(OUT, 'ATTRIBUTION.txt'),
  'Place data from GeoNames (https://www.geonames.org/), licensed under CC BY 4.0\n' +
  '(https://creativecommons.org/licenses/by/4.0/). Reduced to name, state, country, coordinates\n' +
  'and time zone, ordered by population; built with scripts/build-places.mjs.\n');
console.log(`[places] ${places.length} places in ${shards.size} files, ${(total / 1024).toFixed(0)} KB raw`);
