/**
 * VediCosmic spiritual sound engine — all sounds are synthesised live with the
 * Web Audio API (no audio files), tuned to a 432 Hz major-pentatonic so rapid
 * clicks form a pleasing, raga-like sequence rather than a repetitive blip.
 */
export type SoundType = 'bowl' | 'chime' | 'tap' | 'pluck' | 'tone' | 'soft' | 'conch' | 'petals';

// A-major pentatonic in 432 Hz tuning (Sa Re Ga Pa Dha), plus an octave.
const SCALE = [432, 486, 540, 648, 720, 864];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let idx = 0;
let lastAt = 0;

function ensure(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}

function nextNote(): number {
  const n = SCALE[idx % SCALE.length];
  idx += Math.random() < 0.55 ? 1 : 2;        // gentle melodic walk
  return n;
}

function envelope(g: GainNode, t0: number, attack: number, peak: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
}

function partials(c: AudioContext, base: number, ratios: number[], gains: number[], peak: number, attack: number, decay: number) {
  const t0 = c.currentTime;
  const out = c.createGain();
  envelope(out, t0, attack, peak, decay);
  out.connect(master!);
  ratios.forEach((r, i) => {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = base * r;
    const g = c.createGain();
    g.gain.value = gains[i] ?? 0.2;
    o.connect(g); g.connect(out);
    o.start(t0); o.stop(t0 + attack + decay + 0.1);
  });
}

function singingBowl(c: AudioContext, note: number) {
  // inharmonic partials + a slightly detuned twin for shimmer/beating
  partials(c, note, [1, 2.0, 2.76, 5.4], [1, 0.45, 0.22, 0.1], 0.22, 0.012, 2.6);
  partials(c, note * 1.003, [1, 2.0], [0.5, 0.2], 0.1, 0.012, 2.6);
}

function bell(c: AudioContext, note: number) {
  partials(c, note * 2, [1, 2.0, 2.4, 3.0, 4.5], [1, 0.5, 0.32, 0.2, 0.1], 0.16, 0.005, 1.1);
}

function resonantTone(c: AudioContext, note: number) {
  partials(c, note / 2, [1, 2, 3], [1, 0.4, 0.18], 0.2, 0.06, 1.8);
}

function pluck(c: AudioContext, note: number) {
  const t0 = c.currentTime;
  const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = note;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t0);
  lp.frequency.exponentialRampToValueAtTime(700, t0 + 0.4);
  const g = c.createGain(); envelope(g, t0, 0.004, 0.16, 0.55);
  o.connect(lp); lp.connect(g); g.connect(master!);
  o.start(t0); o.stop(t0 + 0.7);
}

/** A conch (shankh) blast — a low sawtooth swelling into a sustained breathy tone. */
function conch(c: AudioContext) {
  const t0 = c.currentTime;
  const o = c.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(90, t0);
  o.frequency.exponentialRampToValueAtTime(196, t0 + 0.5);
  o.frequency.linearRampToValueAtTime(184, t0 + 2.6);
  const lp = c.createBiquadFilter(); lp.type = 'lowpass';
  lp.frequency.setValueAtTime(400, t0);
  lp.frequency.linearRampToValueAtTime(1100, t0 + 0.5);
  lp.frequency.linearRampToValueAtTime(700, t0 + 2.6);
  lp.Q.value = 1.4;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.45);
  g.gain.setValueAtTime(0.5, t0 + 2.0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.0);
  o.connect(lp); lp.connect(g); g.connect(master!);
  o.start(t0); o.stop(t0 + 3.1);

  // a breathy noise layer for realism
  const bufSize = c.sampleRate * 3;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource(); noise.buffer = buf;
  const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 500; nf.Q.value = 0.6;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.0001, t0);
  ng.gain.exponentialRampToValueAtTime(0.06, t0 + 0.45);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.0);
  noise.connect(nf); nf.connect(ng); ng.connect(master!);
  noise.start(t0); noise.stop(t0 + 3.1);
}

/** A soft cascade of high, quick plucks — like flower petals scattering. */
function petals(c: AudioContext) {
  const t0 = c.currentTime;
  for (let i = 0; i < 6; i++) {
    const delay = i * 0.06 + Math.random() * 0.03;
    const note = (SCALE[Math.floor(Math.random() * SCALE.length)]) * (Math.random() > 0.5 ? 2 : 3);
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = note;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0 + delay);
    g.gain.linearRampToValueAtTime(0.06, t0 + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.5);
    o.connect(g); g.connect(master!);
    o.start(t0 + delay); o.stop(t0 + delay + 0.6);
  }
}

function tap(c: AudioContext, soft = false) {
  const t0 = c.currentTime;
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(soft ? 320 : 220, t0);
  o.frequency.exponentialRampToValueAtTime(soft ? 200 : 130, t0 + 0.1);
  const g = c.createGain(); envelope(g, t0, 0.002, soft ? 0.08 : 0.14, soft ? 0.16 : 0.13);
  o.connect(g); g.connect(master!);
  o.start(t0); o.stop(t0 + 0.3);
  if (soft) { // add a faint high ping on a scale note — like a water drop
    const note = nextNote() * 2;
    partials(c, note, [1, 2], [0.5, 0.2], 0.05, 0.003, 0.4);
  }
}

export const Sound = {
  unlock() { ensure(); },
  setVolume(v: number) { const c = ensure(); if (c && master) master.gain.value = Math.max(0, Math.min(1, v)); },
  play(type: SoundType) {
    const c = ensure();
    if (!c || !master) return;
    const now = performance.now();
    if (now - lastAt < 50) return;            // throttle machine-gun clicks
    lastAt = now;
    switch (type) {
      case 'bowl': return singingBowl(c, nextNote());
      case 'chime': return bell(c, nextNote());
      case 'tone': return resonantTone(c, nextNote());
      case 'pluck': return pluck(c, nextNote());
      case 'conch': return conch(c);
      case 'petals': return petals(c);
      case 'tap': return tap(c, false);
      case 'soft': default: return tap(c, true);
    }
  },
};
