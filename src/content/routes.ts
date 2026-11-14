/**
 * Single source of truth for public routes and tool metadata: navigation, the tools hub,
 * the sitemap/llms.txt generator, the prerender script and any text that states a tool
 * count all read from here. Tool React components live in `src/tools/registry.tsx`.
 */
import {
  Hash, Telescope, Smartphone, Flower2, Repeat, Hexagon, Activity, Clock, Gem, Layers, Grid3x3,
  Calculator, Wand2, Orbit, Eye, Sparkles, Home, Flame, Wind, SlidersHorizontal, Sun, Star, Shield,
  CalendarDays, LayoutDashboard, BellRing, Heart, AudioLines,
} from 'lucide-react';
import type { ToolMeta } from '@/types/tool.types';
import { LEGAL } from '@/content/legal';

export interface StaticRoute {
  path: string;
  seoLabel: string;
  /** False keeps the page out of the sitemap and adds a noindex robots tag. */
  indexable: boolean;
}

/** The static (non-parameterized) public routes. Excludes the admin route and the 404 catch-all. */
export const STATIC_ROUTES: StaticRoute[] = [
  { path: '/', seoLabel: 'Home', indexable: true },
  { path: '/tools', seoLabel: 'Tools', indexable: true },
  { path: '/courses', seoLabel: 'Courses', indexable: false },
  { path: '/about', seoLabel: 'About', indexable: true },
  { path: '/how-we-calculate', seoLabel: 'How we calculate', indexable: true },
  { path: '/contact', seoLabel: 'Contact', indexable: true },
  { path: '/blog', seoLabel: 'Blog', indexable: true },
  { path: '/privacy-policy', seoLabel: 'Privacy Policy', indexable: true },
  { path: '/terms', seoLabel: 'Terms of Service', indexable: true },
  { path: '/refund-policy', seoLabel: 'Refund Policy', indexable: true },
  { path: '/disclaimer', seoLabel: 'Disclaimer', indexable: true },
  // /legal goes live only once the owner's entity and grievance-officer details exist.
  ...(LEGAL ? [{ path: '/legal', seoLabel: 'Legal & grievance officer', indexable: true }] : []),
];

export const TOOLS: ToolMeta[] = [
  {
    id: 'numerology', slug: 'numerology', name: 'Numerology Calculator',
    h1: 'Numerology Calculator by Name and Date of Birth',
    subtitle: 'Western core numbers, Mulank, Bhagyank and the Lo Shu grid in one report',
    seoTitle: 'Numerology Calculator by Name and Date of Birth (Free)',
    description: 'Free numerology calculator: enter your name and date of birth for your Life Path, Expression, Soul Urge, Personality, Birthday and Maturity numbers, your karmic numbers, your Mulank, Bhagyank and Kua with the Lo Shu grid, and your Chaldean name number, with every step of the working shown.',
    metaDescription: 'Enter your name and date of birth to get your Life Path, Expression, Soul Urge and Personality numbers, with Mulank, Bhagyank, Kua and a Lo Shu grid.',
    category: 'numerology', accent: 'gold', Icon: Sparkles,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'mobile-numerology', slug: 'mobile-numerology', name: 'Mobile Number Numerology',
    h1: 'Mobile Number Numerology Calculator',
    subtitle: 'The root, repeats and digit pairs of a phone number',
    seoTitle: 'Mobile Number Numerology Calculator (with Date of Birth)',
    description: 'Free mobile number numerology calculator: find the root number of a phone number, see which digits repeat, read each neighbouring pair of digits through the planets that rule them, and compare the number with your own Mulank and Bhagyank.',
    metaDescription: 'Check the numerology of a mobile number: its root number, repeated digits and two-digit pairs, and how it sits with your Mulank and Bhagyank. Free.',
    category: 'numerology', accent: 'cyan', Icon: Smartphone,
    status: 'live', indexable: true,
  },
  {
    id: 'loshu-grid', slug: 'loshu-grid', name: 'Lo Shu Grid Calculator',
    subtitle: 'Your date of birth in the 3×3 square, with Mulank, Bhagyank and Kua',
    seoTitle: 'Lo Shu Grid Calculator by Date of Birth: Missing Numbers',
    description: 'Free Lo Shu grid calculator: place your date of birth in the 3×3 square with your Driver (Mulank), Conductor (Bhagyank) and Kua number, then read the missing and repeated numbers, the eight planes and yogs, and your favourable directions, with the working shown.',
    metaDescription: 'Make your Lo Shu grid from your date of birth: see missing and repeated numbers, the planes, and your Mulank, Bhagyank and Kua number. Free, no sign-up.',
    category: 'numerology', accent: 'gold', Icon: Grid3x3,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chaldean', slug: 'chaldean', name: 'Chaldean Numerology Calculator',
    subtitle: 'Name number, compound number and letter-by-letter working',
    seoTitle: 'Chaldean Numerology Calculator: Name Number & Compound',
    description: 'Free Chaldean numerology calculator: type a name or a business name to get its compound number and root number, what Cheiro’s tradition says about each, a letter-by-letter working, and a side-by-side comparison with a second spelling.',
    metaDescription: 'Type a name or a business name to get its Chaldean compound and root numbers, the ruling planet and a letter-by-letter working. Free, in your browser.',
    category: 'numerology', accent: 'cyan', Icon: Calculator,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'life-path', slug: 'life-path', name: 'Life Path Number Calculator',
    subtitle: 'Life Path, Mulank, Bhagyank, personal year and pinnacles',
    seoTitle: 'Life Path Number Calculator with Mulank & Bhagyank',
    description: 'Free Life Path number calculator: enter your date of birth for your Life Path with its working and master numbers, your Mulank and Bhagyank, friendly numbers and colours, your personal year, month and day, and the four pinnacles and challenges of your life.',
    metaDescription: 'Work out your Life Path number from your date of birth, with Mulank, Bhagyank, lucky numbers and colours, and your personal day, month and year.',
    category: 'numerology', accent: 'violet', Icon: Wand2,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'astrology', slug: 'astrology', name: 'Kundli (Vedic Birth Chart)',
    h1: 'Free Kundli (Vedic Birth Chart) Online',
    subtitle: 'Your Lagna, Moon, nine grahas & dasha',
    seoTitle: 'Free Kundli Online: Lagna, Rashi, Nakshatra & Dasha',
    description: 'Free Vedic birth chart calculator: enter your birth date, time and place to cast a sidereal Rashi chart with your Lagna (Ascendant), Moon and Sun signs, all nine grahas with nakshatra and pada, whole-sign houses and Vimshottari dasha — calculated privately in your browser.',
    metaDescription: 'Make a free kundli from your date, time and place of birth: Lagna, Moon sign, nine grahas with nakshatra and pada, houses and Vimshottari dasha.',
    category: 'astrology', accent: 'violet', Icon: Telescope,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'planetary-hours', slug: 'planetary-hours', name: 'Hora Calculator',
    h1: 'Hora Calculator (Planetary Hours)',
    subtitle: 'Act in rhythm with the day’s ruling planet',
    seoTitle: 'Hora Calculator: Today’s Planetary Hours for Your City',
    description: 'Free planetary hours (hora) calculator: see exactly which planet rules this very hour wherever you are, and the best activities to align with each planetary hour throughout the day and night.',
    metaDescription: 'See the hora running now and the planetary hours of the day and night for your city, counted from sunrise, with what each planet traditionally favours.',
    category: 'astrology', accent: 'gold', Icon: Clock,
    status: 'live', indexable: true,
  },
  {
    id: 'planet-mandala', slug: 'planet-mandala', name: 'Navagraha Mandala',
    h1: 'Navagraha: The Nine Vedic Planets',
    subtitle: 'The nine planets, alive in 360°',
    seoTitle: 'Navagraha: The Nine Planets of Vedic Astrology, Explained',
    description: 'A free interactive Navagraha mandala: spin a living 360° orbital map of the nine Vedic planets (grahas), watch them circle the Sun, and tap any graha to learn its meaning and mythology.',
    metaDescription: 'Meet the nine grahas, from Surya to Ketu, on an interactive mandala: each one’s nature, colour and symbolism. Illustrative, not live positions.',
    category: 'astrology', accent: 'violet', Icon: Orbit,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chakra-assessment', slug: 'chakra-assessment', name: 'Chakra Test',
    h1: 'Chakra Test: 21 Questions',
    subtitle: 'A 21-point energy-field assessment',
    seoTitle: 'Chakra Test: Free 21-Question Chakra Balance Quiz',
    description: 'Free chakra test: answer 21 reflective questions to map the balance of your seven chakras on an animated radar chart, revealing which energy centres may need attention.',
    metaDescription: 'Answer 21 questions to see how your seven chakras compare on a radar chart, with a practice for each. A reflection exercise, not a diagnosis.',
    category: 'energy', accent: 'violet', Icon: Flower2,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'mantra-timer', slug: 'mantra-timer', name: 'Japa Counter',
    h1: 'Online Japa Counter (108-Bead Mala)',
    subtitle: 'Count your mala & keep a daily streak',
    seoTitle: 'Japa Counter Online: 108-Bead Digital Mala for Mantra Jaap',
    description: 'Free 108-bead japa mala counter: chant along with eight sacred mantras, track every round with a satisfying tap, and keep a personal daily streak — no physical mala required.',
    metaDescription: 'Count mantra japa on a 108-bead digital mala, one tap per bead, with eight mantras to choose from and a daily streak kept on your device. Free.',
    category: 'energy', accent: 'gold', Icon: Repeat,
    status: 'live', indexable: true,
  },
  {
    id: 'tratak', slug: 'tratak', name: 'Trataka Meditation',
    h1: 'Trataka (Candle Gazing) Meditation',
    subtitle: 'Steady-gaze meditation in immersive full screen',
    seoTitle: 'Trataka Meditation Online: Candle Gazing Timer & Guide',
    description: 'Free Trataka (candle gazing) meditation guide: fix your gaze on a luminous bindu, candle flame, Om symbol or Sri Yantra in distraction-free full screen, with a timer, breath pacer, and a closing afterimage ritual.',
    metaDescription: 'Practise Trataka on a candle flame, bindu, Om or Sri Yantra in full screen, with a timer, breath pacing and guidance for the closed-eye afterimage.',
    category: 'energy', accent: 'violet', Icon: Eye,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'crystals', slug: 'crystals', name: 'Crystal Guide',
    h1: 'Crystal Guide by Intention',
    subtitle: 'Find the right stone for your intention',
    seoTitle: 'Crystal Guide: Twelve Stones Chosen by Intention',
    description: 'Free crystal guide: browse twelve crystals by the intentions traditionally associated with them (love, protection, clarity, abundance and more), see how each is used, and build your own crystal kit.',
    metaDescription: 'Browse twelve crystals by the intentions traditionally linked to them, such as calm, clarity and protection, and keep a kit saved on your device.',
    category: 'energy', accent: 'cyan', Icon: Gem,
    status: 'live', indexable: true,
  },
  {
    id: 'tarot', slug: 'tarot', name: 'Daily Contemplation Card',
    subtitle: 'One card a day, for reflection',
    seoTitle: 'Card of the Day: Daily Vedic Contemplation Card & Journal',
    description: 'A free daily contemplation card: draw one original Vedic-flavoured card each day, reflect on the prompt it offers, and keep a private journal of your insights over time.',
    metaDescription: 'Draw one original contemplation card a day, reflect on its prompt and keep a private journal on your device. A reflection practice, not prediction.',
    category: 'energy', accent: 'teal', Icon: Layers,
    status: 'live', indexable: true,
  },
  {
    id: 'yantra', slug: 'yantra', name: 'Sacred Geometry Lab',
    h1: 'Yantra and Sacred Geometry Lab',
    subtitle: 'The mathematics behind the divine',
    seoTitle: 'Sri Yantra & Sacred Geometry: 14 Yantras Drawn Step by Step',
    description: 'Free sacred geometry lab: watch fourteen classical yantras (including the Sri Yantra) draw themselves stroke by stroke, and learn the precise mathematics — ratios, angles, the golden ratio — encoded in each.',
    metaDescription: 'Watch fourteen classical yantras, including the Sri Yantra, draw themselves stroke by stroke, and learn the ratios and angles behind each design.',
    category: 'cosmology', accent: 'gold', Icon: Hexagon,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'biorhythm', slug: 'biorhythm', name: 'Biorhythm Calculator',
    subtitle: 'Your physical, emotional & intellectual waves',
    seoTitle: 'Biorhythm Calculator by Date of Birth: Today’s Chart',
    description: 'Free biorhythm calculator: plot your physical (23-day), emotional (28-day) and intellectual (33-day) cycles around today and see exactly where each wave sits right now.',
    metaDescription: 'Enter your date of birth to chart your physical, emotional and intellectual biorhythm cycles for today and the weeks around it. A traditional model.',
    category: 'cosmology', accent: 'cyan', Icon: Activity,
    status: 'live', indexable: true,
  },
  {
    id: 'vastu', slug: 'vastu', name: 'Vastu Directions',
    h1: 'Vastu Directions for Every Room',
    subtitle: 'The best direction for every room of your home',
    seoTitle: 'Vastu Directions for Home: Room-by-Room Vastu Shastra Guide',
    description: 'Free Vastu Shastra compass: see which of the eight directions suits every room of your home — kitchen, bedroom, pooja room, entrance and more — with the element and classical reasoning behind each placement.',
    metaDescription: 'Which direction suits the kitchen, bedroom, pooja room and entrance? A room-by-room Vastu Shastra guide with the element and reasoning for each.',
    category: 'energy', accent: 'gold', Icon: Home, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'kundalini', slug: 'kundalini', name: 'Kundalini Meditation',
    h1: 'Guided Kundalini Meditation',
    subtitle: 'Raise the serpent through the seven chakras',
    seoTitle: 'Guided Kundalini Meditation Online: A Seven-Chakra Journey',
    description: 'A free, safety-first guided Kundalini meditation, two ways: follow the full video breath guide, or take the immersive animated journey as the coiled serpent rises through all seven chakras with rising tones, spoken bija mantras (English or हिन्दी) and selectable music.',
    metaDescription: 'A gentle guided Kundalini meditation: a breath-paced video or an animated journey through the seven chakras with bija mantras. Stop if uncomfortable.',
    category: 'energy', accent: 'gold', Icon: Flame, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'pranayama', slug: 'pranayama', name: 'Pranayama Timer',
    h1: 'Pranayama Breathing Timer',
    subtitle: 'Box · 4-7-8 · Nadi Shodhana · Bhastrika',
    seoTitle: 'Pranayama Breathing Timer: Box, 4-7-8 & Nadi Shodhana',
    description: 'Free pranayama breathing coach: a glowing orb paces your breath through five classical techniques — Box breathing, 4-7-8, Nadi Shodhana and more — with voice pacing in English or हिन्दी and a nostril guide for alternate-nostril breathing.',
    metaDescription: 'A guided breathing timer for Box breathing, 4-7-8, Nadi Shodhana, Bhastrika and slow belly breath, with voice cues in English or Hindi. Stop if dizzy.',
    category: 'energy', accent: 'cyan', Icon: Wind, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'soundbath', slug: 'soundbath', name: 'Sound Bath Mixer',
    h1: 'Online Sound Bath Mixer',
    subtitle: 'Mix tanpura, bowls, Om, rain, chimes & earth hum',
    seoTitle: 'Sound Bath Online: Mix Tanpura, Singing Bowls, Om & Rain',
    description: 'Free online sound bath: mix six sacred, generatively synthesised layers — tanpura, singing bowls, Om, rain, chimes and earth hum — live on your own sliders, with presets like Temple Rain and Deep Space. Nothing here is a recording.',
    metaDescription: 'Mix your own sound bath from six generated layers: tanpura, singing bowls, Om, rain, chimes and earth hum. Runs live in your browser, no recordings.',
    category: 'energy', accent: 'gold', Icon: SlidersHorizontal, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chakra-frequency-player', slug: 'chakra-frequency-player', name: 'Chakra Frequency Player',
    subtitle: 'Solfeggio & chakra tones, binaural beats and a sleep timer',
    seoTitle: 'Chakra Frequency Player: Solfeggio Tones & Binaural Beats',
    description: 'Free chakra frequency and sleep meditation player: choose from seven chakra tones and classic Solfeggio frequencies, layer in binaural or isochronic beats, and drift off with a crossfading sleep timer — every tone is synthesised live in your browser with the Web Audio API, not a recording.',
    metaDescription: 'Play seven chakra tones and Solfeggio frequencies with optional binaural or isochronic beats and a sleep timer. For relaxation, not treatment.',
    category: 'energy', accent: 'cyan', Icon: AudioLines,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'muhurta', slug: 'muhurta', name: 'Rahu Kaal & Muhurat Finder',
    h1: 'Rahu Kaal and Muhurat Finder',
    subtitle: 'Today’s auspicious & inauspicious windows',
    seoTitle: 'Rahu Kaal Today & Abhijit Muhurat Timings for Your City',
    description: 'Free Muhurta finder: a live 24-hour day-wheel computed from real sunrise and sunset for your location, showing the golden Abhijit and Brahma Muhurta windows to use, and Rahu Kaal, Yamaganda and Gulika Kaal periods to avoid.',
    metaDescription: 'Today’s Rahu Kaal, Yamaganda, Gulika Kaal, Abhijit muhurat and Brahma muhurta for any city and date, worked out from that day’s sunrise and sunset.',
    category: 'astrology', accent: 'gold', Icon: Sun, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'nakshatra', slug: 'nakshatra', name: 'Nakshatra Finder',
    h1: 'Nakshatra Finder (Birth Star Calculator)',
    subtitle: 'Find your birth star among 27 lunar mansions',
    seoTitle: 'Nakshatra Finder by Date of Birth: Janma Nakshatra & Pada',
    description: 'Free Nakshatra calculator: explore an interactive sky-wheel of all 27 lunar mansions, or enter your birth date and time to instantly find your janma nakshatra (birth star) and pada, with its ruling deity, symbol and nature.',
    metaDescription: 'Find your janma nakshatra and pada from your date, time and place of birth, then explore all 27 nakshatras with their deities, symbols and nature.',
    category: 'astrology', accent: 'cyan', Icon: Star, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'kundali-matching', slug: 'kundali-matching', name: 'Kundali Matching',
    subtitle: 'Numerology and Ashtakoot compatibility for two',
    seoTitle: 'Kundali Matching (coming soon) · VediCosmic',
    description: 'Kundali matching (Ashtakoota guna milan) is being rebuilt and checked against reference charts before it goes live.',
    category: 'astrology', accent: 'violet', Icon: Heart,
    isNew: true,
    status: 'coming-soon', indexable: false,
  },
  {
    id: 'urdhva', slug: 'urdhva', name: 'Urdhva Shakti',
    h1: 'Urdhva Shakti: Urge-Control Companion',
    subtitle: 'Turn the energy upward — freedom from adult content',
    seoTitle: 'Urge Control Tool to Quit Porn: Breath SOS & Streak',
    description: 'A free, compassionate companion for breaking free from porn: a one-tap Urge SOS with guided breath and upward-energy visualisation, a growing streak, the honest science of the dopamine loop, and a 90-day path toward ūrdhvaretas.',
    metaDescription: 'A private companion for quitting porn: a one-tap urge SOS with guided breathing, a streak kept on your device, and daily reflections. No sign-up.',
    category: 'energy', accent: 'gold', Icon: Shield, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'sadhana', slug: 'sadhana', name: 'Daily Sādhana',
    subtitle: 'Your practice home — today’s flow, moon, streak & timing',
    seoTitle: 'Daily Sadhana: Today’s Tithi, Nakshatra & Practice Flow',
    description: 'Free daily sadhana home base: see today’s tithi, nakshatra and a living moon phase at a glance, follow a three-step guided practice flow, and track your streak, the next sacred day, and today’s auspicious timing.',
    metaDescription: 'Start your daily sadhana: today’s tithi, nakshatra and moon phase, a three-step practice flow, and a streak kept on your device. Free, no sign-up.',
    category: 'energy', accent: 'gold', Icon: LayoutDashboard, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'vrat-calendar', slug: 'vrat-calendar', name: 'Ekadashi & Vrat Calendar',
    h1: 'Ekadashi and Vrat Calendar',
    subtitle: 'The sacred lunar days rising over the next six weeks',
    seoTitle: 'Next Ekadashi, Purnima & Pradosh Dates: Vrat Calendar',
    description: 'Free Ekadashi and vrat calendar: a living Hindu lunar calendar with an animated moon phase, computing today’s tithi and the upcoming Ekadashi, Purnima, Amavasya, Pradosh and more from the real positions of the Sun and Moon.',
    metaDescription: 'When is the next Ekadashi? See Ekadashi, Purnima, Amavasya, Pradosh and Sankashti Chaturthi dates for your city over the next 45 days. Free.',
    category: 'cosmology', accent: 'cyan', Icon: CalendarDays, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'puja-aarti', slug: 'puja-aarti', name: 'Virtual Puja & Aarti',
    h1: 'Virtual Puja and Aarti',
    subtitle: 'A virtual shrine — bell, flowers, conch and a live Aarti',
    seoTitle: 'Virtual Puja & Aarti Online: Bell, Diya, Flowers & Mantras',
    description: 'Free virtual puja and aarti: step into an online shrine for seven deities, ring the temple bell, offer flowers, blow the conch, or perform a full Aarti with a circling flame and each deity’s traditional invocation — all generated live, no audio files needed.',
    metaDescription: 'Offer a virtual puja to one of seven deities: ring the bell, offer flowers, blow the conch or perform an aarti with the traditional invocation. Free.',
    category: 'energy', accent: 'gold', Icon: BellRing, isNew: true,
    status: 'live', indexable: true,
  },
];

export const TOOL_CATEGORIES: { id: ToolMeta['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'numerology', label: 'Numerology' },
  { id: 'astrology', label: 'Astrology' },
  { id: 'energy', label: 'Energy & Practice' },
  { id: 'cosmology', label: 'Cosmology' },
];

/** Tools linked from the footer and other short lists, by the terms people search for them. */
export const FEATURED_TOOLS: { slug: string; label: string }[] = [
  { slug: 'astrology', label: 'Kundli' },
  { slug: 'muhurta', label: 'Rahu Kaal today' },
  { slug: 'nakshatra', label: 'Nakshatra finder' },
  { slug: 'planetary-hours', label: 'Hora calculator' },
  { slug: 'numerology', label: 'Numerology calculator' },
  { slug: 'loshu-grid', label: 'Lo Shu grid' },
];

/** Single source of truth for a tool's accent → icon chip colour, shared by the Tools
 *  hub grid, the tool detail header, and the "more tools like this" cross-sell. */
export const TOOL_ACCENT_BG: Record<ToolMeta['accent'], string> = {
  gold: 'bg-gold-bright/10 text-gold-soft',
  cyan: 'bg-brand-cyan/10 text-brand-cyan-soft',
  violet: 'bg-violet-chakra/10 text-violet-chakra',
  teal: 'bg-teal-cosmic/15 text-teal-cosmic',
};

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}

/** Tools a visitor can actually use (excludes coming-soon). Use this for any stated tool count. */
export function liveTools(): ToolMeta[] {
  return TOOLS.filter((t) => t.status === 'live');
}
