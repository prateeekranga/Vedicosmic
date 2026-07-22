import { audioConfig } from '@/config/audio';

/**
 * Immersive ambient soundscape engine — lush reverberant pads with detuned
 * chorus, a sub-bass warmth, a high shimmer layer and slow evolving movement,
 * designed to feel like stepping into a dream-world. File-free (Web Audio),
 * with optional custom-file playback and spoken guidance (Web Speech API).
 */
let ctx: AudioContext | null = null;
const getCtx = (): AudioContext | null => {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
};

interface Scene { gain: GainNode; oscs: OscillatorNode[]; timer?: number; audio?: HTMLAudioElement; reverbIn?: GainNode }
let bg: Scene | null = null;
let tk: Scene | null = null;
let ts: Scene | null = null;  // generic per-tool scene
let pj: Scene | null = null;  // puja / aarti scene

// lush, open voicings (add9 / sus) for a floating, dreamy feel
const PRESETS: Record<string, { chord: number[]; bells: number[] }> = {
  temple: { chord: [130.81, 164.81, 196.0, 293.66], bells: [523.25, 587.33, 783.99, 1046.5] }, // Cadd9
  cosmos: { chord: [146.83, 220.0, 246.94, 329.63], bells: [587.33, 659.25, 880.0, 1318.5] },   // Dsus
  river:  { chord: [110.0, 164.81, 196.0, 246.94], bells: [493.88, 659.25, 783.99, 987.77] },   // Am9
};
const TRATAK = { chord: [98.0, 146.83, 196.0], beat: 6, bells: [392.0, 523.25] };
// warm devotional drone + a much faster, rhythmic bell peal — the aarti "ghanti" rhythm
const AARTI = { chord: [196.0, 246.94, 293.66, 392.0], bells: [523.25, 659.25, 783.99, 1046.5], beat: 3 };
const SEMI_STEPS = [0, 2, 4, 5, 7, 9, 11];

/** Generate a smooth, long reverb impulse → the sense of vast space. */
function makeReverb(c: AudioContext, seconds = 5.5, decay = 2.6): ConvolverNode {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  const cv = c.createConvolver(); cv.buffer = buf; return cv;
}

function buildPad(c: AudioContext, chord: number[], opts: { beat?: number; reverbSec?: number; type?: OscillatorType; filter?: number; shimmer?: number; subGain?: number } = {}): Scene {
  const out = c.createGain(); out.gain.value = 0;
  out.connect(c.destination);

  const reverb = makeReverb(c, opts.reverbSec ?? 5.5);
  const wet = c.createGain(); wet.gain.value = 0.6;
  const dry = c.createGain(); dry.gain.value = 0.4;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = opts.filter ?? 650; lp.Q.value = 0.3;
  lp.connect(dry); dry.connect(out);
  lp.connect(wet); wet.connect(reverb); reverb.connect(out);

  const nodes: OscillatorNode[] = [];
  const voiceType: OscillatorType = opts.type ?? 'triangle';

  // slow filter sweep — gentle, evolving movement
  const flfo = c.createOscillator(); flfo.type = 'sine'; flfo.frequency.value = 0.025;
  const fg = c.createGain(); fg.gain.value = (opts.filter ?? 650) * 0.45; flfo.connect(fg); fg.connect(lp.frequency); flfo.start(); nodes.push(flfo);

  // pad voices — each note as 3 slightly detuned oscillators (chorus shimmer)
  chord.forEach((f) => {
    [0, -7, 8].forEach((det, k) => {
      const o = c.createOscillator(); o.type = k === 0 ? 'sine' : voiceType;
      o.frequency.value = f; o.detune.value = det + (Math.random() * 5 - 2.5);
      const g = c.createGain(); g.gain.value = 0.06;
      const slfo = c.createOscillator(); slfo.type = 'sine'; slfo.frequency.value = 0.018 + Math.random() * 0.05;
      const sg = c.createGain(); sg.gain.value = 0.045; slfo.connect(sg); sg.connect(g.gain);
      o.connect(g); g.connect(lp); o.start(); slfo.start(); nodes.push(o, slfo);
    });
  });

  if (opts.beat) {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = chord[0] + opts.beat;
    const g = c.createGain(); g.gain.value = 0.05; o.connect(g); g.connect(lp); o.start(); nodes.push(o);
  }

  const sub = c.createOscillator(); sub.type = 'sine'; sub.frequency.value = chord[0] / 2;
  const subg = c.createGain(); subg.gain.value = opts.subGain ?? 0.1; sub.connect(subg); subg.connect(out); sub.start(); nodes.push(sub);

  const sh = c.createOscillator(); sh.type = 'sine'; sh.frequency.value = chord[0] * 4;
  const shg = c.createGain(); shg.gain.value = opts.shimmer ?? 0.012;
  const shlfo = c.createOscillator(); shlfo.type = 'sine'; shlfo.frequency.value = 0.012;
  const shlg = c.createGain(); shlg.gain.value = (opts.shimmer ?? 0.012) * 0.8; shlfo.connect(shlg); shlg.connect(shg.gain);
  sh.connect(shg); shg.connect(wet); sh.start(); shlfo.start(); nodes.push(sh, shlfo);

  return { gain: out, oscs: nodes, reverbIn: wet };
}

/** A single soft bell with a long reverb tail. */
function bellHit(c: AudioContext, scene: Scene, f: number) {
  const t0 = c.currentTime;
  [1, 2, 3].forEach((r, i) => {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f * r;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(i ? 0.012 : 0.03, t0 + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 6);
    o.connect(g);
    if (scene.reverbIn) g.connect(scene.reverbIn);
    g.connect(scene.gain);
    o.start(t0); o.stop(t0 + 6.3);
  });
}

/** Sparse, soft bells with long reverb tails — like distant temple chimes. */
function scheduleBells(c: AudioContext, scene: Scene, notes: number[], every: [number, number] = [11000, 20000]): number {
  return window.setInterval(() => {
    bellHit(c, scene, notes[Math.floor(Math.random() * notes.length)]);
  }, every[0] + Math.random() * (every[1] - every[0]));
}

function ramp(g: GainNode, to: number, dur: number, c: AudioContext) {
  const now = c.currentTime; g.gain.cancelScheduledValues(now);
  g.gain.setValueAtTime(g.gain.value, now); g.gain.linearRampToValueAtTime(to, now + dur);
}
function fadeAudio(a: HTMLAudioElement, to: number, step = 0.04) {
  const id = window.setInterval(() => {
    const d = to - a.volume;
    if (Math.abs(d) < step) { a.volume = Math.max(0, Math.min(1, to)); if (to === 0) a.pause(); clearInterval(id); }
    else a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(d) * step));
  }, 70);
}
function teardown(s: Scene | null, c: AudioContext | null) {
  if (!s) return;
  if (s.timer) clearInterval(s.timer);
  if (s.audio) fadeAudio(s.audio, 0);
  if (c) ramp(s.gain, 0, 2, c);
  window.setTimeout(() => { s.oscs.forEach((o) => { try { o.stop(); } catch { /* */ } }); try { s.gain.disconnect(); } catch { /* */ } }, 2200);
}
function startFile(c: AudioContext, url: string, vol: number): Scene {
  const audio = new Audio(url); audio.loop = true; audio.crossOrigin = 'anonymous'; audio.volume = 0;
  audio.play().catch(() => { /* needs gesture */ });
  fadeAudio(audio, vol);
  return { gain: c.createGain(), oscs: [], audio };
}

export const Ambient = {
  unlock() { getCtx(); },

  startBackground() {
    const c = getCtx(); if (!c || bg) return;
    const cfg = audioConfig.background;
    if (cfg.mode === 'file' && cfg.fileUrl) { bg = startFile(c, cfg.fileUrl, cfg.volume); return; }
    const p = PRESETS[cfg.preset] ?? PRESETS.temple;
    const scene = buildPad(c, p.chord);
    scene.timer = scheduleBells(c, scene, p.bells);
    bg = scene;
    ramp(scene.gain, cfg.volume, 6, c);   // slow, dreamy fade-in
  },
  stopBackground() { teardown(bg, ctx); bg = null; },

  beginTratak(ambient: boolean) {
    const c = getCtx(); if (!c) return;
    if (bg) { if (bg.audio) fadeAudio(bg.audio, audioConfig.background.volume * 0.12); else ramp(bg.gain, audioConfig.background.volume * 0.14, 2, c); }
    if (!ambient || tk) return;
    const cfg = audioConfig.tratak;
    if (cfg.mode === 'file' && cfg.fileUrl) { tk = startFile(c, cfg.fileUrl, cfg.volume); return; }
    const scene = buildPad(c, TRATAK.chord, { beat: TRATAK.beat, reverbSec: 6.5 });
    scene.timer = scheduleBells(c, scene, TRATAK.bells);
    tk = scene;
    ramp(scene.gain, cfg.volume, 5, c);
  },
  endTratak() {
    teardown(tk, ctx); tk = null;
    const c = getCtx();
    if (bg && c) { if (bg.audio) fadeAudio(bg.audio, audioConfig.background.volume); else ramp(bg.gain, audioConfig.background.volume, 3, c); }
  },

  speak(text: string, lang: 'en' | 'hi' = 'en') {
    try {
      const v = audioConfig.tratak.voice;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      const voices = window.speechSynthesis.getVoices?.() || [];
      const pref = lang === 'hi' ? 'hi' : 'en';
      const match = voices.find((vc) => vc.lang && vc.lang.toLowerCase().startsWith(pref));
      if (match) u.voice = match;
      u.rate = v.rate; u.pitch = v.pitch; u.volume = 1;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch { /* */ }
  },
  stopSpeak() { try { window.speechSynthesis.cancel(); } catch { /* */ } },

  // ---- per-tool soundscapes ----
  enterTool(def: { chord: number[]; bells: number[]; beat?: number; reverbSec?: number; type?: OscillatorType; filter?: number; shimmer?: number; subGain?: number; every?: [number, number] }) {
    const c = getCtx(); if (!c) return;
    // pause the global background quickly while a tool scene plays
    if (bg) { if (bg.audio) fadeAudio(bg.audio, 0); else ramp(bg.gain, 0, 0.8, c); }
    if (ts) teardown(ts, c);
    const scene = buildPad(c, def.chord, def);
    scene.timer = scheduleBells(c, scene, def.bells, def.every);
    ts = scene;
    ramp(scene.gain, audioConfig.background.volume, 2, c);
    bellHit(c, scene, def.bells[0]);  // instant cue that the soundscape changed
  },
  exitTool() {
    teardown(ts, ctx); ts = null;
    const c = getCtx();
    if (bg && c) { if (bg.audio) fadeAudio(bg.audio, audioConfig.background.volume); else ramp(bg.gain, audioConfig.background.volume, 3, c); }
  },

  // ---- puja / aarti ----
  /** A warm devotional drone with a fast, rhythmic bell peal — starts with an
   * opening flourish of bells, then settles into a steady ghanti rhythm.
   * `seed` transposes the drone slightly so each deity sounds distinct. */
  beginAarti(seed: string) {
    const c = getCtx(); if (!c) return;
    if (bg) { if (bg.audio) fadeAudio(bg.audio, audioConfig.background.volume * 0.1); else ramp(bg.gain, audioConfig.background.volume * 0.12, 1.5, c); }
    if (pj) teardown(pj, c);
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const ratio = Math.pow(2, SEMI_STEPS[h % SEMI_STEPS.length] / 12);
    const chord = AARTI.chord.map((f) => f * ratio);
    const bells = AARTI.bells.map((f) => f * ratio);
    const scene = buildPad(c, chord, { beat: AARTI.beat, reverbSec: 3.2, filter: 900 });
    // opening flourish — a quick cascade of bells, like the ghanti being rung to begin
    bells.forEach((f, i) => window.setTimeout(() => bellHit(c, scene, f), i * 140));
    window.setTimeout(() => bellHit(c, scene, bells[0] * 2), 560);
    // then a steady, frequent ringing rhythm for the duration of the aarti
    scene.timer = scheduleBells(c, scene, bells, [900, 1500]);
    pj = scene;
    ramp(scene.gain, audioConfig.background.volume * 1.1, 1.2, c);
  },
  endAarti() {
    const c = getCtx();
    if (c && pj) bellHit(c, pj, AARTI.bells[0]); // closing bell
    teardown(pj, ctx); pj = null;
    if (bg && c) { if (bg.audio) fadeAudio(bg.audio, audioConfig.background.volume); else ramp(bg.gain, audioConfig.background.volume, 2.5, c); }
  },
};

/** A clearly distinct soundscape per tool category (different register & timbre),
 *  with a small per-tool transposition so tools within a category still vary. */
interface ToolProfile { chord: number[]; bells: number[]; type?: OscillatorType; filter?: number; shimmer?: number; subGain?: number; beat?: number; reverbSec?: number; every?: [number, number] }
const CATEGORY_PROFILE: Record<string, ToolProfile> = {
  // bright, sparkling celesta — high and crystalline
  numerology: { chord: [261.63, 329.63, 392.0, 523.25], bells: [1046.5, 1318.5, 1567.98], type: 'triangle', filter: 1700, shimmer: 0.022, subGain: 0.05, reverbSec: 4.5, every: [7000, 12000] },
  // airy, ethereal space — prominent high shimmer, vast reverb
  astrology: { chord: [196.0, 293.66, 392.0, 587.33], bells: [1174.66, 1567.98, 2093.0], type: 'sine', filter: 1000, shimmer: 0.055, subGain: 0.06, reverbSec: 7.5, every: [9000, 16000] },
  // deep singing bowls — low, warm, grounding, with a slow beat
  energy: { chord: [98.0, 146.83, 196.0], bells: [392.0, 523.25], type: 'sine', filter: 520, shimmer: 0.006, subGain: 0.16, beat: 4, reverbSec: 6.5, every: [12000, 20000] },
  // vast low drone with a binaural pulse — cosmic depth
  cosmology: { chord: [73.42, 110.0, 164.81], bells: [440.0, 659.25], type: 'triangle', filter: 760, shimmer: 0.012, subGain: 0.15, beat: 6, reverbSec: 6.5, every: [10000, 16000] },
};
const SEMI = [0, 3, -2, 5, 2, -4, 7];
export function toolSceneDef(category: string, seed: string): ToolProfile {
  const base = CATEGORY_PROFILE[category] ?? CATEGORY_PROFILE.numerology;
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const ratio = Math.pow(2, SEMI[h % SEMI.length] / 12);
  return {
    ...base,
    chord: base.chord.map((f) => f * ratio),
    bells: base.bells.map((f) => f * ratio),
  };
}
