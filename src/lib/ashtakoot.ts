import type { BirthMoonPlacement } from './nakshatra';
import { NAKSHATRAS } from '@/data/nakshatras';
import {
  VARNA_BY_RASHI, VARNA_RANK, VASHYA_GROUP_BY_RASHI, vashyaPoints, RASHI_LORD, grahaMaitriPoints,
  TARA_INAUSPICIOUS_POSITIONS, ganaPoints, YONI_COMPATIBILITY, GUNA_MILAN_TIERS,
} from '@/data/ashtakoot';

export interface KootaResult { key: string; label: string; score: number; max: number; note: string }
type Gender = 'male' | 'female';

function taraPosition(fromIdx: number, toIdx: number): number {
  const count = ((toIdx - fromIdx + 27) % 27) + 1;
  return ((count - 1) % 9) + 1;
}

export function varnaKoota(a: BirthMoonPlacement, b: BirthMoonPlacement, genderA?: Gender, genderB?: Gender): KootaResult {
  const varnaA = VARNA_BY_RASHI[a.rashiIndex];
  const varnaB = VARNA_BY_RASHI[b.rashiIndex];
  let score = 1;
  if (genderA && genderB && genderA !== genderB) {
    const boyVarna = genderA === 'male' ? varnaA : varnaB;
    const girlVarna = genderA === 'male' ? varnaB : varnaA;
    score = VARNA_RANK[boyVarna] >= VARNA_RANK[girlVarna] ? 1 : 0;
  }
  return { key: 'varna', label: 'Varna', score, max: 1, note: `${varnaA} & ${varnaB} — spiritual compatibility and ego alignment.` };
}

export function vashyaKoota(a: BirthMoonPlacement, b: BirthMoonPlacement): KootaResult {
  const gA = VASHYA_GROUP_BY_RASHI[a.rashiIndex];
  const gB = VASHYA_GROUP_BY_RASHI[b.rashiIndex];
  return { key: 'vashya', label: 'Vashya', score: vashyaPoints(gA, gB), max: 2, note: `${gA} & ${gB} — mutual influence and control in the relationship.` };
}

export function taraKoota(a: BirthMoonPlacement, b: BirthMoonPlacement): KootaResult {
  const taraAB = taraPosition(a.nakshatraIndex, b.nakshatraIndex);
  const taraBA = taraPosition(b.nakshatraIndex, a.nakshatraIndex);
  const goodAB = !TARA_INAUSPICIOUS_POSITIONS.has(taraAB);
  const goodBA = !TARA_INAUSPICIOUS_POSITIONS.has(taraBA);
  const score = goodAB && goodBA ? 3 : goodAB || goodBA ? 1 : 0;
  return { key: 'tara', label: 'Tara', score, max: 3, note: 'Birth-star counting — general wellbeing and destiny alignment.' };
}

export function yoniKoota(a: BirthMoonPlacement, b: BirthMoonPlacement): KootaResult {
  const yA = NAKSHATRAS[a.nakshatraIndex].yoniIndex;
  const yB = NAKSHATRAS[b.nakshatraIndex].yoniIndex;
  return { key: 'yoni', label: 'Yoni', score: YONI_COMPATIBILITY[yA][yB], max: 4, note: 'Physical and sexual compatibility, symbolised by an animal nature.' };
}

export function grahaMaitriKoota(a: BirthMoonPlacement, b: BirthMoonPlacement): KootaResult {
  const lordA = RASHI_LORD[a.rashiIndex];
  const lordB = RASHI_LORD[b.rashiIndex];
  return { key: 'grahaMaitri', label: 'Graha Maitri', score: grahaMaitriPoints(lordA, lordB), max: 5, note: `Moon-sign lords ${lordA} & ${lordB} — mental and intellectual compatibility.` };
}

export function ganaKoota(a: BirthMoonPlacement, b: BirthMoonPlacement): KootaResult {
  const ganaA = NAKSHATRAS[a.nakshatraIndex].gana;
  const ganaB = NAKSHATRAS[b.nakshatraIndex].gana;
  return { key: 'gana', label: 'Gana', score: ganaPoints(ganaA, ganaB), max: 6, note: `${ganaA} & ${ganaB} temperament — natural disposition and behavioural harmony.` };
}

export function bhakootKoota(a: BirthMoonPlacement, b: BirthMoonPlacement): KootaResult {
  const d = ((b.rashiIndex - a.rashiIndex + 12) % 12) + 1;
  const afflicted = [2, 5, 6, 8, 9, 12].includes(d);
  return { key: 'bhakoot', label: 'Bhakoot', score: afflicted ? 0 : 7, max: 7, note: 'Moon-sign distance — emotional bond, prosperity, and family harmony.' };
}

export function nadiKoota(a: BirthMoonPlacement, b: BirthMoonPlacement): KootaResult {
  const nadiA = NAKSHATRAS[a.nakshatraIndex].nadi;
  const nadiB = NAKSHATRAS[b.nakshatraIndex].nadi;
  const same = nadiA === nadiB;
  return { key: 'nadi', label: 'Nadi', score: same ? 0 : 8, max: 8, note: same ? `Both ${nadiA} nadi — traditionally the most significant caution, relating to health and vitality of offspring.` : `${nadiA} & ${nadiB} nadi — healthy constitutional difference.` };
}

export interface AshtakootResult {
  kootas: KootaResult[];
  total: number;
  max: 36;
  tier: { label: string; tone: 'gold' | 'cyan' | 'success' | 'warning' };
}

export function ashtakootMilan(a: BirthMoonPlacement, b: BirthMoonPlacement, genderA?: Gender, genderB?: Gender): AshtakootResult {
  const kootas = [
    varnaKoota(a, b, genderA, genderB),
    vashyaKoota(a, b),
    taraKoota(a, b),
    yoniKoota(a, b),
    grahaMaitriKoota(a, b),
    ganaKoota(a, b),
    bhakootKoota(a, b),
    nadiKoota(a, b),
  ];
  const total = kootas.reduce((s, k) => s + k.score, 0);
  const tier = GUNA_MILAN_TIERS.find((t) => total >= t.min && total <= t.max) ?? GUNA_MILAN_TIERS[0];
  return { kootas, total, max: 36, tier: { label: tier.label, tone: tier.tone } };
}
