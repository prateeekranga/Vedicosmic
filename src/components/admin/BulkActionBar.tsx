import { Button } from '@/components/ui/Button';

export interface BulkAction { value: string; label: string }

/** WordPress's "Bulk actions" dropdown + Apply button, always visible above (and usually below)
 *  a list table — disabled until both an action is chosen and at least one row is selected. */
export function BulkActionBar({
  actions, selectedCount, value, onChange, onApply,
}: { actions: BulkAction[]; selectedCount: number; value: string; onChange: (v: string) => void; onApply: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Bulk actions"
        className="rounded-lg border border-white/15 bg-cosmic-dark/70 px-2.5 py-1.5 text-sm text-white focus:border-brand-cyan focus:outline-none"
      >
        <option value="">Bulk actions</option>
        {actions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
      </select>
      <Button variant="outline" size="sm" onClick={onApply} disabled={!value || selectedCount === 0}>Apply</Button>
      {selectedCount > 0 && <span className="text-xs text-white/45">{selectedCount} selected</span>}
    </div>
  );
}
