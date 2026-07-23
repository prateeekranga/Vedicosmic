import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

/**
 * Standardized trust signal shown on every post — one place to edit rather
 * than authored per-article, so the wording stays consistent site-wide.
 */
export function EditorialDisclaimer() {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/55">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
      <p>
        This article is educational and reflective, grounded in traditional Vedic teaching — it is not medical,
        psychological, legal or financial advice. Read our full{' '}
        <Link to="/disclaimer" className="text-brand-cyan-soft hover:underline">Disclaimer</Link>.
      </p>
    </div>
  );
}
