export interface TestimonialItem { id: string; name: string; place: string; initials: string; text: string }
export interface FAQItem { id: string; header: string; body: string }
export interface ValueItem { id: string; glyph: string; title: string; text: string }
export interface TeamMember { id: string; initials: string; name: string; role: string }
export interface TimelineItem { id: string; year: string; text: string }
export interface SocialLinks { instagram?: string; youtube?: string; twitter?: string }

export interface HomeContent {
  heroBadge: string;
  heroLine1: string;
  heroHighlight: string;
  heroLine2: string;
  heroSubtitle: string;
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
}

export interface AboutContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  missionText: string;
  visionText: string;
  values: ValueItem[];
  team: TeamMember[];
  timeline: TimelineItem[];
}

export interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  email: string;
  addressLine: string;
  socials: SocialLinks;
  faqs: FAQItem[];
}

export interface SEOOverride { title?: string; description?: string; ogImage?: string }
