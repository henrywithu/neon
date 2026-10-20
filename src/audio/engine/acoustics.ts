// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const tde = new URL("../worklets/engineSynth.worklet.js", import.meta.url).href;
export const sde = new URL("../worklets/engineSampler.worklet.js", import.meta.url).href;
export const nde = 343;
export const xL = .4;
export function ide(i) {
  return Math.min(1, Math.max(0, i));
}
export function rb(i, e, t) {
  const s = ide((t - i) / (e - i));
  return s * s * (3 - 2 * s);
}
export function rde(i, e = 1.4) {
  const t = i.sampleRate,
    s = Math.floor(t * e),
    n = i.createBuffer(2, s, t);
  for (let r = 0; r < 2; r++) {
    const o = n.getChannelData(r);
    let a = 0;
    for (let l = 0; l < s; l++) {
      const c = l / s,
        u = .6 - .5 * c;
      a += (Math.random() * 2 - 1 - a) * u;
      o[l] = a * Math.pow(1 - c, 3.2);
    }
  }
  return n;
}
export function ode(i, {
  input: input,
  output: output,
  tune: tune
}) {
  const n = i.createGain();
  input.connect(n);
  const r = i.createGain();
  r.connect(output);
  const o = A => {
      const g = i.createDelay(xL);
      g.delayTime.value = .1;
      const b = i.createBiquadFilter();
      b.type = "lowpass";
      b.frequency.value = 3200;
      const x = i.createGain();
      x.gain.value = 0;
      const y = i.createStereoPanner();
      y.pan.value = A;
      n.connect(g).connect(b).connect(x).connect(y).connect(r);
      return {
        delay: g,
        tone: b,
        level: x
      };
    },
    a = o(-.75),
    l = o(.75),
    c = o(0);
  c.tone.frequency.value = 2400;
  const u = i.createGain();
  u.gain.value = 0;
  c.tone.connect(u).connect(c.delay);
  const d = i.createDelay(.1);
  d.delayTime.value = .03;
  const h = i.createConvolver();
  h.buffer = rde(i);
  const f = i.createGain();
  f.gain.value = 0;
  n.connect(d).connect(h).connect(f).connect(r);
  function p(A) {
    return Number.isFinite(A) ? rb(60, 12, A) * rb(3, 9, A) : 0;
  }
  function m(A) {
    const g = i.currentTime,
      b = tune.acousticEcho ?? 1,
      x = rb(30, 10, A.up);
    for (const [_, w, S] of [[a, A.left, .12], [l, A.right, .12], [c, A.up, .75 * x]]) Number.isFinite(w) && _.delay.delayTime.setTargetAtTime(Math.min(xL - .01, 2 * w / nde), g, .2), _.level.gain.setTargetAtTime(p(w) * S * b, g, .25);
    u.gain.setTargetAtTime(.45 * x * Math.min(1, b), g, .25);
    const y = .02 + .06 * rb(.25, .9, A.enclosure) + .6 * x;
    f.gain.setTargetAtTime(y * (tune.acousticReverb ?? 1), g, .3);
  }
  return {
    set: m,
    dispose() {
      input.disconnect(n);
      r.disconnect();
    }
  };
}
export const z_ = Math.PI * 2;
export const ade = 32;
export const lde = .075;
export function vG(i) {
  let e = i >>> 0;
  return () => {
    e = e + 1831565813 >>> 0;
    let t = Math.imul(e ^ e >>> 15, e | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
