import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useChakraPlayer, type SleepMinutes } from '@/hooks/useChakraPlayer';
import { PRESET_FREQUENCIES, type PresetId } from '@/lib/chakraPlayerEngine';
import { CHAKRAS } from '@/data/chakras';

interface PresetInfo { id: PresetId; name: string; sanskrit: string; bija: string; color: string; freq: number }

const SLEEP_PRESET: PresetInfo = {
  id: 'sleep', name: 'Sleep Mix', sanskrit: 'Nidrā', bija: '—', color: '#94A3B8', freq: PRESET_FREQUENCIES.sleep,
};

const PRESETS: PresetInfo[] = [
  ...CHAKRAS.map((c): PresetInfo => ({
    id: c.id as PresetId, name: c.name, sanskrit: c.sanskrit, bija: c.bija, color: c.color,
    freq: PRESET_FREQUENCIES[c.id as PresetId],
  })),
  SLEEP_PRESET,
];

function formatMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChakraFrequencyPlayerTool() {
  const player = useChakraPlayer();
  const reducedMotion = usePrefersReducedMotion();
  const activeInfo = useMemo(() => PRESETS.find((p) => p.id === player.activePreset) ?? null, [player.activePreset]);

  if (!player.supported) {
    return (
      <Card className="p-6 sm:p-8">
        <p className="text-sm text-white/70">
          Your browser doesn&apos;t support the Web Audio API needed for this player. Try a recent version of Chrome,
          Firefox, Edge or Safari.
        </p>
      </Card>
    );
  }

  const isSleepActive = player.activePreset === 'sleep';

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/65">
          Choose a chakra tone or the Sleep Mix below — each one is synthesised live in your browser at its classical
          Solfeggio frequency, not a recording. Layer in a binaural or isochronic beat, set a sleep timer, and drift off.
          Headphones are recommended, and required for the binaural effect.
        </p>
      </Card>

      <Card className="p-6 sm:p-8">
        {/* presets */}
        <div role="group" aria-label="Choose a tone" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESETS.map((p) => {
            const isActive = player.activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => player.play(p.id)}
                aria-pressed={isActive}
                aria-label={`${p.name} — ${p.sanskrit}, ${p.bija}, ${p.freq} hertz`}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition-colors hover:border-white/25"
                style={isActive ? { borderColor: p.color, background: `${p.color}14`, boxShadow: `0 0 24px ${p.color}33` } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
                  {isActive && player.isPlaying && (
                    reducedMotion ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-300" aria-hidden />
                    ) : (
                      <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                        className="h-1.5 w-1.5 rounded-full bg-gold-300" aria-hidden />
                    )
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-white">{p.name}</p>
                <p className="text-xs text-white/45">{p.sanskrit} · <span style={{ color: p.color }}>{p.bija}</span></p>
                <p className="mt-1 font-mono text-xs text-white/40">{p.freq} Hz</p>
              </button>
            );
          })}
        </div>

        {/* transport */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {!player.isPlaying ? (
            <Button size="lg" onClick={() => player.play(player.activePreset ?? 'root')}>
              <Play className="mr-2 h-4 w-4" /> Play
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={player.pause}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          <div className="flex min-w-[200px] flex-1 items-center gap-3 sm:max-w-xs">
            <Volume2 className="h-4 w-4 shrink-0 text-white/50" />
            <input type="range" min={0} max={100} value={Math.round(player.masterVolume * 100)}
              onChange={(e) => player.setMasterVolume(Number(e.target.value) / 100)}
              className="w-full accent-gold-400" aria-label="Master volume" />
          </div>
          <div className="text-xs text-white/45">
            {activeInfo ? (
              <>
                {activeInfo.name} · {activeInfo.freq} Hz
                {player.sleepTimerMinutes != null && player.remainingMs != null && (
                  <> · {formatMmSs(player.remainingMs)} remaining</>
                )}
              </>
            ) : 'Choose a tone above to begin'}
          </div>
        </div>

        <p className="mt-5 text-xs text-white/35">
          Site background music pauses automatically while a tone plays, and returns when you pause.
        </p>
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" className="h-4 w-4 accent-gold-400" checked={player.binauralOn}
                disabled={isSleepActive}
                onChange={(e) => player.setBinauralOn(e.target.checked)}
                aria-label="Enable binaural beat (requires headphones)" />
              Binaural beat
            </label>
            <p className="mt-1 text-xs text-white/40">
              {isSleepActive ? 'Not available on the Sleep Mix.' : 'Requires stereo headphones for the effect.'}
            </p>
            {player.binauralOn && !isSleepActive && (
              <div className="mt-3">
                <input type="range" min={1} max={12} step={0.5} value={player.beatHz}
                  onChange={(e) => player.setBeatHz(Number(e.target.value))}
                  className="w-full accent-gold-400" aria-label="Binaural beat rate in hertz" />
                <p className="mt-1 font-mono text-xs text-white/40">{player.beatHz} Hz beat</p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" className="h-4 w-4 accent-gold-400" checked={player.isochronicOn}
                onChange={(e) => player.setIsochronicOn(e.target.checked)}
                aria-label="Enable isochronic pulse" />
              Isochronic pulse
            </label>
            <p className="mt-1 text-xs text-white/40">Works with speakers or headphones.</p>
            {player.isochronicOn && (
              <div className="mt-3">
                <input type="range" min={1} max={12} step={0.5} value={player.pulseHz}
                  onChange={(e) => player.setPulseHz(Number(e.target.value))}
                  className="w-full accent-gold-400" aria-label="Isochronic pulse rate in hertz" />
                <p className="mt-1 font-mono text-xs text-white/40">{player.pulseHz} Hz pulse</p>
              </div>
            )}
          </div>

          <div>
            <Select
              label="Sleep timer"
              id="chakra-sleep-timer"
              value={player.sleepTimerMinutes ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                player.setSleepTimer(v === '' ? null : (Number(v) as SleepMinutes));
              }}
            >
              <option value="">Off</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </Select>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-white/35">
          Binaural beats can be intense for some listeners — keep the volume moderate and stop if you feel dizzy or uneasy;
          avoid using them while driving. On iPhone, check your silent switch is off. Locking your screen or backgrounding
          the browser may pause audio — keep this tab open and your screen awake for an uninterrupted session.
        </p>
      </Card>

      {player.recordingSupported && (
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Record a clip</p>
              <p className="mt-1 text-xs text-white/45">Capture up to 10 minutes of the current tone as a downloadable file.</p>
            </div>
            {!player.isRecording ? (
              <Button variant="outline" disabled={!player.isPlaying} onClick={player.startRecording}>
                <Download className="mr-2 h-4 w-4" /> Start recording
              </Button>
            ) : (
              <Button variant="outline" onClick={player.stopRecording}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Stop &amp; download
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
