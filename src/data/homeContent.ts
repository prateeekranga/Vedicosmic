import type { HomeContent } from '@/types/content.types';

export const HOME_CONTENT: HomeContent = {
  heroTitle: 'Free Vedic tools for daily practice',
  heroSubtitle: 'Today’s tithi and nakshatra, your birth star, planetary hours, numerology and a 17-minute daily sādhana. Calculations run in your browser. No ads, no sign-up.',
  faqs: [
    { id: 'f1', header: 'Is it free?', body: 'Yes. Every tool is free to use, with no sign-up. VediCosmic sells nothing at present and shows no ads.' },
    { id: 'f2', header: 'Do you store my birth details?', body: 'No. Calculations run in your browser, and what you type into a tool is not sent to us. If you choose to save a reading, it is kept in this browser on your device, and you can delete it at any time.' },
    { id: 'f3', header: 'Which numerology system do you use?', body: 'Both — the Numerology tools use the Pythagorean system, the Chaldean tool uses the Chaldean map, and the Lo Shu grid follows the classical Vedic/Chinese magic-square method.' },
    { id: 'f4', header: 'How accurate are the astrology results?', body: 'Sun and Moon positions use simplified formulas and are approximate, usually within about half a degree. When your Moon sits near the edge of a sign or nakshatra, the tool says so. The Lagna (Ascendant) is hidden while it is rebuilt and checked against reference charts.' },
    { id: 'f5', header: 'Is this scientific?', body: 'Astrology and numerology are traditions offered for reflection and practice. They are not predictions, and they are not a substitute for medical, legal, financial or psychological advice.' },
  ],
};
