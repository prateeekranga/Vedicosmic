import type { Course, Instructor } from '@/types/course.types';

const instructors: Record<string, Instructor> = {
  ananya: { id: 'i1', name: 'Acharya Ananya Devi', title: 'Vedic Astrologer & Jyotish Teacher', initials: 'AD', rating: 4.9, courseCount: 3, studentCount: 14200, bio: 'A Jyotish practitioner of two decades, Ananya bridges classical Parashari astrology with a clear, modern teaching style trusted by students across the world.' },
  rajan: { id: 'i2', name: 'Yogiraj Rajan Nath', title: 'Kundalini & Pranayama Master', initials: 'RN', rating: 4.8, courseCount: 2, studentCount: 9800, bio: 'Trained in the Himalayan tradition, Rajan teaches energy practices with an emphasis on safety, grounding, and steady, sustainable awakening.' },
  meera: { id: 'i3', name: 'Dr. Meera Iyer', title: 'Sacred Geometry & Mathematics', initials: 'MI', rating: 4.9, courseCount: 2, studentCount: 7600, bio: 'With a doctorate in mathematics and a lifelong study of yantra, Meera reveals the precise structures underlying ancient sacred forms.' },
  kabir: { id: 'i4', name: 'Pandit Kabir Sharma', title: 'Numerologist & Vedic Scholar', initials: 'KS', rating: 4.7, courseCount: 2, studentCount: 11300, bio: 'Kabir has read tens of thousands of charts, distilling Anka Shastra into a practical system anyone can learn and apply.' },
  leela: { id: 'i5', name: 'Leela Krishnan', title: 'Meditation & Mindfulness Guide', initials: 'LK', rating: 4.9, courseCount: 3, studentCount: 18900, bio: 'A gentle, widely loved teacher, Leela makes meditation and breathwork accessible to complete beginners and seasoned practitioners alike.' },
  vasanti: { id: 'i6', name: 'Vasanti Rao', title: 'Energy Healer & Chakra Therapist', initials: 'VR', rating: 4.8, courseCount: 1, studentCount: 6400, bio: 'Vasanti combines subtle-body theory with practical, embodied techniques for restoring energetic balance.' },
  harish: { id: 'i7', name: 'Sthapati Harish Menon', title: 'Vastu Shastra Consultant', initials: 'HM', rating: 4.7, courseCount: 1, studentCount: 5200, bio: 'A practising Vastu consultant and architect, Harish teaches the science of sacred space for homes and workplaces.' },
};

function mod(id: string, title: string, lessons: [string, 'video' | 'reading' | 'quiz' | 'practice', string, boolean, string?][], order: number) {
  return {
    id, title, order,
    lessons: lessons.map(([t, type, duration, isPreview, youtubeId], i) => ({
      id: `${id}-l${i}`, title: t, type, duration, isPreview, youtubeId,
    })),
  };
}

const reviews = (seed: string) => [
  { id: seed + '1', name: 'Priya S.', initials: 'PS', rating: 5, date: 'Apr 2026', text: 'Beautifully structured and genuinely deep. I finally understand concepts I’d struggled with for years.' },
  { id: seed + '2', name: 'Daniel R.', initials: 'DR', rating: 5, date: 'Mar 2026', text: 'The teaching is clear and never vague. Practical, grounded, and respectful of the tradition.' },
  { id: seed + '3', name: 'Aisha K.', initials: 'AK', rating: 4, date: 'Feb 2026', text: 'Loved the pacing and the visuals. Would happily take another course from this instructor.' },
];

export const COURSES: Course[] = [
  {
    id: 'c1', slug: 'intro-vedic-astrology', title: 'Introduction to Vedic Astrology',
    subtitle: 'Read the sky the way the rishis did', instructor: instructors.ananya,
    gradient: 'from-indigo-500/30 to-violet-chakra/20', glyph: '♃',
    level: 'Beginner', category: 'astrology', duration: '6 hrs', lessonCount: 18,
    rating: 4.9, reviewCount: 1240, enrollmentCount: 14200, price: 0, currency: 'INR',
    tags: ['Jyotish', 'Rashi', 'Navagraha'], isFeatured: true, publishedAt: '2026-01-12',
    description: 'Begin your journey into Jyotish, the "science of light." This foundational course teaches the sidereal zodiac, the twelve Rashis, the nine planets (Navagraha), and how to read the basic architecture of a birth chart with clarity and confidence.',
    whatYouLearn: ['The difference between sidereal and tropical zodiacs', 'The nature of all 12 Rashis and their rulers', 'The role of the Navagraha (nine planets)', 'How houses (bhavas) shape a life', 'How to read a basic birth chart'],
    requirements: ['No prior knowledge needed', 'Curiosity and an open mind'],
    modules: [
      mod('c1m1', 'Foundations of Jyotish', [['Welcome & the science of light', 'video', '12 min', true], ['Sidereal vs tropical zodiac', 'video', '18 min', true], ['The precession of the equinoxes', 'reading', '10 min', false]], 1),
      mod('c1m2', 'The Twelve Rashis', [['Fire & earth signs', 'video', '22 min', false], ['Air & water signs', 'video', '20 min', false], ['Knowledge check', 'quiz', '8 min', false]], 2),
      mod('c1m3', 'The Navagraha', [['The luminaries: Sun & Moon', 'video', '24 min', false], ['The five tara grahas', 'video', '26 min', false], ['Rahu & Ketu: the shadow nodes', 'video', '19 min', false], ['Chart reading practice', 'practice', '30 min', false]], 3),
    ],
    reviews: reviews('c1r'),
  },
  {
    id: 'c2', slug: 'kundalini-awakening', title: 'Kundalini Awakening — A Safe Path',
    subtitle: 'Awaken your energy with grounding and care', instructor: instructors.rajan,
    gradient: 'from-error/25 to-warning/20', glyph: '🜂',
    level: 'Beginner', category: 'kundalini', duration: '8 hrs', lessonCount: 22,
    rating: 4.8, reviewCount: 890, enrollmentCount: 9800, price: 999, currency: 'INR',
    tags: ['Kundalini', 'Pranayama', 'Energy'], isFeatured: true, publishedAt: '2026-02-03',
    description: 'A grounded, safety-first introduction to Kundalini — the dormant energy at the base of the spine. Learn preparatory practices, breathwork, and gentle techniques to awaken energy steadily, without the overwhelm that comes from rushing.',
    whatYouLearn: ['What Kundalini is — and the myths around it', 'Foundational pranayama for safe awakening', 'How to prepare the nervous system', 'Grounding practices for integration', 'Signs of progress and how to pace yourself'],
    requirements: ['Able to sit comfortably for 15 minutes', 'A quiet, private space to practise'],
    modules: [
      mod('c2m1', 'Understanding Kundalini', [['What Kundalini really is', 'video', '16 min', true], ['Safety first: why grounding matters', 'video', '14 min', true]], 1),
      mod('c2m2', 'Preparing the Body', [['Foundational pranayama', 'video', '28 min', false], ['Nadi shodhana (alternate-nostril breath)', 'practice', '20 min', false], ['Building a daily base', 'reading', '12 min', false]], 2),
      mod('c2m3', 'Gentle Awakening', [['Awakening practice 1', 'practice', '25 min', false], ['Integration & grounding', 'video', '22 min', false], ['Self-assessment', 'quiz', '10 min', false]], 3),
    ],
    reviews: reviews('c2r'),
  },
  {
    id: 'c3', slug: 'sacred-geometry-yantras', title: 'Sacred Geometry & Yantras',
    subtitle: 'The mathematics of the divine', instructor: instructors.meera,
    gradient: 'from-gold-bright/25 to-brand-cyan/15', glyph: '✶',
    level: 'Intermediate', category: 'sacred-geometry', duration: '10 hrs', lessonCount: 26,
    rating: 4.9, reviewCount: 670, enrollmentCount: 7600, price: 1499, currency: 'INR',
    tags: ['Sri Yantra', 'Geometry', 'Golden Ratio'], isFeatured: false, publishedAt: '2026-01-28',
    description: 'Discover the precise mathematics hidden inside sacred forms. From the Sri Yantra to the golden ratio, this course reveals how geometry encodes meaning — and teaches you to construct and meditate upon these patterns yourself.',
    whatYouLearn: ['Construct the Seed and Flower of Life', 'The mathematics of the Sri Yantra', 'The golden ratio φ in nature and art', 'The five Platonic solids and the elements', 'How to use yantra in meditation'],
    requirements: ['Comfort with basic geometry', 'Compass and ruler (optional, for practice)'],
    modules: [
      mod('c3m1', 'First Principles', [['Why geometry is sacred', 'video', '15 min', true], ['Point, line, and the Vesica Piscis', 'video', '20 min', true]], 1),
      mod('c3m2', 'Building the Patterns', [['Seed of Life construction', 'practice', '25 min', false], ['Flower of Life & Metatron’s Cube', 'video', '24 min', false], ['The golden ratio φ', 'video', '22 min', false]], 2),
      mod('c3m3', 'The Sri Yantra', [['Anatomy of the Sri Yantra', 'video', '28 min', false], ['Meditation with yantra', 'practice', '20 min', false], ['Final reflection', 'quiz', '10 min', false]], 3),
    ],
    reviews: reviews('c3r'),
  },
  {
    id: 'c4', slug: 'numerology-mastery', title: 'Numerology Mastery',
    subtitle: 'Decode the language of numbers', instructor: instructors.kabir,
    gradient: 'from-brand-cyan/25 to-teal-cosmic/20', glyph: '九',
    level: 'Intermediate', category: 'numerology', duration: '9 hrs', lessonCount: 24,
    rating: 4.7, reviewCount: 1010, enrollmentCount: 11300, price: 1299, currency: 'INR',
    tags: ['Anka Shastra', 'Life Path', 'Name Analysis'], isFeatured: true, publishedAt: '2026-02-14',
    description: 'Master Anka Shastra, the Vedic science of numbers. Learn to calculate and interpret the core numbers — Life Path, Expression, Soul Urge — and read names, dates, and even phone numbers as numeric signatures.',
    whatYouLearn: ['Calculate all core numerology numbers', 'Interpret numbers 1–9 and the master numbers', 'Analyse names and birth dates', 'Read compatibility between numbers', 'Apply numerology to real-life decisions'],
    requirements: ['No prior knowledge required', 'A calculator helps (or just paper)'],
    modules: [
      mod('c4m1', 'The Numeric Universe', [['Pythagoras & Anka Shastra', 'video', '14 min', true], ['Reduction & master numbers', 'video', '18 min', true]], 1),
      mod('c4m2', 'The Core Numbers', [['Life Path Number', 'video', '22 min', false], ['Expression & Soul Urge', 'video', '24 min', false], ['Personality Number', 'video', '16 min', false]], 2),
      mod('c4m3', 'Applied Numerology', [['Compatibility & relationships', 'video', '20 min', false], ['Mobile-number analysis', 'practice', '18 min', false], ['Reading practice', 'quiz', '12 min', false]], 3),
    ],
    reviews: reviews('c4r'),
  },
  {
    id: 'c5', slug: 'meditation-pranayama', title: 'Meditation & Pranayama Foundations',
    subtitle: 'Find the stillness beneath the noise', instructor: instructors.leela,
    gradient: 'from-teal-cosmic/25 to-brand-cyan/15', glyph: 'ॐ',
    level: 'Beginner', category: 'meditation', duration: '5 hrs', lessonCount: 16,
    rating: 4.9, reviewCount: 2100, enrollmentCount: 18900, price: 0, currency: 'INR',
    tags: ['Meditation', 'Breathwork', 'Mindfulness'], isFeatured: true, publishedAt: '2026-01-05',
    description: 'A warm, beginner-friendly foundation in meditation and breathwork. Build a sustainable daily practice, learn classical pranayama techniques, and discover the stillness that has always been available to you.',
    whatYouLearn: ['Establish a simple daily meditation habit', 'Classical pranayama techniques', 'Work skilfully with a busy mind', 'Body-based grounding practices', 'How to deepen practice over time'],
    requirements: ['No experience needed', 'A few quiet minutes each day'],
    modules: [
      mod('c5m1', 'Beginning to Sit', [['What meditation actually is', 'video', '12 min', true, 'inpok4MKVLM'], ['Posture & breath basics', 'video', '15 min', true], ['Your first 5-minute sit', 'practice', '6 min', true]], 1),
      mod('c5m2', 'The Breath', [['Diaphragmatic breathing', 'video', '14 min', false], ['Nadi shodhana', 'practice', '12 min', false], ['Ujjayi breath', 'video', '12 min', false]], 2),
      mod('c5m3', 'A Lasting Practice', [['Working with a busy mind', 'video', '18 min', false], ['Building consistency', 'reading', '10 min', false]], 3),
    ],
    reviews: reviews('c5r'),
  },
  {
    id: 'c6', slug: 'chakra-healing', title: 'Chakra Healing & Balancing',
    subtitle: 'Restore the flow of your energy', instructor: instructors.vasanti,
    gradient: 'from-violet-chakra/25 to-error/15', glyph: '☸',
    level: 'Intermediate', category: 'chakras', duration: '7 hrs', lessonCount: 21,
    rating: 4.8, reviewCount: 540, enrollmentCount: 6400, price: 1199, currency: 'INR',
    tags: ['Chakras', 'Energy Healing', 'Subtle Body'], isFeatured: false, publishedAt: '2026-02-20',
    description: 'A complete tour of the seven-chakra system and how to restore balance to each. Combine subtle-body theory with practical techniques — sound, movement, food, and meditation — to bring your energy centres into harmony.',
    whatYouLearn: ['The function of all 7 chakras', 'How to assess your own energy balance', 'Bija mantras and sound healing', 'Yoga and food for each chakra', 'A complete chakra-balancing routine'],
    requirements: ['Basic familiarity with meditation helps', 'Open, curious attitude'],
    modules: [
      mod('c6m1', 'The Subtle Body', [['Map of the chakra system', 'video', '16 min', true], ['How energy moves & blocks', 'video', '18 min', true]], 1),
      mod('c6m2', 'Lower Chakras', [['Root, Sacral & Solar Plexus', 'video', '26 min', false], ['Bija mantras for grounding', 'practice', '15 min', false]], 2),
      mod('c6m3', 'Upper Chakras & Integration', [['Heart, Throat, Third Eye, Crown', 'video', '28 min', false], ['Full balancing routine', 'practice', '24 min', false], ['Self-assessment', 'quiz', '10 min', false]], 3),
    ],
    reviews: reviews('c6r'),
  },
  {
    id: 'c7', slug: 'vastu-shastra', title: 'Vastu Shastra — Sacred Space Design',
    subtitle: 'Align your space with cosmic order', instructor: instructors.harish,
    gradient: 'from-warning/25 to-gold-bright/15', glyph: '卍',
    level: 'Advanced', category: 'vastu', duration: '12 hrs', lessonCount: 30,
    rating: 4.7, reviewCount: 410, enrollmentCount: 5200, price: 1999, currency: 'INR',
    tags: ['Vastu', 'Architecture', 'Directions'], isFeatured: false, publishedAt: '2026-03-01',
    description: 'The ancient Indian science of architecture and spatial harmony. Learn how directions, elements, and proportion shape the energy of a home or workplace — and how to apply Vastu principles to real spaces.',
    whatYouLearn: ['The Vastu Purusha Mandala', 'The role of the eight directions', 'Element placement for each room', 'Diagnosing and correcting Vastu doshas', 'Applying Vastu without rebuilding'],
    requirements: ['A space you can observe and measure', 'Compass (or phone compass)'],
    modules: [
      mod('c7m1', 'Principles of Vastu', [['Origins & the Vastu Purusha Mandala', 'video', '20 min', true], ['The five elements in space', 'video', '18 min', true]], 1),
      mod('c7m2', 'Directions & Rooms', [['The eight directions', 'video', '24 min', false], ['Room-by-room placement', 'video', '30 min', false], ['Common Vastu doshas', 'reading', '14 min', false]], 2),
      mod('c7m3', 'Practical Application', [['Mapping a real home', 'practice', '35 min', false], ['Remedies without renovation', 'video', '22 min', false], ['Case-study quiz', 'quiz', '12 min', false]], 3),
    ],
    reviews: reviews('c7r'),
  },
  {
    id: 'c8', slug: 'vedic-mantra-science', title: 'Vedic Mantra Science',
    subtitle: 'The science of sacred sound', instructor: instructors.leela,
    gradient: 'from-gold-bright/25 to-violet-chakra/15', glyph: '🕉',
    level: 'Advanced', category: 'mantra', duration: '11 hrs', lessonCount: 28,
    rating: 4.9, reviewCount: 720, enrollmentCount: 8100, price: 1799, currency: 'INR',
    tags: ['Mantra', 'Sound', 'Japa'], isFeatured: false, publishedAt: '2026-02-26',
    description: 'Explore the science and practice of mantra — sacred sound as a tool for transformation. Learn correct pronunciation, the structure of classical mantras, japa practice, and the principles behind why sound affects mind and body.',
    whatYouLearn: ['The structure and types of mantra', 'Correct Sanskrit pronunciation', 'Japa practice and the use of a mala', 'The Gayatri and Maha Mrityunjaya mantras', 'How sound influences mind and physiology'],
    requirements: ['Willingness to chant aloud', 'A mala is helpful (optional)'],
    modules: [
      mod('c8m1', 'Sound as Energy', [['What is a mantra?', 'video', '16 min', true], ['The science of sound & resonance', 'video', '20 min', true]], 1),
      mod('c8m2', 'Pronunciation & Practice', [['Sanskrit sounds & accuracy', 'video', '24 min', false], ['Japa & the mala', 'practice', '18 min', false], ['The Gayatri Mantra', 'video', '22 min', false]], 2),
      mod('c8m3', 'Advanced Mantras', [['Maha Mrityunjaya', 'video', '20 min', false], ['Building a daily sadhana', 'reading', '14 min', false], ['Final practice', 'practice', '20 min', false]], 3),
    ],
    reviews: reviews('c8r'),
  },
];

export function getCourse(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}
