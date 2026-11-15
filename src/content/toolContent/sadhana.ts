import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'sadhana',
  lastReviewed: '2026-11-15',
  lede: 'A starting page for daily practice. It shows today’s tithi and the Moon’s nakshatra for your city, suggests a short three-step sitting of breath, gazing and meditation, and keeps your practice streak and saved readings on your own device, with no account.',
  toolHeading: 'Today’s practice',
  about: {
    heading: 'What daily sadhana means',
    paragraphs: [
      'Sadhana is regular spiritual practice: something done every day, at about the same time, for its own sake. The traditions differ on what to practise, and agree that steadiness matters more than length.',
      'This page is a place to begin from. It tells you what kind of lunar day it is, offers a sequence of three short practices that takes about seventeen minutes, and counts the days in a row on which you finished a session.',
      'Nothing here is prescribed. The sequence is a suggestion, and each of its steps opens a tool you can use for as long or as short a time as you like.',
    ],
  },
  howToUse: {
    heading: 'How to use the daily sadhana page',
    steps: [
      { name: 'Look at the day', text: 'The top card gives today’s tithi, the Moon’s nakshatra and whether the Moon is waxing or waning.' },
      { name: 'Follow the three steps', text: 'Open the breathing timer, then the Trataka gaze, then the Kundalini meditation. Each opens on its own page.' },
      { name: 'Come back tomorrow', text: 'A finished Pranayama, Trataka, Kundalini or japa session counts towards your streak, which is the number of days in a row with a session.' },
    ],
  },
  howToRead: {
    heading: 'How to read the sadhana page',
    items: [
      { term: 'Tithi and nakshatra', text: 'The tithi shown is the one in force at sunrise in your city, as a panchang prints it, with the time it ends. The link beside it opens the full panchang.' },
      { term: 'Today’s sadhana', text: 'Three practices with a suggested length for each. Ticking them off is for your own reference, and the ticks clear when you leave the page.' },
      { term: 'Practice streak', text: 'The number of days in a row on which you completed a session in one of the practice tools.' },
      { term: 'Next observance', text: 'The nearest Ekadashi, Pradosh, full moon or other monthly vrat for your city.' },
      { term: 'Saved on this device', text: 'Readings and reflections you chose to save in other tools are listed at the foot of the page, and each can be deleted there.' },
    ],
  },
  method: {
    heading: 'How the sadhana page works',
    anchor: 'panchang',
    paragraphs: [
      'The tithi and nakshatra are calculated for the city you chose on the panchang, hora or vrat pages, or for New Delhi if you have not chosen one. The day is counted from sunrise, so before dawn the page still shows the tithi of the day before.',
      'Your streak and saved items are kept in your browser’s storage on this device. They are not sent anywhere, and they do not follow you to another phone or computer.',
    ],
    limits: [
      'Clearing your browser data, or using a private window, removes the streak and the saved items.',
      'The suggested sequence is general. It is not instruction from a teacher, and pranayama and Kundalini practices are best learned from one.',
    ],
  },
  faq: {
    heading: 'Daily sadhana: questions people ask',
    items: [
      { id: 'sad-include', header: 'What should a daily sadhana include?', body: 'Traditions answer differently, but most combine three things: something for the body or breath, something that gathers attention, and a period of mantra or silent sitting. The sequence on this page follows that shape in about seventeen minutes.' },
      { id: 'sad-time', header: 'What is the best time of day for sadhana?', body: 'Tradition names the period before sunrise, Brahma muhurta, and the two twilights. In practice the best time is the one you can keep every day. The panchang page gives the Brahma muhurta time for your city.' },
      { id: 'sad-streak', header: 'How is the practice streak counted?', body: 'A day counts when you finish a session in the Pranayama, Trataka, Kundalini or japa tools. The streak is the number of such days in a row, and it is stored only on this device.' },
      { id: 'sad-account', header: 'Do I need an account to keep my progress?', body: 'No, and the site has none. Progress is kept in your browser on this device. The price of that is that it cannot be carried to another device.' },
      { id: 'sad-tithi', header: 'Why does the page show today’s tithi?', body: 'Many practitioners shape their practice by the lunar day: a fast on Ekadashi, extra japa on the full moon, quiet on the new moon. Seeing the tithi first is a reminder of where the month stands.' },
    ],
  },
  relatedTools: [
    { slug: 'panchang', why: 'See the whole day: tithi end time, Brahma muhurta and Rahu Kaal.' },
    { slug: 'vrat-calendar', why: 'Find the next Ekadashi or Pradosh for your city.' },
    { slug: 'planetary-hours', why: 'See which planet rules the present hour where you are.' },
    { slug: 'pranayama', why: 'Start with five minutes of paced breathing.' },
  ],
  features: [
    'Today’s tithi and nakshatra for your city',
    'A three-step practice of about 17 minutes',
    'Practice streak kept on your device',
    'Next vrat at a glance',
    'Saved readings, with delete',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Sādhanā', sameAs: 'https://en.wikipedia.org/wiki/S%C4%81dhan%C4%81' },
  aliases: ['Daily Spiritual Practice'],
  frame: 'tall',
  keywords: { primary: 'daily sadhana', secondary: ['daily spiritual practice', 'sadhana routine', 'today tithi', 'meditation streak'] },
};

export default content;
