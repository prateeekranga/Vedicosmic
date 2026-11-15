import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'vrat-calendar',
  lastReviewed: '2026-11-15',
  lede: 'See the dates of the next Ekadashi, Pradosh, Purnima, Amavasya, Sankashti Chaturthi and Durga Ashtami for your city over the coming 45 days. Each date is worked out from the tithi at your local sunrise, sunset or moonrise, by the rule its tradition follows.',
  toolHeading: 'Vrat dates for your city',
  about: {
    heading: 'What the vrat calendar shows',
    paragraphs: [
      'A vrat is a religious observance, most often a fast, tied to a tithi of the lunar month. Because a tithi is not a calendar day, the date of a vrat has to be worked out afresh each month, and it can differ by a day between two cities.',
      'This page lists six observances that return every lunar month: the two Ekadashis, the two Pradosh days, Purnima, Amavasya, Sankashti Chaturthi and Durga Ashtami. It does not list the annual festivals.',
    ],
  },
  howToUse: {
    heading: 'How to use the vrat calendar',
    steps: [
      { name: 'Choose your place', text: 'Search for your town. Dates are calculated for that place and shown in its local calendar.' },
      { name: 'See what comes next', text: 'The first card names the next observance and how many days away it is.' },
      { name: 'Scan the list', text: 'Every observance in the next 45 days is listed in order, with its date and a line on what it is kept for.' },
      { name: 'Mark the ones you keep', text: 'The bell beside a date marks it while the page is open. It does not send a notification.' },
    ],
  },
  howToRead: {
    heading: 'How to read the vrat dates',
    items: [
      { term: 'Ekadashi', text: 'The eleventh tithi of each fortnight, kept as a fast for Vishnu. It is shown on the day whose sunrise falls in Ekadashi.' },
      { term: 'Pradosh', text: 'The thirteenth tithi, kept for Shiva at dusk. It is shown on the day when Trayodashi is in force in the 2 hours 24 minutes after sunset, and it is named for its weekday, as in Soma Pradosh on a Monday.' },
      { term: 'Purnima and Amavasya', text: 'The full moon and the new moon, each on the day whose sunrise falls in that tithi.' },
      { term: 'Sankashti Chaturthi', text: 'The fourth tithi of the dark fortnight, kept for Ganesha until the Moon is seen. It is shown on the day when Chaturthi is in force at moonrise.' },
      { term: 'Durga Ashtami', text: 'The eighth tithi of the bright fortnight, kept for the Goddess.' },
      { term: 'The sky now', text: 'The card at the top gives the tithi, the Moon’s nakshatra and the Moon’s phase at this moment.' },
    ],
  },
  method: {
    heading: 'How the vrat dates are calculated',
    anchor: 'vrat-dates',
    paragraphs: [
      'For each of the next 45 days the page finds sunrise, sunset and moonrise at your place and the tithi in force at each. A tithi that begins and ends between two sunrises, and so touches neither, is given to the day it falls in. A tithi in force at two sunrises running is shown on the first of the two days.',
      'The tithi end times behind these dates are tested against NASA JPL data and agree to within two minutes.',
    ],
    limits: [
      'Vaishnava tradition often keeps Ekadashi a day later than the rule used here, when Dashami is still present at dawn. Follow your own sampradaya’s calendar for the fast.',
      'Annual festivals such as Diwali, Holi and Maha Shivaratri have rules of their own and are not listed.',
      'A date that falls near a change of tithi can differ from a printed panchang made for another city.',
    ],
  },
  faq: {
    heading: 'Ekadashi and vrat dates: questions people ask',
    items: [
      { id: 'vrat-next', header: 'When is the next Ekadashi?', body: 'The calendar shows it for your city, with the number of days to go. There are two in each lunar month, one in the bright fortnight and one in the dark, about fifteen days apart.' },
      { id: 'vrat-city', header: 'Why is Ekadashi on different dates in different places?', body: 'The fast is kept on the day whose sunrise falls in the Ekadashi tithi. The tithi begins at one instant for the whole world, but local sunrise does not, so the date can differ between India and North America. Different rules between traditions add a second source of difference.' },
      { id: 'vrat-pradosh', header: 'How is the date of Pradosh decided?', body: 'By the tithi at dusk, not at sunrise. Pradosh is kept on the day when Trayodashi, the thirteenth tithi, is in force during the 2 hours 24 minutes after sunset. That is why it sometimes falls on a day whose sunrise is still in Dwadashi.' },
      { id: 'vrat-sankashti', header: 'When does the Sankashti Chaturthi fast end?', body: 'Traditionally at moonrise, once the Moon has been seen. The calendar places the vrat on the day when the fourth tithi of the dark fortnight is in force at moonrise. The panchang page gives the time of moonrise for your city.' },
      { id: 'vrat-bell', header: 'Will the bell send me a reminder?', body: 'No. The bell only marks a date while this page is open. The site has no accounts and sends no notifications, so add the date to your own calendar if you want an alert.' },
      { id: 'vrat-rule', header: 'Does this calendar follow Smarta or Vaishnava rules?', body: 'It uses the sunrise rule, which is the common Smarta practice: Ekadashi is the day whose sunrise falls in that tithi. Vaishnava calendars sometimes place the fast a day later. Important fasts are best confirmed with the panchang of your own tradition.' },
    ],
  },
  relatedTools: [
    { slug: 'panchang', why: 'See a tithi’s exact end time and the moonrise for any date.' },
    { slug: 'sadhana', why: 'Keep a daily practice going between the fast days.' },
    { slug: 'planetary-hours', why: 'Find the hour of a particular planet on a vrat day.' },
    { slug: 'yantra', why: 'Watch the Sri Yantra and thirteen other yantras drawn step by step.' },
  ],
  features: [
    'Next Ekadashi, Pradosh, Purnima and Amavasya',
    'Sankashti Chaturthi and Durga Ashtami',
    'Dates for your own city',
    'The next 45 days in one list',
    'Current tithi and Moon phase',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Vrata', sameAs: 'https://en.wikipedia.org/wiki/Vrata' },
  aliases: ['Ekadashi Calendar', 'Hindu Fasting Calendar'],
  frame: 'tall',
  keywords: { primary: 'ekadashi dates', secondary: ['next ekadashi', 'vrat calendar', 'pradosh vrat date', 'purnima date', 'amavasya date', 'sankashti chaturthi date'] },
};

export default content;
