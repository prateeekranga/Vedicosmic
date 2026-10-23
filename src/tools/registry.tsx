import type { ComponentType } from 'react';

import LoshuGridTool from '@/tools/LoshuGridTool';
import ChaldeanTool from '@/tools/ChaldeanTool';
import LifePathTool from '@/tools/LifePathTool';
import PlanetMandalaTool from '@/tools/PlanetMandalaTool';
import TratakTool from '@/tools/TratakTool';
import BlueprintTool from '@/tools/BlueprintTool';
import AstrologyTool from '@/tools/AstrologyTool';
import MobileNumerologyTool from '@/tools/MobileNumerologyTool';
import ChakraAssessmentTool from '@/tools/ChakraAssessmentTool';
import MantraTimerTool from '@/tools/MantraTimerTool';
import YantraTool from '@/tools/YantraTool';
import BiorhythmTool from '@/tools/BiorhythmTool';
import PlanetaryHoursTool from '@/tools/PlanetaryHoursTool';
import CrystalsTool from '@/tools/CrystalsTool';
import TarotTool from '@/tools/TarotTool';
import VastuTool from '@/tools/VastuTool';
import KundaliniTool from '@/tools/KundaliniTool';
import PranayamaTool from '@/tools/PranayamaTool';
import SoundBathTool from '@/tools/SoundBathTool';
import ChakraFrequencyPlayerTool from '@/tools/ChakraFrequencyPlayerTool';
import MuhurtaTool from '@/tools/MuhurtaTool';
import NakshatraTool from '@/tools/NakshatraTool';
import KundaliMatchingTool from '@/tools/KundaliMatchingTool';
import UrdhvaTool from '@/tools/UrdhvaTool';
import VratCalendarTool from '@/tools/VratCalendarTool';
import SadhanaTool from '@/tools/SadhanaTool';
import PujaTool from '@/tools/PujaTool';

/** Tool slug → React component. Imported only by the (lazy-loaded) tool page, so the
 *  tools stay out of the main bundle. Metadata lives in `src/content/routes.ts`. */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  numerology: BlueprintTool,
  'mobile-numerology': MobileNumerologyTool,
  'loshu-grid': LoshuGridTool,
  chaldean: ChaldeanTool,
  'life-path': LifePathTool,
  astrology: AstrologyTool,
  'planetary-hours': PlanetaryHoursTool,
  'planet-mandala': PlanetMandalaTool,
  'chakra-assessment': ChakraAssessmentTool,
  'mantra-timer': MantraTimerTool,
  tratak: TratakTool,
  crystals: CrystalsTool,
  tarot: TarotTool,
  yantra: YantraTool,
  biorhythm: BiorhythmTool,
  vastu: VastuTool,
  kundalini: KundaliniTool,
  pranayama: PranayamaTool,
  soundbath: SoundBathTool,
  'chakra-frequency-player': ChakraFrequencyPlayerTool,
  muhurta: MuhurtaTool,
  nakshatra: NakshatraTool,
  'kundali-matching': KundaliMatchingTool,
  urdhva: UrdhvaTool,
  'vrat-calendar': VratCalendarTool,
  sadhana: SadhanaTool,
  'puja-aarti': PujaTool,
};
