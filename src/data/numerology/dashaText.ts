/**
 * Readings for the dasha periods of Indian numerology and for the directions of the Lo Shu
 * square. A period is read through the planet of its number. The wording says what the tradition
 * associates with such a time; it does not say what will happen.
 */
import type { Digit } from '@/engine/numerology';

/** The theme of a period ruled by each number, whether it is a Maha, Antar or Pratyantar Dasha. */
export const DASHA_TEXT: Readonly<Record<Digit, string>> = {
  1: 'A period of the Sun is read as a time for beginnings and for standing on your own judgement: taking the lead, being seen, and starting what has waited.',
  2: 'A period of the Moon is read as a time for people and feeling: partnership, patience and listening count for more than pushing ahead alone.',
  3: 'A period of Jupiter is read as a time for learning and teaching: study, good advice and putting ideas into words come to the front.',
  4: 'A period of Rahu is read as a time of hard, methodical work and unconventional turns. Tradition advises a steady routine and care with shortcuts.',
  5: 'A period of Mercury is read as a time of movement and exchange: communication, trade, travel and quick changes of plan.',
  6: 'A period of Venus is read as a time for home, comfort and relationships: care for family, beauty and the pleasures of ordinary life.',
  7: 'A period of Ketu is read as a time for reflection: study, inner work and letting go of what has had its time, with less interest in display.',
  8: 'A period of Saturn is read as a time of duty and slow results. Responsibility grows, and tradition says patient effort made now is repaid later.',
  9: 'A period of Mars is read as a time of energy and completion: finishing what was begun, acting with courage, and keeping temper in hand.',
};

/** What each of the three periods is, in a line. */
export const DASHA_ROLE = {
  maha: 'The long period. It sets the background theme for several years.',
  antar: 'The year’s period, from one birthday to the next. Teachers read it as the main theme of the year.',
  pratyantar: 'The short period within the year, a few weeks long. It is read as the mood of the moment.',
} as const;

export const DASHA_INTRO = 'Indian numerology divides a life into periods ruled by the nine numbers. The numbers of the running periods are added to your grid for as long as they last, so a line that is one number short can be complete for a time.';

export const DASHA_GRID_NONE = 'Adding these numbers completes no new line in your grid.';

/** Under the list of directions. */
export const NUMERO_VASTU_NOTE = 'Numero Vastu gives each number of the square a direction, with South at the top as the Lo Shu is traditionally drawn. Teachers read a missing number as the direction of a home or room to keep clear, clean and well lit.';

/** Under the favourable days and dates. */
export const FAVOURABLE_NOTE = 'Often called lucky days and dates. They are the weekday of your Driver’s planet and the dates that add down to your Driver or to a number its planet counts as a friend: a preference of the tradition, not a forecast.';
