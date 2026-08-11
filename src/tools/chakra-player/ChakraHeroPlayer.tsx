import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { PRESETS, getPreset, formatMmSs } from '@/data/chakraPresets';
import { ChakraFigureArt } from './ChakraFigureArt';
import { WaveformVisualizer } from './WaveformVisualizer';

export function ChakraHeroPlayer() {
  const player = useChakraPlayer();
  const reducedMotion = usePrefersReducedMotion();
  const active = getPreset(player.activePreset) ?? PRESETS[0];
  const idx = PRESETS.findIndex((p) => p.id === active.id);

  const goTo = (i: number) => player.play(PRESETS[(i + PRESETS.length) % PRESETS.length].id);
  const goNext = () => goTo(idx + 1);
  const goPrev = () => goTo(idx - 1);
  const goShuffle = () => {
    if (PRESETS.length <= 1) return;
    let next = idx;
    while (next === idx) next = Math.floor(Math.random() * PRESETS.length);
    goTo(next);
  };

  // Honest progress, not a fake seekable duration: a determinate bar toward the sleep-timer
  // deadline if one's set, else a plain elapsed readout with no bar at all (an indeterminate
  // bar would read as "buffering" — the wrong metaphor for a tone with no fixed end).
  const hasTimer = player.sleepTimerMinutes != null && player.remainingMs != null;
  const totalMs = hasTimer ? player.sleepTimerMinutes! * 60000 : 0;
  const progressPct = hasTimer ? Math.min(100, Math.round(((totalMs - player.remainingMs!) / totalMs) * 100)) : 0;

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <ChakraFigureArt />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-semibold"
            style={{ background: `${active.color}1A`, borderColor: `${active.color}44`, color: active.color }}>
            {active.bija === '—' ? '☾' : active.bija}
          </span>
          {player.isPlaying && (
            <Badge tone="cyan">
              {reducedMotion ? (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              ) : (
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
              Live
            </Badge>
          )}
        </div>

        <div className="mt-6">
          <h2 className="font-display text-h2 text-white">{active.name}</h2>
          <p className="mt-1 font-mono text-3xl font-semibold" style={{ color: active.color }}>{active.freq} Hz</p>
          <p className="mt-1 text-sm text-white/50">{active.sanskrit}</p>
          <p className="mt-3 max-w-md text-sm italic leading-relaxed text-white/60">&ldquo;{active.affirmation}&rdquo;</p>
          <div className="mt-3 flex gap-2">
            {active.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/60">{t}</span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <WaveformVisualizer color={active.color} />
        </div>

        <div className="mt-3">
          {hasTimer ? (
            <div>
              <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}
                aria-valuetext={`${formatMmSs(player.remainingMs!)} until sleep`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-[width]" style={{ width: `${progressPct}%`, background: active.color }} />
              </div>
              <p className="mt-1.5 font-mono text-xs text-white/40">{formatMmSs(player.remainingMs!)} until sleep</p>
            </div>
          ) : player.elapsedMs != null ? (
            <p className="font-mono text-xs text-white/40">{formatMmSs(player.elapsedMs)} elapsed</p>
          ) : (
            <p className="text-xs text-white/35">Choose a tone above to begin</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={goShuffle} aria-label="Play a random tone" className="text-white/50 transition-colors hover:text-white">
            <Shuffle className="h-4 w-4" />
          </button>
          <button type="button" onClick={goPrev} aria-label="Previous tone" className="text-white/50 transition-colors hover:text-white">
            <SkipBack className="h-5 w-5" />
          </button>
          <Button
            size="lg"
            className="h-16 w-16 !px-0 !py-0"
            aria-label={player.isPlaying ? 'Pause' : 'Play'}
            onClick={() => (player.isPlaying ? player.pause() : player.play(active.id))}
          >
            {player.isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <button type="button" onClick={goNext} aria-label="Next tone" className="text-white/50 transition-colors hover:text-white">
            <SkipForward className="h-5 w-5" />
          </button>

          <div className="ml-auto flex min-w-[160px] items-center gap-2 sm:max-w-[200px]">
            {player.masterVolume === 0
              ? <VolumeX className="h-4 w-4 shrink-0 text-white/50" />
              : <Volume2 className="h-4 w-4 shrink-0 text-white/50" />}
            <input type="range" min={0} max={100} value={Math.round(player.masterVolume * 100)}
              onChange={(e) => player.setMasterVolume(Number(e.target.value) / 100)}
              className="w-full accent-gold-400" aria-label="Master volume" />
            <span className="w-9 shrink-0 font-mono text-xs text-white/40">{Math.round(player.masterVolume * 100)}%</span>
          </div>
        </div>

        <p className="mt-5 text-xs text-white/35">
          Site background music pauses automatically while a tone plays, and returns when you pause.
        </p>
      </div>
    </Card>
  );
}
