import { useEffect, useId, useState, type ReactNode } from 'react';
import { Printer } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import type { PrintOptions } from '@/lib/print/printSettings';
import type { PrintReportData } from '@/lib/print/types';

type Mode = 'full' | 'summary' | 'custom';

const summaryOmit = (report: PrintReportData) => report.sections.filter((s) => !s.summary).map((s) => s.id);
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

const BOX = 'rounded-2xl border border-white/10 bg-white/[0.03] p-4';
const LEGEND = 'mb-2 text-xs font-medium uppercase tracking-wide text-white/60';
const CHOICE = 'inline-block cursor-pointer rounded-full border border-white/20 px-3.5 py-1.5 text-sm text-white/80 transition-colors '
  + 'peer-checked:border-gold-soft/70 peer-checked:bg-gold-bright/15 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan';

/** A row of mutually exclusive choices drawn as pills. */
function Choices<T extends string>({ legend, name, value, options, onChange }: {
  legend: string; name: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className={LEGEND}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
            <span className={CHOICE}>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-white/80">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 flex-none accent-[#E6B84A]" />
      <span>{children}</span>
    </label>
  );
}

/**
 * Choices before printing: which sections, whose name, a consultant's details and notes, a cover
 * page, colour or ink saving, and the paper size. Printing itself is the browser's own dialog,
 * which also offers "Save as PDF".
 */
export function PrintDialog({ open, report, initial, onCancel, onPrint }: {
  open: boolean;
  report: PrintReportData;
  initial: PrintOptions;
  onCancel: () => void;
  onPrint: (options: PrintOptions, mode: Mode) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [mode, setMode] = useState<Mode>('full');
  const id = useId();

  // Each time the dialog opens it starts from the options in force.
  useEffect(() => {
    if (!open) return;
    setDraft(initial);
    setMode(initial.omit.length === 0 ? 'full' : sameSet(initial.omit, summaryOmit(report)) ? 'summary' : 'custom');
  }, [open, initial, report]);

  const set = (patch: Partial<PrintOptions>) => setDraft((d) => ({ ...d, ...patch }));
  const chooseMode = (m: Mode) => {
    setMode(m);
    if (m === 'full') set({ omit: [] });
    if (m === 'summary') set({ omit: summaryOmit(report) });
  };
  const toggle = (sectionId: string, on: boolean) =>
    set({ omit: on ? draft.omit.filter((x) => x !== sectionId) : [...draft.omit, sectionId] });
  const subjectIsName = report.subject.label === 'Name';

  return (
    <Modal open={open} onClose={onCancel} title="Print or save as PDF" maxWidth="max-w-3xl max-h-[92vh] overflow-y-auto">
      <form
        onSubmit={(e) => { e.preventDefault(); onPrint(draft, mode); }}
        className="space-y-5"
        aria-describedby={`${id}-tip`}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className={`${BOX} space-y-4`}>
            <Choices legend="What to print" name={`${id}-mode`} value={mode} onChange={chooseMode}
              options={[{ value: 'full', label: 'Full report' }, { value: 'summary', label: 'One-page summary' }, { value: 'custom', label: 'Choose sections' }]} />
            <fieldset>
              <legend className={LEGEND}>Sections</legend>
              <div className="space-y-2">
                {report.sections.map((s) => (
                  <Check key={s.id} checked={!draft.omit.includes(s.id)} onChange={(on) => { setMode('custom'); toggle(s.id, on); }}>
                    {s.title}{s.appendix ? <span className="text-white/50"> (appendix)</span> : null}
                  </Check>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/55">The heading, the details at the top and the numbers at a glance are always printed.</p>
            </fieldset>
          </div>

          <div className="space-y-4">
            <div className={`${BOX} space-y-3`}>
              <p className={LEGEND}>Personalise</p>
              <Input id={`${id}-for`} label="Name on the report" value={draft.preparedFor} maxLength={80} autoComplete="off"
                placeholder={subjectIsName ? report.subject.value : 'Optional, e.g. the person it is for'}
                onChange={(e) => set({ preparedFor: e.target.value })} />
              <Input id={`${id}-by`} label="Prepared by (optional)" value={draft.preparedBy} maxLength={120} autoComplete="off"
                placeholder="For consultants: your name and contact" onChange={(e) => set({ preparedBy: e.target.value })} />
              <div>
                <label htmlFor={`${id}-note`} className="mb-1.5 block text-sm text-white/70">Notes (optional)</label>
                <textarea id={`${id}-note`} value={draft.note} maxLength={1200} rows={3}
                  onChange={(e) => set({ note: e.target.value })} placeholder="Printed in a Notes box at the end"
                  className="w-full rounded-xl border border-white/12 bg-cosmic-darker/60 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-brand-cyan focus:outline-none" />
              </div>
            </div>
            <div className={`${BOX} space-y-4`}>
              <Check checked={draft.cover} onChange={(v) => set({ cover: v })}>Add a cover page with the name and the VediCosmic emblem</Check>
              <Choices legend="Colour" name={`${id}-colour`} value={draft.colour} onChange={(v) => set({ colour: v })}
                options={[{ value: 'colour', label: 'Colour' }, { value: 'ink', label: 'Ink saver (black and white)' }]} />
              <Choices legend="Paper" name={`${id}-paper`} value={draft.paper} onChange={(v) => set({ paper: v })}
                options={[{ value: 'A4', label: 'A4' }, { value: 'letter', label: 'US Letter' }]} />
              <Check checked={draft.remember} onChange={(v) => set({ remember: v })}>
                Remember “Prepared by”, cover, colour and paper on this device
              </Check>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit"><Printer className="h-4 w-4" /> Print or save as PDF</Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
        <p id={`${id}-tip`} className="text-xs leading-relaxed text-white/60">
          To keep a file, choose “Save as PDF” as the printer. The name and notes are used for this printout only and are not stored or sent anywhere.
        </p>
      </form>
    </Modal>
  );
}
