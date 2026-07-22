/** Content for the multi-calculator. Original copy, keyed by the 1–9 root number. */

export const STRENGTH: Record<number, string> = {
  1: 'Ruled by the Sun, you are a natural leader — original, self-reliant and ambitious. You set your own direction and have the willpower to walk it alone when needed, inspiring others by example rather than instruction.',
  2: 'Ruled by the Moon, you are gentle, intuitive and deeply cooperative. You read people effortlessly, soften conflict, and bring harmony to any group. Your sensitivity is a quiet superpower in relationships.',
  3: 'Ruled by Jupiter, you are expressive, optimistic and creative. Words, art and ideas flow through you. You uplift those around you and find opportunity where others see only obstacles.',
  4: 'Ruled by Rahu, you are disciplined, practical and quietly unconventional. You build solid foundations, work tirelessly, and see systems others miss. Reliability is your signature.',
  5: 'Ruled by Mercury, you are adaptable, quick-witted and free-spirited. You communicate brilliantly, learn fast, and thrive on change. You are the balancing centre that connects every other number.',
  6: 'Ruled by Venus, you are loving, responsible and drawn to beauty. You nurture family and community, create harmony and comfort, and carry a natural magnetism that others find soothing.',
  7: 'Ruled by Ketu, you are introspective, analytical and spiritually curious. You seek truth beneath the surface, value solitude, and possess a rare depth of insight and research.',
  8: 'Ruled by Saturn, you are determined, organised and built for the long game. You understand power, structure and patience, and you earn lasting success through sheer endurance.',
  9: 'Ruled by Mars, you are courageous, energetic and protective. You fight your way to the top, defend those you love, and pour humanitarian passion into everything you undertake.',
};

export const WEAKNESS: Record<number, string> = {
  1: 'The same drive can tip into ego, stubbornness or domineering pride. Guard against impatience with slower people and the urge to do everything yourself.',
  2: 'Sensitivity can become over-dependence, indecision or moodiness. Learn to set boundaries and trust your own judgement without seeking constant reassurance.',
  3: 'Scattered energy, exaggeration and over-talking are the shadow side. Finish what you start, and let depth balance your natural breadth.',
  4: 'Rigidity, resistance to change and a tendency to overwork can isolate you. Allow flexibility and remember that rest is also productive.',
  5: 'Restlessness, over-indulgence and difficulty committing can scatter your gifts. Channel your love of freedom into focused, finished work.',
  6: 'Worry, perfectionism and over-giving can drain you. Care for yourself as generously as you care for others, and release the need to control outcomes.',
  7: 'Withdrawal, over-thinking and aloofness can breed isolation. Stay connected to people; not every question needs to be solved in solitude.',
  8: 'Rigidity, materialism or a heavy seriousness can weigh you down. Soften with gratitude, and let warmth temper your discipline.',
  9: 'Anger, impulsiveness and possessiveness are the fire to watch. Master your temper, slow down, and channel excess energy into movement and exercise.',
};

export const LUCKY_COLORS: Record<number, { lucky: { n: string; hex: string }[]; avoid: { n: string; hex: string }[] }> = {
  1: { lucky: [{ n: 'Gold', hex: '#FFD700' }, { n: 'Orange', hex: '#F97316' }, { n: 'Royal Yellow', hex: '#EAB308' }], avoid: [{ n: 'Black', hex: '#111111' }, { n: 'Deep Blue', hex: '#1E3A8A' }] },
  2: { lucky: [{ n: 'White', hex: '#F8FAFC' }, { n: 'Cream', hex: '#F5ECD2' }, { n: 'Sea Green', hex: '#2DD4BF' }], avoid: [{ n: 'Red', hex: '#DC2626' }, { n: 'Black', hex: '#111111' }] },
  3: { lucky: [{ n: 'Yellow', hex: '#FACC15' }, { n: 'Saffron', hex: '#F59E0B' }, { n: 'Violet', hex: '#8B5CF6' }], avoid: [{ n: 'Black', hex: '#111111' }] },
  4: { lucky: [{ n: 'Grey', hex: '#94A3B8' }, { n: 'Electric Blue', hex: '#38BDF8' }, { n: 'Khaki', hex: '#A3A380' }], avoid: [{ n: 'Red', hex: '#DC2626' }] },
  5: { lucky: [{ n: 'Green', hex: '#22C55E' }, { n: 'Turquoise', hex: '#2DD4BF' }, { n: 'Light Grey', hex: '#CBD5E1' }], avoid: [{ n: 'Crimson', hex: '#BE123C' }] },
  6: { lucky: [{ n: 'Pastel Blue', hex: '#93C5FD' }, { n: 'Pink', hex: '#F9A8D4' }, { n: 'White', hex: '#F8FAFC' }], avoid: [{ n: 'Black', hex: '#111111' }, { n: 'Dark Red', hex: '#7F1D1D' }] },
  7: { lucky: [{ n: 'Sea Green', hex: '#2DD4BF' }, { n: 'Smoke Grey', hex: '#9CA3AF' }, { n: 'Pale Green', hex: '#86EFAC' }], avoid: [{ n: 'Black', hex: '#111111' }] },
  8: { lucky: [{ n: 'Deep Blue', hex: '#1D4ED8' }, { n: 'Black', hex: '#1F2937' }, { n: 'Purple', hex: '#7C3AED' }], avoid: [{ n: 'Bright Red', hex: '#EF4444' }] },
  9: { lucky: [{ n: 'Red', hex: '#EF4444' }, { n: 'Crimson', hex: '#DC2626' }, { n: 'Rose', hex: '#FB7185' }], avoid: [{ n: 'Black', hex: '#111111' }] },
};

export const LUCKY_NUMBERS: Record<number, { friend: number[]; neutral: number[]; avoid: number[] }> = {
  1: { friend: [1, 4, 9], neutral: [3, 5, 6], avoid: [8, 2] },
  2: { friend: [2, 7, 1], neutral: [3, 6, 9], avoid: [8, 4] },
  3: { friend: [3, 6, 9], neutral: [1, 5, 2], avoid: [8, 7] },
  4: { friend: [4, 1, 7], neutral: [5, 6, 8], avoid: [2, 9] },
  5: { friend: [5, 6, 1], neutral: [3, 4, 9], avoid: [2, 8] },
  6: { friend: [6, 5, 3], neutral: [1, 2, 9], avoid: [8, 7] },
  7: { friend: [7, 2, 1], neutral: [4, 6, 5], avoid: [8, 9] },
  8: { friend: [8, 4, 6], neutral: [1, 5, 3], avoid: [9, 2] },
  9: { friend: [9, 3, 1], neutral: [5, 6, 2], avoid: [8, 4] },
};

/** Generic 1–9 personal-cycle reading, reused for day / month / year framing. */
export const CYCLE: Record<number, string> = {
  1: 'A period of fresh starts, initiative and independence. Plant seeds, begin projects, and trust your own lead — what you start now sets the tone for the whole cycle.',
  2: 'A time for patience, partnership and quiet diplomacy. Cooperate rather than push; nurture relationships and let things ripen at their own pace.',
  3: 'A bright, social and creative stretch. Express yourself, connect with people, and let optimism guide you — joy and communication open doors.',
  4: 'A grounding phase of work, order and foundation-building. Tend to details and discipline; steady effort now pays off later.',
  5: 'A dynamic window of change, freedom and movement. Stay adaptable, travel or try the new — but keep one hand on the wheel.',
  6: 'A warm cycle centred on home, love and responsibility. Care for family, beautify your surroundings, and give from a full cup.',
  7: 'A reflective, inward period for study, rest and the spirit. Step back, go deep, and listen — answers arrive in stillness.',
  8: 'A powerful cycle for ambition, money and achievement. Take charge of material matters; rewards come through focus and integrity.',
  9: 'A completing, releasing phase. Finish, forgive and let go of what no longer serves — clearing space for the next beginning.',
};

export const CALCULATORS = [
  { id: 'free-dob', label: 'Free DOB Calculator' },
  { id: 'name-number', label: 'Name Number Calculator' },
  { id: 'lucky-color', label: 'Lucky & Unlucky Colours' },
  { id: 'lucky-number', label: 'Lucky & Unlucky Numbers' },
  { id: 'today', label: "Today's Prediction" },
  { id: 'month', label: "This Month's Prediction" },
  { id: 'year', label: "This Year's Prediction" },
] as const;

export type CalculatorId = typeof CALCULATORS[number]['id'];

/** Vibrant, clearly-distinct colour per root number (1–9) for live calculators. */
export const NUMBER_COLORS: Record<number, string> = {
  1: '#F5A623', // Sun — amber
  2: '#5FA8E0', // Moon — blue
  3: '#5E7785', // Jupiter — slate
  4: '#E0524A', // Rahu — red
  5: '#8E7CC3', // Mercury — violet
  6: '#E8729C', // Venus — pink
  7: '#2BB59A', // Ketu — teal
  8: '#C2913C', // Saturn — bronze
  9: '#19B5D6', // Mars — cyan
};
