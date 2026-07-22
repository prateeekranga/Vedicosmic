export interface Chakra {
  id: string;
  name: string;
  sanskrit: string;
  number: number;
  color: string;
  location: string;
  element: string;
  bija: string;       // seed mantra
  themes: string;
  balanced: string;
  blocked: string;
  yoga: string[];
  foods: string[];
  crystals: string[];
  questions: string[]; // 3 likert statements
}

export const CHAKRAS: Chakra[] = [
  {
    id: 'root', name: 'Root', sanskrit: 'Muladhara', number: 1, color: '#F87171',
    location: 'Base of the spine', element: 'Earth', bija: 'LAM',
    themes: 'Safety, survival, grounding, belonging.',
    balanced: 'You feel secure, present, and at home in your body and your life.',
    blocked: 'Anxiety about money or safety, restlessness, feeling ungrounded or disconnected from the body.',
    yoga: ['Tadasana (Mountain)', 'Malasana (Garland Squat)', 'Balasana (Child’s Pose)'],
    foods: ['Root vegetables', 'Protein', 'Red foods (beets, pomegranate)'],
    crystals: ['Red Jasper', 'Black Tourmaline', 'Hematite'],
    questions: [
      'I feel safe, stable, and secure in my daily life.',
      'I feel grounded and at home in my physical body.',
      'My basic needs (home, food, finances) feel reliably met.',
    ],
  },
  {
    id: 'sacral', name: 'Sacral', sanskrit: 'Svadhisthana', number: 2, color: '#FB923C',
    location: 'Lower abdomen', element: 'Water', bija: 'VAM',
    themes: 'Emotion, pleasure, creativity, sexuality.',
    balanced: 'Emotions flow freely; you create, feel, and enjoy with ease.',
    blocked: 'Emotional numbness or volatility, creative blocks, guilt around pleasure.',
    yoga: ['Baddha Konasana (Butterfly)', 'Bhujangasana (Cobra)', 'Hip circles'],
    foods: ['Orange foods (mango, carrot)', 'Nuts', 'Water-rich fruits'],
    crystals: ['Carnelian', 'Orange Calcite', 'Moonstone'],
    questions: [
      'I allow myself to feel and express my emotions fully.',
      'I make time for creativity, play, and pleasure.',
      'I feel comfortable and at ease with intimacy.',
    ],
  },
  {
    id: 'solar', name: 'Solar Plexus', sanskrit: 'Manipura', number: 3, color: '#FBBF24',
    location: 'Upper abdomen', element: 'Fire', bija: 'RAM',
    themes: 'Power, will, confidence, identity.',
    balanced: 'You act with confidence, purpose, and healthy self-esteem.',
    blocked: 'Low self-worth, control issues, indecision, or domineering tendencies.',
    yoga: ['Navasana (Boat)', 'Dhanurasana (Bow)', 'Kapalabhati breath'],
    foods: ['Whole grains', 'Yellow foods (banana, corn)', 'Ginger & turmeric'],
    crystals: ['Citrine', 'Tiger’s Eye', 'Yellow Jasper'],
    questions: [
      'I feel confident in my decisions and personal power.',
      'I pursue my goals with discipline and follow-through.',
      'I value myself and stand up for my own needs.',
    ],
  },
  {
    id: 'heart', name: 'Heart', sanskrit: 'Anahata', number: 4, color: '#34D399',
    location: 'Centre of the chest', element: 'Air', bija: 'YAM',
    themes: 'Love, compassion, connection, forgiveness.',
    balanced: 'You give and receive love freely; compassion flows naturally.',
    blocked: 'Difficulty trusting, holding grudges, isolation, or co-dependence.',
    yoga: ['Ustrasana (Camel)', 'Setu Bandha (Bridge)', 'Heart-opening backbends'],
    foods: ['Leafy greens', 'Green tea', 'Cruciferous vegetables'],
    crystals: ['Rose Quartz', 'Green Aventurine', 'Malachite'],
    questions: [
      'I give and receive love openly and without fear.',
      'I forgive others and release resentment with grace.',
      'I feel deep compassion for myself and for others.',
    ],
  },
  {
    id: 'throat', name: 'Throat', sanskrit: 'Vishuddha', number: 5, color: '#22D3EE',
    location: 'Throat', element: 'Ether', bija: 'HAM',
    themes: 'Truth, expression, communication, authenticity.',
    balanced: 'You speak your truth clearly and listen with presence.',
    blocked: 'Fear of speaking up, dishonesty, or over-talking and not listening.',
    yoga: ['Sarvangasana (Shoulderstand)', 'Matsyasana (Fish)', 'Chanting / humming'],
    foods: ['Fruits', 'Herbal teas', 'Soups & broths'],
    crystals: ['Aquamarine', 'Sodalite', 'Blue Lace Agate'],
    questions: [
      'I express my truth honestly and clearly.',
      'I communicate my needs without fear of judgment.',
      'I listen deeply and feel heard by others.',
    ],
  },
  {
    id: 'third-eye', name: 'Third Eye', sanskrit: 'Ajna', number: 6, color: '#818CF8',
    location: 'Between the eyebrows', element: 'Light', bija: 'OM',
    themes: 'Intuition, insight, imagination, perception.',
    balanced: 'You trust your intuition and see situations with clarity.',
    blocked: 'Overthinking, confusion, disconnection from intuition, or escapism.',
    yoga: ['Balasana with brow to floor', 'Trataka (candle gazing)', 'Alternate-nostril breath'],
    foods: ['Purple foods (blueberry, grape)', 'Omega-3s', 'Cacao'],
    crystals: ['Amethyst', 'Lapis Lazuli', 'Fluorite'],
    questions: [
      'I trust my intuition and inner guidance.',
      'I can see the bigger picture and patterns in my life.',
      'My imagination and inner vision feel vivid and alive.',
    ],
  },
  {
    id: 'crown', name: 'Crown', sanskrit: 'Sahasrara', number: 7, color: '#C084FC',
    location: 'Top of the head', element: 'Consciousness', bija: 'Silence / OM',
    themes: 'Spirituality, unity, transcendence, connection to the divine.',
    balanced: 'You feel connected to something greater and at peace with existence.',
    blocked: 'Disconnection, cynicism, lack of meaning, or spiritual bypassing.',
    yoga: ['Sirsasana (Headstand)', 'Padmasana (Lotus) meditation', 'Silent stillness'],
    foods: ['Fasting / light eating', 'Pure water', 'Detoxifying herbs'],
    crystals: ['Clear Quartz', 'Selenite', 'Amethyst'],
    questions: [
      'I feel connected to a sense of purpose greater than myself.',
      'I experience moments of peace, unity, or transcendence.',
      'I feel my life carries deep meaning.',
    ],
  },
];

export function chakraStatus(score: number): { label: string; tone: 'error' | 'warning' | 'success' | 'cyan' } {
  if (score < 7) return { label: 'Blocked', tone: 'error' };
  if (score <= 10) return { label: 'Partially Open', tone: 'warning' };
  if (score <= 13) return { label: 'Balanced', tone: 'success' };
  return { label: 'Overactive', tone: 'cyan' };
}
