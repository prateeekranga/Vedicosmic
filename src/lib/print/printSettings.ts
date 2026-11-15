/**
 * Choices for printing a report, and the small pieces of text the printed page needs: the
 * running header and footer, the page size, and the file name a browser offers when the report is
 * saved as a PDF.
 *
 * Nothing here leaves the device. The visitor's own details ("prepared by", colour, paper, cover, QR code)
 * are kept in this browser only when they tick "remember"; the name and notes on a report are
 * never stored.
 */
import type { PrintReportData } from './types';

export type PrintColour = 'colour' | 'ink';
export type PrintPaper = 'A4' | 'letter';

export interface PrintOptions {
  /** Name printed as "Prepared for"; empty to use the report's own subject. */
  preparedFor: string;
  /** A consultant's name and contact, printed under the subject. */
  preparedBy: string;
  /** Free text printed in a Notes box at the end. */
  note: string;
  colour: PrintColour;
  paper: PrintPaper;
  /** A title page before the report. */
  cover: boolean;
  /** A QR code in the closing lines that opens the result (or the tool) again. */
  qr: boolean;
  /** Ids of sections left out. */
  omit: string[];
  /** Keep preparedBy, colour, paper, cover and QR code on this device. */
  remember: boolean;
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  preparedFor: '', preparedBy: '', note: '', colour: 'colour', paper: 'A4', cover: false, qr: true, omit: [], remember: false,
};

const KEY = 'vc:print:v1';
type Remembered = Pick<PrintOptions, 'preparedBy' | 'colour' | 'paper' | 'cover' | 'qr'>;

/** The visitor's remembered print preferences, or the defaults. Never throws. */
export function loadPrintPreferences(): PrintOptions {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (!raw) return { ...DEFAULT_PRINT_OPTIONS };
    const r = JSON.parse(raw) as Partial<Remembered>;
    return {
      ...DEFAULT_PRINT_OPTIONS,
      preparedBy: typeof r.preparedBy === 'string' ? r.preparedBy.slice(0, 160) : '',
      colour: r.colour === 'ink' ? 'ink' : 'colour',
      paper: r.paper === 'letter' ? 'letter' : 'A4',
      cover: r.cover === true,
      // Saved before the QR code existed: keep the default.
      qr: r.qr !== false,
      remember: true,
    };
  } catch {
    return { ...DEFAULT_PRINT_OPTIONS };
  }
}

/** Keeps or forgets the remembered preferences, following the "remember" box. */
export function savePrintPreferences(o: PrintOptions): void {
  try {
    if (o.remember) {
      const keep: Remembered = { preparedBy: o.preparedBy.trim(), colour: o.colour, paper: o.paper, cover: o.cover, qr: o.qr };
      localStorage.setItem(KEY, JSON.stringify(keep));
    } else {
      localStorage.removeItem(KEY);
    }
  } catch { /* storage unavailable: the choices last for this visit only */ }
}

/** The name the report is prepared for, or its own subject. */
export const subjectOf = (report: PrintReportData, o: PrintOptions) => o.preparedFor.trim() || report.subject.value;

/**
 * The file name a browser suggests when saving as PDF, which it takes from the page title:
 * "Lo Shu Grid Report - Asha Rao - VediCosmic". Characters that file systems refuse are dropped.
 */
export function pdfTitle(report: PrintReportData, o: PrintOptions): string {
  const who = o.preparedFor.trim() || (report.subject.label === 'Mobile number' ? '' : report.subject.value);
  return [report.title, who, 'VediCosmic']
    .filter(Boolean)
    .join(' - ')
    .replace(/[\\/:*?"<>|\p{Cc}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

/** Text written as a CSS string literal, safe inside generated rules. */
export function cssString(text: string): string {
  return `"${text.replace(/[\\"]/g, (c) => `\\${c}`).replace(/[\p{Cc}<>]/gu, (c) => `\\${c.charCodeAt(0).toString(16)} `)}"`;
}

/**
 * Page rules for the report: paper size, margins, a running header and a footer with page
 * numbers. Browsers that support page margin boxes (Chrome and Edge since version 131) print the
 * header and footer on every page and leave out their own date and address lines; others print
 * the report without them. The first page, which carries the report's own heading, has none.
 */
export function pageCss(report: PrintReportData, o: PrintOptions): string {
  const who = subjectOf(report, o);
  const running = cssString(`${report.title}${who ? ` · ${who}` : ''}`);
  const size = o.paper === 'letter' ? 'letter' : 'A4';
  const box = 'font-family: Inter, system-ui, sans-serif; font-size: 7.5pt; color: #6b6580;';
  return [
    `@page { size: ${size} portrait; margin: 15mm 14mm 16mm 14mm;`,
    `  @top-left { content: "VEDICOSMIC"; ${box} font-family: Cinzel, Georgia, serif; letter-spacing: 0.18em; vertical-align: bottom; padding-bottom: 3mm; }`,
    `  @top-right { content: ${running}; ${box} vertical-align: bottom; padding-bottom: 3mm; }`,
    `  @bottom-left { content: ${cssString(`vedicosmic.com  ·  ${report.disclaimer}`)}; ${box} vertical-align: top; padding-top: 3mm; }`,
    `  @bottom-right { content: "Page " counter(page) " of " counter(pages); ${box} vertical-align: top; padding-top: 3mm; }`,
    '}',
    // Empty boxes rather than none, so the browser does not put its own date and address there.
    '@page :first { @top-left { content: ""; } @top-right { content: ""; }',
    o.cover ? ' @bottom-left { content: ""; } @bottom-right { content: ""; } }' : ' }',
  ].join('\n');
}

/** Asks the report on the page to open its print options; false when no report is listening. */
export const PRINT_DIALOG_EVENT = 'vc:print-options';
export function requestPrintOptions(): boolean {
  if (typeof window === 'undefined') return false;
  // A listening report calls preventDefault, which makes dispatchEvent return false.
  return !window.dispatchEvent(new CustomEvent(PRINT_DIALOG_EVENT, { cancelable: true }));
}
