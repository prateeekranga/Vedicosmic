export interface Mantra {
  id: string;
  name: string;
  devanagari: string;
  transliteration: string;
  deity: string;
  purpose: string;
  meaning: string;
}

export const MANTRAS: Mantra[] = [
  { id: 'gayatri', name: 'Gayatri Mantra', devanagari: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्', transliteration: 'Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat', deity: 'Savitr (Solar)', purpose: 'Illumination of the intellect', meaning: 'We meditate on the radiant light of the divine Sun; may it illuminate our minds and awaken our highest understanding.' },
  { id: 'shivaya', name: 'Om Namah Shivaya', devanagari: 'ॐ नमः शिवाय', transliteration: 'Om Namah Shivaya', deity: 'Shiva', purpose: 'Devotion & inner stillness', meaning: 'I bow to the auspicious inner Self — Shiva, the pure consciousness within all things.' },
  { id: 'mrityunjaya', name: 'Maha Mrityunjaya', devanagari: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्', transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam', deity: 'Shiva (Rudra)', purpose: 'Healing & protection', meaning: 'We worship the three-eyed one who nourishes all beings; may he free us from the bondage of fear, as a ripe fruit falls easily from the vine.' },
  { id: 'mani-padme', name: 'Om Mani Padme Hum', devanagari: 'ॐ मणि पद्मे हूँ', transliteration: 'Om Mani Padme Hum', deity: 'Avalokiteshvara', purpose: 'Compassion', meaning: 'The jewel is in the lotus — the awakening of compassion and wisdom within the heart.' },
  { id: 'saraswati', name: 'Saraswati Mantra', devanagari: 'ॐ ऐं सरस्वत्यै नमः', transliteration: 'Om Aim Saraswatyai Namah', deity: 'Saraswati', purpose: 'Knowledge & arts', meaning: 'I bow to Saraswati, goddess of wisdom, speech, music, and learning.' },
  { id: 'shanti', name: 'Shanti Mantra', devanagari: 'ॐ शान्तिः शान्तिः शान्तिः', transliteration: 'Om Shanti Shanti Shanti', deity: 'Universal', purpose: 'Peace', meaning: 'May there be peace in body, peace in mind, and peace in spirit — peace, peace, peace.' },
  { id: 'durga', name: 'Durga Mantra', devanagari: 'ॐ दुं दुर्गायै नमः', transliteration: 'Om Dum Durgayei Namah', deity: 'Durga', purpose: 'Strength & courage', meaning: 'I invoke Durga, the fierce and protective mother, source of inner strength and courage.' },
  { id: 'hare-krishna', name: 'Hare Krishna Maha-Mantra', devanagari: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे', transliteration: 'Hare Krishna Hare Krishna, Krishna Krishna Hare Hare', deity: 'Krishna', purpose: 'Devotion & joy', meaning: 'A joyful invocation of the divine names, dissolving the heart into love and bliss.' },
];
