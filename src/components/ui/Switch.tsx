import { cn } from '@/lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible name — this component has no visible label of its own. */
  label: string;
  id?: string;
  accent?: 'gold' | 'cyan';
  className?: string;
}

/** A pill-style toggle switch — the site had none; native checkboxes were used everywhere
 *  else. On-state reuses the same gold/cyan sheen gradients Button.tsx's primary/cyan
 *  variants use, so a switched-on control reads as the site's own primary-action language.
 *  Relies on the sitewide global `:focus-visible` ring (globals.css) rather than its own. */
export function Switch({ checked, onChange, disabled, label, id, accent = 'gold', className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      data-sound="tap"
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-all duration-300',
        'disabled:cursor-not-allowed disabled:opacity-40',
        checked
          ? accent === 'cyan' ? 'border-brand-cyan/40 bg-cyan-sheen' : 'border-gold-soft/40 bg-gold-sheen'
          : 'border-white/15 bg-white/[0.06]',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-cosmic-darker shadow-md transition-transform duration-300',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
