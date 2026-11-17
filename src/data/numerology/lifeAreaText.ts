/**
 * Readings for the Career, Relationships and Health and energy part of the Lo Shu page: what the
 * grid holds for each area, how each dasha period reads, the remedies, and the numbers to go
 * carefully with. Wording says what the tradition associates with a number or a period. It never
 * says what will happen, never names an illness, and never offers health advice beyond ordinary
 * habits; the tests lint every sentence here.
 */
import {
  LINE_NAME, LOSHU_LINES, NUMBER_DIRECTION, type AreaId, type CarefulTier, type Digit, type LineId, type Relation, type SupportBand, type Tone,
} from '@/engine/numerology';
import { NUMBERS } from './numbers';
import { NODE_DAY } from './mobileText';
import { DIRECTION_NAME } from './loshuText';

export const AREA_TEXT: Readonly<Record<AreaId, { name: string; blurb: string }>> = {
  career: { name: 'Career', blurb: 'Work, recognition and steady progress' },
  relationships: { name: 'Relationships', blurb: 'Partnership, family and friendship' },
  health: { name: 'Health and energy', blurb: 'Daily energy, rest and routine' },
};

export const AREAS_INTRO = 'For each of three parts of life this shows how many of the numbers the tradition links with it are in your grid, which are missing, and one practical step for each gap. It is a reading for reflection, not a measure of how your life will go.';

/** Under the health reading: habits and energy only. */
export const HEALTH_NOTE = 'This is about habits and energy, drawn from what the tradition links with each planet. It is not medical advice and cannot assess your health; please see a qualified doctor about any concern.';

/** One sentence for how much of an area the grid holds. */
export const AREA_BAND_TEXT: Readonly<Record<AreaId, Readonly<Record<SupportBand, string>>>> = {
  career: {
    strong: 'Most of the numbers tradition links with work are in your grid. This is read as a solid base: the task is to use it rather than to find it.',
    mixed: 'About half of the numbers tradition links with work are present. The present ones are your working strengths; the missing ones are where a habit helps most.',
    thin: 'Few of the numbers tradition links with work are in your grid. This is read as a field you build through practice and routine, not as a limit.',
  },
  relationships: {
    strong: 'Most of the numbers tradition links with closeness are in your grid. This is read as a warm base for family, partnership and friendship.',
    mixed: 'About half of the numbers tradition links with closeness are present. What is present is your natural warmth; the gaps are where deliberate attention helps.',
    thin: 'Few of the numbers tradition links with closeness are in your grid. This is read as warmth that you grow through small, regular acts of attention.',
  },
  health: {
    strong: 'Most of the numbers tradition links with energy and routine are in your grid. This is read as a good base for habits that last.',
    mixed: 'About half of the numbers tradition links with energy and routine are present. Lean on those, and give the missing ones a fixed place in the week.',
    thin: 'Few of the numbers tradition links with energy and routine are in your grid. This is read as habits that come through planning rather than by instinct.',
  },
};

export interface AreaNumberText {
  /** The part of the area the number stands for, in a few words. */
  role: string;
  /** When the number is in the grid. */
  gives: string;
  /** When it is missing. */
  gap: string;
  /** One practical step for the gap. */
  habit: string;
}

/** The five numbers of each area, in the order the engine lists them. */
export const AREA_NUMBER_TEXT: Readonly<Record<AreaId, Readonly<Partial<Record<Digit, AreaNumberText>>>>> = {
  career: {
    8: {
      role: 'Sustained effort',
      gives: 'Saturn’s number is present. It is read as patience with long projects and the stamina to earn progress slowly and steadily.',
      gap: 'Without an 8, tradition reads follow-through on long projects as the part that needs deliberate support.',
      habit: 'Choose one long commitment, break it into weekly steps and keep a written record of what you finish.',
    },
    1: {
      role: 'Leadership and visibility',
      gives: 'The Sun’s number is present. It is read as willingness to take the lead and to be seen doing good work.',
      gap: 'Without a 1, tradition reads asking for credit, or for a bigger role, as the harder step.',
      habit: 'Give your view first in one meeting a week, and write down your results so they can be shown.',
    },
    5: {
      role: 'Communication and trade',
      gives: 'Mercury’s number is present. It is read as quick learning, persuasive speech and a head for deals and contacts.',
      gap: 'Without a 5, tradition reads networking and putting your case into words as skills to practise.',
      habit: 'Practise a two-minute summary of your work aloud, and message one useful contact every week.',
    },
    3: {
      role: 'Learning and guidance',
      gives: 'Jupiter’s number is present. It is read as an adviser’s outlook, with ideas that other people find useful.',
      gap: 'Without a 3, tradition reads advice and further study as things to seek out rather than to expect.',
      habit: 'Pick one skill to study each quarter, and find a mentor or someone to teach in return.',
    },
    4: {
      role: 'Method and systems',
      gives: 'Rahu’s number is present. It is read as a talent for systems and schedules, and for noticing what others overlook.',
      gap: 'Without a 4, tradition reads routine and paperwork as the weak spot in an otherwise good plan.',
      habit: 'Keep one calendar and one task list, and give the same ten minutes each day to tidying both.',
    },
  },
  relationships: {
    6: {
      role: 'Warmth and commitment',
      gives: 'Venus’s number is present. It is read as warmth, loyalty and the wish to make a home with other people.',
      gap: 'Without a 6, tradition reads open affection and family ties as things to tend on purpose.',
      habit: 'Set a regular time for family or partner with phones put away, and say one appreciation aloud each day.',
    },
    2: {
      role: 'Sensitivity and listening',
      gives: 'The Moon’s number is present. It is read as sensitivity to other people’s moods and the ability to listen well.',
      gap: 'Without a 2, tradition reads noticing other people’s feelings as a skill to build with practice.',
      habit: 'Ask one open question in each conversation, and wait for the whole answer before you reply.',
    },
    5: {
      role: 'Honest speech',
      gives: 'Mercury’s number is present. It is read as ease in talking things through and finding words for a difficulty.',
      gap: 'Without a 5, tradition reads hard conversations as the ones most likely to be put off.',
      habit: 'Name one small concern gently as soon as it appears, instead of storing it up.',
    },
    3: {
      role: 'Goodwill and generosity',
      gives: 'Jupiter’s number is present. It is read as generosity, optimism and a wish to see the best in others.',
      gap: 'Without a 3, tradition reads encouragement and shared laughter as things to offer deliberately.',
      habit: 'Send one encouraging message a day, and share something you have learned with a friend.',
    },
    9: {
      role: 'Courage and protectiveness',
      gives: 'Mars’s number is present. It is read as loyalty, protectiveness and the courage to stand up for people you love.',
      gap: 'Without a 9, tradition reads speaking up in a relationship, or for someone else, as taking extra courage.',
      habit: 'Practise stating one clear request each week, calmly and without apology.',
    },
  },
  health: {
    1: {
      role: 'Vitality',
      gives: 'The Sun’s number is present. It is read as a strong sense of vitality and a liking for the morning.',
      gap: 'Without a 1, tradition reads a steady supply of energy as something built by daily habit.',
      habit: 'Get some morning daylight, and keep your wake-up and meal times as regular as you can.',
    },
    2: {
      role: 'Calm and rest',
      gives: 'The Moon’s number is present. It is read as an ability to settle the mind and to recover through rest.',
      gap: 'Without a 2, tradition reads calm and good sleep as habits to protect on purpose.',
      habit: 'Keep a wind-down hour before bed with screens put away, and note your feelings in a short journal.',
    },
    9: {
      role: 'Stamina and movement',
      gives: 'Mars’s number is present. It is read as physical drive, and a need to use it in movement.',
      gap: 'Without a 9, tradition reads stamina and regular exercise as things to schedule, not to wait for.',
      habit: 'Fix three times a week for walking, yoga or sport, and keep the slot like an appointment.',
    },
    8: {
      role: 'Routine and recovery',
      gives: 'Saturn’s number is present. It is read as the discipline to keep routines and to rest when rest is due.',
      gap: 'Without an 8, tradition reads steady routines and respect for limits as the area to watch.',
      habit: 'Choose one fixed weekly rest day, and book your regular check-ups well in advance.',
    },
    5: {
      role: 'Balance',
      gives: 'Mercury’s number, the centre of the square, is present. It is read as balance between mind, body and activity.',
      gap: 'Without a 5 the centre of the square is empty, and tradition reads balance as the quality to rebuild.',
      habit: 'Spend five minutes on slow, steady breathing each day, and write down one aim for the week.',
    },
  },
};

// ---------------------------------------------------------------------------------------------
// The years ahead
// ---------------------------------------------------------------------------------------------

export const OUTLOOK_INTRO = 'Each dasha period is read through the planet of its number. Here the planet of every year, and of every short period within this year, is set beside your Driver and Conductor and called favourable, neutral or needing care for work, relationships and health.';

/** The honest note under every outlook: what the method is and is not. */
export const OUTLOOK_NOTE = 'This is a way of reading used on this page, built from the table of planetary friendships and the dasha periods above. No classical text lays down a rule for years like this, so take it as a tradition-based prompt for reflection. It cannot say what will happen.';

export const TONE_RULE = 'Each period earns +1 for a planet that is a friend of your Driver or Conductor, 0 for neutral and −1 for unfriendly, counted by the area’s weights, with a point more or less for a number your grid lacks or already repeats. A total of +2 or more reads favourable, −2 or less needing care, and anything between neutral. The working is under “How this was calculated”.';

export const OUTLOOK_TONE_LABEL: Readonly<Record<Tone, string>> = { supportive: 'Favourable', steady: 'Neutral', testing: 'Needs care' };

export const TONE_TEXT: Readonly<Record<Tone, Readonly<Record<AreaId, string>>>> = {
  supportive: {
    career: 'Your Driver and Conductor get on well with this number, so tradition reads it as a good period to push ahead at work.',
    relationships: 'Your own numbers are friendly towards this one, so tradition reads it as an easy period for closeness and agreement.',
    health: 'Your own numbers are friendly towards this one, so tradition reads it as a period when good habits come more easily.',
  },
  steady: {
    career: 'This number is neither strongly for nor against yours, so tradition reads results at work as following the effort you put in.',
    relationships: 'This number is neither strongly for nor against yours. Closeness follows attention, so give it on purpose.',
    health: 'This number is neither strongly for nor against yours. Energy follows regular habits, so keep them steady.',
  },
  testing: {
    career: 'Your numbers and this one pull against each other, so tradition advises patience, smaller steps and careful timing at work.',
    relationships: 'Your numbers and this one pull against each other, so tradition advises listening, clear words and no big decisions made in haste.',
    health: 'Your numbers and this one pull against each other, so tradition advises more rest, a lighter load and gentle, regular routines.',
  },
};

/** How a period ruled by each number reads in each area, whatever the tone. */
export const PERIOD_AREA_TEXT: Readonly<Record<Digit, Readonly<Record<AreaId, string>>>> = {
  1: {
    career: 'Recognition and leadership come to the front: a time to take the initiative, ask for a bigger role and let your work be seen.',
    relationships: 'Independence is strong. Tradition suggests making room for the other person’s view, since pride is the usual friction.',
    health: 'Energy is read as high and centred on the morning. Tradition advises not outrunning yourself, and keeping meals and sleep regular.',
  },
  2: {
    career: 'Partnership, teamwork and dealings with the public are favoured over solo pushing; patience repays more than speed.',
    relationships: 'Feeling and closeness are in focus: a good time to listen, to mend small rifts and to be more present with family.',
    health: 'Moods and sleep are read as more sensitive. Tradition advises quiet evenings, regular rest and attention to how stress shows up.',
  },
  3: {
    career: 'Learning, advice and expansion are in focus: study, teaching, mentors and a wider field are all traditionally favoured.',
    relationships: 'Goodwill and generosity are read as strong. A fitting time for family gatherings, shared learning and kind gestures.',
    health: 'A period for building good habits and learning what suits your own body; tradition cautions only against overindulgence.',
  },
  4: {
    career: 'Hard, methodical work and unconventional turns. Systems, technology and unusual routes are traditionally linked with it, and shortcuts deserve extra care.',
    relationships: 'Restlessness or unusual circumstances can unsettle routines. Tradition advises clear talk and patience over quick decisions.',
    health: 'Overwork is the traditional watchword. Plan rest as carefully as work, and keep a steady daily routine.',
  },
  5: {
    career: 'Communication, trade, travel and contacts are in focus. Change comes fast, so keep written notes of what has been agreed.',
    relationships: 'Talk and exchange are favoured, which suits clearing the air; words can run ahead of feeling, so listen as much as you speak.',
    health: 'Busy schedules and a restless mind take centre stage. Tradition suggests calming breath, less screen time and simple, balanced meals.',
  },
  6: {
    career: 'Creative, catering and service work, and workplaces that value harmony, are favoured; the care of your working surroundings matters.',
    relationships: 'Home, partnership and affection are in focus: a traditionally favourable time for deepening bonds and caring for family.',
    health: 'Comfort and indulgence need moderation. Tradition favours gentle, regular routines, good food in measure and time to rest.',
  },
  7: {
    career: 'Research, study and quiet, independent work suit the period; tradition reads depth as worth more than recognition now.',
    relationships: 'A need for solitude can look like distance. Tradition advises telling people close to you when you simply need quiet.',
    health: 'Inner work and quiet are favoured. Tradition advises keeping contact with people and with nature, so reflection does not become withdrawal.',
  },
  8: {
    career: 'Duty and slow results: responsibilities grow, and tradition says that patient, well-recorded effort made now is the kind that lasts.',
    relationships: 'Commitment is tested through duty and patience. Tradition advises dependable acts and warm words, since seriousness can read as distance.',
    health: 'Endurance is asked for. Tradition advises a fixed rest day, regular check-ups and not carrying more than a day can hold.',
  },
  9: {
    career: 'Energy for finishing, competing and taking bold steps; completing what is still pending is read as the best use of the period.',
    relationships: 'Passion and protectiveness run high, and so does temper. Tradition advises pausing before you reply and keeping disagreements specific.',
    health: 'Physical energy is high and needs an outlet. Regular exercise suits the period; tradition cautions against haste and risk.',
  },
};

export const WINDOWS_INTRO = 'The year divides into nine short periods. Each is set beside your Driver and Conductor in the same way, so you can see which weeks suit a push, and which call for a lighter touch.';
export const FOCUS_LABEL = { lean: 'Lean into', gentle: 'Go gently with' } as const;
export const FOCUS_LINE = {
  lean: 'This is the area where the year sits best beside your numbers, so tradition reads it as the one to lean into.',
  gentle: 'This is the area where the year sits least easily beside your numbers, so tradition reads it as the one to go gently with.',
} as const;
export const WINDOW_LABEL = { best: 'Best short period from today', careful: 'Short period to take most care in' } as const;
export const FOCUS_NONE = 'No area stands out this year, either way. Tradition reads that as a year in which results follow ordinary steady effort.';
export const WINDOW_NONE = 'No short period of this kind is left in the year.';

// ---------------------------------------------------------------------------------------------
// Remedies
// ---------------------------------------------------------------------------------------------

export const REMEDY_PAGE_INTRO = 'Tradition offers remedies at three levels. A habit changes what you do each day, and is the one with the clearest effect. A custom (a mantra, an observance, a gift to someone in need) is a way of keeping the intention in mind. A gemstone is the costliest, and needs the most care.';
export const REMEDY_PRIORITY_INTRO = 'These missing numbers count in the most places across career, relationships and health, so they are a sensible place to begin. Choose one and keep it up for a month before adding another.';
export const REMEDY_NONE = 'None of the numbers that count most across these three areas is missing from your grid. The page still lists every missing number below, with its customs.';
export const GEM_NOTE = 'Gemstones: teachers advise a trial period and a qualified astrologer’s view before wearing one, most of all for blue sapphire, cat’s eye, hessonite and red coral. This page names the stone linked with each planet and never suggests buying one. Mantra, observance and habit carry no such caution.';

/** What tradition suggests for each planet beyond its mantra, colours and stone, which come from the number's own entry. */
export const REMEDY_TEXT: Readonly<Record<Digit, { charity: string; observance: string }>> = {
  1: { charity: 'Wheat, jaggery or copper, given on a Sunday.', observance: 'Keep Sunday to a simple meal of fruit and milk.' },
  2: { charity: 'Rice, milk or white sweets, given on a Monday.', observance: 'Keep Monday a gentle day, with a plain sattvic meal.' },
  3: { charity: 'Yellow lentils, turmeric, books or a student’s fees, given on a Thursday.', observance: 'Keep Thursday to a plain meal, eaten after sunset or made of banana and chana dal.' },
  4: { charity: 'Food or blankets for people in need, given quietly on a Saturday.', observance: 'Keep Saturday evening unhurried, with a plain meal.' },
  5: { charity: 'Books, stationery or green gram for students, given on a Wednesday.', observance: 'Keep Wednesday to a light meal, and leave out fried and heavy food.' },
  6: { charity: 'Rice, sugar or white cloth, given on a Friday.', observance: 'Keep Friday to sattvic food, and go light on sour things.' },
  7: { charity: 'Food or blankets for homeless people, given without a name on a Tuesday.', observance: 'Keep Tuesday simple, with a plain meal and little talk.' },
  8: { charity: 'Black sesame, mustard oil or iron utensils, or a meal for an elderly person, given on a Saturday.', observance: 'Keep Saturday to a plain meal that includes sesame or black urad dal.' },
  9: { charity: 'Red lentils or jaggery, or help for people recovering from a disaster, given on a Tuesday.', observance: 'Keep Tuesday to a simple meal with little salt, eaten after sunset.' },
};

/** The weekday of a number's planet; Rahu and Ketu have none of their own, so the site's usual pairing is used. */
export const dayOfNumber = (d: Digit): string | null => NUMBERS[d].day ?? NODE_DAY[d] ?? null;

/** The Lo Shu direction of a missing number, with what teachers suggest for it. */
export function placeAdvice(d: Digit): string {
  const dir = NUMBER_DIRECTION[d];
  if (dir === 'centre') return `Lo Shu direction: the centre, which 5 holds on the square. Keep the centre of the home open, uncluttered and well lit.`;
  return `Lo Shu direction: ${DIRECTION_NAME[dir]}, the point ${d} holds on the square. Keep that part of the home or room clear, clean and well lit.`;
}

// ---------------------------------------------------------------------------------------------
// Numbers and dates to go carefully with
// ---------------------------------------------------------------------------------------------

export const CAREFUL_INTRO = 'Some numbers sit uneasily with your own, because their planets are unfriendly to your Driver’s or your Conductor’s in the traditional table. Teachers suggest more care, not avoidance, when they come up in dates, phone numbers, vehicle numbers or house numbers.';
export const CAREFUL_USE = 'Where the choice is yours, such as a phone number, a vehicle number or a day to begin something, prefer your own numbers and their friends. Where it is not, a number or date on this list is a reason for a little extra preparation and nothing more.';
export const CAREFUL_NOTE = 'Popular lists of numbers to avoid are usually general, such as 4, 8 or 13. This list is worked out from your own two numbers, and a number that is cool towards you can be friendly to someone else.';
export const CAREFUL_NONE = 'No other number is unfriendly to your Driver or your Conductor in the table, so there are no numbers or dates to single out.';
export const CAREFUL_TIER_TEXT: Readonly<Record<CarefulTier, { label: string; text: string }>> = {
  challenging: { label: 'Most care', text: 'Unfriendly to both your Driver’s planet and your Conductor’s. Tradition suggests the most care here.' },
  mixed: { label: 'Split pull', text: 'Unfriendly to one of your planets and friendly to the other, so the pull is divided.' },
  careful: { label: 'Mild care', text: 'Unfriendly to one of your planets and neutral to the other: a gentle caution.' },
};

// ---------------------------------------------------------------------------------------------
// Where this comes from
// ---------------------------------------------------------------------------------------------

export const SOURCES_INTRO = 'What is taken from the tradition, and what is this page’s own way of counting, so you can judge each for yourself.';
export const SOURCE_TRADITION: readonly string[] = [
  'The planet of each number and the table of planetary friendships come from the Brihat Parashara Hora Shastra (natural friendships). Rahu and Ketu follow the convention most teachers use.',
  'The same text, in chapter 3, verses 12 and 13, names the Sun as the soul, the Moon as the mind, Mars as courage, Mercury as speech and Jupiter as knowledge and happiness. These are the classical anchors for those five numbers below.',
  'The eight lines of the square and the dasha periods are the Indian numerology teaching described under “How this was calculated”.',
  'The mantra, weekday, gift, colour and stone of each planet are customs common among Indian numerology and Jyotish teachers, as set out in their current teaching.',
];
export const SOURCE_OWN: readonly string[] = [
  'Which five numbers, and which lines, count towards each area, and the points they earn. Venus for warmth and Saturn for work and endurance follow later teachers rather than a fixed line of the text above.',
  'Counting the Driver and Conductor with a weight for each area, and calling a period supportive, steady or testing from the friendship table.',
  'The practical habit given for each missing number: ordinary advice on routine, sleep and practice, set in the tradition’s frame.',
];

// ---------------------------------------------------------------------------------------------
// Small sentences built from the tables above
// ---------------------------------------------------------------------------------------------

const list = (xs: readonly string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : (xs[0] ?? ''));
/** "the Sun" and "the Moon" read naturally in a sentence; the other planets take no article. */
const the = (planet: string) => (planet === 'Sun' || planet === 'Moon' ? `the ${planet}` : planet);

/** Why a missing number is among the first to work on: the yog or line it would complete, or where it counts. */
export function priorityWhy(p: { completes: readonly LineId[]; areas: readonly { area: AreaId }[] }): string {
  const yog = p.completes.find((id) => id === 'golden' || id === 'silver');
  const line = yog ?? p.completes[0];
  if (line) return `Completes the ${LINE_NAME[line]} (${LOSHU_LINES.find((l) => l.id === line)!.cells.join('-')}).`;
  return `Counts in ${list(p.areas.map((a) => AREA_TEXT[a.area].name.toLowerCase()))}.`;
}

/** One practical step for a missing number: the habit for the area where it weighs most, or the tradition's own practice. */
export function priorityHabit(d: Digit, areas: readonly { area: AreaId; weight: number }[]): string | null {
  const first = [...areas].sort((a, b) => b.weight - a.weight)[0];
  return first ? (AREA_NUMBER_TEXT[first.area][d]?.habit ?? null) : null;
}

/** The planet's mantra with its count and day, as the site gives it elsewhere. */
export function mantraLine(d: Digit): string {
  const day = dayOfNumber(d);
  return `“${NUMBERS[d].mantra}”, 108 times${day ? ` on a ${day}` : ''}: the mantra of ${the(NUMBERS[d].planet)}.`;
}

/** The weekdays of the planets of some numbers, each once, in the order the numbers are given. */
export function weekdaysOf(digits: readonly Digit[]): string[] {
  return [...new Set(digits.map(dayOfNumber).filter((x): x is string => !!x))];
}

export const CAREFUL_DATES_LABEL = 'Dates of a month that add down to these numbers';
export const CAREFUL_DAYS_LABEL = 'Weekdays of their planets';

// ---------------------------------------------------------------------------------------------
// Dates that suit, and a check for any number
// ---------------------------------------------------------------------------------------------

export const DATES_INTRO = 'The next days whose date adds down to your own number and to a friend of it. This is the rule for favourable dates, set out on the calendar from today.';
export const DATES_LABEL = { own: 'Best: your own number', friendly: 'Good: a friendly number', careful: 'Go carefully' } as const;
export const DATES_NONE = 'None in the next two months.';

export const CHECK_INTRO = 'Type a phone, vehicle or house number. Its digits are added down to one number and set beside your Driver and Conductor. Letters and signs are ignored.';
export const CHECK_MOBILE_NOTE = 'For a full reading of a phone number, with its pairs and its ending, use the Mobile Number Numerology tool.';
export const CHECK_TEXT: Readonly<Record<'yours' | 'friendly' | 'neutral' | CarefulTier, string>> = {
  yours: 'This is one of your own two numbers, so tradition counts it a natural fit.',
  friendly: 'A friend of your Driver or your Conductor: tradition reads it as an easy fit.',
  neutral: 'Neither a friend nor unfriendly to your numbers, so it neither helps nor hinders.',
  challenging: 'Unfriendly to both your Driver and your Conductor. Tradition suggests the most care, and a different number where the choice is yours.',
  mixed: 'Friendly to one of your numbers and unfriendly to the other, so the pull is divided.',
  careful: 'Unfriendly to one of your numbers and neutral to the other: a mild caution only.',
};
export const CHECK_LABEL: Readonly<Record<'yours' | 'friendly' | 'neutral' | CarefulTier, string>> = {
  yours: 'Your own number', friendly: 'Friendly', neutral: 'Neutral', challenging: 'Most care', mixed: 'Split pull', careful: 'Mild care',
};

export const STONE_LINE = 'The stone tradition links with your Driver’s planet is optional and never needed for the readings here; see the note on gemstones under Remedies.';

// ---------------------------------------------------------------------------------------------
// The summary a reader sees first
// ---------------------------------------------------------------------------------------------

/** What a complete line is, in a few plain words. */
export const LINE_SHORT: Readonly<Record<LineId, string>> = {
  mental: 'a quick, analytical mind', emotional: 'emotional balance', practical: 'getting things done', thought: 'planning ahead',
  will: 'strong willpower', action: 'readiness to act', golden: 'steady recognition', silver: 'building security patiently',
};

export const SUMMARY_HEADING = 'Your reading at a glance';
export const SUMMARY_LEDE = 'A traditional reading for reflection, not a prediction or advice. It is calculated on your device and nothing is sent anywhere.';

/** The first line: what is strong. */
export function summaryStrong(lines: readonly LineId[], mostHeld: Digit): string {
  if (!lines.length) return `No line of the square is complete. The number held most often is ${mostHeld} (${NUMBERS[mostHeld].planet}).`;
  const shown = lines.slice(0, 3).map((id) => `${LINE_NAME[id]} (${LINE_SHORT[id]})`);
  return `${list(shown)}${lines.length > 3 ? ` and ${lines.length - 3} more` : ''}.`;
}

/** The second line: what the grid does not hold, each with what it stands for. */
export function summaryBuild(missing: readonly Digit[]): string {
  if (!missing.length) return 'Every number from 1 to 9 is in your grid.';
  const shown = missing.slice(0, 4).map((d) => `${d} (${NUMBERS[d].keyword.toLowerCase()})`);
  return `${list(shown)}${missing.length > 4 ? ` and ${missing.length - 4} more` : ''}.`;
}

/** The third line: which area has the most of its five key numbers present and which the fewest, when one stands alone. */
export function summaryAreas(strongest: AreaId | null, weakest: AreaId | null): string {
  if (strongest && weakest) return `${AREA_TEXT[strongest].name} has the most of its five key numbers present and ${AREA_TEXT[weakest].name.toLowerCase()} the fewest.`;
  if (strongest) return `${AREA_TEXT[strongest].name} has the most of its five key numbers present.`;
  if (weakest) return `${AREA_TEXT[weakest].name} has the fewest of its five key numbers present.`;
  return 'Career, relationships and health have about the same number of key numbers present.';
}

/** The fourth line: the running year's planet beside the Driver and Conductor, the classical part of a year's reading. */
export function summaryYear(antar: Digit, regard: string): string {
  return `The year of ${the(NUMBERS[antar].planet)} (Antar Dasha ${antar}): ${regard}.`;
}

export const SUMMARY_LABEL = { strong: 'Complete lines', repeated: 'Held more than once', build: 'Missing', areas: 'Life areas', year: 'This year' } as const;
export const START_HEADING = 'Where to start';
export const START_NONE = 'None of the numbers that count most across career, relationships and health is missing from your grid.';

/** The numbers held more than once, for the summary. */
export function summaryRepeated(repeated: readonly { digit: Digit; count: number }[]): string {
  if (!repeated.length) return 'No number is held more than once.';
  return `${list(repeated.map((r) => `${r.digit} (${NUMBERS[r.digit].planet}, ${r.count === 2 ? 'twice' : `${r.count} times`})`))}.`;
}

/**
 * How the planets of the Driver and the Conductor regard a year's planet, said in that direction (the
 * table of friendships is one-way: Venus may count the Moon unfriendly while the Moon is neutral to Venus).
 * A year that is the person's own number says so instead.
 */
export function yearRegard(driver: Digit, conductor: Digit, year: Digit, driverRegard: Relation, conductorRegard: Relation): string {
  const word: Record<Relation, string> = { friend: 'a friend', neutral: 'neutral', enemy: 'unfriendly' };
  const yp = the(NUMBERS[year].planet);
  const dp = NUMBERS[driver].planet;
  const cp = NUMBERS[conductor].planet;
  if (driver === conductor) {
    return year === driver
      ? `${yp[0].toUpperCase()}${yp.slice(1)} is your own number, the planet of your Driver and Conductor`
      : `${dp}, the planet of your Driver and Conductor, regards ${yp} as ${word[driverRegard]}`;
  }
  const d = year === driver ? `${yp[0].toUpperCase()}${yp.slice(1)} is your Driver’s own planet` : null;
  const c = year === conductor ? `${yp[0].toUpperCase()}${yp.slice(1)} is your Conductor’s own planet` : null;
  if (!d && !c && driverRegard === conductorRegard) return `${dp} (Driver) and ${cp} (Conductor) both regard ${yp} as ${word[driverRegard]}`;
  return `${d ?? `${dp} (Driver) regards ${yp} as ${word[driverRegard]}`}; ${c ?? `${cp} (Conductor) regards it as ${word[conductorRegard]}`}`;
}

// ---------------------------------------------------------------------------------------------
// Words used on the page
// ---------------------------------------------------------------------------------------------

export const GLOSSARY_INTRO = 'Three traditions meet on this page: the Indian Lo Shu grid and numerology dasha, the planets of Vedic astrology, and the Eight Mansions feng shui behind the Kua number.';
export const GLOSSARY: readonly { term: string; text: string }[] = [
  { term: 'Mulank (Driver)', text: 'Your birth day added down to one digit: 15 gives 1 + 5 = 6. Read as your everyday nature.' },
  { term: 'Bhagyank (Conductor)', text: 'Every digit of your whole date of birth added down to one digit. Read as the direction your life takes. It is not the name-based Destiny number of Western numerology.' },
  { term: 'Kua', text: 'A direction number from the Chinese Eight Mansions school of feng shui, worked out from your birth year and gender. It is an extra beside your two core numbers, not part of core Indian numerology; writing it into the grid is one convention among several.' },
  { term: 'Line, plane and yog', text: 'A line is any of the eight rows, columns and diagonals of the square. A row or column is a plane; a diagonal is a yog, and 4-5-6 and 2-5-8 are the Golden and Silver Raj Yog, which are not the Raj Yoga of a birth chart.' },
  { term: 'Missing number', text: 'A number from 1 to 9 that is not in your grid. Tradition reads it as a quality to build through effort, and not as a fault.' },
  { term: 'Dasha', text: 'A period of life ruled by a number: Maha lasts years, Antar one year from birthday to birthday, Pratyantar a few weeks. This is numerology’s own scheme, not the Vimshottari dasha of a birth chart.' },
  { term: 'Lo Shu directions', text: 'The compass point each number holds on the square, often called Numero Vastu. It is not the planet-direction scheme of Vastu Shastra.' },
  { term: 'Friendly and careful numbers', text: 'The traditional table of planetary friendships decides which numbers suit your Driver and Conductor and which call for more care.' },
];

// ---------------------------------------------------------------------------------------------
// Leading lines of the report's sections
// ---------------------------------------------------------------------------------------------

export const PANEL_TEXT = {
  meaning: 'What your core numbers say, and how the two main ones sit beside each other.',
  lines: 'The square has eight lines: three rows, three columns and two diagonals. A line is complete when all three of its numbers are in your grid; the readings below are for complete lines and for lines one number short.',
  numbers: 'What each number of the square says in your grid, in the order the square lays them out. A number held more than once is read more strongly; a missing number is a quality to build, and its remedies are under Remedies.',
  areas: 'Each area has five numbers the tradition links with it. The chips show which of them are in your grid, and one step is given for each that is not. It is a reading for reflection, not a measure of how your life will go.',
  words: 'How each year’s planet sits beside your Driver and Conductor in the traditional table of friendships, and what the year’s number is read to bring to work, relationships and health.',
  more: 'Directions, the words used on this page, and how every number was worked out.',
  remedies: 'Start with the first one or two and keep them up for a month. Each is a habit first, then the customs of its planet.',
} as const;
export const FOLD_OWN_AREAS = 'How the five key numbers are counted (this page’s own method)';
export const FOLD_OWN_YEARS = 'Scores for each year and short period (this page’s own method)';
export const FOLD_MORE_CUSTOMS = 'More customs';

export const OWN_AREAS_NOTE = 'Each key number in your grid earns its weight, 2 for the main ones and 1 for the others, and each complete supporting line earns 1. The bands above use only how many key numbers are present; the points are shown so that you can check the arithmetic.';
export const AREA_STEP_NONE = 'All five key numbers are in your grid, so no step is needed here.';

export const DASHA_NOTE = 'This is numerology’s own dasha, counted from your date of birth and today’s date on this device. It is not the Vimshottari dasha of a birth chart, which starts from the Moon’s nakshatra.';

export const GRID_WHAT = 'The Lo Shu square is a 3×3 arrangement of the numbers 1 to 9 that Indian numerology uses as a chart: each digit of your date of birth goes into its own cell.';
export const WORDS_LINK = 'What do these words mean?';
export const START_LEDE = 'A missing number that would complete a line of the square comes first; then the ones that count most across the three areas.';
export const KUA_NOTE = 'A direction number from feng shui, an extra';
export const YEARS_LIMITS = 'This reading does not time a change of job or a marriage, and no method on this page can. It describes how each period sits beside your numbers, nothing more.';
export const NUMBERS_NOTE = 'The planet is the number’s ruler in Indian numerology; the reading is what the number means when it sits in the grid, a tradition of its own.';

/** The four directions of the other group: the ones Eight Mansions teachers advise going gently with. */
export const GENTLE_DIRECTIONS = {
  east: 'West, North-West, South-West and North-East',
  west: 'North, South, East and South-East',
} as const;
export const GENTLE_LABEL = 'Directions to go gently with';
