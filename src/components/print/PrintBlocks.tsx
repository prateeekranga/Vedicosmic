import type { CSSProperties } from 'react';
import { NUMBERS } from '@/data/numerology/numbers';
import type { PrintBlock, PrintCard, PrintTile } from '@/lib/print/types';
import { DateStrip, GridLegend, Histogram, Meter, PrintLoShu, Timeline, VastuGrid } from './PrintGraphics';

/** A digit's colour as a CSS variable, used for chips and tiles. */
const chipStyle = (digit?: number): CSSProperties | undefined =>
  (digit && digit >= 1 && digit <= 9 ? ({ '--chip': NUMBERS[digit as keyof typeof NUMBERS].colour.fill } as CSSProperties) : undefined);

export function Tiles({ tiles }: { tiles: PrintTile[] }) {
  return (
    <div className="pd-tiles" style={{ '--n': Math.min(tiles.length, 3) } as CSSProperties}>
      {tiles.map((t) => (
        <div key={t.label} className="pd-tile">
          <span className={t.digit ? 'pd-tile-value pd-tile-value--digit' : 'pd-tile-value'} style={chipStyle(t.digit)}>{t.value}</span>
          <span className="pd-tile-text">
            <span className="pd-tile-label">{t.label}</span>
            {t.caption && <span className="pd-tile-caption">{t.caption}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({ card }: { card: PrintCard }) {
  return (
    <div className="pd-card" data-highlight={card.highlight || undefined}>
      <div className="pd-card-head">
        {card.chip && <span className="pd-chip" data-digit={card.digit ? '' : undefined} style={chipStyle(card.digit)}>{card.chip}</span>}
        <span className="pd-card-titles">
          <span className="pd-card-title">{card.title}</span>
          {card.meta && <span className="pd-card-meta">{card.meta}</span>}
        </span>
        {card.badge && <span className="pd-badge">{card.badge}</span>}
      </div>
      <p className="pd-card-text">{card.text}</p>
      {card.extra && <p className="pd-card-extra">{card.extra}</p>}
    </div>
  );
}

export function Block({ block }: { block: PrintBlock }) {
  switch (block.kind) {
    case 'text':
      return <p className={block.tone === 'muted' ? 'pd-text pd-text--muted' : block.tone === 'lead' ? 'pd-text pd-text--lead' : 'pd-text'}>{block.text}</p>;
    case 'tiles':
      return <Tiles tiles={block.tiles} />;
    case 'cards':
      return (
        <div className="pd-cards" style={{ '--cols': block.columns ?? 2 } as CSSProperties}>
          {block.cards.map((c, i) => <Card key={`${c.title}-${i}`} card={c} />)}
        </div>
      );
    case 'table':
      return (
        <table className="pd-table">
          {block.widths && <colgroup>{block.widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>}
          <thead><tr>{block.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i} data-highlight={r.highlight || undefined}>{r.cells.map((c, j) => <td key={j}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    case 'facts':
      return (
        <dl className="pd-facts" style={{ '--cols': block.columns ?? 3 } as CSSProperties}>
          {block.facts.map((f) => (
            <div key={f.label} className="pd-fact"><dt>{f.label}</dt><dd>{f.value}</dd></div>
          ))}
        </dl>
      );
    case 'grid':
      return (
        <div className={block.aside?.length ? 'pd-gridwith' : 'pd-gridwith pd-gridwith--alone'}>
          <figure className="pd-gridfig">
            {block.title && <figcaption className="pd-gridfig-title">{block.title}</figcaption>}
            <PrintLoShu grid={block.grid} />
            <GridLegend grid={block.grid} />
          </figure>
          {block.aside?.length ? <div className="pd-gridaside">{block.aside.map((b, i) => <Block key={i} block={b} />)}</div> : null}
        </div>
      );
    case 'vastu':
      return <VastuGrid counts={block.counts} />;
    case 'dates':
      return <DateStrip own={block.own} friendly={block.friendly} driver={block.driver} />;
    case 'bars':
      return (
        <div className="pd-bars">
          {block.bars.map((b) => (
            <div key={b.label} className="pd-bar">
              <span className="pd-bar-label">{b.label}{b.sub && <small>{b.sub}</small>}</span>
              <span className="pd-bar-track">
                <span className="pd-bar-fill" style={{ width: `${Math.round(b.value * 100)}%`, ...(b.digit ? { background: NUMBERS[b.digit].colour.fill } : {}) }} />
              </span>
              <span className="pd-bar-value">{b.display}</span>
            </div>
          ))}
        </div>
      );
    case 'histogram':
      return <figure className="pd-histofig"><Histogram columns={block.columns} /></figure>;
    case 'meter':
      return <p className="pd-meterline"><Meter level={block.level} max={block.max} /><strong>{block.label}</strong></p>;
    case 'callout':
      return (
        <div className="pd-callout">
          {block.title && <p className="pd-callout-title">{block.title}</p>}
          <p>{block.text}</p>
        </div>
      );
    case 'timeline':
      return (
        <figure className="pd-timelinefig">
          <Timeline segments={block.segments} end={block.end} unit={block.unit} now={block.now} />
          {block.caption && <figcaption className="pd-text pd-text--muted">{block.caption}</figcaption>}
        </figure>
      );
    case 'letters':
      return (
        <div className="pd-words">
          {block.words.map((w, i) => (
            <div key={`${w.word}-${i}`} className="pd-word">
              <span className="pd-word-name">{w.word}</span>
              <span className="pd-word-letters">
                {w.letters.map((l, j) => <span key={j} className="pd-letter"><b>{l.ch}</b><small>{l.value}</small></span>)}
              </span>
              <span className="pd-word-total">= {w.total}</span>
            </div>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="pd-steps">
          {block.steps.map((s) => (
            <li key={s.key} className="pd-step"><strong>{s.label}: {s.result}</strong><span>{s.working}</span></li>
          ))}
        </ol>
      );
    case 'columns':
      return (
        <div className="pd-columns" style={{ '--cols': block.columns.length } as CSSProperties}>
          {block.columns.map((col, i) => <div key={i} className="pd-column">{col.map((b, j) => <Block key={j} block={b} />)}</div>)}
        </div>
      );
  }
}
