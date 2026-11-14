import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'life-path',
  lastReviewed: '2026-11-14',
  lede: 'Enter your date of birth to get your Life Path number with its working, including master numbers 11, 22 and 33. The report adds your Mulank and Bhagyank, friendly numbers and colours, your personal year, month and day, and the four pinnacles of your life.',
  toolHeading: 'Work out your Life Path number',
  about: {
    heading: 'What a Life Path number is',
    paragraphs: [
      'The Life Path is the main number of Western, or Pythagorean, numerology. It is made from nothing but the date of birth, so it never changes, and it is read as the general direction of a life: the kind of lessons that keep coming back and the strengths a person can lean on.',
      'Indian numerology takes two numbers from the same date. The Mulank comes from the day of the month and the Bhagyank from the whole date. The Bhagyank always reduces to the same single digit as the Life Path, so this report shows the two traditions side by side instead of treating them as rivals.',
    ],
  },
  howToUse: {
    heading: 'How to calculate a Life Path number',
    asHowTo: true,
    steps: [
      { name: 'Reduce the month', text: 'Write the month as a number and add its digits until one digit is left. November is 11, which is a master number and is kept.' },
      { name: 'Reduce the day', text: 'Do the same with the day of the month. The 23rd gives 2 + 3 = 5; the 29th gives 11, which is kept.' },
      { name: 'Reduce the year', text: 'Add the four digits of the year, then add again if needed. 1990 gives 19, then 10, then 1.' },
      { name: 'Add the three results', text: 'Add the month, day and year figures together and reduce once more, stopping if you reach 11, 22 or 33.' },
    ],
  },
  howToRead: {
    heading: 'How to read your Life Path report',
    items: [
      { term: 'Life Path number', text: 'The single most important number in the Western system. Numbers 1 to 9 each have a theme; 11, 22 and 33 are read as stronger forms of 2, 4 and 6.' },
      { term: 'Mulank and Bhagyank', text: 'The Indian pair. Mulank describes your day-to-day manner, Bhagyank your longer course.' },
      { term: 'Friendly numbers and colours', text: 'Numbers whose ruling planets are friends of your Mulank’s planet, with the colours tradition gives that planet. Many people call these lucky numbers.' },
      { term: 'Personal year, month and day', text: 'A nine-step cycle counted from your birthday month and day and the current calendar date. It describes the flavour of a period, such as beginning, building or finishing.' },
      { term: 'Pinnacles and challenges', text: 'Four long chapters of life, each with a theme and a lesson. The first ends between the ages of 27 and 35, depending on your Life Path.' },
    ],
  },
  method: {
    heading: 'How this Life Path calculator works',
    anchor: 'numerology-western',
    paragraphs: [
      'There are two common ways to add a date. One adds all eight digits in a single line. The other reduces the month, the day and the year separately and then adds the three results. They always agree on the final single digit, but they can disagree about master numbers. This page uses the second way, which is the one most books teach, and tells you when the first would have given a different answer.',
      'The personal year uses the calendar year and so changes on 1 January. Some teachers change it on the birthday instead.',
    ],
    example: 'For 23 November 1990: the month is 11 and is kept, the day is 2 + 3 = 5, and the year is 1 + 9 + 9 + 0 = 19, then 1 + 9 = 10, then 1. Adding 11 + 5 + 1 gives 17, and 1 + 7 = 8, so the Life Path is 8.',
    limits: [
      'The readings state what the tradition says about a number. They are not forecasts, and they are no basis for decisions about health, money or relationships.',
    ],
  },
  faq: {
    heading: 'Life Path number: questions people ask',
    items: [
      { id: 'lp-how', header: 'How do I calculate my Life Path number?', body: 'Reduce your birth month, birth day and birth year to one digit each, keeping 11 and 22 if they appear, then add the three and reduce again. For 15 August 1990 that is 8 + 6 + 1 = 15, and 1 + 5 = 6.' },
      { id: 'lp-master', header: 'What are master numbers in numerology?', body: 'They are 11, 22 and 33. When one of them appears as a total it is not reduced further. It is written with its digit, as 11/2, 22/4 or 33/6, and read as a more demanding form of that digit.' },
      { id: 'lp-bhagyank', header: 'Is the Life Path number the same as Bhagyank?', body: 'They come from the same date and always share the same single digit. The difference is that the Western Life Path may stop at a master number, while the Indian Bhagyank is always a number from 1 to 9.' },
      { id: 'lp-mulank', header: 'What is the difference between Mulank and Bhagyank?', body: 'Mulank is the day of birth added down to one digit and is read as your nature. Bhagyank is the full date added down to one digit and is read as your direction. Born on the 23rd, your Mulank is 5 whatever the month and year.' },
      { id: 'lp-year', header: 'What is a personal year number?', body: 'It is your birth month and day added to the current year and reduced to one digit. It runs in a nine-year cycle, from 1 for beginnings to 9 for completion.' },
      { id: 'lp-differs', header: 'Why does another calculator give me a different Life Path?', body: 'Usually because it adds every digit in one line. That can turn a 6 into a 33 or an 11 into a 2. The single digit is the same; only the master number differs. This page shows both results when they differ.' },
    ],
  },
  relatedTools: [
    { slug: 'loshu-grid', why: 'Place the same date of birth in the Lo Shu square to see missing numbers.' },
    { slug: 'numerology', why: 'Add your name for the Expression, Soul Urge and Personality numbers.' },
    { slug: 'chaldean', why: 'Find the name number that Indian numerologists pair with the Mulank.' },
    { slug: 'mobile-numerology', why: 'Compare a phone number with your Mulank and Bhagyank.' },
  ],
  features: [
    'Life Path number with full working',
    'Master numbers 11, 22 and 33',
    'Mulank and Bhagyank',
    'Friendly numbers and colours',
    'Personal year, month and day',
    'Pinnacles and challenges',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Numerology', sameAs: 'https://en.wikipedia.org/wiki/Numerology' },
  aliases: ['Life Path Calculator', 'Mulank and Bhagyank Calculator'],
  frame: 'compact',
  keywords: { primary: 'life path number calculator', secondary: ['mulank bhagyank calculator', 'personal year number', 'lucky number by date of birth', 'master number'] },
};

export default content;
