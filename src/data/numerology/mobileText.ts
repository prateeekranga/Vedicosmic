/**
 * Readings for how a mobile number sits with a person's own birth numbers. The number's root is
 * compared with the Driver and the Conductor through the planetary friendship table, and the two
 * comparisons give one compatibility level from 1 to 5.
 *
 * The readings for neighbouring pairs of digits are in mobilePairText.ts. The texts further down
 * belong to the Number score, the ending, the grid with the number, choosing a number and the
 * customs tradition suggests.
 */
import type {
  CompatibilityLevel, Digit, GridDigitStatus, MobileCaution, MobilePurpose, MutualRelation, ScorePartKey,
} from '@/engine/numerology';
import { YOGA_LABEL } from './mobilePairText';

/** How the number's root sits with a person's Driver or Conductor. */
export const ROOT_FIT_TEXT: Readonly<Record<MutualRelation, string>> = {
  'mutual-friends': 'The planets are friends on both sides. Tradition counts this number a comfortable fit.',
  friendly: 'One planet is friendly and the other neutral. Tradition counts this number an easy fit.',
  neutral: 'The planets are neutral to each other. Tradition counts this number neither a help nor a hindrance.',
  mixed: 'One planet is friendly and the other is not. Tradition counts this number a mixed fit.',
  strained: 'One planet is neutral and the other unfriendly. Tradition counts this number a slightly awkward fit.',
  opposed: 'The planets are unfriendly to each other. Tradition counts this number a poor fit, though nothing more follows from that than a preference.',
};

export const SAME_ROOT_TEXT = 'The number’s root is the same as this number of yours, which tradition counts a natural fit.';

/** Labels shown with a fit, in words so they never depend on colour. */
export const TONE_LABEL = { supportive: 'Supportive', mixed: 'Mixed', challenging: 'Challenging' } as const;

/** The name of each compatibility level, always shown beside "n of 5". */
export const LEVEL_LABEL: Readonly<Record<CompatibilityLevel, string>> = {
  5: 'Excellent', 4: 'Good', 3: 'Moderate', 2: 'Low', 1: 'Very low',
};

export const LEVEL_TEXT: Readonly<Record<CompatibilityLevel, string>> = {
  5: 'The number’s planet is on friendly terms with both of your birth numbers. By the tradition’s own measure this is as close a match as a number gets.',
  4: 'On balance the number’s planet is friendly to your birth numbers. Tradition counts this a number that suits you.',
  3: 'The friendly and unfriendly sides cancel out, or both are neutral. Tradition counts this number neither for you nor against you.',
  2: 'On balance the number’s planet is cool towards your birth numbers. If you are choosing a new number, tradition would look for a closer match.',
  1: 'The number’s planet is unfriendly to both of your birth numbers. This is the weakest match the tradition describes; it is a preference, and nothing more follows from it.',
};

/** Shown where the level would be, when no date of birth was given. */
export const LEVEL_NEEDS_BIRTH = 'Add your date of birth above and read the number again to see its compatibility level with you, from 1 to 5.';

/** What the phone is mainly for, as offered beside the inputs. */
export const PURPOSE_LABEL: Readonly<Record<MobilePurpose, string>> = {
  both: 'Every use / not sure', personal: 'Personal', business: 'Business',
};
export const PURPOSE_HELP = 'Teachers give the Mulank more weight for a personal phone and the Bhagyank more for a business phone. With “Every use” the two count equally.';

/** The four parts of the Number score. */
export const SCORE_PART_LABEL: Readonly<Record<ScorePartKey, string>> = {
  birth: 'Fit with your birth numbers', pairs: 'Two-digit combinations', ending: 'Last four digits', balance: 'Digit balance',
};

export const SCORE_BAND_TEXT: Readonly<Record<CompatibilityLevel, string>> = {
  5: 'By every check this page makes, the number sits well with you: its planet suits your birth numbers, most pairs are favourable and the ending agrees.',
  4: 'A number that suits you on balance. The four parts below show where it gains and where it gives a little away.',
  3: 'A middling number: its strong and weak points roughly even out. The four parts below show which are which.',
  2: 'More of the checks go against this number than for it. If you are choosing a new number, tradition would look for a closer match.',
  1: 'Most of the checks go against this number. That is the tradition’s preference and nothing more; the section on choosing a number shows what would suit you better.',
};

export const SCORE_NOTE = 'The score adds four parts, and each shows its own arithmetic. A good total does not cancel a poor pair, so the points to watch are listed whatever the score.';
export const SCORE_NEEDS_BIRTH = 'Add your date of birth above to get the Number score out of 100, which weighs this number against your Mulank and Bhagyank.';

/** One point to watch, in one sentence. */
export function cautionText(c: MobileCaution): string {
  switch (c.kind) {
    case 'yoga': return `${YOGA_LABEL[c.yoga]} (${c.written.join(', ')}): a pair the chart marks for care.`;
    case 'ending-pair': return `${c.pair} sits in the last four digits, where teachers give a malefic pair the most weight.`;
    case 'overloaded': return `${c.digit} appears ${c.count} times; teachers prefer no digit more than three times.`;
    case 'run': return `${String(c.digit).repeat(c.length)} in a row is read as one planet’s theme pushed too far.`;
    case 'zeros': return `${c.count} zeros: teachers advise one or two at most, since zero is read as amplifying whatever stands beside it.`;
    case 'ends-in-zero': return 'The number ends in 0, which many teachers avoid: a zero at the end is said to weaken the digits before it.';
  }
}

export const ENDING_INTRO = 'Many teachers give the last four digits the most weight, since they are the part people remember and say last. Their root is compared with your birth numbers on the same scale as the whole number.';
export const ENDING_ZERO = 'The last four digits are all zeros, so they have no root to compare.';

/** What adding the phone number does to each number of the person's Lo Shu grid. */
export const GRID_STATUS_LABEL: Readonly<Record<GridDigitStatus, string>> = {
  introduced: 'Added by the number', strengthened: 'Strengthened', unchanged: 'Not in the number', missing: 'Still missing',
};
export const GRID_INTRO = 'Teachers read a phone number as adding its digits to your Lo Shu grid for as long as you use it. Zeros have no cell, so they are left out.';

export const ROOTS_INTRO = 'Every root a phone number can add down to, compared with your Mulank and Bhagyank on the same scale. A number whose digits add down to one of your best roots starts with the strongest fit.';
/** The three groups of roots, by level: 4 and 5, 3, then 1 and 2. */
export const ROOTS_GROUP = { suits: 'Suits you', neutral: 'Neither for nor against', weak: 'Weak match' } as const;

export const CHECKLIST_INTRO = 'What to look for in a new number, worked out from your own numbers. Few numbers meet every point; the score helps you weigh one against another.';
export const COMPARE_INTRO = 'Type up to four more numbers to see them beside this one, scored the same way against your date of birth. The numbers stay in this browser.';

export const NAME_HELP = 'Optional. The Chaldean number of your name is compared with the phone number’s root on a card of its own; it does not change the score.';

export const REMEDY_INTRO = {
  weak: 'If you keep this number, tradition suggests a few small customs to bring it closer to you. They are customs, not promises: a number you are happy with is a good number to keep.',
  good: 'This number already suits you by the tradition’s measure, so nothing needs correcting. These are the lucky details that go with your Mulank.',
} as const;

/** Rahu and Ketu have no weekday of their own; these are the days the site's navagraha post pairs them with. */
export const NODE_DAY: Readonly<Partial<Record<Digit, string>>> = { 4: 'Saturday', 7: 'Tuesday' };
