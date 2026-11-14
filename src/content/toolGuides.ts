/**
 * Guides linked from each tool page: tool slug -> the articles that name it in `relatedToolSlugs`,
 * in the blog's own order. Kept as a small table so a tool page does not have to download every
 * article to list a few titles. tests/toolContent.test.ts fails if this drifts from the articles.
 */
export interface ToolGuide { slug: string; title: string }

export const TOOL_GUIDES: Record<string, ToolGuide[]> = {
  astrology: [
    { slug: 'vedic-vs-western-astrology', title: 'Vedic vs Western Astrology: Why Your Moon Sign Might Be Different' },
    { slug: 'vedic-chakras-jyotish-navagraha-connection', title: 'Vedic Chakras: How the Chakra System Connects to Jyotish and the Navagraha' },
  ],
  biorhythm: [
    { slug: 'what-are-biorhythms-explained', title: 'What Are Biorhythms? Your Physical, Emotional & Intellectual Cycles' },
    { slug: 'how-to-calculate-biorhythm-cycles', title: 'How to Calculate Your Biorhythm Cycles: A Step-by-Step Guide' },
    { slug: 'biorhythm-compatibility-between-two-people', title: 'Biorhythm Compatibility: Comparing Cycles Between Two People' },
  ],
  'chakra-assessment': [
    { slug: 'seven-chakras-beginners-guide', title: "The 7 Chakras: A Beginner's Guide to Your Body's Energy Centers" },
    { slug: 'chakras-101-complete-guide', title: "Chakras 101: The Complete Guide to Your Body's Energy Centers" },
    { slug: 'seven-chakras-chart-colors-symbols-mantras', title: 'The 7 Chakras Chart: Colors, Symbols, Mantras & Meanings' },
    { slug: 'all-7-chakras-functions-blockages-healing', title: 'All 7 Chakras Explained: Functions, Blockages & Healing Practices' },
    { slug: 'what-is-a-chakra-meaning-origin', title: 'What Is a Chakra? Meaning, Origin & How the System Developed' },
    { slug: 'chakras-subtle-body-prana-flow', title: 'The Chakras and the Subtle Body: How Prana Flows Through You' },
    { slug: '7-chakras-daily-balancing-practice', title: 'A Simple Daily Practice to Balance All 7 Chakras' },
    { slug: 'chakra-information-reference-guide', title: 'Chakra Information: A Complete Reference Guide to All 7 Centers' },
    { slug: 'what-are-chakras-used-for-benefits-myths', title: 'What Are Chakras Used For? Benefits, Myths & Misconceptions' },
    { slug: 'what-are-the-7-chakras-simple-definitions', title: 'What Are the 7 Chakras? Simple Definitions for Each One' },
    { slug: 'vedic-chakras-jyotish-navagraha-connection', title: 'Vedic Chakras: How the Chakra System Connects to Jyotish and the Navagraha' },
    { slug: 'chakra-meditation-guided-script-seven-centers', title: 'Chakra Meditation for Beginners: A Guided Script for All 7 Centers' },
    { slug: 'chakra-visualization-meditation-techniques', title: 'How to Meditate on Your Chakras: Visualization Techniques for Each Center' },
    { slug: 'walking-meditation-root-chakra-grounding', title: 'Walking Meditation and the Root Chakra: Grounding Practices Beyond Sitting' },
  ],
  'chakra-frequency-player': [
    { slug: 'chakra-meditation-guided-script-seven-centers', title: 'Chakra Meditation for Beginners: A Guided Script for All 7 Centers' },
    { slug: 'chakra-sound-healing-solfeggio-frequencies', title: 'Chakra Sound Healing: Do Solfeggio Frequencies Really Work?' },
  ],
  chaldean: [
    { slug: 'chaldean-numerology-explained', title: 'Chaldean Numerology Explained: The Ancient System Before Pythagoras' },
  ],
  crystals: [
    { slug: 'seven-chakras-beginners-guide', title: "The 7 Chakras: A Beginner's Guide to Your Body's Energy Centers" },
    { slug: 'chakras-101-complete-guide', title: "Chakras 101: The Complete Guide to Your Body's Energy Centers" },
    { slug: 'seven-chakras-chart-colors-symbols-mantras', title: 'The 7 Chakras Chart: Colors, Symbols, Mantras & Meanings' },
    { slug: 'all-7-chakras-functions-blockages-healing', title: 'All 7 Chakras Explained: Functions, Blockages & Healing Practices' },
    { slug: 'what-is-a-chakra-meaning-origin', title: 'What Is a Chakra? Meaning, Origin & How the System Developed' },
    { slug: '7-chakras-daily-balancing-practice', title: 'A Simple Daily Practice to Balance All 7 Chakras' },
    { slug: 'chakra-information-reference-guide', title: 'Chakra Information: A Complete Reference Guide to All 7 Centers' },
    { slug: 'what-are-chakras-used-for-benefits-myths', title: 'What Are Chakras Used For? Benefits, Myths & Misconceptions' },
    { slug: 'what-are-the-7-chakras-simple-definitions', title: 'What Are the 7 Chakras? Simple Definitions for Each One' },
    { slug: 'chakra-visualization-meditation-techniques', title: 'How to Meditate on Your Chakras: Visualization Techniques for Each Center' },
  ],
  'kundali-matching': [
    { slug: 'numerology-compatibility-life-path', title: 'Numerology Compatibility: How Life Path Numbers Affect Relationships' },
  ],
  kundalini: [
    { slug: 'seven-chakras-beginners-guide', title: "The 7 Chakras: A Beginner's Guide to Your Body's Energy Centers" },
    { slug: 'chakras-101-complete-guide', title: "Chakras 101: The Complete Guide to Your Body's Energy Centers" },
    { slug: 'seven-chakras-chart-colors-symbols-mantras', title: 'The 7 Chakras Chart: Colors, Symbols, Mantras & Meanings' },
    { slug: 'all-7-chakras-functions-blockages-healing', title: 'All 7 Chakras Explained: Functions, Blockages & Healing Practices' },
    { slug: 'what-is-a-chakra-meaning-origin', title: 'What Is a Chakra? Meaning, Origin & How the System Developed' },
    { slug: 'chakras-subtle-body-prana-flow', title: 'The Chakras and the Subtle Body: How Prana Flows Through You' },
    { slug: '7-chakras-daily-balancing-practice', title: 'A Simple Daily Practice to Balance All 7 Chakras' },
    { slug: 'chakra-information-reference-guide', title: 'Chakra Information: A Complete Reference Guide to All 7 Centers' },
    { slug: 'what-are-chakras-used-for-benefits-myths', title: 'What Are Chakras Used For? Benefits, Myths & Misconceptions' },
    { slug: 'what-are-the-7-chakras-simple-definitions', title: 'What Are the 7 Chakras? Simple Definitions for Each One' },
    { slug: 'chakra-meditation-guided-script-seven-centers', title: 'Chakra Meditation for Beginners: A Guided Script for All 7 Centers' },
    { slug: 'chakra-visualization-meditation-techniques', title: 'How to Meditate on Your Chakras: Visualization Techniques for Each Center' },
    { slug: 'walking-meditation-root-chakra-grounding', title: 'Walking Meditation and the Root Chakra: Grounding Practices Beyond Sitting' },
  ],
  'life-path': [
    { slug: 'life-path-number-guide-2026', title: 'Life Path Number Calculator: Full 2026 Guide to Meaning & Master Numbers' },
    { slug: 'numerology-compatibility-life-path', title: 'Numerology Compatibility: How Life Path Numbers Affect Relationships' },
    { slug: 'how-to-calculate-master-number', title: 'How to Calculate a Master Number in Numerology (Step-by-Step)' },
  ],
  'loshu-grid': [
    { slug: 'loshu-grid-explained', title: 'Lo Shu Grid Explained: Reading Your Birth-Date Magic Square' },
  ],
  'mantra-timer': [
    { slug: 'start-daily-spiritual-practice-sadhana', title: 'How to Start a Daily Spiritual Practice (Sadhana) That Actually Sticks' },
    { slug: 'navagraha-remedies-mantras-gemstones-rituals', title: 'Navagraha Remedies: Mantras, Gemstones & Rituals for the 9 Planets' },
    { slug: 'chakra-meditation-guided-script-seven-centers', title: 'Chakra Meditation for Beginners: A Guided Script for All 7 Centers' },
    { slug: 'best-time-to-meditate-morning-vs-evening', title: 'Best Time to Meditate: Morning vs Evening Practice' },
    { slug: 'chakra-sound-healing-solfeggio-frequencies', title: 'Chakra Sound Healing: Do Solfeggio Frequencies Really Work?' },
  ],
  'mobile-numerology': [
    { slug: 'mobile-number-numerology', title: "Mobile Number Numerology: Does Your Phone Number's Vibration Matter?" },
  ],
  muhurta: [
    { slug: 'panchang-101-tithi-nakshatra', title: 'Panchang 101: Tithi, Nakshatra, Yoga & Karana Explained' },
    { slug: 'best-time-to-meditate-morning-vs-evening', title: 'Best Time to Meditate: Morning vs Evening Practice' },
  ],
  nakshatra: [
    { slug: 'nakshatras-explained-27-lunar-mansions', title: 'Nakshatras Explained: The 27 Lunar Mansions of Vedic Astrology' },
  ],
  numerology: [
    { slug: 'life-path-number-guide-2026', title: 'Life Path Number Calculator: Full 2026 Guide to Meaning & Master Numbers' },
    { slug: 'how-to-calculate-master-number', title: 'How to Calculate a Master Number in Numerology (Step-by-Step)' },
  ],
  'planet-mandala': [
    { slug: 'navagraha-nine-planets-guide', title: 'The Navagraha: Meet the Nine Planets of Vedic Astrology' },
    { slug: 'vedic-chakras-jyotish-navagraha-connection', title: 'Vedic Chakras: How the Chakra System Connects to Jyotish and the Navagraha' },
    { slug: 'navagraha-remedies-mantras-gemstones-rituals', title: 'Navagraha Remedies: Mantras, Gemstones & Rituals for the 9 Planets' },
  ],
  'planetary-hours': [
    { slug: 'panchang-101-tithi-nakshatra', title: 'Panchang 101: Tithi, Nakshatra, Yoga & Karana Explained' },
  ],
  pranayama: [
    { slug: 'pranayama-for-beginners', title: 'Pranayama for Beginners: 5 Breathing Techniques to Calm Your Mind' },
    { slug: 'walking-meditation-root-chakra-grounding', title: 'Walking Meditation and the Root Chakra: Grounding Practices Beyond Sitting' },
  ],
  'puja-aarti': [
    { slug: 'ekadashi-fasting-guide', title: 'Ekadashi Fasting Guide: Dates, Rules & the Spiritual Meaning of Vrat' },
    { slug: 'navagraha-remedies-mantras-gemstones-rituals', title: 'Navagraha Remedies: Mantras, Gemstones & Rituals for the 9 Planets' },
  ],
  sadhana: [
    { slug: 'start-daily-spiritual-practice-sadhana', title: 'How to Start a Daily Spiritual Practice (Sadhana) That Actually Sticks' },
    { slug: 'best-time-to-meditate-morning-vs-evening', title: 'Best Time to Meditate: Morning vs Evening Practice' },
  ],
  soundbath: [
    { slug: 'pranayama-for-beginners', title: 'Pranayama for Beginners: 5 Breathing Techniques to Calm Your Mind' },
    { slug: 'chakra-sound-healing-solfeggio-frequencies', title: 'Chakra Sound Healing: Do Solfeggio Frequencies Really Work?' },
  ],
  tarot: [
    { slug: 'daily-card-contemplation-ritual', title: 'Daily Card Contemplation: A Simple Reflection Ritual for Beginners' },
  ],
  tratak: [
    { slug: 'pranayama-for-beginners', title: 'Pranayama for Beginners: 5 Breathing Techniques to Calm Your Mind' },
  ],
  urdhva: [
    { slug: 'urdhvaretas-brahmacharya-yogic-view', title: 'Ūrdhvaretas & Brahmacharya: The Yogic View of Sexual Energy and Willpower' },
  ],
  vastu: [
    { slug: 'vastu-shastra-basics', title: 'Vastu Shastra Basics: The Best Direction for Every Room in Your Home' },
  ],
  'vrat-calendar': [
    { slug: 'panchang-101-tithi-nakshatra', title: 'Panchang 101: Tithi, Nakshatra, Yoga & Karana Explained' },
    { slug: 'ekadashi-fasting-guide', title: 'Ekadashi Fasting Guide: Dates, Rules & the Spiritual Meaning of Vrat' },
  ],
  yantra: [
    { slug: 'what-is-a-yantra-sacred-geometry', title: 'What Is a Yantra? Sacred Geometry and the Math Behind the Sri Yantra' },
  ],
};

/** Guides for one tool, capped for display. */
export function guidesFor(toolSlug: string, limit = 4): ToolGuide[] {
  return (TOOL_GUIDES[toolSlug] ?? []).slice(0, limit);
}
