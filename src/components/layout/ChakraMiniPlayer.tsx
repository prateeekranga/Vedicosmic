import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { getPreset, formatMmSs } from '@/data/chakraPresets';

const OWN_PAGE = '/tools/chakra-frequency-player';

/**
 * A Spotify-style docked bar — sitewide, mounted in Layout.tsx as a fixed sibling of
 * <Outlet/>, exactly like BackToTop. Visible once a preset has been played this session
 * (activePreset !== null), persists through pause, hidden again only on stop(). Hidden on
 * the tool's own page to avoid a redundant duplicate transport directly under the full player.
 */
export function ChakraMiniPlayer() {
  const player = useChakraPlayer();
  const { pathname } = useLocation();
  const onOwnPage = pathname === OWN_PAGE;
  const visible = player.activePreset !== null && !onOwnPage;
  const info = getPreset(player.activePreset);

  // Lets BackToTop / toast notifications shift up rather than sit underneath this bar.
  useEffect(() => {
    document.documentElement.style.setProperty('--vc-mini-player-h', visible ? '4.5rem' : '0px');
    return () => { document.documentElement.style.setProperty('--vc-mini-player-h', '0px'); };
  }, [visible]);

  const timeLabel = player.sleepTimerMinutes != null && player.remainingMs != null
    ? `${formatMmSs(player.remainingMs)} left`
    : player.elapsedMs != null ? `${formatMmSs(player.elapsedMs)} elapsed` : null;

  return (
    <AnimatePresence>
      {visible && info && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="glass fixed inset-x-0 bottom-0 z-50 border-t border-white/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6"
        >
          <div className="container-vc flex items-center gap-3 sm:gap-4">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: info.color }} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{info.name}</p>
              <p className="truncate font-mono text-xs text-white/45">
                {info.freq} Hz{timeLabel ? ` · ${timeLabel}` : ''}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              {player.masterVolume === 0 ? <VolumeX className="h-4 w-4 text-white/40" /> : <Volume2 className="h-4 w-4 text-white/40" />}
              <input type="range" min={0} max={100} value={Math.round(player.masterVolume * 100)}
                onChange={(e) => player.setMasterVolume(Number(e.target.value) / 100)}
                className="w-24 accent-gold-400" aria-label="Master volume" />
            </div>
            <Button variant="ghost" size="sm" aria-label={player.isPlaying ? 'Pause' : 'Resume'}
              onClick={() => (player.isPlaying ? player.pause() : player.play(player.activePreset!))}>
              {player.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Link to={OWN_PAGE} className="hidden text-xs text-white/45 hover:text-white sm:inline">
              Open player
            </Link>
            <Button variant="ghost" size="sm" aria-label="Stop and close" onClick={player.stop}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
