import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  /** What the tab shows; a word or two for a bar, richer content for a card tab. */
  label: ReactNode;
  /** Plain-text name for the accessibility tree when `label` is richer than text. */
  name?: string;
}

const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`;
const panelId = (prefix: string, id: string) => `${prefix}-panel-${id}`;

/**
 * A row of tabs with the keyboard behaviour the pattern calls for: arrow keys move between tabs and
 * select them, Home and End jump to the first and last, and only the selected tab is in the tab
 * order. Pair it with TabPanel using the same `idPrefix`. Panels stay in the document (hidden), so
 * what a tab hides is still found by the browser's own tools and by printing from the print view.
 */
export function Tabs({
  idPrefix, items, value, onChange, label, variant = 'bar', className,
}: {
  idPrefix: string;
  items: readonly TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  /** `bar` is a scrolling row of pills; `cards` lets each tab hold its own content in a grid. */
  variant?: 'bar' | 'cards';
  className?: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    // Move from the tab that has focus, which is the selected one in normal use.
    const focused = items.findIndex((t) => tabId(idPrefix, t.id) === e.currentTarget.id);
    const i = focused >= 0 ? focused : items.findIndex((t) => t.id === value);
    const last = items.length - 1;
    const next = e.key === 'ArrowRight' ? (i + 1) % items.length
      : e.key === 'ArrowLeft' ? (i + last) % items.length
        : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(items[next].id);
    refs.current[items[next].id]?.focus();
  };

  return (
    <div role="tablist" aria-label={label}
      className={cn(variant === 'bar' ? 'flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1' : 'grid gap-3 sm:grid-cols-3', className)}>
      {items.map((t) => {
        const on = t.id === value;
        return (
          <button key={t.id} type="button" role="tab" id={tabId(idPrefix, t.id)} aria-selected={on} aria-controls={panelId(idPrefix, t.id)}
            aria-label={t.name} tabIndex={on ? 0 : -1} ref={(el) => { refs.current[t.id] = el; }} onClick={() => onChange(t.id)} onKeyDown={onKey}
            className={cn(
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright',
              variant === 'bar'
                ? cn('flex-none whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-colors sm:py-2.5', on ? 'bg-gold-bright/15 text-gold-pale' : 'text-white/75 hover:bg-white/[0.06] hover:text-white')
                : cn('rounded-xl border p-4 text-left transition-colors', on ? 'border-gold-soft/60 bg-gold-bright/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'),
            )}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  idPrefix, id, value, children, className,
}: { idPrefix: string; id: string; value: string; children: ReactNode; className?: string }) {
  return (
    <div role="tabpanel" id={panelId(idPrefix, id)} aria-labelledby={tabId(idPrefix, id)} hidden={id !== value} tabIndex={0}
      className={cn('outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright', className)}>
      {children}
    </div>
  );
}
