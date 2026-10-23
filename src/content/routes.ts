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
    id: 'numerology', slug: 'numerology', name: 'Numerology Blueprint',
    subtitle: 'Your full blueprint — animated core numbers, wheel & Lo Shu',
    seoTitle: 'Numerology Calculator: Life Path, Expression & Lo Shu',
    description: 'Free numerology calculator: enter your name and birth date to reveal your Life Path, Expression, Soul Urge, Personality, Birthday and Personal Year numbers as animated orbs, a core-number wheel and your highlighted Lo Shu grid — computed instantly and privately in your browser.',
    metaDescription: 'Enter your name and birth date to see your Life Path, Expression, Soul Urge and Personal Year numbers and your Lo Shu grid. Free, in your browser.',
    category: 'numerology', accent: 'gold', Icon: Sparkles,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'mobile-numerology', slug: 'mobile-numerology', name: 'Mobile Number Analysis',
    subtitle: 'The vibration of your phone number',
    seoTitle: 'Mobile Number Numerology Calculator · VediCosmic',
    description: 'Free mobile number numerology calculator: find the root number of your phone number, its repeating digit patterns, and how well it harmonises with your Life Path — including two-digit combination analysis.',
    metaDescription: 'Find the root number of your phone number, its repeating digit patterns and how it sits with your Life Path number. Free and private.',
    category: 'numerology', accent: 'cyan', Icon: Smartphone,
    status: 'live', indexable: true,
  },
  {
    id: 'loshu-grid', slug: 'loshu-grid', name: 'Lo Shu Grid',
    subtitle: 'Your birth-date mapped to the sacred magic square',
    seoTitle: 'Free Lo Shu Grid Calculator — Vedic Numerology Magic Square',
    description: 'Free Lo Shu Grid calculator: drop your birth-date digits into the ancient 3×3 magic square and instantly read its ruling planets, repeated-number energies, missing numbers, and arrows of strength and weakness.',
    metaDescription: 'Place your birth-date digits in the 3×3 Lo Shu magic square and read its planes, missing numbers and repeats. Free, calculated in your browser.',
    category: 'numerology', accent: 'gold', Icon: Grid3x3,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chaldean', slug: 'chaldean', name: 'Chaldean Numerology',
    subtitle: 'The vibration of any name, number or date',
    seoTitle: 'Chaldean Numerology Calculator: Name & Number Vibration',
    description: 'Free Chaldean numerology calculator: type any name, phone number or date of birth to instantly see its Chaldean compound number, reduced root number, ruling planet, and a full per-letter breakdown.',
    metaDescription: 'Type a name, phone number or date to see its Chaldean compound and root numbers, with what tradition says about each. Free, in your browser.',
    category: 'numerology', accent: 'cyan', Icon: Calculator,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'life-path', slug: 'life-path', name: 'Find Your Life Path',
    subtitle: 'Seven calculators & personal predictions in one',
    seoTitle: 'Life Path Number Calculator & Numerology Console',
    description: 'Free Life Path number calculator and full numerology console in one: get your DOB chart, name number, lucky colours and numbers, plus a personal prediction for today, this month, and this year.',
    metaDescription: 'Get your Life Path number, name number, lucky colours and numbers and a personal reading in one numerology console. Free, in your browser.',
    category: 'numerology', accent: 'violet', Icon: Wand2,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'astrology', slug: 'astrology', name: 'Vedic Birth Chart',
    subtitle: 'Your Lagna, Moon, nine grahas & dasha',
    seoTitle: 'Vedic Birth Chart Calculator: Lagna, Moon Sign & Dasha',
    description: 'Free Vedic birth chart calculator: enter your birth date, time and place to cast a sidereal Rashi chart with your Lagna (Ascendant), Moon and Sun signs, all nine grahas with nakshatra and pada, whole-sign houses and Vimshottari dasha — calculated privately in your browser.',
    metaDescription: 'Cast your Vedic birth chart: Lagna, Moon and Sun signs, all nine grahas with nakshatra and pada, houses and Vimshottari dasha. Free and private.',
    category: 'astrology', accent: 'violet', Icon: Telescope,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'planetary-hours', slug: 'planetary-hours', name: 'Planetary Hours',
    subtitle: 'Act in rhythm with the day’s ruling planet',
    seoTitle: 'Free Planetary Hours Calculator — Live Hora Finder',
    description: 'Free planetary hours (hora) calculator: see exactly which planet rules this very hour wherever you are, and the best activities to align with each planetary hour throughout the day and night.',
    metaDescription: 'See which planet rules the current hour (hora) in your city, with times from that day’s sunrise and the activities each planet traditionally favours.',
    category: 'astrology', accent: 'gold', Icon: Clock,
    status: 'live', indexable: true,
  },
  {
    id: 'planet-mandala', slug: 'planet-mandala', name: 'Navagraha Mandala',
    subtitle: 'The nine planets, alive in 360°',
    seoTitle: 'Navagraha Mandala: The Nine Vedic Planets, Interactive',
    description: 'A free interactive Navagraha mandala: spin a living 360° orbital map of the nine Vedic planets (grahas), watch them circle the Sun, and tap any graha to learn its meaning and mythology.',
    metaDescription: 'Spin an interactive mandala of the nine Vedic planets (grahas) and tap each for its nature, colour and symbolism. Illustrative, not live positions.',
    category: 'astrology', accent: 'violet', Icon: Orbit,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chakra-assessment', slug: 'chakra-assessment', name: 'Chakra Balance',
    subtitle: 'A 21-point energy-field assessment',
    seoTitle: 'Free Chakra Test — 21-Question Energy Balance Assessment',
    description: 'Free chakra test: answer 21 reflective questions to map the balance of your seven chakras on an animated radar chart, revealing which energy centres may need attention.',
    metaDescription: 'Answer 21 reflective questions to see the balance of your seven chakras on a radar chart, with practices for each. For reflection, not diagnosis.',
    category: 'energy', accent: 'violet', Icon: Flower2,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'mantra-timer', slug: 'mantra-timer', name: 'Japa Mantra Counter',
    subtitle: 'Count your mala & keep a daily streak',
    seoTitle: 'Free Japa Mala Counter — 108-Bead Mantra Counter Online',
    description: 'Free 108-bead japa mala counter: chant along with eight sacred mantras, track every round with a satisfying tap, and keep a personal daily streak — no physical mala required.',
    metaDescription: 'Count japa on a 108-bead mala with eight sacred mantras, one tap per bead, and keep a daily streak saved on your device. Free.',
    category: 'energy', accent: 'gold', Icon: Repeat,
    status: 'live', indexable: true,
  },
  {
    id: 'tratak', slug: 'tratak', name: 'Trataka Focus',
    subtitle: 'Steady-gaze meditation in immersive full screen',
    seoTitle: 'Free Trataka Meditation — Online Candle Gazing Timer',
    description: 'Free Trataka (candle gazing) meditation guide: fix your gaze on a luminous bindu, candle flame, Om symbol or Sri Yantra in distraction-free full screen, with a timer, breath pacer, and a closing afterimage ritual.',
    metaDescription: 'Practise Trataka (steady gazing) on a candle flame, bindu, Om or Sri Yantra in full screen, with a gentle timer and step-by-step guidance. Free.',
    category: 'energy', accent: 'violet', Icon: Eye,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'crystals', slug: 'crystals', name: 'Crystal Guide',
    subtitle: 'Find the right stone for your intention',
    seoTitle: 'Free Crystal Guide — Stones by Intention',
    description: 'Free crystal guide: browse twelve crystals by the intentions traditionally associated with them (love, protection, clarity, abundance and more), see how each is used, and build your own crystal kit.',
    metaDescription: 'Browse twelve crystals by the intentions traditionally linked to them, such as calm, clarity and protection, and keep a kit saved on your device.',
    category: 'energy', accent: 'cyan', Icon: Gem,
    status: 'live', indexable: true,
  },
  {
    id: 'tarot', slug: 'tarot', name: 'Daily Contemplation Card',
    subtitle: 'One card a day, for reflection',
    seoTitle: 'Daily Contemplation Card & Reflection Journal',
    description: 'A free daily contemplation card: draw one original Vedic-flavoured card each day, reflect on the prompt it offers, and keep a private journal of your insights over time.',
    metaDescription: 'Draw one original contemplation card a day, reflect on its prompt and keep a private journal on your device. For reflection, not prediction.',
    category: 'energy', accent: 'teal', Icon: Layers,
    status: 'live', indexable: true,
  },
  {
    id: 'yantra', slug: 'yantra', name: 'Sacred Geometry Lab',
    subtitle: 'The mathematics behind the divine',
    seoTitle: 'Sacred Geometry Lab: Yantra Mathematics Explained',
    description: 'Free sacred geometry lab: watch fourteen classical yantras (including the Sri Yantra) draw themselves stroke by stroke, and learn the precise mathematics — ratios, angles, the golden ratio — encoded in each.',
    metaDescription: 'Watch fourteen classical yantras, including the Sri Yantra, draw themselves stroke by stroke, and learn the geometry behind each design.',
    category: 'cosmology', accent: 'gold', Icon: Hexagon,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'biorhythm', slug: 'biorhythm', name: 'Biorhythm Cycles',
    subtitle: 'Your physical, emotional & intellectual waves',
    seoTitle: 'Biorhythm Calculator: Physical, Emotional, Intellectual',
    description: 'Free biorhythm calculator: plot your physical (23-day), emotional (28-day) and intellectual (33-day) cycles around today and see exactly where each wave sits right now.',
    metaDescription: 'Plot your physical (23-day), emotional (28-day) and intellectual (33-day) biorhythm cycles around today. A traditional model, for reflection.',
    category: 'cosmology', accent: 'cyan', Icon: Activity,
    status: 'live', indexable: true,
  },
  {
    id: 'vastu', slug: 'vastu', name: 'Vastu Home Guide',
    subtitle: 'The best direction for every room of your home',
    seoTitle: 'Free Vastu Shastra Compass — Best Direction for Every Room',
    description: 'Free Vastu Shastra compass: see which of the eight directions suits every room of your home — kitchen, bedroom, pooja room, entrance and more — with the element and classical reasoning behind each placement.',
    metaDescription: 'See which of the eight directions Vastu Shastra recommends for each room (kitchen, bedroom, pooja room, entrance) with the reasons given.',
    category: 'energy', accent: 'gold', Icon: Home, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'kundalini', slug: 'kundalini', name: 'Kundalini Awakening',
    subtitle: 'Raise the serpent through the seven chakras',
    seoTitle: 'Guided Kundalini Meditation: A Chakra Journey',
    description: 'A free, safety-first guided Kundalini meditation, two ways: follow the full video breath guide, or take the immersive animated journey as the coiled serpent rises through all seven chakras with rising tones, spoken bija mantras (English or हिन्दी) and selectable music.',
    metaDescription: 'A safety-first guided Kundalini meditation: a breath-paced video or an animated journey through the seven chakras. Go gently, and stop if uncomfortable.',
    category: 'energy', accent: 'gold', Icon: Flame, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'pranayama', slug: 'pranayama', name: 'Pranayama Breath Coach',
    subtitle: 'Box · 4-7-8 · Nadi Shodhana · Bhastrika',
    seoTitle: 'Free Pranayama Breathing Coach — Box, 4-7-8 & Nadi Shodhana',
    description: 'Free pranayama breathing coach: a glowing orb paces your breath through five classical techniques — Box breathing, 4-7-8, Nadi Shodhana and more — with voice pacing in English or हिन्दी and a nostril guide for alternate-nostril breathing.',
    metaDescription: 'A breathing coach that paces Box breathing, 4-7-8, Nadi Shodhana and more with a glowing guide and timer. Free; stop if you feel dizzy.',
    category: 'energy', accent: 'cyan', Icon: Wind, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'soundbath', slug: 'soundbath', name: 'Cosmic Sound Bath',
    subtitle: 'Mix tanpura, bowls, Om, rain, chimes & earth hum',
    seoTitle: 'Free Online Sound Bath — Live Generative Tanpura, Bowls & Om',
    description: 'Free online sound bath: mix six sacred, generatively synthesised layers — tanpura, singing bowls, Om, rain, chimes and earth hum — live on your own sliders, with presets like Temple Rain and Deep Space. Nothing here is a recording.',
    metaDescription: 'Mix six generated sound layers (tanpura, singing bowls, Om, rain, chimes and earth hum) into your own sound bath, live in your browser.',
    category: 'energy', accent: 'gold', Icon: SlidersHorizontal, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chakra-frequency-player', slug: 'chakra-frequency-player', name: 'Chakra Frequency Player',
    subtitle: 'Solfeggio & chakra tones, binaural beats and a sleep timer',
    seoTitle: 'Chakra Frequency Player: Solfeggio & Binaural Tones',
    description: 'Free chakra frequency and sleep meditation player: choose from seven chakra tones and classic Solfeggio frequencies, layer in binaural or isochronic beats, and drift off with a crossfading sleep timer — every tone is synthesised live in your browser with the Web Audio API, not a recording.',
    metaDescription: 'Play chakra and Solfeggio tones with optional binaural or isochronic beats and a sleep timer. Free, in your browser; for relaxation only.',
    category: 'energy', accent: 'cyan', Icon: AudioLines,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'muhurta', slug: 'muhurta', name: 'Muhurta Finder',
    subtitle: 'Today’s auspicious & inauspicious windows',
    seoTitle: 'Free Muhurta Finder — Auspicious Time Calculator (Rahu Kaal)',
    description: 'Free Muhurta finder: a live 24-hour day-wheel computed from real sunrise and sunset for your location, showing the golden Abhijit and Brahma Muhurta windows to use, and Rahu Kaal, Yamaganda and Gulika Kaal periods to avoid.',
    metaDescription: 'Find Rahu Kaal, Yamaganda, Gulika, Abhijit and Brahma muhurta for any date and place, from that day’s sunrise and sunset. Free, in your browser.',
    category: 'astrology', accent: 'gold', Icon: Sun, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'nakshatra', slug: 'nakshatra', name: 'Nakshatra Explorer',
    subtitle: 'Find your birth star among 27 lunar mansions',
    seoTitle: 'Nakshatra Calculator: Find Your Birth Star',
    description: 'Free Nakshatra calculator: explore an interactive sky-wheel of all 27 lunar mansions, or enter your birth date and time to instantly find your janma nakshatra (birth star) and pada, with its ruling deity, symbol and nature.',
    metaDescription: 'Find your janma nakshatra and pada from your birth date, time and place, or explore all 27 lunar mansions on an interactive wheel. Free and private.',
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
    subtitle: 'Turn the energy upward — freedom from adult content',
    seoTitle: 'Free Urge Control Tool: Break Free From Porn (Urdhva)',
    description: 'A free, compassionate companion for breaking free from porn: a one-tap Urge SOS with guided breath and upward-energy visualisation, a growing streak, the honest science of the dopamine loop, and a 90-day path toward ūrdhvaretas.',
    metaDescription: 'A compassionate companion for quitting porn: an urge SOS with guided breathing and visualisation, a streak kept on your device and daily reflections.',
    category: 'energy', accent: 'gold', Icon: Shield, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'sadhana', slug: 'sadhana', name: 'Daily Sādhana',
    subtitle: 'Your practice home — today’s flow, moon, streak & timing',
    seoTitle: 'Daily Sādhana Tracker: Tithi, Nakshatra & Practice Streak',
    description: 'Free daily sadhana home base: see today’s tithi, nakshatra and a living moon phase at a glance, follow a three-step guided practice flow, and track your streak, the next sacred day, and today’s auspicious timing.',
    metaDescription: 'Your daily practice home: today’s tithi, nakshatra and moon phase, a three-step practice flow and a streak kept on your device. Free.',
    category: 'energy', accent: 'gold', Icon: LayoutDashboard, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'vrat-calendar', slug: 'vrat-calendar', name: 'Ekadashi & Vrat Calendar',
    subtitle: 'The sacred lunar days rising over the next six weeks',
    seoTitle: 'Free Ekadashi & Vrat Calendar — Hindu Lunar Fasting Dates',
    description: 'Free Ekadashi and vrat calendar: a living Hindu lunar calendar with an animated moon phase, computing today’s tithi and the upcoming Ekadashi, Purnima, Amavasya, Pradosh and more from the real positions of the Sun and Moon.',
    metaDescription: 'Upcoming Ekadashi, Purnima, Amavasya, Pradosh and other vrat dates for your city, worked out from tithi end times. A free Hindu lunar calendar.',
    category: 'cosmology', accent: 'cyan', Icon: CalendarDays, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'puja-aarti', slug: 'puja-aarti', name: 'Puja & Aarti',
    subtitle: 'A virtual shrine — bell, flowers, conch and a live Aarti',
    seoTitle: 'Virtual Puja & Aarti: Online Shrine With Bell & Diya',
    description: 'Free virtual puja and aarti: step into an online shrine for seven deities, ring the temple bell, offer flowers, blow the conch, or perform a full Aarti with a circling flame and each deity’s traditional invocation — all generated live, no audio files needed.',
    metaDescription: 'An online shrine for seven deities: ring the temple bell, offer flowers, blow the conch or perform an aarti with mantras and a diya. Free.',
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
