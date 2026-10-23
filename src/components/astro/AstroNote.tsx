import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

/** A short caution next to a result: a borderline position, a time-sensitive Lagna, a clock change. */
export function AstroNote({ children }: { children: ReactNode }) {
  return (
    <p role="note" className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-warning">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
