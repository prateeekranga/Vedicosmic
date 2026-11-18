/**
 * The text the numerology tools show: every key is present, nothing is over-long, nothing
 * promises an outcome for health, money, the law or relationships, and every number's colour is
 * readable.
 */
import { describe, expect, it } from 'vitest';
import { claimHits } from './helpers/claims';
import { DIGITS, LOSHU_LINES, PAIR_IMPACT, PAIR_IMPACT_AS_WRITTEN, PYTHAGOREAN_VALUES, pairImpact } from '@/engine/numerology';
import { DASHA_GRID_NONE, DASHA_INTRO, DASHA_ROLE, DASHA_TEXT, FAVOURABLE_NOTE, NUMERO_VASTU_NOTE } from '@/data/numerology/dashaText';
import {
  BALANCE_TEXT, EXTRA_ROLE, HIDDEN_PASSION_TEXT, LETTER_TEXT, PLANE_TEXT, RATIONAL_THOUGHT_TEXT, SUBCONSCIOUS_TEXT,
  letterReading, rationalThoughtReading, subconsciousReading,
} from '@/data/numerology/nameExtraText';
import { MASTER_TEXT, NUMBERS } from '@/data/numerology/numbers';
import {
  KUA_TEXT, LINE_TEXT, MISSING_TEXT, RELATION_TEXT, REPEAT_TEXT, SAME_NUMBER_TEXT, lineReading, repeatReading,
} from '@/data/numerology/loshuText';
import {
  CHALLENGE_TEXT, CYCLE_TEXT, KARMIC_DEBT_TEXT, KARMIC_LESSON_TEXT, LIFE_PATH_TEXT, NUMBER_TRAIT, PINNACLE_TEXT,
} from '@/data/numerology/westernText';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import {
  CHECKLIST_INTRO, COMPARE_INTRO, ENDING_INTRO, ENDING_ZERO, GRID_INTRO, GRID_STATUS_LABEL, LEVEL_LABEL, LEVEL_NEEDS_BIRTH,
  LEVEL_TEXT, NAME_HELP, PURPOSE_HELP, REMEDY_INTRO, ROOTS_INTRO, ROOT_FIT_TEXT, SAME_ROOT_TEXT, SCORE_BAND_TEXT,
  SCORE_NEEDS_BIRTH, SCORE_NOTE, cautionText,
} from '@/data/numerology/mobileText';
import {
  IMPACT_NOTE, PAIR_READING, PAIR_READING_AS_WRITTEN, RAJ_YOG_NOTE, YOGA_LABEL, YOGA_NOTE, YOGA_PLANETS, pairReading,
} from '@/data/numerology/mobilePairText';
import { PAIR_YOGA, type MobileCaution, type PairYoga } from '@/engine/numerology';
import { AREA_IDS, AREA_KEYS, type CarefulTier, type Tone } from '@/engine/numerology';
import * as LIFE from '@/data/numerology/lifeAreaText';
import * as REM from '@/data/numerology/remedyText';

const words = (s: string) => s.trim().split(/\s+/).length;

const YOGAS = [...new Set(Object.values(PAIR_YOGA))] as PairYoga[];
/** One caution of every kind, so each sentence the page can build is linted. */
const CAUTIONS: MobileCaution[] = [
  ...YOGAS.map((yoga) => ({ kind: 'yoga' as const, yoga, written: ['14', '41'] })),
  { kind: 'ending-pair', pair: '78' }, { kind: 'overloaded', digit: 9, count: 4 }, { kind: 'run', digit: 7, length: 3 },
  { kind: 'zeros', count: 3 }, { kind: 'ends-in-zero', trailing: 1 },
];
/** The mobile number texts beyond the pair readings, with the most words each may have. */
const MOBILE_TEXT: [string, number][] = [
  [SCORE_NOTE, 40], [SCORE_NEEDS_BIRTH, 30], [ENDING_INTRO, 40], [ENDING_ZERO, 20], [GRID_INTRO, 35], [ROOTS_INTRO, 40],
  [CHECKLIST_INTRO, 35], [COMPARE_INTRO, 35], [NAME_HELP, 35], [PURPOSE_HELP, 35], [REMEDY_INTRO.weak, 40],
  [REMEDY_INTRO.good, 35], [YOGA_NOTE, 40],
  ...Object.values(SCORE_BAND_TEXT).map((t) => [t, 34] as [string, number]),
  ...CAUTIONS.map((c) => [cautionText(c), 30] as [string, number]),
];

/** Every sentence a visitor can be shown, gathered for the lint below. */
function allText(): string[] {
  const out: string[] = [...MOBILE_TEXT.map(([t]) => t),
    SAME_NUMBER_TEXT, SAME_ROOT_TEXT, LEVEL_NEEDS_BIRTH, IMPACT_NOTE, RAJ_YOG_NOTE.clear, RAJ_YOG_NOTE.weakened,
    DASHA_INTRO, DASHA_GRID_NONE, NUMERO_VASTU_NOTE, FAVOURABLE_NOTE, ...Object.values(DASHA_ROLE), ...Object.values(EXTRA_ROLE),
    ...Object.values(SUBCONSCIOUS_TEXT), ...Object.values(RATIONAL_THOUGHT_TEXT), ...Object.values(PLANE_TEXT).map((p) => p.text),
    ...Object.keys(LETTER_TEXT).map(letterReading)];
  for (const d of DIGITS) {
    const n = NUMBERS[d];
    out.push(n.strength, n.growthEdge, n.keyword, MISSING_TEXT[d].meaning, MISSING_TEXT[d].practice,
      KARMIC_LESSON_TEXT[d], CYCLE_TEXT[d].year, CYCLE_TEXT[d].short, ...REPEAT_TEXT[d],
      DASHA_TEXT[d], HIDDEN_PASSION_TEXT[d], BALANCE_TEXT[d]);
  }
  for (const t of Object.values(MASTER_TEXT)) out.push(t.text);
  for (const t of Object.values(LINE_TEXT)) out.push(t.full, t.partial, t.empty, t.theme);
  for (const t of Object.values(KUA_TEXT)) out.push(t);
  for (const t of Object.values(RELATION_TEXT)) out.push(t.text);
  out.push(...Object.values(LIFE_PATH_TEXT), ...Object.values(NUMBER_TRAIT), ...Object.values(KARMIC_DEBT_TEXT),
    ...Object.values(PINNACLE_TEXT), ...Object.values(CHALLENGE_TEXT), ...Object.values(ROOT_FIT_TEXT),
    ...Object.values(LEVEL_TEXT), ...Object.values(PAIR_READING), ...Object.values(PAIR_READING_AS_WRITTEN));
  for (let n = 10; n <= 52; n++) out.push(compoundReading(n)!.text);
  out.push(...lifeAreaTexts());
  return out;
}

/** Every sentence of the career, relationships and health part of the Lo Shu page. */
function lifeAreaTexts(): string[] {
  const out: string[] = [
    LIFE.AREAS_INTRO, LIFE.HEALTH_NOTE, LIFE.OUTLOOK_INTRO, LIFE.OUTLOOK_NOTE, LIFE.TONE_RULE, LIFE.WINDOWS_INTRO, LIFE.FOCUS_NONE, LIFE.WINDOW_NONE,
    LIFE.FOCUS_LINE.lean, LIFE.FOCUS_LINE.gentle, LIFE.REMEDY_PAGE_INTRO, LIFE.REMEDY_PRIORITY_INTRO, LIFE.REMEDY_NONE, LIFE.GEM_NOTE,
    LIFE.CAREFUL_INTRO, LIFE.CAREFUL_USE, LIFE.CAREFUL_NOTE, LIFE.CAREFUL_NONE, LIFE.SOURCES_INTRO, ...LIFE.SOURCE_TRADITION, ...LIFE.SOURCE_OWN,
    ...Object.values(LIFE.PANEL_TEXT), LIFE.DASHA_NOTE, LIFE.OWN_AREAS_NOTE, LIFE.AREA_STEP_NONE, LIFE.FOLD_OWN_AREAS, LIFE.FOLD_OWN_YEARS, LIFE.FOLD_MORE_CUSTOMS,
    LIFE.DATES_INTRO, LIFE.DATES_NONE, LIFE.CHECK_INTRO, LIFE.CHECK_MOBILE_NOTE, LIFE.STONE_LINE, ...Object.values(LIFE.CHECK_TEXT), ...Object.values(LIFE.DATES_LABEL),
    ...Object.values(LIFE.CAREFUL_TIER_TEXT).map((t) => t.text),
    LIFE.GLOSSARY_INTRO, LIFE.GRID_WHAT, LIFE.WORDS_LINK, LIFE.START_LEDE, LIFE.KUA_NOTE, LIFE.YEARS_LIMITS, LIFE.NUMBERS_NOTE, LIFE.GENTLE_LABEL,
    ...Object.values(LIFE.GENTLE_DIRECTIONS), ...LIFE.GLOSSARY.map((g) => g.text), LIFE.SUMMARY_LEDE, LIFE.START_NONE,
    LIFE.summaryStrong([], 5), LIFE.summaryStrong(['practical', 'will', 'golden', 'silver'], 1), LIFE.summaryBuild([]), LIFE.summaryBuild([2, 3, 4, 7, 8]),
    LIFE.summaryAreas('career', 'relationships'), LIFE.summaryAreas(null, null), LIFE.summaryRepeated([]), LIFE.summaryRepeated([{ digit: 6, count: 2 }, { digit: 9, count: 3 }]),
    LIFE.summaryYear(3, LIFE.yearRegard(6, 6, 3, 'neutral', 'neutral')), LIFE.summaryYear(8, LIFE.yearRegard(5, 7, 8, 'neutral', 'friend')),
    LIFE.yearRegard(6, 6, 2, 'enemy', 'enemy'), LIFE.yearRegard(5, 7, 2, 'enemy', 'enemy'), LIFE.yearRegard(5, 7, 9, 'neutral', 'friend'),
    LIFE.yearRegard(6, 6, 6, 'friend', 'friend'), LIFE.yearRegard(5, 7, 5, 'friend', 'neutral'), LIFE.yearRegard(5, 7, 7, 'neutral', 'friend'),
  ];
  for (const area of AREA_IDS) {
    out.push(...Object.values(LIFE.AREA_BAND_TEXT[area]), ...Object.values(LIFE.TONE_TEXT).map((t) => t[area]), LIFE.AREA_TEXT[area].blurb);
    for (const t of Object.values(LIFE.AREA_NUMBER_TEXT[area])) out.push(t!.role, t!.gives, t!.gap, t!.habit);
  }
  for (const d of DIGITS) {
    out.push(...AREA_IDS.map((a) => LIFE.PERIOD_AREA_TEXT[d][a]), LIFE.REMEDY_TEXT[d].charity, LIFE.REMEDY_TEXT[d].observance, LIFE.mantraLine(d), LIFE.placeAdvice(d));
  }
  for (const d of DIGITS) {
    const m = REM.MISSING_REMEDY[d];
    const e = REM.EXCESS_REMEDY[d];
    out.push(...m.daily, m.offering, m.wear, ...m.items, m.wallpaper, m.use, e.signs, ...e.balance, e.colour, ...e.items, e.wallpaper, e.give, e.speak, REM.missingNumbersAdvice(d), REM.excessNumbersAdvice(d));
  }
  out.push(REM.REPEAT_INTRO, REM.REPEAT_TWICE, REM.REPEAT_OFTEN, REM.REMEDY_PROVENANCE, ...new Set([...Object.values(REM.MISSING_LABEL), ...Object.values(REM.EXCESS_LABEL)]), REM.REPEAT_HEADING);
  out.push(LIFE.priorityWhy({ completes: [], areas: [{ area: 'career' }, { area: 'relationships' }, { area: 'health' }] }), LIFE.priorityWhy({ completes: ['golden'], areas: [] }), LIFE.priorityWhy({ completes: ['emotional'], areas: [] }));
  return out;
}

describe('numerology text: completeness', () => {
  it('covers every number, line and state', () => {
    for (const d of DIGITS) {
      expect(NUMBERS[d].n).toBe(d);
      expect(REPEAT_TEXT[d]).toHaveLength(4);
      for (const count of [1, 2, 3, 4, 7]) expect(repeatReading(d, count).length).toBeGreaterThan(20);
      expect(MISSING_TEXT[d].practice).toMatch(/^Traditionally suggested:/);
      expect(CYCLE_TEXT[d]).toBeDefined();
      expect(KARMIC_LESSON_TEXT[d]).toBeDefined();
    }
    for (const line of LOSHU_LINES) {
      for (const status of ['full', 'partial', 'single', 'empty'] as const) {
        expect(lineReading(line.id, status).length, `${line.id} ${status}`).toBeGreaterThan(20);
      }
    }
    for (const k of [1, 2, 3, 4, 6, 7, 8, 9] as const) expect(KUA_TEXT[k]).toContain(`Kua ${k} `);
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
      expect(LIFE_PATH_TEXT[n], `Life Path ${n}`).toBeDefined();
      expect(NUMBER_TRAIT[n]).toBeDefined();
    }
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]) expect(PINNACLE_TEXT[n]).toBeDefined();
    for (let n = 0; n <= 8; n++) expect(CHALLENGE_TEXT[n]).toBeDefined();
    for (const n of [13, 14, 16, 19] as const) expect(KARMIC_DEBT_TEXT[n]).toBeDefined();
  });

  it('has a reading for every compound number from 10 to 52 and none outside', () => {
    for (let n = 10; n <= 52; n++) {
      const r = compoundReading(n);
      expect(r, `compound ${n}`).not.toBeNull();
      expect(words(r!.text)).toBeLessThanOrEqual(45);
    }
    expect(compoundReading(9)).toBeNull();
    expect(compoundReading(53)).toBeNull();
    expect(compoundReading(42)).toMatchObject({ sameAs: 24, text: compoundReading(24)!.text });
  });

  it('has a class and a reading for every pair of digits from 00 to 99', () => {
    expect(Object.keys(PAIR_READING).sort()).toEqual(Object.keys(PAIR_IMPACT).sort());
    expect(Object.keys(PAIR_READING)).toHaveLength(55);
    expect(Object.keys(PAIR_READING_AS_WRITTEN).sort()).toEqual(Object.keys(PAIR_IMPACT_AS_WRITTEN).sort());
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        expect(['benefic', 'neutral', 'malefic'], `${a}${b}`).toContain(pairImpact(a, b));
        const text = pairReading(a, b);
        expect(text?.length, `${a}${b}`).toBeGreaterThan(40);
        expect(words(text), `${a}${b}`).toBeLessThanOrEqual(34);
      }
    }
    // The chart reads 12 and 21 differently; every other pair reads the same both ways round.
    expect(pairReading(2, 1)).not.toBe(pairReading(1, 2));
    expect(pairReading(7, 1)).toBe(pairReading(1, 7));
    for (const level of [1, 2, 3, 4, 5] as const) {
      expect(LEVEL_LABEL[level].length).toBeGreaterThan(2);
      expect(words(LEVEL_TEXT[level])).toBeLessThanOrEqual(34);
    }
  });

  it('labels every named yoga, grid state and caution, and keeps the mobile texts short', () => {
    for (const yoga of YOGAS) {
      expect(YOGA_LABEL[yoga]).toMatch(/ yog$/);
      expect(YOGA_PLANETS[yoga].length).toBeGreaterThan(5);
    }
    // A pair that carries a yoga names it in its reading, so the badge and the text agree.
    for (const [key, yoga] of Object.entries(PAIR_YOGA)) {
      const name = YOGA_LABEL[yoga].replace(/ yog$/, '');
      expect(PAIR_READING[key], key).toContain(name);
    }
    expect(Object.keys(GRID_STATUS_LABEL).sort()).toEqual(['introduced', 'missing', 'strengthened', 'unchanged']);
    for (const [text, max] of MOBILE_TEXT) expect(words(text), text).toBeLessThanOrEqual(max);
  });

  it('has a reading for every dasha number, name number and letter', () => {
    for (const d of DIGITS) {
      expect(words(DASHA_TEXT[d]), `dasha ${d}`).toBeLessThanOrEqual(32);
      expect(DASHA_TEXT[d]).toMatch(/^A period of /);
      expect(HIDDEN_PASSION_TEXT[d]).toContain(` ${d} `);
      expect(BALANCE_TEXT[d]).toMatch(new RegExp(`^Balance ${d}:`));
      expect(rationalThoughtReading(d)).toMatch(new RegExp(`^Rational Thought ${d} `));
    }
    for (const master of [11, 22]) expect(rationalThoughtReading(master)).toContain(`Rational Thought ${master}`);
    expect(rationalThoughtReading(33)).toBe(RATIONAL_THOUGHT_TEXT[6]);
    for (let count = 1; count <= 9; count++) expect(subconsciousReading(count).length).toBeGreaterThan(40);
    expect(subconsciousReading(2)).toBe(SUBCONSCIOUS_TEXT[3]);
    expect(Object.keys(LETTER_TEXT).sort()).toEqual(Object.keys(PYTHAGOREAN_VALUES).sort());
    for (const letter of Object.keys(LETTER_TEXT)) expect(words(letterReading(letter))).toBeLessThanOrEqual(16);
    expect(Object.keys(PLANE_TEXT).sort()).toEqual(['emotional', 'intuitive', 'mental', 'physical']);
  });

  it('keeps each piece short enough to read at a glance', () => {
    for (const d of DIGITS) {
      expect(words(NUMBERS[d].strength)).toBeLessThanOrEqual(45);
      expect(words(NUMBERS[d].growthEdge)).toBeLessThanOrEqual(45);
      for (const t of REPEAT_TEXT[d]) expect(words(t)).toBeLessThanOrEqual(30);
    }
    for (const t of Object.values(LIFE_PATH_TEXT)) expect(words(t)).toBeLessThanOrEqual(65);
  });
});

describe('career, relationships and health text', () => {
  const words = (s: string) => s.trim().split(/\s+/).length;
  const BODY = /\b(blood|pressure|sugar|diabet|kidney|liver|lung|stomach|skin|bone|joint|eyes?|heart|fever|infection|pain|therapy|treat|medicine|medication|symptom)/i;

  it('has a reading for every key number of every area, every period and every tone', () => {
    for (const area of AREA_IDS) {
      for (const k of AREA_KEYS[area].numbers) {
        const t = LIFE.AREA_NUMBER_TEXT[area][k.digit];
        expect(t, `${area} ${k.digit}`).toBeDefined();
        // The reading names the planet of the number it is about, so it cannot drift to another digit unnoticed.
        expect(t!.gives, `${area} ${k.digit} gives`).toContain(`${NUMBERS[k.digit].planet}’s number`);
        expect(t!.gap, `${area} ${k.digit} gap`).toMatch(new RegExp(`^Without an? ${k.digit}`));
      }
      expect(Object.keys(LIFE.AREA_NUMBER_TEXT[area]).sort()).toEqual(AREA_KEYS[area].numbers.map((k) => String(k.digit)).sort());
    }
    for (const d of DIGITS) for (const a of AREA_IDS) expect(LIFE.PERIOD_AREA_TEXT[d][a].length).toBeGreaterThan(40);
    for (const tone of ['supportive', 'steady', 'testing'] as Tone[]) for (const a of AREA_IDS) expect(LIFE.TONE_TEXT[tone][a].length).toBeGreaterThan(40);
    for (const tier of ['challenging', 'mixed', 'careful'] as CarefulTier[]) expect(LIFE.CAREFUL_TIER_TEXT[tier].text.length).toBeGreaterThan(30);
    for (const g of LIFE.GLOSSARY) expect(words(g.text), g.term).toBeLessThanOrEqual(48);
  });

  it('keeps each reading short enough to read at a glance', () => {
    for (const area of AREA_IDS) {
      for (const t of Object.values(LIFE.AREA_NUMBER_TEXT[area])) {
        expect(words(t!.gives), t!.gives).toBeLessThanOrEqual(26);
        expect(words(t!.gap), t!.gap).toBeLessThanOrEqual(26);
        expect(words(t!.habit), t!.habit).toBeLessThanOrEqual(26);
      }
      for (const t of Object.values(LIFE.AREA_BAND_TEXT[area])) expect(words(t), t).toBeLessThanOrEqual(34);
    }
    for (const d of DIGITS) {
      for (const a of AREA_IDS) expect(words(LIFE.PERIOD_AREA_TEXT[d][a]), `${d} ${a}`).toBeLessThanOrEqual(30);
      expect(words(LIFE.REMEDY_TEXT[d].observance)).toBeLessThanOrEqual(24);
      expect(words(LIFE.REMEDY_TEXT[d].charity)).toBeLessThanOrEqual(20);
    }
    for (const tone of ['supportive', 'steady', 'testing'] as Tone[]) for (const a of AREA_IDS) expect(words(LIFE.TONE_TEXT[tone][a])).toBeLessThanOrEqual(30);
    for (const t of [LIFE.AREAS_INTRO, LIFE.OUTLOOK_INTRO, LIFE.REMEDY_PAGE_INTRO, LIFE.CAREFUL_INTRO, LIFE.CAREFUL_USE, LIFE.GEM_NOTE, LIFE.HEALTH_NOTE]) expect(words(t), t).toBeLessThanOrEqual(62);
  });

  it('keeps health to habits and energy, and says it is not medical advice', () => {
    expect(LIFE.HEALTH_NOTE).toMatch(/not medical advice/);
    const health = Object.values(LIFE.AREA_NUMBER_TEXT.health).flatMap((t) => [t!.gives, t!.gap, t!.habit]).join(' ');
    expect(health).not.toMatch(BODY);
    expect(DIGITS.map((d) => LIFE.PERIOD_AREA_TEXT[d].health).join(' ')).not.toMatch(BODY);
  });

  it('says which planet regards which: the Driver’s and Conductor’s planets regard the year’s planet, never the reverse', () => {
    // Venus is both the Driver and the Conductor and counts the Moon unfriendly (the Moon is only neutral to Venus), so the sentence names Venus as the one doing the regarding.
    expect(LIFE.yearRegard(6, 6, 2, 'enemy', 'enemy')).toBe('Venus, the planet of your Driver and Conductor, regards the Moon as unfriendly');
    expect(LIFE.yearRegard(5, 7, 2, 'enemy', 'enemy')).toBe('Mercury (Driver) and Ketu (Conductor) both regard the Moon as unfriendly');
    expect(LIFE.yearRegard(5, 7, 9, 'neutral', 'friend')).toBe('Mercury (Driver) regards Mars as neutral; Ketu (Conductor) regards it as a friend');
  });

  it('says so when a year is the person’s own number', () => {
    expect(LIFE.yearRegard(6, 6, 6, 'friend', 'friend')).toBe('Venus is your own number, the planet of your Driver and Conductor');
    expect(LIFE.yearRegard(5, 7, 5, 'friend', 'neutral')).toBe('Mercury is your Driver’s own planet; Ketu (Conductor) regards it as neutral');
    expect(LIFE.yearRegard(5, 7, 7, 'neutral', 'friend')).toBe('Mercury (Driver) regards Ketu as neutral; Ketu is your Conductor’s own planet');
  });

  it('words the summary in plain terms for any grid', () => {
    expect(LIFE.summaryStrong(['practical', 'will'], 1)).toBe('Practical plane (getting things done) and Will plane (strong willpower).');
    expect(LIFE.summaryStrong([], 6)).toBe('No line of the square is complete. The number held most often is 6 (Venus).');
    expect(LIFE.summaryBuild([2, 3])).toBe('2 (feeling and intuition) and 3 (learning and expression).');
    expect(LIFE.summaryBuild([2, 3, 4, 7, 8])).toContain('and 1 more');
    // Said as a count, and only for an area that stands alone at that count: a tie is never settled by chance.
    expect(LIFE.summaryAreas('career', 'relationships')).toBe('Career has the most of its five key numbers present and relationships the fewest.');
    expect(LIFE.summaryAreas('health', null)).toBe('Health and energy has the most of its five key numbers present.');
    expect(LIFE.summaryAreas(null, 'relationships')).toBe('Relationships has the fewest of its five key numbers present.');
    expect(LIFE.summaryAreas(null, null)).toBe('Career, relationships and health have about the same number of key numbers present.');
    expect(LIFE.summaryYear(3, LIFE.yearRegard(6, 6, 3, 'neutral', 'neutral'))).toBe('The year of Jupiter (Antar Dasha 3): Venus, the planet of your Driver and Conductor, regards Jupiter as neutral.');
  });

  it('never promises an outcome in the outlook', () => {
    for (const t of [...Object.values(LIFE.TONE_TEXT).flatMap((x) => Object.values(x)), LIFE.OUTLOOK_NOTE, LIFE.FOCUS_LINE.lean, LIFE.FOCUS_LINE.gentle]) {
      expect(t, t).not.toMatch(/\b(you will|will definitely|certain|is sure|are sure|destined|fated)\b/i);
    }
    expect(LIFE.OUTLOOK_NOTE).toMatch(/cannot say what will happen/);
    expect(LIFE.GEM_NOTE).toMatch(/never suggests buying/);
    // The dasha outlook still times nothing; marriage years come only from the Vivah Mulank, on their own tab.
    expect(LIFE.YEARS_LIMITS).toMatch(/does not time a change of job/);
    expect(LIFE.YEARS_LIMITS).toMatch(/under Marriage years/);
    for (const stone of ['blue sapphire', 'cat’s eye', 'hessonite', 'red coral']) expect(LIFE.GEM_NOTE).toContain(stone);
  });

  it('names a mantra, a direction and a colour for every number', () => {
    for (const d of DIGITS) {
      expect(LIFE.mantraLine(d)).toContain(NUMBERS[d].mantra);
      expect(LIFE.mantraLine(d)).toMatch(/108 times/);
      expect(LIFE.dayOfNumber(d), `day of ${d}`).not.toBeNull();
      // The corner belongs to the square, so the advice names the Lo Shu direction and does not borrow a colour from a planet.
      expect(LIFE.placeAdvice(d)).toMatch(/^Lo Shu direction: /);
      expect(LIFE.placeAdvice(d)).not.toContain(NUMBERS[d].colours[0].toLowerCase());
    }
    expect(LIFE.placeAdvice(1)).toContain('North, the point 1 holds');
    expect(LIFE.placeAdvice(5)).toContain('the centre');
    expect(LIFE.placeAdvice(4)).toContain('South-East');
    expect(LIFE.weekdaysOf([1, 4, 7, 8])).toEqual(['Sunday', 'Saturday', 'Tuesday']);
    expect(LIFE.priorityWhy({ completes: [], areas: [{ area: 'relationships' }, { area: 'health' }] })).toBe('Counts in relationships and health and energy.');
    // A yog comes before any other line a number would complete.
    expect(LIFE.priorityWhy({ completes: ['mental', 'silver'], areas: [] })).toBe('Completes the Silver Raj Yog (2-5-8).');
    expect(LIFE.priorityWhy({ completes: ['emotional'], areas: [] })).toBe('Completes the Emotional plane (3-5-7).');
    expect(LIFE.priorityHabit(2, [{ area: 'relationships', weight: 2 }, { area: 'health', weight: 2 }])).toContain('open question');
    expect(LIFE.priorityHabit(7, [])).toBeNull();
  });
});

describe('remedies for missing and repeated numbers', () => {
  const words = (s: string) => s.trim().split(/\s+/).length;

  it('covers every number, in two sets', () => {
    for (const d of DIGITS) {
      expect(REM.MISSING_REMEDY[d].daily, `missing ${d}`).toHaveLength(3);
      expect(REM.MISSING_REMEDY[d].items, `missing ${d} items`).toHaveLength(5);
      expect(REM.MISSING_REMEDY[d].wallpaper.length, `missing ${d} wallpaper`).toBeGreaterThan(25);
      expect(REM.EXCESS_REMEDY[d].wallpaper.length, `excess ${d} wallpaper`).toBeGreaterThan(25);
      expect(REM.EXCESS_REMEDY[d].items, `excess ${d} items`).toHaveLength(2);
      expect(REM.EXCESS_REMEDY[d].balance, `excess ${d}`).toHaveLength(2);
      for (const t of [...REM.MISSING_REMEDY[d].daily, REM.MISSING_REMEDY[d].offering, REM.MISSING_REMEDY[d].wear, ...REM.MISSING_REMEDY[d].items, REM.MISSING_REMEDY[d].use]) expect(t.length, t).toBeGreaterThan(25);
      for (const t of [REM.EXCESS_REMEDY[d].signs, ...REM.EXCESS_REMEDY[d].balance, REM.EXCESS_REMEDY[d].colour, ...REM.EXCESS_REMEDY[d].items, REM.EXCESS_REMEDY[d].give, REM.EXCESS_REMEDY[d].speak]) expect(t.length, t).toBeGreaterThan(25);
    }
  });

  it('keeps each line short enough to read at a glance', () => {
    for (const d of DIGITS) {
      const m = REM.MISSING_REMEDY[d];
      const e = REM.EXCESS_REMEDY[d];
      for (const t of [...m.daily, m.offering, m.wear, ...m.items, m.wallpaper, m.use, e.signs, ...e.balance, e.colour, ...e.items, e.wallpaper, e.give, e.speak]) expect(words(t), t).toBeLessThanOrEqual(30);
      expect(words(REM.missingNumbersAdvice(d))).toBeLessThanOrEqual(26);
      expect(words(REM.excessNumbersAdvice(d))).toBeLessThanOrEqual(32);
    }
  });

  it('gives the Sun the remedies the tradition and the owner describe: waking early, running, water to the Sun, the mantra, gold and copper, a copper glass', () => {
    const one = REM.MISSING_REMEDY[1];
    expect(one.daily.join(' ')).toMatch(/Wake early, before sunrise/);
    expect(one.daily.join(' ')).toMatch(/run or do Surya Namaskar/);
    expect(one.offering).toMatch(/Offer water to the rising Sun/);
    expect(one.wear).toMatch(/gold, copper, deep orange/);
    expect(one.use).toMatch(/copper glass/);
    expect(LIFE.mantraLine(1)).toContain('Om Suryaya Namaha');
    // Held often, the Sun's number is read as stubbornness and ego, with the balancing customs teachers give.
    const e = REM.EXCESS_REMEDY[1];
    expect(e.signs).toMatch(/stubbornness, ego or unbalanced energy/);
    expect(e.colour).toMatch(/Go easy on strong red, gold and ruby/);
    expect(e.colour).toMatch(/green/);
    expect(e.give).toMatch(/Donate red-coloured items/);
    expect(e.speak).toMatch(/active listening/);
    expect(LIFE.placeAdvice(1)).toContain('North');
    expect(REM.excessNumbersAdvice(1)).toMatch(/go lighter on 1 in a phone, house or vehicle number/);
  });

  it('gives practical things to buy or swap in for the everyday: a watch, a pen, a bottle, a wallet', () => {
    // The owner's two examples: for 6 a watch with a gold-toned metal case and a green dial; for 5 a green pen or bottle.
    expect(REM.MISSING_REMEDY[6].items[0]).toBe('A watch with a gold-toned metal case and a green dial.');
    expect(REM.MISSING_REMEDY[5].items.join(' ')).toMatch(/A green pen/);
    expect(REM.MISSING_REMEDY[5].items.join(' ')).toMatch(/green water bottle/);
    // Every missing number names at least one object a person can buy or swap in, not only a colour.
    const objects = /\b(watch|pen|bottle|wallet|bag|diary|notebook|keychain|phone cover|handkerchief|scarf|bracelet|chain|ring|mat|shawl|flask|folder|desk|mug|cup|belt)\b/i;
    for (const d of DIGITS) for (const item of REM.MISSING_REMEDY[d].items) expect(item, `number ${d}`).toMatch(objects);
    // Every number gets the same five things, in the same order, so none is thinner than 5 or 6: a watch, a pen, a bottle or cup, a wallet or bag, a phone cover.
    const kinds = [/\bwatch\b|fitness band/i, /\bpen\b/i, /bottle|flask|mug|cup/i, /wallet|bag|pouch|handbag/i, /phone cover/i];
    for (const d of DIGITS) kinds.forEach((re, i) => expect(REM.MISSING_REMEDY[d].items[i], `number ${d}, item ${i + 1}`).toMatch(re));
    // A wallpaper that names the number's own colours, so it belongs to the number: gold for 1, green for 5, red for 9.
    for (const d of DIGITS) {
      const tokens = NUMBERS[d].colours.flatMap((c) => c.toLowerCase().split(/\s+/)).filter((t) => t.length >= 3);
      expect(tokens.some((t) => REM.MISSING_REMEDY[d].wallpaper.toLowerCase().includes(t)), `wallpaper ${d}: ${REM.MISSING_REMEDY[d].wallpaper}`).toBe(true);
      // The balancing wallpaper for a number held often puts something else in place of the strong colour.
      expect(REM.EXCESS_REMEDY[d].wallpaper, `balancing wallpaper ${d}`).toMatch(/rather than/);
    }
    // What is worn and what is carried are told apart, so the same line is not said twice.
    for (const d of DIGITS) expect(REM.MISSING_REMEDY[d].wear, `number ${d}`).not.toMatch(/\b(watch|pen|bottle|wallet|bag|notebook|keychain)\b/i);
  });

  it('names the right planet for every number, and no planet is named for another number', () => {
    const planets = ['Sun', 'Moon', 'Jupiter', 'Rahu', 'Mercury', 'Venus', 'Ketu', 'Saturn', 'Mars'];
    for (const d of DIGITS) {
      const signs = REM.EXCESS_REMEDY[d].signs;
      expect(signs, `excess ${d}`).toContain(NUMBERS[d].planet);
      for (const p of planets.filter((x) => x !== NUMBERS[d].planet)) expect(signs, `excess ${d} names ${p}`).not.toContain(p);
    }
  });

  it('uses the weekday of the planet in every offering and gift that names one', () => {
    for (const d of DIGITS) {
      const day = LIFE.dayOfNumber(d)!;
      const text = [REM.MISSING_REMEDY[d].offering, REM.EXCESS_REMEDY[d].give, LIFE.REMEDY_TEXT[d].charity].join(' ');
      for (const other of ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].filter((x) => x !== day)) expect(text, `number ${d} (${day})`).not.toContain(other);
    }
  });

  it('says plainly what is traditional here and what is this page’s own arrangement', () => {
    expect(REM.REMEDY_PROVENANCE).toMatch(/no classical text lists them/);
    expect(REM.REPEAT_INTRO).toMatch(/not a promise/);
  });
});

describe('numerology text: no promises', () => {
  it('avoids banned claim words everywhere', () => {
    expect(claimHits(allText())).toEqual([]);
  });

  it('never repeats a sentence across two readings', () => {
    const seen = new Map<string, number>();
    for (const text of allText()) seen.set(text, (seen.get(text) ?? 0) + 1);
    // Compound numbers that Cheiro reads the same share one text by design.
    const shared = new Set(Array.from({ length: 43 }, (_, i) => compoundReading(i + 10)!).filter((r) => r.sameAs).map((r) => r.text));
    const repeats = [...seen].filter(([text, count]) => count > 1 && !shared.has(text)).map(([text]) => text);
    expect(repeats).toEqual([]);
  });
});

describe('numerology colours', () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it('gives every number a distinct colour with readable ink (WCAG AA for normal text)', () => {
    const fills = DIGITS.map((d) => NUMBERS[d].colour.fill);
    expect(new Set(fills).size).toBe(9);
    for (const d of DIGITS) {
      const { fill, ink } = NUMBERS[d].colour;
      expect(contrast(fill, ink), `number ${d}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
