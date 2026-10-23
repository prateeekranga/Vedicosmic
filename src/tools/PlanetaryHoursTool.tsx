import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { horas as horasFor, type Hora } from '@/engine/muhurta';
import { sunTimesAt } from '@/engine/panchang';
import { HORA_ACTIVITIES } from '@/data/planetaryActivities';
import { HORA_META } from '@/data/grahas';
import { formatClock, formatIsoDate } from '@/lib/format';
import { usePreferredPlace } from '@/hooks/usePreferredPlace';
import { PlaceSearch } from '@/components/astro/PlaceSearch';
import { MethodLine } from '@/components/astro/MethodLine';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PlanetaryHoursTool() {
  const [place, setPlace] = usePreferredPlace();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // The hora day runs sunrise to sunrise: before today's sunrise it is still yesterday's.
  const day = useMemo(() => sunTimesAt(now, place), [now, place]);
  const horas = useMemo(() => (day ? horasFor(day.sunrise, day.sunset, day.nextSunrise, day.vara) : []), [day]);
  const current = horas.find((h) => now >= h.start && now < h.end);
  const clock = (ms: number) => formatClock(ms, place.zone);

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          Each day is divided into 24 planetary hours (horas) — 12 between sunrise and sunset, 12 through the night —
          each ruled by one of the seven classical planets. Aligning an activity with its ruling hora is a timeless
          way to act in harmony with the day’s rhythm.
        </p>
        <PlaceSearch id="ph-place" label="Your location" value={place} onChange={setPlace} className="max-w-xl" />
        {day && (
          <p className="mt-3 text-xs text-white/60">
            Hora day of {formatIsoDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}: sunrise {clock(day.sunrise)},
            sunset {clock(day.sunset)}. Times are local to {place.label}.
          </p>
        )}
      </Card>

      {!day && (
        <Card className="p-6 text-sm text-white/60">The Sun does not rise and set at this place today, so there are no horas to show.</Card>
      )}

      {current && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden p-0">
            <div className="flex flex-col items-center gap-3 p-8 text-center"
              style={{ background: `linear-gradient(135deg, ${HORA_META[current.planet].color}22, transparent)` }}>
              <Badge tone="cyan"><Clock className="h-3 w-3" /> Current Hora</Badge>
              <motion.div className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-display"
                style={{ background: `${HORA_META[current.planet].color}22`, color: HORA_META[current.planet].color, border: `1px solid ${HORA_META[current.planet].color}55` }}
                animate={{ boxShadow: [`0 0 0px ${HORA_META[current.planet].color}00`, `0 0 28px ${HORA_META[current.planet].color}66`, `0 0 0px ${HORA_META[current.planet].color}00`] }}
                transition={{ duration: 3, repeat: Infinity }}>
                {current.planet[0]}
              </motion.div>
              <div>
                <div className="font-heading text-h3 text-white">{current.planet} · {HORA_META[current.planet].sa}</div>
                <div className="text-sm text-white/50">{clock(current.start)} – {clock(current.end)} · {current.night ? 'Night' : 'Day'} hora</div>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {(HORA_ACTIVITIES[current.planet] ?? []).map((a) => <Badge key={a} tone="gold">{a}</Badge>)}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {horas.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[false, true].map((night) => (
            <Card key={String(night)} className="p-5">
              <h3 className="eyebrow mb-3 block">{night ? 'Night horas' : 'Day horas'}</h3>
              <div className="space-y-1.5">
                {horas.filter((h) => h.night === night).map((h: Hora, i) => {
                  const isCurrent = current && h.index === current.index;
                  return (
                    <motion.div key={h.index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isCurrent ? 'bg-white/8 ring-1 ring-gold-soft/40' : 'hover:bg-white/3'}`}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: HORA_META[h.planet].color }} />
                      <span className="w-24 text-sm text-white/80">{h.planet}</span>
                      <span className="text-xs text-white/40">{HORA_META[h.planet].sa}</span>
                      <span className="ml-auto font-mono text-xs text-white/50">{clock(h.start)}</span>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
      <MethodLine kind="day" />
    </div>
  );
}
