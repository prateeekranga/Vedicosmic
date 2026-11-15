import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { pageCss, pdfTitle, type PrintOptions } from '@/lib/print/printSettings';
import type { PrintReportData, PrintSection } from '@/lib/print/types';
import { Block, Tiles } from './PrintBlocks';
import { Emblem } from './PrintGraphics';

const two = (n: number) => String(n).padStart(2, '0');

/** How much room a heading keeps beneath it, so it never ends a page without what follows it. */
const KEEP: Partial<Record<PrintSection['blocks'][number]['kind'], string>> = { grid: '104mm', cards: '40mm', timeline: '34mm', vastu: '72mm', bars: '48mm', histogram: '34mm' };

function Section({ section, number, intro }: { section: PrintSection; number: string; intro?: string }) {
  const keep = KEEP[section.blocks[0]?.kind] ?? '28mm';
  const text = intro ?? section.intro;
  return (
    <section className={section.appendix ? 'pd-sec pd-sec--appendix' : 'pd-sec'} data-section={section.id} style={{ '--keep': keep } as CSSProperties}>
      <div className="pd-sec-top">
        <header className="pd-sec-head">
          <span className="pd-sec-num">{number}</span>
          <h2>{section.title}</h2>
        </header>
        {text && <p className="pd-intro">{text}</p>}
      </div>
      {section.blocks.map((b, i) => <Block key={i} block={b} />)}
    </section>
  );
}

function Subject({ report, options }: { report: PrintReportData; options: PrintOptions }) {
  const forName = options.preparedFor.trim();
  const lines = forName ? [`${report.subject.label}: ${report.subject.value}`, ...report.details] : report.details;
  return (
    <div className="pd-subject">
      <div>
        <p className="pd-label">{forName ? 'Prepared for' : report.subject.label}</p>
        <p className="pd-name">{forName || report.subject.value}</p>
        {lines.length > 0 && <p className="pd-subject-lines">{lines.join('  ·  ')}</p>}
      </div>
      {options.preparedBy.trim() && (
        <div className="pd-by">
          <p className="pd-label">Prepared by</p>
          <p className="pd-by-name">{options.preparedBy.trim()}</p>
        </div>
      )}
    </div>
  );
}

function Cover({ report, options }: { report: PrintReportData; options: PrintOptions }) {
  const forName = options.preparedFor.trim();
  return (
    <section className="pd-cover" data-section="cover">
      <div className="pd-cover-frame">
        <p className="pd-cover-brand">VEDICOSMIC</p>
        <div className="pd-cover-middle">
          <Emblem className="pd-emblem--cover" />
          <h1 className="pd-cover-title">{report.title}</h1>
          <div className="pd-cover-rule" aria-hidden="true"><span /></div>
          <p className="pd-label">{forName ? 'Prepared for' : report.subject.label}</p>
          <p className="pd-cover-name">{forName || report.subject.value}</p>
          {(forName ? [`${report.subject.label}: ${report.subject.value}`, ...report.details] : report.details).map((l) => (
            <p key={l} className="pd-cover-line">{l}</p>
          ))}
        </div>
        <div className="pd-cover-foot">
          {options.preparedBy.trim() && <p><span className="pd-label">Prepared by</span><br />{options.preparedBy.trim()}</p>}
          <p>Prepared on {report.preparedOn} at vedicosmic.com</p>
        </div>
      </div>
    </section>
  );
}

/** The report as printed. On screen it is not shown; print.css shows it and hides the page. */
export function PrintDocumentBody({ report, options }: { report: PrintReportData; options: PrintOptions }) {
  const chosen = report.sections.filter((s) => !options.omit.includes(s.id));
  const main = chosen.filter((s) => !s.appendix);
  const appendix = chosen.filter((s) => s.appendix);
  const note = options.note.trim();
  return (
    <div className="pd" data-colour={options.colour} data-paper={options.paper} data-cover={options.cover || undefined}>
      <style>{pageCss(report, options)}</style>
      {options.cover && <Cover report={report} options={options} />}

      {!options.cover && <header className="pd-head">
        <div className="pd-brand">
          <Emblem className="pd-emblem--head" />
          <div>
            <p className="pd-brand-name">VEDICOSMIC</p>
            <p className="pd-brand-line">Free Vedic tools · vedicosmic.com</p>
          </div>
        </div>
        <div className="pd-doc">
          <p className="pd-doc-title">{report.title}</p>
          <p className="pd-doc-date">Prepared on {report.preparedOn}</p>
        </div>
      </header>}

      <Subject report={report} options={options} />

      <section className="pd-glance" data-section="glance">
        <p className="pd-label">At a glance</p>
        <Tiles tiles={report.glance} />
      </section>

      {main.map((s, i) => <Section key={s.id} section={s} number={two(i + 1)} />)}

      {note && (
        <section className="pd-sec pd-notes" data-section="notes">
          <div className="pd-sec-top"><header className="pd-sec-head"><span className="pd-sec-num">✎</span><h2>Notes</h2></header></div>
          <p className="pd-notes-text">{note}</p>
        </section>
      )}

      {appendix.map((s, i) => (
        <Section key={s.id} section={s} number={appendix.length > 1 ? `A${i + 1}` : 'A'} intro={i === 0 ? report.method : undefined} />
      ))}

      <footer className="pd-about">
        <Emblem className="pd-emblem--about" />
        <div>
          {appendix.length === 0 && <p>{report.method}</p>}
          <p>Prepared on {report.preparedOn} at vedicosmic.com and calculated in the browser; nothing in it was sent to VediCosmic. To work it out again, open {report.link}.</p>
          <p className="pd-about-disclaimer">{report.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Puts the report straight under <body>, where print.css can show it alone, and gives the page a
 * title made for the report while it prints, which browsers use as the PDF's file name.
 */
export function PrintDocument({ report, options }: { report: PrintReportData; options: PrintOptions }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  useEffect(() => {
    const title = pdfTitle(report, options);
    let previous: string | null = null;
    const before = () => { if (previous === null) { previous = document.title; document.title = title; } };
    const after = () => { if (previous !== null) { document.title = previous; previous = null; } };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
      after();
    };
  }, [report, options]);

  return host ? createPortal(<PrintDocumentBody report={report} options={options} />, host) : null;
}
