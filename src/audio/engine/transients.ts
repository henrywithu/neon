// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { z_, vG, lde, ade } from "./acoustics.ts";
export const xu = (i, e) => Math.exp(-1 / (i * e));
export class uc {
  constructor(e) {
    this.sr = e;
    this.b0 = 1;
    this.b1 = this.b2 = this.a1 = this.a2 = 0;
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }
  set(e, t, s = Math.SQRT1_2) {
    const n = z_ * Math.min(Math.max(t, 10), this.sr * .45) / this.sr,
      r = Math.cos(n),
      o = Math.sin(n) / (2 * s),
      a = 1 + o;
    e === "lowpass" ? (this.b0 = this.b2 = (1 - r) / 2 / a, this.b1 = (1 - r) / a) : e === "highpass" ? (this.b0 = this.b2 = (1 + r) / 2 / a, this.b1 = -(1 + r) / a) : (this.b0 = o / a, this.b1 = 0, this.b2 = -o / a);
    this.a1 = -2 * r / a;
    this.a2 = (1 - o) / a;
    return this;
  }
  step(e) {
    const t = this.b0 * e + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = e;
    this.y2 = this.y1;
    this.y1 = t;
    return t;
  }
}
export class k1 {
  constructor(e, t, s) {
    this.sr = e;
    this.r = xu(s, e);
    this.y1 = this.y2 = 0;
    this.tune(t);
  }
  tune(e) {
    const t = z_ * Math.min(e, this.sr * .45) / this.sr;
    this.c1 = 2 * this.r * Math.cos(t);
    this.c2 = -this.r * this.r;
    this.g = Math.sin(t);
  }
  get noiseGain() {
    return Math.sqrt(4 * (1 - this.r));
  }
  step(e) {
    const t = e * this.g + this.c1 * this.y1 + this.c2 * this.y2;
    this.y2 = this.y1;
    this.y1 = t;
    return t;
  }
}
export const _L = (i, e) => i / e * Math.exp(1 - i / e);
export function QE(i, e) {
  const t = Math.tanh(e);
  for (let s = 0; s < i.length; s++) i[s] = Math.tanh(i[s] * e) / t;
}
export function wL(i, e) {
  let t = 0;
  for (const s of i) t = Math.max(t, Math.abs(s));
  if (t > 0) for (let s = 0; s < i.length; s++) i[s] *= e / t;
}
export function qE(i, {
  big = false,
  seed = 1
} = {}) {
  const s = vG(seed),
    n = (_, w) => _ + (w - _) * s(),
    r = () => s() * 2 - 1,
    o = i,
    a = Math.ceil((big ? .3 : .06) * o),
    l = big ? 1.6 : 1,
    c = new Float32Array(a),
    u = new Float32Array(a),
    d = (_, w = a) => {
      let S = 0;
      for (let v = 0; v < w; v++) S = Math.max(S, Math.abs(u[v]));
      const T = S > 0 ? _ / S : 0;
      for (let v = 0; v < w; v++) c[v] += u[v] * T, u[v] = 0;
    },
    h = n(12e-5, 25e-5) * l,
    f = h * n(4, 6),
    p = _ => _ < 0 ? 0 : _L(_, h) - h / f * _L(_, f),
    [m, A] = s() < .35 ? [n(.003, .009), n(.3, .6)] : [0, 0],
    g = Math.min(a, Math.ceil((m + f * 15) * o));
  for (let _ = 0; _ < g; _++) u[_] = p(_ / o) + p(_ / o - m) * A;
  d(1, g);
  const b = xu(4e-4, o),
    x = (_, w, S) => {
      const T = new k1(o, w, S);
      let v = 1;
      for (let E = 0; E < a; E++, v *= b) u[E] = T.step(v > 1e-4 ? r() * v : 0);
      d(_);
    };
  x(big ? .75 : .45, n(100, 150) / l, n(.005, .008) * l * l);
  x(.6, n(320, 540) / Math.sqrt(l), n(.004, .006) * l);
  x(.3, n(900, 1500), n(.0015, .0025));
  const y = (_, w, S = null) => {
    const T = xu(w, o);
    let v = 1,
      E = 0;
    for (; E < a && v > 1e-4; E++, v *= T) u[E] = (S ? S.step(r()) : r()) * v;
    d(_, E);
  };
  if (y(.5, n(5e-4, 8e-4) * l), y(.35, n(.0025, .005) * l, new uc(o).set("bandpass", n(2800, 5200), .9)), big) {
    const _ = new uc(o).set("bandpass", n(700, 1300), .6),
      w = new uc(o).set("lowpass", n(120, 220)),
      S = xu(n(.025, .04), o),
      T = .003 * o;
    let v = 1;
    for (let E = 0; E < a; E++, v *= S) {
      const C = .3 + 2.5 * Math.abs(w.step(r()));
      u[E] = _.step(r()) * C * Math.min(1, E / T) * v;
    }
    d(.45);
  }
  if (QE(c, big ? 2.2 : 1.6), wL(c, .9), big) {
    let _ = n(.02, .035);
    for (let w = 0, S = 2 + Math.floor(s() * 3); w < S && _ < .24; w++) {
      const T = qE(o, {
          seed: seed * 7919 + w + 1
        }),
        v = n(.2, .42) * (1 - w * .18),
        E = Math.round(_ * o);
      for (let C = 0; C < T.length && E + C < a; C++) c[E + C] += T[C] * v;
      _ += n(.015, .045);
    }
    wL(c, .9);
  }
  return c;
}
export const cde = {
  release: "long-a",
  rate: 1,
  length: .6,
  attack: 0,
  tilt: 4500,
  bright: 16e3,
  twin: null,
  body: null,
  whoomp: 0,
  whoompHz: 90,
  flutter: 0,
  flutterEnd: 0,
  flutterFrom: 0,
  flutterTime: 0,
  flutterDepth: .8,
  flutterLevel: 1,
  tu: 2600,
  chest: 300,
  blade: .3,
  spin: null,
  spinLevel: 0,
  level: 1
};
export function ude(i, e = {}, {
  strength = 1,
  seed = 1,
  takes = {}
} = {}) {
  var M;
  const r = {
      ...cde,
      ...e
    },
    o = takes[r.release];
  if (!o) return null;
  const a = Math.min(1, Math.max(.2, strength)),
    l = vG(seed),
    c = i,
    u = r.length * (.45 + .55 * a),
    d = r.bright * (.7 + .3 * a),
    h = () => .98 + l() * .04,
    f = LS(o, c, r.rate * h(), u, r.tilt, d),
    p = r.twin && takes[r.twin.release ?? r.release],
    m = p ? LS(p, c, (r.twin.rate ?? r.rate) * h(), u * .9, r.tilt, d * .95) : null,
    A = m ? Math.round((r.twin.delay ?? .02) * c) : 0,
    g = r.flutter > 0 ? (r.flutterTime || u * (1 - r.flutterFrom)) * (.5 + .5 * a) : 0,
    b = Math.max(r.spin ? u * 2.2 : 0, r.flutter > 0 ? u * r.flutterFrom + g + .08 : 0),
    x = Math.max(f.length, A + ((m == null ? undefined : m.length) ?? 0), Math.ceil(b * c)),
    y = new Float32Array(x);
  if (y.set(f), m) for (let B = 0; B < m.length; B++) y[A + B] += m[B] * (r.twin.gain ?? .6);
  const _ = Math.round(r.attack * c),
    w = B => B < _ ? Math.sin(B / _ * Math.PI / 2) ** 2 : 1;
  for (let B = 0; B < _ && B < x; B++) y[B] *= w(B);
  const S = lde * r.level * (.35 + .65 * a);
  ob(y, 0, Math.round(u * .5 * c), S);
  const T = EG(y, c),
    v = y.slice(),
    E = y.slice(),
    C = r.body && takes[r.body.release];
  if (C) {
    const B = (r.body.rate ?? 1) * h(),
      R = Math.max(0, C.length - (u * B + .02) * c);
    for (const [I, k] of [[v, 0], [E, Math.min(R, .25 * c * B)]]) {
      const L = LS(C, c, B, u, r.body.tilt ?? 900, d, k);
      dde(L, T, c);
      ob(L, 0, Math.round(u * .5 * c), S * (r.body.level ?? .7));
      for (let F = 0; F < L.length; F++) I[F] += L[F];
    }
  }
  if (r.whoomp > 0) {
    const B = hde(c, r.whoompHz, l);
    ob(B, 0, Math.round(.1 * c), S * r.whoomp);
    for (let R = 0; R < B.length && R < x; R++) v[R] += B[R] * w(R), E[R] += B[R] * w(R);
  }
  if (r.flutter > 0) {
    const B = takes[(M = r.body) == null ? undefined : M.release] ?? o,
      {
        pulses: R,
        gate: I
      } = fde(c, r, x, u * r.flutterFrom, g, a, l, B);
    ob(R, Math.round(u * r.flutterFrom * c), Math.round((u * r.flutterFrom + g) * c), S * r.flutterLevel);
    for (let k = 0; k < x; k++) v[k] = v[k] * I[k] + R[k], E[k] = E[k] * I[k] + R[k];
  }
  if (r.spin && r.spinLevel > 0) {
    const [B, R] = r.spin,
      I = u * 2.2,
      k = S * r.spinLevel,
      L = xu(I * .45, c);
    let F = 1,
      O = 0,
      H = 1,
      W = 0,
      P = 0,
      z = 1;
    for (let Y = 0; Y < x; Y++, z *= L) {
      if ((Y & ade - 1) === 0) {
        const ae = Y / c,
          ne = Math.min(1, ae / I),
          se = z_ * B * (R / B) ** ne / c;
        H = Math.cos(se);
        W = Math.sin(se);
        P = Math.min(1, ae / .02) * (1 - ne) * k;
        const re = 1 / Math.hypot(F, O);
        F *= re;
        O *= re;
      }
      const G = F * H - O * W;
      O = O * H + F * W;
      F = G;
      const X = (O + .5 * O * F) * P * z;
      v[Y] += X;
      E[Y] += X;
    }
  }
  QE(v, 1.3);
  QE(E, 1.3);
  return [v, E];
}
export function ob(i, e, t, s) {
  const n = Math.min(i.length, Math.max(e + 1, t));
  let r = 0;
  for (let l = e; l < n; l++) r += i[l] * i[l];
  const o = Math.sqrt(r / Math.max(1, n - e)),
    a = o > 0 ? s / o : 0;
  for (let l = 0; l < i.length; l++) i[l] *= a;
}
export function EG(i, e) {
  const t = Math.exp(-1 / (.005 * e)),
    s = Math.exp(-1 / (.04 * e)),
    n = new Float32Array(i.length);
  let r = 0;
  for (let o = 0; o < i.length; o++) {
    const a = Math.abs(i[o]);
    r = a > r ? a + (r - a) * t : a + (r - a) * s;
    n[o] = r;
  }
  return n;
}
export function dde(i, e, t) {
  const s = EG(i, t);
  for (let n = 0; n < i.length; n++) i[n] = s[n] > 1e-5 && n < e.length ? i[n] / s[n] * e[n] : 0;
}
export function LS(i, e, t, s, n, r, o = 0) {
  const a = Math.floor((i.length - 2 - o) / t),
    l = Math.max(0, Math.min(a, Math.ceil(s * e))),
    c = l < a ? Math.round(l * .7) : l,
    u = Math.min(r, .42 * e * Math.min(1, t)),
    d = new uc(e).set("lowpass", u),
    h = new uc(e).set("lowpass", u),
    f = Math.exp(-z_ * n / e);
  let p = 0;
  const m = new Float32Array(l);
  for (let A = 0; A < l; A++) {
    const g = o + A * t,
      b = Math.floor(g),
      x = g - b,
      y = i[Math.max(0, b - 1)],
      _ = i[b],
      w = i[b + 1],
      S = i[b + 2],
      T = _ + .5 * x * (w - y + x * (2 * y - 5 * _ + 4 * w - S + x * (3 * (_ - w) + S - y))),
      v = A < c ? 1 : Math.cos((A - c) / (l - c) * Math.PI / 2) ** 2;
    p = T * (1 - f) + p * f;
    m[A] = h.step(d.step(p + T * .5)) * v;
  }
  return m;
}
export function hde(i, e, t) {
  const s = Math.round(.35 * i),
    n = new Float32Array(s),
    r = new uc(i).set("lowpass", 380),
    o = new uc(i).set("lowpass", 380),
    a = new k1(i, e, .055),
    l = xu(.09, i),
    c = xu(.003, i);
  let u = 1,
    d = 1;
  for (let h = 0; h < s; h++, u *= l, d *= c) {
    const f = t() * 2 - 1,
      p = o.step(r.step(f)) * Math.min(1, h / (.004 * i)) * u;
    n[h] = p * 3 + a.step(f * d) * .6;
  }
  return n;
}
export function fde(i, e, t, s, n, r, o, a) {
  const l = new Float32Array(t),
    c = new Float32Array(t).fill(1),
    u = e.flutterEnd || e.flutter,
    d = Math.round(s * i),
    h = Math.min(t, Math.round((s + n) * i));
  for (let m = d; m < h; m++) c[m] = 1 - e.flutterDepth;
  for (let m = h; m < Math.min(t, h + .03 * i); m++) c[m] = 1 - e.flutterDepth * (1 - (m - h) / (.03 * i));
  const f = e.spin ? e.spin[0] : 6e3;
  let p = s;
  for (; p < s + n;) {
    const m = (p - s) / n,
      A = 1 / (e.flutter * (u / e.flutter) ** m),
      g = (1 - .85 * m) * (.8 + .4 * o()),
      b = Math.round(p * i),
      x = Math.min(t - b, Math.round(A * i)),
      y = xu(A * .35, i),
      _ = .0025 * i,
      w = new uc(i).set("bandpass", e.tu * (1 - .15 * m), 1.1),
      S = new uc(i).set("highpass", 7e3),
      T = new k1(i, e.chest, .012),
      v = new k1(i, f * (1 - .35 * m), .004),
      E = Math.floor(o() * Math.max(1, a.length - x - 1));
    let C = 1;
    for (let M = 0; M < x; M++, C *= y) {
      const B = Math.min(1, M / _) * C,
        R = a[E + M] ?? 0,
        I = M < .0015 * i ? o() * 2 - 1 : 0,
        k = w.step(R) * 2.4 + S.step(R) * .8 + T.step(I) * .08 + v.step(R) * v.noiseGain * e.blade * 4;
      l[b + M] += k * B * g;
      b + M < h && (c[b + M] = Math.max(c[b + M], 1 - e.flutterDepth + e.flutterDepth * B * g));
    }
    p += A * (.93 + .14 * o());
  }
  return {
    pulses: l,
    gate: c
  };
}
export const TL = "/audio/engine/v8.json";
export const pde = "/audio/nitro-turbo.mp3";
export const mde = "/audio/tire-squeal.wav";
export const gde = "/audio/turbo/releases.json";
export const Ade = .24;
