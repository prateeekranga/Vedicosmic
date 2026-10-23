import type { ContactContent } from '@/types/content.types';

export const CONTACT_CONTENT: ContactContent = {
  heroTitle: 'Contact',
  heroSubtitle: 'Questions, corrections or feedback about a tool or an article? Write to us by email.',
  email: 'hello@vedicosmic.com',
  faqs: [
    { id: 'f1', header: 'Are the tools based on real calculations?', body: 'Yes. Each tool computes its result in your browser. Charts, panchang and daily timings use a tested astronomy engine whose results are checked against independent reference values; the How we calculate page explains the method and its limits.' },
    { id: 'f2', header: 'Do I need an account?', body: 'No. Every tool works without signing in. Anything you choose to save stays in this browser on your device.' },
    { id: 'f3', header: 'Is my personal data stored anywhere?', body: 'What you type into a tool is not sent to us. Saved readings and practice streaks are kept in your browser’s local storage on this device; clearing the site’s data in your browser removes them. If you email us, we receive your email address and message, and use them only to reply.' },
  ],
};
