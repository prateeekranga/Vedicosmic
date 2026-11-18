import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'loshu-grid',
  lastReviewed: '2026-11-18',
  lede: 'Enter your date of birth to build your Lo Shu grid, the 3×3 square of Indian numerology. See your Driver, Conductor and Kua, career, money, relationships and health, the years that favour marriage, remedies and the years ahead, with the arithmetic shown. Add your name and mobile number to check them too.',
  toolHeading: 'Make your Lo Shu grid',
  about: {
    heading: 'What the Lo Shu grid is',
    paragraphs: [
      'The Lo Shu is a square of the numbers 1 to 9 arranged so that every row, column and diagonal adds up to 15. Chinese tradition says it appeared on a turtle’s shell from the River Luo. Numerologists in India use it as a chart: each number has a fixed cell and a ruling planet, and the digits of a date of birth are written into the cells they belong to.',
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
      { term: 'Driver and Conductor', text: 'The Driver (Mulank) comes from the day alone and is read as your everyday nature. The Conductor (Bhagyank) comes from the whole date and is read as the direction your life takes.' },
      { term: 'Repeated and missing numbers', text: 'A number written twice or more is read more strongly: two is often a strength, four or more something to balance. An empty cell is a quality tradition says you build through effort.' },
      { term: 'Planes and Raj Yogs', text: 'Rows are the mental, emotional and practical planes; columns the thought, will and action planes; the diagonals are the Golden (4-5-6) and Silver (2-5-8) Raj Yogs. A complete line is drawn across the grid.' },
      { term: 'Career, money, relationships and health', text: 'Career, relationships and health each have five numbers the tradition links with them; money is read through 5 and 6. The page shows which your grid holds and one step for each gap.' },
      { term: 'Marriage years', text: 'Mulank plus birth month gives the Mulank Maha; a year plus the Mulank Maha, added down, gives that year’s Vivah Mulank. Years whose Vivah Mulank suits your Mulank are shown in gold.' },
      { term: 'Name and mobile number', text: 'Optional. The name’s Chaldean total is checked against the totals that suit your Mulank and Bhagyank pair, and the mobile number gets a fit level and a score. Neither goes into a shared link.' },
      { term: 'Remedies', text: 'Each missing number gets daily habits, an offering, colours, a gift and a home direction; a number held often gets balancing customs. Several 7s call for care with the stomach and against injuries.' },
      { term: 'Your pair’s lucky tips', text: 'Lucky numbers, dates, colours, stones, lines of work and name totals for your exact Mulank and Bhagyank, beside the numbers whose planets are unfriendly to yours.' },
      { term: 'Dasha periods and directions', text: 'Maha Dasha runs for years, Antar Dasha from birthday to birthday and Pratyantar Dasha for weeks; their numbers join the grid while they last. Each number also points to a direction of the home, and the Kua gives four favourable directions.' },
    ],
  },
  method: {
    heading: 'How this Lo Shu grid calculator works',
    anchor: 'numerology-loshu',
    paragraphs: [
      'Teachers do not all fill the grid the same way, so here is exactly what this page does. It writes every non-zero digit of the day, month and four-digit year. It adds the Conductor and the Kua number as extra entries, and adds the Driver unless the birth day is a single digit or ends in zero. The Kua uses the calendar year of birth, and a Kua of 5 is read as 2 for a man and 8 for a woman.',
      'Maha Dasha begins at birth with the Driver, and each number runs for as many years as the number. Antar Dasha adds the birth day, the birth month, the last two digits of the year and the number of the weekday of that year’s birthday.',
      'The life areas are this page’s own way of reading the square, and a dasha year’s tone sets its planet beside your Driver and Conductor in the friendship table of the Brihat Parashara Hora Shastra.',
      'Marriage years, money through 5 and 6, the care for several 7s and the pair tables come from a lineage teaching passed to VediCosmic’s founder by a spiritual guru, used as taught. Names are counted with Cheiro’s Chaldean letter values.',
      'If another calculator differs in a cell, one of those rules is the reason. “Show the date digits only” draws the grid without the added numbers.',
    ],
    example: 'For a woman born on 15 August 1990 the date digits are 1, 5, 8, 1, 9, 9. The Driver is 6 and the Conductor is 6. The year adds to 1, and 4 + 1 = 5, which is read as Kua 8. The grid then holds 1 twice, 5 once, 6 twice, 8 twice and 9 twice, and 2, 3, 4 and 7 are missing. Her Mulank Maha is 6 + 8 = 14, then 5; for 2027, 2027 + 5 = 2032, which adds down to 7.',
    limits: [
      'Numerology is a tradition, not a science. The readings describe what the tradition associates with a number; they are not predictions.',
      'No classical text judges years from a Lo Shu grid, and the lineage teachings are not in classical texts either. A year that favours marriage is an opening, not a promise. The health reading covers habits and energy only, not medical advice.',
      'People born from 1 January to 3 February may get a different Kua from feng shui teachers who count the Chinese solar year. The page tells you when that applies.',
    ],
  },
  faq: {
    heading: 'Lo Shu grid: questions people ask',
    items: [
      { id: 'loshu-how', header: 'How is the Lo Shu grid calculated from a date of birth?', body: 'Write the digits of the day, month and year, drop any zeros, and place each digit in its fixed cell: 4, 9, 2 on top, 3, 5, 7 in the middle and 8, 1, 6 at the bottom. This calculator then adds your Conductor and Kua, and your Driver when the birth day has two digits and does not end in zero.' },
      { id: 'loshu-driver', header: 'What are the Driver and Conductor numbers?', body: 'The Driver, called Mulank in Hindi, is the day of birth added down to one digit. The Conductor, called Bhagyank, is every digit of the full date added down to one digit. Someone born on 23 November 1990 has Driver 5 (2 + 3) and Conductor 8.' },
      { id: 'loshu-marriage', header: 'Can numerology show which years favour marriage?', body: 'This page uses the Vivah Mulank. Born on 1 January 2001, the Mulank is 1 and the Mulank Maha 1 + 1 = 2. For 2027, 2027 + 2 = 2029, which adds down to 4, and 4 suits Mulank 1, so 2027 favours marriage. Read it as an opening, not a promise.' },
      { id: 'loshu-missing', header: 'What does a missing number mean in the Lo Shu grid, and what are the remedies?', body: 'It means that number is absent from your date of birth and added numbers, so its cell is empty. Tradition reads it as a quality to develop on purpose, not as a defect, and gives daily habits and customs for each. No gemstone is advised.' },
      { id: 'loshu-areas', header: 'Can the Lo Shu grid show career, money, health and relationship strengths?', body: 'It shows which numbers tradition links with each area are in your grid, with a step for each gap; money is read through 5 and 6. The health reading covers habits only, so see a doctor about any health concern.' },
      { id: 'loshu-unlucky', header: 'Which numbers are unlucky for me according to the Lo Shu grid?', body: 'None is unlucky in itself. The page lists numbers whose planets are unfriendly to your Driver or Conductor, in three strengths, and the lucky numbers and dates for your exact Mulank and Bhagyank pair.' },
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
    'Career, money, relationships and health readings',
    'Remedies for every missing and repeated number',
    'Marriage years by the Vivah Mulank, and numerology dasha',
    'Name, mobile number and lucky tips for your Mulank and Bhagyank',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Lo Shu Square', sameAs: 'https://en.wikipedia.org/wiki/Lo_Shu_Square' },
  aliases: ['Lo Shu Grid', 'Loshu Grid Calculator'],
  frame: 'compact',
  keywords: { primary: 'lo shu grid calculator', secondary: ['marriage year by numerology', 'vivah mulank', 'lo shu grid by date of birth', 'missing numbers in lo shu grid', 'lo shu grid remedies', 'lo shu grid career health relationship', 'driver conductor kua number', 'mulank bhagyank', 'numerology dasha', 'raj yog in lo shu grid'] },
};

export default content;
