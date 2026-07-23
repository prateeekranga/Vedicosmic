import lifePathNumberGuide2026 from './posts/life-path-number-guide-2026';
import loshuGridExplained from './posts/loshu-grid-explained';
import numerologyCompatibilityLifePath from './posts/numerology-compatibility-life-path';
import vedicVsWesternAstrology from './posts/vedic-vs-western-astrology';
import nakshatrasExplained from './posts/nakshatras-explained-27-lunar-mansions';
import sevenChakrasBeginnersGuide from './posts/seven-chakras-beginners-guide';
import panchang101 from './posts/panchang-101-tithi-nakshatra';
import startDailySpiritualPracticeSadhana from './posts/start-daily-spiritual-practice-sadhana';
import ekadashiFastingGuide from './posts/ekadashi-fasting-guide';
import pranayamaForBeginners from './posts/pranayama-for-beginners';
import type { BlogPost } from '@/types/blog.types';

// Post slugs must never literally be "category" — it would collide with the
// /blog/category/:categoryId route.
export const BLOG_POSTS: BlogPost[] = [
  lifePathNumberGuide2026,
  loshuGridExplained,
  numerologyCompatibilityLifePath,
  vedicVsWesternAstrology,
  nakshatrasExplained,
  sevenChakrasBeginnersGuide,
  panchang101,
  startDailySpiritualPracticeSadhana,
  ekadashiFastingGuide,
  pranayamaForBeginners,
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
