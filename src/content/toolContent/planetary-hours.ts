import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'planetary-hours',
  lastReviewed: '2026-11-15',
  lede: 'See which planet rules the present hour where you are, and the full list of the day’s 24 horas with their start times. The hours are counted from your local sunrise, so they are not sixty minutes long and they differ from city to city.',
  toolHeading: 'Today’s horas for your city',
  about: {
    heading: 'What hora means',
    paragraphs: [
      'A hora is a planetary hour. The time from sunrise to sunset is divided into twelve equal parts and the time from sunset to the next sunrise into twelve more, and each part is given to one of the seven visible grahas: the Sun, Moon, Mars, Mercury, Jupiter, Venus and Saturn. The Sanskrit word hora comes from the same Greek word as the English hour.',
      'The first hora of a day belongs to the planet the weekday is named after: the Sun on Sunday, the Moon on Monday, Mars on Tuesday. The others follow in a fixed sequence, and that sequence is the reason the weekdays come in the order they do.',
      'Tradition matches an activity to the planet of the hour, such as study in a Mercury hora or a ceremony in a Jupiter hora. The page lists these associations. They are a custom for choosing a time, not a forecast.',
    ],
  },
  howToUse: {
    heading: 'How to use the hora calculator',
    steps: [
      { name: 'Choose your place', text: 'Type your town and pick it from the list. The same place is then used by the panchang and the vrat calendar.' },
      { name: 'Read the current hora', text: 'The card at the top names the planet of the hour, when the hour began and ends, and what that planet is traditionally linked with. It updates by itself.' },
      { name: 'Plan from the lists', text: 'The day horas and the night horas are listed with their start times, so you can find the next hour of a particular planet.' },
    ],
  },
  howToRead: {
    heading: 'How to read the planetary hours',
    items: [
      { term: 'Hora day', text: 'The day shown runs from sunrise to the next sunrise. Before sunrise you are still in the night horas of the day before.' },
      { term: 'Day and night horas', text: 'Twelve of each. In summer a day hora is longer than a night hora, and in winter the reverse. Only near the equinoxes are both close to sixty minutes.' },
      { term: 'Planet of the hour', text: 'Each hora has one planet. The sequence is Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars, then round again.' },
      { term: 'Associations', text: 'A short list of what the planet’s hour is traditionally used for, shown for the hora that is running.' },
    ],
  },
  method: {
    heading: 'How the horas are calculated',
    anchor: 'panchang',
    paragraphs: [
      'Sunrise, sunset and the following sunrise are calculated for your place. The daytime is divided by twelve, and so is the night. The first hora starts at sunrise with the lord of the weekday, and each later hora takes the next planet in the sequence, which is the order of the planets from slowest to fastest as seen from Earth.',
      'Sunrise is the moment the Sun’s upper edge appears on a sea-level horizon. The sunrise and sunset times behind these hours are tested against NASA JPL data and agree to within a minute.',
    ],
    example: 'On Sunday 15 November 2026 in New Delhi the Sun rises at 6:44 am and sets at 5:28 pm. A daytime of 10 hours 44 minutes gives day horas of about 54 minutes. The first belongs to the Sun, the second to Venus and the third to Mercury.',
    limits: [
      'Some Western sources count planetary hours from 6 am or from midnight. Jyotish counts them from sunrise, and so does this page.',
      'The associations are traditional. Nothing about an hour makes an action succeed or fail.',
    ],
  },
  faq: {
    heading: 'Hora: questions people ask',
    items: [
      { id: 'hora-now', header: 'Which hora is running now?', body: 'The card at the top of the calculator shows it for your city, with the time it ends. The answer changes about every hour and is different in each place, because the horas are counted from local sunrise.' },
      { id: 'hora-length', header: 'Why is a hora not exactly one hour long?', body: 'Because twelve horas must fill the daytime, however long it is, and twelve more must fill the night. In Delhi in late June a day hora lasts about 70 minutes and a night hora about 50. In December it is the other way round.' },
      { id: 'hora-shubh', header: 'Which hora is good for starting something?', body: 'Tradition favours the horas of Jupiter, Venus, Mercury and the Moon for most beginnings, and gives the Sun’s hora to official matters. The horas of Saturn and Mars are usually kept for work that suits them, such as steady labour or physical effort.' },
      { id: 'hora-order', header: 'What is the order of the horas?', body: 'Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars. Start with the planet of the weekday at sunrise and move along that list, returning to the beginning after Mars. After 24 horas the list lands on the planet of the next weekday.' },
      { id: 'hora-chog', header: 'What is the difference between hora and Choghadiya?', body: 'Both divide the day and the night from sunrise and sunset. Hora makes twelve parts of each and names them after planets. Choghadiya makes eight parts of each and classes them as good, neutral or to be avoided. The panchang page shows the Choghadiya.' },
      { id: 'hora-date', header: 'Can I see the horas for another date?', body: 'Yes. Open the panchang for that date and follow its link to the hora calculator, which then shows that day’s horas in place of today’s.' },
    ],
  },
  relatedTools: [
    { slug: 'panchang', why: 'See the tithi, Rahu Kaal and Choghadiya for the same day.' },
    { slug: 'vrat-calendar', why: 'Check whether today or tomorrow is an Ekadashi or a Pradosh.' },
    { slug: 'sadhana', why: 'Fit a short practice into the hour that suits it.' },
    { slug: 'astrology', why: 'Find which planets hold your Lagna, Moon and Sun.' },
  ],
  features: [
    'Current hora for your city',
    'All 24 planetary hours with start times',
    'Counted from local sunrise',
    'Traditional uses of each planet’s hour',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Planetary hours', sameAs: 'https://en.wikipedia.org/wiki/Planetary_hours' },
  aliases: ['Planetary Hours Calculator', 'Hora Today'],
  frame: 'tall',
  keywords: { primary: 'hora calculator', secondary: ['hora today', 'planetary hours', 'shubh hora today', 'hora timings'] },
};

export default content;
