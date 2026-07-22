import type { AboutContent } from '@/types/content.types';

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroBadge: 'Our story',
  heroTitle: 'Where the timeless meets the present',
  heroSubtitle: 'VediCosmic was born from a simple conviction: that the wisdom traditions of India deserve to be experienced, not just read about — and that they can be presented with both reverence and clarity, free of superstition and sales pressure.',
  missionText: 'To make the inner sciences of the Vedic tradition genuinely useful — through tools that calculate, visualisations that illuminate, and teaching that respects your intelligence.',
  visionText: 'A world where exploring your inner cosmos is as natural — and as honest — as checking the weather: calm, beautiful, and always in service of your own clarity.',
  values: [
    { id: 'about-value-1', glyph: '✶', title: 'Wisdom, not woo', text: 'We present tradition honestly — explaining the mathematics and meaning behind each practice, never inventing false certainty.' },
    { id: 'about-value-2', glyph: '◈', title: 'Respect for the seeker', text: 'No dark patterns, no fear-selling, no manufactured urgency. You are a thoughtful person on a real journey.' },
    { id: 'about-value-3', glyph: '☾', title: 'Beauty as a doorway', text: 'A calm, considered interface is itself a form of meditation. Design here is intentional, never accidental.' },
  ],
  team: [
    { id: 'about-team-1', initials: 'AM', name: 'Ananya Mishra', role: 'Founder & Jyotish Teacher' },
    { id: 'about-team-2', initials: 'RV', name: 'Rajan Verma', role: 'Yoga & Energy Practices' },
    { id: 'about-team-3', initials: 'MK', name: 'Meera Krishnan', role: 'Sacred Geometry & Numerology' },
  ],
  timeline: [
    { id: 'about-timeline-1', year: '2024', text: 'The idea takes shape — a place where ancient wisdom meets honest, modern design.' },
    { id: 'about-timeline-2', year: '2025', text: 'The first interactive tools are built and tested with a small circle of seekers.' },
    { id: 'about-timeline-3', year: '2026', text: 'VediCosmic opens to all, with ten free tools and eight in-depth courses.' },
  ],
};
