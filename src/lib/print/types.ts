/**
 * A printable report, described as data. Each tool builds one from its result (see
 * numerologyPrint.ts) and src/components/print draws it for paper. Keeping the content as data
 * means the same report can be checked by tests, filtered by section and printed in colour or in
 * an ink-saving style without the tool knowing anything about paper.
 */
import type { CalcStep, Digit, LineId } from '@/engine/numerology';

/** A key number shown large, in the colour of its digit when it has one. */
export interface PrintTile {
  label: string;
  value: string;
  /** The digit whose colour the tile takes; omit for values such as "2, 3" or "Low". */
  digit?: Digit;
  caption?: string;
}

/** A short reading in a bordered card. */
export interface PrintCard {
  title: string;
  /** A small line under the title, e.g. the planet or the system. */
  meta?: string;
  /** A word or two at the right of the title: "Complete", "Now", "Benefic". */
  badge?: string;
  /** A value shown in a coloured chip before the title, e.g. "5" or "9 ×2". */
  chip?: string;
  digit?: Digit;
  text: string;
  /** A second, quieter paragraph. */
  extra?: string;
  highlight?: boolean;
}

export interface PrintRow {
  cells: string[];
  /** Marks the row that applies now, e.g. the running dasha year. */
  highlight?: boolean;
}

/** A Lo Shu grid to draw: how often each number appears, letters marking added numbers, and its complete lines. */
export interface PrintGrid {
  counts: Readonly<Record<Digit, number>>;
  marks: Partial<Record<Digit, string[]>>;
  complete: LineId[];
  /** One line under the grid explaining the marks, when there are any. */
  key?: string;
}

export interface TimelineSegment {
  label: string;
  from: number;
  /** Null for a segment that runs to the end of the scale. */
  to: number | null;
  digit?: Digit;
  current?: boolean;
}

export type PrintBlock =
  | { kind: 'text'; text: string; tone?: 'muted' | 'lead' }
  | { kind: 'tiles'; tiles: PrintTile[] }
  | { kind: 'cards'; cards: PrintCard[]; columns?: 1 | 2 | 3 }
  | { kind: 'table'; head: string[]; rows: PrintRow[]; widths?: string[] }
  | { kind: 'facts'; facts: { label: string; value: string }[]; columns?: 2 | 3 | 4 }
  | { kind: 'grid'; grid: PrintGrid; title?: string; aside?: PrintBlock[] }
  | { kind: 'vastu'; counts: Readonly<Record<Digit, number>> }
  | { kind: 'dates'; own: number[]; friendly: number[]; driver: Digit }
  | { kind: 'bars'; bars: { label: string; sub?: string; value: number; display: string; digit?: Digit }[] }
  | { kind: 'histogram'; columns: { label: string; sub: string; count: number; digit?: Digit }[] }
  | { kind: 'meter'; level: number; max: number; label: string }
  | { kind: 'callout'; title?: string; text: string }
  | { kind: 'timeline'; segments: TimelineSegment[]; end: number; unit: string; now?: number; caption?: string }
  | { kind: 'letters'; words: { word: string; letters: { ch: string; value: number }[]; total: string }[] }
  | { kind: 'steps'; steps: CalcStep[] }
  | { kind: 'columns'; columns: PrintBlock[][] };

export interface PrintSection {
  id: string;
  title: string;
  intro?: string;
  blocks: PrintBlock[];
  /** Part of the one-page summary. */
  summary?: boolean;
  /** Printed in smaller type at the end, like an appendix. */
  appendix?: boolean;
}

export interface PrintReportData {
  toolSlug: string;
  /** "Lo Shu Grid Report". */
  title: string;
  /** What the report is about: a person's name, a name or a number. */
  subject: { label: string; value: string };
  /** Short lines under the subject, e.g. "Born 15 August 1990", "Female". */
  details: string[];
  glance: PrintTile[];
  sections: PrintSection[];
  /** The address that opens this tool again, without any personal details. */
  link: string;
  /** One sentence on how the numbers were worked out. */
  method: string;
  /** Long date the report was made, e.g. "15 November 2026". */
  preparedOn: string;
  /** What the report is and is not, printed at its foot and in the footer of every page. */
  disclaimer: string;
}
