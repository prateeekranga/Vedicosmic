/**
 * Career, relationships and health through the Lo Shu grid and the dasha periods.
 *
 * What is classical here, and what is this page's own method:
 * - Classical: the planet of each number, the table of planetary friendships (relations.ts, from
 *   the Brihat Parashara Hora Shastra), the eight lines of the square, and the dasha periods of
 *   Indian numerology (numeroDasha.ts). The Brihat Parashara Hora Shastra (chapter 3, verses 12
 *   and 13) names the Sun as the soul, the Moon the mind, Mars courage, Mercury speech, Jupiter
 *   knowledge and happiness, Venus valor and Saturn sorrow.
 * - This page's method: which numbers count towards each life area, the points they earn, and how a
 *   dasha period is called supportive, steady or testing. No classical text lays down such a rule,
 *   so every step of it is written out where it is used, and each choice below is one line of data.
 *
 * Nothing here predicts. A level says how much of what the tradition links with an area is in the
 * grid; a tone says how a period's planet sits beside the person's own two planets.
 */
import { DIGITS, compareYMD, rootOf, type Digit, type YMD } from './core';
import { PLANET_OF, RELATION_TABLE, type Relation } from './relations';
import type { GridAnalysis, LineId, LineStatus, LoShuResult } from './loshu';
import {
  dashaYears, dayNumber, fromDayNumber, weekdayOf, type DashaConfig, type DashaNow, type DashaYear, type PratyantarDasha,
} from './numeroDasha';
import type { CalcStep } from './core';

export type AreaId = 'career' | 'relationships' | 'health';
export const AREA_IDS: readonly AreaId[] = ['career', 'relationships', 'health'];
export const AREA_NAME: Readonly<Record<AreaId, string>> = { career: 'Career', relationships: 'Relationships', health: 'Health and energy' };

/** Line names, repeated here so the engine's working can name them; a test keeps them in step with the readings. */
export const LINE_NAME: Readonly<Record<LineId, string>> = {
  mental: 'Mental plane', emotional: 'Emotional plane', practical: 'Practical plane', thought: 'Thought plane',
  will: 'Will plane', action: 'Action plane', golden: 'Golden Raj Yog', silver: 'Silver Raj Yog',
};

export interface AreaKey { digit: Digit; weight: 1 | 2 }
export interface AreaDefinition {
  /** The numbers whose planets the tradition links with the area; the weight is 2 for the main ones. */
  numbers: readonly AreaKey[];
  /** Lines of the square whose theme supports the area; each complete one earns a point. */
  lines: readonly LineId[];
  /**
   * How much the person's own two planets count when a period is judged. The Driver is read as
   * everyday nature and the Conductor as the direction life takes, so work leans on the Conductor,
   * while relationships and health, which are about the person day to day, lean on the Driver.
   */
  driverWeight: 1 | 2;
  conductorWeight: 1 | 2;
}

export const AREA_KEYS: Readonly<Record<AreaId, AreaDefinition>> = {
  // Saturn: work and endurance; Sun: leadership; Mercury: trade and speech; Jupiter: learning and guidance; Rahu: method.
  career: {
    numbers: [{ digit: 8, weight: 2 }, { digit: 1, weight: 2 }, { digit: 5, weight: 2 }, { digit: 3, weight: 1 }, { digit: 4, weight: 1 }],
    lines: ['golden', 'practical'], driverWeight: 1, conductorWeight: 2,
  },
  // Venus: warmth; Moon: feeling; Mercury: speech; Jupiter: goodwill; Mars: courage and protectiveness.
  relationships: {
    numbers: [{ digit: 6, weight: 2 }, { digit: 2, weight: 2 }, { digit: 5, weight: 1 }, { digit: 3, weight: 1 }, { digit: 9, weight: 1 }],
    lines: ['emotional'], driverWeight: 2, conductorWeight: 1,
  },
  // Sun: vitality; Moon: mind and rest; Mars: stamina; Saturn: routine; Mercury: balance. The Will plane carries the persistence habits need.
  health: {
    numbers: [{ digit: 1, weight: 2 }, { digit: 2, weight: 2 }, { digit: 9, weight: 2 }, { digit: 8, weight: 1 }, { digit: 5, weight: 1 }],
    lines: ['will'], driverWeight: 2, conductorWeight: 1,
  },
};

// ---------------------------------------------------------------------------------------------
// How much of an area the grid holds
// ---------------------------------------------------------------------------------------------

export interface AreaKeyState extends AreaKey { count: number; present: boolean }
export interface AreaLineState { id: LineId; status: LineStatus }
export type SupportBand = 'strong' | 'mixed' | 'thin';

export interface AreaSupport {
  area: AreaId;
  /** How many of the area's five key numbers are in the grid, and the band that count gives. */
  presentCount: number;
  keyCount: number;
  band: SupportBand;
  keys: AreaKeyState[];
  lines: AreaLineState[];
  /** Key numbers missing from the grid, heaviest first. */
  missingKeys: Digit[];
  /** This page's own arithmetic: each present key number earns its weight, each complete supporting line one. Shown only in the fold that explains it. */
  points: number;
  max: number;
  working: string;
}

/** Four or five key numbers present is strong, three mixed, two or fewer thin. */
export const bandOf = (present: number): SupportBand => (present >= 4 ? 'strong' : present === 3 ? 'mixed' : 'thin');

export function areaSupport(grid: GridAnalysis, area: AreaId): AreaSupport {
  const def = AREA_KEYS[area];
  const keys: AreaKeyState[] = def.numbers.map((k) => ({ ...k, count: grid.counts[k.digit], present: grid.counts[k.digit] > 0 }));
  const lines: AreaLineState[] = def.lines.map((id) => ({ id, status: grid.lines.find((l) => l.id === id)!.status }));
  const max = keys.reduce((a, k) => a + k.weight, 0) + lines.length;
  const earned = (k: AreaKeyState) => (k.present ? k.weight : 0);
  const points = keys.reduce((a, k) => a + earned(k), 0) + lines.filter((l) => l.status === 'full').length;
  const presentCount = keys.filter((k) => k.present).length;
  const parts = [
    ...keys.map((k) => `${k.digit} ${k.present ? 'present' : 'missing'} (${earned(k)})`),
    ...lines.map((l) => `${LINE_NAME[l.id]} ${l.status === 'full' ? 'complete (1)' : 'not complete (0)'}`),
  ];
  return {
    area, presentCount, keyCount: keys.length, band: bandOf(presentCount), keys, lines,
    missingKeys: keys.filter((k) => !k.present).sort((a, b) => b.weight - a.weight).map((k) => k.digit),
    points, max, working: `${parts.join(' + ')} = ${points} of ${max}.`,
  };
}

/** All three areas for one grid. */
export function lifeAreas(result: LoShuResult): Record<AreaId, AreaSupport> {
  return { career: areaSupport(result.full, 'career'), relationships: areaSupport(result.full, 'relationships'), health: areaSupport(result.full, 'health') };
}

// ---------------------------------------------------------------------------------------------
// How a period sits beside the person's own numbers
// ---------------------------------------------------------------------------------------------

export type Tone = 'supportive' | 'steady' | 'testing';
export interface ToneFactor { key: 'driver' | 'conductor' | 'fills' | 'repeats' | 'completes'; points: number; working: string }
export interface PeriodTone { area: AreaId; number: Digit; score: number; tone: Tone; factors: ToneFactor[] }

const REL_POINTS: Readonly<Record<Relation, number>> = { friend: 1, neutral: 0, enemy: -1 };
const REL_WORD: Readonly<Record<Relation, string>> = { friend: 'a friend', neutral: 'neutral', enemy: 'unfriendly' };
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

/** A score of +2 or more reads supportive, −2 or less testing, anything between steady. */
export const toneOf = (score: number): Tone => (score >= 2 ? 'supportive' : score <= -2 ? 'testing' : 'steady');

/**
 * One period's tone for one area. The planet of the period is set beside the Driver's planet and the
 * Conductor's, by the table of friendships, each counted by the area's weight. A period whose number
 * is one of the area's key numbers also adds one point when the grid lacks that number, because the
 * period then supplies it, and takes one away when the grid already holds it three times or more.
 * One more point is added when the number completes a line that supports the area (the dasha-grid
 * idea of numerology: a line one number short is complete for as long as the period lasts).
 */
export function periodTone(natal: LoShuResult, number: Digit, area: AreaId): PeriodTone {
  const def = AREA_KEYS[area];
  const factors: ToneFactor[] = [];
  const regard = (who: 'driver' | 'conductor', digit: Digit, weight: number) => {
    const relation = RELATION_TABLE[digit][number];
    const points = REL_POINTS[relation] * weight;
    const label = who === 'driver' ? 'Driver' : 'Conductor';
    factors.push({
      key: who, points,
      working: `${label} ${digit} (${PLANET_OF[digit]}) regards ${PLANET_OF[number]} as ${REL_WORD[relation]}${weight > 1 ? `, counted twice for this area` : ''}: ${signed(points)}`,
    });
  };
  regard('driver', natal.driver, def.driverWeight);
  regard('conductor', natal.conductor, def.conductorWeight);

  if (def.numbers.some((k) => k.digit === number)) {
    const count = natal.full.counts[number];
    if (count === 0) factors.push({ key: 'fills', points: 1, working: `${number} is missing from the grid and is one of this area’s numbers, so the period supplies it: +1` });
    else if (count >= 3) factors.push({ key: 'repeats', points: -1, working: `${number} already appears ${count} times in the grid, so the period adds to a number that is strong already: −1` });
  }
  const completed = def.lines.find((id) => {
    const line = natal.full.lines.find((l) => l.id === id)!;
    return line.status !== 'full' && line.absent.length === 1 && line.absent[0] === number;
  });
  if (completed) factors.push({ key: 'completes', points: 1, working: `Adding ${number} completes the ${LINE_NAME[completed]}, which supports this area: +1` });
  const score = factors.reduce((a, f) => a + f.points, 0);
  return { area, number, score, tone: toneOf(score), factors };
}

export interface YearOutlook {
  year: DashaYear;
  /** For each area: the tone of the year's Antar Dasha, and of the Maha Dasha behind it. */
  areas: Record<AreaId, { year: PeriodTone; background: PeriodTone }>;
}

/** One row per dasha year, starting with the year that begins on the birthday in `fromYear`. */
export function yearOutlook(natal: LoShuResult, fromYear: number, count: number, config?: DashaConfig): YearOutlook[] {
  return dashaYears(natal, fromYear, count, config).map((year) => ({
    year,
    areas: Object.fromEntries(AREA_IDS.map((area) => [area, {
      year: periodTone(natal, year.antar.number, area),
      background: periodTone(natal, year.maha.number, area),
    }])) as YearOutlook['areas'],
  }));
}

export interface WindowOutlook { period: PratyantarDasha; current: boolean; areas: Record<AreaId, PeriodTone> }

/** The nine short periods of the running year, each with its tone for the three areas. */
export function windowOutlook(natal: LoShuResult, now: DashaNow): WindowOutlook[] {
  return now.pratyantars.map((period) => ({
    period,
    current: period === now.pratyantar,
    areas: Object.fromEntries(AREA_IDS.map((area) => [area, periodTone(natal, period.number, area)])) as WindowOutlook['areas'],
  }));
}

/**
 * The most supportive short period still ahead (or running) for an area, and the most testing one.
 * Each is null when no period of that tone is left in the year.
 */
export function windowPicks(windows: readonly WindowOutlook[], area: AreaId, on: YMD): { best: WindowOutlook | null; careful: WindowOutlook | null } {
  const ahead = windows.filter((w) => compareYMD(w.period.until, on) > 0);
  const pick = (tone: Tone, better: (a: number, b: number) => boolean) => ahead
    .filter((w) => w.areas[area].tone === tone)
    .reduce<WindowOutlook | null>((top, w) => (top === null || better(w.areas[area].score, top.areas[area].score) ? w : top), null);
  return { best: pick('supportive', (a, b) => a > b), careful: pick('testing', (a, b) => a < b) };
}

/** From a year's tones: the area to lean into and the area to go gently with, when they differ in tone. */
export function yearFocus(year: YearOutlook['areas']): { lean: AreaId | null; gentle: AreaId | null } {
  const ranked = [...AREA_IDS].sort((a, b) => year[b].year.score - year[a].year.score);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  return {
    lean: year[top].year.tone === 'supportive' ? top : null,
    gentle: year[bottom].year.tone === 'testing' ? bottom : null,
  };
}

// ---------------------------------------------------------------------------------------------
// Numbers and dates to go carefully with
// ---------------------------------------------------------------------------------------------

export type CarefulTier = 'challenging' | 'mixed' | 'careful';
export interface CarefulNumber { digit: Digit; tier: CarefulTier; fromDriver: Relation; fromConductor: Relation }
export interface CarefulNumbers {
  numbers: CarefulNumber[];
  /** Days of the month (1 to 31) that add down to each tier's numbers. */
  dates: Record<CarefulTier, number[]>;
}

/**
 * Numbers whose planets the Driver's or the Conductor's planet counts as unfriendly. Unfriendly to
 * both is challenging; unfriendly to one and friendly to the other is mixed; unfriendly to one and
 * neutral to the other is careful. The person's own Driver and Conductor are never listed, even when
 * the other planet is cool towards them, because a person cannot steer clear of their own number.
 */
export function carefulNumbers(driver: Digit, conductor: Digit): CarefulNumbers {
  const numbers: CarefulNumber[] = [];
  for (const digit of DIGITS) {
    if (digit === driver || digit === conductor) continue;
    const fromDriver = RELATION_TABLE[driver][digit];
    const fromConductor = RELATION_TABLE[conductor][digit];
    if (fromDriver !== 'enemy' && fromConductor !== 'enemy') continue;
    const both = [fromDriver, fromConductor];
    const tier: CarefulTier = both.every((r) => r === 'enemy') ? 'challenging' : both.includes('friend') ? 'mixed' : 'careful';
    numbers.push({ digit, tier, fromDriver, fromConductor });
  }
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const datesFor = (tier: CarefulTier) => {
    const set = new Set(numbers.filter((n) => n.tier === tier).map((n) => n.digit));
    return days.filter((d) => set.has(rootOf(d)));
  };
  return { numbers, dates: { challenging: datesFor('challenging'), mixed: datesFor('mixed'), careful: datesFor('careful') } };
}

// ---------------------------------------------------------------------------------------------
// Where to begin with remedies
// ---------------------------------------------------------------------------------------------

export interface RemedyPriority {
  digit: Digit;
  /** Lines this missing number would complete, because it is the only number the line lacks. */
  completes: LineId[];
  /** The areas this missing number is one of the key numbers of, with its weight in each. */
  areas: { area: AreaId; weight: 1 | 2 }[];
  total: number;
}

const YOGS: readonly LineId[] = ['golden', 'silver'];

/**
 * Missing numbers in the order worth working on them. A number that would complete a Raj Yog
 * (4 for the Golden, 2 for the Silver once the others are present) comes first, then one that
 * would complete any other line, then the rest by the weight they carry across career,
 * relationships and health. A missing number that does neither (7 here, when no line is one
 * short) is still listed with every other missing number, only not among the first.
 */
export function remedyPriorities(result: LoShuResult, limit = 3): RemedyPriority[] {
  const rank = (p: RemedyPriority) => (p.completes.some((id) => YOGS.includes(id)) ? 2 : p.completes.length ? 1 : 0);
  return result.full.missing
    .map((digit) => {
      const areas = AREA_IDS.flatMap((area) => {
        const key = AREA_KEYS[area].numbers.find((k) => k.digit === digit);
        return key ? [{ area, weight: key.weight }] : [];
      });
      const completes = result.full.lines.filter((l) => l.status !== 'full' && l.absent.length === 1 && l.absent[0] === digit).map((l) => l.id);
      return { digit, completes, areas, total: areas.reduce((a, x) => a + x.weight, 0) };
    })
    .filter((p) => p.total > 0 || p.completes.length > 0)
    .sort((a, b) => rank(b) - rank(a) || b.total - a.total || a.digit - b.digit)
    .slice(0, limit);
}

/** How a number sits beside the person's own two planets: the one classical element of a period's reading. */
export function regardOf(natal: LoShuResult, number: Digit): { driver: Relation; conductor: Relation } {
  return { driver: RELATION_TABLE[natal.driver][number], conductor: RELATION_TABLE[natal.conductor][number] };
}

// ---------------------------------------------------------------------------------------------
// The working, for the page's "How this was calculated"
// ---------------------------------------------------------------------------------------------

export function lifeAreaSteps(natal: LoShuResult, now: DashaNow | null): CalcStep[] {
  const support = lifeAreas(natal);
  const steps: CalcStep[] = AREA_IDS.map((area) => ({
    key: `area-${area}`, label: `${AREA_NAME[area]}: what the grid holds`,
    working: `Each number the tradition links with ${area === 'health' ? 'health and energy' : area} earns its weight if it is in the grid, and each complete line of ${AREA_KEYS[area].lines.map((id) => LINE_NAME[id]).join(' and ')} earns 1. ${support[area].working}`,
    result: `${support[area].points} of ${support[area].max}`,
  }));
  if (now) {
    const tones = AREA_IDS.map((area) => periodTone(natal, now.antar.number, area));
    steps.push({
      key: 'outlook', label: 'Outlook for the running year',
      working: `The Antar Dasha ${now.antar.number} (${PLANET_OF[now.antar.number]}) is set beside Driver ${natal.driver} and Conductor ${natal.conductor} by the friendship table, +1 for a friend, 0 neutral, −1 unfriendly, counted by each area’s weights; +2 or more reads supportive and −2 or less testing. ${tones.map((t) => `${AREA_NAME[t.area]} ${signed(t.score)} (${t.tone})`).join('; ')}.`,
      result: tones.map((t) => t.tone).join(', '),
    });
  }
  return steps;
}

// ---------------------------------------------------------------------------------------------
// The reading in a few plain facts, dates that suit, and a check for any number
// ---------------------------------------------------------------------------------------------

export interface ReadingSummary {
  /** Complete lines of the full grid, in the order the square lists them. */
  completeLines: LineId[];
  missing: Digit[];
  /** Numbers held more than once, with their counts. */
  repeated: { digit: Digit; count: number }[];
  /** The most-held number when no line is complete: where the grid is strongest. */
  mostHeld: Digit;
  /** The one area with the most key numbers present, and the one with the fewest; null when two or more share that count. */
  strongestArea: AreaId | null;
  weakestArea: AreaId | null;
  /** The missing numbers worth starting with. */
  start: Digit[];
}

/** The few facts a first screen needs: what is strong, what to build, and where to start. */
export function readingSummary(result: LoShuResult): ReadingSummary {
  const support = lifeAreas(result);
  const present = (id: AreaId) => support[id].presentCount;
  const most = Math.max(...AREA_IDS.map(present));
  const fewest = Math.min(...AREA_IDS.map(present));
  const tops = AREA_IDS.filter((id) => present(id) === most);
  const bottoms = AREA_IDS.filter((id) => present(id) === fewest);
  const counts = result.full.counts;
  const mostHeld = [...DIGITS].sort((a, b) => counts[b] - counts[a] || a - b)[0];
  return {
    completeLines: result.full.lines.filter((l) => l.status === 'full').map((l) => l.id),
    missing: result.full.missing,
    repeated: result.full.repeated,
    mostHeld,
    // Named only when one area stands alone at that count, so a tie is never settled by chance.
    strongestArea: most > fewest && tops.length === 1 ? tops[0] : null,
    weakestArea: most > fewest && bottoms.length === 1 ? bottoms[0] : null,
    start: remedyPriorities(result, 3).map((p) => p.digit),
  };
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export interface UpcomingDate { date: YMD; weekday: string }
export interface UpcomingDates { own: UpcomingDate[]; friendly: UpcomingDate[]; careful: UpcomingDate[] }

/**
 * The next dates, counting from `today`, whose day of the month adds down to the Driver (own),
 * to a number the Driver's planet counts a friend (friendly), or to a number to go carefully with
 * (careful: the "most care" and "mild care" tiers). The same rule as the favourable dates of a month,
 * laid out on the calendar so a person can see which coming days they are.
 */
export function upcomingDates(result: LoShuResult, today: YMD, limit = 4, horizon = 62): UpcomingDates {
  const careful = new Set(carefulNumbers(result.driver, result.conductor).numbers.filter((n) => n.tier !== 'mixed').map((n) => n.digit));
  const friends = new Set<Digit>(DIGITS.filter((d) => d !== result.driver && RELATION_TABLE[result.driver][d] === 'friend'));
  const out: UpcomingDates = { own: [], friendly: [], careful: [] };
  const start = dayNumber(today);
  for (let i = 0; i < horizon; i++) {
    const date = fromDayNumber(start + i);
    const root = rootOf(date.d);
    const entry = { date, weekday: WEEKDAYS[weekdayOf(date)] };
    if (root === result.driver && out.own.length < limit) out.own.push(entry);
    else if (friends.has(root) && out.friendly.length < limit) out.friendly.push(entry);
    else if (careful.has(root) && out.careful.length < limit) out.careful.push(entry);
  }
  return out;
}

export type NumberFit = 'yours' | 'friendly' | 'neutral' | CarefulTier;
export interface NumberCheck {
  /** The digits that were counted (letters, spaces and signs are ignored). */
  digits: string;
  total: number;
  root: Digit;
  fit: NumberFit;
}

/**
 * How a phone, vehicle or house number sits beside the person's Driver and Conductor: its digits are
 * added down to one number, and that number is yours, a friend of one of yours, neutral, or one of
 * the careful tiers. Null when the text holds no digit from 1 to 9.
 */
export function checkNumber(text: string, result: LoShuResult): NumberCheck | null {
  const digits = text.replace(/[^0-9]/g, '');
  const total = [...digits].reduce((a, c) => a + Number(c), 0);
  if (total === 0) return null;
  const root = rootOf(total);
  if (root === result.driver || root === result.conductor) return { digits, total, root, fit: 'yours' };
  const tier = carefulNumbers(result.driver, result.conductor).numbers.find((n) => n.digit === root)?.tier;
  if (tier) return { digits, total, root, fit: tier };
  const friend = RELATION_TABLE[result.driver][root] === 'friend' || RELATION_TABLE[result.conductor][root] === 'friend';
  return { digits, total, root, fit: friend ? 'friendly' : 'neutral' };
}

export interface RepeatedNumber { digit: Digit; count: number; /** Held three or more times: worth balancing, not only a strength. */ often: boolean }

/** The numbers held more than once, the most often first and then by number. */
export function repeatedForRemedy(result: LoShuResult): RepeatedNumber[] {
  return [...result.full.repeated]
    .sort((a, b) => b.count - a.count || a.digit - b.digit)
    .map((r) => ({ digit: r.digit, count: r.count, often: r.count >= 3 }));
}
