export function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div data-speakable className="mt-6 rounded-2xl border border-gold-soft/20 bg-gold-bright/5 p-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gold-soft">Key Takeaways</p>
      <ul className="space-y-2 text-sm leading-relaxed text-white/75">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-gold-soft">•</span>{t}
          </li>
        ))}
      </ul>
    </div>
  );
}
