import { Link } from 'react-router-dom';
import { LegalLayout, type LegalSection } from './legal/LegalLayout';
import { ENGINE } from '@/engine/sky';
import { POLAR_LATITUDE } from '@/engine/ascendant';
import vectors from '../../tests/golden/vectors.json';
import { PANCHANG_REFERENCE_DAYS } from '@/content/referenceChecks';

const link = 'text-brand-cyan-soft underline underline-offset-2 hover:text-white';
const th = 'py-1.5 pr-3 text-left text-xs font-medium uppercase tracking-wide text-white/60';
const td = 'py-1.5 pr-3 text-white/70';

const sections: LegalSection[] = [
  {
    heading: 'Everything is calculated on your device',
    body: (
      <p>
        Every chart, panchang and timing on VediCosmic is worked out in your browser. Birth dates, times and places are
        not sent to us or anyone else; a place search downloads our list of places that start with the same letter, so
        only that first letter reaches our server. Planet positions come from {ENGINE.name} {ENGINE.version}, an open-source
        library (MIT licence) accurate to about one arcminute; the rest of the method is our own code, described below
        and checked against the reference values at the end of this page.
      </p>
    ),
  },
  {
    heading: 'Zodiac and ayanamsa',
    body: (
      <p>
        Positions are sidereal, using the Lahiri (Chitrapaksha) ayanamsa in its mean form, without nutation: 23.2455° on
        21 March 1956, carried to other dates by the IAU 1976 rate of precession. Planet positions are first referred to the
        mean equinox of date and the ayanamsa is then subtracted, the same convention Swiss Ephemeris uses. Signs are
        30° each, nakshatras 13°20′ and padas 3°20′.
      </p>
    ),
  },
  {
    heading: 'Lagna and houses',
    body: (
      <>
        <p>
          The Lagna (Ascendant) comes from local mean sidereal time, the mean obliquity of the ecliptic and your latitude,
          then has the ayanamsa subtracted. Houses are whole signs: the Lagna’s sign is the first house, the next sign the
          second, and so on.
        </p>
        <p>
          The Lagna moves about one degree every four minutes, so it depends on an accurate birth time. The chart tells you
          when the Lagna changes sign within five minutes of the time you entered. Beyond {POLAR_LATITUDE}° latitude, where some
          signs never rise, no Lagna is given.
        </p>
      </>
    ),
  },
  {
    heading: 'Grahas',
    body: (
      <p>
        Sun, Moon, Mars, Mercury, Jupiter, Venus and Saturn are apparent geocentric positions. Rahu is the mean lunar node and
        Ketu the point opposite it; as mean nodes they always move backwards. A planet is marked retrograde when its
        longitude is decreasing over the day around the birth time.
      </p>
    ),
  },
  {
    heading: 'Time and place',
    body: (
      <>
        <p>
          A birth time is read in the time zone of the birth place, using the time-zone database built into your browser.
          That covers daylight saving and historic changes, such as India’s +6:30 war time (1942–45) or Nepal’s move from
          +5:30 to +5:45 in 1986. If the clocks went back and the time happened twice, the chart says so and lets you choose;
          if the clocks went forward and the time never existed, it says that too.
        </p>
        <p>
          Until the 1950s some Indian cities kept their own local time (Bombay and Calcutta time, for example). The database
          does not always know these, so the place search has an “Advanced” option to enter the offset written on an old
          record.
        </p>
        <p>
          Places come from{' '}
          <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" className={link}>GeoNames</a>{' '}
          (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className={link}>CC BY 4.0</a>):
          every town of 1,000 people or more in India and Nepal, and cities of 15,000 or more elsewhere. If your town is
          missing, enter its coordinates under “Advanced”.
        </p>
      </>
    ),
  },
  {
    heading: 'Panchang and daily timings',
    body: (
      <>
        <p>
          The panchang day runs from sunrise to the next sunrise. Sunrise and sunset are the moments the Sun’s upper edge
          meets a sea-level horizon, with standard atmospheric refraction (34′).
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Tithi: the Moon’s lead over the Sun in steps of 12°; karana: half a tithi.</li>
          <li>Nakshatra: the Moon’s sidereal position; yoga: the sum of the Sun’s and Moon’s sidereal positions, in steps of 13°20′.</li>
          <li>The value in force at sunrise is shown with the time it ends, found to within a second and shown to the nearest minute.</li>
          <li>Rahu Kaal, Yamaganda and Gulika Kaal: one of eight equal parts of the daytime, chosen by weekday.</li>
          <li>Abhijit muhurta: the eighth of fifteen equal parts of the daytime (traditionally not used on Wednesdays). Brahma muhurta: 96 to 48 minutes before sunrise.</li>
          <li>Choghadiya: eight equal parts of the day and eight of the night, in the traditional order for each weekday. Horas: twelve equal parts of each.</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Vrat dates',
    body: (
      <p>
        Ekadashi, Purnima, Amavasya and Durga Ashtami fall on the day whose sunrise is in that tithi; Pradosh on the day the
        Trayodashi tithi is in force during the 2 h 24 min after sunset; Sankashti Chaturthi on the day the Krishna Chaturthi
        tithi is in force at moonrise. A tithi that starts and ends between two sunrises belongs to the day it falls in.
        Some traditions use other rules (the Vaishnava rule for Ekadashi, for example), which can move a date by a day.
      </p>
    ),
  },
  {
    heading: 'Vimshottari dasha',
    body: (
      <p>
        The first period belongs to the lord of the Moon’s birth nakshatra, and the share of it still to run is the share of
        the nakshatra the Moon had yet to cross. Periods follow the order Ketu 7 years, Venus 20, Sun 6, Moon 10, Mars 7,
        Rahu 18, Jupiter 16, Saturn 19, Mercury 17, with years of 365.25 days; sub-periods are in the same proportions.
      </p>
    ),
  },
  {
    heading: 'How we check the results',
    body: (
      <>
        <p>
          Every change to the site runs automated tests against reference values made with independent software that is
          not part of the site. The tolerances are fixed in advance and are never loosened to make a test pass.
        </p>
        <table className="w-full text-sm">
          <caption className="sr-only">Reference checks, tolerances and the largest differences found</caption>
          <thead><tr><th scope="col" className={th}>Check</th><th scope="col" className={th}>Tolerance</th><th scope="col" className={th}>Largest difference</th></tr></thead>
          <tbody className="align-top">
            <tr className="border-t border-white/8"><td className={td}>Ayanamsa, 8 dates 1900–2100 (Swiss Ephemeris)</td><td className={td}>0.002°</td><td className={td}>0.0001°</td></tr>
            <tr className="border-t border-white/8"><td className={td}>Lagna, 18 charts (Swiss Ephemeris)</td><td className={td}>sign exact, 0.02°</td><td className={td}>0.002° (7″)</td></tr>
            <tr className="border-t border-white/8"><td className={td}>Nine grahas, 3 charts (Swiss Ephemeris)</td><td className={td}>0.02°</td><td className={td}>0.0015° (5″)</td></tr>
            <tr className="border-t border-white/8"><td className={td}>Sunrise and sunset, {PANCHANG_REFERENCE_DAYS} days (NASA JPL DE421)</td><td className={td}>1 minute</td><td className={td}>3 seconds</td></tr>
            <tr className="border-t border-white/8"><td className={td}>Tithi, nakshatra, yoga and karana end times, {PANCHANG_REFERENCE_DAYS} days (NASA JPL DE421)</td><td className={td}>2 minutes</td><td className={td}>12 seconds</td></tr>
          </tbody>
        </table>
        <p>
          The panchang days are 20 places — from Thiruvananthapuram to Srinagar, plus Kathmandu, Dubai, Singapore,
          London, New York, Toronto and Sydney — on 12 dates of 2026, including daylight-saving changes. The reference
          charts we pass are listed below. One of them (L01) has the Moon 0.009° from the end of the zodiac; the chart
          marks it as borderline, because no calculation can promise which side such a Moon falls.
        </p>
      </>
    ),
  },
  {
    heading: 'Reference charts we pass',
    body: (
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Reference charts">
        <table className="w-full min-w-[32rem] text-sm">
          <caption className="sr-only">Reference birth charts and their Lagna and Moon</caption>
          <thead><tr><th scope="col" className={th}>Chart</th><th scope="col" className={th}>Place</th><th scope="col" className={th}>Local time</th><th scope="col" className={th}>Lagna</th><th scope="col" className={th}>Moon</th></tr></thead>
          <tbody>
            {vectors.lagna_cases.map((c) => (
              <tr key={c.id} className="border-t border-white/8">
                <td className={td}>{c.id}</td>
                <td className={td}>{c.place}</td>
                <td className={td}>{c.local.replace('T', ' ')}</td>
                <td className={td}>{c.lagna_sign}</td>
                <td className={td}>{c.moon_nakshatra} {c.moon_pada}, {c.moon_sign}{c.moon_borderline ? ' (borderline)' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-white/60">
          Plus all nine grahas for {vectors.graha_cases.map((c) => `${c.place} ${c.local.replace('T', ' ')}`).join(', ')}.
        </p>
      </div>
    ),
  },
  {
    heading: 'Known limits',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>A birth time that is a few minutes out can change the Lagna, and an hour can change the Moon’s nakshatra. The charts say when this is likely.</li>
        <li>Old local times: before the 1950s the time written on a record may not be the time the zone database assumes. Use the “Advanced” offset if you know it.</li>
        <li>Sunrise is for a sea-level horizon; hills, buildings and altitude can shift what you see by a few minutes.</li>
        <li>The reference checks cover 1900–2100. Dates far outside that range have not been checked.</li>
        <li>Regional panchangs can differ on vrat rules, so a date may differ by a day from your family’s calendar.</li>
        <li>
          Astrology is a tradition of reflection, not a science of prediction. See the{' '}
          <Link to="/disclaimer" className={link}>disclaimer</Link>.
        </li>
      </ul>
    ),
  },
];

export default function HowWeCalculate() {
  return (
    <LegalLayout
      eyebrow="Method"
      title="How we calculate"
      seoTitle="How We Calculate Charts and Panchang · VediCosmic"
      updated="23 October 2026"
      intro="The engine, the conventions and the checks behind every chart, panchang and timing on VediCosmic — and the limits you should know about."
      sections={sections}
    />
  );
}
