import { ChevronDown } from 'lucide-react';
import { useId, type ReactNode } from 'react';

export interface AccordionItem { id: string; header: ReactNode; body: ReactNode }

/**
 * A list of questions that open one at a time. Built on native <details>, so every answer is in
 * the page's HTML (search engines and screen readers get the whole list, and it works before any
 * JavaScript runs). Panels sharing a `name` close each other in current browsers; older ones
 * simply allow several open at once.
 */
export function Accordion({
  items, defaultOpen, heading = 'h3',
}: {
  items: AccordionItem[];
  defaultOpen?: string;
  /** Heading level for each question, or false where the questions are not headings. */
  heading?: 'h3' | 'h4' | false;
}) {
  const group = useId();
  const Heading = heading || 'span';
  return (
    <div className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10">
      {items.map((item) => (
        <details key={item.id} name={group} open={item.id === defaultOpen} className="group bg-cosmic-light/20">
          <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/3 [&::-webkit-details-marker]:hidden">
            <Heading className="min-w-0 flex-1 text-base font-medium text-white/90">{item.header}</Heading>
            <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-gold-soft transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5 text-sm leading-relaxed text-white/60">{item.body}</div>
        </details>
      ))}
    </div>
  );
}
