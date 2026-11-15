/**
 * Drawings for printed reports. Everything is vector, sized in millimetres by print.css, and
 * styled through classes so the ink-saving mode can turn colour fills into outlines and dash
 * patterns. Each drawing is decorative or repeats information that is also given in words.
 */
import { LOSHU_LAYOUT, LOSHU_LINES, NUMBER_DIRECTION, type Digit } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { DIRECTION_NAME, LINE_TEXT } from '@/data/numerology/loshuText';
import { arrowGeometry, arrowKind, inArrowOrder, type ArrowKind } from '@/components/numerology/loshuGeometry';
import type { PrintGrid, TimelineSegment } from '@/lib/print/types';

/**
 * The VediCosmic print emblem: the Lo Shu square inside an eight-petalled lotus, ringed by 108
 * beads in twelve groups of nine, as on a mala.
 */
export function Emblem({ className }: { className?: string }) {
  const ticks = Array.from({ length: 108 }, (_, i) => {
    const a = (i / 108) * Math.PI * 2;
    const long = i % 9 === 0;
    const r1 = long ? 40.6 : 42.2, r2 = 45.2;
    return { x1: Math.sin(a) * r1, y1: -Math.cos(a) * r1, x2: Math.sin(a) * r2, y2: -Math.cos(a) * r2, long };
  });
  const petal = 'M0,-15 C7.5,-20 8.6,-30 0,-38.5 C-8.6,-30 -7.5,-20 0,-15 Z';
  const inner = 'M0,-15 C5,-18.5 6,-26 0,-32 C-6,-26 -5,-18.5 0,-15 Z';
  const digits = LOSHU_LAYOUT.flat();
  return (
    <svg className={`pd-emblem ${className ?? ''}`} viewBox="-50 -50 100 100" aria-hidden="true">
      <circle className="pd-emblem-line" r="47.5" fill="none" strokeWidth="0.9" />
      {ticks.map((t, i) => (
        <line key={i} className="pd-emblem-line" x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.long ? 0.9 : 0.4} />
      ))}
      <circle className="pd-emblem-line" r="40" fill="none" strokeWidth="0.5" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`o${i}`} className="pd-emblem-petal" d={petal} transform={`rotate(${i * 45})`} strokeWidth="0.7" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`i${i}`} className="pd-emblem-petal pd-emblem-petal--inner" d={inner} transform={`rotate(${i * 45 + 22.5})`} strokeWidth="0.6" />
      ))}
      <circle className="pd-emblem-centre" r="15.5" strokeWidth="0.8" />
      <g className="pd-emblem-line" strokeWidth="0.45" fill="none">
        <rect x="-9.6" y="-9.6" width="19.2" height="19.2" />
        <line x1="-3.2" y1="-9.6" x2="-3.2" y2="9.6" /><line x1="3.2" y1="-9.6" x2="3.2" y2="9.6" />
        <line x1="-9.6" y1="-3.2" x2="9.6" y2="-3.2" /><line x1="-9.6" y1="3.2" x2="9.6" y2="3.2" />
      </g>
      {digits.map((d, i) => (
        <text key={d} className="pd-emblem-digit" x={-6.4 + (i % 3) * 6.4} y={-6.4 + Math.floor(i / 3) * 6.4 + 1.55}
          textAnchor="middle" fontSize="4.4">{d}</text>
      ))}
    </svg>
  );
}

const times = (n: number) => (n > 1 ? `×${n}` : '');

/** The Lo Shu grid with arrows across its complete lines, as in the tool, sized for paper. */
export function PrintLoShu({ grid }: { grid: PrintGrid }) {
  const complete = inArrowOrder(LOSHU_LINES.filter((l) => grid.complete.includes(l.id)));
  const cells = LOSHU_LAYOUT.flatMap((row, r) => row.map((d, c) => {
    const count = grid.counts[d];
    return { d, count, present: count > 0, x: 4 + c * 100, y: 4 + r * 100, fill: count > 0 ? NUMBERS[d].colour.fill : '#ffffff' };
  }));
  // Drawn in three layers, as on screen: cells, then the arrows, then the numbers on top. Each
  // number has a halo in its cell's colour, so an arrow passing beneath it never hides it.
  return (
    <svg className="pd-loshu" viewBox="0 0 300 300" aria-hidden="true">
      {cells.map(({ d, present, x, y, fill }) => (
        <rect key={d} className={present ? 'pd-cell pd-cell--on' : 'pd-cell pd-cell--off'} x={x} y={y} width="92" height="92" rx="12" fill={fill} />
      ))}
      {complete.map((line) => {
        const kind = arrowKind(line);
        const { start, neck, headPath } = arrowGeometry(line);
        return (
          <g key={line.id} className={`pd-arrow pd-arrow--${kind}`} data-line={line.id}>
            <line className="pd-arrow-casing" x1={start.x} y1={start.y} x2={neck.x} y2={neck.y} />
            <path className="pd-arrow-casing" d={headPath} />
            <line className="pd-arrow-shaft" x1={start.x} y1={start.y} x2={neck.x} y2={neck.y} />
            <path className="pd-arrow-head" d={headPath} />
          </g>
        );
      })}
      {cells.map(({ d, count, present, x, y, fill }) => (
        <g key={d}>
          <text className={present ? 'pd-cell-digit' : 'pd-cell-digit pd-cell-digit--off'} x={x + 46} y={y + 50} textAnchor="middle" stroke={fill}>
            {d}{count > 1 && <tspan className="pd-cell-times" dx="3">{times(count)}</tspan>}
          </text>
          <text className={present ? 'pd-cell-planet' : 'pd-cell-planet pd-cell-planet--off'} x={x + 46} y={y + 79} textAnchor="middle" stroke={fill}>
            {present ? NUMBERS[d].planet.toUpperCase() : 'MISSING'}
          </text>
          {(grid.marks[d] ?? []).map((m, i) => {
            const cx = x + 80 - i * 19, cy = y + 13;
            const period = m === 'M' || m === 'A';
            return (
              <g key={m}>
                <circle className={period ? 'pd-mark pd-mark--period' : 'pd-mark'} cx={cx} cy={cy} r="8.5" />
                <text className={period ? 'pd-mark-letter pd-mark-letter--period' : 'pd-mark-letter'} x={cx} y={cy + 3.9} textAnchor="middle">{m}</text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

/** A short sample of an arrow, for the legend under a grid. */
export function ArrowKey({ kind }: { kind: ArrowKind }) {
  return (
    <svg className={`pd-arrowkey pd-arrow pd-arrow--${kind}`} viewBox="0 0 60 16" aria-hidden="true">
      <line className="pd-arrow-shaft" x1="3" y1="8" x2="44" y2="8" />
      <path className="pd-arrow-head" d="M58,8 L43,1 L43,15 Z" />
    </svg>
  );
}

/** Lines under a grid naming each arrow, so the drawing never depends on colour alone. */
export function GridLegend({ grid }: { grid: PrintGrid }) {
  const complete = inArrowOrder(LOSHU_LINES.filter((l) => grid.complete.includes(l.id)));
  return (
    <div className="pd-legend">
      {complete.length ? (
        <ul>
          {complete.map((l) => (
            <li key={l.id}><ArrowKey kind={arrowKind(l)} /><strong>{LINE_TEXT[l.id].name}</strong><span>{l.cells.join('-')}</span></li>
          ))}
        </ul>
      ) : <p>No line of three is complete, so no arrow is drawn.</p>}
      <p className="pd-legend-note">“×2” means a number appears twice; a dashed cell is a missing number.{grid.key ? ` ${grid.key}` : ''}</p>
    </div>
  );
}

/** The square as a map of directions (Numero Vastu), with South at the top. */
export function VastuGrid({ counts }: { counts: Readonly<Record<Digit, number>> }) {
  return (
    <div className="pd-vastu">
      <div className="pd-vastu-grid">
        {LOSHU_LAYOUT.flat().map((d) => {
          const dir = NUMBER_DIRECTION[d];
          const present = counts[d] > 0;
          return (
            <div key={d} className={present ? 'pd-vastu-cell' : 'pd-vastu-cell pd-vastu-cell--off'}>
              <span className="pd-vastu-dir">{dir === 'centre' ? 'Centre' : DIRECTION_NAME[dir]}</span>
              <span className="pd-vastu-num">{d}</span>
              <span className="pd-vastu-state">{present ? 'present' : 'missing'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Dates 1 to 31: those adding down to the Driver filled, those of friendly numbers ringed. */
export function DateStrip({ own, friendly, driver }: { own: number[]; friendly: number[]; driver: Digit }) {
  return (
    <div className="pd-dates">
      <div className="pd-dates-grid">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
          const kind = own.includes(n) ? 'own' : friendly.includes(n) ? 'friendly' : 'plain';
          return (
            <span key={n} className={`pd-date pd-date--${kind}`}
              style={kind === 'own' ? { background: NUMBERS[driver].colour.fill } : undefined}>{n}</span>
          );
        })}
      </div>
      <p className="pd-dates-key">
        <span className="pd-date pd-date--own pd-date--key" style={{ background: NUMBERS[driver].colour.fill }}>{driver}</span> Dates that add down to {driver}
        <span className="pd-date pd-date--friendly pd-date--key">·</span> Dates of friendly numbers
      </p>
    </div>
  );
}

/** A life on one line: segments in the colour of their number, ticks every ten years, and today marked. */
export function Timeline({ segments, end, unit, now }: { segments: TimelineSegment[]; end: number; unit: string; now?: number }) {
  const W = 900, top = 26, h = 26;
  const x = (v: number) => (Math.min(Math.max(v, 0), end) / end) * W;
  const ticks = Array.from({ length: Math.floor(end / 10) + 1 }, (_, i) => i * 10);
  return (
    <svg className="pd-timeline" viewBox={`-12 0 ${W + 24} 76`} aria-hidden="true">
      {segments.map((s, i) => {
        const x1 = x(s.from), x2 = x(s.to ?? end), w = Math.max(x2 - x1, 0);
        const fits = s.label.length * 7.5 < w - 4;
        return (
          <g key={i}>
            <rect className={s.current ? 'pd-seg pd-seg--now' : 'pd-seg'} x={x1} y={top} width={w} height={h}
              fill={s.digit ? NUMBERS[s.digit].colour.fill : '#efe8d6'} />
            {fits && <text className="pd-seg-label" x={x1 + w / 2} y={top + h / 2 + 4.5} textAnchor="middle">{s.label}</text>}
          </g>
        );
      })}
      {ticks.map((t) => (
        <g key={t}>
          <line className="pd-tick" x1={x(t)} y1={top + h} x2={x(t)} y2={top + h + 6} />
          <text className="pd-tick-label" x={x(t)} y={top + h + 18} textAnchor={t === 0 ? 'start' : 'middle'}>
            {t === 0 ? `${unit.charAt(0).toUpperCase()}${unit.slice(1)} 0` : t}
          </text>
        </g>
      ))}
      {now !== undefined && now >= 0 && now <= end && (
        <g className="pd-now">
          <path d={`M${x(now)},${top - 2} l-6,-10 h12 z`} />
          <text x={x(now)} y={top - 15} textAnchor="middle">Now, {unit} {now}</text>
        </g>
      )}
    </svg>
  );
}

/** How often each digit appears, as ten columns with the count written on top of each. */
export function Histogram({ columns }: { columns: { label: string; sub: string; count: number; digit?: Digit }[] }) {
  const max = Math.max(...columns.map((c) => c.count), 1);
  const W = 900, base = 70, top = 14, cw = W / columns.length;
  return (
    <svg className="pd-histogram" viewBox={`0 0 ${W} 104`} aria-hidden="true">
      <line className="pd-tick" x1="0" y1={base} x2={W} y2={base} />
      {columns.map((c, i) => {
        const h = (c.count / max) * (base - top);
        const x = i * cw + cw * 0.22, w = cw * 0.56;
        return (
          <g key={c.label}>
            {c.count > 0 && <rect className="pd-col" x={x} y={base - h} width={w} height={h} rx="4" fill={c.digit ? NUMBERS[c.digit].colour.fill : '#d9cfb3'} />}
            <text className="pd-col-count" x={x + w / 2} y={base - h - 4} textAnchor="middle">{c.count === 0 ? '–' : `×${c.count}`}</text>
            <text className="pd-col-label" x={x + w / 2} y={base + 17} textAnchor="middle">{c.label}</text>
            <text className="pd-col-sub" x={x + w / 2} y={base + 30} textAnchor="middle">{c.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** A level as filled steps, e.g. 2 of 5; the level is always written beside it. */
export function Meter({ level, max }: { level: number; max: number }) {
  return (
    <span className="pd-meter" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => <span key={i} className={i < level ? 'pd-meter-step pd-meter-step--on' : 'pd-meter-step'} />)}
    </span>
  );
}
