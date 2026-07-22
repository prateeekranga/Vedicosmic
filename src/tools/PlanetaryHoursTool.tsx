import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import {
  CITIES, planetaryHours, PLANET_SANSKRIT, PLANET_COLOR, type Hora,
} from '@/lib/astronomy';
import { HORA_ACTIVITIES } from '@/data/planetaryActivities';
import { formatTime } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';

export default function PlanetaryHoursTool() {
  const [cityIdx, setCityIdx] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const city = CITIES[cityIdx];
  const horas = useMemo(() => planetaryHours(new Date(), city.lat, city.lng, city.tz), [city]);
  const current = horas.find((h) => now >= h.start && now < h.end) ?? horas[0];

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          Each day is divided into 24 planetary hours (horas) — 12 between sunrise and sunset, 12 through the night —
          each ruled by one of the seven classical planets. Aligning an activity with its ruling hora is a timeless
          way to act in harmony with the day’s rhythm.
        </p>
        <Select id="ph-city" label="Your location" value={cityIdx} onChange={(e) => setCityIdx(Number(e.target.value))} className="max-w-xs">
          {CITIES.map((c, i) => <option key={c.name} value={i}>{c.name}, {c.country}</option>)}
        </Select>
      </Card>

      {current && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden p-0">
            <div className="flex flex-col items-center gap-3 p-8 text-center"
              style={{ background: `linear-gradient(135deg, ${PLANET_COLOR[current.planet]}22, transparent)` }}>
              <Badge tone="cyan"><Clock className="h-3 w-3" /> Current Hora</Badge>
              <motion.div className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-display"
                style={{ background: `${PLANET_COLOR[current.planet]}22`, color: PLANET_COLOR[current.planet], border: `1px solid ${PLANET_COLOR[current.planet]}55` }}
                animate={{ boxShadow: [`0 0 0px ${PLANET_COLOR[current.planet]}00`, `0 0 28px ${PLANET_COLOR[current.planet]}66`, `0 0 0px ${PLANET_COLOR[current.planet]}00`] }}
                transition={{ duration: 3, repeat: Infinity }}>
                {current.planet[0]}
              </motion.div>
              <div>
                <div className="font-heading text-h3 text-white">{current.planet} · {PLANET_SANSKRIT[current.planet]}</div>
                <div className="text-sm text-white/50">{formatTime(current.start)} – {formatTime(current.end)} · {current.isNight ? 'Night' : 'Day'} hora</div>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {(HORA_ACTIVITIES[current.planet] ?? []).map((a) => <Badge key={a} tone="gold">{a}</Badge>)}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {[false, true].map((night) => (
          <Card key={String(night)} className="p-5">
            <span className="eyebrow mb-3 block">{night ? 'Night horas' : 'Day horas'}</span>
            <div className="space-y-1.5">
              {horas.filter((h) => h.isNight === night).map((h: Hora, i) => {
                const isCurrent = current && h.index === current.index;
                return (
                  <motion.div key={h.index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isCurrent ? 'bg-white/8 ring-1 ring-gold-soft/40' : 'hover:bg-white/3'}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PLANET_COLOR[h.planet] }} />
                    <span className="w-24 text-sm text-white/80">{h.planet}</span>
                    <span className="text-xs text-white/40">{PLANET_SANSKRIT[h.planet]}</span>
                    <span className="ml-auto font-mono text-xs text-white/50">{formatTime(h.start)}</span>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
