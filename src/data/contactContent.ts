import type { ContactContent } from '@/types/content.types';

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  heroTitle: 'Begin a Conversation',
  heroSubtitle: 'Questions, feedback, or a story to share about your practice — we read every message that finds its way to us.',
  email: 'hello@vedicosmic.com',
  addressLine: 'Written for seekers everywhere',
  socials: { instagram: '', youtube: '', twitter: '' },
  faqs: [
    { id: 'f1', header: 'Are the tools based on real calculations?', body: 'Yes. Every reading — numerology, sidereal astrology, biorhythm, planetary hours — is computed live in your browser from established formulas. Nothing is random or pre-written, and your inputs never leave your device.' },
    { id: 'f2', header: 'Do I need an account to use VediCosmic?', body: 'No. All fourteen tools are free to explore without signing in. An account simply lets you save readings, keep a tarot journal, build a crystal kit, and track your mantra streak across visits.' },
    { id: 'f3', header: 'Is my personal data stored anywhere?', body: 'Your profile and saved readings live only in your browser via local storage. We do not run a tracking server for the current experience — your inner journey stays on your own device.' },
    { id: 'f4', header: 'Can I get a refund on a course?', body: 'Course enrollment in this experience is a demonstration of the learning flow. When paid courses go live, every purchase will carry a 14-day satisfaction window.' },
  ],
};
