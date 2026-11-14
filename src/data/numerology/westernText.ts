/**
 * Readings for the Western (Pythagorean) numbers: Life Path, the name numbers, karmic numbers,
 * pinnacles, challenges and personal cycles. Offered for reflection, in the tradition's own
 * terms; none of it is a forecast.
 */
import type { Digit } from '@/engine/numerology';

/** Life Path readings for 1–9 and the master numbers. */
export const LIFE_PATH_TEXT: Readonly<Record<number, string>> = {
  1: 'Life Path 1 is the path of independence. The tradition describes a person who learns to stand on their own judgement, to begin things, and to lead without waiting for permission. Its lesson is confidence that does not need to prove itself against others.',
  2: 'Life Path 2 is the path of partnership. The tradition describes a person who learns patience, tact and the art of working with others. Its lesson is to stay sensitive without losing one’s own voice in the wish to keep the peace.',
  3: 'Life Path 3 is the path of expression. The tradition describes a person who learns to give ideas a form, in words, art or teaching, and to lift a room. Its lesson is discipline: choosing a few things and finishing them.',
  4: 'Life Path 4 is the path of building. The tradition describes a person who learns through steady work, order and keeping their word. Its lesson is to stay loyal to method while leaving room for change and rest.',
  5: 'Life Path 5 is the path of freedom. The tradition describes a person who learns through variety, travel and many kinds of people. Its lesson is to use that freedom well: commitment chosen freely, not avoided.',
  6: 'Life Path 6 is the path of responsibility. The tradition describes a person who learns through care for home, family and community. Its lesson is balance: giving help that is wanted, and looking after oneself too.',
  7: 'Life Path 7 is the path of inquiry. The tradition describes a person who learns through study, solitude and asking what lies beneath the surface. Its lesson is trust: letting others in, and sharing what has been understood.',
  8: 'Life Path 8 is the path of mastery. The tradition describes a person who learns about effort, authority and the fair use of influence. Its lesson is to measure success by what it serves, not only by what it brings.',
  9: 'Life Path 9 is the path of completion. The tradition describes a person who learns generosity and a wide view of people. Its lesson is letting go: finishing well and releasing what has had its time.',
  11: 'Life Path 11 is a master number, read as the 2 at a higher pitch. The tradition describes strong intuition and the ability to inspire. Its lesson is grounding: steady daily habits that give the sensitivity somewhere to stand.',
  22: 'Life Path 22 is a master number, read as the 4 at a higher pitch. The tradition describes large practical vision and the patience to build it. Its lesson is to start small and keep going rather than be stopped by the size of the aim.',
  33: 'Life Path 33 is a master number, read as the 6 at a higher pitch. The tradition describes care expressed as teaching and service. Its lesson is to teach by example and not to carry what belongs to others.',
};

/** What each core number is said to describe. */
export const CORE_ROLE = {
  lifePath: 'From the date of birth. The road a person travels: the main lessons and direction of a life.',
  birthday: 'From the day of the month. A particular talent that supports the Life Path.',
  expression: 'From every letter of the name. Natural abilities and the way a person goes about things.',
  soulUrge: 'From the vowels of the name. What a person wants most, often privately.',
  personality: 'From the consonants of the name. The side of a person others meet first.',
  maturity: 'Life Path plus Expression. A theme said to grow stronger from the middle years on.',
} as const;

/** One line per number 1–9 and the masters, for the smaller core numbers. */
export const NUMBER_TRAIT: Readonly<Record<number, string>> = {
  1: 'self-starting, direct and independent',
  2: 'cooperative, tactful and attentive to others',
  3: 'expressive, sociable and imaginative',
  4: 'orderly, dependable and hard-working',
  5: 'curious, adaptable and fond of change',
  6: 'caring, responsible and home-loving',
  7: 'thoughtful, private and drawn to study',
  8: 'capable, organised and goal-minded',
  9: 'generous, idealistic and broad in outlook',
  11: 'intuitive and inspiring, with a sensitive side',
  22: 'practical on a large scale, a builder of lasting things',
  33: 'devoted to teaching and to the care of others',
};

export const KARMIC_DEBT_TEXT: Readonly<Record<13 | 14 | 16 | 19, string>> = {
  13: 'Karmic debt 13 sits behind a 4. It is read as a lesson in steady work: results come from finishing tasks properly, without shortcuts.',
  14: 'Karmic debt 14 sits behind a 5. It is read as a lesson in moderation: freedom works best with a few rules one sets for oneself.',
  16: 'Karmic debt 16 sits behind a 7. It is read as a lesson in humility: plans built on pride are rebuilt on something truer.',
  19: 'Karmic debt 19 sits behind a 1. It is read as a lesson in interdependence: learning to ask for help as well as to stand alone.',
};

/** A number no letter of the name carries. */
export const KARMIC_LESSON_TEXT: Readonly<Record<Digit, string>> = {
  1: 'No 1 in the name: a lesson in initiative and backing one’s own decisions.',
  2: 'No 2 in the name: a lesson in patience and attention to other people’s feelings.',
  3: 'No 3 in the name: a lesson in self-expression and taking things less heavily.',
  4: 'No 4 in the name: a lesson in method, routine and seeing work through.',
  5: 'No 5 in the name: a lesson in welcoming change and new experience.',
  6: 'No 6 in the name: a lesson in commitment and responsibility to others.',
  7: 'No 7 in the name: a lesson in reflection and looking deeper before deciding.',
  8: 'No 8 in the name: a lesson in handling resources and authority with care.',
  9: 'No 9 in the name: a lesson in tolerance and thinking beyond one’s own circle.',
};

/** The theme of a pinnacle, the long chapters of life in this system. */
export const PINNACLE_TEXT: Readonly<Record<number, string>> = {
  1: 'A chapter that asks for independence and the courage to begin.',
  2: 'A chapter of partnership, patience and working closely with others.',
  3: 'A chapter of expression, friendships and creative work.',
  4: 'A chapter of steady effort and laying foundations.',
  5: 'A chapter of change, movement and widening experience.',
  6: 'A chapter centred on home, family and responsibility.',
  7: 'A chapter of study, reflection and inner growth.',
  8: 'A chapter of ambition, organisation and taking charge.',
  9: 'A chapter of giving, wide interests and completing what was begun.',
  11: 'A chapter of heightened intuition and of inspiring others, read as the 2 at a higher pitch.',
};

/** The challenge that runs beside each pinnacle (0 to 8). */
export const CHALLENGE_TEXT: Readonly<Record<number, string>> = {
  0: 'Challenge 0 has no single lesson; the tradition calls it the challenge of choice, where every lesson is open.',
  1: 'Challenge 1: to hold one’s ground without becoming stubborn.',
  2: 'Challenge 2: to stay sensitive without being ruled by other people’s opinions.',
  3: 'Challenge 3: to speak up and create without scattering one’s energy.',
  4: 'Challenge 4: to keep order and routine without growing rigid.',
  5: 'Challenge 5: to enjoy freedom without running from commitment.',
  6: 'Challenge 6: to help without insisting on how others should live.',
  7: 'Challenge 7: to trust, and to share what is felt as well as what is thought.',
  8: 'Challenge 8: to pursue goals without measuring everything by results.',
};

/** Personal year, month and day themes, 1 to 9. */
export const CYCLE_TEXT: Readonly<Record<Digit, { keyword: string; year: string; short: string }>> = {
  1: { keyword: 'Beginnings', year: 'A year for fresh starts and acting on your own initiative. What is begun now sets the tone for the nine-year cycle.', short: 'Good for starting something and acting on your own lead.' },
  2: { keyword: 'Patience', year: 'A year for cooperation and letting things ripen. Relationships and quiet groundwork matter more than pushing.', short: 'Good for cooperation, listening and small courtesies.' },
  3: { keyword: 'Expression', year: 'A sociable, creative year. Say what you think, make things, and keep company with people who lift your mood.', short: 'Good for conversation, creative work and friends.' },
  4: { keyword: 'Foundations', year: 'A year of work and order. Attend to details, routines and health habits; steady effort now supports later years.', short: 'Good for routine tasks, planning and tidying up.' },
  5: { keyword: 'Change', year: 'A year of movement and variety. Stay flexible and try the new, while keeping a few fixed points.', short: 'Good for variety, travel and trying a new approach.' },
  6: { keyword: 'Responsibility', year: 'A year centred on home and the people who rely on you. Care, repair and commitment are its themes.', short: 'Good for family matters, home and keeping promises.' },
  7: { keyword: 'Reflection', year: 'An inward year for study and rest. Step back, read, and give questions time rather than forcing answers.', short: 'Good for study, quiet and time alone.' },
  8: { keyword: 'Effort', year: 'A year for organisation and practical goals. Take charge of what you are responsible for and act with integrity.', short: 'Good for organising, decisions and practical matters.' },
  9: { keyword: 'Completion', year: 'A year for finishing and clearing out. Close what is done, forgive what can be forgiven, and make room.', short: 'Good for finishing things and letting go of clutter.' },
};
