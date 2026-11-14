import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'mobile-numerology',
  lastReviewed: '2026-11-14',
  lede: 'Enter a mobile number to find its root number, see which digits repeat, and read each neighbouring pair of digits. Add your date of birth to see how the number sits with your Mulank and Bhagyank.',
  toolHeading: 'Read a mobile number',
  about: {
    heading: 'What mobile number numerology looks at',
    paragraphs: [
      'A phone number is a string of digits, and numerology reads any string of digits the same way: it adds them down to a single root number and links that root to a planet. Mobile number numerology, popular in India, also looks inside the number, at digits that repeat and at pairs of digits standing side by side.',
      'No number is lucky for everybody. The tradition’s actual claim is narrower: a number suits a person when its planet is a friend of the planets behind that person’s own birth numbers. That is the comparison this page makes, and it uses one published table of planetary friendships to do it.',
    ],
  },
  howToUse: {
    heading: 'How to use the mobile number calculator',
    steps: [
      { name: 'Type the number', text: 'Ten digits are enough. A leading +91 or 0 is removed, because every number in the country shares it.' },
      { name: 'Add your date of birth', text: 'Optional. It lets the page compare the number with your Mulank and Bhagyank and with the gaps in your Lo Shu grid.' },
      { name: 'Read the result', text: 'The root comes first, then the count of each digit, then the pairs.' },
    ],
  },
  howToRead: {
    heading: 'How to read a mobile number result',
    items: [
      { term: 'Root number', text: 'All the digits added down to one. It names the planet the number as a whole belongs to.' },
      { term: 'Fit with your birth numbers', text: 'Supportive, mixed or challenging, according to how the root’s planet and your own planets regard each other.' },
      { term: 'Digit counts', text: 'A digit that appears three times or more is read as that planet’s theme sounding strongly. The page also lists the numbers that never appear.' },
      { term: 'Neighbouring pairs', text: 'Each two digits side by side, read through the friendship of their planets. A doubled digit repeats one theme; a pair with a zero is given no reading.' },
      { term: 'Missing grid numbers', text: 'If the number contains digits that are missing from your Lo Shu grid, some teachers count that in its favour.' },
    ],
  },
  method: {
    heading: 'How this mobile number calculator works',
    anchor: 'numerology-relations',
    paragraphs: [
      'The root is the plain digit sum reduced to 1 to 9; master numbers are not used for phone numbers. Friendships between the seven visible planets follow the natural friendship table of the Brihat Parashara Hora Shastra. Rahu (4) and Ketu (7) are not in that table, so the page uses the convention most teachers follow and says so.',
      'The page gives no percentage score and no single verdict, because the tradition offers no arithmetic that would justify one.',
    ],
    example: 'For 98765 43210 the digits add to 45, and 4 + 5 = 9, so the root is 9, the number of Mars. Every digit from 0 to 9 appears exactly once.',
    limits: [
      'Pair readings differ from teacher to teacher; this page reads each pair only through planetary friendship.',
      'A phone number has no measurable effect on events. Read the result as tradition, and keep a number you are happy with.',
    ],
  },
  faq: {
    heading: 'Mobile number numerology: questions people ask',
    items: [
      { id: 'mob-how', header: 'How is the numerology of a mobile number calculated?', body: 'Add all its digits and keep adding until one digit is left. That root number, from 1 to 9, is the number’s planet. The country code is left out because it is the same for everyone.' },
      { id: 'mob-lucky', header: 'Which mobile number is lucky for me?', body: 'Tradition says a number suits you when its root is a friend of your Mulank and Bhagyank. Enter your date of birth and this page shows that comparison. It will not call any number lucky in itself, because the tradition does not either.' },
      { id: 'mob-repeat', header: 'Do repeated digits in a mobile number matter?', body: 'They are read as emphasis. A digit that appears three or more times is said to make that planet’s theme prominent, whether that is a help or a strain.' },
      { id: 'mob-match', header: 'Should the mobile number total match my Mulank or my Bhagyank?', body: 'Teachers differ, so the page shows both. Many give more weight to the Mulank for daily matters and to the Bhagyank for the longer run.' },
      { id: 'mob-zero', header: 'Does zero count in mobile numerology?', body: 'Zero adds nothing to the total and has no planet. In a pair it is read as a pause beside the other digit, so this page gives such pairs no reading of their own.' },
      { id: 'mob-private', header: 'Is the number I type sent anywhere?', body: 'No. It is analysed in your browser and is not sent to us or stored. If you save the result, only the root and total are kept on your device.' },
    ],
  },
  relatedTools: [
    { slug: 'loshu-grid', why: 'Find the numbers missing from your grid before choosing a phone number.' },
    { slug: 'life-path', why: 'Get your Mulank and Bhagyank with their friendly numbers.' },
    { slug: 'chaldean', why: 'Read a name through the same nine planets.' },
  ],
  features: [
    'Root number of a mobile number',
    'Digit counts and repeats',
    'Neighbouring pair readings',
    'Fit with Mulank and Bhagyank',
    'The number stays on your device',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Numerology', sameAs: 'https://en.wikipedia.org/wiki/Numerology' },
  aliases: ['Mobile Numerology Calculator', 'Phone Number Numerology Calculator'],
  frame: 'compact',
  keywords: { primary: 'mobile number numerology', secondary: ['mobile number numerology calculator', 'lucky mobile number', 'phone number numerology', 'mobile number by date of birth'] },
};

export default content;
