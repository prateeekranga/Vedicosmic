import type { ReactNode } from 'react';
import { Minus, TrendingUp, TriangleAlert } from 'lucide-react';
import type { Digit, SupportBand, Tone } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { OUTLOOK_TONE_LABEL } from '@/data/numerology/lifeAreaText';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

const BAND_FILL: Readonly<Record<SupportBand, string>> = { strong: '#34D399', mixed: '#39B7F0', thin: '#FBBF24' };

/** Dots filled up to a plain count (how many of an area's five key numbers are in the grid). The count is always written beside it. */
export function CountDots({ value, max = 5, band, small = false }: { value: number; max?: number; band: SupportBand; small?: boolean }) {
  return (
    <span aria-hidden="true" className={cn('inline-flex flex-none gap-1', small ? 'h-2' : 'h-2.5')}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn('rounded-full', small ? 'w-4' : 'w-6')}
          style={{ background: i < value ? BAND_FILL[band] : 'rgba(255,255,255,0.14)' }} />
      ))}
    </span>
  );
}

const TONE_BADGE = { supportive: 'success', steady: 'cyan', testing: 'warning' } as const;
const TONE_ICON = { supportive: TrendingUp, steady: Minus, testing: TriangleAlert } as const;

/** A period's tone as an icon and a word. */
export function ToneChip({ tone, className }: { tone: Tone; className?: string }) {
  const Icon = TONE_ICON[tone];
  return (
    <Badge tone={TONE_BADGE[tone]} className={cn('whitespace-nowrap', className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {OUTLOOK_TONE_LABEL[tone]}
    </Badge>
  );
}

/** A number in the colour it has everywhere on the site; dashed when the number is missing. */
export function DigitChip({ digit, count, missing = false }: { digit: Digit; count?: number; missing?: boolean }) {
  if (missing) {
    return (
      <span className="grid h-9 min-w-9 flex-none place-items-center rounded-lg border-2 border-dashed border-white/40 text-sm font-bold text-white/75">
        <span aria-hidden="true">{digit}</span>
        <span className="sr-only">{digit}, missing</span>
      </span>
    );
  }
  return (
    <span className="grid h-9 min-w-9 flex-none place-items-center rounded-lg px-1.5 text-sm font-bold"
      style={{ background: NUMBERS[digit].colour.fill, color: NUMBERS[digit].colour.ink }}>
      {digit}{count && count > 1 ? ` ×${count}` : ''}
    </span>
  );
}

/**
 * One section of the report, always the same shape: a heading, a one-line purpose, then content.
 * Every section of every tab uses it, so headings, spacing and reading order are the same throughout.
 */
export function PanelSection({
  id, title, lede, children, className, testId,
}: { id?: string; title: string; lede?: ReactNode; children: ReactNode; className?: string; testId?: string }) {
  return (
    <section id={id} data-testid={testId} className={cn('scroll-mt-24', className)}>
      <h3 className="font-heading text-h5 text-white">{title}</h3>
      {lede && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/70">{lede}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A collapsible block with the same look everywhere in the report. */
export function Fold({
  title, children, open = false, testId, className,
}: { title: ReactNode; children: ReactNode; open?: boolean; testId?: string; className?: string }) {
  return (
    <details open={open} data-testid={testId} className={cn('group rounded-xl border border-white/10 bg-white/[0.03]', className)}>
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">›</span>{title}
      </summary>
      <div className="border-t border-white/10 p-4">{children}</div>
    </details>
  );
}
