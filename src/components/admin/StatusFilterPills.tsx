/** WordPress calls this the "subsubsub" — the "All (12) | Published (10) | Trash (2)" link row
 *  just under a list table's title. Filters the table below by clicking a status. */
export function StatusFilterPills<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { id: T; label: string; count: number }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      {options.map((o, i) => (
        <span key={o.id} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-white/15">|</span>}
          <button
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded px-1 py-0.5 transition-colors ${value === o.id ? 'text-gold-300' : 'text-white/50 hover:text-white/80'}`}
          >
            {o.label} <span className="text-white/35">({o.count})</span>
          </button>
        </span>
      ))}
    </div>
  );
}
