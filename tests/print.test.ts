/**
 * Printed reports: each one carries the same numbers as its tool, keeps to the tradition's
 * wording, and renders the sections, cover, notes and arrows the print options ask for. The
 * browser smoke test (scripts/smoke.mjs) prints real PDFs and counts their pages.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  analyseMobile, birthdayNumber, chaldeanName, dashaOn, expression, lifePath, loShu, normalizeName, personalCycles,
  pinnacles, profile, type Gender, type YMD,
} from '@/engine/numerology';
import {
  chaldeanPrint, groupedNumber, lifePathPrint, loShuPrint, mobilePrint, numerologyPrint,
} from '@/lib/print/numerologyPrint';
import { DEFAULT_PRINT_OPTIONS, cssString, pageCss, pdfTitle, type PrintOptions } from '@/lib/print/printSettings';
import type { PrintBlock, PrintReportData } from '@/lib/print/types';
import { PrintDocumentBody } from '@/components/print/PrintDocument';
import { claimHits } from './helpers/claims';

const today: YMD = { y: 2026, m: 11, d: 15 };
const ymd = (y: number, m: number, d: number): YMD => ({ y, m, d });

const loShuReport = (date: YMD, gender: Gender | null) => loShuPrint(loShu(date, gender), dashaOn(date, today), today);
const lifePathReport = (date: YMD) => lifePathPrint({
  date, today, lifePath: lifePath(date), birthday: birthdayNumber(date), grid: loShu(date, null),
  pinnacles: pinnacles(date), cycles: personalCycles(date, today), steps: [],
});
const numerologyReport = (name: string, date: YMD, gender: Gender | null) => numerologyPrint({
  displayName: name, profile: profile({ date, gender, name }), cycles: personalCycles(date, today), now: dashaOn(date, today), today, steps: [],
});
const chaldeanReport = (entry: string, secondEntry = '') => chaldeanPrint({
  entry, result: chaldeanName(entry)!, second: secondEntry ? chaldeanName(secondEntry) : null, secondEntry,
  western: expression(normalizeName(entry)), today,
});

/** Every block in a report, including those inside grids and columns. */
function blocks(report: PrintReportData): PrintBlock[] {
  const out: PrintBlock[] = [];
  const walk = (b: PrintBlock) => {
    out.push(b);
    if (b.kind === 'grid') b.aside?.forEach(walk);
    if (b.kind === 'columns') b.columns.flat().forEach(walk);
  };
  report.sections.forEach((s) => s.blocks.forEach(walk));
  return out;
}

/** Every piece of text in a report, for the wording check. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

const glance = (r: PrintReportData) => Object.fromEntries(r.glance.map((t) => [t.label, t.value]));
const ids = (r: PrintReportData) => r.sections.map((s) => s.id);

describe('Lo Shu report', () => {
  // 14 June 1985, male: Driver 5, Conductor 7, Kua 6; 2 and 3 missing; on 15 November 2026 the
  // Maha Dasha is 4 and the Antar Dasha 2 (see tests/numerology-depth.test.ts for the method).
  const report = loShuReport(ymd(1985, 6, 14), 'male');

  it('carries the numbers the tool shows', () => {
    expect(glance(report)).toMatchObject({
      'Driver · Mulank': '5', 'Conductor · Bhagyank': '7', 'Kua number': '6', 'Missing numbers': '2, 3', 'Complete lines': '3', 'Antar Dasha now': '2',
    });
    expect(ids(report)).toEqual(['grid', 'lines', 'numbers', 'dasha', 'favourable', 'directions', 'working']);
    expect(report.sections.filter((s) => s.summary).map((s) => s.id)).toEqual(['grid']);
    expect(report.subject).toEqual({ label: 'Date of birth', value: '14 June 1985' });
  });

  it('draws the grid with the added numbers marked and the complete lines named', () => {
    const grid = blocks(report).find((b) => b.kind === 'grid')!;
    if (grid.kind !== 'grid') throw new Error('no grid');
    expect([...grid.grid.complete].sort()).toEqual(['golden', 'practical', 'will']);
    expect(grid.grid.marks).toEqual({ 5: ['D'], 7: ['C'], 6: ['K'] });
    expect(grid.grid.counts[5]).toBe(2);
    expect(grid.grid.key).toContain('D, C and K');
  });

  it('shows the grid for the running dasha with its extra lines', () => {
    const period = blocks(report).filter((b) => b.kind === 'grid')[1];
    if (period?.kind !== 'grid') throw new Error('no period grid');
    expect(period.grid.marks[4]).toContain('M');
    expect(period.grid.marks[2]).toContain('A');
    expect([...period.grid.complete].sort()).toEqual(['action', 'golden', 'mental', 'practical', 'silver', 'will']);
    const table = blocks(report).find((b) => b.kind === 'table' && b.head[0].startsWith('Year from'));
    expect(table && table.kind === 'table' && table.rows.filter((r) => r.highlight)).toHaveLength(1);
  });

  it('leaves out the Kua when no gender is given', () => {
    const r = loShuReport(ymd(1985, 6, 14), null);
    expect(glance(r)['Kua number']).toBe('–');
    expect(r.sections.find((s) => s.id === 'directions')!.title).toBe('Directions (Numero Vastu)');
    expect(r.details).toEqual([]);
  });

  it('has no dasha section for a date of birth after the day it is printed', () => {
    const date = ymd(2026, 12, 1);
    expect(ids(loShuPrint(loShu(date, null), null, today))).not.toContain('dasha');
  });
});

describe('the other reports', () => {
  it('Numerology Report: Western, name, Indian and Chaldean numbers for one person', () => {
    const r = numerologyReport('Asha Rao', ymd(1990, 8, 15), 'female');
    expect(glance(r)).toEqual({
      'Life Path': '6', Expression: '9', 'Soul Urge': '9', Personality: '9', 'Mulank · Driver': '6', 'Bhagyank · Conductor': '6',
    });
    expect(ids(r)).toEqual(['core', 'karmic', 'name', 'grid', 'dasha', 'chaldean', 'year', 'working']);
    expect(r.subject).toEqual({ label: 'Name', value: 'Asha Rao' });
    expect(r.details).toEqual(['Born 15 August 1990', 'Female']);
  });

  it('Life Path Report: master numbers written 11/2 and the pinnacle in force marked', () => {
    const r = lifePathReport(ymd(1987, 11, 29));
    expect(glance(r)['Life Path']).toBe('11/2');
    const timeline = blocks(r).find((b) => b.kind === 'timeline');
    if (timeline?.kind !== 'timeline') throw new Error('no timeline');
    expect(timeline.segments).toHaveLength(4);
    expect(timeline.segments.filter((s) => s.current)).toHaveLength(1);
    expect(timeline.segments[3].to).toBeNull();
    expect(timeline.now).toBe(38);
  });

  it('Chaldean Name Report: compound, root and a second spelling side by side', () => {
    const r = chaldeanReport('Narendra Modi');
    expect(glance(r)).toMatchObject({ 'Root number': '5', 'Compound number': '41', 'Expression (Western)': '8' });
    expect(ids(r)).toEqual(['number', 'letters', 'working']);
    const two = chaldeanReport('Narendra Modi', 'Narendra Damodardas Modi');
    expect(ids(two)).toContain('compare');
    expect(two.details).toEqual(['Compared with: Narendra Damodardas Modi']);
  });

  it('Mobile Number Report: root, level, a column per digit and a row per pair', () => {
    const m = analyseMobile('98171 45678', { date: ymd(1985, 6, 14) })!;
    const r = mobilePrint(m, ymd(1985, 6, 14), today);
    expect(glance(r)).toMatchObject({ 'Root number': '2', Compatibility: '2 of 5', 'Digit total': '56', Pairs: '4 · 0 · 5' });
    expect(r.subject.value).toBe('98171 45678');
    const histogram = blocks(r).find((b) => b.kind === 'histogram');
    if (histogram?.kind !== 'histogram') throw new Error('no histogram');
    expect(histogram.columns.reduce((a, c) => a + c.count, 0)).toBe(10);
    const table = blocks(r).find((b) => b.kind === 'table');
    expect(table?.kind === 'table' && table.rows).toHaveLength(m.pairs.length);
    expect(ids(r)).toContain('fit');
    const without = mobilePrint(analyseMobile('9876543210')!, null, today);
    expect(ids(without)).not.toContain('fit');
    expect(glance(without).Compatibility).toBe('–');
    expect(groupedNumber([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])).toBe('98765 43210');
  });
});

describe('every report', () => {
  const reports: PrintReportData[] = [];
  for (let y = 1931; y <= 2023; y += 4) {
    for (const [m, d] of [[1, 1], [2, 29], [6, 14], [9, 30], [12, 31]] as const) {
      if (m === 2 && d === 29 && y % 4 !== 0) continue;
      const date = ymd(y, m, d);
      reports.push(loShuReport(date, y % 8 === 3 ? 'male' : 'female'), lifePathReport(date));
    }
  }
  for (const name of ['Asha Rao', 'Prateek Kumar', 'Mohandas Karamchand Gandhi', 'Glynn', 'Lakshmi Narayanan']) {
    reports.push(numerologyReport(name, ymd(1990, 8, 15), 'female'), chaldeanReport(name, 'Rahul Sharma'));
  }
  for (const n of ['9876543210', '98171 45678', '+91 70000 11111', '9417026530', '8888888888']) {
    reports.push(mobilePrint(analyseMobile(n, { date: ymd(1985, 6, 14) })!, ymd(1985, 6, 14), today));
  }

  it('keeps to the tradition’s wording', () => {
    expect(reports.length).toBeGreaterThan(200);
    expect(claimHits(reports.flatMap((r) => strings(r)))).toEqual([]);
  });

  it('has something for the one-page summary, at most one appendix, and no empty section', () => {
    for (const r of reports) {
      expect(r.sections.some((s) => s.summary), r.title).toBe(true);
      expect(r.sections.filter((s) => s.appendix).length, r.title).toBeLessThanOrEqual(1);
      expect(new Set(ids(r)).size, r.title).toBe(r.sections.length);
      for (const s of r.sections) expect(s.blocks.length, `${r.title} ${s.id}`).toBeGreaterThan(0);
      expect(r.glance.length).toBeGreaterThanOrEqual(3);
      expect(strings(r).some((t) => /undefined|NaN|\[object/.test(t)), r.title).toBe(false);
    }
  });
});

describe('print settings', () => {
  const report = loShuReport(ymd(1985, 6, 14), 'male');
  const options = (patch: Partial<PrintOptions>): PrintOptions => ({ ...DEFAULT_PRINT_OPTIONS, ...patch });

  it('names the PDF after the report and the person', () => {
    expect(pdfTitle(report, options({}))).toBe('Lo Shu Grid Report - 14 June 1985 - VediCosmic');
    expect(pdfTitle(report, options({ preparedFor: '  Rohan / "Ro" Mehta: ' }))).toBe('Lo Shu Grid Report - Rohan Ro Mehta - VediCosmic');
    // A phone number is not put in a file name unless a name is given.
    const mobile = mobilePrint(analyseMobile('9876543210')!, null, today);
    expect(pdfTitle(mobile, options({}))).toBe('Mobile Number Report - VediCosmic');
  });

  it('writes safe CSS strings and the page rules', () => {
    expect(cssString('a "b" \\ c')).toBe('"a \\"b\\" \\\\ c"');
    expect(cssString('x</style><b>')).not.toMatch(/[<>]/);
    expect(cssString('line\nbreak')).not.toContain('\n');
    const css = pageCss(report, options({ preparedFor: 'Rohan "R" Mehta' }));
    expect(css).toContain('size: A4 portrait');
    expect(css).toContain('counter(page)');
    expect(css).toContain('Lo Shu Grid Report · Rohan \\"R\\" Mehta');
    expect(pageCss(report, options({ paper: 'letter' }))).toContain('size: letter portrait');
    // With a cover the first page carries no footer.
    const emptyFooter = '@bottom-left { content: ""; } @bottom-right { content: ""; }';
    expect(pageCss(report, options({ cover: true }))).toContain(emptyFooter);
    expect(pageCss(report, options({}))).not.toContain(emptyFooter);
  });
});

describe('the printed document', () => {
  const report = loShuReport(ymd(1985, 6, 14), 'male');
  const render = (patch: Partial<PrintOptions>) =>
    renderToStaticMarkup(createElement(PrintDocumentBody, { report, options: { ...DEFAULT_PRINT_OPTIONS, ...patch } }));

  it('prints every section, numbered, with an arrow for each complete line', () => {
    const html = render({});
    for (const s of report.sections) expect(html).toContain(`data-section="${s.id}"`);
    expect(html).toContain('<span class="pd-sec-num">01</span>');
    // Three arrows on the birth grid and six on the grid for the running dasha.
    expect(html.match(/data-line="/g)).toHaveLength(9);
    expect(html).not.toContain('pd-cover');
    expect(html).toContain('data-colour="colour"');
  });

  it('follows the options: cover, name, consultant, notes, sections and ink', () => {
    const html = render({
      cover: true, preparedFor: 'Rohan Mehta', preparedBy: 'Pandit A. Joshi', note: 'Check <b>East</b>', omit: ['lines', 'working'], colour: 'ink',
    });
    expect(html).toContain('pd-cover');
    expect(html.match(/Rohan Mehta/g)!.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('Pandit A. Joshi');
    expect(html).toContain('Check &lt;b&gt;East&lt;/b&gt;');
    expect(html).not.toContain('data-section="lines"');
    expect(html).not.toContain('data-section="working"');
    expect(html).toContain('data-colour="ink"');
    // Without the appendix, the method moves to the closing line.
    expect(html).toContain(report.method);
    // The cover already carries the brand, so the first page does not repeat it.
    expect(html).not.toContain('pd-head');
  });
});
