import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';

/* ─────────────────── solar math (NOAA-style, ±2 min) ─────────────────── */

const rad = Math.PI / 180;
function sunEventUTC(date: Date, lat: number, lng: number, rise: boolean): number | null {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const n = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
  const lngHour = lng / 15;
  const t = n + ((rise ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;
  RA += (Math.floor(L / 90) - Math.floor(RA / 90)) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;               // polar day/night
  let H = rise ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad;
  H /= 15;
  const T = H + RA - 0.06571 * t - 6.622;
  const UT = ((T - lngHour) % 24 + 24) % 24;
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + UT * 3600000;
}

/* ────────────────────── muhurta segment tables ────────────────────── */
// 1-based index of the 8 equal daylight parts, by weekday (0 = Sunday)
const RAHU = [8, 2, 7, 5, 6, 4, 3];
const YAMA = [5, 4, 3, 2, 1, 7, 6];
const GULI = [7, 6, 5, 4, 3, 2, 1];

interface Win { id: string; name: string; sa: string; kind: 'avoid' | 'good'; start: Date; end: Date; note: string }

const fmtT = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

export default function MuhurtaTool() {
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.209);
  const [locName, setLocName] = useState('New Delhi (default)');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(id); }, []);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => { setLat(Number(p.coords.latitude.toFixed(4))); setLng(Number(p.coords.longitude.toFixed(4))); setLocName('Your location'); },
      () => setLocName('Location unavailable — using entered coordinates'),
    );
  };

  const data = useMemo(() => {
    const date = new Date(dateStr + 'T12:00:00');
    if (isNaN(date.getTime())) return null;
    const riseMs = sunEventUTC(date, lat, lng, true);
    const setMs = sunEventUTC(date, lat, lng, false);
    if (riseMs == null || setMs == null) return null;
    const sunrise = new Date(riseMs);
    const sunset = new Date(setMs);
    const dayLen = setMs - riseMs;
    const part = dayLen / 8;
    const wd = date.getDay();
    const seg = (i: number): [Date, Date] => [new Date(riseMs + (i - 1) * part), new Date(riseMs + i * part)];

    const [rS, rE] = seg(RAHU[wd]);
    const [yS, yE] = seg(YAMA[wd]);
    const [gS, gE] = seg(GULI[wd]);
    const mu = dayLen / 15;
    const abhiS = new Date(riseMs + 7 * mu), abhiE = new Date(riseMs + 8 * mu);
    const brS = new Date(riseMs - 96 * 60000), brE = new Date(riseMs - 48 * 60000);

    const wins: Win[] = [
      { id: 'brahma', name: 'Brahma Muhurta', sa: 'ब्रह्म मुहूर्त', kind: 'good', start: brS, end: brE, note: 'The creator’s hour before dawn — the finest window for meditation, japa and study.' },
      { id: 'abhijit', name: 'Abhijit Muhurta', sa: 'अभिजित मुहूर्त', kind: 'good', start: abhiS, end: abhiE, note: wd === 3 ? 'The victorious midday muhurta — though tradition skips it on Wednesdays.' : 'The victorious midday muhurta — auspicious for beginning almost any work.' },
      { id: 'rahu', name: 'Rahu Kaal', sa: 'राहु काल', kind: 'avoid', start: rS, end: rE, note: 'Rahu’s portion of the day — new ventures, journeys and auspicious starts are traditionally avoided.' },
      { id: 'yama', name: 'Yamaganda', sa: 'यमगण्ड', kind: 'avoid', start: yS, end: yE, note: 'Yama’s window — considered obstructive to new beginnings.' },
      { id: 'gulika', name: 'Gulika Kaal', sa: 'गुलिक काल', kind: 'avoid', start: gS, end: gE, note: 'Saturn’s son Gulika rules this stretch — good works started now tend to repeat their troubles.' },
    ];
    return { sunrise, sunset, wins, date };
  }, [dateStr, lat, lng]);

  /* wheel geometry: 24h dial, midnight at top */
  const C = 140, R = 108, RW = 22;
  const angleOf = (d: Date) => ((d.getHours() * 60 + d.getMinutes()) / 1440) * 360 - 90;
  const pt = (a: number, r: number) => ({ x: C + r * Math.cos(a * rad), y: C + r * Math.sin(a * rad) });
  const arc = (s: Date, e: Date, r: number) => {
    const a1 = angleOf(s), a2 = angleOf(e);
    const p1 = pt(a1, r), p2 = pt(a2, r);
    const large = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  const isToday = dateStr === new Date().toISOString().slice(0, 10);
  const status = (w: Win) => {
    if (!isToday) return null;
    if (now >= w.start && now <= w.end) return 'now';
    if (now < w.start) return 'upcoming';
    return 'passed';
  };
  const COLORS: Record<string, string> = { rahu: '#F87171', yama: '#FB923C', gulika: '#FBBF24', abhijit: '#34D399', brahma: '#A78BFA' };

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/65">
          Every day carries windows of very different quality. The <b className="text-white">Muhurta wheel</b> computes today’s
          sunrise and sunset for your location, then marks the classical windows — golden <span className="text-emerald-300">Abhijit</span> and
          pre-dawn <span className="text-violet-300">Brahma Muhurta</span> to use, and <span className="text-rose-300">Rahu Kaal</span>,
          Yamaganda and Gulika to let pass.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label className="text-xs text-white/50">Date
            <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)}
              className="mt-1 block rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/50" />
          </label>
          <label className="w-28 text-xs text-white/50">Latitude
            <Input type="number" step="0.01" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="mt-1" />
          </label>
          <label className="w-28 text-xs text-white/50">Longitude
            <Input type="number" step="0.01" value={lng} onChange={(e) => setLng(Number(e.target.value))} className="mt-1" />
          </label>
          <button onClick={useMyLocation}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 px-3.5 py-2 text-sm text-white/70 transition-colors hover:border-gold-400/50 hover:text-gold-300">
            <MapPin className="h-4 w-4" /> Use my location
          </button>
          <span className="pb-2 text-xs text-white/35">{locName}</span>
        </div>
      </Card>

      {!data ? (
        <Card className="p-6 text-sm text-white/60">Couldn’t compute the sun for that date/place (polar latitudes have days without sunrise).</Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* wheel */}
          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow flex items-center gap-2"><Sun className="h-4 w-4" /> 24-hour wheel</span>
              <span className="text-xs text-white/45">☀ {fmtT(data.sunrise)} → {fmtT(data.sunset)}</span>
            </div>
            <svg viewBox="0 0 280 280" className="mx-auto w-full max-w-[380px]">
              {/* base ring + hour ticks */}
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
              {/* daylight arc */}
              <path d={arc(data.sunrise, data.sunset, R)} fill="none" stroke="rgba(255,215,0,0.13)" strokeWidth={RW} />
              {/* windows */}
              {data.wins.map((w) => (
                <motion.path key={w.id} d={arc(w.start, w.end, R)} fill="none" stroke={COLORS[w.id]}
                  strokeWidth={RW - 6} strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ duration: 0.8 }} />
              ))}
              {/* now needle */}
              {isToday && (() => { const a = angleOf(now); const p1 = pt(a, 24); const p2 = pt(a, R + RW / 2 - 1); return (
                <g>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#FFD700" strokeWidth="1.6" />
                  <circle cx={C} cy={C} r="4" fill="#FFD700" />
                </g>
              ); })()}
              <text x={C} y={C - 6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.75)">
                {data.date.toLocaleDateString('en-IN', { weekday: 'long' })}
              </text>
              <text x={C} y={C + 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
                {data.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                    <p className="mt-1.5 font-mono text-lg text-white/85">{fmtT(w.start)} – {fmtT(w.end)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">{w.note}</p>
                  </Card>
                </motion.div>
              );
            })}
            <p className="px-1 text-xs text-white/30">
              Times computed from the sun for the given coordinates and shown in your device’s timezone — for distant locations, mind the timezone difference. Verify important dates with a local panchang.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
