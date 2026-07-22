/**
 * The 27 nakshatras (lunar mansions) — shared by `NakshatraTool.tsx` and the
 * Kundali Matching tool's Ashtakoot (Guna Milan) scoring. `gana`, `yoniIndex`
 * and `nadi` are the classical Ashtakoot classifications; everything else
 * (`ruler`, `deity`, `symbol`, `trait`) is unchanged from the original data.
 */
export interface NakshatraInfo {
  n: number; name: string; dev: string; ruler: string; deity: string; symbol: string; trait: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoniIndex: number;
  nadi: 'Aadi' | 'Madhya' | 'Antya';
}

export const YONI_NAMES = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat',
  'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion',
];

export const NAKSHATRAS: NakshatraInfo[] = [
  { n: 1, name: 'Ashwini', dev: 'अश्विनी', ruler: 'Ketu', deity: 'Ashvini Kumaras', symbol: 'Horse’s head', trait: 'Swift, healing, pioneering energy', gana: 'Deva', yoniIndex: 0, nadi: 'Aadi' },
  { n: 2, name: 'Bharani', dev: 'भरणी', ruler: 'Venus', deity: 'Yama', symbol: 'Yoni', trait: 'Bearing, transformation, fierce creativity', gana: 'Manushya', yoniIndex: 1, nadi: 'Madhya' },
  { n: 3, name: 'Krittika', dev: 'कृत्तिका', ruler: 'Sun', deity: 'Agni', symbol: 'Razor · flame', trait: 'Sharp, purifying, cutting through illusion', gana: 'Rakshasa', yoniIndex: 2, nadi: 'Antya' },
  { n: 4, name: 'Rohini', dev: 'रोहिणी', ruler: 'Moon', deity: 'Prajapati', symbol: 'Ox cart', trait: 'Fertile, magnetic, lover of beauty', gana: 'Manushya', yoniIndex: 3, nadi: 'Antya' },
  { n: 5, name: 'Mrigashira', dev: 'मृगशिरा', ruler: 'Mars', deity: 'Soma', symbol: 'Deer’s head', trait: 'Gentle, curious, forever searching', gana: 'Deva', yoniIndex: 3, nadi: 'Madhya' },
  { n: 6, name: 'Ardra', dev: 'आर्द्रा', ruler: 'Rahu', deity: 'Rudra', symbol: 'Teardrop', trait: 'Storm and renewal, intensity of feeling', gana: 'Manushya', yoniIndex: 4, nadi: 'Aadi' },
  { n: 7, name: 'Punarvasu', dev: 'पुनर्वसु', ruler: 'Jupiter', deity: 'Aditi', symbol: 'Quiver of arrows', trait: 'Return of light, optimism, restoration', gana: 'Deva', yoniIndex: 5, nadi: 'Aadi' },
  { n: 8, name: 'Pushya', dev: 'पुष्य', ruler: 'Saturn', deity: 'Brihaspati', symbol: 'Cow’s udder · lotus', trait: 'Nourishing, dutiful, deeply auspicious', gana: 'Deva', yoniIndex: 2, nadi: 'Madhya' },
  { n: 9, name: 'Ashlesha', dev: 'आश्लेषा', ruler: 'Mercury', deity: 'The Nagas', symbol: 'Coiled serpent', trait: 'Hypnotic insight, mystic depth', gana: 'Rakshasa', yoniIndex: 5, nadi: 'Antya' },
  { n: 10, name: 'Magha', dev: 'मघा', ruler: 'Ketu', deity: 'The Pitris', symbol: 'Royal throne', trait: 'Ancestral power, dignity, leadership', gana: 'Rakshasa', yoniIndex: 6, nadi: 'Antya' },
  { n: 11, name: 'Purva Phalguni', dev: 'पूर्व फाल्गुनी', ruler: 'Venus', deity: 'Bhaga', symbol: 'Hammock', trait: 'Pleasure, art, generous romance', gana: 'Manushya', yoniIndex: 6, nadi: 'Madhya' },
  { n: 12, name: 'Uttara Phalguni', dev: 'उत्तर फाल्गुनी', ruler: 'Sun', deity: 'Aryaman', symbol: 'Bed posts', trait: 'Noble alliances, patronage, loyalty', gana: 'Manushya', yoniIndex: 7, nadi: 'Aadi' },
  { n: 13, name: 'Hasta', dev: 'हस्त', ruler: 'Moon', deity: 'Savitar', symbol: 'Open hand', trait: 'Skilful hands, wit, craftsmanship', gana: 'Deva', yoniIndex: 8, nadi: 'Aadi' },
  { n: 14, name: 'Chitra', dev: 'चित्रा', ruler: 'Mars', deity: 'Vishvakarma', symbol: 'Shining pearl', trait: 'Brilliant design, charisma, artistry', gana: 'Rakshasa', yoniIndex: 9, nadi: 'Madhya' },
  { n: 15, name: 'Swati', dev: 'स्वाति', ruler: 'Rahu', deity: 'Vayu', symbol: 'Shoot in the wind', trait: 'Independence, flexibility, diplomacy', gana: 'Deva', yoniIndex: 8, nadi: 'Antya' },
  { n: 16, name: 'Vishakha', dev: 'विशाखा', ruler: 'Jupiter', deity: 'Indra-Agni', symbol: 'Triumphal arch', trait: 'One-pointed purpose, determination', gana: 'Rakshasa', yoniIndex: 9, nadi: 'Antya' },
  { n: 17, name: 'Anuradha', dev: 'अनुराधा', ruler: 'Saturn', deity: 'Mitra', symbol: 'Lotus', trait: 'Devoted friendship, success abroad', gana: 'Deva', yoniIndex: 10, nadi: 'Madhya' },
  { n: 18, name: 'Jyeshtha', dev: 'ज्येष्ठा', ruler: 'Mercury', deity: 'Indra', symbol: 'Earring · umbrella', trait: 'Protective seniority, hidden power', gana: 'Rakshasa', yoniIndex: 10, nadi: 'Aadi' },
  { n: 19, name: 'Mula', dev: 'मूल', ruler: 'Ketu', deity: 'Nirriti', symbol: 'Bundle of roots', trait: 'Digging to the root, radical truth', gana: 'Rakshasa', yoniIndex: 4, nadi: 'Aadi' },
  { n: 20, name: 'Purva Ashadha', dev: 'पूर्वाषाढ़ा', ruler: 'Venus', deity: 'Apas', symbol: 'Winnowing fan', trait: 'Early, invincible victory, purification', gana: 'Manushya', yoniIndex: 11, nadi: 'Madhya' },
  { n: 21, name: 'Uttara Ashadha', dev: 'उत्तराषाढ़ा', ruler: 'Sun', deity: 'The Vishvadevas', symbol: 'Elephant tusk', trait: 'Lasting victory, universal ideals', gana: 'Manushya', yoniIndex: 12, nadi: 'Antya' },
  { n: 22, name: 'Shravana', dev: 'श्रवण', ruler: 'Moon', deity: 'Vishnu', symbol: 'Ear · three steps', trait: 'Sacred listening, learning, connection', gana: 'Deva', yoniIndex: 11, nadi: 'Antya' },
  { n: 23, name: 'Dhanishta', dev: 'धनिष्ठा', ruler: 'Mars', deity: 'The Eight Vasus', symbol: 'Drum', trait: 'Abundant rhythm, wealth, music', gana: 'Rakshasa', yoniIndex: 13, nadi: 'Madhya' },
  { n: 24, name: 'Shatabhisha', dev: 'शतभिषा', ruler: 'Rahu', deity: 'Varuna', symbol: 'Empty circle', trait: 'A hundred healers — mystery, medicine', gana: 'Rakshasa', yoniIndex: 0, nadi: 'Aadi' },
  { n: 25, name: 'Purva Bhadrapada', dev: 'पूर्व भाद्रपद', ruler: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Sword · front of a cot', trait: 'Fiery intensity, radical idealism', gana: 'Manushya', yoniIndex: 13, nadi: 'Aadi' },
  { n: 26, name: 'Uttara Bhadrapada', dev: 'उत्तर भाद्रपद', ruler: 'Saturn', deity: 'Ahirbudhnya', symbol: 'Back of a cot', trait: 'Deep serenity, the serpent of the deep', gana: 'Manushya', yoniIndex: 7, nadi: 'Madhya' },
  { n: 27, name: 'Revati', dev: 'रेवती', ruler: 'Mercury', deity: 'Pushan', symbol: 'Fish · drum', trait: 'Safe journeys, completion, compassion', gana: 'Deva', yoniIndex: 1, nadi: 'Antya' },
];

export const RULER_COLOR: Record<string, string> = {
  Ketu: '#94A3B8', Venus: '#F9A8D4', Sun: '#FBBF24', Moon: '#E2E8F0', Mars: '#F87171',
  Rahu: '#818CF8', Jupiter: '#FDE047', Saturn: '#60A5FA', Mercury: '#34D399',
};
