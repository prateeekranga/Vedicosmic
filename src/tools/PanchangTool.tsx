import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { dayOverview } from '@/engine/day';
import { addDays } from '@/engine/panchang';
import { dateInZone } from '@/engine/time';
import { usePreferredPlace } from '@/hooks/usePreferredPlace';
import { Card } from '@/components/ui/Card';
import { PlaceSearch } from '@/components/astro/PlaceSearch';
import { PanchangView } from '@/components/astro/PanchangView';

const NAV = 'inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-2.5 text-sm text-white/80 transition-colors hover:border-gold-soft/50 hover:text-white';

/** A YYYY-MM-DD string for a real date between 1900 and 2100, or null. */
function validDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  if (year < 1900 || year > 2100) return null;
  // Round-tripping through UTC rejects dates such as 31 February.
  return new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value ? value : null;
}

export default function PanchangTool() {
  const [place, setPlace] = usePreferredPlace();
  const [params, setParams] = useSearchParams();
  const [now, setNow] = useState(() => Date.now());
  const [dateStr, setDateStr] = useState(() => validDate(params.get('date')) ?? dateInZone(Date.now(), place.zone));
  const [locNote, setLocNote] = useState('');

  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(id); }, []);

  const today = dateInZone(now, place.zone);
  const isToday = dateStr === today;

  /** Shows a date and keeps it in the address, so a particular day can be bookmarked or shared. Today has no parameter. */
  const show = (date: string) => {
    setDateStr(date);
    setParams(date === today ? {} : { date }, { replace: true });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocNote('This browser cannot give a location. Search for your town instead.'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        // A device's own position goes with the device's own time zone.
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setPlace({ label: 'Your location', lat: Number(p.coords.latitude.toFixed(4)), lon: Number(p.coords.longitude.toFixed(4)), zone });
        setLocNote('');
      },
      () => setLocNote('Location unavailable. Search for your town instead.'),
    );
  };

  const day = useMemo(() => dayOverview(dateStr, place), [dateStr, place]);

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[auto,1fr] lg:items-start">
          <div>
            <label htmlFor="panchang-date" className="mb-1.5 block text-sm text-white/70">Date</label>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={NAV} onClick={() => show(addDays(dateStr, -1))} aria-label="Previous day">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <input id="panchang-date" type="date" value={dateStr} min="1900-01-01" max="2100-12-31"
                onChange={(e) => { const d = validDate(e.target.value); if (d) show(d); }}
                className="rounded-xl border border-white/12 bg-cosmic-darker/60 px-4 py-2.5 text-white outline-none focus:border-brand-cyan" />
              <button type="button" className={NAV} onClick={() => show(addDays(dateStr, 1))} aria-label="Next day">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" className={NAV} onClick={() => show(today)} disabled={isToday} aria-pressed={isToday}>
                Today
              </button>
            </div>
          </div>
          <PlaceSearch id="panchang-place" label="Place" value={place} onChange={setPlace} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={useMyLocation} className={NAV}>
            <MapPin className="h-4 w-4" aria-hidden="true" /> Use my location
          </button>
          {locNote && <span role="status" className="text-xs text-white/70">{locNote}</span>}
          <span className="text-xs text-white/60">Your place is remembered on this device only.</span>
        </div>
      </Card>

      {day ? (
        <PanchangView day={day} place={place} now={isToday ? now : null} />
      ) : (
        <Card className="p-6 text-sm leading-relaxed text-white/70">
          The Sun does not rise and set at this place on this date, so a sunrise-to-sunrise panchang cannot be drawn up for it. Try another date or a place further from the pole.
        </Card>
      )}
    </div>
  );
}
