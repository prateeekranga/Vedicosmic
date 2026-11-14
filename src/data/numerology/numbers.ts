/**
 * What each number stands for, in one place. Every numerology tool reads its planet, colours,
 * keyword and short readings from here, so a number never looks or reads differently on two pages.
 *
 * The wording describes what the tradition associates with a number. It makes no promise about
 * a person's health, money or relationships.
 */
import type { Digit } from '@/engine/numerology';

export interface NumberInfo {
  n: Digit;
  /** The ruling planet in Indian numerology. */
  planet: string;
  sanskrit: string;
  /** The weekday the tradition gives the planet; Rahu and Ketu have none of their own. */
  day: string | null;
  keyword: string;
  /** The Western (Pythagorean) name for the number's character. */
  archetype: string;
  /** One colour for the number everywhere on the site: `fill` behind dark `ink`. */
  colour: { name: string; fill: string; ink: string };
  /** Colours the tradition links with the planet. */
  colours: string[];
  gemstone: string;
  strength: string;
  growthEdge: string;
}

const INK = '#1A1330';

export const NUMBERS: Readonly<Record<Digit, NumberInfo>> = {
  1: {
    n: 1, planet: 'Sun', sanskrit: 'Surya', day: 'Sunday', keyword: 'Identity and will', archetype: 'The Pioneer',
    colour: { name: 'Gold', fill: '#F5B942', ink: INK }, colours: ['Gold', 'Orange', 'Yellow'], gemstone: 'Ruby',
    strength: 'The Sun’s number is read as self-reliance and initiative: a person who sets a direction, starts things without waiting to be asked, and leads more by example than by instruction.',
    growthEdge: 'The same drive can harden into pride or impatience with slower people. The work is to lead without dominating and to accept help without feeling smaller for it.',
  },
  2: {
    n: 2, planet: 'Moon', sanskrit: 'Chandra', day: 'Monday', keyword: 'Feeling and intuition', archetype: 'The Diplomat',
    colour: { name: 'Pearl', fill: '#E3EAF5', ink: INK }, colours: ['White', 'Cream', 'Silver'], gemstone: 'Pearl',
    strength: 'The Moon’s number is read as sensitivity and tact: someone who notices how others feel, eases tension in a group and does their best work alongside people rather than alone.',
    growthEdge: 'Sensitivity can turn into indecision or leaning on others for reassurance. The work is to hold a boundary and to trust one’s own judgement.',
  },
  3: {
    n: 3, planet: 'Jupiter', sanskrit: 'Guru', day: 'Thursday', keyword: 'Learning and expression', archetype: 'The Creator',
    colour: { name: 'Yellow', fill: '#F2D55C', ink: INK }, colours: ['Yellow', 'Saffron'], gemstone: 'Yellow sapphire',
    strength: 'Jupiter’s number is read as optimism and a gift for words and teaching: ideas come easily, and so does the wish to share what has been learned.',
    growthEdge: 'Energy can scatter across too many interests, and talk can outrun follow-through. The work is to finish what enthusiasm begins.',
  },
  4: {
    n: 4, planet: 'Rahu', sanskrit: 'Rahu', day: null, keyword: 'Order and method', archetype: 'The Builder',
    colour: { name: 'Smoke blue', fill: '#A3B6CF', ink: INK }, colours: ['Grey', 'Smoky blue'], gemstone: 'Hessonite (gomed)',
    strength: 'Rahu’s number is read as discipline with an unconventional streak: a steady worker who builds systems, notices what others overlook and is known for reliability.',
    growthEdge: 'Method can stiffen into resistance to change, and steady work into overwork. The work is to allow flexibility and to count rest as part of the job.',
  },
  5: {
    n: 5, planet: 'Mercury', sanskrit: 'Budha', day: 'Wednesday', keyword: 'Balance and communication', archetype: 'The Explorer',
    colour: { name: 'Green', fill: '#7FD29B', ink: INK }, colours: ['Green', 'Turquoise'], gemstone: 'Emerald',
    strength: 'Mercury’s number sits at the centre of the square and is read as adaptability and quick thinking: someone who learns fast, speaks well and connects people and ideas.',
    growthEdge: 'A love of change can become restlessness and trouble committing. The work is to put that freedom into focused, finished things.',
  },
  6: {
    n: 6, planet: 'Venus', sanskrit: 'Shukra', day: 'Friday', keyword: 'Care and harmony', archetype: 'The Nurturer',
    colour: { name: 'Rose', fill: '#F4B6D2', ink: INK }, colours: ['White', 'Pink', 'Pastel blue'], gemstone: 'Diamond',
    strength: 'Venus’s number is read as warmth and responsibility: a person drawn to beauty and comfort who looks after family and community and makes a place feel settled.',
    growthEdge: 'Care can slide into worry, perfectionism or giving past one’s limits. The work is to look after oneself as generously as one looks after others.',
  },
  7: {
    n: 7, planet: 'Ketu', sanskrit: 'Ketu', day: null, keyword: 'Inquiry and detachment', archetype: 'The Seeker',
    colour: { name: 'Sand', fill: '#D1C6AC', ink: INK }, colours: ['Smoke grey', 'Off-white'], gemstone: 'Cat’s eye',
    strength: 'Ketu’s number is read as depth and inquiry: someone who looks beneath the surface, values quiet and is drawn to study, research and the inner life.',
    growthEdge: 'Reflection can become withdrawal or overthinking. The work is to stay in touch with people; not every question has to be solved alone.',
  },
  8: {
    n: 8, planet: 'Saturn', sanskrit: 'Shani', day: 'Saturday', keyword: 'Patience and structure', archetype: 'The Organiser',
    colour: { name: 'Blue', fill: '#8FA8E8', ink: INK }, colours: ['Dark blue', 'Black'], gemstone: 'Blue sapphire',
    strength: 'Saturn’s number is read as endurance and organisation: a person who takes responsibility seriously, plans for the long run and earns results slowly and surely.',
    growthEdge: 'Seriousness can grow heavy, and discipline rigid. The work is to let warmth and gratitude sit beside the sense of duty.',
  },
  9: {
    n: 9, planet: 'Mars', sanskrit: 'Mangal', day: 'Tuesday', keyword: 'Energy and courage', archetype: 'The Humanitarian',
    colour: { name: 'Coral', fill: '#F08F80', ink: INK }, colours: ['Red', 'Coral', 'Maroon'], gemstone: 'Red coral',
    strength: 'Mars’s number is read as courage and drive: someone energetic and protective who acts on conviction and puts real effort into causes larger than themselves.',
    growthEdge: 'The same fire can show as temper or haste. The work is to slow down before reacting and to give the energy a physical outlet.',
  },
};

export const numberInfo = (n: Digit): NumberInfo => NUMBERS[n];

/** Western master numbers. They have no planet or gemstone of their own; the base digit's apply. */
export const MASTER_TEXT: Readonly<Record<11 | 22 | 33, { archetype: string; text: string }>> = {
  11: {
    archetype: 'The Intuitive',
    text: 'Eleven is read as the 2 at a higher pitch: strong intuition and the ability to inspire, with a sensitivity that needs steady daily routines to stay grounded.',
  },
  22: {
    archetype: 'The Master Builder',
    text: 'Twenty-two is read as the 4 at a higher pitch: large practical vision and the patience to build something lasting, with the pressure that comes from aiming that high.',
  },
  33: {
    archetype: 'The Teacher',
    text: 'Thirty-three is read as the 6 at a higher pitch: care expressed as teaching and service, with the lesson of not carrying everyone else’s load.',
  },
};

/** Text for a number that may be a master number: the master note, or null for 1–9. */
export function masterNote(value: number): { archetype: string; text: string } | null {
  return value === 11 || value === 22 || value === 33 ? MASTER_TEXT[value] : null;
}
