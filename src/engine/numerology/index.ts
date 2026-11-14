/**
 * The numerology engine. Every numerology tool on the site calls these functions and nothing
 * else, so one person gets the same Driver, Conductor, Life Path and name numbers on every page.
 */
import type { Gender, YMD } from './core';
import { chaldeanName, type ChaldeanResult } from './chaldean';
import { LOSHU_INDIAN_STANDARD, loShu, type LoShuConfig, type LoShuResult } from './loshu';
import { normalizeName, type NameInput } from './name';
import {
  birthdayNumber, expression, karmicDebts, karmicLessons, lifePath, maturity, personality, pinnacles, soulUrge,
  type CoreNumber, type Pinnacle,
} from './pythagorean';
import type { Digit } from './core';

export * from './core';
export * from './relations';
export * from './loshu';
export * from './name';
export * from './pythagorean';
export * from './chaldean';
export * from './mobile';

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
    },
    chaldean: input.name?.trim() ? chaldeanName(input.name) : null,
  };
}
