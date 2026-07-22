import { DateSelect } from '@/components/ui/DateSelect';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Telescope, Sparkles } from 'lucide-react';
import {
  CITIES, siderealSunLongitude, siderealMoonLongitude, longitudeToRashi, ascendantRashi,
} from '@/lib/astronomy';
import { RASHI_INFO, SIDEREAL_NOTE } from '@/data/zodiac';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Field';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface Chart { sun: number; moon: number; asc: number; }

const POINTS = [
  { key: 'sun', label: 'Sun', sanskrit: 'Surya', sym: '☉', color: '#FFB300', blurb: 'Your soul, vitality, and essential self.' },
  { key: 'moon', label: 'Moon', sanskrit: 'Chandra', sym: '☾', color: '#CBD5E1', blurb: 'Your mind, emotions, and inner world — the most important point in Vedic astrology.' },
  { key: 'asc', label: 'Ascendant', sanskrit: 'Lagna', sym: '↑', color: '#39B7F0', blurb: 'Your rising sign — how you meet the world and your physical self.' },
] as const;

function Wheel({ chart }: { chart: Chart }) {
  const size = 320; const c = size / 2; const rOuter = 150; const rInner = 96;
  const placements: Record<number, { sym: string; color: string }[]> = {};
  POINTS.forEach((p) => {
    const sign = longitudeToRashi(chart[p.key]);
    (placements[sign] ||= []).push({ sym: p.sym, color: p.color });
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[340px]">
      <circle cx={c} cy={c} r={rOuter} fill="none" stroke="rgba(230,184,74,0.25)" strokeWidth="1" />
      <circle cx={c} cy={c} r={rInner} fill="none" stroke="rgba(57,183,240,0.2)" strokeWidth="1" />
      {RASHI_INFO.map((r, i) => {
        const a0 = (i * 30 - 90) * (Math.PI / 180);
        const a1 = ((i + 1) * 30 - 90) * (Math.PI / 180);
        const mid = (a0 + a1) / 2;
        const x0 = c + rInner * Math.cos(a0), y0 = c + rInner * Math.sin(a0);
        const x1 = c + rOuter * Math.cos(a0), y1 = c + rOuter * Math.sin(a0);
        const lx = c + (rInner + rOuter) / 2 * Math.cos(mid);
        const ly = c + (rInner + rOuter) / 2 * Math.sin(mid);
        const here = placements[i];
        return (
          <g key={i}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <motion.text x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              fontSize="15" fill={here ? r.color : 'rgba(255,255,255,0.35)'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              {r.symbol}
            </motion.text>
            {here && here.map((pt, j) => {
              const pr = rInner - 22 - j * 18;
              const px = c + pr * Math.cos(mid), py = c + pr * Math.sin(mid);
              return (
                <motion.text key={j} x={px} y={py} textAnchor="middle" dominantBaseline="central"
                  fontSize="16" fill={pt.color}
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + j * 0.1, type: 'spring' }}>{pt.sym}</motion.text>
              );
            })}
          </g>
        );
      })}
      <motion.circle cx={c} cy={c} r="4" fill="#FFD700"
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
    </svg>
  );
}

export default function AstrologyTool() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [cityIdx, setCityIdx] = useState(0);
  const [chart, setChart] = useState<Chart | null>(null);
  const { user, saveReading } = useAuth();
  const { notify } = useToast();

  const calculate = () => {
    if (!date) return;
    const city = CITIES[cityIdx];
    const dt = new Date(`${date}T${time}:00`);
    const utc = new Date(dt.getTime() - city.tz * 3600000);
    setChart({
      sun: siderealSunLongitude(utc),
      moon: siderealMoonLongitude(utc),
      asc: ascendantRashi(utc, city.lat, city.lng, city.tz),
    });
  };

  const save = () => {
    if (!chart) return;
    const moon = RASHI_INFO[longitudeToRashi(chart.moon)];
    saveReading({ toolId: 'astrology', toolName: 'Vedic Birth Chart',
      summary: `Moon in ${moon.sanskrit} (${moon.english}) · Sun in ${RASHI_INFO[longitudeToRashi(chart.sun)].english}` });
    notify('Chart saved to your journal');
  };

  return (
    <div className="space-y-10">
      <Card className="p-6 sm:p-8">
        <p className="mb-6 text-sm leading-relaxed text-white/60">{SIDEREAL_NOTE}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <DateSelect value={date} onChange={setDate} />
          <Input id="ast-time" label="Time of birth" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Select id="ast-city" label="Place of birth" value={cityIdx} onChange={(e) => setCityIdx(Number(e.target.value))}>
            {CITIES.map((ci, i) => <option key={ci.name} value={i}>{ci.name}, {ci.country}</option>)}
          </Select>
        </div>
        <Button className="mt-6" onClick={calculate} disabled={!date}>
          <Telescope className="h-4 w-4" /> Cast my chart
        </Button>
        <p className="mt-3 text-xs text-white/40">
          Educational approximation (±1 day). For precise charts, a professional ephemeris is recommended.
        </p>
      </Card>

      <AnimatePresence mode="wait">
        {chart && (
          <motion.div key="chart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6">
              <span className="eyebrow mb-2 block text-center">Rashi Chakra</span>
              <Wheel chart={chart} />
            </Card>
            <div className="space-y-4">
              {POINTS.map((p, i) => {
                const sign = RASHI_INFO[longitudeToRashi(chart[p.key])];
                return (
                  <motion.div key={p.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}>
                    <Card className="p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                          style={{ background: `${p.color}22`, color: p.color }}>{p.sym}</span>
                        <div>
                          <div className="text-sm text-white/50">{p.label} · {p.sanskrit}</div>
                          <div className="font-heading text-lg text-white">{sign.sanskrit} <span className="text-white/50">({sign.english})</span></div>
                        </div>
                        <span className="ml-auto text-2xl" style={{ color: sign.color }}>{sign.symbol}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="violet">{sign.element}</Badge>
                        <Badge tone="teal">{sign.quality}</Badge>
                        <Badge>{sign.ruler}</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">{sign.traits}</p>
                      <p className="mt-2 text-xs text-white/40">{p.blurb}</p>
                    </Card>
                  </motion.div>
                );
              })}
              <div className="flex justify-center pt-2">
                {user ? (
                  <Button variant="outline" onClick={save}>Save this chart</Button>
                ) : (
                  <button onClick={() => window.dispatchEvent(new CustomEvent('vc:open-auth'))}
                    className="text-sm text-brand-cyan-soft hover:text-brand-cyan">Sign in to save this chart →</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
