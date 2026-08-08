import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CheckStatus, AnalysisCheck } from '@/lib/readability';

const DOT: Record<CheckStatus, string> = { good: 'bg-success', ok: 'bg-warning', bad: 'bg-error' };
const BADGE: Record<CheckStatus, string> = {
  good: 'border-success/40 bg-success/10 text-success',
  ok: 'border-warning/40 bg-warning/10 text-warning',
  bad: 'border-error/40 bg-error/10 text-error',
};

/** One Yoast/Rank Math-style analysis card — a colour-coded score badge plus the checklist
 *  that produced it. Used twice in BlogPostEditor (SEO analysis, Readability analysis), each
 *  independently collapsible. */
export function SeoAnalysisPanel({
  title, score, scoreLabel, checks, defaultOpen = true,
}: { title: string; score: CheckStatus; scoreLabel: string; checks: AnalysisCheck[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${BADGE[score]}`}>
            <span className={`h-2 w-2 rounded-full ${DOT[score]}`} aria-hidden /> {scoreLabel}
          </span>
          <span className="text-sm font-medium text-white/70">{title}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="mt-3 space-y-2 border-t border-white/8 pt-3">
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[c.status]}`} aria-hidden />
              <span className="text-white/60">{c.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
