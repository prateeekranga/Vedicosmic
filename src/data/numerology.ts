export interface NumberMeaning {
  number: number;
  name: string;
  keywords: string[];
  planet: string;
  element: string;
  color: string;
  gemstone: string;
  strengths: string;
  challenges: string;
  compatibleWith: number[];
  isMaster?: boolean;
}

export const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    number: 1, name: 'The Pioneer', keywords: ['Independence', 'Initiative', 'Will'],
    planet: 'Sun (Surya)', element: 'Fire', color: '#F87171', gemstone: 'Ruby',
    strengths: 'Natural-born leaders with originality and drive. Ones initiate where others hesitate and carry a self-reliant, trailblazing energy that inspires those around them.',
    challenges: 'Can drift into stubbornness, ego, or isolation. The lesson of the One is to lead without dominating and to accept help without feeling diminished.',
    compatibleWith: [1, 3, 5, 9],
  },
  2: {
    number: 2, name: 'The Diplomat', keywords: ['Harmony', 'Sensitivity', 'Partnership'],
    planet: 'Moon (Chandra)', element: 'Water', color: '#FB923C', gemstone: 'Pearl',
    strengths: 'Intuitive peacemakers gifted at reading people and building bridges. Twos thrive in cooperation, bringing patience, tact, and emotional intelligence to every bond.',
    challenges: 'Tendency toward over-dependence, indecision, and absorbing others’ moods. Growth comes from honouring their own needs and setting gentle boundaries.',
    compatibleWith: [2, 4, 6, 8],
  },
  3: {
    number: 3, name: 'The Creator', keywords: ['Expression', 'Joy', 'Imagination'],
    planet: 'Jupiter (Guru)', element: 'Fire', color: '#FBBF24', gemstone: 'Yellow Sapphire',
    strengths: 'Expressive, optimistic, and magnetic communicators. Threes turn ideas into art and lift the spirits of a room simply by entering it.',
    challenges: 'Scattered focus and surface-level engagement can dilute their gifts. The Three learns depth by finishing what their enthusiasm begins.',
    compatibleWith: [1, 3, 5, 9],
  },
  4: {
    number: 4, name: 'The Builder', keywords: ['Stability', 'Discipline', 'Order'],
    planet: 'Rahu', element: 'Earth', color: '#34D399', gemstone: 'Hessonite',
    strengths: 'Methodical, dependable, and patient. Fours build lasting structures — in work, family, and society — through steady, honest effort.',
    challenges: 'Rigidity and resistance to change can become a cage. The Four’s freedom lies in trusting flow as much as foundation.',
    compatibleWith: [2, 4, 6, 8],
  },
  5: {
    number: 5, name: 'The Explorer', keywords: ['Freedom', 'Change', 'Curiosity'],
    planet: 'Mercury (Budha)', element: 'Air', color: '#22D3EE', gemstone: 'Emerald',
    strengths: 'Adaptable, adventurous, and quick-witted. Fives are the explorers of the numeric world, thriving on variety, travel, and fresh experience.',
    challenges: 'Restlessness and avoidance of commitment can scatter their considerable energy. Mastery means freedom with responsibility.',
    compatibleWith: [1, 3, 5, 7],
  },
  6: {
    number: 6, name: 'The Nurturer', keywords: ['Love', 'Service', 'Responsibility'],
    planet: 'Venus (Shukra)', element: 'Earth', color: '#60A5FA', gemstone: 'Diamond',
    strengths: 'Warm, responsible caretakers devoted to home, beauty, and community. Sixes hold families and circles together with generosity and grace.',
    challenges: 'Can over-give to the point of martyrdom or control. The Six learns that true care includes caring for oneself.',
    compatibleWith: [2, 4, 6, 9],
  },
  7: {
    number: 7, name: 'The Seeker', keywords: ['Wisdom', 'Introspection', 'Mysticism'],
    planet: 'Ketu', element: 'Water', color: '#818CF8', gemstone: 'Cat’s Eye',
    strengths: 'Analytical mystics drawn to the unseen. Sevens pursue truth through study, solitude, and contemplation, often becoming the wise voice in any group.',
    challenges: 'Withdrawal, scepticism, and emotional distance. The Seven’s path is to bring their inner depths into shared, human connection.',
    compatibleWith: [1, 5, 7, 9],
  },
  8: {
    number: 8, name: 'The Sovereign', keywords: ['Power', 'Ambition', 'Mastery'],
    planet: 'Saturn (Shani)', element: 'Earth', color: '#A78BFA', gemstone: 'Blue Sapphire',
    strengths: 'Disciplined achievers with executive vision. Eights understand material law — money, power, and structure — and can build empires from focus alone.',
    challenges: 'Workaholism and a hunger for control can harden the heart. Saturn rewards the Eight who wields power in service of something larger.',
    compatibleWith: [2, 4, 6, 8],
  },
  9: {
    number: 9, name: 'The Humanitarian', keywords: ['Compassion', 'Idealism', 'Completion'],
    planet: 'Mars (Mangala)', element: 'Fire', color: '#F472B6', gemstone: 'Red Coral',
    strengths: 'Broad-hearted idealists who feel the whole of humanity. Nines give generously and carry an old-soul wisdom that uplifts and heals.',
    challenges: 'Difficulty letting go and a tendency to carry others’ pain. The Nine completes its cycle by releasing what is finished with grace.',
    compatibleWith: [1, 3, 6, 9],
  },
  11: {
    number: 11, name: 'The Illuminator', keywords: ['Intuition', 'Inspiration', 'Vision'], isMaster: true,
    planet: 'Moon · Sun', element: 'Spirit', color: '#FFD700', gemstone: 'Moonstone',
    strengths: 'A master vibration of spiritual insight and inspired leadership. Elevens are channels of intuition who illuminate paths for others.',
    challenges: 'High sensitivity and nervous intensity. The Eleven must ground its visionary current in practical, daily life.',
    compatibleWith: [2, 6, 9, 11],
  },
  22: {
    number: 22, name: 'The Master Builder', keywords: ['Manifestation', 'Legacy', 'Scale'], isMaster: true,
    planet: 'Saturn · Sun', element: 'Spirit', color: '#FFD700', gemstone: 'Amethyst',
    strengths: 'The most powerful master number — visionary ideals made concrete at scale. Twenty-twos turn dreams into institutions that outlast them.',
    challenges: 'Immense pressure and fear of their own potential. Mastery is daring to build what they were given to build.',
    compatibleWith: [4, 6, 8, 22],
  },
  33: {
    number: 33, name: 'The Master Teacher', keywords: ['Devotion', 'Healing', 'Service'], isMaster: true,
    planet: 'Jupiter · Venus', element: 'Spirit', color: '#FFD700', gemstone: 'Clear Quartz',
    strengths: 'The teacher of teachers — selfless love expressed through service and uplift. Thirty-threes embody compassion as a way of being.',
    challenges: 'Self-sacrifice to the point of depletion. The Thirty-three learns to teach by living, not by carrying everyone.',
    compatibleWith: [6, 9, 11, 33],
  },
};

export const NUMEROLOGY_INTRO =
  'Numerology — known in the Sanskrit tradition as Anka Shastra, the science of numbers — holds that every number carries a measurable vibration. Pythagoras, the Greek mathematician, formalised the idea that "all is number"; the Vedic seers had mapped the same terrain through the nine planets (Navagraha). Your name and birth date encode a numeric signature that these systems read as a blueprint of tendencies.';
