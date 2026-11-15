import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'mobile-numerology',
  lastReviewed: '2026-11-15',
  lede: 'Enter a mobile number to find its root number, see which digits repeat, and read every two-digit combination against the chart used in Indian mobile numerology. Add your date of birth to get the number’s compatibility level with your Mulank and Bhagyank.',
  toolHeading: 'Read a mobile number',
  about: {
    heading: 'What mobile number numerology looks at',
    paragraphs: [
      'A phone number is a string of digits, and numerology reads any string of digits the same way: it adds them down to a single root number and links that root to a planet. Mobile number numerology, popular in India, also looks inside the number, at digits that repeat and at pairs of digits standing side by side.',
      'No number is lucky for everybody. The tradition’s actual claim is narrower: a number suits a person when its planet is a friend of the planets behind that person’s own birth numbers. That is the comparison this page makes, and it uses one published table of planetary friendships to do it. The answer is given as a compatibility level from 1 to 5.',
    ],
  },
  howToUse: {
    heading: 'How to use the mobile number calculator',
    steps: [
      { name: 'Type the number', text: 'Ten digits are enough. A leading +91 or 0 is removed, because every number in the country shares it.' },
      { name: 'Add your date of birth', text: 'Optional, but needed for the compatibility level. It lets the page compare the number with your Mulank and Bhagyank and with the gaps in your Lo Shu grid.' },
      { name: 'Read the result', text: 'The root comes first, then the compatibility level, the count of each digit and the two-digit combinations.' },
    ],
  },
  howToRead: {
    heading: 'How to read a mobile number result',
    items: [
      { term: 'Root number', text: 'All the digits added down to one. It names the planet the number as a whole belongs to.' },
      { term: 'Compatibility level', text: 'A level from 1 to 5, named very low, low, moderate, good or excellent. It comes from how the root’s planet and the planets of your Mulank and Bhagyank regard each other, and each of the two comparisons has its own card underneath.' },
      { term: 'Digit counts', text: 'A digit that appears three times or more is read as that planet’s theme sounding strongly. The page also lists the numbers that never appear.' },
      { term: 'Two-digit combinations', text: 'Each two digits side by side, classed by the chart as benefic, neutral or malefic, with a short reading of its own. A doubled digit repeats one planet, and a zero is read as strengthening the digit beside it.' },
      { term: 'Raj yog', text: 'The chart calls 1 and 7 side by side a Raj yog. Teachers attach a condition, that the number has no 8 in it, and the page tells you whether yours meets it.' },
      { term: 'Missing grid numbers', text: 'If the number contains digits that are missing from your Lo Shu grid, some teachers count that in its favour.' },
    ],
  },
  method: {
    heading: 'How this mobile number calculator works',
    anchor: 'numerology-relations',
    paragraphs: [
      'The root is the plain digit sum reduced to 1 to 9; master numbers are not used for phone numbers. Friendships between the seven visible planets follow the natural friendship table of the Brihat Parashara Hora Shastra. Rahu (4) and Ketu (7) are not in that table, so the page uses the convention most teachers follow and says so.',
      'The compatibility level is plain arithmetic on that table. The root is compared with your Mulank and then with your Bhagyank. Each comparison scores from −2, unfriendly on both sides, to +2, friends on both sides or the very same number. The two scores are added, and the total from −4 to +4 is shown as a level from 1 to 5 with its working.',
      'The two-digit combinations come from a different source, the combination chart that teachers of mobile numerology pass around, and the page keeps the two apart. Pairs that contain a 1, the chain from 23 to 89 and the doubled digits follow that chart; the remaining pairs are classed from the planets involved.',
    ],
    example: 'For 98765 43210 the digits add to 45, and 4 + 5 = 9, so the root is 9, the number of Mars. Every digit from 0 to 9 appears exactly once.',
    limits: [
      'Combination charts differ from teacher to teacher. Where the chart speaks of health, money or the law, this page keeps the theme and the advice that goes with it, and names no illness or event.',
      'The level weighs Mulank and Bhagyank equally. Some teachers give the Mulank more weight, so read the two cards under the level as well.',
      'A phone number has no measurable effect on events. Read the result as tradition, and keep a number you are happy with.',
    ],
  },
  faq: {
    heading: 'Mobile number numerology: questions people ask',
    items: [
      { id: 'mob-how', header: 'How is the numerology of a mobile number calculated?', body: 'Add all its digits and keep adding until one digit is left. That root number, from 1 to 9, is the number’s planet. The country code is left out because it is the same for everyone.' },
      { id: 'mob-lucky', header: 'Which mobile number is lucky for me?', body: 'Tradition says a number suits you when its root is a friend of your Mulank and Bhagyank. Enter your date of birth and this page shows that as a compatibility level from 1 to 5. It will not call any number lucky for everyone, because the tradition does not either.' },
      { id: 'mob-level', header: 'How is the compatibility level worked out?', body: 'The root of the number is compared with your Mulank and with your Bhagyank through the friendships between their planets. Each comparison scores from −2 to +2, the two are added, and the total is shown as a level from 1, very low, to 5, excellent. The arithmetic for your own number is in the panel headed “How this was calculated”.' },
      { id: 'mob-rajyog', header: 'What is Raj yog in a mobile number?', body: 'In the two-digit combination chart, 1 and 7 side by side, written 17 or 71, are called a Raj yog and linked with recognition and support from people in authority. Teachers add that the number should not also contain an 8. The page marks the pair and checks that condition for you.' },
      { id: 'mob-match', header: 'Should the mobile number total match my Mulank or my Bhagyank?', body: 'Teachers differ, so the level counts both equally and the page shows each comparison on its own card. Many give more weight to the Mulank for daily matters and to the Bhagyank for the longer run.' },
      { id: 'mob-zero', header: 'Does zero count in mobile numerology?', body: 'Zero adds nothing to the total and has no planet. In a pair the chart reads it as strengthening the digit beside it, so 10 leans on the Sun and 80 on Saturn.' },
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
    'Compatibility level with your date of birth',
    'Two-digit combination chart with a reading for every pair',
    'Raj yog check',
    'Digit counts and repeats',
    'The number stays on your device',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Numerology', sameAs: 'https://en.wikipedia.org/wiki/Numerology' },
  aliases: ['Mobile Numerology Calculator', 'Phone Number Numerology Calculator'],
  frame: 'compact',
  keywords: { primary: 'mobile number numerology', secondary: ['mobile number numerology calculator', 'lucky mobile number', 'phone number numerology', 'mobile number by date of birth'] },
};

export default content;
