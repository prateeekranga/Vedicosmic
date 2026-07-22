import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const tones = {
  gold: 'bg-gold-bright/12 text-gold-pale border-gold-soft/30',
  cyan: 'bg-brand-cyan/12 text-brand-cyan-soft border-brand-cyan/30',
  violet: 'bg-violet-chakra/12 text-violet-chakra border-violet-chakra/30',
  teal: 'bg-teal-cosmic/12 text-teal-cosmic border-teal-cosmic/30',
  neutral: 'bg-white/5 text-white/70 border-white/15',
  success: 'bg-success/12 text-success border-success/30',
  warning: 'bg-warning/12 text-warning border-warning/30',
  error: 'bg-error/12 text-error border-error/30',
} as const;

export function Badge({
  children, tone = 'neutral', className,
}: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
      tones[tone], className,
    )}>
      {children}
    </span>
  );
}
