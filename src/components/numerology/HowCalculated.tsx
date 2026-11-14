import { Link } from 'react-router-dom';
import { NUMEROLOGY_ENGINE, type CalcStep } from '@/engine/numerology';

/** The arithmetic behind a result, step by step, so anyone can check it by hand. */
export function HowCalculated({ steps, open = false, className = '' }: { steps: CalcStep[]; open?: boolean; className?: string }) {
  return (
    <details open={open} className={`group rounded-xl border border-white/10 bg-white/[0.03] ${className}`}>
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">›</span>
        How this was calculated
      </summary>
      <ol className="space-y-3 border-t border-white/10 px-4 py-4">
        {steps.map((s) => (
          <li key={s.key} className="text-sm leading-relaxed text-white/75">
            <span className="font-medium text-white">{s.label}: {s.result}</span>
            <span className="block text-white/65">{s.working}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** The method statement under every numerology result. */
export function NumerologyMethodLine({ method, className = '' }: { method: string; className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-white/60 ${className}`}>
      Calculated on your device. {method} Engine: {NUMEROLOGY_ENGINE.name} {NUMEROLOGY_ENGINE.version}.{' '}
      <Link to="/how-we-calculate#numerology" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">How we calculate</Link>
    </p>
  );
}
