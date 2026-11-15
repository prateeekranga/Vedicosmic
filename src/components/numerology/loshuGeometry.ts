/**
 * Where the Lo Shu square's arrows go, shared by the grid on screen and the grid in printed
 * reports so the two always draw the same lines.
 *
 * Arrows are drawn in a 300 × 300 box in which each cell and its share of the spacing take exactly
 * one third: cell centres fall on 50, 150 and 250.
 */
import { LOSHU_LAYOUT, LOSHU_LINES, type LineDef, type LineId } from '@/engine/numerology';

export const CENTRE: Readonly<Record<number, { x: number; y: number }>> = (() => {
  const centre: Record<number, { x: number; y: number }> = {};
  LOSHU_LAYOUT.forEach((row, r) => row.forEach((d, c) => { centre[d] = { x: 50 + c * 100, y: 50 + r * 100 }; }));
  return centre;
})();

export type ArrowKind = 'golden' | 'silver' | 'row' | 'column';

/** The order arrows are drawn and listed in: the two Raj Yogs first, then rows, then columns. */
export const ARROW_ORDER: Readonly<Record<ArrowKind, number>> = { golden: 0, silver: 1, row: 2, column: 3 };

export const arrowKind = (l: Pick<LineDef, 'id' | 'kind'>): ArrowKind =>
  (l.id === 'golden' ? 'golden' : l.id === 'silver' ? 'silver' : l.kind === 'row' ? 'row' : 'column');

/** The line definition for an id. */
export const lineDef = (id: LineId): LineDef => LOSHU_LINES.find((l) => l.id === id)!;

/** Complete lines in drawing order. */
export function inArrowOrder<T extends Pick<LineDef, 'id' | 'kind'>>(lines: readonly T[]): T[] {
  return [...lines].sort((a, b) => ARROW_ORDER[arrowKind(a)] - ARROW_ORDER[arrowKind(b)]);
}

/** The arrow for one complete line: it starts near the outer edge of the first cell and ends near that of the third. */
export function arrowGeometry(line: Pick<LineDef, 'cells' | 'kind'>) {
  const a = CENTRE[line.cells[0]], b = CENTRE[line.cells[2]];
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / length, uy = (b.y - a.y) / length;
  // A diagonal has further to go to reach the corner of its cell than a row has to reach the edge.
  const overshoot = line.kind === 'diagonal' ? 44 : 35;
  const head = 15, halfWidth = 7.5;
  const start = { x: a.x - ux * overshoot, y: a.y - uy * overshoot };
  const tip = { x: b.x + ux * overshoot, y: b.y + uy * overshoot };
  const neck = { x: tip.x - ux * head, y: tip.y - uy * head };
  const headPath = `M${tip.x},${tip.y} L${neck.x - uy * halfWidth},${neck.y + ux * halfWidth} L${neck.x + uy * halfWidth},${neck.y - ux * halfWidth} Z`;
  // Evenly spaced points with a fixed wobble, so the glitter looks scattered but never jumps between renders.
  const sparkles = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 1) / 8;
    const wobble = Math.sin(i * 12.9898) * 6;
    return { x: start.x + (neck.x - start.x) * t - uy * wobble, y: start.y + (neck.y - start.y) * t + ux * wobble, delay: (i * 0.22) % 1.4 };
  });
  return { start, neck, headPath, sparkles };
}
