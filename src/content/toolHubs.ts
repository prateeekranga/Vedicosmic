/**
 * The tools index and its four category pages (/tools/category/<id>). The hub URL has three
 * segments on purpose: two tools have the slugs `numerology` and `astrology`, so a two-segment
 * hub would collide with them.
 */
import type { FAQItem } from '@/types/content.types';
import type { ToolCategory } from '@/types/tool.types';

export interface ToolHub {
  id: ToolCategory;
  path: string;
  /** Label in navigation, chips and breadcrumbs. */
  label: string;
  h1: string;
  /** 30–60 characters. */
  title: string;
  /** 70–160 characters. */
  description: string;
  intro: string[];
  /** "Which tool answers which question": the short guide above the tool list. */
  guide: { heading: string; items: { question: string; toolSlug: string; answer: string }[] };
}

export const hubPath = (id: ToolCategory) => `/tools/category/${id}`;

export const TOOL_HUBS: ToolHub[] = [
  {
    id: 'numerology',
    path: hubPath('numerology'),
    label: 'Numerology',
    h1: 'Numerology Calculators',
    title: 'Numerology Calculators: Name, Date of Birth & Lo Shu Grid',
    description: 'Five free numerology calculators: Life Path and name numbers, Mulank and Bhagyank, the Lo Shu grid, Chaldean name numbers and mobile number numerology.',
    intro: [
      'Numerology reads meaning into numbers taken from a date of birth and a name. Two traditions are in everyday use in India, and these calculators keep them apart so you always know which one produced a number. The Indian practice works from your Mulank (the Driver, from the day you were born), your Bhagyank (the Conductor, from the whole date) and the Lo Shu grid. The Western, or Pythagorean, practice works from the Life Path and the numbers held in the letters of your name.',
      'Each calculator shows its working step by step, so you can check the arithmetic yourself, and all five share one method: the same date gives the same Mulank and Bhagyank on every page. Nothing you type is sent to us.',
    ],
    guide: {
      heading: 'Which numerology calculator do you need?',
      items: [
        { question: 'What are my Mulank, Bhagyank and Kua numbers?', toolSlug: 'loshu-grid', answer: 'The Lo Shu grid places your birth-date digits in the 3×3 square and shows the missing and repeated numbers, the planes and all three numbers.' },
        { question: 'What is my Life Path number, and what does this year ask of me?', toolSlug: 'life-path', answer: 'The Life Path report gives the number with its working, then your personal year, month and day and the four life-stage cycles.' },
        { question: 'Can I get one full reading from my name and date of birth?', toolSlug: 'numerology', answer: 'The numerology calculator puts the Western name numbers beside the Indian summary on a single page you can print.' },
        { question: 'What number does a name or a business name add up to?', toolSlug: 'chaldean', answer: 'The Chaldean calculator gives the compound and root numbers with a letter-by-letter working, and lets you compare a second spelling.' },
        { question: 'Does my mobile number sit well with my birth numbers?', toolSlug: 'mobile-numerology', answer: 'The mobile number calculator reads the root, the repeated digits and the two-digit pairs, then compares them with your Mulank and Bhagyank.' },
      ],
    },
  },
  {
    id: 'astrology',
    path: hubPath('astrology'),
    label: 'Astrology',
    h1: 'Vedic Astrology Calculators',
    title: 'Vedic Astrology Tools: Kundli, Nakshatra, Rahu Kaal & Hora',
    description: 'Free Jyotish tools: cast a kundli with Lagna and dasha, find your janma nakshatra, and see Rahu Kaal, Abhijit muhurat and hora timings for your city.',
    intro: [
      'Vedic astrology, or Jyotish, measures the sky against the fixed stars and gives the Moon, the rising sign and the 27 nakshatras a larger part than the Sun sign most people know from Western astrology. These tools work out real positions for the date, time and place you enter. Planet positions come from an astronomy library checked against reference values, using the Lahiri ayanamsa that Indian panchangs follow.',
      'A result that depends on an exact birth time says so, and one that falls close to the border between two signs or nakshatras is flagged instead of being stated with false confidence. The method and its limits are set out on the How we calculate page.',
    ],
    guide: {
      heading: 'Which astrology tool do you need?',
      items: [
        { question: 'What are my Lagna, Moon sign and current dasha?', toolSlug: 'astrology', answer: 'The birth chart gives the Ascendant, all nine grahas with their nakshatra and pada, the houses and the Vimshottari dasha periods.' },
        { question: 'Which nakshatra was I born under?', toolSlug: 'nakshatra', answer: 'The nakshatra finder works out your birth star and pada from the Moon’s position, and lets you browse all 27.' },
        { question: 'When is Rahu Kaal today where I live?', toolSlug: 'panchang', answer: 'The Panchang page lists Rahu Kaal, Yamaganda, Gulika, Abhijit and Brahma muhurta from that day’s sunrise and sunset in your city, beside the tithi, nakshatra and Choghadiya.' },
        { question: 'Which planet rules this hour?', toolSlug: 'planetary-hours', answer: 'The hora calculator shows the planetary hour running now and the full sequence for the day and night.' },
        { question: 'Who are the nine grahas?', toolSlug: 'planet-mandala', answer: 'The Navagraha mandala introduces each of the nine with its nature, colour and symbolism.' },
      ],
    },
  },
  {
    id: 'energy',
    path: hubPath('energy'),
    label: 'Energy & Practice',
    h1: 'Practice Tools: Breath, Mantra and Meditation',
    title: 'Meditation, Pranayama, Japa & Puja Tools for Daily Practice',
    description: 'Free practice tools: a pranayama timer, 108-bead japa counter, Trataka, chakra test, sound bath, virtual puja and a daily sadhana page. No sign-up.',
    intro: [
      'These are tools for doing a practice, not for reading about one. Each keeps to a single job: pacing the breath, counting a mala, holding a steady gaze, mixing a sound bath, or walking through a short puja when you cannot reach a shrine. They run in the browser, need no account, and keep any streak or saved result on your own device. None of them asks you to believe anything first: pick one, try it for a few minutes, and keep the ones that help.',
      'They are offered for steadiness and reflection, not as treatment. Breathing practices should stay comfortable throughout, so stop if you feel dizzy, and see a doctor about any health concern.',
    ],
    guide: {
      heading: 'Which practice tool do you need?',
      items: [
        { question: 'Where do I begin each day?', toolSlug: 'sadhana', answer: 'The daily sādhana page shows today’s tithi and nakshatra, a short guided flow and your streak.' },
        { question: 'How do I slow my breathing down?', toolSlug: 'pranayama', answer: 'The pranayama timer paces five patterns, including box breathing, 4-7-8 and Nadi Shodhana.' },
        { question: 'How do I keep count of a mantra?', toolSlug: 'mantra-timer', answer: 'The japa counter tracks 108 beads, one tap at a time, with eight mantras to choose from.' },
        { question: 'How do I practise steady gazing?', toolSlug: 'tratak', answer: 'The Trataka tool fills the screen with a flame, bindu, Om or Sri Yantra and times the sitting.' },
        { question: 'Which of my chakras feels most held back?', toolSlug: 'chakra-assessment', answer: 'The chakra test turns 21 statements into a simple chart of the seven centres, with a practice for each.' },
        { question: 'What can I listen to while I sit or fall asleep?', toolSlug: 'chakra-frequency-player', answer: 'The chakra frequency player generates steady tones with an optional beat and a sleep timer.' },
        { question: 'Can I offer a puja without a shrine nearby?', toolSlug: 'puja-aarti', answer: 'The virtual puja lets you ring the bell, offer flowers and perform an aarti for one of seven deities.' },
      ],
    },
  },
  {
    id: 'cosmology',
    path: hubPath('cosmology'),
    label: 'Cosmology',
    h1: 'Calendar and Cosmology Tools',
    title: 'Vrat Calendar, Yantra Geometry & Biorhythm Tools',
    description: 'Upcoming Ekadashi, Purnima and Pradosh dates for your city, fourteen yantras drawn step by step, and a biorhythm chart from your date of birth. Free.',
    intro: [
      'Three tools about time and form. The vrat calendar works out fasting days such as Ekadashi, Pradosh and Purnima for your city from where the Moon actually is, using the tithi in force at sunrise. The sacred geometry lab draws fourteen classical yantras one stroke at a time so that the construction can be followed. The biorhythm calculator plots three fixed cycles from a date of birth, a twentieth-century model some people use as a prompt for reflection.',
      'They belong together because each turns a rule into something you can see: a lunar day into a date on a calendar, a ratio into a figure, a period into a curve.',
    ],
    guide: {
      heading: 'Which of these tools do you need?',
      items: [
        { question: 'When is the next Ekadashi?', toolSlug: 'vrat-calendar', answer: 'The vrat calendar lists the fasting days of the next six weeks for the city you choose.' },
        { question: 'How is the Sri Yantra constructed?', toolSlug: 'yantra', answer: 'The sacred geometry lab draws it stroke by stroke and explains the proportions behind it.' },
        { question: 'Where are my biorhythm cycles today?', toolSlug: 'biorhythm', answer: 'The biorhythm calculator charts the physical, emotional and intellectual curves around today.' },
      ],
    },
  },
];

export function getToolHub(id: string | undefined): ToolHub | undefined {
  return TOOL_HUBS.find((h) => h.id === id);
}

/** The tools index page itself. */
export const TOOLS_INDEX = {
  path: '/tools',
  h1: 'Free Vedic Astrology and Numerology Tools',
  title: 'Free Vedic Astrology, Numerology & Daily Practice Tools',
  description: 'Kundli, nakshatra, Rahu Kaal, hora, numerology and Lo Shu calculators, plus breathing and meditation tools. Free, no sign-up, calculated in your browser.',
  intro: [
    'Every tool on this page is free and works without an account. The astrology and calendar tools calculate real positions of the Sun, Moon and planets for the date and place you give them; the numerology calculators show each step of their arithmetic; the practice tools simply keep time while you sit. Whatever you enter stays in your browser.',
    'The tools are grouped by tradition below. If you are new here, the Lo Shu grid, the birth chart and the daily sādhana page are the usual places to start.',
  ],
  faqHeading: 'Using the tools',
  faqs: [
    { id: 'tools-differ', header: 'Why does a result here differ from another app or website?', body: 'Traditions differ in their rules. An astrology site may use a different ayanamsa or house system, and a numerology site may place different numbers in the Lo Shu grid or reduce a date in another order. Each tool here states the method it follows so you can compare like with like.' },
    { id: 'tools-save', header: 'Can I save or share a result?', body: 'Yes. Most tools have a save button that keeps the result in this browser only, after asking you once, and a share button that passes on the page link. Saved results are listed on the daily sādhana page, where you can delete them.' },
    { id: 'tools-time', header: 'What if I do not know my exact birth time?', body: 'The birth chart accepts an unknown time and then leaves out the parts that depend on it, such as the Lagna and the houses. The numerology calculators need only the date, and the daily tools need only a place.' },
    { id: 'tools-offline', header: 'Do the tools need an internet connection to calculate?', body: 'The page has to load once, and searching for a town needs a connection. After that the calculations run on your own device, which is why nothing you type is sent to us.' },
    { id: 'tools-phone', header: 'Do the tools work on a phone?', body: 'Yes. Every tool works on a phone screen and needs only a current browser with JavaScript switched on.' },
  ] as FAQItem[],
};
