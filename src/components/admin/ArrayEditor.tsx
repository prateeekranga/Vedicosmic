import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ArrayEditorProps<T extends { id: string }> {
  items: T[];
  onChange: (next: T[]) => void;
  addLabel: string;
  emptyItem: () => T;
  renderFields: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}

/** Generic add/remove/reorder editor for admin-managed content arrays (testimonials, FAQs, team, etc). */
export function ArrayEditor<T extends { id: string }>({ items, onChange, addLabel, emptyItem, renderFields }: ArrayEditorProps<T>) {
  const update = (id: string, patch: Partial<T>) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };
  const remove = (id: string) => { if (confirm('Remove this item?')) onChange(items.filter((it) => it.id !== id)); };
  const add = () => onChange([...items, emptyItem()]);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id} className="rounded-xl border border-white/10 bg-cosmic-dark/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-white/35">Item {i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:text-white disabled:opacity-30" aria-label="Move up">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:text-white disabled:opacity-30" aria-label="Move down">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => remove(item.id)}
                className="rounded-lg p-1.5 text-error/70 transition-colors hover:text-error" aria-label="Remove item">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">{renderFields(item, (patch) => update(item.id, patch))}</div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}><Plus className="mr-2 h-4 w-4" /> {addLabel}</Button>
    </div>
  );
}
