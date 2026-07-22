/**
 * Deities for the Virtual Puja & Aarti tool. Each is represented by its
 * traditional bija (seed) mantra syllable — the same authentic, symbolic
 * approach already used across this site (see FloatingGlyphs) — rather than
 * a figurative image, alongside a short well-known invocation and the
 * opening line of its traditional aarti (all public-domain devotional verses
 * well over a century old).
 */

export interface Deity {
  id: string;
  name: string;
  sanskrit: string;
  bija: string;           // seed-syllable shown large on the altar
  epithet: string;        // one-line significance
  color: string;
  glow: string;
  mantra: { devanagari: string; transliteration: string; meaning: string };
  aarti: { devanagari: string; transliteration: string; translation: string };
}

export const DEITIES: Deity[] = [
  {
    id: 'ganesha', name: 'Ganesha', sanskrit: 'गणेश', bija: 'गं',
    epithet: 'Remover of obstacles — invoked first, before any undertaking.',
    color: '#F2B27A', glow: 'rgba(242,178,122,0.35)',
    mantra: { devanagari: 'ॐ गं गणपतये नमः', transliteration: 'Om Gam Ganapataye Namah', meaning: 'I bow to Ganapati, remover of obstacles and lord of new beginnings.' },
    aarti: { devanagari: 'जय गणेश जय गणेश जय गणेश देवा। माता जाकी पार्वती पिता महादेवा॥', transliteration: 'Jai Ganesh, Jai Ganesh, Jai Ganesh Deva, Mata Jaki Parvati, Pita Mahadeva', translation: 'Victory to Ganesha, whose mother is Parvati and father is Mahadeva (Shiva).' },
  },
  {
    id: 'shiva', name: 'Shiva', sanskrit: 'शिव', bija: 'ॐ',
    epithet: 'The auspicious one — pure consciousness, stillness and transformation.',
    color: '#A9C4E0', glow: 'rgba(169,196,224,0.35)',
    mantra: { devanagari: 'ॐ नमः शिवाय', transliteration: 'Om Namah Shivaya', meaning: 'I bow to the auspicious inner Self — Shiva, the pure consciousness within all things.' },
    aarti: { devanagari: 'ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा।', transliteration: 'Om Jai Shiv Omkara, Swami Jai Shiv Omkara', translation: 'Victory to Shiva, the sacred syllable Om itself.' },
  },
  {
    id: 'krishna', name: 'Krishna', sanskrit: 'कृष्ण', bija: 'क्लीं',
    epithet: 'Divine love, playfulness and the song of the soul.',
    color: '#6366F1', glow: 'rgba(99,102,241,0.35)',
    mantra: { devanagari: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे', transliteration: 'Hare Krishna Hare Krishna, Krishna Krishna Hare Hare', meaning: 'A joyful invocation of the divine names, dissolving the heart into love and bliss.' },
    aarti: { devanagari: 'ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।', transliteration: 'Om Jai Jagdish Hare, Swami Jai Jagdish Hare', translation: 'Victory to the Lord of the universe, the remover of suffering.' },
  },
  {
    id: 'durga', name: 'Durga', sanskrit: 'दुर्गा', bija: 'दुं',
    epithet: 'The fierce, protective mother — courage and inner strength.',
    color: '#E5594F', glow: 'rgba(229,89,79,0.35)',
    mantra: { devanagari: 'ॐ दुं दुर्गायै नमः', transliteration: 'Om Dum Durgayei Namah', meaning: 'I invoke Durga, the fierce and protective mother, source of inner strength and courage.' },
    aarti: { devanagari: 'जय अम्बे गौरी, मैया जय श्यामा गौरी।', transliteration: 'Jai Ambe Gauri, Maiya Jai Shyama Gauri', translation: 'Victory to Mother Ambe, the radiant, compassionate goddess.' },
  },
  {
    id: 'lakshmi', name: 'Lakshmi', sanskrit: 'लक्ष्मी', bija: 'श्रीं',
    epithet: 'Abundance, grace and prosperity of every kind.',
    color: '#FFD700', glow: 'rgba(255,215,0,0.35)',
    mantra: { devanagari: 'ॐ श्रीं महालक्ष्म्यै नमः', transliteration: 'Om Shreem Mahalakshmyai Namah', meaning: 'I bow to Mahalakshmi, goddess of abundance, grace and good fortune.' },
    aarti: { devanagari: 'ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।', transliteration: 'Om Jai Lakshmi Mata, Maiya Jai Lakshmi Mata', translation: 'Victory to Mother Lakshmi, giver of prosperity and grace.' },
  },
  {
    id: 'hanuman', name: 'Hanuman', sanskrit: 'हनुमान', bija: 'हं',
    epithet: 'Devotion, selfless service and unwavering strength.',
    color: '#F4511E', glow: 'rgba(244,81,30,0.35)',
    mantra: { devanagari: 'ॐ हं हनुमते नमः', transliteration: 'Om Ham Hanumate Namah', meaning: 'I bow to Hanuman, whose devotion and strength serve the highest good.' },
    aarti: { devanagari: 'आरती कीजै हनुमान लला की, दुष्ट दलन रघुनाथ कला की।', transliteration: 'Aarti Kije Hanuman Lala Ki, Dushta Dalan Raghunath Kala Ki', translation: 'We offer this aarti to beloved Hanuman, destroyer of evil and servant of Rama.' },
  },
  {
    id: 'saraswati', name: 'Saraswati', sanskrit: 'सरस्वती', bija: 'ऐं',
    epithet: 'Wisdom, learning, music and the arts.',
    color: '#DCE3EC', glow: 'rgba(220,227,236,0.35)',
    mantra: { devanagari: 'ॐ ऐं सरस्वत्यै नमः', transliteration: 'Om Aim Saraswatyai Namah', meaning: 'I bow to Saraswati, goddess of wisdom, speech, music, and learning.' },
    aarti: { devanagari: 'या कुन्देन्दुतुषारहारधवला, या शुभ्रवस्त्रावृता।', transliteration: 'Ya Kundendu Tushara Hara Dhavala, Ya Shubhra Vastravrita', translation: 'She who is as white as the jasmine, moon and snow, clothed in radiant white.' },
  },
];

export function getDeity(id: string): Deity | undefined {
  return DEITIES.find((d) => d.id === id);
}
