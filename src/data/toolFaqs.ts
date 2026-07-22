import type { FAQItem } from '@/types/content.types';

/** Shown on every tool page — the two questions any first-time visitor actually has. */
const UNIVERSAL_FAQS: FAQItem[] = [
  { id: 'universal-free', header: 'Is this tool free to use?', body: 'Yes — every tool on VediCosmic is completely free, with no sign-up required. An optional free account lets you save your results and track progress across visits.' },
  { id: 'universal-privacy', header: 'Is my personal data stored or shared?', body: 'No. All calculations run entirely in your browser — your name, birth details and results are never sent to a server unless you choose to save them to your own free account.' },
];

const TOOL_SPECIFIC_FAQS: Record<string, FAQItem[]> = {
  numerology: [
    { id: 'numerology-system', header: 'Which numerology system does the Blueprint use?', body: 'The Numerology Blueprint uses the Pythagorean system for your core numbers (Life Path, Expression, Soul Urge, Personality) and layers in the classical Lo Shu grid and Kua number from Vedic/Chinese numerology — giving you both traditions in one reading.' },
  ],
  'mobile-numerology': [
    { id: 'mobile-calc', header: "How is a mobile number's numerology calculated?", body: "We sum every digit of your phone number down to a single root number (like a Life Path number), then check for repeating digit pairs and how that root number aligns with your personal Life Path number — all computed instantly in your browser." },
  ],
  'loshu-grid': [
    { id: 'loshu-arrows', header: 'What do the arrows in a Lo Shu Grid mean?', body: "Certain combinations of filled cells form 'arrows' — straight or diagonal lines of numbers present in your grid — each representing a specific strength (like the Arrow of Determination) or, if the opposite cells are empty, a corresponding weakness to be mindful of." },
  ],
  chaldean: [
    { id: 'chaldean-vs-pythagorean', header: 'How is Chaldean numerology different from Pythagorean numerology?', body: "The Chaldean system assigns different number values to letters (based on ancient vibrational sound theory, and no letter maps to 9) and typically doesn't reduce the compound number before deriving meaning — giving a different, older reading than the more common Pythagorean method." },
  ],
  'life-path': [
    { id: 'life-path-calc', header: 'What is a Life Path number and how is it calculated?', body: 'Your Life Path number is found by reducing your full birth date — day, month and year — down to a single digit (or a master number 11, 22, 33), and is considered the most important number in numerology, describing your core purpose and life lessons.' },
  ],
  astrology: [
    { id: 'sidereal-vs-tropical', header: 'Why is my Vedic Moon sign different from my Western sun sign?', body: 'Vedic (Jyotish) astrology uses the sidereal zodiac, measured against the fixed stars, while Western astrology uses the tropical zodiac fixed to the seasons — the two have drifted about 24° apart due to the precession of the equinoxes, so your Vedic placements are often one sign earlier.' },
  ],
  'planetary-hours': [
    { id: 'hora-use', header: 'What are planetary hours (hora) used for?', body: "Each day and night is divided into 12 unequal 'hora' hours, each ruled by one of the seven classical planets — timing important activities (starting work, travel, ceremonies) to match a favourable planetary hour is a traditional practice in Vedic astrology (Muhurta)." },
  ],
  'planet-mandala': [
    { id: 'navagraha-what', header: 'What are the Navagraha in Vedic astrology?', body: 'The Navagraha are the nine "planets" of Vedic astrology — the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, plus the two lunar nodes Rahu and Ketu — each governing different areas of life and combining to shape a birth chart.' },
  ],
  'chakra-assessment': [
    { id: 'chakra-accuracy', header: 'How accurate is an online chakra assessment?', body: "This is a reflective self-assessment tool, not a medical or diagnostic instrument — it's designed to prompt honest self-inquiry about your energetic and emotional patterns, best used as a starting point for your own practice, not a clinical result." },
  ],
  'mantra-timer': [
    { id: 'why-108', header: 'Why 108 beads in a japa mala?', body: '108 is considered a sacred number across Vedic tradition — from the number of Upanishads to astronomical ratios between the Sun, Moon and Earth — and a mala of 108 beads lets you count a full round of mantra repetitions without losing track.' },
  ],
  tratak: [
    { id: 'tratak-benefits', header: 'What are the benefits of Trataka meditation?', body: 'Trataka, the ancient yogic gazing practice, is traditionally used to sharpen concentration, calm a restless mind, and strengthen the eyes — practised by steadily fixing the gaze on a single point until the eyes naturally moisten, then closing them to observe the afterimage.' },
  ],
  crystals: [
    { id: 'crystal-choice', header: 'How do I choose the right healing crystal?', body: "Start with your intention rather than the stone itself — decide what you're working on (calm, confidence, focus, protection) and use the intention filter to see which crystals are traditionally associated with that quality, then trust which one you're drawn to." },
  ],
  tarot: [
    { id: 'real-tarot', header: 'Is this a real tarot deck?', body: 'No — these are original contemplation cards inspired by Vedic themes rather than a traditional 78-card tarot deck, designed for daily reflection and self-inquiry rather than fortune-telling.' },
  ],
  yantra: [
    { id: 'yantra-vs-mandala', header: 'What is a yantra and how is it different from a mandala?', body: 'A yantra is a precise geometric diagram believed to be a channel for specific cosmic or deity energies, typically built from exact mathematical construction rules — where a mandala is a broader circular representation of the cosmos, a yantra is more like sacred engineering.' },
  ],
  biorhythm: [
    { id: 'biorhythm-calc', header: 'How is a biorhythm cycle calculated?', body: 'Each cycle is a simple sine wave starting from your birth date, with fixed periods of 23 days (physical), 28 days (emotional) and 33 days (intellectual) — the calculator plots each wave’s current position to show whether you’re in a high, low, or critical transition point today.' },
  ],
  vastu: [
    { id: 'vastu-imperfect-home', header: "What happens if my home doesn't match ideal Vastu directions?", body: 'Vastu Shastra offers traditional guidance, not a strict requirement — most homes have some directional compromises, and remedies (mirrors, colours, plants, decluttering) are traditionally used to soften an imperfect layout rather than requiring reconstruction.' },
  ],
  kundalini: [
    { id: 'kundalini-safety', header: 'Is it safe to practice Kundalini awakening on your own?', body: 'This tool is designed with grounding and gradual pacing as the priority, following a gentle three-stage breath method — but Kundalini practices are traditionally best explored gently, without forcing sensations, and alongside guidance from an experienced teacher if you feel intense or unusual effects.' },
  ],
  pranayama: [
    { id: 'pranayama-beginner', header: 'Which pranayama technique should a beginner start with?', body: 'Simple equal-ratio Box breathing (inhale-hold-exhale-hold in equal counts) is the gentlest starting point for most beginners — this coach lets you try all five techniques and feel which pace suits your own nervous system before progressing to more advanced ratios like Bhastrika.' },
  ],
  soundbath: [
    { id: 'soundbath-live', header: 'Is the sound bath music a recording or generated live?', body: 'Every layer is synthesised live in your browser using the Web Audio API, not played back from an audio file — meaning each session is a unique, endless soundscape you shape yourself, rather than a looping recording.' },
  ],
  muhurta: [
    { id: 'rahu-kaal', header: 'What is Rahu Kaal and why do people avoid starting things during it?', body: 'Rahu Kaal is a roughly 90-minute period each day, at a different time depending on the weekday, traditionally considered inauspicious for beginning new ventures — this finder computes its exact start and end time for your location from real sunrise and sunset.' },
  ],
  nakshatra: [
    { id: 'nakshatra-importance', header: 'What is a nakshatra and why does it matter in Vedic astrology?', body: 'A nakshatra is one of 27 lunar mansions the Moon passes through, considered in Vedic astrology to be even more personally revealing than your Moon sign (Rashi) alone — your janma nakshatra is traditionally used for naming ceremonies, muhurta timing, and marriage compatibility (Kundali matching).' },
  ],
  'kundali-matching': [
    { id: 'what-is-guna-milan', header: 'What is Ashtakoot (Guna Milan)?', body: 'Ashtakoot, or Guna Milan, is the classical Vedic system for matching two people’s birth Nakshatras across 8 factors — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi — worth 36 points in total, traditionally used to assess marriage compatibility.' },
    { id: 'good-score', header: 'What counts as a good Guna Milan score?', body: 'Traditionally: below 18 out of 36 is considered worth a thoughtful conversation, 18–24 a workable match, 25–32 a strong match, and 33–36 an excellent match — though the individual koota breakdown (especially Nadi) often matters more than the total alone.' },
    { id: 'manglik-check', header: 'Does this check Manglik (Mars) dosha?', body: "Not yet. A genuine Manglik check needs Mars' precise position, which needs a more careful planetary ephemeris than this site currently models — we'd rather leave it out than guess on a factor some families treat seriously. It's on the roadmap." },
  ],
  urdhva: [
    { id: 'urdhva-professional-help', header: 'Is this a substitute for professional help with compulsive behaviour?', body: "No — this tool offers grounding techniques and honest education for the moment of urge, but if the pull feels compulsive, talking to a counsellor, therapist or trusted elder alongside this practice is a sign of strength, not failure." },
  ],
  sadhana: [
    { id: 'sadhana-streak', header: 'What is a daily sadhana and why keep a streak?', body: "Sadhana means a consistent spiritual practice — the streak here isn't about perfection, it's a gentle visual reminder that small, repeated daily effort, even a few minutes, compounds into real transformation over time." },
  ],
  'vrat-calendar': [
    { id: 'ekadashi-calc', header: 'How are Ekadashi dates calculated?', body: "Ekadashi falls on the 11th tithi (lunar day) of each paksha (fortnight), determined by the real angular difference between the Sun and Moon — this calendar computes that difference live to find each upcoming Ekadashi, Purnima and Amavasya, not from a fixed yearly list." },
  ],
  'puja-aarti': [
    { id: 'virtual-puja', header: 'Can a virtual puja really replace a real one?', body: "Nothing replaces a physical shrine and real ritual objects, but this tool is designed for moments you can't reach one — a quiet ritual pause during travel, illness, or a busy day — using the same traditional structure, mantras and invocations as an in-person Aarti." },
  ],
};

export function getToolFaqs(toolId: string): FAQItem[] {
  return [...UNIVERSAL_FAQS, ...(TOOL_SPECIFIC_FAQS[toolId] ?? [])];
}
