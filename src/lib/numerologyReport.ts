/**
 * Plain-text numerology reports, built from engine results by pure functions. The print view
 * renders these, and the tests use them to confirm every tool reports the same numbers for the
 * same person.
 */
import {
  DIGITS, LOSHU_LAYOUT, NUMEROLOGY_ENGINE, formatYMD, relationsOf,
  type ChaldeanResult, type CoreNumber, type Digit, type LoShuResult, type MobileResult, type PersonalCycles, type Pinnacle,
  type WesternProfile, type YMD,
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
import { PAIR_TEXT, ROOT_FIT_TEXT, SAME_ROOT_TEXT, ZERO_TEXT, DOUBLE_TEXT } from '@/data/numerology/mobileText';

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

export function loShuSections(r: LoShuResult): ReportSection[] {
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
  sections.push({ heading: 'How this was calculated', lines: r.steps.map((s) => `${s.label}: ${s.result}. ${s.working}`) });
  return sections;
}

export function loShuReport(r: LoShuResult): Report {
  return { title: 'Lo Shu Grid', subtitle: `Date of birth: ${formatYMD(r.date)}`, sections: loShuSections(r), footer: REPORT_FOOTER };
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
  return sections;
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
  }, {
    heading: 'Neighbouring pairs',
    lines: m.pairs.map((p) => {
      const text = p.kind === 'zero' ? ZERO_TEXT : p.kind === 'double' ? DOUBLE_TEXT[p.pair[0] as Digit] : PAIR_TEXT[p.relation!];
      return `${p.pair.join('')}${p.count > 1 ? ` (×${p.count})` : ''}: ${text}`;
    }),
  }];
  if (m.withBirth) {
    const b = m.withBirth;
    const fit = (own: Digit, rel: typeof b.rootToDriver) => (own === m.root ? SAME_ROOT_TEXT : ROOT_FIT_TEXT[rel.mutual]);
    sections.push({
      heading: 'With your birth numbers',
      lines: [
        `With your Driver ${b.driver}: ${fit(b.driver, b.rootToDriver)}`,
        `With your Conductor ${b.conductor}: ${fit(b.conductor, b.rootToConductor)}`,
        b.suppliesMissing.length
          ? `The number contains ${b.suppliesMissing.join(', ')}, which ${b.suppliesMissing.length === 1 ? 'is' : 'are'} missing from your Lo Shu grid.`
          : 'The number contains none of the numbers missing from your Lo Shu grid.',
      ],
    });
  }
  return sections;
}
