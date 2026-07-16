// Procedural UI sounds, synthesized with the Web Audio API so no audio
// assets are needed.
//
// Voiced to match the site: dark, dry and quiet, closer to a film camera
// than to a keyboard. Nothing here rings or carries a pitch you could hum —
// these sit under the page the way grain sits under the photographs.
//
// Two gestures, one palette. playTick() is a strike, for text resolving
// under the scramble. playHover() is a single shutter blade, for arriving
// somewhere — the same length, pitched up out of the tick's way.

let ctx: AudioContext | null = null;
// Everything connects here; the chain behind it runs to the destination.
let bus: AudioNode | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new AudioContext();
    return ctx;
  } catch {
    return null;
  }
}

// Browsers only allow audio after the first real interaction (click or
// keypress — hover doesn't count); unlock the context on the first one so
// hover sounds are audible from then on.
if (typeof window !== "undefined") {
  const unlock = () => {
    const ac = ensureContext();
    if (ac && ac.state === "suspended") void ac.resume();
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

// Sound is on by default but has to be refusable, and the choice has to
// survive a reload. Hovering a word is not a request for audio, so the mute
// is the thing that makes the rest of this defensible.
const MUTE_KEY = "sound-muted";

let muted: boolean | null = null;
// The mute lives in this module, not in React state; SoundToggle subscribes
// here (useSyncExternalStore) so its icon tracks the real value.
const muteListeners = new Set<() => void>();

export function subscribeMuted(onChange: () => void): () => void {
  muteListeners.add(onChange);
  return () => {
    muteListeners.delete(onChange);
  };
}

export function isMuted(): boolean {
  if (muted === null) {
    try {
      muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      // Safari throws on localStorage in private mode rather than returning
      // null; stay audible rather than taking playback down with it.
      muted = false;
    }
  }
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {}
  muteListeners.forEach((onChange) => onChange());
}

function ready(): AudioContext | null {
  // Checked before ensureContext so a muted visitor never has an
  // AudioContext built for them at all.
  if (typeof window === "undefined" || isMuted()) return null;

  const ac = ensureContext();
  if (!ac) return null;
  if (ac.state !== "running") {
    // Try to recover (e.g. the tab regained focus); this one stays silent
    // but the next plays.
    void ac.resume();
    return null;
  }
  return ac;
}

function ensureBus(ac: AudioContext): AudioNode {
  if (!bus) {
    // One shared lowpass, kept below where a click lives, is what kills the
    // brittle top end; the master gain caps a dense run of overlapping sounds.
    const master = ac.createGain();
    master.gain.value = 0.75;
    master.connect(ac.destination);

    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1600;
    filter.Q.value = 0.5;
    filter.connect(master);

    bus = filter;
  }
  return bus;
}

function makeNoise(ac: AudioContext, samples: number): AudioBuffer {
  const buf = ac.createBuffer(1, samples, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// The scramble already sits out prefers-reduced-motion, so its ticks fall
// silent with it. Hover sounds have no such animation to hide behind and
// check for themselves, so the whole flourish stays consistent.
function motionAllowed(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// A gap this long counts as a new hover, so the run starts over at full level.
const PHRASE_GAP_S = 0.25;
// Ticks ease off across a run, so a resolving word settles rather than
// rattling at one level the whole way. Keep PHRASE_TICKS in step with the
// ticks a word actually fires (see TICK_INTERVAL_MS in scramble-link): set
// far above it and the run ends before the falloff has gone anywhere.
const PHRASE_TICKS = 10;
const PHRASE_FALLOFF = 0.45;

let tickNoise: AudioBuffer | null = null;
let step = 0;
let lastTickTime = -Infinity;

export function playTick() {
  const ac = ready();
  if (!ac) return;

  const t = ac.currentTime;
  const out = ensureBus(ac);
  tickNoise ??= makeNoise(ac, 512);

  if (t - lastTickTime > PHRASE_GAP_S) step = 0;
  lastTickTime = t;

  const level = 1 - PHRASE_FALLOFF * Math.min(step / PHRASE_TICKS, 1);
  step++;

  // The transient: a breath of noise, damped almost immediately. Eased in
  // rather than started cold — an instant onset is the edge the ear reads
  // as a click.
  //
  // Linear, not exponential: a ramp off a near-zero floor stays inaudible
  // most of its length then lunges at the target, which is the hard onset
  // this is trying not to have. Linear spends the whole 6ms arriving.
  const src = ac.createBufferSource();
  src.buffer = tickNoise;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;

  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0, t);
  noiseGain.gain.linearRampToValueAtTime(0.06 * level, t + 0.006);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

  src.connect(noiseGain).connect(out);
  src.start(t);

  // The body: a low triangle, detuned a little each time so a run reads as
  // texture rather than a machine stamping. It decays before it can settle
  // into a note.
  //
  // The decay is the number that matters. Letters in a long word resolve
  // ~66ms apart, so anything ringing past that is still sounding when the
  // next tick lands and the word smears into one noise. Kept short enough to
  // leave clear air between ticks — the run should read as separate marks.
  const body = ac.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(172 + Math.random() * 42, t);
  body.frequency.exponentialRampToValueAtTime(120, t + 0.04);

  const bodyGain = ac.createGain();
  bodyGain.gain.setValueAtTime(0, t);
  bodyGain.gain.linearRampToValueAtTime(0.07 * level, t + 0.008);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.042);

  body.connect(bodyGain).connect(out);
  body.start(t);
  body.stop(t + 0.05);
}

// Pointers travel across a stack of links; this keeps that to one sound on
// arrival rather than one per link brushed past.
const HOVER_DEBOUNCE_S = 0.09;

let hoverNoise: AudioBuffer | null = null;
let lastHoverTime = -Infinity;

export function playHover() {
  const ac = ready();
  if (!ac || !motionAllowed()) return;

  const t = ac.currentTime;
  if (t - lastHoverTime < HOVER_DEBOUNCE_S) return;
  lastHoverTime = t;

  const out = ensureBus(ac);

  const src = ac.createBufferSource();
  src.buffer = (hoverNoise ??= makeNoise(ac, Math.floor(ac.sampleRate * 0.05)));

  // A single shutter blade: one dry tick, nothing behind it. What separates
  // this from the scramble tick is register rather than shape — banded up
  // out of the way, with none of the low triangle body the tick strikes.
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 240;

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1100;
  lp.Q.value = 0.5;

  const gain = ac.createGain();
  // Attack is linear on purpose. An exponential ramp off a near-zero floor
  // stays inaudible for most of its length and then lunges for the target,
  // which would sharpen this into a click. Decay stays exponential, which is
  // the curve things actually fade on.
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.16, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

  src.connect(hp).connect(lp).connect(gain).connect(out);
  src.start(t);
  src.stop(t + 0.05);
}
