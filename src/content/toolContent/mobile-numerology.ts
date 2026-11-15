import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'mobile-numerology',
  lastReviewed: '2026-11-15',
  lede: 'Enter a mobile number and your date of birth to get a Number score out of 100, the compatibility level with your Mulank and Bhagyank, a reading for every two-digit combination, the last four digits, your Lo Shu grid with the number added, and help choosing a better number.',
  toolHeading: 'Read a mobile number',
  about: {
    heading: 'What mobile number numerology looks at',
    paragraphs: [
      'A phone number is a string of digits, and numerology reads any string of digits the same way: it adds them down to a single root number and links that root to a planet. Mobile number numerology, popular in India, also looks inside the number, at digits that repeat, at pairs of digits standing side by side, and at the last four digits, which many teachers weigh most.',
      'No number is lucky for everybody. The tradition’s actual claim is narrower: a number suits a person when its planet is a friend of the planets behind that person’s own birth numbers, when its pairs are mostly favourable, and when it fills gaps in their Lo Shu grid. This page makes each of those checks with one published table of planetary friendships and one combination chart, and adds them into a score you can follow line by line.',
    ],
  },
  howToUse: {
    heading: 'How to use the mobile number calculator',
    steps: [
      { name: 'Type the number', text: 'Ten digits are enough. A leading +91 or 0 is removed, because every number in the country shares it.' },
      { name: 'Say what the phone is for', text: 'Choose personal, business or every use. Teachers give the Mulank more weight for a personal phone and the Bhagyank more for a business one.' },
      { name: 'Add your date of birth', text: 'Optional, but needed for the score, the compatibility level, your grid with the number and the help with choosing. Gender adds the Kua number to the grid, and a name adds a name-number card.' },
      { name: 'Read the report', text: 'The report card comes first, then the root, the compatibility, the last four digits, every pair, the digit counts, your grid, choosing a number and the traditional remedies.' },
    ],
  },
  howToRead: {
    heading: 'How to read a mobile number result',
    items: [
      { term: 'Number score', text: 'Out of 100, in four parts: fit with your birth numbers (40), two-digit combinations (35), the last four digits (15) and digit balance (10). Open any part to see its arithmetic. Bands run from very low to excellent.' },
      { term: 'Points to watch', text: 'Malefic yogas, a malefic pair in the ending, a digit used four times or more, three of a digit in a row, many zeros or a final zero. They are listed whatever the score, since a good total does not cancel a poor pair.' },
      { term: 'Root and compound number', text: 'All the digits added down to one names the number’s planet. The full total is also read as a compound number from Cheiro’s list of 10 to 52.' },
      { term: 'Compatibility level', text: 'A level from 1 to 5 from how the root’s planet and the planets of your Mulank and Bhagyank regard each other, with a card for each comparison and, if you gave a name, one for your name number.' },
      { term: 'Last four digits', text: 'Their total is added down to a root and compared with your birth numbers the same way as the whole number, and the final pair gets its own reading.' },
      { term: 'Two-digit combinations and yogas', text: 'Each two digits side by side, classed benefic, neutral or malefic, with a reading. Twelve pairs carry a yoga name, from the Raj yog of 1 and 7 to the Vish yog of 2 and 8.' },
      { term: 'Lo Shu grid with the number', text: 'Your own grid with the phone number’s digits added, marked +1 or +2 on each cell, the lines of three the number completes, and the gaps it still leaves.' },
      { term: 'Choosing a number', text: 'Every root from 1 to 9 rated for you, a checklist for a new number, and a table that scores up to five numbers side by side.' },
    ],
  },
  method: {
    heading: 'How this mobile number calculator works',
    anchor: 'numerology-relations',
    paragraphs: [
      'The root is the plain digit sum reduced to 1 to 9; master numbers are not used for phone numbers. Friendships between the seven visible planets follow the natural friendship table of the Brihat Parashara Hora Shastra. Rahu (4) and Ketu (7) are not in that table, so the page uses the convention most teachers follow and says so.',
      'The compatibility level is plain arithmetic on that table. The root is compared with your Mulank and then with your Bhagyank, each comparison scoring from −2 to +2. For every use the two count equally; for a personal phone the Mulank counts three times and the Bhagyank once, and for a business phone the reverse. The total is shown as a level from 1 to 5 with its working.',
      'The Number score turns that same total into up to 40 points. The combinations give up to 35: each pair is worth its full share if benefic, half if neutral and nothing if malefic, and the pairs are weighted from 1 for the first to 3 for the last. The root of the last four digits gives up to 15 on the same scale as the level, and digit balance gives up to 10, less 3 for each overloaded digit and 2 for each run of three, for three or more zeros, and for a final zero.',
      'The two-digit combinations come from a different source, the combination chart that teachers of mobile numerology pass around, and the page keeps the two apart. Raj yog and Bandhan yog are the chart’s own names; the other yoga names are those astrology gives the same two planets together.',
    ],
    example: 'For 98765 43210 the digits add to 45, and 4 + 5 = 9, so the root is 9, the number of Mars. Every digit from 0 to 9 appears exactly once, and the number ends in 0, which costs 2 points of digit balance.',
    limits: [
      'Combination charts and lucky totals differ from teacher to teacher, sometimes in opposite directions. This page follows one stated system throughout, and every weight it uses is shown in the working.',
      'Where the chart speaks of health, money or the law, this page keeps the theme and the advice that goes with it, and names no illness or event.',
      'A phone number has no measurable effect on events. Read the result as tradition, and keep a number you are happy with.',
    ],
  },
  faq: {
    heading: 'Mobile number numerology: questions people ask',
    items: [
      { id: 'mob-how', header: 'How is the numerology of a mobile number calculated?', body: 'Add all its digits and keep adding until one digit is left. That root number, from 1 to 9, is the number’s planet. The country code is left out because it is the same for everyone. The page works in your browser: the number is not sent to us or stored.' },
      { id: 'mob-score', header: 'What is a good mobile number score?', body: 'On this page 85 or more is excellent, 70 to 84 good, 55 to 69 moderate, 40 to 54 low and below 40 very low. The score adds four parts, and each part’s arithmetic is one click away, so you can see exactly where a number gains or loses.' },
      { id: 'mob-match', header: 'Should the mobile number total match my Mulank or my Bhagyank?', body: 'Teachers differ. Many give the Mulank more weight for a personal phone and the Bhagyank more for a business phone, so the page lets you choose, or count the two equally. Each comparison also has its own card.' },
      { id: 'mob-ending', header: 'Do the last four digits of a mobile number matter?', body: 'Many teachers say they matter most, so the page gives them their own part of the score and weighs the last pairs three times as much as the first. Zero adds nothing to a total and has no planet; a final zero or a long run of zeros is counted against a number.' },
      { id: 'mob-rajyog', header: 'What are Raj yog and the other yogas in a mobile number?', body: 'In the combination chart, 1 and 7 side by side are a Raj yog, linked with recognition, and teachers add that the number should not also contain an 8. Other pairs carry the names astrology gives the same two planets, such as Gajakesari for 2 and 3 or Vish for 2 and 8.' },
      { id: 'mob-lucky', header: 'Which mobile number is lucky for me?', body: 'Tradition says a number suits you when its root is a friend of your Mulank and Bhagyank. Add your date of birth and the page rates every root from 1 to 9 for you, lists what to look for in a new number, and scores up to five numbers side by side.' },
      { id: 'mob-remedy', header: 'What if my mobile number does not suit me?', body: 'Tradition suggests small customs: a phone cover or wallpaper in your Mulank’s colours, the mantra of the number’s planet, and a favourable date to start a new number. They are customs, not promises; a number you are happy with is a good one to keep.' },
    ],
  },
  relatedTools: [
    { slug: 'loshu-grid', why: 'Find the numbers missing from your grid before choosing a phone number.' },
    { slug: 'life-path', why: 'Get your Mulank and Bhagyank with their friendly numbers.' },
    { slug: 'chaldean', why: 'Read a name through the same nine planets.' },
  ],
  features: [
    'Number score out of 100 with its working',
    'Compatibility level for a personal or business phone',
    'Two-digit combinations, named yogas and the last four digits',
    'Your Lo Shu grid with the number added',
    'Best totals for you and a side-by-side comparison',
    'Traditional remedies; the number stays on your device',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Numerology', sameAs: 'https://en.wikipedia.org/wiki/Numerology' },
  aliases: ['Mobile Numerology Calculator', 'Phone Number Numerology Calculator'],
  frame: 'standard',
  keywords: { primary: 'mobile number numerology', secondary: ['mobile number numerology calculator', 'lucky mobile number', 'phone number numerology', 'mobile number by date of birth'] },
};

export default content;
