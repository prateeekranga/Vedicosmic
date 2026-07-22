import { Link } from 'react-router-dom';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Magnetic } from '@/components/motion/Magnetic';

type Variant = 'primary' | 'cyan' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ' +
  'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-gold-sheen text-cosmic-darker hover:shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0',
  cyan:
    'bg-cyan-sheen text-cosmic-darker hover:shadow-glow-cyan hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-white/80 hover:text-white hover:bg-white/5',
  outline:
    'border border-gold-soft/40 text-gold-pale hover:border-gold-bright hover:bg-gold-bright/5',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
}

const variantSound: Record<Variant, string> = {
  primary: 'bowl', cyan: 'bowl', outline: 'tone', ghost: 'tap',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', to, className, children, ...rest }, ref) => {
    const classes = cn(base, variants[variant], sizes[size], className);
    const snd = variantSound[variant];
    const el = to ? (
      <Link to={to} className={classes} data-sound={snd}>
        {children}
      </Link>
    ) : (
      <button ref={ref} className={classes} data-sound={snd} {...rest}>
        {children}
      </button>
    );
    return size === 'lg' ? <Magnetic>{el}</Magnetic> : el;
  },
);
Button.displayName = 'Button';
