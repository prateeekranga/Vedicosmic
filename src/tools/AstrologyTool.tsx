import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Telescope } from 'lucide-react';
import { DateSelect } from '@/components/ui/DateSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { PlaceSearch } from '@/components/astro/PlaceSearch';
import { MethodLine } from '@/components/astro/MethodLine';
import { AstroNote } from '@/components/astro/AstroNote';
import { ClockNote } from '@/components/astro/ClockNote';
import { SaveOnDeviceButton } from '@/components/device/SaveOnDeviceButton';
import { castChart, moonOverDay, GRAHAS, type Chart } from '@/engine/chart';
import { NAKSHATRAS, RASHIS } from '@/engine/core';
import { vimshottari, type DashaPeriod } from '@/engine/dasha';
import { POLAR_LATITUDE } from '@/engine/ascendant';
import type { ResolvedTime } from '@/engine/time';
import { birthInstant, UNKNOWN_TIME } from '@/lib/birthTime';
import type { ChosenPlace } from '@/lib/places';
import { formatDateIn } from '@/lib/format';
import { RASHI_INFO, SIDEREAL_NOTE } from '@/data/zodiac';
import { GRAHA_META } from '@/data/grahas';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useToast } from '@/contexts/ToastContext';
import { trackEvent } from '@/lib/analytics';

const GRAHA_NAME = Object.fromEntries(GRAHAS.map((g) => [g.id, g])) as Record<string, (typeof GRAHAS)[number]>;
const deg = (d: number) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}′`;
const BOUNDARY_WORD = { sign: 'sign', nakshatra: 'nakshatra', pada: 'pada' } as const;

interface Cast {
  chart: Chart;
  resolved: ResolvedTime & { fixedOffset: boolean };
  timeUnknown: boolean;
  place: ChosenPlace;
  time: string;
  date: string;
}

/** Rashi chakra: signs from Mesha at the top, grahas at their degree, a line to the Lagna. */
function Wheel({ chart }: { chart: Chart }) {
  const size = 320, c = size / 2, rOuter = 150, rInner = 104;
  const at = (lon: number, r: number) => {
    const a = (lon - 90) * (Math.PI / 180);
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
  };
  // Grahas close together step inwards so their symbols do not overlap.
  const placed: { lon: number; r: number }[] = [];
  const marks = [...chart.grahas].sort((a, b) => a.longitude - b.longitude).map((g) => {
    const near = placed.filter((p) => Math.abs(((p.lon - g.longitude + 540) % 360) - 180) < 9).length;
    const r = rInner - 18 - near * 17;
    placed.push({ lon: g.longitude, r });
    return { g, ...at(g.longitude, r) };
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[340px]" role="img"
      aria-label="Rashi chakra showing the signs, the grahas and the Lagna">
      <circle cx={c} cy={c} r={rOuter} fill="none" stroke="rgba(230,184,74,0.25)" />
      <circle cx={c} cy={c} r={rInner} fill="none" stroke="rgba(57,183,240,0.2)" />
      {RASHI_INFO.map((r, i) => {
        const p0 = at(i * 30, rInner), p1 = at(i * 30, rOuter), mid = at(i * 30 + 15, (rInner + rOuter) / 2);
        const occupied = chart.grahas.some((g) => g.sign === i);
        return (
          <g key={i}>
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="rgba(255,255,255,0.08)" />
            <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize="15"
              fill={occupied ? r.color : 'rgba(255,255,255,0.35)'}>{r.symbol}</text>
          </g>
        );
      })}
      {chart.lagna && (() => {
        const p = at(chart.lagna.longitude, rOuter + 2), l = at(chart.lagna.longitude, rOuter - 30);
        return (
          <g>
            <line x1={c} y1={c} x2={p.x} y2={p.y} stroke="#FFD700" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#FFD700">Asc</text>
          </g>
        );
      })()}
      {marks.map(({ g, x, y }) => (
        <text key={g.id} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="14" fill={GRAHA_META[g.id].color}>
          {GRAHA_META[g.id].symbol}
        </text>
      ))}
      <circle cx={c} cy={c} r="3.5" fill="#FFD700" />
    </svg>
  );
}

function SignCard({ title, sign, detail }: { title: string; sign: number; detail: string }) {
  const info = RASHI_INFO[sign];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-sm text-white/50">{title}</div>
          <div className="font-heading text-lg text-white">{info.sanskrit} <span className="text-white/50">({info.english})</span></div>
        </div>
        <span className="ml-auto text-2xl" style={{ color: info.color }} aria-hidden="true">{info.symbol}</span>
      </div>
      <p className="mt-1 text-xs text-white/60">{detail}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="violet">{info.element}</Badge>
        <Badge tone="teal">{info.quality}</Badge>
        <Badge>{info.ruler}</Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/65">{info.traits}</p>
    </Card>
  );
}

function DashaTable({ periods, zone }: { periods: DashaPeriod[]; zone: string }) {
  const now = Date.now();
  const maha = periods.find((p) => p.start <= now && now < p.end);
  const antar = maha?.sub?.find((p) => p.start <= now && now < p.end);
  const month = (ms: number) => formatDateIn(ms, zone, { month: 'short', year: 'numeric' });
  return (
    <Card className="p-5">
      <h3 className="font-heading text-h4 text-white">Vimshottari dasha</h3>
      {maha && (
        <p className="mt-2 text-sm text-white/70">
          Now: <b className="text-white">{GRAHA_NAME[maha.lord].en}</b> mahadasha
          {antar && <>, <b className="text-white">{GRAHA_NAME[antar.lord].en}</b> antardasha until {month(antar.end)}</>}.
        </p>
      )}
      <table className="mt-3 w-full text-left text-sm">
        <caption className="sr-only">Mahadashas from birth</caption>
        <thead className="text-xs uppercase tracking-wide text-white/60">
          <tr><th scope="col" className="py-1.5 font-medium">Mahadasha</th><th scope="col" className="py-1.5 font-medium">From</th><th scope="col" className="py-1.5 font-medium">To</th></tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.start} className={`border-t border-white/8 ${p === maha ? 'text-gold-pale' : 'text-white/70'}`}>
              <td className="py-1.5">{GRAHA_NAME[p.lord].en}</td>
              <td className="py-1.5">{month(p.start)}</td>
              <td className="py-1.5">{month(p.end)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-white/60">The first period began before birth; years of 365.25 days.</p>
    </Card>
  );
}

export default function AstrologyTool() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState<ChosenPlace | null>(null);
  const [useLater, setUseLater] = useState(false);
  const [cast, setCast] = useState<Cast | null>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const ready = !!date && !!place && (timeUnknown || !!time);

  const compute = (later: boolean) => {
    if (!date || !place) return;
    const t = timeUnknown ? UNKNOWN_TIME : time;
    const resolved = birthInstant(date, t, place, later);
    if (!Number.isFinite(resolved.utcMs)) return;
    const chart = castChart({ utcMs: resolved.utcMs, lat: place.lat, lon: place.lon, timeUnknown });
    setCast({ chart, resolved, timeUnknown, place, time: t, date });
  };

  const calculate = () => {
    setUseLater(false);
    compute(false);
    trackEvent('chart_created', { tool: 'astrology' });
  };

  const switchOccurrence = (later: boolean) => { setUseLater(later); compute(later); };

  const dasha = useMemo(() => (cast && !cast.timeUnknown ? vimshottari(cast.chart.utcMs, cast.chart.grahas[1].longitude) : null), [cast]);
  const dayMoon = useMemo(() => {
    if (!cast?.timeUnknown) return null;
    const start = birthInstant(cast.date, '00:00', cast.place).utcMs;
    return moonOverDay(start, start + 86399000);
  }, [cast]);

  const save = () => {
    if (!cast) return;
    const { chart } = cast;
    const moon = chart.grahas[1], sun = chart.grahas[0];
    const parts = [
      chart.lagna ? `Lagna ${RASHIS[chart.lagna.sign]}` : null,
      `Moon in ${RASHIS[moon.sign]} (${NAKSHATRAS[moon.nakshatra]})`,
      `Sun in ${RASHIS[sun.sign]}`,
    ].filter(Boolean);
    saveReading({ toolId: 'astrology', toolName: 'Vedic Birth Chart', summary: parts.join(' · ') });
    notify('Chart saved on this device');
    trackEvent('chart_saved', { tool: 'astrology' });
  };

  const chart = cast?.chart;
  const moon = chart?.grahas[1];
  const sun = chart?.grahas[0];

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <p className="mb-6 text-sm leading-relaxed text-white/60">{SIDEREAL_NOTE}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <DateSelect value={date} onChange={setDate} />
          <div>
            <Input id="ast-time" label="Time of birth" type="time" value={time} disabled={timeUnknown}
              onChange={(e) => setTime(e.target.value)} />
            <label className="mt-2 flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
              I don’t know the birth time
            </label>
          </div>
          <PlaceSearch id="ast-place" label="Place of birth" value={place} onChange={setPlace} allowOffsetOverride className="sm:col-span-2" />
        </div>
        <Button className="mt-6" onClick={calculate} disabled={!ready}>
          <Telescope className="h-4 w-4" /> Cast my chart
        </Button>
      </Card>

      <AnimatePresence mode="wait">
        {cast && chart && moon && sun && (
          <motion.div key={chart.utcMs} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="eyebrow mb-2 block text-center">Rashi chakra</h3>
                <Wheel chart={chart} />
              </Card>
              <div className="space-y-4">
                {chart.lagna && (
                  <SignCard title="Lagna (Ascendant)" sign={chart.lagna.sign} detail={`${deg(chart.lagna.degreeInSign)} in ${RASHIS[chart.lagna.sign]} · ${NAKSHATRAS[chart.lagna.nakshatra]} pada ${chart.lagna.pada}`} />
                )}
                <SignCard title="Moon · Chandra" sign={moon.sign} detail={`${deg(moon.degreeInSign)} in ${RASHIS[moon.sign]} · ${NAKSHATRAS[moon.nakshatra]} pada ${moon.pada}`} />
                <SignCard title="Sun · Surya" sign={sun.sign} detail={`${deg(sun.degreeInSign)} in ${RASHIS[sun.sign]} · ${NAKSHATRAS[sun.nakshatra]} pada ${sun.pada}`} />
              </div>
            </div>

            <div className="space-y-3">
              <ClockNote resolved={cast.resolved} time={cast.time} zone={cast.place.zone} useLater={useLater} onUseLater={switchOccurrence} />
              {cast.timeUnknown && (
                <AstroNote>
                  Without a birth time there is no Lagna, houses or dasha, and positions are given for noon.{' '}
                  {dayMoon && (dayMoon.signChanges || dayMoon.nakshatraChanges)
                    ? `The Moon moved from ${NAKSHATRAS[dayMoon.start.nakshatra]} (${RASHIS[dayMoon.start.sign]}) into ${NAKSHATRAS[dayMoon.end.nakshatra]} (${RASHIS[dayMoon.end.sign]}) during this day, so the Moon result depends on the time.`
                    : 'The Moon stayed in the same sign and nakshatra all day, so those results hold for any time.'}
                </AstroNote>
              )}
              {!cast.timeUnknown && !chart.lagna && Math.abs(cast.place.lat) > POLAR_LATITUDE && (
                <AstroNote>The Lagna is not calculated beyond {POLAR_LATITUDE}° latitude, where some signs never rise.</AstroNote>
              )}
              {chart.timeSensitive.lagnaSign && (
                <AstroNote>The Lagna changes sign within 5 minutes of this birth time. If the recorded time could be a few minutes out, the Lagna may be the neighbouring sign.</AstroNote>
              )}
              {!cast.timeUnknown && chart.timeSensitive.moonNakshatra && (
                <AstroNote>The Moon changes nakshatra within 30 minutes of this time, so a less exact birth time could give the neighbouring nakshatra.</AstroNote>
              )}
              {chart.lagna?.borderline && (
                <AstroNote>The Lagna is within 0.05° of the edge of a {BOUNDARY_WORD[chart.lagna.borderline]}: even an exact calculation cannot say which side, so either reading is possible.</AstroNote>
              )}
              {chart.grahas.filter((g) => g.borderline).map((g) => (
                <AstroNote key={g.id}>
                  {GRAHA_NAME[g.id].en} is within 0.05° of the edge of a {BOUNDARY_WORD[g.borderline!]}: even an exact calculation cannot say which side, so either reading is possible.
                </AstroNote>
              ))}
            </div>

            <Card className="p-5">
              <h3 className="font-heading text-h4 text-white">Grahas</h3>
              {/* Focusable so keyboard users can scroll the table sideways on narrow screens. */}
              <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Graha positions">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <caption className="sr-only">Sidereal positions of the nine grahas</caption>
                <thead className="text-xs uppercase tracking-wide text-white/60">
                  <tr>
                    <th scope="col" className="py-1.5 font-medium">Graha</th><th scope="col" className="py-1.5 font-medium">Sign</th>
                    <th scope="col" className="py-1.5 font-medium">Degree</th><th scope="col" className="py-1.5 font-medium">Nakshatra</th>
                    {chart.lagna && <th scope="col" className="py-1.5 font-medium">House</th>}
                    <th scope="col" className="py-1.5 font-medium">Motion</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.grahas.map((g) => (
                    <tr key={g.id} className="border-t border-white/8 text-white/75">
                      <th scope="row" className="py-1.5 font-normal text-white">
                        <span style={{ color: GRAHA_META[g.id].color }} aria-hidden="true">{GRAHA_META[g.id].symbol}</span> {GRAHA_NAME[g.id].en}
                        <span className="text-white/60"> · {GRAHA_NAME[g.id].sa}</span>
                      </th>
                      <td className="py-1.5">{RASHIS[g.sign]}</td>
                      <td className="py-1.5 font-mono text-xs">{deg(g.degreeInSign)}</td>
                      <td className="py-1.5">{NAKSHATRAS[g.nakshatra]} {g.pada}</td>
                      {chart.lagna && <td className="py-1.5">{g.house}</td>}
                      <td className="py-1.5 text-xs">{g.id === 'rahu' || g.id === 'ketu' ? 'Mean node' : g.retrograde ? 'Retrograde (R)' : 'Direct'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Card>

            {chart.lagna && (
              <Card className="p-5">
                <h3 className="font-heading text-h4 text-white">Houses (whole sign)</h3>
                <ol className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  {chart.houses.map((sign, i) => (
                    <li key={i} className="rounded-lg border border-white/8 px-3 py-2 text-white/75">
                      <span className="text-white/60">{i + 1}.</span> {RASHIS[sign]}
                      <span className="block text-xs text-white/60">
                        {chart.grahas.filter((g) => g.sign === sign).map((g) => GRAHA_NAME[g.id].en).join(', ') || '—'}
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {dasha && <DashaTable periods={dasha.periods} zone={cast.place.zone} />}

            <MethodLine kind="chart" />
            <div className="flex justify-center">
              <SaveOnDeviceButton label="Save this chart" onSave={save} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
