import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'astrology',
  lastReviewed: '2026-11-15',
  lede: 'Enter your date, time and place of birth to make a free kundli. You get your Lagna, Moon sign and Sun sign, all nine grahas with their sign, degree, nakshatra and pada, the twelve houses, and your Vimshottari dasha periods, worked out on your own device.',
  toolHeading: 'Make your kundli',
  about: {
    heading: 'What a kundli is',
    paragraphs: [
      'A kundli, or janam kundli, is a map of the sky for the moment and place of a birth. Vedic astrology, Jyotish, reads it from the sidereal zodiac, which is measured against the stars. The Western zodiac is measured from the March equinox, and the two now stand about 24 degrees apart, so a Vedic Sun sign is often the sign before the Western one.',
      'Three points carry most of a reading. The Lagna, or Ascendant, is the sign rising on the eastern horizon, and it sets the houses. The Moon’s sign is your rashi, the one Indian horoscopes are written for, and the Moon’s nakshatra is your birth star. The Sun’s sign completes the three.',
      'This page calculates the chart and describes each of those three signs in a few lines. It does not attempt a full reading, which is the work of an astrologer.',
    ],
  },
  howToUse: {
    heading: 'How to make your kundli',
    steps: [
      { name: 'Enter your date of birth', text: 'Choose the day, the month and the year.' },
      { name: 'Enter your time of birth', text: 'Use the time on your birth record, as exactly as you have it. If you do not know it, tick the box: the chart is then drawn for noon, without a Lagna, houses or dasha.' },
      { name: 'Choose your place of birth', text: 'Type the town and pick it from the list. Its time zone comes with it, including any daylight saving in force that year. For an old record kept in local time, set the offset yourself under Advanced.' },
      { name: 'Read the chart', text: 'The wheel, the three sign cards, the table of grahas, the houses and the dasha table appear together.' },
    ],
  },
  howToRead: {
    heading: 'How to read your birth chart',
    items: [
      { term: 'Rashi chakra', text: 'The wheel shows the twelve signs with Mesha at the top and each graha at its degree. A dashed line marks the Lagna.' },
      { term: 'Lagna, Moon and Sun', text: 'Each card gives the sign, the degree within it, and the nakshatra and pada.' },
      { term: 'Grahas', text: 'The table lists the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu with sign, degree, nakshatra, pada and house. R marks a graha in retrograde motion. Rahu and Ketu are the mean nodes of the Moon.' },
      { term: 'Houses', text: 'Houses are whole signs. The sign of the Lagna is the first house, the next sign the second, and so on round the zodiac.' },
      { term: 'Vimshottari dasha', text: 'A cycle of planetary periods that adds up to 120 years, set going by the Moon’s nakshatra at birth. The page names the mahadasha and antardasha running today and lists every mahadasha from birth.' },
      { term: 'Notes under the chart', text: 'Where a result is uncertain the page says so: when the Lagna would change sign within five minutes of the time you gave, when the Moon would change nakshatra within half an hour, and when a position sits on the very edge of a sign.' },
    ],
  },
  method: {
    heading: 'How this kundli is calculated',
    anchor: 'lagna-houses',
    paragraphs: [
      'Positions of the grahas come from the Astronomy Engine library and are converted to the sidereal zodiac with the Lahiri ayanamsa, the one chosen for the Indian national calendar. The Lagna is found from local sidereal time and the latitude of the birth place.',
      'The birth time is read in the birth place’s own time zone, by the rules that applied on that date. A time that fell in a clock change is pointed out, and where a time occurred twice you can choose which one to use.',
      'The calculation is tested against reference charts, which are listed on the method page.',
    ],
    limits: [
      'No Lagna is given beyond 66 degrees of latitude, where some signs never rise.',
      'A rounded or misremembered birth time is the usual reason two kundlis disagree. Four minutes of time moves the Lagna by about one degree.',
      'Only the rashi chart is drawn. Divisional charts such as the Navamsa are not included.',
      'A chart describes what the tradition reads. It is not a prediction of events.',
    ],
  },
  faq: {
    heading: 'Kundli: questions people ask',
    items: [
      { id: 'kundli-need', header: 'What do I need to make a kundli?', body: 'Your date of birth, your time of birth and the town you were born in. The time matters most for the Lagna and the houses, so take it from a birth certificate or hospital record if you can.' },
      { id: 'kundli-no-time', header: 'Can I make a kundli without a birth time?', body: 'Yes, in part. The page then shows the signs and nakshatras of the grahas at noon and tells you whether the Moon changed sign or nakshatra during that day. It cannot give the Lagna, the houses or the dasha, which all depend on the time.' },
      { id: 'kundli-rashi', header: 'Which is my rashi, the Moon sign or the Sun sign?', body: 'In Indian usage your rashi is your Moon sign: the sidereal sign the Moon was in when you were born. Newspaper horoscopes in the West use the tropical Sun sign, which is a different thing and is often a different sign.' },
      { id: 'kundli-western', header: 'Why is my Vedic sign different from my Western sign?', body: 'Because the two zodiacs start from different points. The sidereal zodiac used here is fixed to the stars, while the tropical zodiac follows the equinox, and the gap between them is now about 24 degrees. For most people the Sun therefore falls in the sign before their Western one.' },
      { id: 'kundli-ayanamsa', header: 'Which ayanamsa does this kundli use?', body: 'Lahiri, also called Chitrapaksha, in its mean form. It is the ayanamsa most Indian panchangs and astrologers use. A chart made with another ayanamsa, such as Raman, can differ from this one by up to about a degree and a half.' },
      { id: 'kundli-dasha', header: 'How is the Vimshottari dasha worked out?', body: 'From the Moon’s position in its nakshatra at birth. Each nakshatra belongs to one of nine grahas, whose period comes first, and the part of the nakshatra the Moon had still to cross decides how much of that period remains. The periods then follow in a fixed order and total 120 years.' },
      { id: 'kundli-private', header: 'Is my birth data stored?', body: 'No. The chart is calculated in your browser and your birth details are not sent to us. If you press save, a one-line summary of the chart is kept on your own device.' },
    ],
  },
  relatedTools: [
    { slug: 'nakshatra', why: 'Explore your birth star and the other 26 nakshatras on a wheel.' },
    { slug: 'panchang', why: 'See the tithi, nakshatra and Rahu Kaal for any day in your city.' },
    { slug: 'life-path', why: 'Read the same date of birth through numerology.' },
  ],
  features: [
    'Lagna, Moon sign and Sun sign',
    'Nine grahas with sign, degree, nakshatra and pada',
    'Whole-sign houses',
    'Vimshottari mahadasha and antardasha',
    'Rashi chakra wheel',
    'Works without a birth time, in part',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Hindu astrology', sameAs: 'https://en.wikipedia.org/wiki/Hindu_astrology' },
  aliases: ['Janam Kundli', 'Free Kundli', 'Vedic Birth Chart Calculator'],
  frame: 'tall',
  keywords: { primary: 'free kundli', secondary: ['janam kundli', 'kundli by date of birth', 'vedic birth chart', 'lagna calculator', 'vimshottari dasha calculator'] },
};

export default content;
