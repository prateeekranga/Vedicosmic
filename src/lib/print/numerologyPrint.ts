/**
 * Printable reports for the five numerology tools, built from engine results and the same reading
 * texts the tools show on screen. Pure functions: the tests build every report for many dates and
 * check the numbers, the sections and the wording.
 */
import {
  DIGITS, LOSHU_LINES, NUMBER_DIRECTION, PURPOSE_WORDS, RELATION_POINTS, dashaGrid, dashaYears, favourableDates, formatYMD, mahaDashas, relationTone,
  relationsOf, type CalcStep, type ChaldeanResult, type CoreNumber, type DashaNow, type Digit, type GridAnalysis,
  type LineId, type LoShuResult, type MobileResult, type NumerologyProfile, type PairRelation, type PersonalCycles,
  type Pinnacle, type YMD,
} from '@/engine/numerology';
import { NUMEROLOGY_ENGINE } from '@/engine/numerology/version';
import { NUMBERS, masterNote } from '@/data/numerology/numbers';
import {
  DIRECTION_NAME, KUA_DIRECTION_TEXT, KUA_GROUP_TEXT, KUA_TEXT, LINE_STATUS_LABEL, LINE_TEXT, MISSING_TEXT, RELATION_TEXT,
  SAME_NUMBER_TEXT, lineReading, repeatReading,
} from '@/data/numerology/loshuText';
import { DASHA_GRID_NONE, DASHA_INTRO, DASHA_ROLE, DASHA_TEXT, FAVOURABLE_NOTE, NUMERO_VASTU_NOTE } from '@/data/numerology/dashaText';
import {
  CHALLENGE_TEXT, CORE_ROLE, CYCLE_TEXT, KARMIC_DEBT_TEXT, KARMIC_LESSON_TEXT, LIFE_PATH_TEXT, NUMBER_TRAIT, PINNACLE_TEXT,
} from '@/data/numerology/westernText';
import {
  BALANCE_TEXT, EXTRA_ROLE, HIDDEN_PASSION_TEXT, PLANE_TEXT, letterReading, rationalThoughtReading, subconsciousReading,
} from '@/data/numerology/nameExtraText';
import { compoundReading } from '@/data/numerology/chaldeanCompounds';
import {
  CHECKLIST_INTRO, ENDING_INTRO, ENDING_ZERO, GRID_INTRO, GRID_STATUS_LABEL, LEVEL_LABEL, LEVEL_TEXT, NODE_DAY, PURPOSE_LABEL,
  REMEDY_INTRO, ROOTS_INTRO, ROOT_FIT_TEXT, SAME_ROOT_TEXT, SCORE_BAND_TEXT, SCORE_NOTE, SCORE_PART_LABEL, TONE_LABEL, cautionText,
} from '@/data/numerology/mobileText';
import { IMPACT_LABEL, IMPACT_NOTE, RAJ_YOG_NOTE, YOGA_LABEL, YOGA_NOTE, YOGA_PLANETS, pairReading } from '@/data/numerology/mobilePairText';
import { coreLabel, coreWorking } from '@/lib/numerologyReport';
import type { PrintBlock, PrintCard, PrintGrid, PrintReportData, PrintSection, PrintTile } from './types';

const SITE = 'vedicosmic.com';
const DISCLAIMER = 'Numerology is a tradition offered for reflection, not a prediction or advice.';
const ENGINE = `${NUMEROLOGY_ENGINE.name} ${NUMEROLOGY_ENGINE.version}`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const planet = (d: Digit) => NUMBERS[d].planet;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (xs: (string | number)[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : String(xs[0] ?? ''));
const cellsOf = (id: LineId) => LOSHU_LINES.find((l) => l.id === id)!.cells.join('-');
const lineName = (id: LineId) => `${LINE_TEXT[id].name} (${cellsOf(id)})`;
const directionOf = (d: Digit) => (NUMBER_DIRECTION[d] === 'centre' ? 'Centre' : DIRECTION_NAME[NUMBER_DIRECTION[d] as keyof typeof DIRECTION_NAME]);
const completeIn = (g: GridAnalysis): LineId[] => g.lines.filter((l) => l.status === 'full').map((l) => l.id);

/** A number tile in the colour of its digit. */
const tile = (label: string, d: Digit, caption?: string, value: string = String(d)): PrintTile => ({ label, value, digit: d, caption });

/** The grid as printed: counts, the letters for numbers that were added, and the complete lines. */
export function printGrid(r: LoShuResult, period?: { grid: GridAnalysis; maha: Digit; antar: Digit }): PrintGrid {
  const marks: Partial<Record<Digit, string[]>> = {};
  const mark = (d: Digit, letter: string) => { (marks[d] ??= []).push(letter); };
  for (const [key, s] of Object.entries(r.sources)) {
    const d = Number(key) as Digit;
    if (s.driver) mark(d, 'D');
    if (s.conductor) mark(d, 'C');
    if (s.kua) mark(d, 'K');
  }
  if (period) { mark(period.maha, 'M'); mark(period.antar, 'A'); }
  const keys: string[] = [];
  if (Object.values(r.sources).some((s) => s.driver || s.conductor || s.kua)) keys.push('D, C and K mark a number added as the Driver, Conductor or Kua.');
  if (period) keys.push('M and A mark the running Maha Dasha and Antar Dasha.');
  const grid = period ? period.grid : r.full;
  return { counts: grid.counts, marks, complete: completeIn(grid), key: keys.join(' ') || undefined };
}

/** Driver and Conductor together, as a short callout. */
function relationCallout(r: LoShuResult): PrintBlock {
  if (r.driver === r.conductor) return { kind: 'callout', title: 'Driver and Conductor together', text: SAME_NUMBER_TEXT };
  const rel = RELATION_TEXT[r.relation.mutual];
  return { kind: 'callout', title: `Driver and Conductor: ${rel.label.toLowerCase()}`, text: `${planet(r.driver)} and ${planet(r.conductor)}. ${rel.text}` };
}

function linesSection(g: GridAnalysis, id = 'lines'): PrintSection {
  const order = { full: 0, partial: 1, empty: 2, single: 3 } as const;
  const lines = [...g.lines].sort((a, b) => order[a.status] - order[b.status]);
  const cards: PrintCard[] = lines.filter((l) => l.status !== 'single').map((l) => ({
    title: LINE_TEXT[l.id].name, meta: l.cells.join('-'), badge: LINE_STATUS_LABEL[l.status],
    text: lineReading(l.id, l.status), highlight: l.status === 'full',
    extra: l.status === 'partial' ? `Missing from this line: ${l.absent.join(', ')}.` : undefined,
  }));
  const single = lines.filter((l) => l.status === 'single');
  const blocks: PrintBlock[] = [{ kind: 'cards', cards }];
  if (single.length) {
    blocks.push({
      kind: 'text', tone: 'muted',
      text: `Lightly drawn, with one number of three: ${single.map((l) => `${LINE_TEXT[l.id].name} (${l.cells.join('-')}, has ${l.present[0]})`).join('; ')}. Tradition treats such a line as an area to build with practice.`,
    });
  }
  return {
    id, title: 'Planes and Raj Yogs',
    intro: 'The square has eight lines: three rows, three columns and two diagonals. A line is complete when all three of its numbers are in the grid.',
    blocks,
  };
}

function numbersSection(g: GridAnalysis): PrintSection {
  const repeated: PrintCard[] = g.repeated.map(({ digit, count }) => ({
    chip: `${digit} ×${count}`, digit, title: `${planet(digit)} repeated`, text: repeatReading(digit, count),
  }));
  const missing: PrintCard[] = g.missing.map((d) => ({
    chip: String(d), title: `${planet(d)} missing`, meta: `Points to the ${directionOf(d)}`, text: MISSING_TEXT[d].meaning, extra: MISSING_TEXT[d].practice,
  }));
  return {
    id: 'numbers', title: 'Repeated and missing numbers',
    blocks: [{
      kind: 'columns', columns: [
        [{ kind: 'text', tone: 'lead', text: 'Repeated' }, repeated.length ? { kind: 'cards', cards: repeated, columns: 1 } : { kind: 'text', tone: 'muted', text: 'No number appears more than once.' }],
        [{ kind: 'text', tone: 'lead', text: 'Missing' }, missing.length ? { kind: 'cards', cards: missing, columns: 1 } : { kind: 'text', tone: 'muted', text: 'Every number from 1 to 9 is present.' }],
      ],
    }],
  };
}

function dashaSection(r: LoShuResult, now: DashaNow): PrintSection {
  const added = dashaGrid(r, [now.maha.number, now.antar.number]);
  const years = dashaYears(r, now.antar.year, 5);
  const mahas = mahaDashas(r.date, 90);
  const age = now.antar.year - r.date.y;
  return {
    id: 'dasha', title: 'Dasha periods', intro: `${DASHA_INTRO} ${DASHA_ROLE.maha} ${DASHA_ROLE.antar} ${DASHA_ROLE.pratyantar}`,
    blocks: [
      {
        kind: 'cards', columns: 3, cards: [
          { chip: String(now.maha.number), digit: now.maha.number, title: `Maha Dasha · ${planet(now.maha.number)}`, meta: `Age ${now.maha.fromAge} to ${now.maha.toAge}, until ${formatYMD(now.maha.until)}`, text: DASHA_TEXT[now.maha.number] },
          { chip: String(now.antar.number), digit: now.antar.number, title: `Antar Dasha · ${planet(now.antar.number)}`, meta: `${formatYMD(now.antar.from)} until ${formatYMD(now.antar.until)}`, text: DASHA_TEXT[now.antar.number], highlight: true },
          { chip: String(now.pratyantar.number), digit: now.pratyantar.number, title: `Pratyantar Dasha · ${planet(now.pratyantar.number)}`, meta: `${formatYMD(now.pratyantar.from)} until ${formatYMD(now.pratyantar.until)}`, text: DASHA_TEXT[now.pratyantar.number] },
        ],
      },
      {
        kind: 'grid', title: `Your grid until ${formatYMD(now.antar.until)}`,
        grid: printGrid(r, { grid: added.grid, maha: now.maha.number, antar: now.antar.number }),
        aside: [
          {
            kind: 'callout', title: 'This period',
            text: `With ${now.maha.number} (Maha Dasha) and ${now.antar.number} (Antar Dasha) added, ${added.newlyComplete.length ? `the grid also completes the ${list(added.newlyComplete.map(lineName))} for the time being.` : DASHA_GRID_NONE.charAt(0).toLowerCase() + DASHA_GRID_NONE.slice(1)}`,
          },
          {
            kind: 'table', head: [`Year from ${r.date.d} ${MONTHS[r.date.m - 1]}`, 'Maha', 'Antar', 'Lines added'], widths: ['27%', '19%', '19%', '35%'],
            rows: years.map((y) => ({
              cells: [`${y.antar.from.y} to ${y.antar.until.y}`, `${y.maha.number} ${planet(y.maha.number)}`, `${y.antar.number} ${planet(y.antar.number)}`,
                y.grid.newlyComplete.length ? y.grid.newlyComplete.map((id) => LINE_TEXT[id].name).join(', ') : 'None'],
              highlight: y.antar.year === now.antar.year,
            })),
          },
        ],
      },
      {
        kind: 'timeline', unit: 'age', end: 90, now: age,
        caption: `Maha Dasha through life. Each number runs for as many years as the number, starting from the Driver ${r.driver} at birth.`,
        segments: mahas.filter((m) => m.fromAge < 90).map((m) => ({ label: String(m.number), from: m.fromAge, to: Math.min(m.toAge, 90), digit: m.number, current: m.fromAge === now.maha.fromAge })),
      },
    ],
  };
}

function favourableSection(driver: Digit, id = 'favourable'): PrintSection {
  const rel = relationsOf(driver);
  const dates = favourableDates(driver);
  const n = NUMBERS[driver];
  return {
    id, title: `Favourable numbers, days and dates for ${driver}`,
    blocks: [
      {
        kind: 'facts', columns: 3, facts: [
          { label: 'Friendly numbers', value: rel.friends.join(', ') || 'None' },
          { label: 'Neutral numbers', value: rel.neutral.join(', ') || 'None' },
          { label: 'Numbers its planet is cool towards', value: rel.enemies.join(', ') || 'None' },
          { label: 'Favourable day', value: n.day ?? 'None of its own' },
          { label: `Colours linked with ${n.planet}`, value: n.colours.join(', ') },
          { label: `Gemstone linked with ${n.planet}`, value: n.gemstone },
        ],
      },
      { kind: 'dates', own: dates.own, friendly: dates.friendly, driver },
      { kind: 'text', tone: 'muted', text: FAVOURABLE_NOTE },
    ],
  };
}

function directionsSection(r: LoShuResult): PrintSection {
  const vastu: PrintBlock[] = [
    { kind: 'vastu', counts: r.full.counts },
    {
      kind: 'text',
      text: r.full.missing.length
        ? `Your missing numbers point to: ${r.full.missing.map((d) => `${directionOf(d)} (${d})`).join(', ')}.`
        : 'No number is missing, so no direction is marked for attention.',
    },
    { kind: 'text', tone: 'muted', text: NUMERO_VASTU_NOTE },
  ];
  if (!r.kua) return { id: 'directions', title: 'Directions (Numero Vastu)', blocks: vastu };
  const k = r.kua;
  return {
    id: 'directions', title: 'Directions: Numero Vastu and Kua',
    blocks: [{
      kind: 'columns', columns: [
        vastu,
        [
          { kind: 'text', tone: 'lead', text: `Kua ${k.mansion}: favourable directions` },
          {
            kind: 'table', head: ['Direction', 'Name', 'Traditionally used for'], widths: ['26%', '22%', '52%'],
            rows: (['shengQi', 'tianYi', 'yanNian', 'fuWei'] as const).map((key) => ({
              cells: [DIRECTION_NAME[k.directions[key]], KUA_DIRECTION_TEXT[key].name, cap(KUA_DIRECTION_TEXT[key].use.split(';')[0])],
            })),
          },
          { kind: 'text', tone: 'muted', text: `${KUA_TEXT[k.mansion]} ${KUA_GROUP_TEXT[k.group]}` },
        ],
      ],
    }],
  };
}

const working = (steps: CalcStep[]): PrintSection => ({ id: 'working', title: 'How this was calculated', appendix: true, blocks: [{ kind: 'steps', steps }] });

/** Lo Shu Grid Calculator. */
export function loShuPrint(r: LoShuResult, now: DashaNow | null, today: YMD): PrintReportData {
  const complete = completeIn(r.full);
  const sections: PrintSection[] = [
    {
      id: 'grid', title: 'Your Lo Shu grid', summary: true,
      blocks: [{
        kind: 'grid', grid: printGrid(r),
        aside: [
          {
            kind: 'cards', columns: 1, cards: [
              { chip: String(r.driver), digit: r.driver, title: `Driver · Mulank ${r.driver}`, meta: `${planet(r.driver)} · ${NUMBERS[r.driver].keyword}`, text: NUMBERS[r.driver].strength },
              { chip: String(r.conductor), digit: r.conductor, title: `Conductor · Bhagyank ${r.conductor}`, meta: `${planet(r.conductor)} · ${NUMBERS[r.conductor].keyword}`, text: `Its theme is ${NUMBERS[r.conductor].keyword.toLowerCase()}. ${NUMBERS[r.conductor].growthEdge}` },
              ...(r.kua ? [{ chip: String(r.kua.mansion), digit: r.kua.mansion, title: `Kua ${r.kua.mansion}`, meta: `${cap(r.kua.group)} group · ${r.kua.element}`, text: KUA_TEXT[r.kua.mansion] }] : []),
            ],
          },
          relationCallout(r),
        ],
      }],
    },
    linesSection(r.full),
    numbersSection(r.full),
    ...(now ? [dashaSection(r, now)] : []),
    favourableSection(r.driver),
    directionsSection(r),
    working([...r.steps, ...(now?.steps ?? [])]),
  ];
  return {
    toolSlug: 'loshu-grid', title: 'Lo Shu Grid Report',
    subject: { label: 'Date of birth', value: formatYMD(r.date) },
    details: r.gender ? [cap(r.gender)] : [],
    glance: [
      tile('Driver · Mulank', r.driver, planet(r.driver)),
      tile('Conductor · Bhagyank', r.conductor, planet(r.conductor)),
      r.kua ? tile('Kua number', r.kua.mansion, `${cap(r.kua.group)} group · ${r.kua.element}`) : { label: 'Kua number', value: '–', caption: 'Needs a gender' },
      { label: 'Missing numbers', value: r.full.missing.join(', ') || 'None', caption: r.full.missing.length ? `${9 - r.full.missing.length} of 9 present` : 'All nine present' },
      { label: 'Complete lines', value: String(complete.length), caption: complete.length ? complete.map((id) => LINE_TEXT[id].name).join(', ') : 'None yet' },
      ...(now ? [tile('Antar Dasha now', now.antar.number, `${planet(now.antar.number)}, until ${formatYMD(now.antar.until)}`)] : []),
    ],
    sections,
    link: `${SITE}/tools/loshu-grid`,
    method: `Date digits with the Driver, Conductor and Kua added to the grid; zeros have no cell. Dasha periods start with the Driver and turn on the birthday. ${ENGINE}.`,
    preparedOn: formatYMD(today),
    disclaimer: DISCLAIMER,
  };
}

/** Life Path Number Calculator. */
export function lifePathPrint(p: {
  date: YMD; today: YMD; lifePath: CoreNumber; birthday: CoreNumber; grid: LoShuResult; pinnacles: Pinnacle[]; cycles: PersonalCycles; steps: CalcStep[];
}): PrintReportData {
  const lp = p.lifePath;
  const master = masterNote(lp.value);
  const current = p.pinnacles.find((x) => p.cycles.age >= x.fromAge && (x.toAge === null || p.cycles.age < x.toAge)) ?? p.pinnacles[p.pinnacles.length - 1];
  const lpExtra = [
    master ? master.text : null,
    lp.karmicDebt ? KARMIC_DEBT_TEXT[lp.karmicDebt] : null,
    lp.alternative ? `Adding every digit of the date in one go gives ${lp.alternative.value}; this report reduces month, day and year separately, and the single digit is the same either way.` : null,
  ].filter(Boolean).join(' ');
  const last = p.pinnacles[p.pinnacles.length - 1];
  return {
    toolSlug: 'life-path', title: 'Life Path Report',
    subject: { label: 'Date of birth', value: formatYMD(p.date) },
    details: [],
    glance: [
      tile('Life Path', lp.root as Digit, master ? master.archetype : NUMBERS[lp.root as Digit].archetype, coreLabel(lp)),
      tile('Birthday number', p.birthday.root as Digit, NUMBERS[p.birthday.root as Digit].archetype, coreLabel(p.birthday)),
      tile('Mulank · Driver', p.grid.driver, planet(p.grid.driver)),
      tile('Bhagyank · Conductor', p.grid.conductor, planet(p.grid.conductor)),
      tile('Personal year', p.cycles.year, `${CYCLE_TEXT[p.cycles.year].keyword}, ${p.today.y}`),
      { label: 'Pinnacle now', value: String(current.number), digit: ((current.number - 1) % 9 + 1) as Digit, caption: `Ages ${current.fromAge}${current.toAge === null ? ' onwards' : ` to ${current.toAge}`}` },
    ],
    sections: [
      {
        id: 'lifepath', title: `Life Path ${coreLabel(lp)}`, summary: true,
        blocks: [{
          kind: 'cards', columns: 1, cards: [{
            chip: coreLabel(lp), digit: lp.root as Digit, title: master ? master.archetype : NUMBERS[lp.root as Digit].archetype,
            meta: `${coreWorking(lp)} · Pythagorean (Western)`, text: LIFE_PATH_TEXT[lp.value], extra: lpExtra || undefined, highlight: true,
          }],
        }],
      },
      {
        id: 'indian', title: 'Mulank, Bhagyank and Birthday number', summary: true,
        blocks: [{
          kind: 'cards', columns: 3, cards: [
            { chip: String(p.grid.driver), digit: p.grid.driver, title: `Mulank ${p.grid.driver} · ${planet(p.grid.driver)}`, meta: 'From the day you were born', text: NUMBERS[p.grid.driver].strength },
            { chip: String(p.grid.conductor), digit: p.grid.conductor, title: `Bhagyank ${p.grid.conductor} · ${planet(p.grid.conductor)}`, meta: 'From the whole date', text: NUMBERS[p.grid.conductor].growthEdge },
            { chip: coreLabel(p.birthday), digit: p.birthday.root as Digit, title: 'Birthday number', meta: CORE_ROLE.birthday, text: `Read as ${NUMBER_TRAIT[p.birthday.value]}.` },
          ],
        }],
      },
      {
        id: 'cycles', title: `Personal year, month and day on ${formatYMD(p.today)}`,
        intro: 'The personal year changes on 1 January; the month and day follow the calendar.',
        blocks: [{
          kind: 'cards', columns: 3, cards: [
            { chip: String(p.cycles.year), digit: p.cycles.year, title: `Personal year · ${CYCLE_TEXT[p.cycles.year].keyword}`, text: CYCLE_TEXT[p.cycles.year].year, highlight: true },
            { chip: String(p.cycles.month), digit: p.cycles.month, title: `Personal month · ${CYCLE_TEXT[p.cycles.month].keyword}`, text: CYCLE_TEXT[p.cycles.month].short },
            { chip: String(p.cycles.day), digit: p.cycles.day, title: `Personal day · ${CYCLE_TEXT[p.cycles.day].keyword}`, text: CYCLE_TEXT[p.cycles.day].short },
          ],
        }],
      },
      {
        id: 'pinnacles', title: 'Pinnacles and challenges',
        intro: 'Western numerology divides a life into four long chapters. Each has a pinnacle, its main theme, and a challenge that runs beside it.',
        blocks: [
          {
            kind: 'timeline', unit: 'age', end: Math.max(last.fromAge + 27, 81), now: p.cycles.age,
            segments: p.pinnacles.map((x) => ({ label: `Pinnacle ${x.number}`, from: x.fromAge, to: x.toAge, digit: ((x.number - 1) % 9 + 1) as Digit, current: x.index === current.index })),
          },
          {
            kind: 'cards', columns: 2, cards: p.pinnacles.map((x) => ({
              chip: String(x.number), digit: ((x.number - 1) % 9 + 1) as Digit,
              title: `Ages ${x.fromAge}${x.toAge === null ? ' onwards' : ` to ${x.toAge}`}`, meta: `Pinnacle ${x.number} · challenge ${x.challenge}`,
              badge: x.index === current.index ? 'Now' : undefined, text: PINNACLE_TEXT[x.number], extra: CHALLENGE_TEXT[x.challenge], highlight: x.index === current.index,
            })),
          },
        ],
      },
      favourableSection(p.grid.driver),
      working(p.steps),
    ],
    link: `${SITE}/tools/life-path`,
    method: `Life Path by the component method: month, day and year are each added down first, keeping 11, 22 and 33. ${ENGINE}.`,
    preparedOn: formatYMD(p.today),
    disclaimer: DISCLAIMER,
  };
}

/** Numerology Calculator: the Western numbers, the name numbers, the Indian grid and the Chaldean name number. */
export function numerologyPrint(p: {
  displayName: string; profile: NumerologyProfile; cycles: PersonalCycles; now: DashaNow | null; today: YMD; steps: CalcStep[];
}): PrintReportData {
  const w = p.profile.western;
  const g = p.profile.loShu;
  const ch = p.profile.chaldean;
  const core: [string, keyof typeof CORE_ROLE, CoreNumber | null][] = [
    ['Life Path', 'lifePath', w.lifePath], ['Expression', 'expression', w.expression], ['Soul Urge', 'soulUrge', w.soulUrge],
    ['Personality', 'personality', w.personality], ['Birthday', 'birthday', w.birthday], ['Maturity', 'maturity', w.maturity],
  ];
  const coreCards: PrintCard[] = core.filter(([, , n]) => n).map(([label, role, n]) => ({
    chip: coreLabel(n!), digit: n!.root as Digit, title: `${label} ${coreLabel(n!)}`, meta: CORE_ROLE[role],
    text: label === 'Life Path' ? LIFE_PATH_TEXT[n!.value] : `Read as ${NUMBER_TRAIT[n!.value]}.`, highlight: label === 'Life Path',
  }));
  const glanceCore: PrintTile[] = core.slice(0, 4).filter(([, , n]) => n).map(([label, , n]) => tile(label, n!.root as Digit, NUMBERS[n!.root as Digit].archetype, coreLabel(n!)));

  const sections: PrintSection[] = [
    {
      id: 'core', title: 'Core numbers (Western)', summary: true,
      intro: 'The Pythagorean system reads six numbers from a date of birth and a name. Master numbers 11, 22 and 33 are kept and written with their digit, for example 11/2.',
      blocks: [{ kind: 'cards', cards: coreCards }],
    },
  ];
  if (w.karmicDebts.length || w.karmicLessons.length) {
    sections.push({
      id: 'karmic', title: 'Karmic numbers',
      blocks: [{
        kind: 'cards', cards: [
          ...w.karmicDebts.map((k) => ({ chip: String(k.debt), title: `Karmic debt ${k.debt}`, meta: `Behind the ${k.from}`, text: KARMIC_DEBT_TEXT[k.debt] })),
          ...w.karmicLessons.map((d) => ({ chip: String(d), digit: d, title: `Karmic lesson ${d}`, meta: planet(d), text: KARMIC_LESSON_TEXT[d] })),
        ],
      }],
    });
  }
  if (w.hiddenPassion || w.balance || w.specialLetters || w.planes) {
    const cards: PrintCard[] = [
      ...(w.hiddenPassion ? w.hiddenPassion.numbers.map((d) => ({ chip: String(d), digit: d, title: 'Hidden Passion', meta: EXTRA_ROLE.hiddenPassion, text: HIDDEN_PASSION_TEXT[d] })) : []),
      ...(w.subconsciousSelf ? [{ chip: String(w.subconsciousSelf), digit: w.subconsciousSelf as Digit, title: 'Subconscious Self', meta: EXTRA_ROLE.subconsciousSelf, text: subconsciousReading(w.subconsciousSelf) }] : []),
      ...(w.balance ? [{ chip: String(w.balance.value), digit: w.balance.value, title: 'Balance', meta: EXTRA_ROLE.balance, text: BALANCE_TEXT[w.balance.value] }] : []),
      ...(w.rationalThought ? [{ chip: coreLabel(w.rationalThought), digit: w.rationalThought.root as Digit, title: 'Rational Thought', meta: EXTRA_ROLE.rationalThought, text: rationalThoughtReading(w.rationalThought.value) }] : []),
    ];
    const letters: PrintCard[] = w.specialLetters ? [
      { chip: w.specialLetters.cornerstone, title: 'Cornerstone', meta: EXTRA_ROLE.cornerstone, text: letterReading(w.specialLetters.cornerstone) },
      { chip: w.specialLetters.capstone, title: 'Capstone', meta: EXTRA_ROLE.capstone, text: letterReading(w.specialLetters.capstone) },
      w.specialLetters.firstVowel
        ? { chip: w.specialLetters.firstVowel, title: 'First Vowel', meta: EXTRA_ROLE.firstVowel, text: letterReading(w.specialLetters.firstVowel) }
        : { chip: '–', title: 'First Vowel', meta: EXTRA_ROLE.firstVowel, text: 'The first name has none of A, E, I, O, U, so it has no First Vowel.' },
    ] : [];
    const planes = w.planes;
    sections.push({
      id: 'name', title: 'More from your name',
      blocks: [
        { kind: 'cards', cards },
        ...(letters.length ? [{ kind: 'cards' as const, cards: letters, columns: 3 as const }] : []),
        ...(planes ? [
          { kind: 'text' as const, tone: 'lead' as const, text: 'Planes of Expression' },
          {
            kind: 'bars' as const,
            bars: (['physical', 'mental', 'emotional', 'intuitive'] as const).map((k) => ({
              label: PLANE_TEXT[k].name, sub: PLANE_TEXT[k].letters, value: planes.counts[k] / Math.max(...Object.values(planes.counts), 1),
              display: `${planes.counts[k]} ${planes.counts[k] === 1 ? 'letter' : 'letters'}${planes.strongest.includes(k) && planes.counts[k] > 0 ? ', strongest' : ''}`,
            })),
          },
          { kind: 'text' as const, text: planes.strongest.map((k) => `${PLANE_TEXT[k].name}. ${PLANE_TEXT[k].text}`).join(' ') },
        ] : []),
      ],
    });
  }
  sections.push({
    id: 'grid', title: 'Indian numbers and Lo Shu grid',
    blocks: [{
      kind: 'grid', grid: printGrid(g),
      aside: [
        {
          kind: 'cards', columns: 1, cards: [
            { chip: String(g.driver), digit: g.driver, title: `Mulank · Driver ${g.driver}`, meta: `${planet(g.driver)} · from the day you were born`, text: NUMBERS[g.driver].strength },
            { chip: String(g.conductor), digit: g.conductor, title: `Bhagyank · Conductor ${g.conductor}`, meta: `${planet(g.conductor)} · from the whole date`, text: NUMBERS[g.conductor].growthEdge },
            ...(g.kua ? [{ chip: String(g.kua.mansion), digit: g.kua.mansion, title: `Kua ${g.kua.mansion}`, meta: 'Eight Mansions', text: KUA_TEXT[g.kua.mansion] }] : []),
          ],
        },
        {
          kind: 'text',
          text: completeIn(g.full).length
            ? `Complete lines: ${list(completeIn(g.full).map(lineName))}. ${g.full.missing.length ? `Missing: ${g.full.missing.join(', ')}.` : 'No number is missing.'}`
            : `No line of three is complete yet. ${g.full.missing.length ? `Missing: ${g.full.missing.join(', ')}.` : ''}`,
        },
      ],
    }],
  });
  if (p.now) {
    sections.push({
      id: 'dasha', title: 'Dasha periods now',
      blocks: [{
        kind: 'cards', columns: 3, cards: [
          { chip: String(p.now.maha.number), digit: p.now.maha.number, title: `Maha Dasha · ${planet(p.now.maha.number)}`, meta: `Age ${p.now.maha.fromAge} to ${p.now.maha.toAge}`, text: DASHA_TEXT[p.now.maha.number] },
          { chip: String(p.now.antar.number), digit: p.now.antar.number, title: `Antar Dasha · ${planet(p.now.antar.number)}`, meta: `Until ${formatYMD(p.now.antar.until)}`, text: DASHA_TEXT[p.now.antar.number], highlight: true },
          { chip: String(p.now.pratyantar.number), digit: p.now.pratyantar.number, title: `Pratyantar Dasha · ${planet(p.now.pratyantar.number)}`, meta: `Until ${formatYMD(p.now.pratyantar.until)}`, text: DASHA_TEXT[p.now.pratyantar.number] },
        ],
      }],
    });
  }
  if (ch) {
    const reading = ch.compoundKey ? compoundReading(ch.compoundKey) : null;
    sections.push({
      id: 'chaldean', title: 'Name number (Chaldean)',
      blocks: [
        { kind: 'letters', words: ch.words.map((x) => ({ word: x.word, letters: x.letters, total: String(x.total) })) },
        {
          kind: 'cards', columns: 1, cards: [{
            chip: String(ch.root), digit: ch.root, title: `Compound ${ch.compound} · root ${ch.root} (${planet(ch.root)})`,
            meta: reading?.symbol ? `Cheiro: ${reading.symbol}` : 'Cheiro’s Chaldean values',
            text: reading ? reading.text : 'The name adds to a single digit, so it has a root number but no compound number.',
          }],
        },
      ],
    });
  }
  sections.push(
    {
      id: 'year', title: `Personal year ${p.today.y}`,
      blocks: [{ kind: 'cards', columns: 1, cards: [{ chip: String(p.cycles.year), digit: p.cycles.year, title: `Personal year ${p.cycles.year} · ${CYCLE_TEXT[p.cycles.year].keyword}`, text: CYCLE_TEXT[p.cycles.year].year }] }],
    },
    working(p.steps),
  );

  return {
    toolSlug: 'numerology', title: 'Numerology Report',
    subject: { label: 'Name', value: p.displayName },
    details: [`Born ${formatYMD(g.date)}`, ...(g.gender ? [cap(g.gender)] : [])],
    glance: [
      ...glanceCore,
      tile('Mulank · Driver', g.driver, planet(g.driver)),
      tile('Bhagyank · Conductor', g.conductor, planet(g.conductor)),
    ],
    sections,
    link: `${SITE}/tools/numerology`,
    method: `Western numbers use Pythagorean letter values and the component method; the grid, Mulank, Bhagyank and dasha follow the Indian Lo Shu method; the name number uses Cheiro’s Chaldean values. ${ENGINE}.`,
    preparedOn: formatYMD(p.today),
    disclaimer: DISCLAIMER,
  };
}

/** Chaldean Numerology Calculator, with an optional second spelling. */
export function chaldeanPrint(p: { entry: string; result: ChaldeanResult; second: ChaldeanResult | null; secondEntry: string; western: CoreNumber | null; today: YMD }): PrintReportData {
  const r = p.result;
  const reading = r.compoundKey ? compoundReading(r.compoundKey) : null;
  const notes = [
    reading && r.compoundKey !== r.compound ? `${r.compound} is above 52, so its digits are added to reach ${r.compoundKey}.` : null,
    reading?.sameAs ? `Cheiro gives ${reading.number} the same reading as ${reading.sameAs}.` : null,
  ].filter(Boolean).join(' ');
  const sections: PrintSection[] = [
    {
      id: 'number', title: 'Name number', summary: true,
      blocks: [{
        kind: 'cards', columns: 2, cards: [
          { chip: String(r.root), digit: r.root, title: `Root ${r.root} · ${planet(r.root)}`, meta: NUMBERS[r.root].keyword, text: NUMBERS[r.root].strength, extra: NUMBERS[r.root].growthEdge },
          {
            chip: String(r.compound), title: reading ? `Compound ${r.compoundKey}${reading.symbol ? ` · ${reading.symbol}` : ''}` : `Total ${r.compound}`,
            meta: 'After Cheiro, Book of Numbers (1926)', text: reading ? reading.text : 'The name adds to a single digit, so it has a root number but no compound number.',
            extra: notes || undefined, highlight: true,
          },
        ],
      }],
    },
    {
      id: 'letters', title: 'Letter by letter',
      blocks: [
        { kind: 'letters', words: r.words.map((x) => ({ word: x.word, letters: x.letters, total: `${x.total} (${x.root})` })) },
        ...(r.words.length > 1 ? [{ kind: 'text' as const, tone: 'muted' as const, text: `Some teachers add each word down first and then add the roots: ${r.words.map((x) => x.root).join(' + ')} = ${r.perWordTotal}. The root is the same either way.` }] : []),
        ...(p.western ? [{ kind: 'text' as const, tone: 'muted' as const, text: `For comparison, the Western (Pythagorean) letter values give this name an Expression number of ${coreLabel(p.western)}. The two systems use different tables, so the numbers need not match.` }] : []),
      ],
    },
  ];
  if (p.second) {
    const s = p.second;
    sections.push({
      id: 'compare', title: 'Two spellings compared', summary: true,
      blocks: [
        {
          kind: 'table', head: ['Spelling', 'Compound', 'Root', 'Planet'], widths: ['46%', '18%', '14%', '22%'],
          rows: [
            { cells: [p.entry.trim(), String(r.compound), String(r.root), planet(r.root)] },
            { cells: [p.secondEntry.trim(), String(s.compound), String(s.root), planet(s.root)] },
          ],
        },
        {
          kind: 'text',
          text: s.root === r.root
            ? `Both spellings come to the same root, ${r.root}; only the compound number differs (${r.compound} and ${s.compound}).`
            : `The spellings give different roots: ${r.root} (${planet(r.root)}) and ${s.root} (${planet(s.root)}).`,
        },
      ],
    });
  }
  sections.push(working(r.steps));
  return {
    toolSlug: 'chaldean', title: 'Chaldean Name Report',
    subject: { label: 'Name', value: p.entry.trim() },
    details: p.second ? [`Compared with: ${p.secondEntry.trim()}`] : [],
    glance: [
      tile('Root number', r.root, planet(r.root)),
      { label: 'Compound number', value: String(r.compound), caption: reading?.symbol ?? 'Chaldean total' },
      ...(p.western ? [tile('Expression (Western)', p.western.root as Digit, 'For comparison', coreLabel(p.western))] : []),
      ...(p.second ? [tile('Second spelling', p.second.root, `Compound ${p.second.compound}`)] : []),
    ],
    sections,
    link: `${SITE}/tools/chaldean`,
    method: `Cheiro’s Chaldean letter values, 1 to 8; no letter is 9. ${ENGINE}.`,
    preparedOn: formatYMD(p.today),
    disclaimer: DISCLAIMER,
  };
}

/** The number grouped as it is usually written: 98171 45678. */
export const groupedNumber = (digits: number[]) => {
  const s = digits.join('');
  return s.length === 10 ? `${s.slice(0, 5)} ${s.slice(5)}` : s;
};

function fitCard(label: string, own: Digit, root: Digit, rel: PairRelation, points: number): PrintCard {
  const same = own === root;
  const tone = same ? 'supportive' : relationTone(rel.mutual);
  return {
    chip: String(own), digit: own, title: `${label} ${own}`, meta: `${planet(root)} with ${planet(own)}`,
    badge: `${TONE_LABEL[tone]} · ${points > 0 ? `+${points}` : points < 0 ? `−${Math.abs(points)}` : '0'}`,
    text: same ? SAME_ROOT_TEXT : ROOT_FIT_TEXT[rel.mutual],
  };
}

/** "the Sun" and "the Moon" read naturally in a sentence; the other planets take no article. */
const thePlanet = (d: Digit) => (d === 1 || d === 2 ? `the ${planet(d)}` : planet(d));
const signedNumber = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

/** Mobile Number Numerology. */
export function mobilePrint(m: MobileResult, dob: YMD | null, today: YMD): PrintReportData {
  const info = NUMBERS[m.root];
  const fit = m.withBirth;
  const compound = m.compoundKey ? compoundReading(m.compoundKey) : null;
  const sections: PrintSection[] = [];

  if (fit) {
    sections.push({
      id: 'score', title: 'Number score', summary: true,
      blocks: [
        { kind: 'meter', level: fit.score.band, max: 5, label: `${fit.score.total} out of 100 · ${LEVEL_LABEL[fit.score.band]}` },
        { kind: 'text', text: SCORE_BAND_TEXT[fit.score.band] },
        { kind: 'bars', bars: fit.score.parts.map((p) => ({ label: SCORE_PART_LABEL[p.key], value: p.points / p.max, display: `${p.points} / ${p.max}` })) },
        { kind: 'text', tone: 'muted', text: `${SCORE_NOTE} The phone is for: ${PURPOSE_LABEL[m.purpose].toLowerCase()}.` },
      ],
    });
  }
  sections.push({
    id: 'watch', title: 'Points to watch', summary: true,
    blocks: m.cautions.length
      ? m.cautions.map((c) => ({ kind: 'text' as const, text: cautionText(c) }))
      : [{ kind: 'text', text: 'No malefic yoga, no difficult ending and no overloaded digit: nothing the tradition flags.' }],
  });
  sections.push({
    id: 'root', title: 'The number’s root', summary: true,
    blocks: [
      { kind: 'cards', columns: 1, cards: [{ chip: String(m.root), digit: m.root, title: `Root ${m.root} · ${info.planet} · ${info.keyword}`, meta: `The digits add to ${m.total}`, text: info.strength, extra: 'Tradition does not call any number lucky for everyone. It reads how the number’s planet sits with the planets of your own birth numbers.' }] },
      ...(compound ? [{
        kind: 'callout' as const, title: `Compound number ${compound.number}${compound.symbol ? `, ${compound.symbol}` : ''}`,
        text: `${m.compoundKey !== m.total ? `The total ${m.total} is above 52, so it is added down to ${compound.number}. ` : ''}${compound.sameAs ? `Cheiro reads it as ${compound.sameAs}. ` : ''}${compound.text}`,
      }] : []),
    ],
  });
  if (fit) {
    const c = fit.compatibility;
    sections.push({
      id: 'fit', title: 'Compatibility with your date of birth', summary: true,
      blocks: [
        { kind: 'meter', level: c.level, max: 5, label: `${LEVEL_LABEL[c.level]} · level ${c.level} of 5` },
        { kind: 'text', text: LEVEL_TEXT[c.level] },
        {
          kind: 'cards', cards: [
            fitCard('Mulank (Driver)', fit.driver, m.root, fit.rootToDriver, c.driverPoints),
            fitCard('Bhagyank (Conductor)', fit.conductor, m.root, fit.rootToConductor, c.conductorPoints),
            ...(m.nameFit ? [fitCard('Name number', m.nameFit.root, m.root, m.nameFit.relation, m.nameFit.root === m.root ? 2 : RELATION_POINTS[m.nameFit.relation.mutual])] : []),
          ],
        },
        ...(c.purpose !== 'both' ? [{ kind: 'text' as const, tone: 'muted' as const, text: `For a ${PURPOSE_WORDS[c.purpose]}, the weighted total is ${signedNumber(c.weighted)} on a scale from −8 to +8.` }] : []),
        {
          kind: 'text', tone: 'muted',
          text: fit.suppliesMissing.length
            ? `This number contains ${fit.suppliesMissing.join(', ')}, which ${fit.suppliesMissing.length === 1 ? 'is' : 'are'} missing from your Lo Shu grid. Some teachers count that in a number’s favour.`
            : 'This number contains none of the numbers missing from your Lo Shu grid.',
        },
      ],
    });
  }
  const last = m.sequence[m.sequence.length - 1];
  sections.push({
    id: 'ending', title: 'The last four digits', intro: ENDING_INTRO,
    blocks: [
      {
        kind: 'facts', columns: 4, facts: [
          { label: 'Digits', value: m.ending.digits.join(' ') },
          { label: 'Total', value: String(m.ending.total) },
          { label: 'Root', value: m.ending.root ? `${m.ending.root} · ${planet(m.ending.root)}` : '–' },
          { label: 'With your birth numbers', value: fit?.endingFit ? LEVEL_LABEL[fit.endingFit.level] : '–' },
        ],
      },
      ...(m.ending.root ? [] : [{ kind: 'text' as const, text: ENDING_ZERO }]),
      { kind: 'text', text: `Last pair ${m.ending.lastPair.join('')}, ${IMPACT_LABEL[last.impact].toLowerCase()}: ${pairReading(m.ending.lastPair[0], m.ending.lastPair[1])}` },
    ],
  });
  const endingPairs = new Set(m.sequence.filter((x) => x.inEnding).map((x) => x.pair.join('')));
  sections.push(
    {
      id: 'digits', title: 'How often each digit appears',
      blocks: [
        { kind: 'histogram', columns: m.frequency.map((count, digit) => ({ label: String(digit), sub: digit === 0 ? 'Zero' : planet(digit as Digit), count, digit: digit === 0 ? undefined : (digit as Digit) })) },
        { kind: 'text', tone: 'muted', text: m.absent.length ? `Not in the number: ${m.absent.join(', ')}.` : 'Every number from 1 to 9 appears in the number.' },
        ...(m.heavy.length ? [{ kind: 'text' as const, tone: 'muted' as const, text: `Appearing three times or more: ${m.heavy.map((h) => `${h.digit} (${h.count} times)`).join(', ')}. A heavily repeated digit is read as that planet’s theme sounding strongly in the number; teachers prefer no digit more than three times.` }] : []),
      ],
    },
    {
      id: 'pairs', title: 'Two-digit combinations',
      intro: `${m.pairs.length} combinations: ${m.pairTally.benefic} benefic, ${m.pairTally.neutral} neutral and ${m.pairTally.malefic} malefic, read against the two-digit combination chart of Indian mobile numerology. Pairs in the last four digits weigh most in the score.`,
      blocks: [
        {
          kind: 'table', head: ['Pair', 'Class', 'Reading'], widths: ['16%', '17%', '67%'],
          rows: m.pairs.map((x) => ({
            cells: [
              `${x.pair.join('')}${x.count > 1 ? ` ×${x.count}` : ''}${endingPairs.has(x.pair.join('')) ? ' (ending)' : ''}`,
              `${IMPACT_LABEL[x.impact]}${x.yoga ? `, ${YOGA_LABEL[x.yoga]}` : ''}`,
              pairReading(x.pair[0], x.pair[1]),
            ],
            highlight: x.yoga === 'raj',
          })),
        },
        ...(m.yogas.length ? [{
          kind: 'cards' as const, columns: 2 as const,
          cards: m.yogas.map((y) => ({
            title: YOGA_LABEL[y.yoga], meta: YOGA_PLANETS[y.yoga], badge: y.impact === 'benefic' ? 'Favourable' : 'For care',
            text: `Written ${y.written.join(', ')} in this number${y.inEnding ? ', in the last four digits' : ''}.`,
          })),
        }, { kind: 'text' as const, tone: 'muted' as const, text: YOGA_NOTE }] : []),
        ...(m.rajYog ? [{ kind: 'callout' as const, title: 'Raj yog', text: m.rajYog.weakenedByEight ? RAJ_YOG_NOTE.weakened : RAJ_YOG_NOTE.clear }] : []),
        { kind: 'text', tone: 'muted', text: IMPACT_NOTE },
      ],
    },
  );
  if (fit) {
    const g = fit.grid;
    const base = printGrid(g.person);
    const marks: Partial<Record<Digit, string[]>> = {};
    for (const d of DIGITS) {
      const letters = [...(base.marks[d] ?? []), ...(g.added[d] ? [`+${g.added[d]}`] : [])];
      if (letters.length) marks[d] = letters;
    }
    const status = (s: keyof typeof GRID_STATUS_LABEL) => DIGITS.filter((d) => g.status[d] === s);
    sections.push({
      id: 'grid', title: 'Your Lo Shu grid with this number', intro: GRID_INTRO,
      blocks: [{
        kind: 'grid',
        grid: { counts: g.withNumber.counts, marks, complete: completeIn(g.withNumber), key: `${base.key ? `${base.key} ` : ''}+1 and +2 show how many of that number come from the phone number.` },
        aside: [
          {
            kind: 'text',
            text: g.newLines.length ? `With this number your grid completes ${list(g.newLines.map(lineName))}.` : 'This number completes no new line of three in your grid.',
          },
          {
            kind: 'facts', columns: 2,
            facts: (['introduced', 'strengthened', 'missing'] as const).filter((s) => status(s).length).map((s) => ({ label: GRID_STATUS_LABEL[s], value: status(s).join(', ') })),
          },
        ],
      }],
    });
    const ch = fit.checklist;
    const flip = (k: string) => (k[0] === k[1] ? k : `${k}/${k[1]}${k[0]}`);
    sections.push({
      id: 'choosing', title: 'Choosing a number', intro: ROOTS_INTRO,
      blocks: [
        { kind: 'tiles', tiles: fit.roots.map((r) => tile(planet(r.root), r.root, `${LEVEL_LABEL[r.compatibility.level]}${r.root === m.root ? ' · this number' : ''}`)) },
        { kind: 'text', text: CHECKLIST_INTRO },
        { kind: 'text', text: `A total that adds down to ${list(ch.best)}, ${LEVEL_LABEL[ch.bestLevel].toLowerCase()} for you${ch.good.length ? `; or else ${list(ch.good)}` : ''}, with last four digits adding down to one of those as well, and a last digit other than 0.` },
        ...(ch.include.length ? [{ kind: 'text' as const, text: `${list(ch.include)} somewhere in the number: missing from your Lo Shu grid.` }] : []),
        { kind: 'text', text: `No digit more than ${ch.maxRepeats} times, and no more than ${ch.maxRun} of one digit in a row.` },
        { kind: 'text', text: `Avoid the malefic pairs, in either order: ${[...ch.avoidNamed.map((a) => `${flip(a.key)} (${YOGA_LABEL[a.yoga]})`), ...ch.avoidOther.map(flip)].join(', ')}.` },
      ],
    });
    const weak = fit.compatibility.level <= 3;
    const mulank = NUMBERS[fit.driver];
    const day = info.day ?? NODE_DAY[m.root] ?? null;
    const dates = favourableDates(fit.driver);
    sections.push({
      id: 'customs', title: weak ? 'If you keep this number' : 'Lucky details for you', intro: weak ? REMEDY_INTRO.weak : REMEDY_INTRO.good,
      blocks: [
        {
          kind: 'cards', columns: weak ? 2 : 1, cards: [
            { title: 'Phone cover or wallpaper', text: `${list(mulank.colours)}: the colours of ${thePlanet(fit.driver)}, the planet of your Mulank ${fit.driver}.` },
            ...(weak ? [{ title: 'Mantra', text: `“${info.mantra}”, 108 times${day ? ` on a ${day}` : ''}: the mantra of ${thePlanet(m.root)}, the planet of this number’s root ${m.root}.` }] : []),
          ],
        },
        { kind: 'text', text: 'Dates to start a new number: those carrying your own number and those carrying friendly numbers.' },
        { kind: 'dates', own: dates.own, friendly: dates.friendly, driver: fit.driver },
      ],
    });
  }
  sections.push(working([
    ...m.steps,
    ...(fit ? [
      ...fit.score.parts.map((p) => ({ key: `score-${p.key}`, label: SCORE_PART_LABEL[p.key], working: p.working, result: `${p.points} of ${p.max}` })),
      { key: 'score', label: 'Number score', working: `${fit.score.parts.map((p) => p.points).join(' + ')} = ${fit.score.total}`, result: `${fit.score.total} of 100` },
    ] : []),
  ]));

  return {
    toolSlug: 'mobile-numerology', title: 'Mobile Number Report',
    subject: { label: 'Mobile number', value: groupedNumber(m.digits) },
    details: dob ? [`Compared with the date of birth ${formatYMD(dob)}`, ...(m.purpose !== 'both' ? [`${cap(m.purpose)} phone`] : [])] : [],
    glance: [
      fit ? { label: 'Number score', value: String(fit.score.total), caption: `${LEVEL_LABEL[fit.score.band]}, out of 100` } : { label: 'Number score', value: '–', caption: 'Needs a date of birth' },
      tile('Root number', m.root, info.planet),
      fit ? { label: 'Compatibility', value: `${fit.compatibility.level} of 5`, caption: LEVEL_LABEL[fit.compatibility.level] } : { label: 'Compatibility', value: '–', caption: 'Needs a date of birth' },
      { label: 'Digit total', value: String(m.total), caption: `Added down to ${m.root}` },
      { label: 'Pairs', value: `${m.pairTally.benefic} · ${m.pairTally.neutral} · ${m.pairTally.malefic}`, caption: 'Benefic · neutral · malefic' },
      m.ending.root ? tile('Last four digits', m.ending.root, `${m.ending.digits.join('')} adds down to ${m.ending.root}`) : { label: 'Last four digits', value: '–', caption: 'All zeros' },
    ],
    sections,
    link: `${SITE}/tools/mobile-numerology`,
    method: `The digits are added down to a root; the compatibility level and the fit of the ending follow the traditional friendships between the planets; pairs follow the two-digit combination chart; the Number score adds four parts, each with its arithmetic. ${ENGINE}.`,
    preparedOn: formatYMD(today),
    disclaimer: DISCLAIMER,
  };
}

