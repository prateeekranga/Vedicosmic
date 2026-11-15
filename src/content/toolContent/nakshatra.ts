import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'nakshatra',
  lastReviewed: '2026-11-15',
  lede: 'Enter your date, time and place of birth to find your janma nakshatra, the lunar mansion the Moon was in when you were born, with its pada. You can also turn the wheel of all 27 nakshatras and read the ruler, deity and symbol of each.',
  toolHeading: 'Find your birth star',
  about: {
    heading: 'What a nakshatra is',
    paragraphs: [
      'The nakshatras are 27 equal divisions of the zodiac, each 13 degrees 20 minutes wide. The Moon travels through all of them in a little over 27 days, staying about a day in each. They are older than the twelve signs in Indian astronomy and still decide a great deal in the calendar: festival dates, muhurta and the naming of children.',
      'Your janma nakshatra is the one the Moon occupied at the moment you were born. It is often called the birth star. Each nakshatra is divided into four padas, or quarters, and the pada is recorded with it.',
    ],
  },
  howToUse: {
    heading: 'How to use the nakshatra finder',
    steps: [
      { name: 'Enter your birth details', text: 'Choose the date, type the time, and pick the town where you were born. All three are needed, because the Moon moves about half a degree an hour.' },
      { name: 'Press “Find my star”', text: 'The page names your nakshatra and pada and places a small Moon on the wheel at its exact position.' },
      { name: 'Explore the wheel', text: 'Select any of the 27 segments to read about that nakshatra. You do not need to enter anything to do this.' },
    ],
  },
  howToRead: {
    heading: 'How to read your nakshatra result',
    items: [
      { term: 'Nakshatra and pada', text: 'The name of the mansion, in English letters and in Devanagari, and which of its four quarters the Moon was in.' },
      { term: 'Sidereal Moon', text: 'The Moon’s position in degrees round the sidereal zodiac, from 0 to 360. Dividing it into 27 equal parts gives the nakshatra.' },
      { term: 'Ruler, deity and symbol', text: 'Each nakshatra has a ruling graha, a presiding deity and a traditional symbol. The ruling graha is the one whose period opens your Vimshottari dasha.' },
      { term: 'Cautions', text: 'If the Moon would be in the neighbouring nakshatra half an hour earlier or later, the page tells you, since a birth time is seldom exact to the minute.' },
    ],
  },
  method: {
    heading: 'How this nakshatra finder works',
    anchor: 'ayanamsa',
    paragraphs: [
      'The Moon’s position at your birth time is calculated and then moved into the sidereal zodiac by subtracting the Lahiri ayanamsa. The circle is divided into 27 nakshatras of 13°20′ and each of those into four padas of 3°20′.',
      'The birth time is taken in the time zone of the birth place as it stood on that date. If the clocks changed that day and the time you typed happened twice, or not at all, the page explains what it used.',
    ],
    limits: [
      'A position within 0.05° of a boundary is flagged, because no calculation can settle which side it falls on.',
      'The descriptions on the wheel are traditional associations. They are not a forecast.',
    ],
  },
  faq: {
    heading: 'Nakshatra: questions people ask',
    items: [
      { id: 'nak-how', header: 'How do I find my nakshatra by date of birth?', body: 'You need the time and the place as well as the date. The Moon crosses a nakshatra in about a day, so on many dates it changes nakshatra partway through. Enter all three and the page gives the nakshatra and pada for that moment.' },
      { id: 'nak-rashi', header: 'Is my nakshatra the same as my rashi?', body: 'No, though the two are linked. Your rashi is the sign the Moon was in, one of twelve. Your nakshatra is the smaller division inside it, one of 27. Each sign holds two and a quarter nakshatras.' },
      { id: 'nak-pada', header: 'What is a pada in a nakshatra?', body: 'A quarter of a nakshatra, 3 degrees 20 minutes wide. There are 108 padas round the zodiac. The pada is used in choosing the first syllable of a name and in drawing the Navamsa chart.' },
      { id: 'nak-no-time', header: 'Can I find my nakshatra without knowing my birth time?', body: 'Not with certainty on this page, which asks for a time. If you make a kundli here without a birth time, it tells you whether the Moon stayed in one nakshatra for the whole of that day; when it did, that is your nakshatra whatever the hour.' },
      { id: 'nak-27-28', header: 'Are there 27 or 28 nakshatras?', body: 'Twenty-seven are used for the birth star and the dasha. A twenty-eighth, Abhijit, appears in some older lists and is still used in a few muhurta rules.' },
    ],
  },
  relatedTools: [
    { slug: 'astrology', why: 'See the Moon beside the Lagna and the other grahas in a full kundli.' },
    { slug: 'panchang', why: 'Find which nakshatra the Moon is in today, and until when.' },
    { slug: 'planetary-hours', why: 'See which of the seven planets rules the present hour.' },
  ],
  features: [
    'Janma nakshatra and pada from birth details',
    'Wheel of all 27 nakshatras',
    'Ruler, deity and symbol of each nakshatra',
    'Warns when the birth time is close to a change',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Nakshatra', sameAs: 'https://en.wikipedia.org/wiki/Nakshatra' },
  aliases: ['Birth Star Calculator', 'Janma Nakshatra Calculator'],
  frame: 'tall',
  keywords: { primary: 'nakshatra finder', secondary: ['nakshatra by date of birth', 'janma nakshatra', 'birth star calculator', 'nakshatra pada'] },
};

export default content;
