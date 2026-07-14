"use client";

let audioCtx = null;
let muted = false;
let initialized = false;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const loadMutedPref = () => {
  if (initialized) return;
  if (typeof window !== "undefined") {
    muted = localStorage.getItem("sound-muted") === "1";
  }
  initialized = true;
};

export const isMuted = () => {
  loadMutedPref();
  return muted;
};

// Lets React subscribe to the mute flag via useSyncExternalStore instead of
// mirroring it into component state after mount.
const muteListeners = new Set();

export const subscribeMuted = (onChange) => {
  muteListeners.add(onChange);
  return () => muteListeners.delete(onChange);
};

export const getMutedServerSnapshot = () => false;

export const setMuted = (m) => {
  muted = !!m;
  initialized = true;
  if (typeof window !== "undefined") {
    localStorage.setItem("sound-muted", muted ? "1" : "0");
  }
  muteListeners.forEach((fn) => fn());
};

const play = ({ freq, duration, type = "sine", volume = 0.08, sweepTo = null }) => {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  const t0 = ctx.currentTime;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo !== null) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration);
  }
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
};

const sequence = (notes, { type = "triangle", volume = 0.08, step = 0.1, noteDur = 0.25 } = {}) => {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * step;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + noteDur);
  });
};

const noiseBurst = ({ duration = 0.4, volume = 0.3, lowpass = 800 }) => {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const bufSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = lowpass;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
};

// --- Snake ---
export const sEat = () =>
  play({ freq: 660, duration: 0.12, type: "square", volume: 0.08 });
export const sDie = () =>
  play({ freq: 440, sweepTo: 110, duration: 0.45, type: "sawtooth", volume: 0.1 });

// --- 2048 ---
export const sSlide = () =>
  play({ freq: 220, duration: 0.06, type: "sine", volume: 0.05 });
export const sMerge = (value = 4) => {
  const base = 330;
  const freq = base * Math.pow(1.08, Math.log2(value));
  play({ freq, duration: 0.18, type: "triangle", volume: 0.1 });
};
export const s2048Lose = () => sequence([392, 330, 262], { type: "triangle", step: 0.13, noteDur: 0.28, volume: 0.08 });
export const s2048Win = () => sequence([523, 659, 784, 1047], { type: "triangle", step: 0.1, noteDur: 0.3, volume: 0.09 });

// --- Space Impact ---
export const sShoot = () =>
  play({ freq: 1200, sweepTo: 600, duration: 0.08, type: "square", volume: 0.05 });
export const sEnemyHit = () =>
  play({ freq: 300, sweepTo: 80, duration: 0.12, type: "sawtooth", volume: 0.08 });
export const sPlayerHit = () => noiseBurst({ duration: 0.3, volume: 0.25, lowpass: 500 });
export const sSpaceOver = () =>
  sequence([440, 330, 220, 165], { type: "sawtooth", step: 0.14, noteDur: 0.3, volume: 0.1 });

// --- Minesweeper ---
export const sReveal = () =>
  play({ freq: 880, duration: 0.04, type: "square", volume: 0.04 });
export const sFlag = () =>
  play({ freq: 550, duration: 0.08, type: "triangle", volume: 0.07 });
export const sBoom = () => noiseBurst({ duration: 0.5, volume: 0.35, lowpass: 700 });
export const sMineWin = () => sequence([523, 659, 784, 1047], { type: "sine", step: 0.1, noteDur: 0.3, volume: 0.09 });
