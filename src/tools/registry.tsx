import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type ToolLoader = () => Promise<{ default: ComponentType }>;

/**
 * Tool slug → how to load its component. Each tool is its own chunk, so a tool page downloads
 * only the tool it shows. Metadata lives in `src/content/routes.ts`.
 */
export const TOOL_LOADERS: Record<string, ToolLoader> = {
  numerology: () => import('@/tools/BlueprintTool'),
  'mobile-numerology': () => import('@/tools/MobileNumerologyTool'),
  'loshu-grid': () => import('@/tools/LoshuGridTool'),
  chaldean: () => import('@/tools/ChaldeanTool'),
  'life-path': () => import('@/tools/LifePathTool'),
  astrology: () => import('@/tools/AstrologyTool'),
  'planetary-hours': () => import('@/tools/PlanetaryHoursTool'),
  'planet-mandala': () => import('@/tools/PlanetMandalaTool'),
  'chakra-assessment': () => import('@/tools/ChakraAssessmentTool'),
  'mantra-timer': () => import('@/tools/MantraTimerTool'),
  tratak: () => import('@/tools/TratakTool'),
  crystals: () => import('@/tools/CrystalsTool'),
  tarot: () => import('@/tools/TarotTool'),
  yantra: () => import('@/tools/YantraTool'),
  biorhythm: () => import('@/tools/BiorhythmTool'),
  vastu: () => import('@/tools/VastuTool'),
  kundalini: () => import('@/tools/KundaliniTool'),
  pranayama: () => import('@/tools/PranayamaTool'),
  soundbath: () => import('@/tools/SoundBathTool'),
  'chakra-frequency-player': () => import('@/tools/ChakraFrequencyPlayerTool'),
  muhurta: () => import('@/tools/MuhurtaTool'),
  nakshatra: () => import('@/tools/NakshatraTool'),
  'kundali-matching': () => import('@/tools/KundaliMatchingTool'),
  urdhva: () => import('@/tools/UrdhvaTool'),
  'vrat-calendar': () => import('@/tools/VratCalendarTool'),
  sadhana: () => import('@/tools/SadhanaTool'),
  'puja-aarti': () => import('@/tools/PujaTool'),
};

/** Lazy components, created once so a tool keeps its state across re-renders of the page. */
export const TOOL_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = Object.fromEntries(
  Object.entries(TOOL_LOADERS).map(([slug, load]) => [slug, lazy(load)]),
);

/** Starts downloading a tool before it is rendered (the browser caches the request). */
export function preloadTool(slug: string): void {
  void TOOL_LOADERS[slug]?.().catch(() => { /* the lazy component reports a failed load itself */ });
}
