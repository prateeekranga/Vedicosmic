import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'loshu-grid',
  lastReviewed: '2026-11-15',
  lede: 'Enter your date of birth to build your Lo Shu grid, the 3×3 square of Indian numerology. You get your Driver (Mulank), Conductor (Bhagyank) and Kua number, the missing and repeated numbers, and all eight planes and yogs, with the arithmetic shown.',
  toolHeading: 'Make your Lo Shu grid',
  about: {
    heading: 'What the Lo Shu grid is',
    paragraphs: [
      'The Lo Shu is a square of the numbers 1 to 9 arranged so that every row, column and diagonal adds up to 15. Chinese tradition says it first appeared on the shell of a turtle from the River Luo. Numerologists in India use it as a chart: each number has a fixed cell and a ruling planet, and the digits of a date of birth are written into the cells they belong to.',
      'A cell that fills more than once shows a repeated number, an empty cell shows a missing number, and three filled cells in a line make a plane or a yog. Indian teachers also add three numbers worked out from the date: the Driver, the Conductor and the Kua.',
    ],
  },
  howToUse: {
    heading: 'How to make a Lo Shu grid by hand',
    asHowTo: true,
    steps: [
      { name: 'Write the date as digits', text: 'Write the day, month and full year as digits. For 15 August 1990 that is 1, 5, 8, 1, 9, 9, 0.' },
      { name: 'Leave out the zeros', text: 'The square has no cell for zero, so drop it. That leaves 1, 5, 8, 1, 9, 9.' },
      { name: 'Place each digit in its cell', text: 'The top row holds 4, 9, 2, the middle row 3, 5, 7 and the bottom row 8, 1, 6. Write a digit again each time it occurs.' },
      { name: 'Work out the Driver and the Conductor', text: 'Add the digits of the day for the Driver (1 + 5 = 6). Add every digit of the date for the Conductor (33, then 3 + 3 = 6).' },
      { name: 'Work out the Kua number', text: 'Add the digits of the year down to one digit. A man subtracts it from 11; a woman adds 4. Add the result down to one digit.' },
      { name: 'Add those numbers to the grid', text: 'Write the Conductor and the Kua into their cells. Write the Driver too, unless the birth day is 1 to 9, 10, 20 or 30, when it is already there.' },
    ],
  },
  howToRead: {
    heading: 'How to read your Lo Shu grid',
    items: [
      { term: 'Driver and Conductor', text: 'The Driver, or Mulank, comes from the day alone and is read as your everyday nature. The Conductor, or Bhagyank, comes from the whole date and is read as the direction your life takes. The page also shows whether their two planets are friends.' },
      { term: 'Repeated numbers', text: 'A number written twice or more has its planet’s qualities turned up. The reading changes with the count: two is usually read as a strength, four or more as something to keep in balance.' },
      { term: 'Missing numbers', text: 'An empty cell is a quality tradition says you build through effort instead of being born with. Each comes with a simple practice that teachers traditionally suggest.' },
      { term: 'Planes', text: 'The three rows are the mental, emotional and practical planes; the three columns are the thought, will and action planes. A plane is complete when all three of its numbers are present, and the grid marks each complete line with an arrow.' },
      { term: 'Golden and Silver Raj Yog', text: 'The diagonals are named: 4-5-6 is the Golden Raj Yog, traditionally the line of recognition, and 2-5-8 the Silver Raj Yog, traditionally linked with property.' },
      { term: 'Kua directions', text: 'The Kua number comes from the Eight Mansions school of feng shui and gives four favourable compass directions for work, rest, conversation and study.' },
    ],
  },
  method: {
    heading: 'How this Lo Shu grid calculator works',
    anchor: 'numerology-loshu',
    paragraphs: [
      'Teachers do not all fill the grid the same way, so here is exactly what this page does. It writes every non-zero digit of the day, month and four-digit year. It adds the Conductor and the Kua number as extra entries, and adds the Driver unless the birth day is a single digit or ends in zero. The Kua uses the calendar year of birth, and a Kua of 5 is read as 2 for a man and 8 for a woman.',
      'If you compare with another calculator and a cell differs, one of those rules is the reason. Turn on “Show the date digits only” to see the grid without the added numbers.',
    ],
    example: 'For a woman born on 15 August 1990 the date digits are 1, 5, 8, 1, 9, 9. The Driver is 6 and the Conductor is 6. The year adds to 1, and 4 + 1 = 5, which is read as Kua 8. The grid then holds 1 twice, 5 once, 6 twice, 8 twice and 9 twice, and 2, 3, 4 and 7 are missing.',
    limits: [
      'Numerology is a tradition, not a science. The readings describe what the tradition associates with a number; they are not predictions.',
      'People born from 1 January to 3 February may get a different Kua from feng shui teachers who count the Chinese solar year. The page tells you when that applies.',
    ],
  },
  faq: {
    heading: 'Lo Shu grid: questions people ask',
    items: [
      { id: 'loshu-how', header: 'How is the Lo Shu grid calculated from a date of birth?', body: 'Write the digits of the day, month and year, leave out any zeros, and place each digit in its fixed cell of the square: 4, 9, 2 on top, 3, 5, 7 in the middle and 8, 1, 6 at the bottom. This calculator then adds your Conductor and Kua numbers, and your Driver when the birth day has two digits and does not end in zero.' },
      { id: 'loshu-driver', header: 'What are the Driver and Conductor numbers?', body: 'The Driver, called Mulank in Hindi, is the day of birth added down to one digit. The Conductor, called Bhagyank, is every digit of the full date added down to one digit. Someone born on 23 November 1990 has Driver 5 (2 + 3) and Conductor 8.' },
      { id: 'loshu-kua', header: 'How do I work out my Kua number?', body: 'Add the digits of your year of birth until one digit is left. A man subtracts that digit from 11 and a woman adds 4 to it; if the answer has two digits, add them together. A result of 5 is read as 2 for a man and 8 for a woman.' },
      { id: 'loshu-missing', header: 'What does a missing number mean in the Lo Shu grid?', body: 'It means that number does not appear in your date of birth or among your added numbers, so its cell is empty. Tradition reads it as a quality to develop on purpose, and suggests a simple practice for each one. It is not read as a defect.' },
      { id: 'loshu-zero', header: 'Is zero counted in the Lo Shu grid?', body: 'No. The square contains only the numbers 1 to 9, so a zero in a date has no cell and is left out. It still counts as nothing when the digits are added for the Conductor, which is why it changes no total.' },
      { id: 'loshu-yog', header: 'What is raj yog in the Lo Shu grid?', body: 'Raj yog is a complete diagonal of the square: 4, 5 and 6 is the Golden Raj Yog, and 2, 5 and 8 the Silver Raj Yog. Each needs all three numbers in your grid.' },
      { id: 'loshu-differs', header: 'Why does my grid look different on another website?', body: 'Because methods differ. Some sites use only the date digits, some add the Driver every time, some use the last two digits of the year, and some leave the Kua out. This page lists its rules under the calculator and shows each step of your own working.' },
    ],
  },
  relatedTools: [
    { slug: 'life-path', why: 'See the Life Path number, personal year and pinnacles from the same date of birth.' },
    { slug: 'numerology', why: 'Add your name to get the Western core numbers beside this grid.' },
    { slug: 'chaldean', why: 'Check what number your name adds up to in the Chaldean system.' },
    { slug: 'mobile-numerology', why: 'See whether a phone number contains the numbers missing from your grid.' },
  ],
  features: [
    'Lo Shu grid from a date of birth',
    'Driver (Mulank), Conductor (Bhagyank) and Kua numbers',
    'Missing and repeated numbers with readings',
    'All eight planes and yogs',
    'Kua directions',
    'Step-by-step working',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Lo Shu Square', sameAs: 'https://en.wikipedia.org/wiki/Lo_Shu_Square' },
  aliases: ['Lo Shu Grid', 'Loshu Grid Calculator'],
  frame: 'compact',
  keywords: { primary: 'lo shu grid calculator', secondary: ['lo shu grid by date of birth', 'missing numbers in lo shu grid', 'driver conductor kua number', 'mulank bhagyank'] },
};

export default content;
