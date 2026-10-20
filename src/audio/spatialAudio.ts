// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { AudioListener, AudioLoader, Audio, Node, PositionalAudio } from "three/webgpu";
import { Nde, RL, lb, Lde, IL, LL, kde } from "./uiSounds.ts";
import { getAudioVolume, subscribeAudioState, isAudioPlaying } from "./audioState.ts";
export function createSpatialAudio({
  volume = 1
} = {}) {
  const e = new AudioListener();
  e.setMasterVolume(volume);
  const t = e.context,
    s = new AudioLoader(),
    n = new Map();
  let r = null,
    o = 0;
  for (const [p, [m, A, g, b]] of Object.entries(Nde)) s.load(RL + m, x => {
    const y = Array.from({
      length: g
    }, () => {
      const _ = new Audio(e);
      _.setBuffer(x);
      _.setVolume(A);
      return _;
    });
    n.set(p, {
      voices: y,
      next: 0,
      gap: b,
      last: -1 / 0
    });
  }, undefined, x => console.warn(`[ui-sfx] ${m} unavailable:`, x));
  let a = null;
  s.load(RL + lb.file, p => {
    a = {
      buffer: p,
      blips: Lde(p),
      last: -1 / 0,
      prev: -1
    };
  }, undefined, p => console.warn(`[ui-sfx] ${lb.file} unavailable:`, p));
  function l() {
    if (!(a != null && a.blips.length) || t.state !== "running") return;
    const p = performance.now();
    if (p - a.last < lb.gap) return;
    a.last = p;
    let m = Math.floor(Math.random() * a.blips.length);
    m === a.prev && (m = (m + 1) % a.blips.length);
    a.prev = m;
    const [A, g] = a.blips[m],
      b = .93 + Math.random() * .16,
      x = g / b,
      y = lb.volume * (.7 + Math.random() * .4),
      _ = t.createBufferSource();
    _.buffer = a.buffer;
    _.playbackRate.value = b;
    const w = t.createGain(),
      S = t.currentTime;
    w.gain.setValueAtTime(y, S);
    w.gain.setValueAtTime(y, S + x * .7);
    w.gain.linearRampToValueAtTime(0, S + x);
    _.connect(w);
    w.connect(e.getInput());
    _.onended = () => w.disconnect();
    _.start(S, A, g);
  }
  function c(p) {
    const m = n.get(p);
    if (!m || t.state !== "running") return null;
    const A = performance.now();
    if (A - m.last < m.gap) return null;
    m.last = A;
    const g = m.voices[m.next];
    m.next = (m.next + 1) % m.voices.length;
    g.isPlaying && g.stop();
    g.play();
    return g;
  }
  function u(p) {
    r && performance.now() - r.at < 120 && r.voice.isPlaying && r.voice.stop();
    r = null;
    c(p);
    o = performance.now() + 300;
  }
  const d = p => p.dataset.uiSound;
  function h(p) {
    if (p.pointerType === "touch" || performance.now() < o) return;
    const m = p.target instanceof Element ? p.target.closest(IL) : null;
    !m || LL(m) || d(m) === "off" || p.relatedTarget instanceof Node && m.contains(p.relatedTarget) || c("hover");
  }
  function f(p) {
    if (t.state === "suspended" && t.resume().catch(() => {}), !(p.target instanceof Element)) return;
    const m = p.target.closest(IL) ?? p.target.closest("[data-close]");
    if (!m || LL(m) || d(m) === "off") return;
    const A = d(m) ?? (kde(m) ? "close" : "click"),
      g = c(A);
    r = A === "click" && g ? {
      voice: g,
      at: performance.now()
    } : null;
  }
  document.addEventListener("pointerover", h, true);
  document.addEventListener("click", f, true);
  return {
    play: c,
    open: () => u("open"),
    close: () => u("close"),
    confirm: () => c("confirm"),
    type: l,
    setVolume(p) {
      e.setMasterVolume(p);
    },
    dispose() {
      document.removeEventListener("pointerover", h, true);
      document.removeEventListener("click", f, true);
      for (const {
        voices: p
      } of n.values()) for (const m of p) m.isPlaying && m.stop();
    }
  };
}
const planeEngineUrl = "/freesound_community-plasma-engine-fx-33559.mp3";
export { planeEngineUrl };
export const kL = 1.4;
export async function Pde({
  listener: listener,
  plane: plane
}) {
  if (!listener || !plane) return {
    sound: null,
    play() {},
    pause() {},
    dispose() {}
  };
  const t = new PositionalAudio(listener);
  t.name = "plane-engine";
  t.setRefDistance(35);
  t.setRolloffFactor(1.2);
  t.setDistanceModel("inverse");
  t.setLoop(true);
  t.setVolume(getAudioVolume() * kL);
  plane.add(t);
  plane.updateMatrixWorld(true);
  const s = await new AudioLoader().loadAsync(planeEngineUrl);
  t.setBuffer(s);
  async function n() {
    if (t.isPlaying) return;
    const a = listener.context;
    a.state !== "running" && (await a.resume());
    t.play();
  }
  function r() {
    t.isPlaying && t.pause();
  }
  const o = subscribeAudioState(({
    isMusicPlaying: isMusicPlaying,
    audioVolume: audioVolume
  }) => {
    t.setVolume(audioVolume * kL);
    isMusicPlaying ? n().catch(() => {}) : r();
  });
  return {
    sound: t,
    play: n,
    pause: r,
    dispose() {
      o();
      r();
      t.source && t.disconnect();
      plane.remove(t);
    }
  };
}
const footstepUrls = ["/wet_footstep-step-01.mp3", "/wet_footstep-step-02.mp3", "/wet_footstep-step-03.mp3", "/wet_footstep-step-04.mp3", "/wet_footstep-step-05.mp3", "/wet_footstep-step-06.mp3"];
export { footstepUrls };
export const FL = 3;
export const DL = 1.7;
export const Ude = 3.8;
export const gg = .38;
export const PL = .7;
export const OL = 3;
export async function zde({
  listener: listener
}) {
  if (!listener) return {
    update() {},
    dispose() {}
  };
  const e = new AudioLoader();
  let t;
  try {
    t = await Promise.all(footstepUrls.map(p => e.loadAsync(p)));
  } catch (p) {
    console.warn("[audio] Footsteps disabled:", p);
    return {
      update() {},
      dispose() {}
    };
  }
  const s = Array.from({
    length: OL
  }, () => new Audio(listener));
  let n = 0,
    r = 0,
    o = gg,
    a = 0,
    l = isAudioPlaying(),
    c = getAudioVolume();
  function u(p) {
    const m = Math.min(1, Math.max(0, (p - FL) / (FL * 2)));
    return DL + (Ude - DL) * m;
  }
  async function d() {
    if (!l) return;
    const p = s[n++ % OL],
      m = t[a++ % t.length];
    p.setBuffer(m);
    p.setPlaybackRate(1);
    p.setVolume(c * PL);
    p.isPlaying && p.stop();
    const A = listener.context;
    A.state !== "running" && (await A.resume());
    p.play();
    o = 0;
  }
  function h(p, {
    moving = false,
    speed = 0
  } = {}) {
    if (!l || !moving || speed <= 0) {
      r = 0;
      o = gg;
      return;
    }
    o += p;
    r += speed * p;
    const g = u(speed);
    r >= g && o >= gg && (r %= g, d().catch(() => {}));
  }
  const f = subscribeAudioState(({
    isMusicPlaying: isMusicPlaying,
    audioVolume: audioVolume
  }) => {
    l = isMusicPlaying;
    c = audioVolume;
    for (const A of s) A.buffer && A.setVolume(c * PL);
    if (!l) {
      r = 0;
      o = gg;
      for (const A of s) A.isPlaying && A.stop();
    }
  });
  return {
    update: h,
    dispose() {
      f();
      for (const p of s) p.isPlaying && p.stop(), p.disconnect();
      r = 0;
      o = gg;
      n = 0;
      a = 0;
    }
  };
}
