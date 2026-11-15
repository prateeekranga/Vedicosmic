/**
 * Readings for how a mobile number sits with a person's own birth numbers. The number's root is
 * compared with the Driver and the Conductor through the planetary friendship table, and the two
 * comparisons give one compatibility level from 1 to 5.
 *
 * The readings for neighbouring pairs of digits are in mobilePairText.ts.
 */
import type { CompatibilityLevel, MutualRelation } from '@/engine/numerology';

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
