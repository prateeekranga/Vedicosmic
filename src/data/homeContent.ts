import type { HomeContent } from '@/types/content.types';

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroBadge: 'The Inner Journey begins here',
  heroLine1: 'Explore the Cosmic',
  heroHighlight: 'Blueprint',
  heroLine2: 'of Your Existence',
  heroSubtitle: 'Ancient Vedic wisdom. Interactive tools. Modern clarity. Discover the numbers, stars, and sacred geometry that shape your path — and learn to read them yourself.',
  testimonials: [
    { id: 'home-testimonial-1', name: 'Ananya R.', place: 'Bengaluru', initials: 'AR', text: 'The tools feel honest — actual calculations, not vague horoscopes. The numerology dashboard is gorgeous and genuinely insightful.' },
    { id: 'home-testimonial-2', name: 'David M.', place: 'London', initials: 'DM', text: 'I came for curiosity and stayed for the courses. The teaching respects your intelligence and the design is simply beautiful.' },
    { id: 'home-testimonial-3', name: 'Meera K.', place: 'Pune', initials: 'MK', text: 'The Trataka meditation and mantra counter have become part of my daily practice. Calm, sacred, and never gimmicky.' },
  ],
  faqs: [
    { id: 'f1', header: 'Is it really free?', body: 'Yes — every interactive tool is free to use, with no payment and no sign-up required. Courses are the only paid offering, and several are free too.' },
    { id: 'f2', header: 'Do you store my birth data?', body: 'No. The tools compute everything locally in your browser. Nothing about your name, birth date, or readings is sent to a server unless you choose to create an account to save them.' },
    { id: 'f3', header: 'Which numerology system do you use?', body: 'Both — the Numerology tools use the Pythagorean system, the Chaldean tool uses the Chaldean map, and the Lo Shu grid follows the classical Vedic/Chinese magic-square method.' },
    { id: 'f4', header: 'Is this scientific?', body: 'These are contemplative and symbolic traditions, offered for reflection and self-inquiry — not as predictions or a substitute for professional advice. We present them honestly, with that spirit.' },
    { id: 'f5', header: 'Do I need an account?', body: 'Not to use the tools. An optional free account lets you save readings, keep a journal, and track your mantra streak across devices on this browser.' },
  ],
};
