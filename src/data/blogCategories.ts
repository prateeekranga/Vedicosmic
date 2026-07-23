import type { BlogCategoryId } from '@/types/blog.types';

export interface BlogCategory { id: BlogCategoryId | 'all'; label: string; description: string }

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 'all', label: 'All Posts', description: 'Every guide on VediCosmic — numerology, Vedic astrology, energy healing, cosmology, rituals and meditation.' },
  { id: 'numerology', label: 'Numerology', description: 'Life Path numbers, the Lo Shu grid, Chaldean numerology and how the numbers in your name and birth date shape your story.' },
  { id: 'astrology', label: 'Astrology', description: 'Vedic (Jyotish) birth charts, Moon signs, Nakshatras and how sidereal astrology differs from the Western zodiac.' },
  { id: 'energy', label: 'Energy & Healing', description: 'Chakras, crystals and the subtle-body practices used to sense and rebalance your energy.' },
  { id: 'cosmology', label: 'Cosmology', description: 'The Hindu lunisolar calendar, Panchang, planetary hours and the cosmic rhythms behind Vedic timing.' },
  { id: 'spiritual-living', label: 'Spiritual Living', description: 'Building a sustainable daily sadhana and bringing Vedic wisdom into ordinary, modern life.' },
  { id: 'rituals-festivals', label: 'Rituals & Festivals', description: 'Vrat, Ekadashi, puja and the meaning behind the rituals and festivals of the Vedic calendar.' },
  { id: 'meditation-yoga', label: 'Meditation & Yoga', description: 'Pranayama, sound baths and meditation techniques for calming the mind and steadying the breath.' },
];

export function getBlogCategory(id: string) {
  return BLOG_CATEGORIES.find((c) => c.id === id);
}
