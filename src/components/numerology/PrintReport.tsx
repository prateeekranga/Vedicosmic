import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PrintDialog } from '@/components/print/PrintDialog';
import { PrintDocument } from '@/components/print/PrintDocument';
import {
  PRINT_DIALOG_EVENT, loadPrintPreferences, savePrintPreferences, type PrintOptions,
} from '@/lib/print/printSettings';
import type { PrintReportData } from '@/lib/print/types';
import { trackEvent } from '@/lib/analytics';

/**
 * The printed version of a result, and the options shown before printing. The report itself is
 * placed under <body> and only appears on paper; the Print button in ResultActions, and Ctrl+P or
 * Cmd+P, open the options first.
 */
export function PrintReport({ report }: { report: PrintReportData }) {
  const [options, setOptions] = useState<PrintOptions>(loadPrintPreferences);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  // A different person or number starts with an empty name, notes and section choice.
  const key = `${report.toolSlug}|${report.subject.value}|${report.details.join('|')}`;
  useEffect(() => { setOptions((o) => ({ ...o, preparedFor: '', note: '', omit: [] })); }, [key]);

  useEffect(() => {
    const onRequest = (e: Event) => { e.preventDefault(); setOpen(true); };
    // Ctrl+P or Cmd+P opens the options; pressed again inside them, it prints straight away.
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'p' && !openRef.current) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(PRINT_DIALOG_EVENT, onRequest);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(PRINT_DIALOG_EVENT, onRequest);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const print = (next: PrintOptions, mode: 'full' | 'summary' | 'custom') => {
    savePrintPreferences(next);
    // Commit the chosen options to the page before the browser lays out the printed pages.
    flushSync(() => { setOptions(next); setOpen(false); });
    trackEvent('report_printed', { tool: report.toolSlug, preset: mode });
    window.print();
  };

  return (
    <>
      <PrintDocument report={report} options={options} />
      <PrintDialog open={open} report={report} initial={options} onCancel={() => setOpen(false)} onPrint={print} />
    </>
  );
}
