/**
 * Plain-text numerology reports, built from engine results by pure functions. The print view
 * renders these, and the tests use them to confirm every tool reports the same numbers for the
 * same person.
 */
import {
  DIGITS, LOSHU_LAYOUT, LOSHU_LINES, NUMBER_DIRECTION, NUMEROLOGY_ENGINE, dashaGrid, dashaYears, favourableDates, formatYMD, relationsOf,
  type ChaldeanResult, type CoreNumber, type DashaNow, type Digit, type LineId, type LoShuResult, type MobileResult,
  type PersonalCycles, type Pinnacle, type WesternProfile, type YMD,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import {
  DIRECTION_NAME, KUA_DIRECTION_TEXT, KUA_TEXT, LINE_STATUS_LABEL, LINE_TEXT, MISSING_TEXT, RELATION_TEXT, SAME_NUMBER_TEXT,
  lineReading, repeatReading,
} from '@/data/numerology/loshuText';
import {
  CHALLENGE_TEXT, CORE_ROLE, CYCLE_TEXT, KARMIC_DEBT_TEXT, KARMIC_LESSON_TEXT, LIFE_PATH_TEXT, NUMBER_TRAIT, PINNACLE_TEXT,
} from '@/data/numerology/westernText';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import { DASHA_GRID_NONE, DASHA_TEXT, FAVOURABLE_NOTE, NUMERO_VASTU_NOTE } from '@/data/numerology/dashaText';
import {
  BALANCE_TEXT, EXTRA_ROLE, HIDDEN_PASSION_TEXT, PLANE_TEXT, letterReading, rationalThoughtReading, subconsciousReading,
} from '@/data/numerology/nameExtraText';
import { LEVEL_LABEL, LEVEL_TEXT, ROOT_FIT_TEXT, SAME_ROOT_TEXT } from '@/data/numerology/mobileText';
import { IMPACT_LABEL, IMPACT_NOTE, RAJ_YOG_NOTE, YOGA_LABEL, pairReading } from '@/data/numerology/mobilePairText';

export interface ReportSection {
  heading: string;
  lines: string[];
  /** A 3×3 grid to print, rows top to bottom; an empty string is a missing number. */
  grid?: string[][];
}
export interface Report { title: string; subtitle: string; sections: ReportSection[]; footer: string }

export const REPORT_FOOTER = `Calculated on your own device by ${NUMEROLOGY_ENGINE.name} ${NUMEROLOGY_ENGINE.version} at vedicosmic.com. `
  + 'Numerology is a tradition offered for reflection, not a prediction or advice.';

const cell = (count: number, d: Digit) => (count === 0 ? '' : count === 1 ? String(d) : `${d} ×${count}`);

/** Planet and keyword for a number, e.g. "6 (Venus, care and harmony)". */
export const describe = (d: Digit) => `${d} (${NUMBERS[d].planet}, ${NUMBERS[d].keyword.toLowerCase()})`;

/** Friendly, neutral and challenging numbers for a number, as one line each. */
export function luckyNumberLines(d: Digit): string[] {
  const r = relationsOf(d);
  const list = (xs: Digit[]) => (xs.length ? xs.join(', ') : 'none');
  return [
    `Friendly numbers for ${d}: ${list(r.friends)}.`,
    `Neutral numbers: ${list(r.neutral)}.`,
    `Numbers its planet is cool towards: ${list(r.enemies)}.`,
  ];
}

/** "Golden Raj Yog (4-5-6)". */
export const lineWithCells = (id: LineId) => `${LINE_TEXT[id].name} (${LOSHU_LINES.find((l) => l.id === id)!.cells.join('-')})`;

/** The direction a number stands for in Numero Vastu, in words. */
export const directionName = (d: Digit) => (NUMBER_DIRECTION[d] === 'centre' ? 'Centre' : DIRECTION_NAME[NUMBER_DIRECTION[d] as keyof typeof DIRECTION_NAME]);

/** The running dasha periods and the next few years, as report lines. */
export function dashaSections(r: LoShuResult, now: DashaNow): ReportSection[] {
  const period = dashaGrid(r, [now.maha.number, now.antar.number]);
  const planet = (d: Digit) => NUMBERS[d].planet;
  return [{
    heading: `Dasha periods on ${formatYMD(now.on)}`,
    lines: [
      `Maha Dasha ${now.maha.number} (${planet(now.maha.number)}), age ${now.maha.fromAge} to ${now.maha.toAge}, until ${formatYMD(now.maha.until)}. ${DASHA_TEXT[now.maha.number]}`,
      `Antar Dasha ${now.antar.number} (${planet(now.antar.number)}), ${formatYMD(now.antar.from)} until ${formatYMD(now.antar.until)}. ${DASHA_TEXT[now.antar.number]}`,
      `Pratyantar Dasha ${now.pratyantar.number} (${planet(now.pratyantar.number)}), ${formatYMD(now.pratyantar.from)} until ${formatYMD(now.pratyantar.until)}.`,
      `Grid in this period, with ${now.maha.number} and ${now.antar.number} added: ${period.newlyComplete.length ? `completes ${period.newlyComplete.map(lineWithCells).join(', ')}.` : DASHA_GRID_NONE}`,
    ],
  }, {
    heading: 'Dasha, year by year',
    lines: dashaYears(r, now.antar.year, 5).map((y) =>
      `${formatYMD(y.antar.from)} to ${formatYMD(y.antar.until)}: Maha Dasha ${y.maha.number}, Antar Dasha ${y.antar.number}; ${y.grid.newlyComplete.length ? `completes ${y.grid.newlyComplete.map(lineWithCells).join(', ')}` : 'no line added'}.`),
  }];
}

export function loShuSections(r: LoShuResult, now?: DashaNow | null): ReportSection[] {
  const sections: ReportSection[] = [];
  sections.push({
    heading: 'Your numbers',
    lines: [
      `Driver (Mulank): ${describe(r.driver)}.`,
      `Conductor (Bhagyank): ${describe(r.conductor)}.`,
      ...(r.kua ? [`Kua number: ${r.kua.mansion}${r.kua.raw === 5 ? ' (the formula gives 5, which is read as ' + r.kua.mansion + ')' : ''}.`] : []),
      r.driver === r.conductor ? SAME_NUMBER_TEXT : `Driver and Conductor: ${RELATION_TEXT[r.relation.mutual].label.toLowerCase()}. ${RELATION_TEXT[r.relation.mutual].text}`,
    ],
  });
  sections.push({
    heading: 'Lo Shu grid',
    grid: LOSHU_LAYOUT.map((row) => row.map((d) => cell(r.full.counts[d], d))),
    lines: [
      `Present: ${DIGITS.filter((d) => r.full.counts[d] > 0).map((d) => cell(r.full.counts[d], d)).join(', ')}.`,
      r.full.missing.length ? `Missing: ${r.full.missing.join(', ')}.` : 'No number is missing.',
    ],
  });
  sections.push({
    heading: 'Planes and yogs',
    lines: r.full.lines.map((l) => `${LINE_TEXT[l.id].name} (${l.cells.join('-')}), ${LINE_STATUS_LABEL[l.status].toLowerCase()}: ${lineReading(l.id, l.status)}`),
  });
  if (r.full.repeated.length) {
    sections.push({ heading: 'Repeated numbers', lines: r.full.repeated.map((x) => `${x.digit} ×${x.count}: ${repeatReading(x.digit, x.count)}`) });
  }
  if (r.full.missing.length) {
    sections.push({ heading: 'Missing numbers', lines: r.full.missing.map((d) => `${d}: ${MISSING_TEXT[d].meaning} ${MISSING_TEXT[d].practice}`) });
  }
  if (r.kua) {
    const k = r.kua;
    sections.push({
      heading: 'Kua directions',
      lines: [
        KUA_TEXT[k.mansion],
        ...(['shengQi', 'tianYi', 'yanNian', 'fuWei'] as const).map((key) =>
          `${KUA_DIRECTION_TEXT[key].name}: ${DIRECTION_NAME[k.directions[key]]}, for ${KUA_DIRECTION_TEXT[key].use}.`),
      ],
    });
  }
  if (now) sections.push(...dashaSections(r, now));
  const dates = favourableDates(r.driver);
  sections.push({
    heading: 'Favourable days, dates and colours',
    lines: [
      ...luckyNumberLines(r.driver),
      `Favourable day: ${NUMBERS[r.driver].day ?? 'none of its own'}.`,
      `Dates that add down to ${r.driver}: ${dates.own.join(', ')}.`,
      `Dates of friendly numbers: ${dates.friendly.length ? dates.friendly.join(', ') : 'none'}.`,
      `Colours linked with ${NUMBERS[r.driver].planet}: ${NUMBERS[r.driver].colours.join(', ')}. Gemstone: ${NUMBERS[r.driver].gemstone}.`,
      FAVOURABLE_NOTE,
    ],
  });
  sections.push({
    heading: 'Directions of the numbers (Numero Vastu)',
    lines: [
      DIGITS.map((d) => `${d} ${directionName(d)}`).join(', ') + '.',
      r.full.missing.length ? `Your missing numbers point to: ${r.full.missing.map((d) => `${directionName(d)} (${d})`).join(', ')}.` : 'No number is missing, so no direction is marked for attention.',
      NUMERO_VASTU_NOTE,
    ],
  });
  sections.push({ heading: 'How this was calculated', lines: [...r.steps, ...(now?.steps ?? [])].map((s) => `${s.label}: ${s.result}. ${s.working}`) });
  return sections;
}

export function loShuReport(r: LoShuResult, now?: DashaNow | null): Report {
  return { title: 'Lo Shu Grid', subtitle: `Date of birth: ${formatYMD(r.date)}`, sections: loShuSections(r, now), footer: REPORT_FOOTER };
}

/** "Month 8 + Day 6 + Year 1 = 15, then 1 + 5 = 6". */
export function coreWorking(n: CoreNumber): string {
  const sum = n.parts.reduce((a, p) => a + p.reduced, 0);
  const parts = n.parts.map((p) => `${p.label} ${p.reduced}`).join(' + ');
  const trail = n.trail.slice(1).map((t, i) => `${String(n.trail[i]).split('').join(' + ')} = ${t}`).join(', then ');
  return n.parts.length > 1 ? `${parts} = ${sum}${trail ? `, then ${trail}` : ''}` : `${n.parts[0]?.total ?? n.input}${trail ? `: ${trail}` : ''}`;
}

export const coreLabel = (n: CoreNumber) => (n.master ? `${n.value}/${n.root}` : String(n.value));

export function lifePathSections(date: YMD, lp: CoreNumber, birthday: CoreNumber, grid: LoShuResult, pins: Pinnacle[], cycles: PersonalCycles, on: YMD): ReportSection[] {
  const current = pins.find((p) => cycles.age >= p.fromAge && (p.toAge === null || cycles.age < p.toAge)) ?? pins[pins.length - 1];
  return [
    {
      heading: 'Life Path',
      lines: [
        `Life Path ${coreLabel(lp)}: ${coreWorking(lp)}.`,
        LIFE_PATH_TEXT[lp.value],
        ...(lp.alternative ? [`Adding every digit of the date in one go gives ${lp.alternative.value}; this site reduces month, day and year separately.`] : []),
        ...(lp.karmicDebt ? [KARMIC_DEBT_TEXT[lp.karmicDebt]] : []),
        `Birthday number ${coreLabel(birthday)}: ${NUMBER_TRAIT[birthday.value]}.`,
      ],
    },
    {
      heading: 'Mulank and Bhagyank',
      lines: [
        `Driver (Mulank): ${describe(grid.driver)}. ${NUMBERS[grid.driver].strength}`,
        `Conductor (Bhagyank): ${describe(grid.conductor)}. It is always the same digit as the Life Path.`,
      ],
    },
    {
      heading: 'Friendly numbers and colours',
      lines: [
        ...luckyNumberLines(grid.driver),
        `Colours traditionally linked with ${NUMBERS[grid.driver].planet}: ${NUMBERS[grid.driver].colours.join(', ')}.`,
      ],
    },
    {
      heading: `Personal cycles on ${formatYMD(on)}`,
      lines: [
        `Personal year ${cycles.year} (${CYCLE_TEXT[cycles.year].keyword}): ${CYCLE_TEXT[cycles.year].year}`,
        `Personal month ${cycles.month} (${CYCLE_TEXT[cycles.month].keyword}): ${CYCLE_TEXT[cycles.month].short}`,
        `Personal day ${cycles.day} (${CYCLE_TEXT[cycles.day].keyword}): ${CYCLE_TEXT[cycles.day].short}`,
      ],
    },
    {
      heading: 'Pinnacles and challenges',
      lines: pins.map((p) => `${p.index === current.index ? 'Now: ' : ''}Ages ${p.fromAge}${p.toAge === null ? ' onwards' : `–${p.toAge}`}: pinnacle ${p.number}. ${PINNACLE_TEXT[p.number]} ${CHALLENGE_TEXT[p.challenge]}`),
    },
  ];
}

export function westernSections(w: WesternProfile): ReportSection[] {
  const row = (label: string, role: string, n: CoreNumber | null) =>
    (n ? [`${label} ${coreLabel(n)}: ${NUMBER_TRAIT[n.value]}. ${role}`] : []);
  const sections: ReportSection[] = [{
    heading: 'Core numbers (Western)',
    lines: [
      ...row('Life Path', CORE_ROLE.lifePath, w.lifePath),
      ...row('Birthday', CORE_ROLE.birthday, w.birthday),
      ...row('Expression', CORE_ROLE.expression, w.expression),
      ...row('Soul Urge', CORE_ROLE.soulUrge, w.soulUrge),
      ...row('Personality', CORE_ROLE.personality, w.personality),
      ...row('Maturity', CORE_ROLE.maturity, w.maturity),
    ],
  }];
  if (w.karmicDebts.length || w.karmicLessons.length) {
    sections.push({
      heading: 'Karmic numbers',
      lines: [
        ...w.karmicDebts.map((k) => `${k.from}: ${KARMIC_DEBT_TEXT[k.debt]}`),
        ...w.karmicLessons.map((d) => KARMIC_LESSON_TEXT[d]),
      ],
    });
  }
  const more = moreFromNameLines(w);
  if (more.length) sections.push({ heading: 'More from your name', lines: more });
  return sections;
}

/** Hidden Passion, Subconscious Self, Balance, Rational Thought, the special letters and the planes, one line each. */
export function moreFromNameLines(w: WesternProfile): string[] {
  const lines: string[] = [];
  if (w.hiddenPassion) lines.push(...w.hiddenPassion.numbers.map((d) => `Hidden Passion ${d}: ${HIDDEN_PASSION_TEXT[d]}`));
  if (w.subconsciousSelf) lines.push(`Subconscious Self ${w.subconsciousSelf}: ${subconsciousReading(w.subconsciousSelf)}`);
  if (w.balance) lines.push(`${BALANCE_TEXT[w.balance.value]} (Initials ${w.balance.initials.map((i) => `${i.letter} ${i.value}`).join(' + ')} = ${w.balance.total}.)`);
  if (w.rationalThought) lines.push(`${rationalThoughtReading(w.rationalThought.value)} (${coreWorking(w.rationalThought)}.)`);
  if (w.specialLetters) {
    lines.push(`Cornerstone ${w.specialLetters.cornerstone}: ${EXTRA_ROLE.cornerstone} ${letterReading(w.specialLetters.cornerstone)}`);
    lines.push(`Capstone ${w.specialLetters.capstone}: ${EXTRA_ROLE.capstone} ${letterReading(w.specialLetters.capstone)}`);
    if (w.specialLetters.firstVowel) lines.push(`First Vowel ${w.specialLetters.firstVowel}: ${EXTRA_ROLE.firstVowel} ${letterReading(w.specialLetters.firstVowel)}`);
  }
  if (w.planes) {
    const p = w.planes;
    lines.push(`Planes of Expression: ${(Object.keys(p.counts) as (keyof typeof p.counts)[]).map((k) => `${PLANE_TEXT[k].name} ${p.counts[k]}`).join(', ')}. Strongest: ${p.strongest.map((k) => `${PLANE_TEXT[k].name}. ${PLANE_TEXT[k].text}`).join(' ')}`);
  }
  return lines;
}

export function chaldeanSections(c: ChaldeanResult): ReportSection[] {
  const reading = c.compoundKey ? compoundReading(c.compoundKey) : null;
  return [{
    heading: 'Chaldean name number',
    lines: [
      `Compound ${c.compound}, root ${describe(c.root)}.`,
      ...c.words.map((w) => `${w.word}: ${w.letters.map((l) => `${l.ch} ${l.value}`).join(' + ')} = ${w.total}`),
      ...(reading ? [`Compound ${c.compoundKey}${reading.symbol ? ` (${reading.symbol})` : ''}: ${reading.text}`] : []),
    ],
  }];
}

export function mobileSections(m: MobileResult): ReportSection[] {
  const sections: ReportSection[] = [{
    heading: 'Mobile number',
    lines: [
      `Digits add to ${m.total}; root ${describe(m.root)}.`,
      ...(m.heavy.length ? [`Appearing three times or more: ${m.heavy.map((h) => `${h.digit} (×${h.count})`).join(', ')}.`] : []),
      ...(m.absent.length ? [`Not in the number: ${m.absent.join(', ')}.`] : []),
    ],
  }];
  if (m.withBirth) {
    const b = m.withBirth;
    const fit = (own: Digit, rel: typeof b.rootToDriver) => (own === m.root ? SAME_ROOT_TEXT : ROOT_FIT_TEXT[rel.mutual]);
    sections.push({
      heading: 'Compatibility with your date of birth',
      lines: [
        `Compatibility level: ${LEVEL_LABEL[b.compatibility.level]}, level ${b.compatibility.level} of 5. ${LEVEL_TEXT[b.compatibility.level]}`,
        `With your Driver ${b.driver}: ${fit(b.driver, b.rootToDriver)}`,
        `With your Conductor ${b.conductor}: ${fit(b.conductor, b.rootToConductor)}`,
        b.suppliesMissing.length
          ? `The number contains ${b.suppliesMissing.join(', ')}, which ${b.suppliesMissing.length === 1 ? 'is' : 'are'} missing from your Lo Shu grid.`
          : 'The number contains none of the numbers missing from your Lo Shu grid.',
      ],
    });
  }
  sections.push({
    heading: 'Two-digit combinations',
    lines: [
      ...m.pairs.map((p) => `${p.pair.join('')}${p.count > 1 ? ` (×${p.count})` : ''}, ${IMPACT_LABEL[p.impact].toLowerCase()}${p.yoga ? `, ${YOGA_LABEL[p.yoga]}` : ''}: ${pairReading(p.pair[0], p.pair[1])}`),
      ...(m.rajYog ? [m.rajYog.weakenedByEight ? RAJ_YOG_NOTE.weakened : RAJ_YOG_NOTE.clear] : []),
      IMPACT_NOTE,
    ],
  });
  sections.push({ heading: 'How this was calculated', lines: m.steps.map((s) => `${s.label}: ${s.result}. ${s.working}`) });
  return sections;
}
