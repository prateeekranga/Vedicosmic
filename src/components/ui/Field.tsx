import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const baseInput =
  'w-full rounded-xl border border-white/12 bg-cosmic-darker/60 px-4 py-3 text-white ' +
  'placeholder-white/30 transition-colors focus:border-brand-cyan focus:outline-none';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className, id, ...rest }, ref) => (
    <div>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm text-white/70">{label}</label>}
      <input id={id} ref={ref} className={cn(baseInput, error && 'border-error', className)} {...rest} />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ label, className, id, children, ...rest }, ref) => (
    <div>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm text-white/70">{label}</label>}
      <select id={id} ref={ref} className={cn(baseInput, 'appearance-none', className)} {...rest}>
        {children}
      </select>
    </div>
  ),
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ label, className, id, ...rest }, ref) => (
    <div>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm text-white/70">{label}</label>}
      <textarea id={id} ref={ref} className={cn(baseInput, 'resize-y', className)} {...rest} />
    </div>
  ),
);
Textarea.displayName = 'Textarea';
