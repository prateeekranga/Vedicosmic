/**
 * Readings for the further Western numbers read from a name: Hidden Passion, Subconscious Self,
 * Balance, Rational Thought, the Planes of Expression, and the Cornerstone, Capstone and First
 * Vowel. Offered for reflection in the tradition's own terms; none of it is a forecast.
 */
import type { Digit, ExpressionPlane } from '@/engine/numerology';

/** What each of these numbers is said to describe. */
export const EXTRA_ROLE = {
  hiddenPassion: 'The number most of your letters carry. A talent you return to and want to use.',
  subconsciousSelf: 'How many of the nine numbers your name carries. How you respond when something unexpected happens.',
  balance: 'From your initials. The approach tradition suggests when a situation becomes difficult.',
  rationalThought: 'From your first name and the day you were born. The way you think a problem through.',
  cornerstone: 'The first letter of your first name. How you approach an opportunity or a problem.',
  capstone: 'The last letter of your first name. How you see a thing through to its end.',
  firstVowel: 'The first vowel of your first name. A private side that those close to you see.',
} as const;

export const HIDDEN_PASSION_TEXT: Readonly<Record<Digit, string>> = {
  1: 'More of your letters carry 1 than any other number. It is read as a strong wish to lead, to be first and to do things your own way.',
  2: 'More of your letters carry 2 than any other number. It is read as a gift for cooperation and a real need for harmony and company.',
  3: 'More of your letters carry 3 than any other number. It is read as a love of words, humour and self-expression, and of having an audience.',
  4: 'More of your letters carry 4 than any other number. It is read as a liking for order, detail and work that leaves something solid behind.',
  5: 'More of your letters carry 5 than any other number. It is read as a love of change, travel and variety, and a dislike of being tied down.',
  6: 'More of your letters carry 6 than any other number. It is read as a pull towards responsibility, family and putting things right for others.',
  7: 'More of your letters carry 7 than any other number. It is read as a need to understand: study, analysis and time alone to think.',
  8: 'More of your letters carry 8 than any other number. It is read as ambition, a head for organisation and a wish for results that can be measured.',
  9: 'More of your letters carry 9 than any other number. It is read as wide sympathies, generosity and a wish to do good beyond your own circle.',
};

/** By how many of the nine numbers the name carries; names with three or fewer share the first reading. */
export const SUBCONSCIOUS_TEXT: Readonly<Record<3 | 4 | 5 | 6 | 7 | 8 | 9, string>> = {
  3: 'With three or fewer of the nine numbers in the name, tradition reads someone who can be thrown by a sudden demand and gains from preparing ahead.',
  4: 'With four of the nine numbers, tradition reads a tendency to get lost in detail under pressure. A simple plan decided beforehand helps.',
  5: 'With five of the nine numbers, tradition reads energy that scatters in a crisis. Choosing one thing to do first is its advice.',
  6: 'With six of the nine numbers, tradition reads someone who looks to other people’s needs in an emergency before turning to the task itself.',
  7: 'With seven of the nine numbers, tradition reads someone who meets trouble calmly and analytically, and may seem detached while doing so.',
  8: 'With eight of the nine numbers, tradition reads someone dependable and efficient under pressure, well able to take charge.',
  9: 'With all nine numbers in the name, tradition reads a wide range of resources to draw on, and a risk of seeming unmoved by other people’s alarm.',
};

export function subconsciousReading(count: number): string {
  return SUBCONSCIOUS_TEXT[Math.min(Math.max(count, 3), 9) as keyof typeof SUBCONSCIOUS_TEXT];
}

export const BALANCE_TEXT: Readonly<Record<Digit, string>> = {
  1: 'Balance 1: in a difficult moment, draw on your own strength, and let other people share the load instead of carrying it alone.',
  2: 'Balance 2: tact is your best tool in a dispute. The advice is to stay with the facts and not be drawn into taking sides.',
  3: 'Balance 3: a lighter touch helps. The advice is to talk the problem through with someone and not to brood over it.',
  4: 'Balance 4: calm, practical steps suit you. The advice is to keep your discipline without becoming rigid about the method.',
  5: 'Balance 5: the advice is to face the problem directly and not to look for a way out in distraction or a change of scene.',
  6: 'Balance 6: your strength is taking responsibility. The advice is not to take on what properly belongs to someone else.',
  7: 'Balance 7: your instinct is to withdraw and think. The advice is to come back and deal with the matter plainly.',
  8: 'Balance 8: you meet trouble with authority. The advice is to use your influence fairly and not to force an outcome.',
  9: 'Balance 9: stepping back to see the wider picture helps. The advice is to understand the other side before you answer it.',
};

export const RATIONAL_THOUGHT_TEXT: Readonly<Record<number, string>> = {
  1: 'Rational Thought 1 is read as original and direct thinking: you reason for yourself and reach a conclusion quickly.',
  2: 'Rational Thought 2 is read as considerate thinking: you weigh how a decision will land on the people it touches.',
  3: 'Rational Thought 3 is read as imaginative thinking: ideas arrive as pictures and stories before they become plans.',
  4: 'Rational Thought 4 is read as orderly thinking: you trust what can be tested one step at a time.',
  5: 'Rational Thought 5 is read as quick and versatile thinking: you learn by trying things and change course easily.',
  6: 'Rational Thought 6 is read as responsible thinking: you judge an idea by what it does for the people you care about.',
  7: 'Rational Thought 7 is read as analytical thinking: you want evidence, and time to think, before you accept anything.',
  8: 'Rational Thought 8 is read as strategic thinking: you reason in terms of results, resources and the long plan.',
  9: 'Rational Thought 9 is read as broad thinking: you look for the general principle and the larger good.',
  11: 'Rational Thought 11 is read as thinking in leaps: answers often arrive whole, and are worth checking afterwards.',
  22: 'Rational Thought 22 is read as large and practical thinking together: you ask how a big idea could actually be built.',
};

export const PLANE_TEXT: Readonly<Record<ExpressionPlane, { name: string; letters: string; text: string }>> = {
  physical: { name: 'Physical', letters: 'D, E, M, W', text: 'Read as working through doing: practical, hands-on and concerned with what gets results.' },
  mental: { name: 'Mental', letters: 'A, G, H, J, L, N, P', text: 'Read as working through reasoning: facts, analysis and argument.' },
  emotional: { name: 'Emotional', letters: 'B, I, O, R, S, T, X, Z', text: 'Read as working through feeling: imagination, sympathy and response to people.' },
  intuitive: { name: 'Intuitive', letters: 'C, F, K, Q, U, V, Y', text: 'Read as working through insight: an inner sense of things that comes before the reasons.' },
};

/** The character the tradition gives each letter, used for the Cornerstone, Capstone and First Vowel. */
export const LETTER_TEXT: Readonly<Record<string, string>> = {
  A: 'ambitious and independent, and likes to set its own direction',
  B: 'sensitive and loyal, and needs peace to do its best work',
  C: 'expressive and light-hearted, and speaks its mind easily',
  D: 'grounded and determined, and gets things done by system',
  E: 'freedom-loving and sociable, and restless when routine closes in',
  F: 'responsible and warm, and takes on the cares of others',
  G: 'thoughtful and driven, and relies on its own understanding',
  H: 'practical and self-reliant, with a good head for plans',
  I: 'compassionate and artistic, and feels things strongly',
  J: 'fair-minded and friendly, and wants everyone treated justly',
  K: 'intuitive and forceful, and strives hard for what it wants',
  L: 'reasoning and honest, and takes its time over a decision',
  M: 'hard-working and steady, with settled habits',
  N: 'original and curious, and questions what it is told',
  O: 'principled and private, and holds firmly to its beliefs',
  P: 'intellectual and reserved, and makes a strong first impression',
  Q: 'unusual and persuasive, and drawn to the less travelled way',
  R: 'energetic and kind, and works tirelessly for what it values',
  S: 'charming and emotional, and reacts warmly and quickly',
  T: 'restless and protective, and happiest in partnership',
  U: 'intuitive and giving, with good timing and slow decisions',
  V: 'insightful and efficient, and builds what it imagines',
  W: 'purposeful and changeable, and needs variety and company',
  X: 'creative and quick to learn, and quick to tire of a thing',
  Y: 'freedom-seeking and perceptive, and dislikes any restriction',
  Z: 'hopeful and sensible, and quick to see the practical way through',
};

export const letterReading = (letter: string): string => `${letter} is read as ${LETTER_TEXT[letter]}.`;

/** 33 has no reading of its own here; it is read through its digit, 6. */
export const rationalThoughtReading = (value: number): string => RATIONAL_THOUGHT_TEXT[value] ?? RATIONAL_THOUGHT_TEXT[6];
