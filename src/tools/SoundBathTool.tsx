import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSound } from '@/contexts/SoundContext';

/* ─────────────────────────── layers ─────────────────────────── */

const LAYERS = [
  { id: 'tanpura', name: 'Tanpura', icon: '🪕', desc: 'The eternal Sa–Pa drone' },
  { id: 'bowls', name: 'Tibetan Bowls', icon: '🥣', desc: 'Deep singing bowls, struck slow' },
  { id: 'om', name: 'Om Chorus', icon: '🕉️', desc: 'A low choir of endless ॐ' },
  { id: 'rain', name: 'Rain', icon: '🌧️', desc: 'Soft monsoon on temple stone' },
  { id: 'chimes', name: 'Wind Chimes', icon: '🎐', desc: 'Sparse silver notes on the breeze' },
  { id: 'bass', name: 'Earth Hum', icon: '🌍', desc: 'A sub-deep grounding pulse' },
] as const;
type LayerId = (typeof LAYERS)[number]['id'];
type Vols = Record<LayerId, number>;

const PRESETS: { id: string; name: string; vols: Vols }[] = [
  { id: 'temple', name: 'Temple Rain', vols: { tanpura: 0.7, bowls: 0.45, om: 0.25, rain: 0.6, chimes: 0.2, bass: 0.25 } },
  { id: 'space', name: 'Deep Space', vols: { tanpura: 0, bowls: 0.3, om: 0.65, rain: 0, chimes: 0.12, bass: 0.7 } },
  { id: 'dawn', name: 'Morning Sadhana', vols: { tanpura: 0.55, bowls: 0.2, om: 0.15, rain: 0.15, chimes: 0.5, bass: 0.1 } },
];

interface LayerNode { gain: GainNode; timers: number[]; oscs: (OscillatorNode | AudioBufferSourceNode)[] }
interface Eng { ctx: AudioContext; master: GainNode; layers: Record<LayerId, LayerNode> }

function buildEngine(vols: Vols, masterVol: number): Eng | null {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(masterVol, ctx.currentTime + 2.5);

    const mk = (v: number): LayerNode => {
      const g = ctx.createGain(); g.gain.value = v; g.connect(master);
      return { gain: g, timers: [], oscs: [] };
    };
    const layers = {
      tanpura: mk(vols.tanpura), bowls: mk(vols.bowls), om: mk(vols.om),
      rain: mk(vols.rain), chimes: mk(vols.chimes), bass: mk(vols.bass),
    } as Record<LayerId, LayerNode>;

    /* tanpura — endless Sa Pa Sa' Sa pluck cycle with jawari-like shimmer */
    {
      const L = layers.tanpura;
      const notes = [130.81, 196.0, 261.63, 130.81];
      let step = 0;
      const pluck = () => {
        const f = notes[step++ % notes.length];
        const t = ctx.currentTime;
        [0, 4].forEach((det) => {
          const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t);
          lp.frequency.exponentialRampToValueAtTime(500, t + 2.4);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(det ? 0.028 : 0.05, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
          o.connect(lp); lp.connect(g); g.connect(L.gain); o.start(t); o.stop(t + 2.8);
        });
      };
      L.timers.push(window.setInterval(pluck, 950));
      pluck();
    }

    /* bowls — long beating strikes */
    {
      const L = layers.bowls;
      const hit = () => {
        const t = ctx.currentTime;
        const f = [98, 130.81, 147][Math.floor(Math.random() * 3)];
        [f, f * 1.003, f * 2.71].forEach((ff, i) => {
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = ff;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(i === 2 ? 0.02 : 0.09, t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 9);
          o.connect(g); g.connect(L.gain); o.start(t); o.stop(t + 9.5);
        });
      };
      const loop = () => { hit(); L.timers.push(window.setTimeout(loop, 6500 + Math.random() * 6500) as unknown as number); };
      loop();
    }

    /* om chorus — detuned low pad with slow swell */
    {
      const L = layers.om;
      [110, 110.6, 164.81, 165.6, 82.41].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = i > 3 ? 0.05 : 0.045;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.05;
        const lg = ctx.createGain(); lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(L.gain); o.start(); lfo.start(); L.oscs.push(o, lfo);
      });
    }

    /* rain — looped filtered noise with flutter */
    {
      const L = layers.rain;
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      const g = ctx.createGain(); g.gain.value = 0.16;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11;
      const lg = ctx.createGain(); lg.gain.value = 0.045; lfo.connect(lg); lg.connect(g.gain);
      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(L.gain);
      src.start(); lfo.start(); L.oscs.push(src, lfo);
    }

    /* chimes — sparse pentatonic silver */
    {
      const L = layers.chimes;
      const notes = [1046.5, 1174.66, 1318.5, 1568, 1760];
      const ring = () => {
        const t = ctx.currentTime;
        const f = notes[Math.floor(Math.random() * notes.length)];
        [1, 2.7].forEach((r, i) => {
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * r;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(i ? 0.008 : 0.03, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
          o.connect(g); g.connect(L.gain); o.start(t); o.stop(t + 4.2);
        });
      };
      const loop = () => { ring(); L.timers.push(window.setTimeout(loop, 2600 + Math.random() * 5200) as unknown as number); };
      loop();
    }

    /* earth hum — sub beat */
    {
      const L = layers.bass;
      [55, 55.7].forEach((f) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = 0.14; o.connect(g); g.connect(L.gain); o.start(); L.oscs.push(o);
      });
    }

    return { ctx, master, layers };
  } catch { return null; }
}

function stopEngine(e: Eng | null) {
  if (!e) return;
  try {
    e.master.gain.linearRampToValueAtTime(0, e.ctx.currentTime + 1.2);
    window.setTimeout(() => {
      Object.values(e.layers).forEach((l) => {
        l.timers.forEach((t) => { window.clearInterval(t); window.clearTimeout(t); });
        l.oscs.forEach((o) => { try { o.stop(); } catch { /* */ } });
      });
      void e.ctx.close();
    }, 1400);
  } catch { /* */ }
}

/* ─────────────────────────────  tool  ───────────────────────────── */

export default function SoundBathTool() {
  const [vols, setVols] = useState<Vols>(PRESETS[0].vols);
  const [masterVol, setMasterVol] = useState(0.7);
  const [playing, setPlaying] = useState(false);
  const engRef = useRef<Eng | null>(null);
  const { beginTratak, endTratak } = useSound();

  const start = () => {
    beginTratak(false);                       // duck site music
    engRef.current = buildEngine(vols, masterVol);
    setPlaying(true);
  };
  const stop = () => {
    stopEngine(engRef.current); engRef.current = null;
    endTratak(); setPlaying(false);
  };
  useEffect(() => () => { stopEngine(engRef.current); endTratak(); }, [endTratak]);

  const setLayer = (id: LayerId, v: number) => {
    setVols((prev) => ({ ...prev, [id]: v }));
    const e = engRef.current;
    if (e) e.layers[id].gain.gain.linearRampToValueAtTime(v, e.ctx.currentTime + 0.15);
  };
  const setMaster = (v: number) => {
    setMasterVol(v);
    const e = engRef.current;
    if (e) e.master.gain.linearRampToValueAtTime(v, e.ctx.currentTime + 0.15);
  };
  const applyPreset = (p: Vols) => {
    setVols(p);
    const e = engRef.current;
    if (e) (Object.keys(p) as LayerId[]).forEach((k) => e.layers[k].gain.gain.linearRampToValueAtTime(p[k], e.ctx.currentTime + 0.6));
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/65">
          Compose your own living soundscape. Six sacred layers — tanpura, bowls, Om, rain, chimes and a deep earth hum —
          each on its own slider, mixed live while you listen. Headphones recommended; every sound is generated fresh,
          nothing is a recording.
        </p>
      </Card>

      <Card className="p-6 sm:p-8">
        {/* transport */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {!playing ? (
            <Button size="lg" onClick={start}><Play className="mr-2 h-4 w-4" /> Begin sound bath</Button>
          ) : (
            <Button size="lg" variant="outline" onClick={stop}><Square className="mr-2 h-4 w-4" /> Stop</Button>
          )}
          <div className="flex min-w-[200px] flex-1 items-center gap-3 sm:max-w-xs">
            <Volume2 className="h-4 w-4 shrink-0 text-white/50" />
            <input type="range" min={0} max={100} value={Math.round(masterVol * 100)}
              onChange={(e) => setMaster(Number(e.target.value) / 100)}
              className="w-full accent-gold-400" aria-label="Master volume" />
          </div>
          {playing && (
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.4, repeat: Infinity }}
              className="text-xs text-gold-300">● live</motion.span>
          )}
        </div>

        {/* presets */}
        <div className="mb-6 flex flex-wrap gap-2.5">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p.vols)}
              className="rounded-full border border-white/12 px-4 py-1.5 text-sm text-white/60 transition-all hover:border-gold-400/50 hover:text-gold-300">
              {p.name}
            </button>
          ))}
        </div>

        {/* layer sliders */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map((l) => {
            const v = vols[l.id];
            return (
              <div key={l.id} className={`rounded-2xl border p-4 transition-colors ${v > 0 && playing ? 'border-gold-400/25 bg-gold-400/[0.03]' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-medium text-white">
                    <span className="text-lg">{l.icon}</span> {l.name}
                  </p>
                  <span className="font-mono text-xs text-white/40">{Math.round(v * 100)}</span>
                </div>
                <p className="mt-0.5 text-xs text-white/45">{l.desc}</p>
                <input type="range" min={0} max={100} value={Math.round(v * 100)}
                  onChange={(e) => setLayer(l.id, Number(e.target.value) / 100)}
                  className="mt-3 w-full accent-gold-400" aria-label={`${l.name} volume`} />
                {/* level glow bar */}
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div className="h-full rounded-full"
                    animate={{ width: `${v * 100}%`, opacity: playing && v > 0 ? [0.5, 1, 0.5] : 0.5 }}
                    transition={{ opacity: { duration: 2 + Math.random(), repeat: Infinity } }}
                    style={{ background: 'linear-gradient(90deg,#39B7F0,#FFD700)' }} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-xs text-white/35">
          Site background music pauses automatically while the bath plays, and returns when you stop.
        </p>
      </Card>
    </div>
  );
}
