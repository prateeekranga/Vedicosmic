import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PlaceSearch } from '@/components/astro/PlaceSearch';
import { MethodLine } from '@/components/astro/MethodLine';
import { abhijit, brahmaMuhurta, gulikaKaal, rahuKaal, yamaganda } from '@/engine/muhurta';
import { daySunTimes } from '@/engine/panchang';
import { dateInZone, timeInZone } from '@/engine/time';
import { formatClock, formatIsoDate } from '@/lib/format';
import { usePreferredPlace } from '@/hooks/usePreferredPlace';

const rad = Math.PI / 180;

interface Win { id: string; name: string; sa: string; kind: 'avoid' | 'good'; start: number; end: number; note: string }

const COLORS: Record<string, string> = { rahu: '#F87171', yama: '#FB923C', gulika: '#FBBF24', abhijit: '#34D399', brahma: '#A78BFA' };

export default function MuhurtaTool() {
  const [place, setPlace] = usePreferredPlace();
  const [dateStr, setDateStr] = useState(() => dateInZone(Date.now(), place.zone));
  const [now, setNow] = useState(() => Date.now());
  const [locNote, setLocNote] = useState('');

  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(id); }, []);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        // A device's own position goes with the device's own time zone.
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setPlace({ label: 'Your location', lat: Number(p.coords.latitude.toFixed(4)), lon: Number(p.coords.longitude.toFixed(4)), zone });
        setLocNote('');
      },
      () => setLocNote('Location unavailable. Search for your town instead.'),
    );
  };

  const data = useMemo(() => {
    const sun = daySunTimes(dateStr, place);
    if (!sun) return null;
    const { sunrise, sunset, vara } = sun;
    const r = rahuKaal(sunrise, sunset, vara), y = yamaganda(sunrise, sunset, vara), g = gulikaKaal(sunrise, sunset, vara);
    const a = abhijit(sunrise, sunset), b = brahmaMuhurta(sunrise);
    const wins: Win[] = [
      { id: 'brahma', name: 'Brahma Muhurta', sa: 'ब्रह्म मुहूर्त', kind: 'good', ...b, note: 'The creator’s hour before dawn — the finest window for meditation, japa and study.' },
      { id: 'abhijit', name: 'Abhijit Muhurta', sa: 'अभिजित मुहूर्त', kind: 'good', ...a, note: vara === 3 ? 'The victorious midday muhurta — though tradition skips it on Wednesdays.' : 'The victorious midday muhurta — auspicious for beginning almost any work.' },
      { id: 'rahu', name: 'Rahu Kaal', sa: 'राहु काल', kind: 'avoid', ...r, note: 'Rahu’s portion of the day — new ventures, journeys and auspicious starts are traditionally avoided.' },
      { id: 'yama', name: 'Yamaganda', sa: 'यमगण्ड', kind: 'avoid', ...y, note: 'Yama’s window — considered obstructive to new beginnings.' },
      { id: 'gulika', name: 'Gulika Kaal', sa: 'गुलिक काल', kind: 'avoid', ...g, note: 'Saturn’s son Gulika rules this stretch — good works started now tend to repeat their troubles.' },
    ];
    return { sunrise, sunset, wins };
  }, [dateStr, place]);

  const clock = (ms: number) => formatClock(ms, place.zone);

  /* wheel geometry: 24h dial in the place's own clock, midnight at top */
  const C = 140, R = 108, RW = 22;
  const angleOf = (ms: number) => {
    const [h, m] = timeInZone(ms, place.zone).split(':').map(Number);
    return ((h * 60 + m) / 1440) * 360 - 90;
  };
  const pt = (a: number, r: number) => ({ x: C + r * Math.cos(a * rad), y: C + r * Math.sin(a * rad) });
  const arc = (s: number, e: number, r: number) => {
    const a1 = angleOf(s), a2 = angleOf(e);
    const p1 = pt(a1, r), p2 = pt(a2, r);
    const large = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  const isToday = dateStr === dateInZone(now, place.zone);
  const status = (w: Win) => {
    if (!isToday) return null;
    if (now >= w.start && now <= w.end) return 'now';
    if (now < w.start) return 'upcoming';
    return 'passed';
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/65">
          Every day carries windows of very different quality. The <b className="text-white">Muhurta wheel</b> computes the
          day’s sunrise and sunset for your location, then marks the classical windows — golden <span className="text-emerald-300">Abhijit</span> and
          pre-dawn <span className="text-violet-300">Brahma Muhurta</span> to use, and <span className="text-rose-300">Rahu Kaal</span>,
          Yamaganda and Gulika to let pass.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-start">
          <label className="text-sm text-white/70">Date
            <input type="date" value={dateStr} onChange={(e) => e.target.value && setDateStr(e.target.value)}
              className="mt-1.5 block rounded-xl border border-white/12 bg-cosmic-darker/60 px-4 py-3 text-white outline-none focus:border-brand-cyan" />
          </label>
          <PlaceSearch id="mu-place" label="Place" value={place} onChange={setPlace} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={useMyLocation}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 px-3.5 py-2 text-sm text-white/70 transition-colors hover:border-gold-400/50 hover:text-gold-300">
            <MapPin className="h-4 w-4" /> Use my location
          </button>
          {locNote && <span className="text-xs text-white/60">{locNote}</span>}
        </div>
      </Card>

      {!data ? (
        <Card className="p-6 text-sm text-white/60">The Sun does not rise and set at this place on this date, so these windows do not apply.</Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* wheel */}
          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="eyebrow flex items-center gap-2"><Sun className="h-4 w-4" /> 24-hour wheel</h3>
              <span className="text-xs text-white/45">☀ {clock(data.sunrise)} → {clock(data.sunset)}</span>
            </div>
            <svg viewBox="0 0 280 280" className="mx-auto w-full max-w-[380px]" role="img"
              aria-label={`Day wheel for ${formatIsoDate(dateStr, { weekday: 'long', day: 'numeric', month: 'long' })}`}>
              <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={RW} />
              {Array.from({ length: 24 }, (_, h) => {
                const a = (h / 24) * 360 - 90;
                const p1 = pt(a, R + RW / 2 + 2), p2 = pt(a, R + RW / 2 + (h % 6 === 0 ? 9 : 5));
                return <line key={h} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.18)" strokeWidth={h % 6 === 0 ? 1.4 : 0.7} />;
              })}
              {[0, 6, 12, 18].map((h) => {
                const p = pt((h / 24) * 360 - 90, R + RW / 2 + 18);
                return <text key={h} x={p.x} y={p.y + 3} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{h === 0 ? '12am' : h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`}</text>;
              })}
              <path d={arc(data.sunrise, data.sunset, R)} fill="none" stroke="rgba(255,215,0,0.13)" strokeWidth={RW} />
              {data.wins.map((w) => (
                <motion.path key={w.id} d={arc(w.start, w.end, R)} fill="none" stroke={COLORS[w.id]}
                  strokeWidth={RW - 6} strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ duration: 0.8 }} />
              ))}
              {isToday && (() => { const a = angleOf(now); const p1 = pt(a, 24); const p2 = pt(a, R + RW / 2 - 1); return (
                <g>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#FFD700" strokeWidth="1.6" />
                  <circle cx={C} cy={C} r="4" fill="#FFD700" />
                </g>
              ); })()}
              <text x={C} y={C - 6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.75)">
                {formatIsoDate(dateStr, { weekday: 'long' })}
              </text>
              <text x={C} y={C + 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
                {formatIsoDate(dateStr, { day: 'numeric', month: 'short', year: 'numeric' })}
              </text>
            </svg>
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-[11px] text-white/50">
              {data.wins.map((w) => (
                <span key={w.id} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[w.id] }} />{w.name}</span>
              ))}
            </div>
          </Card>

          {/* list */}
          <div className="space-y-3">
            {data.wins.map((w, i) => {
              const st = status(w);
              return (
                <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className={`p-4 sm:p-5 ${st === 'now' ? 'border-gold-soft/50' : ''}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-medium text-white">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[w.id] }} />
                        {w.name} <span className="text-white/40">{w.sa}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        {st === 'now' && <Badge tone="gold">Now</Badge>}
                        {st === 'upcoming' && <Badge tone="cyan">Upcoming</Badge>}
                        <Badge tone={w.kind === 'good' ? 'success' : 'warning'}>{w.kind === 'good' ? 'Auspicious' : 'Avoid'}</Badge>
                      </div>
                    </div>
                    <p className="mt-1.5 font-mono text-lg text-white/85">{clock(w.start)} – {clock(w.end)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">{w.note}</p>
                  </Card>
                </motion.div>
              );
            })}
            <p className="px-1 text-xs text-white/60">Times are local to {place.label}.</p>
            <MethodLine kind="day" className="px-1" />
          </div>
        </div>
      )}
    </div>
  );
}
