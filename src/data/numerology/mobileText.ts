/**
 * Readings for a mobile number. No number is called lucky or unlucky in itself: a pair of digits
 * is read through how its two planets regard each other, and the number as a whole through how
 * its root sits with the person's own Driver and Conductor.
 */
import type { Digit, MutualRelation } from '@/engine/numerology';

/** A planetary pair, by how the two planets regard each other. */
export const PAIR_TEXT: Readonly<Record<MutualRelation, string>> = {
  'mutual-friends': 'The two planets are friends, so tradition reads this pair as working smoothly together.',
  friendly: 'One planet is friendly and the other neutral, so tradition reads this pair as easy.',
  neutral: 'The two planets are neutral to each other; tradition gives this pair no strong reading either way.',
  mixed: 'One planet is friendly and the other is not, so tradition reads this pair as pulling two ways.',
  strained: 'One planet is neutral and the other unfriendly, so tradition reads this pair as slightly at odds.',
  opposed: 'The two planets are unfriendly to each other, so tradition reads this pair as needing patience.',
};

/** The same digit twice in a row. */
export const DOUBLE_TEXT: Readonly<Record<Digit, string>> = {
  1: 'A doubled 1 repeats the Sun’s theme of initiative and self-reliance.',
  2: 'A doubled 2 repeats the Moon’s theme of sensitivity and attention to others.',
  3: 'A doubled 3 repeats Jupiter’s theme of learning and expression.',
  4: 'A doubled 4 repeats Rahu’s theme of method and persistence.',
  5: 'A doubled 5 repeats Mercury’s theme of communication and quick thinking.',
  6: 'A doubled 6 repeats Venus’s theme of care, comfort and harmony.',
  7: 'A doubled 7 repeats Ketu’s theme of reflection and inquiry.',
  8: 'A doubled 8 repeats Saturn’s theme of patience and responsibility.',
  9: 'A doubled 9 repeats Mars’s theme of energy and drive.',
};

export const ZERO_TEXT = 'Zero has no planet and no cell in the Lo Shu grid. Tradition reads it as a pause that mutes the digit beside it, so this pair is given no reading of its own.';

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

/** Labels shown with a pair or a fit, in words so they never depend on colour. */
export const TONE_LABEL = { supportive: 'Supportive', mixed: 'Mixed', challenging: 'Challenging' } as const;
