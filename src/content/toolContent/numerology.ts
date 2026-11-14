import type { ToolContent } from '@/types/tool.types';

const content: ToolContent = {
  slug: 'numerology',
  lastReviewed: '2026-11-14',
  lede: 'Enter your name and date of birth for a full numerology report. It gives the six core numbers of the Western system, your karmic numbers, your Mulank, Bhagyank and Kua with a Lo Shu grid, and your Chaldean name number, each with its working.',
  toolHeading: 'Calculate your numerology report',
  about: {
    heading: 'What this numerology calculator covers',
    paragraphs: [
      'Numerology has more than one school, and they do not use the same tables. Western numerology follows the Pythagorean letter values, in which the alphabet runs 1 to 9 three times over. Indian practice reads the date of birth through the Lo Shu square and reads names through the older Chaldean values, in which no letter is worth 9.',
      'Most calculators pick one school without saying so, which is why results rarely match between sites. This one works out both, labels every number with the system it belongs to, and puts them on a single page you can print.',
    ],
  },
  howToUse: {
    heading: 'How to use the numerology calculator',
    steps: [
      { name: 'Type your name', text: 'Use the name you go by every day, in English letters. A different spelling gives different name numbers.' },
      { name: 'Choose your date of birth', text: 'Pick the day, month and year. An impossible date, such as 31 February, is refused.' },
      { name: 'Add gender if you want the Kua number', text: 'It is optional and affects nothing else.' },
      { name: 'Read or print the report', text: 'Each number shows the system it comes from. The working is under “How this was calculated”.' },
    ],
  },
  howToRead: {
    heading: 'How to read your numerology report',
    items: [
      { term: 'Life Path', text: 'From the date of birth. The main theme of a life.' },
      { term: 'Expression', text: 'From every letter of the name. Abilities and manner of working. Also called the Destiny number.' },
      { term: 'Soul Urge', text: 'From the vowels. What a person privately wants. Also called Heart’s Desire.' },
      { term: 'Personality', text: 'From the consonants. The first impression a person gives.' },
      { term: 'Karmic debt and karmic lessons', text: 'A debt is a total of 13, 14, 16 or 19 behind one of your numbers. A lesson is a number from 1 to 9 that no letter of your name carries.' },
      { term: 'Mulank, Bhagyank and the grid', text: 'The Indian reading of the same date, shown with a small Lo Shu grid.' },
      { term: 'Chaldean name number', text: 'The compound and root of your name in the Chaldean system, the one Indian numerologists use when advising on spellings.' },
    ],
  },
  method: {
    heading: 'How this numerology calculator works',
    anchor: 'numerology-western',
    paragraphs: [
      'Name numbers are worked out word by word: each word is added down first, keeping 11, 22 and 33, and the results are then added together. The vowels are A, E, I, O and U; Y is always counted as a consonant. Letters with accents count as the plain letter, and anything outside A to Z is ignored.',
      'The date numbers follow the same rules as the Life Path and Lo Shu calculators, so the three pages always agree.',
    ],
    example: 'For the name John Smith: JOHN is 1 + 6 + 8 + 5 = 20, which reduces to 2, and SMITH is 1 + 4 + 9 + 2 + 8 = 24, which reduces to 6. The Expression number is 2 + 6 = 8. The vowels O and I give 6 + 9 = 15, so the Soul Urge is 6.',
    limits: [
      'Both letter systems are defined for the English alphabet only. A name in Devanagari or another script has to be typed in English letters first.',
      'The readings describe tradition. They do not predict events.',
    ],
  },
  faq: {
    heading: 'Numerology calculator: questions people ask',
    items: [
      { id: 'num-system', header: 'Which numerology system does this calculator use?', body: 'Both of the main ones. Life Path, Expression, Soul Urge, Personality, Birthday and Maturity use the Western (Pythagorean) system. Mulank, Bhagyank, Kua and the grid follow the Indian Lo Shu method, and the name number is Chaldean. Every number is labelled.' },
      { id: 'num-name', header: 'Should I use my full legal name or the name I use daily?', body: 'Western numerologists usually take the full name given at birth for the Expression number. Indian numerologists usually take the name a person signs and is called by. Try both; the calculator shows the working either way.' },
      { id: 'num-expression', header: 'What is the difference between the Expression number and the Chaldean name number?', body: 'They use different letter tables, so they often differ. The Expression number belongs to the Western system and runs 1 to 9 plus master numbers. The Chaldean number has a compound, such as 23 or 41, and a root from 1 to 9.' },
      { id: 'num-debt', header: 'What is a karmic debt number?', body: 'In Western numerology the totals 13, 14, 16 and 19 are called karmic debts when they appear just before a number is reduced. Each is read as a particular lesson: steady work, moderation, humility and interdependence.' },
      { id: 'num-y', header: 'Does Y count as a vowel in numerology?', body: 'Not here. Schools disagree about Y, so this calculator keeps one rule: A, E, I, O and U are vowels and Y is a consonant. A name with no vowels has no Soul Urge number.' },
      { id: 'num-stored', header: 'Is my name stored anywhere?', body: 'No. The calculation runs in your browser and nothing you type is sent to us. If you save the report, only the numbers are kept, on your own device.' },
    ],
  },
  relatedTools: [
    { slug: 'loshu-grid', why: 'Read the grid in full: planes, yogs, repeats and Kua directions.' },
    { slug: 'life-path', why: 'Add personal year, month and day and the four pinnacles.' },
    { slug: 'chaldean', why: 'Compare two spellings of a name letter by letter.' },
  ],
  features: [
    'Six Western core numbers',
    'Karmic debts and lessons',
    'Mulank, Bhagyank and Kua with a Lo Shu grid',
    'Chaldean name number',
    'Printable report',
    'Step-by-step working',
  ],
  appCategory: 'LifestyleApplication',
  topic: { name: 'Numerology', sameAs: 'https://en.wikipedia.org/wiki/Numerology' },
  aliases: ['Name Numerology Calculator', 'Numerology Report'],
  frame: 'compact',
  keywords: { primary: 'numerology calculator', secondary: ['numerology by name and date of birth', 'expression number', 'soul urge number', 'name numerology'] },
};

export default content;
