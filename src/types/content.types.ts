export interface FAQItem { id: string; header: string; body: string }
export interface ValueItem { id: string; glyph: string; title: string; text: string }

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  faqs: FAQItem[];
}

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  missionText: string;
  methodText: string;
  /** Only promises a visitor can check for themselves. */
  promises: ValueItem[];
}

export interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  email: string;
  faqs: FAQItem[];
}

export interface SEOOverride { title?: string; description?: string; ogImage?: string }
