export interface RashiInfo {
  index: number;
  sanskrit: string;
  english: string;
  symbol: string;
  ruler: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  color: string;
  traits: string;
}

export const RASHI_INFO: RashiInfo[] = [
  { index: 0, sanskrit: 'Mesha', english: 'Aries', symbol: '♈', ruler: 'Mars (Mangala)', element: 'Fire', quality: 'Cardinal', color: '#F87171', traits: 'Pioneering, courageous, and direct. Mesha natives lead from the front and act on instinct, bringing raw initiative to everything they touch.' },
  { index: 1, sanskrit: 'Vrishabha', english: 'Taurus', symbol: '♉', ruler: 'Venus (Shukra)', element: 'Earth', quality: 'Fixed', color: '#34D399', traits: 'Grounded, sensual, and steadfast. Vrishabha values beauty, comfort, and stability, building wealth and pleasure with patient persistence.' },
  { index: 2, sanskrit: 'Mithuna', english: 'Gemini', symbol: '♊', ruler: 'Mercury (Budha)', element: 'Air', quality: 'Mutable', color: '#22D3EE', traits: 'Curious, communicative, and versatile. Mithuna is the eternal student and messenger, alive with ideas and quick mental movement.' },
  { index: 3, sanskrit: 'Karka', english: 'Cancer', symbol: '♋', ruler: 'Moon (Chandra)', element: 'Water', quality: 'Cardinal', color: '#CBD5E1', traits: 'Nurturing, intuitive, and protective. Karka feels deeply and creates emotional sanctuary, tending home and heart with quiet devotion.' },
  { index: 4, sanskrit: 'Simha', english: 'Leo', symbol: '♌', ruler: 'Sun (Surya)', element: 'Fire', quality: 'Fixed', color: '#FBBF24', traits: 'Radiant, regal, and generous. Simha shines with natural authority and warmth, born to inspire, create, and be seen.' },
  { index: 5, sanskrit: 'Kanya', english: 'Virgo', symbol: '♍', ruler: 'Mercury (Budha)', element: 'Earth', quality: 'Mutable', color: '#86EFAC', traits: 'Precise, devoted, and discerning. Kanya refines and serves, finding the sacred in detail and the meaningful in useful work.' },
  { index: 6, sanskrit: 'Tula', english: 'Libra', symbol: '♎', ruler: 'Venus (Shukra)', element: 'Air', quality: 'Cardinal', color: '#7DD3FC', traits: 'Harmonious, fair, and refined. Tula seeks balance and beauty in relationship, weighing every choice on the scales of justice.' },
  { index: 7, sanskrit: 'Vrishchika', english: 'Scorpio', symbol: '♏', ruler: 'Mars · Ketu', element: 'Water', quality: 'Fixed', color: '#F472B6', traits: 'Intense, transformative, and magnetic. Vrishchika dives to the depths, mastering the cycles of death and rebirth within and without.' },
  { index: 8, sanskrit: 'Dhanu', english: 'Sagittarius', symbol: '♐', ruler: 'Jupiter (Guru)', element: 'Fire', quality: 'Mutable', color: '#C084FC', traits: 'Philosophical, free, and optimistic. Dhanu is the seeker-archer, aiming arrows of meaning toward distant truths and horizons.' },
  { index: 9, sanskrit: 'Makara', english: 'Capricorn', symbol: '♑', ruler: 'Saturn (Shani)', element: 'Earth', quality: 'Cardinal', color: '#94A3B8', traits: 'Ambitious, disciplined, and enduring. Makara climbs steadily toward mastery, honouring time, structure, and earned authority.' },
  { index: 10, sanskrit: 'Kumbha', english: 'Aquarius', symbol: '♒', ruler: 'Saturn · Rahu', element: 'Air', quality: 'Fixed', color: '#818CF8', traits: 'Visionary, humanitarian, and original. Kumbha pours wisdom for the collective, thinking in systems and centuries.' },
  { index: 11, sanskrit: 'Meena', english: 'Pisces', symbol: '♓', ruler: 'Jupiter (Guru)', element: 'Water', quality: 'Mutable', color: '#A5B4FC', traits: 'Compassionate, dreamy, and spiritual. Meena dissolves boundaries, swimming between worlds with imagination and boundless empathy.' },
];

export const NAVAGRAHA: Record<string, string> = {
  'Sun (Surya)': 'The soul, vitality, and the father. Surya governs confidence, leadership, and the radiant core of the self.',
  'Moon (Chandra)': 'The mind, emotions, and the mother. Chandra rules feeling, memory, and the tides of the inner world.',
  'Mars (Mangala)': 'Energy, courage, and drive. Mangala governs action, conflict, property, and physical vitality.',
  'Mercury (Budha)': 'Intellect and communication. Budha rules speech, commerce, learning, and analytical reasoning.',
  'Jupiter (Guru)': 'Wisdom, expansion, and grace. Guru governs knowledge, dharma, fortune, and the role of the teacher.',
  'Venus (Shukra)': 'Love, beauty, and pleasure. Shukra rules relationships, art, luxury, and the sweetness of life.',
  'Saturn (Shani)': 'Discipline, time, and karma. Shani governs structure, endurance, limitation, and hard-won maturity.',
  'Mars · Ketu': 'A blend of Mars’ force with Ketu’s spiritual depth — intensity directed toward transformation.',
  'Mars · Mangala': 'Energy, courage, and drive directed through fiery initiative.',
  'Saturn · Rahu': 'Saturn’s structure crossed with Rahu’s innovation — the radical builder of new systems.',
  'Saturn · Shani': 'Discipline, time, and karma made concrete.',
};

export const SIDEREAL_NOTE =
  'Vedic astrology uses the sidereal zodiac, measured against the fixed stars, while Western astrology uses the tropical zodiac, fixed to the seasons. Because Earth’s axis slowly wobbles — the precession of the equinoxes, a ~25,800-year cycle — the two systems have drifted roughly 24° apart. The Lahiri Ayanamsa is the correction Vedic astrologers apply to translate between them. This is why your Vedic Sun sign is often one sign earlier than your Western one.';
