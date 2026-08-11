import { useState } from 'react';
import { QUOTES } from './quotes';

/** Picked once per mount, not auto-rotating — a rotating carousel next to a live audio
 *  session would compete for attention with the controls right beside it. */
export function QuoteCard() {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6">
      <span aria-hidden className="pointer-events-none absolute -right-3 -top-5 text-6xl text-white/[0.04]">✦</span>
      <blockquote className="relative border-l-4 border-gold-soft/40 pl-4 italic text-white/70">
        <p className="text-sm leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
        {quote.attribution && <footer className="mt-2 text-xs not-italic text-white/40">— {quote.attribution}</footer>}
      </blockquote>
    </div>
  );
}
