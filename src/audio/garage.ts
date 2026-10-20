// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { subscribeAudioState } from "./audioState.ts";
import { Nb, nF, iF, Zge, e0e } from "../multiplayer/createMultiplayer.ts";
export function t0e(i) {
  let e = 2166136261;
  for (let t = 0; t < i.length; t++) e = Math.imul(e ^ i.charCodeAt(t), 16777619);
  return .9 + (e >>> 0) % 1e3 / 1e3 * .22;
}
function createGarageAudio({
  context: context,
  volume = .2
} = {}) {
  if (!context) return null;
  const t = context.createGain();
  t.gain.value = volume;
  const s = context.createDynamicsCompressor();
  s.threshold.value = -16;
  s.ratio.value = 5;
  t.connect(s);
  s.connect(context.destination);
  const n = subscribeAudioState(({
      isMusicPlaying: isMusicPlaying
    }) => {
      t.gain.value = isMusicPlaying ? volume : 0;
    }),
    r = new Map();
  function o(l) {
    var A;
    const c = context.currentTime,
      u = l === "me" ? 1 : t0e(l),
      d = context.createBiquadFilter();
    d.type = "lowpass";
    d.frequency.value = 2100;
    d.Q.value = .8;
    const h = context.createGain();
    h.gain.value = 1e-4;
    const f = ((A = context.createStereoPanner) == null ? undefined : A.call(context)) ?? null;
    d.connect(h);
    f ? (h.connect(f), f.connect(t)) : h.connect(t);
    const m = {
      oscillators: [[Nb * u, -5], [Nb * u, 6], [Nb * u * nF, -4], [Nb * u * nF, 5]].map(([g, b]) => {
        const x = context.createOscillator();
        x.type = "sawtooth";
        x.frequency.value = g;
        x.detune.value = b;
        const y = context.createGain();
        y.gain.value = .25;
        x.connect(y);
        y.connect(d);
        x.start(c);
        return x;
      }),
      env: h,
      pan: f,
      filter: d
    };
    r.set(l, m);
    return m;
  }
  function a(l) {
    const c = r.get(l);
    if (!c) return;
    r.delete(l);
    const u = context.currentTime;
    c.env.gain.cancelScheduledValues(u);
    c.env.gain.setValueAtTime(Math.max(1e-4, c.env.gain.value), u);
    c.env.gain.exponentialRampToValueAtTime(1e-4, u + iF);
    for (const d of c.oscillators) d.stop(u + iF + .03);
    c.oscillators[0].onended = () => {
      var d;
      c.env.disconnect();
      (d = c.pan) == null || d.disconnect();
    };
  }
  return {
    set(l, c, {
      gain = 1,
      pan = 0
    } = {}) {
      var m;
      if (!c || context.state !== "running" || gain < .01) {
        a(l);
        return;
      }
      let h = r.get(l);
      const f = !h;
      if (f) {
        if (r.size >= Zge) return;
        h = o(l);
      }
      const p = context.currentTime;
      h.env.gain.setTargetAtTime(gain, p, f ? e0e : .03);
      (m = h.pan) == null || m.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), p, f ? .001 : .04);
    },
    release: a,
    active: () => [...r.keys()],
    stopAll() {
      for (const l of [...r.keys()]) a(l);
    },
    dispose() {
      n();
      for (const l of [...r.keys()]) a(l);
      t.disconnect();
      s.disconnect();
    }
  };
}
export { createGarageAudio };
