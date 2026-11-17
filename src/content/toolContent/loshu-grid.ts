import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'loshu-grid',
  lastReviewed: '2026-11-17',
  lede: 'Enter your date of birth to build your Lo Shu grid, the 3×3 square of Indian numerology. See your Driver, Conductor and Kua, what the grid says about career, relationships and health, remedies for missing numbers, numbers to go carefully with, and the years ahead, with the arithmetic shown.',
  toolHeading: 'Make your Lo Shu grid',
  about: {
    heading: 'What the Lo Shu grid is',
    paragraphs: [
      'The Lo Shu is a square of the numbers 1 to 9 arranged so that every row, column and diagonal adds up to 15. Chinese tradition says it first appeared on the shell of a turtle from the River Luo. Numerologists in India use it as a chart: each number has a fixed cell and a ruling planet, and the digits of a date of birth are written into the cells they belong to.',
      'A cell that fills more than once shows a repeated number, an empty cell a missing number, and three filled cells in a line make a plane or a yog. Indian teachers also add the Driver, Conductor and Kua, worked out from the date.',
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
      { term: 'Driver and Conductor', text: 'The Driver (Mulank) comes from the day alone and is read as your everyday nature. The Conductor (Bhagyank) comes from the whole date and is read as the direction your life takes. The page shows whether their planets are friends.' },
      { term: 'Repeated numbers', text: 'A number written twice or more is read more strongly, and the reading changes with the count: two is often a strength, four or more something to balance.' },
      { term: 'Missing numbers', text: 'An empty cell is a quality tradition says you build through effort. Each comes with a simple practice that teachers traditionally suggest.' },
      { term: 'Planes and Raj Yogs', text: 'The rows are the mental, emotional and practical planes; the columns are the thought, will and action planes. A complete line is drawn across the grid. The diagonals are the Golden Raj Yog (4-5-6) and the Silver Raj Yog (2-5-8).' },
      { term: 'Career, relationships and health', text: 'Each area has five numbers the tradition links with it. The page counts how many your grid holds, shows the arithmetic, and gives one step for each that is missing.' },
      { term: 'Remedies', text: 'Each missing number gets daily habits, an offering, colours, a gift and a home direction; a number held often gets balancing customs. No gemstone is advised.' },
      { term: 'Numbers to go carefully with', text: 'Numbers whose planets are unfriendly to your Driver or Conductor are sorted into three strengths, with matching dates and weekdays, worked out from your own numbers.' },
      { term: 'Dasha periods and years ahead', text: 'Maha Dasha runs for years, Antar Dasha from birthday to birthday and Pratyantar Dasha for weeks; their numbers join the grid while they last. Each year is also called favourable, neutral or needing care for work, relationships and health, with its score. That is a way of reading, not a forecast.' },
      { term: 'Directions and favourable dates', text: 'Numero Vastu gives each number a direction, so a missing number points to part of the home. The Kua number gives four favourable directions from the Eight Mansions school of feng shui.' },
    ],
  },
  method: {
    heading: 'How this Lo Shu grid calculator works',
    anchor: 'numerology-loshu',
    paragraphs: [
      'Teachers do not all fill the grid the same way, so here is exactly what this page does. It writes every non-zero digit of the day, month and four-digit year. It adds the Conductor and the Kua number as extra entries, and adds the Driver unless the birth day is a single digit or ends in zero. The Kua uses the calendar year of birth, and a Kua of 5 is read as 2 for a man and 8 for a woman.',
      'The dasha follows the rule most Indian teachers give. Maha Dasha begins at birth with the Driver, and each number runs for as many years as the number. Antar Dasha adds the birth day, the birth month, the last two digits of the year and the number of the weekday on which that year’s birthday falls.',
      'The three life areas are this page’s own way of reading the square: five numbers per area earn points, as do complete supporting lines. A dasha is called favourable, even or needing care by setting its planet beside your Driver and Conductor in the friendship table of the Brihat Parashara Hora Shastra.',
      'If you compare with another calculator and a cell differs, one of those rules is the reason. Turn on “Show the date digits only” to see the grid without the added numbers.',
    ],
    example: 'For a woman born on 15 August 1990 the date digits are 1, 5, 8, 1, 9, 9. The Driver is 6 and the Conductor is 6. The year adds to 1, and 4 + 1 = 5, which is read as Kua 8. The grid then holds 1 twice, 5 once, 6 twice, 8 twice and 9 twice, and 2, 3, 4 and 7 are missing.',
    limits: [
      'Numerology is a tradition, not a science. The readings describe what the tradition associates with a number; they are not predictions.',
      'No classical text judges years from a Lo Shu grid, so the life-area levels and year-ahead tones are this page’s own method, shown with their arithmetic. The health reading covers habits and energy only, not medical advice.',
      'People born from 1 January to 3 February may get a different Kua from feng shui teachers who count the Chinese solar year. The page tells you when that applies.',
    ],
  },
  faq: {
    heading: 'Lo Shu grid: questions people ask',
    items: [
      { id: 'loshu-how', header: 'How is the Lo Shu grid calculated from a date of birth?', body: 'Write the digits of the day, month and year, drop any zeros, and place each digit in its fixed cell: 4, 9, 2 on top, 3, 5, 7 in the middle and 8, 1, 6 at the bottom. This calculator then adds your Conductor and Kua, and your Driver when the birth day has two digits and does not end in zero.' },
      { id: 'loshu-driver', header: 'What are the Driver and Conductor numbers?', body: 'The Driver, called Mulank in Hindi, is the day of birth added down to one digit. The Conductor, called Bhagyank, is every digit of the full date added down to one digit. Someone born on 23 November 1990 has Driver 5 (2 + 3) and Conductor 8.' },
      { id: 'loshu-dasha', header: 'How is the numerology dasha calculated?', body: 'Maha Dasha starts with your Driver and runs each number for as many years as the number: a Driver of 5 has 5 for five years, then 6 for six. Antar Dasha lasts from birthday to birthday, and its sum is written out under “How this Lo Shu grid calculator works”.' },
      { id: 'loshu-missing', header: 'What does a missing number mean in the Lo Shu grid, and what are the remedies?', body: 'It means that number is absent from your date of birth and added numbers, so its cell is empty. Tradition reads it as a quality to develop on purpose, not as a defect. It gives daily habits and customs for each, and for any number held often. No gemstone is advised.' },
      { id: 'loshu-areas', header: 'Can the Lo Shu grid show career, health and relationship strengths?', body: 'It shows which numbers tradition links with each area are in your grid, counted into a level with one practical step for each gap, and calls each dasha year favourable, even or needing care. That part is this page’s own method, not a classical rule, and the health reading covers habits only, so see a doctor about any health concern.' },
      { id: 'loshu-unlucky', header: 'Which numbers are unlucky for me according to the Lo Shu grid?', body: 'None is unlucky in itself. The page lists numbers whose planets are unfriendly to your Driver or Conductor in the traditional table, in three strengths, with matching dates and weekdays. It is a preference of the tradition, so a number that is cool towards you can suit someone else.' },
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
    'Lo Shu grid with Driver (Mulank), Conductor (Bhagyank) and Kua numbers',
    'Missing and repeated numbers, eight planes and yogs, with arrows',
    'Career, relationships and health readings',
    'Remedies for every missing number',
    'Numbers and dates to go carefully with',
    'Maha, Antar and Pratyantar Dasha with a year-ahead outlook',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Lo Shu Square', sameAs: 'https://en.wikipedia.org/wiki/Lo_Shu_Square' },
  aliases: ['Lo Shu Grid', 'Loshu Grid Calculator'],
  frame: 'compact',
  keywords: { primary: 'lo shu grid calculator', secondary: ['lo shu grid by date of birth', 'missing numbers in lo shu grid', 'lo shu grid remedies', 'lo shu grid career health relationship', 'driver conductor kua number', 'mulank bhagyank', 'numerology dasha', 'raj yog in lo shu grid'] },
};

export default content;
