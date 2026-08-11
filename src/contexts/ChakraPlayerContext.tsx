import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import {
  createChakraPlayerEngine, DEFAULT_OPTIONS,
  type ChakraPlayerEngine, type PlayerOptions, type PresetId,
} from '@/lib/chakraPlayerEngine';
import { useSound } from '@/contexts/SoundContext';
import { trackEvent } from '@/lib/analytics';

export type SleepMinutes = 15 | 30 | 45 | 60 | null;

export interface UseChakraPlayerReturn {
  supported: boolean;
  isPlaying: boolean;
  activePreset: PresetId | null;
  masterVolume: number;
  binauralOn: boolean;
  beatHz: number;
  isochronicOn: boolean;
  pulseHz: number;
  sleepTimerMinutes: SleepMinutes;
  remainingMs: number | null;
  elapsedMs: number | null;
  play: (preset: PresetId) => void;
  pause: () => void;
  /** Full teardown — releases the AudioContext entirely. Hides the mini player bar. */
  stop: () => void;
  /** No-op unless currently playing. Used to keep the chakra player from colliding with
   *  the other self-managed-audio tools (SoundBath/Kundalini/Tratak/Puja) when the user
   *  navigates to one of their pages while this player is active elsewhere on the site. */
  pauseIfPlaying: () => void;
  setMasterVolume: (v: number) => void;
  setBinauralOn: (on: boolean) => void;
  setBeatHz: (hz: number) => void;
  setIsochronicOn: (on: boolean) => void;
  setPulseHz: (hz: number) => void;
  setSleepTimer: (m: SleepMinutes) => void;
  recordingSupported: boolean;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  /** For the real-time waveform visualizer. Returns null until the engine has a live AudioContext. */
  getAnalyserNode: () => AnalyserNode | null;
}

const ChakraPlayerCtx = createContext<UseChakraPlayerReturn | null>(null);

/**
 * Mounted once at the app root (see src/App.tsx) so the engine and its state survive
 * route navigation — the whole point of the sitewide persistent player. Holds the one
 * ChakraPlayerEngine instance for the entire SPA session; the empty-deps dispose effect
 * below therefore only actually runs on a full page reload, not on navigating between pages.
 */
export function ChakraPlayerProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<ChakraPlayerEngine | null>(null);
  if (!engineRef.current) engineRef.current = createChakraPlayerEngine();
  const { beginTratak, endTratak } = useSound();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetId | null>(null);
  const [masterVolume, setMasterVolumeState] = useState(0.7);
  const [binauralOn, setBinauralOnState] = useState(DEFAULT_OPTIONS.binauralOn);
  const [beatHz, setBeatHzState] = useState(DEFAULT_OPTIONS.beatHz);
  const [isochronicOn, setIsochronicOnState] = useState(DEFAULT_OPTIONS.isochronicOn);
  const [pulseHz, setPulseHzState] = useState(DEFAULT_OPTIONS.pulseHz);
  const [sleepTimerMinutes, setSleepTimerMinutesState] = useState<SleepMinutes>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordingHandleRef = useRef<{ stop: () => Promise<Blob> } | null>(null);

  const optsRef = useRef<PlayerOptions>(DEFAULT_OPTIONS);
  optsRef.current = { binauralOn, beatHz, isochronicOn, pulseHz };

  // Hard teardown only on the Provider's own unmount — in practice that means a full page
  // reload, never a route change, since this Provider is mounted once at the app root.
  useEffect(() => {
    const engine = engineRef.current!;
    engine.onSleepComplete = () => { setIsPlaying(false); endTratak(); };
    return () => { engine.dispose(); endTratak(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sleep countdown + elapsed-time display — recomputed from Date.now() every tick, never
  // accumulated, with an extra recompute on visibilitychange so both self-correct after backgrounding.
  useEffect(() => {
    if (!isPlaying) { setRemainingMs(null); setElapsedMs(null); return; }
    const tick = () => {
      setElapsedMs(engineRef.current!.elapsedMs);
      setRemainingMs(sleepTimerMinutes != null ? engineRef.current!.sleepRemainingMs : null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [isPlaying, sleepTimerMinutes]);

  const play = useCallback((preset: PresetId) => {
    const engine = engineRef.current!;
    if (!engine.isSupported) return;
    beginTratak(false); // duck the site's global ambient hum while a tone plays, from any page
    setIsPlaying(true);
    setActivePreset(preset);
    engine.play(preset, optsRef.current).catch(() => { setIsPlaying(false); endTratak(); });
    trackEvent('play', { preset });
  }, [beginTratak, endTratak]);

  const pause = useCallback(() => {
    engineRef.current!.pause();
    endTratak();
    setIsPlaying(false);
    trackEvent('pause', { preset: activePreset });
  }, [endTratak, activePreset]);

  const pauseIfPlaying = useCallback(() => { if (isPlaying) pause(); }, [isPlaying, pause]);

  const stop = useCallback(() => {
    engineRef.current!.stop();
    endTratak();
    setIsPlaying(false);
    setActivePreset(null);
    setRemainingMs(null);
    setElapsedMs(null);
    setSleepTimerMinutesState(null);
    setIsRecording(false);
    recordingHandleRef.current = null;
    trackEvent('stop', { preset: activePreset });
  }, [endTratak, activePreset]);

  const setMasterVolume = useCallback((v: number) => {
    setMasterVolumeState(v);
    engineRef.current!.setMasterVolume(v);
  }, []);

  const applyOptions = useCallback((next: Partial<PlayerOptions>) => {
    const merged = { ...optsRef.current, ...next };
    if (isPlaying) engineRef.current!.updateOptions(merged);
  }, [isPlaying]);

  const setBinauralOn = useCallback((on: boolean) => { setBinauralOnState(on); applyOptions({ binauralOn: on }); }, [applyOptions]);
  const setBeatHz = useCallback((hz: number) => { setBeatHzState(hz); applyOptions({ beatHz: hz }); }, [applyOptions]);
  const setIsochronicOn = useCallback((on: boolean) => { setIsochronicOnState(on); applyOptions({ isochronicOn: on }); }, [applyOptions]);
  const setPulseHz = useCallback((hz: number) => { setPulseHzState(hz); applyOptions({ pulseHz: hz }); }, [applyOptions]);

  const setSleepTimer = useCallback((m: SleepMinutes) => {
    setSleepTimerMinutesState(m);
    engineRef.current!.armSleepTimer(m);
    trackEvent('timer_set', { minutes: m });
  }, []);

  const startRecording = useCallback(() => {
    const handle = engineRef.current!.startRecording();
    if (!handle) return;
    recordingHandleRef.current = handle;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    const handle = recordingHandleRef.current;
    if (!handle) return;
    recordingHandleRef.current = null;
    setIsRecording(false);
    handle.stop().then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vedicosmic-${activePreset ?? 'chakra'}-${Date.now()}.webm`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      trackEvent('record_download', { preset: activePreset });
    });
  }, [activePreset]);

  const getAnalyserNode = useCallback(() => engineRef.current?.getAnalyser() ?? null, []);

  const value = useMemo<UseChakraPlayerReturn>(() => ({
    supported: engineRef.current!.isSupported,
    isPlaying, activePreset, masterVolume,
    binauralOn, beatHz, isochronicOn, pulseHz,
    sleepTimerMinutes, remainingMs, elapsedMs,
    play, pause, stop, pauseIfPlaying, setMasterVolume,
    setBinauralOn, setBeatHz, setIsochronicOn, setPulseHz, setSleepTimer,
    recordingSupported: typeof MediaRecorder !== 'undefined',
    isRecording, startRecording, stopRecording, getAnalyserNode,
  }), [
    isPlaying, activePreset, masterVolume, binauralOn, beatHz, isochronicOn, pulseHz,
    sleepTimerMinutes, remainingMs, elapsedMs, play, pause, stop, pauseIfPlaying, setMasterVolume,
    setBinauralOn, setBeatHz, setIsochronicOn, setPulseHz, setSleepTimer,
    isRecording, startRecording, stopRecording, getAnalyserNode,
  ]);

  return <ChakraPlayerCtx.Provider value={value}>{children}</ChakraPlayerCtx.Provider>;
}

export function useChakraPlayerContext(): UseChakraPlayerReturn {
  const ctx = useContext(ChakraPlayerCtx);
  if (!ctx) throw new Error('useChakraPlayer must be used inside ChakraPlayerProvider');
  return ctx;
}
