import { Link } from 'react-router-dom';
import { LegalLayout, type LegalSection } from './legal/LegalLayout';
import { ENGINE } from '@/engine/sky';
import { POLAR_LATITUDE } from '@/engine/ascendant';
import vectors from '../../tests/golden/vectors.json';
import { NUMEROLOGY_REFERENCE_CASES, PANCHANG_REFERENCE_DAYS } from '@/content/referenceChecks';
import { METHOD_SECTIONS } from '@/content/methodSections';
import { NUMEROLOGY_ENGINE } from '@/engine/numerology/version';

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
    id: 'ayanamsa', tools: METHOD_SECTIONS.ayanamsa,
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
    id: 'lagna-houses', tools: METHOD_SECTIONS['lagna-houses'],
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
    id: 'grahas', tools: METHOD_SECTIONS.grahas,
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
    id: 'time-place', tools: METHOD_SECTIONS['time-place'],
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
    id: 'panchang', tools: METHOD_SECTIONS.panchang,
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
    id: 'vrat-dates', tools: METHOD_SECTIONS['vrat-dates'],
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
    id: 'vimshottari-dasha', tools: METHOD_SECTIONS['vimshottari-dasha'],
    body: (
      <p>
        The first period belongs to the lord of the Moon’s birth nakshatra, and the share of it still to run is the share of
        the nakshatra the Moon had yet to cross. Periods follow the order Ketu 7 years, Venus 20, Sun 6, Moon 10, Mars 7,
        Rahu 18, Jupiter 16, Saturn 19, Mercury 17, with years of 365.25 days; sub-periods are in the same proportions.
      </p>
    ),
  },
  {
    heading: 'Numerology: one method on every page',
    id: 'numerology', tools: METHOD_SECTIONS.numerology,
    body: (
      <>
        <p>
          The numerology calculators share one set of rules ({NUMEROLOGY_ENGINE.name} {NUMEROLOGY_ENGINE.version}), so a date of
          birth gives the same Mulank, Bhagyank and Life Path on whichever page you enter it. Dates are handled as plain
          day, month and year numbers, so the result never shifts with your time zone, and an impossible date such as
          31 February is refused.
        </p>
        <p>
          Numerology has no independent reference to test against in the way astronomy has. Our tests fix this method and
          keep every page on it; they cannot show that the method is the right one. Where teachers differ, the sections
          below say which rule we follow.
        </p>
      </>
    ),
  },
  {
    heading: 'Lo Shu grid, Driver, Conductor and Kua',
    id: 'numerology-loshu', tools: METHOD_SECTIONS['numerology-loshu'],
    body: (
      <>
        <ul className="list-disc space-y-1 pl-5">
          <li>Driver (Mulank): the day of the month added down to one digit. Conductor (Bhagyank): every digit of the full date added down to one digit. Neither keeps 11, 22 or 33.</li>
          <li>Grid: every digit of the day, month and four-digit year is written in its cell of the square, whose rows are 4 9 2, 3 5 7 and 8 1 6. Zero has no cell and is left out.</li>
          <li>Added numbers: the Conductor and the Kua number are written into the grid as well. So is the Driver, except when the birth day is 1 to 9, 10, 20 or 30, because that day already puts the Driver’s digit in the grid.</li>
          <li>Kua: the digits of the calendar year of birth added down to one digit; 11 minus that digit for a man, 4 plus that digit for a woman, added down again. A result of 5 is read as 2 for a man and 8 for a woman.</li>
          <li>Lines: the three rows, three columns and two diagonals are each reported as complete, two of three, one of three or empty.</li>
          <li>Kua directions: the four favourable directions of the Eight Mansions school of feng shui for each Kua number.</li>
          <li>Arrows: a line with all three of its numbers is drawn as an arrow on the grid. 4-5-6 is the Golden Raj Yog and 2-5-8 the Silver Raj Yog.</li>
          <li>Maha Dasha: it starts at birth with the Driver. Each number runs for as many years as the number, and the numbers follow in order, 1 coming after 9.</li>
          <li>Antar Dasha: one year, from birthday to birthday. The birth day, the birth month, the last two digits of that year and the number of the weekday on which the birthday falls are added down to one digit. Weekday numbers are Sunday 1, Monday 2, Tuesday 9, Wednesday 5, Thursday 3, Friday 6 and Saturday 8.</li>
          <li>Pratyantar Dasha: nine parts of the year, starting with the Antar Dasha number. Number n lasts 8 times n days, the longer ones a day more so that the nine fill 365 days; the last one ends on the next birthday.</li>
          <li>Dasha grid: the Maha Dasha and Antar Dasha numbers are added to the grid for as long as they run, and the page lists any line this completes.</li>
          <li>Numero Vastu: with South at the top of the square, 1 is North, 2 South-West, 3 East, 4 South-East, 5 the centre, 6 North-West, 7 West, 8 North-East and 9 South.</li>
        </ul>
        <p>
          Other teachers fill the grid from the date digits alone, write the Driver every time, use only the last two
          digits of the year, or leave the Kua out. Feng shui teachers who count the Chinese solar year use the previous
          year for births before 4 February; the Lo Shu page tells you when that would change your Kua. Each of these is
          one setting in our code, so a rule can be changed and re-tested in one place.
        </p>
        <p>
          The dasha here is numerology’s own, counted from the date of birth. It is separate from the Vimshottari dasha
          of a birth chart. Teachers differ on whether the year enters the Antar Dasha as two digits or four, on where
          the year turns for a 29 February birthday (we use 28 February), and on whether the short periods are exactly
          8 days per number; those three are settings too.
        </p>
      </>
    ),
  },
  {
    heading: 'Life Path and the Western name numbers',
    id: 'numerology-western', tools: METHOD_SECTIONS['numerology-western'],
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Life Path: the month, the day and the year are each added down first, keeping 11, 22 and 33, then added together and reduced again. Adding all eight digits in one line always gives the same single digit but can give a different master number; where it does, the page shows both.</li>
        <li>Name numbers use the Pythagorean letter values (A, J, S = 1 through I, R = 9), word by word. Expression takes every letter, Soul Urge the vowels A, E, I, O and U, and Personality the consonants. Y is always a consonant.</li>
        <li>Personal year: the birth month and day added to the calendar year, reduced to one digit; it changes on 1 January. Personal month adds the calendar month, and personal day the day of the month.</li>
        <li>Pinnacles: month plus day, day plus year, the sum of those two, and month plus year, each from single digits. The first ends at 36 minus the Life Path digit and the next two last nine years each. Challenges are the differences between the same pairs.</li>
        <li>Hidden Passion: the number carried by the most letters of the name; a tie is shown as a tie. Subconscious Self: how many of the nine numbers the name carries at all.</li>
        <li>Balance: the first letter of each word of the name, added down to one digit. Rational Thought: the letters of the first word plus the day of birth, reduced with 11 and 22 kept.</li>
        <li>Cornerstone, Capstone and First Vowel: the first letter, last letter and first vowel of the first word of the name.</li>
        <li>Planes of Expression: D, E, M, W are physical; A, G, H, J, L, N, P mental; B, I, O, R, S, T, X, Z emotional; C, F, K, Q, U, V, Y intuitive.</li>
      </ul>
    ),
  },
  {
    heading: 'Chaldean name numbers',
    id: 'numerology-names', tools: METHOD_SECTIONS['numerology-names'],
    body: (
      <>
        <p>
          Letter values are those printed by Cheiro (Count Louis Hamon) in his Book of Numbers, 1926: A, I, J, Q, Y = 1;
          B, K, R = 2; C, G, L, S = 3; D, M, T = 4; E, H, N, X = 5; U, V, W = 6; O, Z = 7; F, P = 8. No letter is 9, and a
          digit typed in a name keeps its own value.
        </p>
        <p>
          The compound number is the total of the whole name and the root is that total added down to one digit. Cheiro
          describes the compounds from 10 to 52; a larger total has its digits added until it falls in that range. His
          readings are restated in plain words, and his sterner warnings are given as cautions about conduct, not as
          forecasts.
        </p>
      </>
    ),
  },
  {
    heading: 'Friendly numbers',
    id: 'numerology-relations', tools: METHOD_SECTIONS['numerology-relations'],
    body: (
      <>
        <p>
          Indian numerology gives each number a planet: 1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu,
          8 Saturn, 9 Mars. Wherever a page speaks of friendly numbers, lucky numbers, the harmony of Driver and Conductor,
          or how a mobile number sits with a date of birth, it reads one table of friendships between those planets.
        </p>
        <p>
          For the seven visible planets the table is the natural friendship (naisargika maitri) of the Brihat Parashara
          Hora Shastra. Rahu and Ketu are not in that list, so we follow the convention most teachers use: Rahu sides with
          Mercury, Venus and Saturn, and Ketu with Mars, Venus and Saturn.
        </p>
        <p>
          The Mobile Number page turns two of these comparisons into a compatibility level. The root of the phone number
          is compared with the Mulank and with the Bhagyank; each comparison scores from −2 (unfriendly on both sides) to
          +2 (friends on both sides, or the same number), and the total from −4 to +4 is shown as a level from 1 to 5 with
          its working. No page turns the friendships into a percentage. The two-digit combinations on that page come from
          a separate chart, the one teachers of mobile numerology use, and are not worked out from this table.
        </p>
      </>
    ),
  },
  {
    heading: 'How we check the results',
    id: 'checks',
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
        <p>
          The numerology rules are checked differently, since there is nothing independent to compare them with:{' '}
          {NUMEROLOGY_REFERENCE_CASES} cases worked out by hand must match exactly, every date from 1900 to 2099 is tested for
          a consistent grid, and the Conductor must equal the Life Path digit on all of them.
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
    id: 'limits',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>A birth time that is a few minutes out can change the Lagna, and an hour can change the Moon’s nakshatra. The charts say when this is likely.</li>
        <li>Old local times: before the 1950s the time written on a record may not be the time the zone database assumes. Use the “Advanced” offset if you know it.</li>
        <li>Sunrise is for a sea-level horizon; hills, buildings and altitude can shift what you see by a few minutes.</li>
        <li>The reference checks cover 1900–2100. Dates far outside that range have not been checked.</li>
        <li>Regional panchangs can differ on vrat rules, so a date may differ by a day from your family’s calendar.</li>
        <li>
          Astrology and numerology are traditions of reflection, not sciences of prediction. See the{' '}
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
      seoTitle="How We Calculate Charts, Panchang & Numerology · VediCosmic"
      updated="14 November 2026"
      intro="The engine, the conventions and the checks behind every chart, panchang, timing and numerology result on VediCosmic, and the limits you should know about."
      sections={sections}
    />
  );
}
