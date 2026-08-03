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
import mobileNumberNumerology from './posts/mobile-number-numerology';
import chaldeanNumerologyExplained from './posts/chaldean-numerology-explained';
import navagrahaNinePlanetsGuide from './posts/navagraha-nine-planets-guide';
import dailyCardContemplationRitual from './posts/daily-card-contemplation-ritual';
import whatIsAYantraSacredGeometry from './posts/what-is-a-yantra-sacred-geometry';
import whatAreBiorhythmsExplained from './posts/what-are-biorhythms-explained';
import vastuShastraBasics from './posts/vastu-shastra-basics';
import urdhvaretasBrahmacharyaYogicView from './posts/urdhvaretas-brahmacharya-yogic-view';
import chakras101CompleteGuide from './posts/chakras-101-complete-guide';
import sevenChakrasChartColorsSymbolsMantras from './posts/seven-chakras-chart-colors-symbols-mantras';
import howToCalculateMasterNumber from './posts/how-to-calculate-master-number';
import all7ChakrasFunctionsBlockagesHealing from './posts/all-7-chakras-functions-blockages-healing';
import whatIsAChakraMeaningOrigin from './posts/what-is-a-chakra-meaning-origin';
import chakrasSubtleBodyPranaFlow from './posts/chakras-subtle-body-prana-flow';
import sevenChakrasDailyBalancingPractice from './posts/7-chakras-daily-balancing-practice';
import chakraInformationReferenceGuide from './posts/chakra-information-reference-guide';
import whatAreChakrasUsedForBenefitsMyths from './posts/what-are-chakras-used-for-benefits-myths';
import whatAreTheSevenChakrasSimpleDefinitions from './posts/what-are-the-7-chakras-simple-definitions';
import vedicChakrasJyotishNavagrahaConnection from './posts/vedic-chakras-jyotish-navagraha-connection';
import navagrahaRemediesMantrasGemstonesRituals from './posts/navagraha-remedies-mantras-gemstones-rituals';
import howToCalculateBiorhythmCycles from './posts/how-to-calculate-biorhythm-cycles';
import biorhythmCompatibilityBetweenTwoPeople from './posts/biorhythm-compatibility-between-two-people';
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
  mobileNumberNumerology,
  chaldeanNumerologyExplained,
  navagrahaNinePlanetsGuide,
  dailyCardContemplationRitual,
  whatIsAYantraSacredGeometry,
  whatAreBiorhythmsExplained,
  vastuShastraBasics,
  urdhvaretasBrahmacharyaYogicView,
  chakras101CompleteGuide,
  sevenChakrasChartColorsSymbolsMantras,
  howToCalculateMasterNumber,
  all7ChakrasFunctionsBlockagesHealing,
  whatIsAChakraMeaningOrigin,
  chakrasSubtleBodyPranaFlow,
  sevenChakrasDailyBalancingPractice,
  chakraInformationReferenceGuide,
  whatAreChakrasUsedForBenefitsMyths,
  whatAreTheSevenChakrasSimpleDefinitions,
  vedicChakrasJyotishNavagrahaConnection,
  navagrahaRemediesMantrasGemstonesRituals,
  howToCalculateBiorhythmCycles,
  biorhythmCompatibilityBetweenTwoPeople,
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
