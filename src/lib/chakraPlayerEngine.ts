/**
 * Chakra Frequency & Sleep Meditation Player — a self-contained Web Audio engine.
 *
 * Every tone is synthesised live (Solfeggio sine tones for the seven chakras,
 * plus a soft multi-oscillator pad for the Sleep Mix) — no audio files, no
 * licensing, no hosting. Mirrors this codebase's existing generative-audio
 * idiom (see src/lib/ambient.ts, src/tools/SoundBathTool.tsx) rather than the
 * report's original real-recording plan. A `fileUrl`-based preset could be
 * added later (matching src/config/audio.ts's generative/file pattern)
 * without touching the node-graph/crossfade machinery below.
 *
 * One instance = one exclusive playback session (not a shared singleton like
 * ambient.ts's site-wide background music).
 */

export type PresetId = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown' | 'sleep';

export const PRESET_FREQUENCIES: Record<PresetId, number> = {
  root: 396, sacral: 417, solar: 528, heart: 639, throat: 741,
  'third-eye': 852, crown: 963, sleep: 174,
};

export interface PlayerOptions {
  binauralOn: boolean;
  beatHz: number;
  isochronicOn: boolean;
  pulseHz: number;
}

export const DEFAULT_OPTIONS: PlayerOptions = {
  binauralOn: false, beatHz: 6, isochronicOn: false, pulseHz: 5,
};

const PRESET_XFADE_SEC = 1.8;
const OPTION_XFADE_SEC = 0.7;
const PLAY_FADE_SEC = 0.6;
const PAUSE_FADE_SEC = 0.5;
const SLEEP_FADEOUT_SEC = 6;
const ISOCHRONIC_DEPTH = 0.8;

interface VoiceNodes {
  sources: OscillatorNode[];
  extras: AudioNode[];
  voiceOut: GainNode;
}

function ramp(param: AudioParam, to: number, dur: number, ctx: AudioContext) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime((param as AudioParam & { value: number }).value, now);
  if (dur <= 0) param.setValueAtTime(to, now);
  else param.linearRampToValueAtTime(to, now + dur);
}

function optsEqual(a: PlayerOptions, b: PlayerOptions): boolean {
  return a.binauralOn === b.binauralOn && a.beatHz === b.beatHz
    && a.isochronicOn === b.isochronicOn && a.pulseHz === b.pulseHz;
}

/** Builds one preset's oscillator graph, silent (gain 0) until the caller fades it in. */
function buildVoice(ctx: AudioContext, preset: PresetId, opts: PlayerOptions): VoiceNodes {
  const sources: OscillatorNode[] = [];
  const extras: AudioNode[] = [];
  const voiceOut = ctx.createGain(); voiceOut.gain.value = 1;

  // amplitude-modulation stage (isochronic pulsing) sits before the crossfade fader,
  // so it applies uniformly whether the carrier below is a plain tone, a binaural
  // pair, or the sleep pad.
  const voiceAM = ctx.createGain();
  voiceAM.gain.value = opts.isochronicOn ? 1 - ISOCHRONIC_DEPTH / 2 : 1;
  voiceAM.connect(voiceOut);
  extras.push(voiceAM);

  if (opts.isochronicOn) {
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = opts.pulseHz;
    const depthGain = ctx.createGain(); depthGain.gain.value = ISOCHRONIC_DEPTH / 2;
    lfo.connect(depthGain); depthGain.connect(voiceAM.gain);
    lfo.start();
    sources.push(lfo); extras.push(depthGain);
  }

  const freq = PRESET_FREQUENCIES[preset];

  if (preset === 'sleep') {
    // A soft, slow-breathing pad rather than a flat tone — same construction
    // idiom as ambient.ts's buildPad (detuned voices + a gently swept lowpass).
    // Binaural panning is intentionally skipped here (the pad is already
    // multi-voice, not a single clean carrier); isochronic pulsing still works.
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 500;
    filter.connect(voiceAM);
    extras.push(filter);
    ([[1, 'triangle', 0.09], [1.003, 'triangle', 0.09], [0.5, 'sine', 0.18]] as const).forEach(([ratio, type, gain]) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq * ratio;
      const g = ctx.createGain(); g.gain.value = gain;
      o.connect(g); g.connect(filter); o.start();
      sources.push(o); extras.push(g);
    });
    const flfo = ctx.createOscillator(); flfo.type = 'sine'; flfo.frequency.value = 0.03;
    const fg = ctx.createGain(); fg.gain.value = 220;
    flfo.connect(fg); fg.connect(filter.frequency); flfo.start();
    sources.push(flfo); extras.push(fg);
  } else if (opts.binauralOn) {
    // True binaural: two carriers a few Hz apart, hard-panned L/R. Requires headphones.
    ([[freq, -1], [freq + opts.beatHz, 1]] as const).forEach(([f, pan]) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0.5;
      const panner = ctx.createStereoPanner(); panner.pan.value = pan;
      o.connect(g); g.connect(panner); panner.connect(voiceAM);
      o.start();
      sources.push(o); extras.push(g, panner);
    });
  } else {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    o.connect(voiceAM);
    o.start();
    sources.push(o);
  }

  return { sources, extras, voiceOut };
}

export class ChakraPlayerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private transportGain: GainNode | null = null;
  private currentVoice: VoiceNodes | null = null;
  private currentPreset: PresetId | null = null;
  private currentOpts: PlayerOptions = DEFAULT_OPTIONS;

  private sleepTimeoutId: number | null = null;
  private sleepDeadlineMs: number | null = null;
  private sleepRemainingAtPauseMs: number | null = null;
  private sleepMinutesArmed: number | null = null;

  private recorderTap: GainNode | null = null;
  private recorderDest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  private analyser: AnalyserNode | null = null;

  // Elapsed-time tracking — symmetric with the sleep-timer's pause/resume mechanism above,
  // so "time elapsed" keeps counting across preset switches but freezes (doesn't accrue)
  // while paused, and survives navigating away and back once playback is lifted globally.
  private playStartedAtMs: number | null = null;
  private elapsedAtPauseMs: number | null = null;

  /** Set by the consumer (React hook) to react when a sleep timer fades playback out on its own. */
  onSleepComplete: (() => void) | null = null;

  get isSupported(): boolean {
    return typeof window !== 'undefined'
      && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  }

  /** Always recomputed from Date.now() — never accumulated, so it self-corrects after tab backgrounding. */
  get sleepRemainingMs(): number | null {
    if (this.sleepDeadlineMs == null) return this.sleepRemainingAtPauseMs;
    return Math.max(0, this.sleepDeadlineMs - Date.now());
  }

  /** Time elapsed in the current listening session — counts across preset switches, freezes while paused. */
  get elapsedMs(): number | null {
    if (this.playStartedAtMs != null) return Date.now() - this.playStartedAtMs;
    return this.elapsedAtPauseMs;
  }

  /**
   * A shared AnalyserNode tapped off transportGain — reflects the true post-fade audible
   * signal. Read-only tap (the analyser has no downstream connection of its own, so adding
   * it never affects what's actually heard). Lazily created; persists across preset
   * switches (torn down only in stop()). Time-domain reads only, deliberately — a single
   * sine tone would light up one frequency bin in a spectrum view, which would visually
   * overstate how many frequencies are really present.
   */
  getAnalyser(): AnalyserNode | null {
    if (!this.ctx || !this.transportGain) return null;
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0;
      this.transportGain.connect(this.analyser);
    }
    return this.analyser;
  }

  private ensureContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext
          || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.7;
        this.transportGain = this.ctx.createGain();
        this.transportGain.gain.value = 0;
        this.masterGain.connect(this.transportGain);
        this.transportGain.connect(this.ctx.destination);
      }
      return this.ctx;
    } catch { return null; }
  }

  /** Must be called synchronously from a user-gesture handler (autoplay policy). */
  async play(preset: PresetId, opts: PlayerOptions): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || !this.transportGain) throw new Error('Web Audio API unavailable');
    if (ctx.state === 'suspended') await ctx.resume();

    const samePreset = preset === this.currentPreset;
    const sameOpts = optsEqual(opts, this.currentOpts);
    if (!this.currentVoice || !samePreset || !sameOpts) {
      this.switchVoice(preset, opts, this.currentVoice ? PRESET_XFADE_SEC : 0);
    }
    this.currentOpts = opts;
    ramp(this.transportGain.gain, 1, PLAY_FADE_SEC, ctx);

    // Elapsed-time bookkeeping: only (re)anchor the clock if it isn't already running —
    // switching preset while playing must not reset it, only a fresh start or a resume-from-pause does.
    if (this.playStartedAtMs == null) {
      const base = this.elapsedAtPauseMs ?? 0;
      this.playStartedAtMs = Date.now() - base;
      this.elapsedAtPauseMs = null;
    }

    // resume the sleep countdown (listening time, not wall-clock) if one was armed before a pause
    if (this.sleepMinutesArmed != null && this.sleepDeadlineMs == null) {
      const remaining = this.sleepRemainingAtPauseMs ?? this.sleepMinutesArmed * 60000;
      this.armSleepTimeout(remaining);
    }
  }

  /** Ramps silent and suspends the context — keeps the graph warm for an instant resume. */
  pause(): void {
    const ctx = this.ctx;
    if (!ctx || !this.transportGain) return;
    ramp(this.transportGain.gain, 0, PAUSE_FADE_SEC, ctx);
    if (this.playStartedAtMs != null) {
      this.elapsedAtPauseMs = Date.now() - this.playStartedAtMs;
      this.playStartedAtMs = null;
    }
    if (this.sleepDeadlineMs != null) {
      this.sleepRemainingAtPauseMs = Math.max(0, this.sleepDeadlineMs - Date.now());
      this.sleepDeadlineMs = null;
    }
    if (this.sleepTimeoutId != null) { window.clearTimeout(this.sleepTimeoutId); this.sleepTimeoutId = null; }
    window.setTimeout(() => { try { void ctx.suspend(); } catch { /* */ } }, PAUSE_FADE_SEC * 1000 + 50);
  }

  /** Full teardown — stops/disconnects every node and closes the context. Call on unmount only. */
  stop(): void {
    this.cancelSleepTimer();
    this.stopRecordingInternal();
    this.playStartedAtMs = null;
    this.elapsedAtPauseMs = null;
    const ctx = this.ctx;
    if (ctx && this.transportGain) ramp(this.transportGain.gain, 0, 0.15, ctx);
    const voice = this.currentVoice;
    const master = this.masterGain;
    const transport = this.transportGain;
    const analyser = this.analyser;
    this.currentVoice = null;
    this.currentPreset = null;
    this.masterGain = null;
    this.transportGain = null;
    this.analyser = null;
    this.ctx = null;
    window.setTimeout(() => {
      this.teardownVoice(voice);
      try { analyser?.disconnect(); } catch { /* */ }
      try { master?.disconnect(); } catch { /* */ }
      try { transport?.disconnect(); } catch { /* */ }
      if (ctx) { try { void ctx.close(); } catch { /* */ } }
    }, 200);
  }

  dispose(): void { this.stop(); }

  setMasterVolume(v: number): void {
    if (!this.ctx || !this.masterGain) return;
    ramp(this.masterGain.gain, v, 0.15, this.ctx);
  }

  /** Rebuilds the active voice in place with a short crossfade — for toggling binaural/isochronic while playing. */
  updateOptions(opts: PlayerOptions): void {
    if (!this.ctx || !this.currentPreset) { this.currentOpts = opts; return; }
    if (optsEqual(opts, this.currentOpts)) return;
    this.switchVoice(this.currentPreset, opts, OPTION_XFADE_SEC);
    this.currentOpts = opts;
  }

  armSleepTimer(minutes: number | null): void {
    this.cancelSleepTimer();
    this.sleepMinutesArmed = minutes;
    if (minutes == null) return;
    this.armSleepTimeout(minutes * 60000);
  }

  cancelSleepTimer(): void {
    if (this.sleepTimeoutId != null) { window.clearTimeout(this.sleepTimeoutId); this.sleepTimeoutId = null; }
    this.sleepDeadlineMs = null;
    this.sleepRemainingAtPauseMs = null;
    this.sleepMinutesArmed = null;
  }

  private armSleepTimeout(ms: number) {
    this.sleepDeadlineMs = Date.now() + ms;
    this.sleepRemainingAtPauseMs = null;
    this.sleepTimeoutId = window.setTimeout(() => this.fadeOutAndSuspend(), ms);
  }

  private fadeOutAndSuspend() {
    const ctx = this.ctx;
    this.sleepDeadlineMs = null;
    this.sleepTimeoutId = null;
    this.sleepMinutesArmed = null;
    if (!ctx || !this.transportGain) { this.onSleepComplete?.(); return; }
    ramp(this.transportGain.gain, 0, SLEEP_FADEOUT_SEC, ctx);
    window.setTimeout(() => { try { void ctx.suspend(); } catch { /* */ } }, SLEEP_FADEOUT_SEC * 1000 + 100);
    this.onSleepComplete?.();
  }

  private switchVoice(preset: PresetId, opts: PlayerOptions, xfadeSec: number) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    const prevVoice = this.currentVoice;
    const nextVoice = buildVoice(ctx, preset, opts);
    nextVoice.voiceOut.gain.value = 0;
    nextVoice.voiceOut.connect(this.masterGain);
    ramp(nextVoice.voiceOut.gain, 1, xfadeSec, ctx);
    if (prevVoice) ramp(prevVoice.voiceOut.gain, 0, xfadeSec, ctx);
    this.currentVoice = nextVoice;
    this.currentPreset = preset;
    if (prevVoice) window.setTimeout(() => this.teardownVoice(prevVoice), xfadeSec * 1000 + 200);
  }

  private teardownVoice(voice: VoiceNodes | null) {
    if (!voice) return;
    voice.sources.forEach((o) => { try { o.stop(); } catch { /* */ } });
    [...voice.sources, ...voice.extras, voice.voiceOut].forEach((n) => { try { n.disconnect(); } catch { /* */ } });
  }

  /** Optional stretch feature — records the live output to a downloadable blob. null if unsupported. */
  startRecording(maxSeconds = 600): { stop: () => Promise<Blob> } | null {
    if (!this.ctx || !this.transportGain) return null;
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported?.('audio/webm;codecs=opus')) return null;
    try {
      this.recorderTap = this.ctx.createGain();
      this.transportGain.connect(this.recorderTap);
      this.recorderDest = this.ctx.createMediaStreamDestination();
      this.recorderTap.connect(this.recorderDest);
      const recorder = new MediaRecorder(this.recorderDest.stream, { mimeType: 'audio/webm;codecs=opus' });
      this.mediaRecorder = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const done = new Promise<Blob>((resolve) => { recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' })); });
      recorder.start();
      const capTimer = window.setTimeout(() => { try { recorder.stop(); } catch { /* */ } }, maxSeconds * 1000);
      return {
        stop: async () => {
          window.clearTimeout(capTimer);
          try { recorder.stop(); } catch { /* */ }
          const blob = await done;
          this.cleanupRecorder();
          return blob;
        },
      };
    } catch { this.cleanupRecorder(); return null; }
  }

  private stopRecordingInternal() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') { try { this.mediaRecorder.stop(); } catch { /* */ } }
    this.cleanupRecorder();
  }

  private cleanupRecorder() {
    try { this.recorderTap?.disconnect(); } catch { /* */ }
    this.recorderTap = null;
    this.recorderDest = null;
    this.mediaRecorder = null;
  }
}

export function createChakraPlayerEngine(): ChakraPlayerEngine {
  return new ChakraPlayerEngine();
}
