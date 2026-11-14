import type { Report } from '@/lib/numerologyReport';

/**
 * The report as plain black-on-white text, hidden on screen and the only thing printed
 * (see the print rules in globals.css). It is hidden from assistive technology on screen,
 * because everything in it is already on the page.
 */
export function PrintReport({ report }: { report: Report }) {
  return (
    <div className="print-report hidden" aria-hidden="true">
      <h1>{report.title} · VediCosmic</h1>
      <p>{report.subtitle}</p>
      {report.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.grid && (
            <table>
              <tbody>
                {s.grid.map((row, i) => (
                  <tr key={i}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          )}
          <ul>
            {s.lines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>
      ))}
      <p className="print-note">{report.footer}</p>
    </div>
  );
}
