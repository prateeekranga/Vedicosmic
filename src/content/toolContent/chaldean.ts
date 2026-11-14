import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'chaldean',
  lastReviewed: '2026-11-14',
  lede: 'Type a name to get its Chaldean compound number and root number, with the letter values shown one by one. You can enter a second spelling beside it to see what a change of letters does to the total.',
  toolHeading: 'Check a name',
  about: {
    heading: 'What Chaldean numerology is',
    paragraphs: [
      'Chaldean numerology is the older of the two letter systems in common use. It gives each letter a value from 1 to 8 according to its sound, and gives no letter the value 9, which it treats as set apart. In India it is the system most numerologists use for names, including business names and changes of spelling.',
      'A name has two numbers here. The compound number is the full total, for example 23 or 41, and carries its own reading. The root is that total added down to a single digit, and it links the name to one of the nine planets.',
    ],
  },
  howToUse: {
    heading: 'How to calculate a Chaldean name number',
    asHowTo: true,
    steps: [
      { name: 'Write the name in English letters', text: 'Use the spelling you sign with, word by word.' },
      { name: 'Give each letter its value', text: 'A, I, J, Q and Y are 1. B, K and R are 2. C, G, L and S are 3. D, M and T are 4. E, H, N and X are 5. U, V and W are 6. O and Z are 7. F and P are 8.' },
      { name: 'Add each word, then add the words', text: 'The sum of all the words is the compound number.' },
      { name: 'Reduce to the root', text: 'Add the digits of the compound number until one digit is left.' },
    ],
  },
  howToRead: {
    heading: 'How to read a Chaldean result',
    items: [
      { term: 'Root number', text: 'A number from 1 to 9 with a ruling planet. It is the general character of the name.' },
      { term: 'Compound number', text: 'The total before reduction. Cheiro, who set the system out in English in 1926, describes each compound from 10 to 52.' },
      { term: 'Totals above 52', text: 'Their digits are added until the result falls between 10 and 52, and that number’s reading is used.' },
      { term: 'Second spelling', text: 'Shown side by side so you can see whether a change alters the root, the compound, or both.' },
    ],
  },
  method: {
    heading: 'How this Chaldean calculator works',
    anchor: 'numerology-names',
    paragraphs: [
      'The page uses the letter values printed by Cheiro and repeated by almost every later writer. It adds the whole name to get the compound number, which is the usual method, and also shows the other one, in which each word is reduced first; the two always reach the same root.',
      'The compound readings are restated in plain words from Cheiro’s book. Where he gave a stern warning, the page keeps the caution about conduct and leaves out the forecast.',
    ],
    example: 'For the name Narendra Modi: NARENDRA is 5 + 1 + 2 + 5 + 5 + 4 + 2 + 1 = 25 and MODI is 4 + 7 + 4 + 1 = 16. The compound number is 25 + 16 = 41, and 4 + 1 gives the root 5.',
    limits: [
      'The values exist only for the English alphabet.',
      'A name number is a tradition’s reading of a spelling. It is not evidence that changing a spelling changes anything else.',
    ],
  },
  faq: {
    heading: 'Chaldean numerology: questions people ask',
    items: [
      { id: 'ch-differs', header: 'How does the Chaldean letter table differ from the Pythagorean one?', body: 'Pythagorean numerology runs the alphabet in order, A = 1 to I = 9 and round again. Chaldean numerology assigns values by sound, uses only 1 to 8, and reads the unreduced compound number as well as the root.' },
      { id: 'ch-nine', header: 'Why is no letter given the number 9?', body: 'Chaldean tradition treats 9 as a sacred number and keeps it out of the alphabet. A name can still add up to 9: it is a possible root, just not the value of any single letter.' },
      { id: 'ch-compound', header: 'What is a compound number in Chaldean numerology?', body: 'It is the total of a name before it is reduced, such as 17 or 32. In this system the compound number is read in its own right and is said to show the less visible side of a name, while the root shows the outward side.' },
      { id: 'ch-which-name', header: 'Which name should I enter, my full name or the one I am known by?', body: 'Chaldean practice uses the name you are actually called and sign with, since that is the one in daily use. If you are known by more than one, check each.' },
      { id: 'ch-business', header: 'Can I check a business or brand name?', body: 'Yes. Type it exactly as it is written. Digits in a name keep their own value, so “Studio 7” counts the 7 as seven.' },
      { id: 'ch-luck', header: 'Will changing the spelling of my name change my luck?', body: 'This page cannot tell you that, and it would be wrong to promise it. It can only show what the tradition says about each spelling so you can compare them.' },
    ],
  },
  relatedTools: [
    { slug: 'numerology', why: 'See the Western name numbers worked out from the same name.' },
    { slug: 'loshu-grid', why: 'Find your Mulank and Bhagyank, which name numbers are usually compared with.' },
    { slug: 'mobile-numerology', why: 'Read a phone number through the same nine planets.' },
  ],
  features: [
    'Chaldean compound and root numbers',
    'Letter-by-letter working',
    'Compound readings from 10 to 52',
    'Compare two spellings',
    'Works for business names',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Chaldean numerology' },
  aliases: ['Name Number Calculator', 'Chaldean Name Numerology Calculator'],
  frame: 'compact',
  keywords: { primary: 'chaldean numerology calculator', secondary: ['name number calculator', 'compound number', 'name numerology', 'business name numerology'] },
};

export default content;
