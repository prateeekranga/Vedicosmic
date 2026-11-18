/**
 * The numerology engine. Every numerology tool on the site calls these functions and nothing
 * else, so one person gets the same Driver, Conductor, Life Path and name numbers on every page.
 */
import type { Gender, YMD } from './core';
import { chaldeanName, type ChaldeanResult } from './chaldean';
import { LOSHU_INDIAN_STANDARD, loShu, type LoShuConfig, type LoShuResult } from './loshu';
import { normalizeName, type NameInput } from './name';
import {
  balanceNumber, birthdayNumber, expression, hiddenPassion, karmicDebts, karmicLessons, lifePath, maturity, personality,
  pinnacles, planesOfExpression, rationalThought, soulUrge, specialLetters, subconsciousSelf,
  type BalanceNumber, type CoreNumber, type HiddenPassion, type Pinnacle, type PlanesOfExpression, type SpecialLetters,
} from './pythagorean';
import type { Digit } from './core';

export * from './core';
export * from './relations';
export * from './loshu';
export * from './name';
export * from './pythagorean';
export * from './chaldean';
export * from './mobileChart';
export * from './mobile';
export * from './numeroDasha';
export * from './lifeAreas';
export * from './vivah';
export * from './nameFit';

export { NUMEROLOGY_ENGINE } from './version';

export interface WesternProfile {
  lifePath: CoreNumber;
  birthday: CoreNumber;
  /** Null when no name was given or it has no A–Z letters. */
  expression: CoreNumber | null;
  soulUrge: CoreNumber | null;
  personality: CoreNumber | null;
  maturity: CoreNumber | null;
  karmicDebts: { debt: 13 | 14 | 16 | 19; from: string }[];
  karmicLessons: Digit[];
  pinnacles: Pinnacle[];
  /** Six further numbers read from the name; each is null when no name was given. */
  hiddenPassion: HiddenPassion | null;
  /** How many of the nine numbers the name carries. */
  subconsciousSelf: number | null;
  balance: BalanceNumber | null;
  rationalThought: CoreNumber | null;
  specialLetters: SpecialLetters | null;
  planes: PlanesOfExpression | null;
}

export interface NumerologyProfile {
  name: NameInput | null;
  loShu: LoShuResult;
  western: WesternProfile;
  chaldean: ChaldeanResult | null;
}

/** Everything about one person, in both systems, from one call. */
export function profile(
  input: { date: YMD; gender?: Gender | null; name?: string },
  config: LoShuConfig = LOSHU_INDIAN_STANDARD,
): NumerologyProfile {
  const name = input.name?.trim() ? normalizeName(input.name) : null;
  const lp = lifePath(input.date);
  const bd = birthdayNumber(input.date);
  const ex = name ? expression(name) : null;
  const su = name ? soulUrge(name) : null;
  const pe = name ? personality(name) : null;
  return {
    name,
    loShu: loShu(input.date, input.gender ?? null, config),
    western: {
      lifePath: lp, birthday: bd, expression: ex, soulUrge: su, personality: pe,
      maturity: ex ? maturity(lp, ex) : null,
      karmicDebts: karmicDebts([
        { label: 'Life Path', number: lp }, { label: 'Birthday', number: bd },
        { label: 'Expression', number: ex }, { label: 'Soul Urge', number: su }, { label: 'Personality', number: pe },
      ]),
      karmicLessons: name && name.letters ? karmicLessons(name) : [],
      pinnacles: pinnacles(input.date),
      hiddenPassion: name ? hiddenPassion(name) : null,
      subconsciousSelf: name ? subconsciousSelf(name) : null,
      balance: name ? balanceNumber(name) : null,
      rationalThought: name ? rationalThought(name, input.date) : null,
      specialLetters: name ? specialLetters(name) : null,
      planes: name ? planesOfExpression(name) : null,
    },
    chaldean: input.name?.trim() ? chaldeanName(input.name) : null,
  };
}
