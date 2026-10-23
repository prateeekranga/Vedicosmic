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
  { path: '/contact', seoLabel: 'Contact', indexable: true },
  { path: '/blog', seoLabel: 'Blog', indexable: true },
  { path: '/privacy-policy', seoLabel: 'Privacy Policy', indexable: true },
  { path: '/terms', seoLabel: 'Terms of Service', indexable: true },
  { path: '/refund-policy', seoLabel: 'Refund Policy', indexable: true },
  { path: '/disclaimer', seoLabel: 'Disclaimer', indexable: true },
];

export const TOOLS: ToolMeta[] = [
  {
    id: 'numerology', slug: 'numerology', name: 'Numerology Blueprint',
    subtitle: 'Your full blueprint — animated core numbers, wheel & Lo Shu',
    seoTitle: 'Free Numerology Calculator — Life Path, Expression & Lo Shu Blueprint',
    description: 'Free numerology calculator: enter your name and birth date to reveal your Life Path, Expression, Soul Urge, Personality, Birthday and Personal Year numbers as animated orbs, a core-number wheel and your highlighted Lo Shu grid — computed instantly and privately in your browser.',
    category: 'numerology', accent: 'gold', Icon: Sparkles,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'mobile-numerology', slug: 'mobile-numerology', name: 'Mobile Number Analysis',
    subtitle: 'The vibration of your phone number',
    seoTitle: 'Free Mobile Number Numerology Calculator — Phone Number Analysis',
    description: 'Free mobile number numerology calculator: find the root number of your phone number, its repeating digit patterns, and how well it harmonises with your Life Path — including two-digit combination analysis.',
    category: 'numerology', accent: 'cyan', Icon: Smartphone,
    status: 'live', indexable: true,
  },
  {
    id: 'loshu-grid', slug: 'loshu-grid', name: 'Lo Shu Grid',
    subtitle: 'Your birth-date mapped to the sacred magic square',
    seoTitle: 'Free Lo Shu Grid Calculator — Vedic Numerology Magic Square',
    description: 'Free Lo Shu Grid calculator: drop your birth-date digits into the ancient 3×3 magic square and instantly read its ruling planets, repeated-number energies, missing numbers, and arrows of strength and weakness.',
    category: 'numerology', accent: 'gold', Icon: Grid3x3,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chaldean', slug: 'chaldean', name: 'Chaldean Numerology',
    subtitle: 'The vibration of any name, number or date',
    seoTitle: 'Free Chaldean Numerology Calculator — Name & Number Vibration',
    description: 'Free Chaldean numerology calculator: type any name, phone number or date of birth to instantly see its Chaldean compound number, reduced root number, ruling planet, and a full per-letter breakdown.',
    category: 'numerology', accent: 'cyan', Icon: Calculator,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'life-path', slug: 'life-path', name: 'Find Your Life Path',
    subtitle: 'Seven calculators & personal predictions in one',
    seoTitle: 'Free Life Path Number Calculator — Numerology Console & Predictions',
    description: 'Free Life Path number calculator and full numerology console in one: get your DOB chart, name number, lucky colours and numbers, plus a personal prediction for today, this month, and this year.',
    category: 'numerology', accent: 'violet', Icon: Wand2,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'astrology', slug: 'astrology', name: 'Vedic Birth Chart',
    subtitle: 'Your sidereal Sun, Moon & Ascendant',
    seoTitle: 'Free Vedic Birth Chart Calculator — Moon Sign & Rashi (Jyotish)',
    description: 'Free Vedic birth chart calculator: enter your birth date, time and city to cast an animated sidereal Rashi chart and discover your Moon sign, Sun sign and Ascendant — the foundation of Jyotish (Vedic astrology).',
    category: 'astrology', accent: 'violet', Icon: Telescope,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'planetary-hours', slug: 'planetary-hours', name: 'Planetary Hours',
    subtitle: 'Act in rhythm with the day’s ruling planet',
    seoTitle: 'Free Planetary Hours Calculator — Live Hora Finder',
    description: 'Free planetary hours (hora) calculator: see exactly which planet rules this very hour wherever you are, and the best activities to align with each planetary hour throughout the day and night.',
    category: 'astrology', accent: 'gold', Icon: Clock,
    status: 'live', indexable: true,
  },
  {
    id: 'planet-mandala', slug: 'planet-mandala', name: 'Navagraha Mandala',
    subtitle: 'The nine planets, alive in 360°',
    seoTitle: 'Free Navagraha Mandala — Interactive Nine Planets (Vedic Astrology)',
    description: 'A free interactive Navagraha mandala: spin a living 360° orbital map of the nine Vedic planets (grahas), watch them circle the Sun, and tap any graha to learn its meaning and mythology.',
    category: 'astrology', accent: 'violet', Icon: Orbit,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chakra-assessment', slug: 'chakra-assessment', name: 'Chakra Balance',
    subtitle: 'A 21-point energy-field assessment',
    seoTitle: 'Free Chakra Test — 21-Question Energy Balance Assessment',
    description: 'Free chakra test: answer 21 reflective questions to map the balance of your seven chakras on an animated radar chart, revealing which energy centres may need attention.',
    category: 'energy', accent: 'violet', Icon: Flower2,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'mantra-timer', slug: 'mantra-timer', name: 'Japa Mantra Counter',
    subtitle: 'Count your mala & keep a daily streak',
    seoTitle: 'Free Japa Mala Counter — 108-Bead Mantra Counter Online',
    description: 'Free 108-bead japa mala counter: chant along with eight sacred mantras, track every round with a satisfying tap, and keep a personal daily streak — no physical mala required.',
    category: 'energy', accent: 'gold', Icon: Repeat,
    status: 'live', indexable: true,
  },
  {
    id: 'tratak', slug: 'tratak', name: 'Trataka Focus',
    subtitle: 'Steady-gaze meditation in immersive full screen',
    seoTitle: 'Free Trataka Meditation — Online Candle Gazing Timer',
    description: 'Free Trataka (candle gazing) meditation guide: fix your gaze on a luminous bindu, candle flame, Om symbol or Sri Yantra in distraction-free full screen, with a timer, breath pacer, and a closing afterimage ritual.',
    category: 'energy', accent: 'violet', Icon: Eye,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'crystals', slug: 'crystals', name: 'Crystal Guide',
    subtitle: 'Find the right stone for your intention',
    seoTitle: 'Free Crystal Guide — Healing Stones by Intention',
    description: 'Free crystal guide: browse twelve healing crystals by intention (love, protection, clarity, abundance and more), learn how to use each one, and build your own personal crystal kit.',
    category: 'energy', accent: 'cyan', Icon: Gem,
    status: 'live', indexable: true,
  },
  {
    id: 'tarot', slug: 'tarot', name: 'Daily Contemplation Card',
    subtitle: 'One card a day, for reflection',
    seoTitle: 'Free Daily Tarot-Style Contemplation Card & Reflection Journal',
    description: 'A free daily contemplation card: draw one original Vedic-flavoured card each day, reflect on the prompt it offers, and keep a private journal of your insights over time.',
    category: 'energy', accent: 'teal', Icon: Layers,
    status: 'live', indexable: true,
  },
  {
    id: 'yantra', slug: 'yantra', name: 'Sacred Geometry Lab',
    subtitle: 'The mathematics behind the divine',
    seoTitle: 'Free Sacred Geometry Generator — Yantra Mathematics Explained',
    description: 'Free sacred geometry lab: watch fourteen classical yantras (including the Sri Yantra) draw themselves stroke by stroke, and learn the precise mathematics — ratios, angles, the golden ratio — encoded in each.',
    category: 'cosmology', accent: 'gold', Icon: Hexagon,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'biorhythm', slug: 'biorhythm', name: 'Biorhythm Cycles',
    subtitle: 'Your physical, emotional & intellectual waves',
    seoTitle: 'Free Biorhythm Calculator — Physical, Emotional & Intellectual Cycles',
    description: 'Free biorhythm calculator: plot your physical (23-day), emotional (28-day) and intellectual (33-day) cycles around today and see exactly where each wave sits right now.',
    category: 'cosmology', accent: 'cyan', Icon: Activity,
    status: 'live', indexable: true,
  },
  {
    id: 'vastu', slug: 'vastu', name: 'Vastu Home Guide',
    subtitle: 'The best direction for every room of your home',
    seoTitle: 'Free Vastu Shastra Compass — Best Direction for Every Room',
    description: 'Free Vastu Shastra compass: see which of the eight directions suits every room of your home — kitchen, bedroom, pooja room, entrance and more — with the element and classical reasoning behind each placement.',
    category: 'energy', accent: 'gold', Icon: Home, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'kundalini', slug: 'kundalini', name: 'Kundalini Awakening',
    subtitle: 'Raise the serpent through the seven chakras',
    seoTitle: 'Free Kundalini Meditation Guide — Guided Chakra Awakening Journey',
    description: 'A free, safety-first guided Kundalini meditation, two ways: follow the full video breath guide, or take the immersive animated journey as the coiled serpent rises through all seven chakras with rising tones, spoken bija mantras (English or हिन्दी) and selectable music.',
    category: 'energy', accent: 'gold', Icon: Flame, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'pranayama', slug: 'pranayama', name: 'Pranayama Breath Coach',
    subtitle: 'Box · 4-7-8 · Nadi Shodhana · Bhastrika',
    seoTitle: 'Free Pranayama Breathing Coach — Box, 4-7-8 & Nadi Shodhana',
    description: 'Free pranayama breathing coach: a glowing orb paces your breath through five classical techniques — Box breathing, 4-7-8, Nadi Shodhana and more — with voice pacing in English or हिन्दी and a nostril guide for alternate-nostril breathing.',
    category: 'energy', accent: 'cyan', Icon: Wind, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'soundbath', slug: 'soundbath', name: 'Cosmic Sound Bath',
    subtitle: 'Mix tanpura, bowls, Om, rain, chimes & earth hum',
    seoTitle: 'Free Online Sound Bath — Live Generative Tanpura, Bowls & Om',
    description: 'Free online sound bath: mix six sacred, generatively synthesised layers — tanpura, singing bowls, Om, rain, chimes and earth hum — live on your own sliders, with presets like Temple Rain and Deep Space. Nothing here is a recording.',
    category: 'energy', accent: 'gold', Icon: SlidersHorizontal, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'chakra-frequency-player', slug: 'chakra-frequency-player', name: 'Chakra Frequency Player',
    subtitle: 'Solfeggio & chakra tones, binaural beats and a sleep timer',
    seoTitle: 'Free Chakra Frequency & Sleep Meditation Player — Solfeggio, Binaural & Isochronic Tones',
    description: 'Free chakra frequency and sleep meditation player: choose from seven chakra tones and classic Solfeggio frequencies, layer in binaural or isochronic beats, and drift off with a crossfading sleep timer — every tone is synthesised live in your browser with the Web Audio API, not a recording.',
    category: 'energy', accent: 'cyan', Icon: AudioLines,
    isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'muhurta', slug: 'muhurta', name: 'Muhurta Finder',
    subtitle: 'Today’s auspicious & inauspicious windows',
    seoTitle: 'Free Muhurta Finder — Auspicious Time Calculator (Rahu Kaal)',
    description: 'Free Muhurta finder: a live 24-hour day-wheel computed from real sunrise and sunset for your location, showing the golden Abhijit and Brahma Muhurta windows to use, and Rahu Kaal, Yamaganda and Gulika Kaal periods to avoid.',
    category: 'astrology', accent: 'gold', Icon: Sun, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'nakshatra', slug: 'nakshatra', name: 'Nakshatra Explorer',
    subtitle: 'Find your birth star among 27 lunar mansions',
    seoTitle: 'Free Nakshatra Calculator — Find Your Birth Star (27 Lunar Mansions)',
    description: 'Free Nakshatra calculator: explore an interactive sky-wheel of all 27 lunar mansions, or enter your birth date and time to instantly find your janma nakshatra (birth star) and pada, with its ruling deity, symbol and nature.',
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
    seoTitle: 'Free Urge Control Tool — Break Free From Porn (Urdhva Shakti)',
    description: 'A free, compassionate companion for breaking free from porn: a one-tap Urge SOS with guided breath and upward-energy visualisation, a growing streak, the honest science of the dopamine loop, and a 90-day path toward ūrdhvaretas.',
    category: 'energy', accent: 'gold', Icon: Shield, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'sadhana', slug: 'sadhana', name: 'Daily Sādhana',
    subtitle: 'Your practice home — today’s flow, moon, streak & timing',
    seoTitle: 'Free Daily Sadhana Tracker — Tithi, Nakshatra & Practice Streak',
    description: 'Free daily sadhana home base: see today’s tithi, nakshatra and a living moon phase at a glance, follow a three-step guided practice flow, and track your streak, the next sacred day, and today’s auspicious timing.',
    category: 'energy', accent: 'gold', Icon: LayoutDashboard, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'vrat-calendar', slug: 'vrat-calendar', name: 'Ekadashi & Vrat Calendar',
    subtitle: 'The sacred lunar days rising over the next six weeks',
    seoTitle: 'Free Ekadashi & Vrat Calendar — Hindu Lunar Fasting Dates',
    description: 'Free Ekadashi and vrat calendar: a living Hindu lunar calendar with an animated moon phase, computing today’s tithi and the upcoming Ekadashi, Purnima, Amavasya, Pradosh and more from the real positions of the Sun and Moon.',
    category: 'cosmology', accent: 'cyan', Icon: CalendarDays, isNew: true,
    status: 'live', indexable: true,
  },
  {
    id: 'puja-aarti', slug: 'puja-aarti', name: 'Puja & Aarti',
    subtitle: 'A virtual shrine — bell, flowers, conch and a live Aarti',
    seoTitle: 'Free Virtual Puja & Aarti — Online Shrine With Bell, Diya & Mantras',
    description: 'Free virtual puja and aarti: step into an online shrine for seven deities, ring the temple bell, offer flowers, blow the conch, or perform a full Aarti with a circling flame and each deity’s traditional invocation — all generated live, no audio files needed.',
    category: 'energy', accent: 'gold', Icon: BellRing, isNew: true,
    status: 'live', indexable: true,
  },
];

export const TOOL_CATEGORIES: { id: ToolMeta['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'numerology', label: 'Numerology' },
  { id: 'astrology', label: 'Astrology' },
  { id: 'energy', label: 'Energy & Healing' },
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
