/**
 * Wording for the parts of the Lo Shu report that come from the founder's lineage teaching: marriage
 * years by the Vivah Mulank, money through 5 and 6, the care asked for by several 7s, and the name and
 * mobile number set beside the date of birth. The tests lint every sentence here with the same rules
 * as the rest of the numerology text: no promises, no named illnesses, no fear words.
 */
import { VIVAH_MATCH, type Digit, type MoneyState } from '@/engine/numerology';
import { NUMBERS } from './numbers';

const list = (xs: readonly (string | number)[], last = 'and') => {
  const s = xs.map(String);
  return s.length > 1 ? `${s.slice(0, -1).join(', ')} ${last} ${s[s.length - 1]}` : (s[0] ?? '');
};
const TIMES = ['', 'once', 'twice', 'three times', 'four times', 'five times', 'six times', 'seven times', 'eight times', 'nine times'];
const times = (n: number) => TIMES[n] ?? `${n} times`;

/** Where these readings come from, said once and pointed to from each part. */
export const LINEAGE = 'a lineage teaching passed to VediCosmic’s founder by a spiritual guru';

// ---------------------------------------------------------------------------------------------
// Marriage years
// ---------------------------------------------------------------------------------------------

export const MARRIAGE_LEDE = 'Years that favour marriage, by the Vivah Mulank. Your Mulank plus your birth month gives your Mulank Maha; a year plus the Mulank Maha, added down to one digit, gives that year’s Vivah Mulank. A year whose Vivah Mulank is in your Mulank’s list favours marriage.';
export const MARRIAGE_SOURCE = `This method is ${LINEAGE}, used here exactly as taught; it is not from a classical text. A favourable year is read as an opening, not a promise: a marriage rests on two people, their families and their choices.`;
export const MARRIAGE_LABEL = { yes: 'Favours marriage', no: 'Not by this method' } as const;
export const MARRIAGE_CHECK_LABEL = 'Check any year';
export const MARRIAGE_CHECK_HELP = 'Any year from your birth to a hundred years on, including a year already past.';
export const MARRIAGE_LIST_NOTE = 'The list starts this year, or at the year you turn 18 if that is later. The age is the one reached on your birthday that year.';

/** "For Mulank 1, years whose Vivah Mulank is 1, 4, 5, 7 or 9 favour marriage." */
export const marriageRule = (mulank: Digit): string =>
  `For Mulank ${mulank}, years whose Vivah Mulank is ${list(VIVAH_MATCH[mulank], 'or')} favour marriage.`;

/** The summary line: the next few years that favour marriage. */
export function marriageSummary(years: readonly number[]): string {
  if (!years.length) return 'No year in the next twelve favours marriage by the Vivah Mulank.';
  return `By the Vivah Mulank, the next years that favour marriage are ${list(years)}.`;
}

// ---------------------------------------------------------------------------------------------
// Money, through 5 and 6
// ---------------------------------------------------------------------------------------------

export const MONEY_TEXT = { name: 'Money', blurb: 'Earning, saving and comfort' } as const;
export const MONEY_INTRO = 'Money is read through two numbers: 5, Mercury’s number of trade and the flow of money, and 6, Venus’s number of comfort, saving and what money buys.';
export const MONEY_SOURCE = `Reading money through 5 and 6 is ${LINEAGE}.`;
export const MONEY_NOTE = 'A traditional reading of money habits, for reflection. It is not financial advice.';

export const MONEY_STATE_TEXT: Readonly<Record<MoneyState, string>> = {
  both: 'Both 5 and 6 are in your grid. This is read as a sound base for money: a feel for earning and dealing (5) beside a liking for comfort and the sense to keep some of what comes in (6).',
  five: 'Your grid has 5 but no 6. This is read as money that moves well, through trade, contacts and quick decisions, with keeping it and building comfort as the part to work on.',
  six: 'Your grid has 6 but no 5. This is read as a liking for comfort and a careful hand with what you have, with finding new income and dealing confidently as the part to work on.',
  none: 'Neither 5 nor 6 is in your grid. This is read as money that comes through planning and steady effort rather than by instinct, so earning and saving are both habits to build.',
};

export const MONEY_NUMBER_TEXT: Readonly<Record<5 | 6, { role: string; gives: string; gap: string; habit: string; heavy: string }>> = {
  5: {
    role: 'Earning and trade',
    gives: 'Mercury’s number is present. It is read as a head for figures, deals and contacts, and an eye for where money can be made.',
    gap: 'Without a 5, tradition reads spotting openings and asking a fair price as skills to practise.',
    habit: 'Keep a weekly money review: what came in, from where, and one new contact or idea to follow up.',
    heavy: 'Held three times or more, 5 is read as money that comes and goes quickly. Set a limit for impulse buys and wait a day before a large one.',
  },
  6: {
    role: 'Saving and comfort',
    gives: 'Venus’s number is present. It is read as a feel for quality and comfort, and a wish to build a secure home.',
    gap: 'Without a 6, tradition reads holding on to money, and enjoying it in measure, as the harder part.',
    habit: 'Move a fixed share of every income into savings on the day it arrives, before any spending.',
    heavy: 'Held three times or more, 6 is read as a strong pull towards luxury and spending on comfort. Give comforts a monthly budget of their own.',
  },
};

export const MONEY_GOLDEN = 'Your Golden Raj Yog (4-5-6) is complete, so both money numbers sit in one full line, which tradition reads as prosperity built through planning.';
export const MONEY_COUNT = (present: number) => `${present} of 2 money numbers present`;

// ---------------------------------------------------------------------------------------------
// Several 7s
// ---------------------------------------------------------------------------------------------

export const SEVENS_TITLE = 'Several 7s: care for the stomach and against injuries';
export function sevensText(count: number): string {
  return `Your grid holds the number 7 ${times(count)}. In ${LINEAGE}, several 7s call for care with the stomach and digestion, care against injuries, and attention to health in general.`;
}
export const SEVENS_SHORT = 'Several 7s ask for care with the stomach and against injuries.';
export const SEVENS_REMEDY_INTRO = 'The remedies taught for several 7s:';
export const SEVENS_REMEDIES: readonly string[] = [
  'Chant the Gayatri mantra each morning, 108 times if you can, counting on a mala.',
  'Keep a Gayatri yantra in your place of prayer, kept clean and lit with a lamp.',
  'Feed a cow: green fodder, or a roti with a little jaggery.',
  'Feed black street dogs: a roti or plain food, as often as you can and with kindness.',
];
export const SEVENS_HABITS: readonly string[] = [
  'Eat at regular times, and go easy on heavy, very spicy or late meals.',
  'Take extra care on the road, on stairs and at sport, and slow down when tired.',
];
export const GAYATRI = 'Om Bhur Bhuvah Swah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat.';
export const SEVENS_DOCTOR = 'Not medical advice: see a qualified doctor about any pain or symptom that lasts.';

// ---------------------------------------------------------------------------------------------
// Name and mobile number
// ---------------------------------------------------------------------------------------------

export const PERSON_LEDE = 'Your name and mobile number set beside your date of birth. Both are optional and are worked out on this device; neither is put in a shared link.';
export const PERSON_EMPTY = 'Add your name, your mobile number or both under Edit details to see how they sit with your Mulank and Bhagyank.';
export const NAME_INTRO = 'Counted in the Chaldean system that Indian name numerology uses. Write the name as you use it day to day, in English letters.';
export const NAME_NON_LATIN = 'Letters from other scripts cannot be counted; write the name in English letters for a full count.';

export function nameInPair(total: number, mulank: Digit, bhagyank: Digit): string {
  return `${total} is one of the name totals the pair tables give for Mulank ${mulank} with Bhagyank ${bhagyank}.`;
}
export function nameNotInPair(total: number, names: readonly number[]): string {
  return `${total} is not among the name totals the pair tables give for your pair. Teachers who correct a name aim for one of these: ${list(names)}.`;
}
export const nameBest = (n: number) => `The tables pick out ${n} as the best name total for this pair.`;
export const nameSupplies = (d: Digit) => `The name adds down to ${d}, a number your grid lacks, so the name carries ${NUMBERS[d].planet}’s number for you.`;

export const MOBILE_INTRO = 'The digits are added down to one number and set beside your Mulank and Bhagyank. The level and the score are the same as on the Mobile Number Numerology tool, which reads the whole number pair by pair.';
export const mobileSupplies = (ds: readonly Digit[]) => (ds.length
  ? `It carries ${list(ds)}, ${ds.length === 1 ? 'a number' : 'numbers'} your grid lacks.`
  : 'It carries none of the numbers your grid lacks.');
export const mobileInPair = (root: Digit, lucky: boolean) => (lucky
  ? `Its root ${root} is one of your pair’s lucky numbers.`
  : `Its root ${root} is not one of your pair’s lucky numbers.`);
export const MOBILE_INVALID = 'That does not look like a full mobile number, so it was left out. Check it under Edit details.';

// ---------------------------------------------------------------------------------------------
// Where these come from
// ---------------------------------------------------------------------------------------------

export const SOURCE_LINEAGE: readonly string[] = [
  'Marriage years by the Vivah Mulank, with its table of which Vivah Mulanks suit each Mulank.',
  'Money read through 5 and 6, and the care asked for by several 7s, with the Gayatri mantra and yantra, feeding a cow and feeding black street dogs as its remedies.',
  'The pair tables of lucky numbers, dates, colours, stones, lines of work and name totals for each Mulank and Bhagyank pair.',
];
export const SOURCE_LINEAGE_INTRO = `From ${LINEAGE}, used as taught:`;
