import type { ReactNode } from 'react';
import { rootOf } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';

/** Which tradition a number belongs to; shown on every number so two systems are never confused. */
export type NumberSystem = 'Lo Shu (Indian)' | 'Indian numerology' | 'Pythagorean (Western)' | 'Chaldean' | 'Eight Mansions';

/**
 * One number with its name, the system it comes from and a short note. The chip takes the
 * colour of the number's digit, so 11 shares the colour of 2.
 */
export function NumberCard({
  label, value, system, note, children,
}: { label: string; value: number; system: NumberSystem; note?: string; children?: ReactNode }) {
  const digit = rootOf(value);
  const info = NUMBERS[digit];
  return (
    <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-12 min-w-12 flex-none place-items-center rounded-lg px-2 font-heading text-xl font-bold"
          style={{ background: info.colour.fill, color: info.colour.ink }}>
          {value}
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-white">{label}</h4>
          <p className="text-xs text-white/60">{info.planet} · {system}</p>
        </div>
      </div>
      {note && <p className="mt-2 text-xs leading-snug text-white/60">{note}</p>}
      {children && <div className="mt-2 text-sm leading-relaxed text-white/75">{children}</div>}
    </div>
  );
}
