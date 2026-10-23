import type { AboutContent } from '@/types/content.types';

export const ABOUT_CONTENT: AboutContent = {
  heroTitle: 'About VediCosmic',
  heroSubtitle: 'VediCosmic is a free website of Vedic astrology, panchang, numerology and daily-practice tools, with articles that explain them.',
  missionText: 'To make the everyday tools of the Vedic tradition — the panchang, the birth star, the hours of the day, mantra and breath practice — easy to use and clearly explained, without fear, upselling or invented certainty.',
  methodText: 'Every calculation runs in your browser. Where a result is approximate, the tool says so; where we cannot yet stand behind a result, we hide it until it is fixed. Results are offered for reflection and practice, not as predictions.',
  promises: [
    { id: 'about-promise-1', glyph: '✶', title: 'No ads', text: 'The site shows no advertising and sells nothing at present.' },
    { id: 'about-promise-2', glyph: '◈', title: 'No invented numbers', text: 'No ratings, user counts or testimonials that we cannot back up.' },
    { id: 'about-promise-3', glyph: '☾', title: 'Calculated on your device', text: 'Birth details you enter are used in your browser to compute the result and are not sent to us.' },
  ],
};
