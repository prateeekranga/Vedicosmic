import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, Loader2, PlayCircle,
} from 'lucide-react';
import { loadYouTubeAPI, type YTPlayer } from '@/lib/youtube';
import { formatDuration } from '@/lib/format';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
  youtubeId?: string;
  title: string;
}

/** Custom-skinned video player — real YouTube playback underneath, fully custom controls on top. */
export function VideoPlayer({ youtubeId, title }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!youtubeId || !mountRef.current) return;
    let destroyed = false;
    loadYouTubeAPI().then((YT) => {
      if (destroyed || !mountRef.current) return;
      playerRef.current = new YT.Player(mountRef.current, {
        videoId: youtubeId,
        playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, iv_load_policy: 3, cc_load_policy: 0, fs: 0, playsinline: 1 },
        events: {
          onReady: (e) => {
            setPlayerReady(true);
            setDuration(e.target.getDuration());
            setVolume(e.target.getVolume());
          },
          onStateChange: (e) => {
            const S = YT.PlayerState;
            if (e.data === S.PLAYING) { setPlaying(true); setBuffering(false); }
            else if (e.data === S.PAUSED) setPlaying(false);
            else if (e.data === S.BUFFERING) setBuffering(true);
            else if (e.data === S.ENDED) setPlaying(false);
          },
        },
      });
    });
    return () => {
      destroyed = true;
      // YT's own DOM cleanup can race with React's reconciliation when this
      // effect's deps change — never let that throw and take the page down.
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      setPlayerReady(false);
      setPlaying(false);
      setBuffering(false);
      setCurrent(0);
      setDuration(0);
    };
  }, [youtubeId]);

  // poll current time / duration while playing (YT API has no timeupdate event)
  useEffect(() => {
    if (!playing || dragging) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      setCurrent(p.getCurrentTime());
      setDuration(p.getDuration());
    }, 250);
    return () => clearInterval(id);
  }, [playing, dragging]);

  // auto-hide controls during playback
  useEffect(() => {
    if (!playing) { setShowControls(true); return; }
    const reset = () => {
      setShowControls(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    };
    reset();
    return () => clearTimeout(hideTimer.current);
  }, [playing, current]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }, [playing]);

  const skip = (delta: number) => {
    const p = playerRef.current;
    if (!p) return;
    const t = Math.max(0, Math.min(duration, p.getCurrentTime() + delta));
    p.seekTo(t, true);
    setCurrent(t);
  };

  const seekToClientX = (clientX: number) => {
    const bar = barRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrent(pct * duration);
    return pct * duration;
  };

  const onBarPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    seekToClientX(e.clientX);
    const onMove = (ev: PointerEvent) => seekToClientX(ev.clientX);
    const onUp = (ev: PointerEvent) => {
      const t = seekToClientX(ev.clientX);
      if (t != null) playerRef.current?.seekTo(t, true);
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted || volume === 0) { p.unMute(); p.setVolume(volume || 50); setVolume(p.getVolume()); setMuted(false); }
    else { p.mute(); setMuted(true); }
  };
  const changeVolume = (v: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(v); p.unMute();
    setVolume(v); setMuted(v === 0);
  };
  const changeRate = (r: number) => {
    playerRef.current?.setPlaybackRate(r);
    setRate(r);
    setShowSpeedMenu(false);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'ArrowLeft') skip(-5);
    else if (e.code === 'ArrowRight') skip(5);
    else if (e.code === 'KeyF') toggleFullscreen();
    else if (e.code === 'KeyM') toggleMute();
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={() => { if (playing) { setShowControls(true); clearTimeout(hideTimer.current); hideTimer.current = setTimeout(() => setShowControls(false), 2500); } }}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black outline-none"
    >
      {/* always mounted at the same tree position, regardless of youtubeId — the
          placeholder/player below are conditional overlays, not alternate return
          branches, so React never tears this div down while YT's own cleanup is racing it */}
      <div ref={mountRef} className="pointer-events-none absolute inset-0" />

      {!youtubeId && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-cosmic-light/40 to-cosmic-dark text-center">
          <PlayCircle className="h-12 w-12 text-white/20" />
          <p className="text-sm font-medium text-white/60">Video coming soon</p>
          <p className="max-w-xs px-6 text-xs text-white/35">{title}</p>
        </div>
      )}

      {youtubeId && !playerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="h-8 w-8 animate-spin text-gold-soft" />
        </div>
      )}

      {youtubeId && <button className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} />}

      {youtubeId && buffering && playerReady && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      )}

      <AnimatePresence>
        {youtubeId && !playing && !buffering && playerReady && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePlay} aria-label="Play"
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-bright/90 text-cosmic-darker shadow-glow-gold">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {youtubeId && showControls && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-3 pt-8"
          >
            <div
              ref={barRef}
              onPointerDown={onBarPointerDown}
              className="group/bar relative -mx-1 flex h-4 cursor-pointer items-center px-1"
            >
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-gold-bright" style={{ width: `${pct}%` }} />
              </div>
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-gold-bright opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
                style={{ left: `${pct}%` }}
              />
            </div>

            <div className="mt-2 flex items-center gap-1 text-white">
              <button onClick={togglePlay} className="rounded-lg p-1.5 hover:bg-white/10" aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button onClick={() => skip(-10)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Back 10 seconds"><RotateCcw className="h-4 w-4" /></button>
              <button onClick={() => skip(10)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Forward 10 seconds"><RotateCw className="h-4 w-4" /></button>
              <span className="ml-1 text-xs tabular-nums text-white/70">{formatDuration(current)} / {formatDuration(duration)}</span>

              <div className="ml-auto flex items-center gap-1">
                <button onClick={toggleMute} className="rounded-lg p-1.5 hover:bg-white/10" aria-label={muted ? 'Unmute' : 'Mute'}>
                  {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range" min={0} max={100} value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="h-1 w-16 cursor-pointer accent-gold-bright"
                  aria-label="Volume"
                />
                <div className="relative">
                  <button onClick={() => setShowSpeedMenu((s) => !s)} className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-white/10">{rate}×</button>
                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        className="absolute bottom-9 right-0 min-w-[64px] rounded-xl border border-white/10 bg-cosmic-dark/95 p-1 backdrop-blur-md"
                      >
                        {SPEEDS.map((s) => (
                          <button key={s} onClick={() => changeRate(s)}
                            className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs ${s === rate ? 'bg-gold-bright/15 text-gold-pale' : 'text-white/70 hover:bg-white/10'}`}>
                            {s}×
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={toggleFullscreen} className="rounded-lg p-1.5 hover:bg-white/10" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
