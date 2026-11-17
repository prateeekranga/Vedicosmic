/**
 * Readings for the Lo Shu grid: the eight lines, repeated numbers, missing numbers, the Kua
 * number and the Driver-Conductor relationship. Wording follows the tradition and is offered for
 * reflection; nothing here is a promise about health, money or relationships.
 */
import type { Digit, Direction, KuaMansion, LineId, LineStatus, MutualRelation } from '@/engine/numerology';

export interface LineText {
  name: string;
  /** What the line is about, in a few words. */
  theme: string;
  full: string;
  /** Two of the three numbers present. */
  partial: string;
  /** None of the three numbers present. */
  empty: string;
}

export const LINE_TEXT: Readonly<Record<LineId, LineText>> = {
  mental: {
    name: 'Mental plane', theme: 'thinking, memory and analysis',
    full: 'All three numbers of the top row are present. This is read as a quick, organised mind with a good memory and a liking for analysis.',
    partial: 'Two of the three are present, so the thinking line is mostly in place. The missing number shows which part of it takes more deliberate effort.',
    empty: 'The top row is empty. Tradition reads this as a mind that works better with notes, lists and repetition than by trusting memory alone.',
  },
  emotional: {
    name: 'Emotional plane', theme: 'feeling, intuition and inner balance',
    full: 'The whole middle row is present. This is read as emotional steadiness: feelings are noticed, understood and expressed without much struggle.',
    partial: 'Two of the three are present. Feeling and intuition are active, with the missing number pointing to the part that is slower to find words.',
    empty: 'The middle row is empty. Tradition reads this as feelings kept private; naming them aloud to someone trusted is the practice it suggests.',
  },
  practical: {
    name: 'Practical plane', theme: 'material work and getting things done',
    full: 'The whole bottom row is present. This is read as a practical nature: ideas are carried into finished, physical results.',
    partial: 'Two of the three are present. Practical skill is there; the missing number shows where follow-through needs a prompt.',
    empty: 'The bottom row is empty. Tradition reads this as someone stronger at ideas than execution, who gains from small, fixed routines.',
  },
  thought: {
    name: 'Thought plane', theme: 'planning and turning ideas into method',
    full: 'The whole left column is present. This is read as a planner: patient, methodical and comfortable thinking several steps ahead.',
    partial: 'Two of the three are present. Planning comes fairly easily; the missing number shows where plans tend to stall.',
    empty: 'The left column is empty. Tradition reads this as a preference for acting first and planning later, so writing a plan down helps.',
  },
  will: {
    name: 'Will plane', theme: 'determination and persistence',
    full: 'The whole centre column is present. This is read as strong willpower: once a course is chosen it is hard to turn this person from it.',
    partial: 'Two of the three are present. Resolve is good, with the missing number marking where it wavers under pressure.',
    empty: 'The centre column is empty. Tradition reads this as resolve that builds slowly, helped by small promises kept one after another.',
  },
  action: {
    name: 'Action plane', theme: 'acting on what has been decided',
    full: 'The whole right column is present. This is read as readiness to act: decisions are followed by movement without long delay.',
    partial: 'Two of the three are present. Action follows decision most of the time; the missing number shows where hesitation creeps in.',
    empty: 'The right column is empty. Tradition reads this as hesitation before starting, eased by beginning with the smallest possible step.',
  },
  golden: {
    name: 'Golden Raj Yog', theme: 'the 4-5-6 diagonal, traditionally linked with recognition',
    full: 'The 4-5-6 diagonal is complete. Teachers call this the Golden Raj Yog, or simply raj yog, and read it as steady effort that tends to be noticed.',
    partial: 'Two of the three numbers of the golden diagonal are present. The line is forming; tradition says the missing number is the quality to cultivate to complete it.',
    empty: 'The 4-5-6 diagonal is empty. Tradition reads this only as recognition arriving later and through persistence, not as a lack of ability.',
  },
  silver: {
    name: 'Silver Raj Yog', theme: 'the 2-5-8 diagonal, traditionally linked with property and settled assets',
    full: 'The 2-5-8 diagonal is complete. Teachers call this the Silver Raj Yog and associate it with a talent for building security patiently over time.',
    partial: 'Two of the three numbers of the silver diagonal are present. The line is forming; the missing number names the habit that would steady it.',
    empty: 'The 2-5-8 diagonal is empty. Tradition reads this as security built gradually, with care needed over large commitments.',
  },
};

/** Words for how much of a line is present; never rely on colour alone to show it. */
export const LINE_STATUS_LABEL: Readonly<Record<LineStatus, string>> = {
  full: 'Complete', partial: 'Two of three', single: 'One of three', empty: 'Empty',
};

/** The reading for a line in a given state. A single number is read like a partial line. */
export function lineReading(id: LineId, status: LineStatus): string {
  const t = LINE_TEXT[id];
  if (status === 'full') return t.full;
  if (status === 'empty') return t.empty;
  if (status === 'partial') return t.partial;
  return `Only one of the three numbers is present, so this line is lightly drawn. It is about ${t.theme}, and tradition treats it as an area to build with practice.`;
}

/** What a number means when it appears once, twice, three times, or four times and more. */
export const REPEAT_TEXT: Readonly<Record<Digit, readonly [string, string, string, string]>> = {
  1: [
    'One 1 is read as someone who feels clearly but does not always find it easy to put those feelings into words.',
    'Two 1s are read as balanced self-expression: able to speak plainly and also to see the other person’s side.',
    'Three 1s are read as a talkative, lively manner, or its opposite, a habit of going quiet around strangers.',
    'Four or more 1s are read as strong feelings that are easily misread by others; writing things down helps them land.',
  ],
  2: [
    'One 2 is read as natural sensitivity and good first impressions of people.',
    'Two 2s are read as sharp intuition: quick to sense a mood and to tell sincerity from show.',
    'Three 2s are read as feelings that run high, so criticism can sting more than it was meant to.',
    'Four or more 2s are read as great sensitivity that needs calm surroundings and time alone to settle.',
  ],
  3: [
    'One 3 is read as a good memory and a practical imagination.',
    'Two 3s are read as a strong imagination and a flair for writing or speaking.',
    'Three 3s are read as a mind that lives in its ideas and needs reminding to deal with what is in front of it.',
    'Four or more 3s are read as imagination running ahead of reality; grounding routines keep it useful.',
  ],
  4: [
    'One 4 is read as a tidy, practical streak and skill with the hands.',
    'Two 4s are read as real organising ability and patience with detail.',
    'Three 4s are read as a pull towards hard physical or technical work.',
    'Four or more 4s are read as a tendency to overwork; rest has to be planned like any other task.',
  ],
  5: [
    'One 5 is read as emotional balance and the ability to encourage others.',
    'Two 5s are read as drive and enthusiasm, with strong reactions when thwarted.',
    'Three 5s are read as restless energy that looks for risk and variety.',
    'Four or more 5s are read as impulsiveness; pausing before a decision is the tradition’s advice.',
  ],
  6: [
    'One 6 is read as love of home and a wish to look after people.',
    'Two 6s are read as protectiveness, with a habit of worrying about family.',
    'Three 6s are read as care that can become over-involvement in other people’s choices.',
    'Four or more 6s are read as strong creative feeling that needs an outlet so it does not turn into worry.',
  ],
  7: [
    'One 7 is read as learning through experience, including the experience of letting something go.',
    'Two 7s are read as a reflective nature drawn to philosophy or spiritual study.',
    'Three 7s are read as inner strength built through setbacks.',
    'Four or more 7s are read as a life in which reflection matters more than possessions.',
  ],
  8: [
    'One 8 is read as an eye for detail and a methodical way of working.',
    'Two 8s are read as shrewd judgement and care before trusting.',
    'Three 8s are read as restlessness that settles with age and a clear goal.',
    'Four or more 8s are read as a need for movement and change of scene.',
  ],
  9: [
    'One 9 is read as ambition joined to ideals. Everyone born from 1900 to 1999 has at least one from the year alone.',
    'Two 9s are read as high ideals and a critical eye, first of all for oneself.',
    'Three 9s are read as intense idealism that can overstate a case.',
    'Four or more 9s are read as being wrapped up in one’s own ideals; listening is the balancing habit.',
  ],
};

export function repeatReading(digit: Digit, count: number): string {
  const row = REPEAT_TEXT[digit];
  return row[Math.min(Math.max(count, 1), 4) - 1];
}

export interface MissingText {
  /** What the tradition says a missing number asks a person to develop. */
  meaning: string;
  /** A practice traditionally suggested for it. */
  practice: string;
}

export const MISSING_TEXT: Readonly<Record<Digit, MissingText>> = {
  1: {
    meaning: 'A missing 1 is read as hesitation to speak up for oneself.',
    practice: 'Traditionally suggested: a few quiet minutes in morning sunlight, and one small act of saying what you think each day.',
  },
  2: {
    meaning: 'A missing 2 is read as needing to build sensitivity to other people’s feelings.',
    practice: 'Traditionally suggested: a short feelings journal, and unhurried time with the people closest to you.',
  },
  3: {
    meaning: 'A missing 3 is read as underrating one’s own ideas and imagination.',
    practice: 'Traditionally suggested: read, write or teach something you enjoy each week, and keep a short gratitude note.',
  },
  4: {
    meaning: 'A missing 4 is read as a need for more order and routine.',
    practice: 'Traditionally suggested: one small daily routine kept without fail, and a regularly tidied workspace.',
  },
  5: {
    meaning: 'A missing 5 is read as goals that drift without a clear centre.',
    practice: 'Traditionally suggested: a few minutes of steady breathing each day, and writing down one aim for the week.',
  },
  6: {
    meaning: 'A missing 6 is read as affection and the comforts of home needing deliberate care.',
    practice: 'Traditionally suggested: time around music, art or a well-kept home, and letting yourself receive care as well as give it.',
  },
  7: {
    meaning: 'A missing 7 is read as little room for reflection in a busy life.',
    practice: 'Traditionally suggested: a few minutes of silence daily, time in nature, or a simple gazing practice such as Trataka.',
  },
  8: {
    meaning: 'A missing 8 is read as carelessness with detail and with what one owns.',
    practice: 'Traditionally suggested: take on one long commitment and see it through, and keep a simple written record of spending.',
  },
  9: {
    meaning: 'A missing 9 is read as energy that needs a purpose beyond oneself.',
    practice: 'Traditionally suggested: regular physical movement, and one cause or person you give time to without expecting return.',
  },
};

export const DIRECTION_NAME: Readonly<Record<Direction, string>> = {
  N: 'North', NE: 'North-East', E: 'East', SE: 'South-East', S: 'South', SW: 'South-West', W: 'West', NW: 'North-West',
};

/** The four favourable directions of Eight Mansions, with what each is traditionally used for. */
export const KUA_DIRECTION_TEXT = {
  shengQi: { name: 'Sheng Qi', english: 'success', use: 'growth and new undertakings; traditionally the direction to face when working' },
  tianYi: { name: 'Tian Yi', english: 'health', use: 'rest and recovery; traditionally the direction for the head of the bed' },
  yanNian: { name: 'Yan Nian', english: 'relationships', use: 'relationships and agreement; traditionally the direction for conversation' },
  fuWei: { name: 'Fu Wei', english: 'stability', use: 'steadiness and study; traditionally the direction for reading or meditation' },
} as const;

export const KUA_TEXT: Readonly<Record<KuaMansion, string>> = {
  1: 'Kua 1 belongs to the trigram Kan and the element Water. It is read as adaptable and reflective, at ease with change.',
  2: 'Kua 2 belongs to the trigram Kun and the element Earth. It is read as patient, supportive and steady.',
  3: 'Kua 3 belongs to the trigram Zhen and the element Wood. It is read as energetic and quick to begin things.',
  4: 'Kua 4 belongs to the trigram Xun and the element Wood. It is read as gentle, persuasive and persistent.',
  6: 'Kua 6 belongs to the trigram Qian and the element Metal. It is read as principled, with a natural sense of authority.',
  7: 'Kua 7 belongs to the trigram Dui and the element Metal. It is read as sociable, expressive and fond of good company.',
  8: 'Kua 8 belongs to the trigram Gen and the element Earth. It is read as calm, self-contained and thorough.',
  9: 'Kua 9 belongs to the trigram Li and the element Fire. It is read as warm, visible and quick to understand.',
};

export const KUA_GROUP_TEXT = {
  east: 'East group: North, South, East and South-East are the favourable directions.',
  west: 'West group: West, North-West, South-West and North-East are the favourable directions.',
} as const;

/** How the Driver's planet and the Conductor's planet regard each other. */
export const RELATION_TEXT: Readonly<Record<MutualRelation, { label: string; text: string }>> = {
  'mutual-friends': {
    label: 'Friendly on both sides',
    text: 'The two planets count each other as friends. Tradition reads this as inner nature and life direction pulling the same way.',
  },
  friendly: {
    label: 'Friendly',
    text: 'One planet counts the other a friend and the regard is returned as neutral. Tradition reads this as an easy, workable pairing.',
  },
  neutral: {
    label: 'Neutral',
    text: 'The two planets are neutral to each other. Tradition reads this as neither helping nor hindering: the result follows effort.',
  },
  mixed: {
    label: 'Mixed',
    text: 'One planet is friendly and the other is not. Tradition reads this as a pull in two directions that eases once it is noticed.',
  },
  strained: {
    label: 'Strained',
    text: 'One planet is neutral and the other unfriendly. Tradition reads this as some friction between what comes naturally and what life asks.',
  },
  opposed: {
    label: 'Opposed',
    text: 'The two planets count each other as unfriendly. Tradition reads this as nature and direction at odds, which calls for patience rather than force.',
  },
};

/** The same number in both places. */
export const SAME_NUMBER_TEXT = 'Driver and Conductor are the same number, so the planet’s qualities are doubled. Tradition reads this as a very consistent character, with that number’s growth edge needing extra attention.';
