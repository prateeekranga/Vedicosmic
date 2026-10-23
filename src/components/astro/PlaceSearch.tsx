import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MapPin } from 'lucide-react';
import type { PlaceResult } from '@/engine/places';
import { isValidZone, offsetLabel } from '@/engine/time';
import { placeFromResult, searchPlaces, type ChosenPlace } from '@/lib/places';
import { cn } from '@/lib/cn';

const fieldCls =
  'w-full rounded-xl border border-white/12 bg-cosmic-darker/60 px-4 py-3 text-white placeholder-white/30 ' +
  'transition-colors focus:border-brand-cyan focus:outline-none';
const smallCls = 'w-full rounded-lg border border-white/12 bg-cosmic-darker/60 px-3 py-2 text-sm text-white focus:border-brand-cyan focus:outline-none';

const ZONES: string[] = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.('timeZone') ?? [];

/** "+5:53", "5:53", "-4", "+0530" → minutes east of UTC, or null. */
function parseOffset(s: string): number | null {
  const m = s.trim().replace('−', '-').match(/^([+-])?(\d{1,2})(?::?(\d{2}))?$/);
  if (!m) return null;
  const minutes = Number(m[2]) * 60 + Number(m[3] ?? 0);
  if (minutes > 14 * 60) return null;
  return m[1] === '-' ? -minutes : minutes;
}

const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;

interface PlaceSearchProps {
  id: string;
  label: string;
  value: ChosenPlace | null;
  onChange: (place: ChosenPlace) => void;
  /** Offer a fixed UTC offset in place of the zone's rules (birth charts from old records). */
  allowOffsetOverride?: boolean;
  className?: string;
}

/** Place search (ARIA 1.2 combobox) with the chosen place's details editable under "Advanced". */
export function PlaceSearch({ id, label, value, onChange, allowOffsetOverride = false, className }: PlaceSearchProps) {
  const [query, setQuery] = useState(value?.label ?? '');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const request = useRef(0);
  const listId = `${id}-list`;
  const valueLabel = value?.label ?? '';

  useEffect(() => { setQuery(valueLabel); }, [valueLabel]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2) { setResults([]); setState('idle'); return; }
    const n = ++request.current;
    setState('loading');
    const timer = window.setTimeout(() => {
      searchPlaces(q)
        .then((r) => { if (n === request.current) { setResults(r); setActive(r.length ? 0 : -1); setState('idle'); } })
        .catch(() => { if (n === request.current) { setResults([]); setState('error'); } });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [query, open]);

  const choose = (r: PlaceResult) => {
    const p = placeFromResult(r);
    onChange({ ...p, offsetMinutes: null });
    setQuery(p.label);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  const showList = open && results.length > 0;
  const q = query.trim();
  const announcement = !open || q.length < 2 ? ''
    : state === 'loading' ? 'Searching places…'
    : state === 'error' ? 'Could not load places. Check your connection, or enter coordinates under Advanced.'
    : results.length ? `${results.length} places found. Use the up and down arrows to choose.`
    : 'No matching places. Check the spelling, or enter coordinates under Advanced.';

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-white/70">{label}</label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder="Start typing a town or city"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResults([]); setOpen(true); }}
          onFocus={() => { if (query !== valueLabel) setOpen(true); }}
          onBlur={() => { setOpen(false); setQuery(valueLabel); }}
          onKeyDown={onKeyDown}
          className={cn(fieldCls, 'pl-10')}
        />
      </div>
      <ul id={listId} role="listbox" aria-label="Matching places" hidden={!showList}
        className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-white/12 bg-cosmic-darker p-1 shadow-card">
        {results.map((r, i) => (
          <li key={`${r.name}-${r.lat}-${r.lon}`} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()} onClick={() => choose(r)} onMouseEnter={() => setActive(i)}
            className={cn('cursor-pointer rounded-lg px-3 py-2 text-sm', i === active ? 'bg-white/10 text-white' : 'text-white/75')}>
            {r.name}
            <span className="text-white/60">{[r.state, r.country].filter((x) => x && x !== r.name).map((x) => `, ${x}`).join('')}</span>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      {open && q.length >= 2 && state !== 'loading' && results.length === 0 && (
        <p className="mt-1.5 text-xs text-white/60">{announcement}</p>
      )}

      {value && (
        <p className="mt-1.5 text-xs text-white/60">
          {coord(value.lat, 'N', 'S')}, {coord(value.lon, 'E', 'W')} · {value.offsetMinutes != null
            ? `fixed offset UTC${offsetLabel(value.offsetMinutes)}` : value.zone}
        </p>
      )}
      <Advanced value={value} onChange={onChange} allowOffsetOverride={allowOffsetOverride} id={id} />
    </div>
  );
}

function Advanced({ id, value, onChange, allowOffsetOverride }: {
  id: string; value: ChosenPlace | null; onChange: (p: ChosenPlace) => void; allowOffsetOverride: boolean;
}) {
  const [lat, setLat] = useState(value ? String(value.lat) : '');
  const [lon, setLon] = useState(value ? String(value.lon) : '');
  const [zone, setZone] = useState(value?.zone ?? '');
  const [useOffset, setUseOffset] = useState(value?.offsetMinutes != null);
  const [offset, setOffset] = useState(value?.offsetMinutes != null ? offsetLabel(value.offsetMinutes) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!value) return;
    setLat(String(value.lat));
    setLon(String(value.lon));
    setZone(value.zone);
    setUseOffset(value.offsetMinutes != null);
    setOffset(value.offsetMinutes != null ? offsetLabel(value.offsetMinutes) : '');
  }, [value]);

  const apply = () => {
    const la = Number(lat), lo = Number(lon);
    if (lat.trim() === '' || !Number.isFinite(la) || Math.abs(la) > 90) return setError('Latitude must be between −90 and 90.');
    if (lon.trim() === '' || !Number.isFinite(lo) || Math.abs(lo) > 180) return setError('Longitude must be between −180 and 180.');
    if (!isValidZone(zone)) return setError('Choose a time zone from the list, such as Asia/Kolkata.');
    const off = useOffset ? parseOffset(offset) : null;
    if (useOffset && off === null) return setError('Write the offset as hours and minutes, such as +5:53.');
    setError('');
    const moved = !value || value.lat !== la || value.lon !== lo;
    onChange({ label: moved ? `${la.toFixed(4)}, ${lo.toFixed(4)}` : value!.label, lat: la, lon: lo, zone, offsetMinutes: off });
  };

  return (
    <details className="mt-2 text-xs text-white/60">
      <summary className="cursor-pointer select-none hover:text-white/80">Advanced: coordinates and time zone</summary>
      <div className="mt-3 space-y-3 rounded-xl border border-white/10 p-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">Latitude (° N, negative for S)
            <input className={cn(smallCls, 'mt-1')} inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
          </label>
          <label className="block">Longitude (° E, negative for W)
            <input className={cn(smallCls, 'mt-1')} inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} />
          </label>
          <label className="block">Time zone
            <input className={cn(smallCls, 'mt-1')} list={`${id}-zones`} value={zone} onChange={(e) => setZone(e.target.value)} />
            <datalist id={`${id}-zones`}>{ZONES.map((z) => <option key={z} value={z} />)}</datalist>
          </label>
        </div>
        {allowOffsetOverride && (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useOffset} onChange={(e) => setUseOffset(e.target.checked)} />
              Use a fixed UTC offset instead of the time zone’s rules
            </label>
            {useOffset && (
              <label className="block max-w-[10rem]">Offset from UTC
                <input className={cn(smallCls, 'mt-1')} placeholder="+5:53" value={offset} onChange={(e) => setOffset(e.target.value)} />
              </label>
            )}
            <p className="leading-relaxed text-white/60">
              For old family records: until the 1950s some Indian cities kept their own local time (Bombay and Calcutta
              time, for example) instead of the time used today. If the record says which, enter its offset here.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={apply}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-white/80 transition-colors hover:border-brand-cyan hover:text-white">
            Use these values
          </button>
          {error && <span role="alert" className="text-error">{error}</span>}
        </div>
        <p className="text-white/60">
          Places from <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">GeoNames</a>,
          CC BY 4.0.
        </p>
      </div>
    </details>
  );
}

