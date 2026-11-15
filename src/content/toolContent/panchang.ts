import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'panchang',
  lastReviewed: '2026-11-15',
  lede: 'See today’s panchang for your city: tithi, nakshatra, yoga and karana with the times they end, sunrise, sunset, moonrise and moonset, the lunar month, Rahu Kaal, Abhijit and Brahma muhurta, and the day and night Choghadiya. Choose any date and any place.',
  toolHeading: 'Panchang for a date and place',
  about: {
    heading: 'What a panchang is',
    paragraphs: [
      'Panchang means five limbs. It is the Hindu almanac for a single day, and its five parts are the vara (weekday), the tithi (lunar day), the nakshatra (the Moon’s mansion), the yoga and the karana. Each one measures where the Sun and Moon are, so each can be calculated for any date.',
      'A panchang is always made for a place. Its day begins at sunrise, and the Sun rises over an hour earlier in Guwahati than in Ahmedabad, so the tithi at sunrise can differ between two cities on the same date. That is why this page asks for your city, and why a printed panchang names the city it was made for.',
      'Beside the five limbs the page gives the timings people look up most: Rahu Kaal, Yamaganda and Gulika Kaal, the Abhijit and Brahma muhurtas, and the Choghadiya table that is popular in western and northern India.',
    ],
  },
  howToUse: {
    heading: 'How to use the panchang',
    steps: [
      { name: 'Choose your place', text: 'Type the name of your town and pick it from the list, or press “Use my location”. The place is remembered on your device for next time.' },
      { name: 'Choose the date', text: 'The page opens on today. Use the arrows to move a day at a time, or pick any date from 1900 to 2100.' },
      { name: 'Read the five limbs', text: 'Each card shows the value at sunrise and when it ends. If another value begins before the next sunrise, it is listed underneath.' },
      { name: 'Check the timings', text: 'The dial and the list give Rahu Kaal and the muhurtas, and the two tables give the Choghadiya of the day and of the night. On today’s date the part running now is marked.' },
    ],
  },
  howToRead: {
    heading: 'How to read the panchang',
    items: [
      { term: 'Tithi', text: 'The lunar day. There are thirty in a lunar month, fifteen in the bright half (Shukla paksha) and fifteen in the dark half (Krishna paksha). A tithi lasts between about 19 and 26 hours, so it rarely begins and ends with the calendar day.' },
      { term: 'Nakshatra', text: 'The lunar mansion the Moon is passing through, one of 27. The Moon spends about a day in each.' },
      { term: 'Yoga and karana', text: 'Yoga is one of 27 values found by adding the positions of the Sun and Moon. A karana is half a tithi; the one called Vishti, or Bhadra, is traditionally avoided for beginnings.' },
      { term: 'Lunar month', text: 'Given in both counts. In the purnimanta count of north India the month ends at the full moon; in the amanta count of the south and west it ends at the new moon. The two names differ in the dark fortnight. An extra month is labelled Adhika.' },
      { term: 'Rahu Kaal, Yamaganda and Gulika Kaal', text: 'Three parts of the daytime, each about an hour and a half, that tradition avoids for starting something new. Where they fall changes with the weekday.' },
      { term: 'Abhijit and Brahma muhurta', text: 'Abhijit is the muhurta around local noon, traditionally favoured for beginnings except on Wednesdays. Brahma muhurta is the period before dawn kept for meditation and study.' },
      { term: 'Choghadiya', text: 'Eight parts of the day and eight of the night. Amrit, Shubh and Labh are classed good, Char neutral, and Udveg, Kaal and Rog are avoided for beginnings.' },
      { term: 'Moonrise and moonset', text: 'Given for the sunrise-to-sunrise day. About once a month a day passes with no moonrise, or no moonset, and the page says so.' },
    ],
  },
  method: {
    heading: 'How this panchang is calculated',
    anchor: 'panchang',
    paragraphs: [
      'Everything is worked out in your browser from the positions of the Sun and Moon, with the Lahiri ayanamsa for the nakshatra, the yoga and the lunar month. Sunrise and sunset are the moments the Sun’s upper edge meets a sea-level horizon, allowing for the bending of light by the air. Some panchangs use the centre of the Sun’s disc instead, which moves sunrise by a minute or so.',
      'The lunar month runs from new moon to new moon and is named after the sign the Sun enters during it. When the Sun enters no sign in a month, that month is adhika. Rahu Kaal, Yamaganda and Gulika are each one of eight equal parts of the daytime, chosen by weekday, and Abhijit is the eighth of fifteen parts.',
      'The results are checked against an independent calculation from NASA JPL data: sunrise and sunset to within a minute, and moonrise, moonset and the ends of the tithi, nakshatra, yoga and karana to within two minutes.',
    ],
    example: 'On 15 November 2026 in New Delhi, sunrise is at 6:44 am and sunset at 5:28 pm. The tithi at sunrise is Shukla Shashthi of Kartika, which lasts until 2:02 am on the 16th. It is a Sunday, so Rahu Kaal is the last eighth of the daytime, from 4:07 pm to 5:28 pm.',
    limits: [
      'Times are for a sea-level horizon. Hills, tall buildings or a town at altitude shift the sunrise you actually see by a few minutes.',
      'Printed panchangs differ from one another by a minute or two, and now and then by a tithi near sunrise, because they use different ayanamsas, different definitions of sunrise or one fixed reference city.',
      'Rahu Kaal, the muhurtas and Choghadiya are traditional guidance about when to begin something. They are not predictions.',
    ],
  },
  faq: {
    heading: 'Panchang: questions people ask',
    items: [
      { id: 'pan-tithi', header: 'What is today’s tithi?', body: 'The page shows it for your city at the top of the result: the tithi in force at sunrise, the time it ends and the tithi that follows. A festival or fast is usually kept on the day whose sunrise falls in its tithi, though particular vrats have rules of their own.' },
      { id: 'pan-rahu', header: 'What time is Rahu Kaal today?', body: 'It depends on the weekday and on your sunrise and sunset. The daytime is divided into eight equal parts and Rahu Kaal is one of them: the eighth part on Sunday, the second on Monday, the seventh on Tuesday, the fifth on Wednesday, the sixth on Thursday, the fourth on Friday and the third on Saturday.' },
      { id: 'pan-city', header: 'Why does the panchang change from city to city?', body: 'Because the day starts at local sunrise. The tithi and nakshatra change at the same instant everywhere, but that instant falls before sunrise in one city and after it in another, so two cities can show different tithis for one date. Rahu Kaal and Choghadiya also move with local sunrise and sunset.' },
      { id: 'pan-month', header: 'What is the difference between amanta and purnimanta months?', body: 'An amanta month ends at the new moon and a purnimanta month ends at the full moon. The bright fortnight has the same month name in both. In the dark fortnight the purnimanta name is one month ahead, which is why Diwali falls in Ashwin in the south and west and in Kartika in the north.' },
      { id: 'pan-adhika', header: 'What is an adhika month?', body: 'It is an extra lunar month, added about once every 32 or 33 months so that the lunar year keeps pace with the solar year. It is the month in which the Sun does not move into a new sign. The page labels it Adhika, followed by the name it shares with the month after it.' },
      { id: 'pan-chog', header: 'How is Choghadiya calculated?', body: 'The time from sunrise to sunset is divided into eight equal parts, and so is the time from sunset to the next sunrise. The first part of the day belongs to the planet of the weekday and the rest follow a fixed order. Each part lasts about an hour and a half, a little longer by day in summer and by night in winter.' },
      { id: 'pan-abhijit', header: 'Why is Abhijit muhurta not used on Wednesday?', body: 'Tradition makes that one exception, and the page notes it on Wednesdays. On other days Abhijit, the eighth of the fifteen muhurtas of the daytime, is counted favourable for beginning most kinds of work.' },
    ],
  },
  relatedTools: [
    { slug: 'planetary-hours', why: 'See the planetary hour running now, counted from the same sunrise.' },
    { slug: 'vrat-calendar', why: 'Find the next Ekadashi, Pradosh, Purnima and Amavasya for your city.' },
    { slug: 'nakshatra', why: 'Find the nakshatra the Moon was in when you were born.' },
    { slug: 'sadhana', why: 'Begin the day’s practice with today’s tithi in view.' },
  ],
  features: [
    'Tithi, nakshatra, yoga and karana with end times',
    'Sunrise, sunset, moonrise and moonset',
    'Lunar month in the amanta and purnimanta counts',
    'Rahu Kaal, Yamaganda, Gulika, Abhijit and Brahma muhurta',
    'Day and night Choghadiya',
    'Any date and any city',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Panchangam', sameAs: 'https://en.wikipedia.org/wiki/Panchangam' },
  aliases: ['Daily Panchang', 'Hindu Calendar Today', 'Rahu Kaal Calculator', 'Choghadiya Today'],
  frame: 'tall',
  keywords: { primary: 'today panchang', secondary: ['aaj ka panchang', 'rahu kaal today', 'choghadiya today', 'tithi today', 'abhijit muhurat today', 'moonrise time today'] },
};

export default content;
