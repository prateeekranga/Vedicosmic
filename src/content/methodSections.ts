/**
 * The sections of /how-we-calculate that tool pages link to, and the tools that rely on each.
 * One table drives the links in both directions: a tool page's "How we calculate" link lands on
 * its section, and each section lists the tools that use it.
 */
export const METHOD_SECTIONS: Readonly<Record<string, readonly string[]>> = {
  ayanamsa: ['astrology', 'nakshatra'],
  'lagna-houses': ['astrology'],
  grahas: ['astrology'],
  'time-place': ['astrology', 'nakshatra', 'panchang', 'planetary-hours', 'vrat-calendar'],
  panchang: ['panchang', 'planetary-hours', 'sadhana'],
  'vrat-dates': ['vrat-calendar', 'sadhana'],
  'vimshottari-dasha': ['astrology'],
  numerology: ['loshu-grid', 'life-path', 'numerology', 'chaldean', 'mobile-numerology'],
  'numerology-loshu': ['loshu-grid', 'numerology', 'life-path'],
  'numerology-western': ['life-path', 'numerology'],
  'numerology-names': ['chaldean', 'numerology'],
  'numerology-relations': ['mobile-numerology', 'loshu-grid', 'life-path'],
};

export type MethodSectionId = keyof typeof METHOD_SECTIONS;
