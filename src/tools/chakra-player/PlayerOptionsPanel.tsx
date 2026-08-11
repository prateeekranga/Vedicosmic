import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Switch';
import { useChakraPlayer, type SleepMinutes } from '@/hooks/useChakraPlayer';

export function PlayerOptionsPanel() {
  const player = useChakraPlayer();
  const isSleepActive = player.activePreset === 'sleep';

  return (
    <Card className="p-6">
      <p className="eyebrow mb-4">Player Options</p>

      <div className="space-y-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Binaural beat</p>
              <p className="mt-0.5 text-xs text-white/40">
                {isSleepActive ? 'Not available on the Sleep Mix.' : 'Requires stereo headphones for the effect.'}
              </p>
            </div>
            <Switch checked={player.binauralOn} disabled={isSleepActive} onChange={player.setBinauralOn}
              label="Enable binaural beat (requires headphones)" />
          </div>
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Isochronic pulse</p>
              <p className="mt-0.5 text-xs text-white/40">Works with speakers or headphones.</p>
            </div>
            <Switch checked={player.isochronicOn} onChange={player.setIsochronicOn}
              label="Enable isochronic pulse" accent="cyan" />
          </div>
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
          <p className="mt-1.5 text-xs text-white/40">Audio fades out and stops automatically after the selected time.</p>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-white/35">
        Binaural beats can be intense for some listeners — keep the volume moderate and stop if you feel dizzy or uneasy;
        avoid using them while driving. On iPhone, check your silent switch is off. Locking your screen or backgrounding
        the browser may pause audio — keep this tab open and your screen awake for an uninterrupted session.
      </p>
    </Card>
  );
}
