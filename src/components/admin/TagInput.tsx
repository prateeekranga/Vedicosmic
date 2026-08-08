import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

/** Chip-style tag editor used for a post's keywords. The first chip is visually flagged as
 *  the "focus keyword" — the primary phrase the on-page checklist (in BlogPostEditor) checks
 *  for in the title/slug/excerpt/first paragraph, the way Yoast-style SEO plugins do. Reorder
 *  by removing and re-adding a tag to make it first. */
export function TagInput({
  label, value, onChange, placeholder = 'Type a keyword and press Enter…',
}: { label: string; value: string[]; onChange: (next: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const t = draft.trim();
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
    else if (e.key === 'Backspace' && !draft && value.length > 0) onChange(value.slice(0, -1));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm text-white/70">{label}</label>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/12 bg-cosmic-darker/60 p-2.5 focus-within:border-brand-cyan">
        {value.map((tag, i) => (
          <span key={tag} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            i === 0 ? 'border-gold-soft/40 bg-gold-bright/12 text-gold-pale' : 'border-white/15 bg-white/5 text-white/70'
          }`}>
            {i === 0 && <span className="text-[10px] uppercase tracking-wide text-gold-soft/70">Focus</span>}
            {tag}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${tag}`}
              className="text-current/60 hover:text-current">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : 'Add another…'}
          className="min-w-[10ch] flex-1 bg-transparent py-1 text-sm text-white placeholder-white/30 focus:outline-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-white/40">
        {value.length === 0
          ? 'The first keyword you add becomes the focus keyword the checklist below tracks.'
          : `Focus keyword: "${value[0]}" — used for search, tags, and the SEO checklist.`}
      </p>
    </div>
  );
}
