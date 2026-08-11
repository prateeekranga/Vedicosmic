import { useCallback, useEffect, useRef, useState } from 'react';
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
  play: (preset: PresetId) => void;
  pause: () => void;
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
}

/** Thin React binding over ChakraPlayerEngine — owns UI state, delegates all audio work to the engine. */
export function useChakraPlayer(): UseChakraPlayerReturn {
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
  const [isRecording, setIsRecording] = useState(false);
  const recordingHandleRef = useRef<{ stop: () => Promise<Blob> } | null>(null);

  const optsRef = useRef<PlayerOptions>(DEFAULT_OPTIONS);
  optsRef.current = { binauralOn, beatHz, isochronicOn, pulseHz };

  // Hard teardown on real unmount only (empty deps) — never on preset/option changes,
  // which would otherwise tear down and rebuild the whole AudioContext on every click.
  useEffect(() => {
    const engine = engineRef.current!;
    engine.onSleepComplete = () => { setIsPlaying(false); endTratak(); };
    return () => { engine.dispose(); endTratak(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sleep countdown display — recomputed from Date.now() every tick, never accumulated,
  // with an extra recompute on visibilitychange so it self-corrects after backgrounding.
  useEffect(() => {
    if (!isPlaying || sleepTimerMinutes == null) { setRemainingMs(null); return; }
    const tick = () => setRemainingMs(engineRef.current!.sleepRemainingMs);
    tick();
    const id = window.setInterval(tick, 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [isPlaying, sleepTimerMinutes]);

  const play = useCallback((preset: PresetId) => {
    const engine = engineRef.current!;
    if (!engine.isSupported) return;
    beginTratak(false); // duck the site's global ambient hum while this tool's tones play
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

  return {
    supported: engineRef.current.isSupported,
    isPlaying, activePreset, masterVolume,
    binauralOn, beatHz, isochronicOn, pulseHz,
    sleepTimerMinutes, remainingMs,
    play, pause, setMasterVolume,
    setBinauralOn, setBeatHz, setIsochronicOn, setPulseHz, setSleepTimer,
    recordingSupported: typeof MediaRecorder !== 'undefined',
    isRecording, startRecording, stopRecording,
  };
}
