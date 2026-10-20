// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { YE, Nfe } from "../physics/dynamicProps.ts";
export function tc(i, e, t) {
  const {
      xs: s,
      zs: n,
      cum: r
    } = i,
    o = r.length;
  e = Math.max(0, Math.min(i.length, e));
  let a = 0,
    l = o - 1;
  for (; l - a > 1;) {
    const u = a + l >> 1;
    r[u] <= e ? a = u : l = u;
  }
  const c = (e - r[a]) / (r[l] - r[a] || 1);
  t.x = s[a] + (s[l] - s[a]) * c;
  t.z = n[a] + (n[l] - n[a]) * c;
  t.yaw = Math.atan2(s[l] - s[a], n[l] - n[a]);
  return t;
}
export function OG(i, e, t, s = 0) {
  e += i.length > t ? i.bend * t / i.length : i.bend;
  return Math.abs(e) > YE ? false : (t -= i.length, t <= 0 || s >= 5 ? true : i.next.some(n => n.lane.routable && Math.abs(e + n.turn) <= YE && OG(n.lane, e + n.turn, t, s + 1)));
}
export function Vfe(i, e, t = Math.random, s = 0) {
  let n = e.next.filter(c => c.lane.routable);
  if (!n.length) return null;
  const r = n.filter(c => Math.abs(s + c.turn) <= YE && OG(c.lane, s + c.turn, Nfe));
  r.length && (n = r);
  let o = 0;
  const a = n.map(({
    turn: turn
  }) => {
    const u = Math.abs(turn),
      d = u < .35 ? 3 : u < 1.2 ? 1.4 : u < 1.9 ? 1 : .35;
    o += d;
    return d;
  });
  let l = t() * o;
  for (let c = 0; c < n.length; c++) if (l -= a[c], l <= 0) return n[c].lane;
  return n[n.length - 1].lane;
}
export const Vl = 2.75;
export const _b = .6;
export const Qfe = 6.5;
export const qfe = 110;
export const Hfe = 78;
export const wb = 3;
export const yg = 2;
export const YS = 2.1;
export const yk = 3;
export const eu = (i, e, t) => i < e ? e : i > t ? t : i;
export const XS = i => {
  for (; i > Math.PI;) i -= 2 * Math.PI;
  for (; i < -Math.PI;) i += 2 * Math.PI;
  return i;
};
export const Nf = {
  x: 0,
  z: 0,
  yaw: 0
};
export const JS = {
  x: 0,
  z: 0,
  yaw: 0
};
export function Tb(i, e) {
  tc(i, e - 2.5, Nf);
  tc(i, e + 2.5, JS);
  const t = JS.x - Nf.x,
    s = JS.z - Nf.z,
    n = Math.hypot(t, s) || 1;
  tc(i, e, Nf);
  return [Nf.x, Nf.z, t / n, s / n];
}
export function bk(i, e, t, s, n, r, o, a) {
  const l = n - i,
    c = r - e,
    u = t * a - s * o,
    d = Math.acos(eu(t * o + s * a, -1, 1));
  if (Math.abs(u) < .001 || d < .05) return null;
  const h = (l * a - c * o) / u,
    f = -(l * s - c * t) / u;
  return h > 0 && f > 0 ? {
    t0: h,
    t3: f,
    theta: d
  } : null;
}
export function Wfe(i, e, t) {
  let s = i.length,
    n = 0,
    [r, o, a, l] = Tb(i, s),
    [c, u, d, h] = Tb(e, n),
    f = bk(r, o, a, l, c, u, d, h);
  if (f) {
    const v = Qfe * Math.tan(f.theta / 2),
      E = eu(v - f.t0, 0, i.length * .45),
      C = eu(v - f.t3, 0, e.length * .45);
    (E > .05 || C > .05) && (s = i.length - E, n = C, [r, o, a, l] = Tb(i, s), [c, u, d, h] = Tb(e, n), f = bk(r, o, a, l, c, u, d, h));
  }
  const p = Math.hypot(c - r, u - o);
  let m = p / 3,
    A = p / 3;
  if (f) {
    const v = 1.3333333333333333 * Math.tan(f.theta / 4) / Math.tan(f.theta / 2);
    m = Math.min(f.t0 * v, p);
    A = Math.min(f.t3 * v, p);
  }
  const g = r + a * m,
    b = o + l * m,
    x = c - d * A,
    y = u - h * A,
    _ = Math.max(2, Math.ceil(p / 1.2) + 1),
    w = new Float32Array(_),
    S = new Float32Array(_),
    T = new Float32Array(_);
  for (let v = 0; v < _; v++) {
    const E = v / (_ - 1),
      C = 1 - E;
    w[v] = C * C * C * r + 3 * C * C * E * g + 3 * C * E * E * x + E * E * E * c;
    S[v] = C * C * C * o + 3 * C * C * E * b + 3 * C * E * E * y + E * E * E * u;
    v && (T[v] = T[v - 1] + Math.hypot(w[v] - w[v - 1], S[v] - S[v - 1]));
  }
  return {
    connector: true,
    from: i,
    to: e,
    turn: t,
    enterAt: s,
    exitAt: n,
    xs: w,
    zs: S,
    cum: T,
    length: Math.max(T[_ - 1], .001),
    speed: Math.min(i.speed, e.speed)
  };
}
export function xk(i, e) {
  const {
    cum: t
  } = i;
  let s = 0,
    n = t.length - 1;
  for (; n - s > 1;) {
    const r = s + n >> 1;
    t[r] <= e ? s = r : n = r;
  }
  return s;
}
export const ZS = (i, e = 0, t = i.length) => ({
  el: i,
  s0: e,
  s1: t,
  length: Math.max(.001, t - e)
});
export function $fe(i, e = Math.random) {
  const t = new Map(),
    s = {
      x: 0,
      z: 0,
      yaw: 0,
      el: null
    },
    n = {
      x: 0,
      z: 0,
      yaw: 0
    },
    r = {
      x: 0,
      z: 0,
      yaw: 0
    },
    o = new Float32Array(Math.floor(Hfe / wb) + yg + 1);
  function a(b, x) {
    var w;
    const y = b.id * 65536 + x.id;
    let _ = t.get(y);
    if (!_) {
      const S = ((w = b.next.find(T => T.lane === x)) == null ? undefined : w.turn) ?? 0;
      _ = Wfe(b, x, S);
      t.set(y, _);
    }
    return _;
  }
  function l(b, x = 25, y = 2.5) {
    let _ = b.length - 1,
      w = b[_].length,
      S = 0,
      T = null;
    for (let v = 0; v <= x; v += y) {
      for (; w < 0 && _ > 0;) w += b[--_].length;
      if (w < 0) break;
      const E = b[_];
      tc(E.el, E.s0 + w, n);
      T !== null && (S += XS(T - n.yaw));
      T = n.yaw;
      w -= y;
    }
    return S;
  }
  function c(b) {
    let x = b.route[0].length - b.s;
    for (let y = 1; y < b.route.length; y++) x += b.route[y].length;
    return x;
  }
  function u(b) {
    let x = c(b);
    const {
      route: y
    } = b;
    for (; x < qfe && !b.routeEnd;) {
      const _ = y[y.length - 1],
        w = Vfe(i, _.el, e, l(y));
      if (!w) {
        b.routeEnd = true;
        break;
      }
      const S = a(_.el, w);
      _.s1 = Math.max(_.s0 + .1, Math.min(_.s1, S.enterAt));
      _.length = _.s1 - _.s0;
      y.push(ZS(S), ZS(w, Math.min(S.exitAt, w.length - .1)));
      x = c(b);
    }
    return x;
  }
  function d(b, x, y) {
    let _ = b.s + x;
    const {
      route: w
    } = b;
    for (let S = 0; S < w.length; S++) {
      const T = w[S];
      if (_ <= T.length || S === w.length - 1) return tc(T.el, T.s0 + Math.min(_, T.length), y), y.el = T.el, y;
      _ -= T.length;
    }
    return y;
  }
  function h(b, x, y, _, w, S, T) {
    const {
      route: v
    } = b;
    let E = 0,
      C = b.s + x;
    for (let M = 0; M < _; M++) {
      for (; C > v[E].length && E < v.length - 1;) C -= v[E++].length;
      const B = v[E];
      tc(B.el, B.s0 + Math.min(C, B.length), r);
      S[M] = r.x - Math.cos(r.yaw) * w;
      T[M] = r.z + Math.sin(r.yaw) * w;
      C += y;
    }
  }
  function f(b) {
    const x = b.route[0];
    return x.el.connector ? 0 : x.length - b.s;
  }
  function p(b) {
    for (let x = 0; x < 4; x++) {
      const y = b.route[0],
        {
          xs: _,
          zs: w,
          cum: S
        } = y.el,
        T = _.length - 2;
      let v = 1 / 0,
        E = y.s0 + b.s,
        C = b.seg;
      for (let B = Math.max(0, b.seg - 1); B <= Math.min(T, b.seg + 5); B++) {
        const R = _[B + 1] - _[B],
          I = w[B + 1] - w[B],
          k = R * R + I * I || 1e-9,
          L = eu(((b.rx - _[B]) * R + (b.rz - w[B]) * I) / k, 0, 1),
          F = _[B] + R * L - b.rx,
          O = w[B] + I * L - b.rz,
          H = F * F + O * O;
        H < v && (v = H, C = B, E = S[B] + (S[B + 1] - S[B]) * L);
      }
      if (b.seg = C, b.s = Math.max(b.s, Math.min(y.length, E - y.s0)), b.offTrack = Math.sqrt(v), b.s < y.length - .02 || b.route.length === 1) return;
      b.route.shift();
      const M = b.route[0];
      b.s = 0;
      b.seg = xk(M.el, M.s0);
      M.el.connector || (b.lane = M.el);
    }
  }
  function m(b, x, y) {
    tc(x, y, s);
    const _ = Math.max(0, y - Vl / 2);
    b.lane = x;
    b.route = [ZS(x, _)];
    b.routeEnd = false;
    b.yaw = s.yaw;
    b.steer = 0;
    b.yawRate = 0;
    b.rx = s.x - Math.sin(s.yaw) * (Vl / 2);
    b.rz = s.z - Math.cos(s.yaw) * (Vl / 2);
    b.s = 0;
    b.seg = xk(x, _);
    b.x = s.x;
    b.z = s.z;
    b.offTrack = 0;
    u(b);
  }
  function A(b) {
    const x = u(b);
    let y = b.route[0].el.speed * b.factor;
    const _ = Math.abs(Math.tan(b.steer)) / Vl;
    y = Math.min(y, Math.max(yk, Math.sqrt(b.aLat / Math.max(_, 1e-4))) + 1);
    const w = o.length - 1;
    for (let S = 0; S <= w; S++) {
      const T = S * wb;
      d(b, T, s);
      o[S] = s.yaw;
      const v = s.el.speed * b.factor;
      if (y = Math.min(y, Math.sqrt(v * v + 2 * YS * Math.max(0, T - 2))), S >= yg) {
        const E = (S - yg) * wb,
          C = Math.abs(XS(o[S] - o[S - yg])) / (yg * wb),
          M = Math.max(yk, Math.sqrt(b.aLat / Math.max(C, 1e-4)));
        y = Math.min(y, Math.sqrt(M * M + 2 * YS * Math.max(0, E - 2)));
      }
      if (T > x) break;
    }
    b.routeEnd && (y = Math.min(y, Math.sqrt(2 * YS * Math.max(0, x - 3))));
    return y;
  }
  function g(b, x) {
    const y = eu((3.2 + .5 * b.v) * b.look, 4, 16);
    d(b, y, s);
    const _ = b.bias + (b.offset ?? 0),
      w = s.x - Math.cos(s.yaw) * _,
      S = s.z + Math.sin(s.yaw) * _,
      T = w - b.rx,
      v = S - b.rz,
      E = Math.max(1, Math.hypot(T, v)),
      C = (T * Math.cos(b.yaw) - v * Math.sin(b.yaw)) / E,
      M = eu(Math.atan(2 * Vl * C / E), -_b, _b),
      B = b.steerRate * x;
    b.steer = eu(b.steer + eu(M - b.steer, -B, B), -_b, _b);
    const R = b.v / Vl * Math.tan(b.steer),
      I = b.yaw + R * x * .5;
    b.rx += Math.sin(I) * b.v * x;
    b.rz += Math.cos(I) * b.v * x;
    b.yaw = XS(b.yaw + R * x);
    b.yawRate = R;
    p(b);
    b.x = b.rx + Math.sin(b.yaw) * (Vl / 2);
    b.z = b.rz + Math.cos(b.yaw) * (Vl / 2);
  }
  return {
    place: m,
    desiredSpeed: A,
    move: g,
    pointAhead: d,
    pathAhead: h,
    laneLeft: f
  };
}
export const UG = 2.37;
export const _k = Vl / 2 + UG;
export const ev = 1.6;
export const XE = 1;
export const Sb = .98 + XE + .2;
export const tv = 3;
export const vb = 2.5;
export const Eb = 18;
export const hB = 30;
export const wk = 52;
export const Kfe = 2.2;
export const jfe = 3.5;
export const Yfe = 4;
export const Xfe = 2.5;
export const Jfe = 6.5;
export const Tk = 1.4;
export const Zfe = 4;
export const bg = new Float32Array(hB);
export const xg = new Float32Array(hB);
export const epe = [];
export function tpe(i) {
  let e = null;
  function t(l, c, u, d, h, f) {
    for (let p = h; p < d - 1; p++) {
      const m = tv + p * vb;
      if (m >= f) break;
      const A = bg[p + 1] - bg[p],
        g = xg[p + 1] - xg[p],
        b = A * A + g * g || 1e-6,
        x = Math.max(0, Math.min(1, ((l - bg[p]) * A + (c - xg[p]) * g) / b)),
        y = bg[p] + A * x - l,
        _ = xg[p] + g * x - c;
      if (y * y + _ * _ < u * u) return m + x * vb;
    }
    return 1 / 0;
  }
  function s(l, c, u, d, h) {
    const f = Math.sin(l.yaw),
      p = Math.cos(l.yaw);
    let m = 1 / 0;
    e = null;
    const A = c.length + u.length;
    for (let g = 0; g < A; g++) {
      const b = g < c.length ? c[g] : u[g - c.length];
      if (!b || b === l || b === h) continue;
      const x = b.x - l.x,
        y = b.z - l.z;
      if (x * x + y * y > wk * wk || x * f + y * p < -6) continue;
      const _ = m + _k + XE,
        w = t(b.x, b.z, Sb + ev, d, 0, _);
      if (w === 1 / 0) continue;
      const S = Math.max(0, Math.floor((w - tv) / vb) - 1),
        T = Math.sin(b.yaw) * ev,
        v = Math.cos(b.yaw) * ev,
        E = Math.min(t(b.x - T, b.z - v, Sb, d, S, _), t(b.x, b.z, Sb, d, S, _), t(b.x + T, b.z + v, Sb, d, S, _));
      E < _ && (m = E - _k - XE, e = b);
    }
    return m;
  }
  function n(l, c, u, d, h, f) {
    i.pathAhead(l, tv, vb, h, l.bias + d, bg, xg);
    return s(l, c, u, h, f);
  }
  const r = l => l.isPlayer ? l.v < .5 : l.wrecked || l.stopped > Zfe;
  function o(l) {
    let c = l.id,
      u = l.leader;
    for (let d = 0; u && u !== l && d < 6; d++) c = Math.max(c, u.id ?? -1), u = u.leader;
    return u === l && c === l.id;
  }
  function a(l, c, u, d, h, f = 4) {
    const p = Array.isArray(u) ? u : u ? [u] : epe;
    (h + l.planPhase) % f === 0 && (l.desired = i.desiredSpeed(l));
    l.ignoreFor = Math.max(0, (l.ignoreFor ?? 0) - d);
    l.ignoreFor || (l.ignore = null);
    let m = 0;
    if (l.pass) {
      if ((l.pass.x - l.x) * Math.sin(l.yaw) + (l.pass.z - l.z) * Math.cos(l.yaw) < -2 * UG - 1) {
        const E = n(l, c, p, 0, Eb, null);
        l.pass = e && E < 12 && r(e) && i.laneLeft(l) > E + 20 ? e : null;
      } else !c.includes(l.pass) && !p.includes(l.pass) && (l.pass = null);
      l.pass && (m = -2.6);
    }
    const A = l.offset ?? 0;
    l.offset = A + Math.max(-Tk * d, Math.min(Tk * d, m - A));
    const g = l.pass ? m : l.offset;
    let b = n(l, c, p, g, Eb, l.ignore);
    l.leader = e;
    e && l.v < 1 && !e.isPlayer && o(l) && (l.ignore = e, l.ignoreFor = Yfe, b = n(l, c, p, g, Eb, e), l.leader = e);
    const x = l.leader && !l.pass && l.v < .5 && b < 12 && r(l.leader);
    if (l.waited = x ? (l.waited ?? 0) + d : 0, l.waited > Xfe) {
      const v = l.leader;
      n(l, c, p, -2.6, hB, v) === 1 / 0 && (l.pass = v, l.waited = 0, b = n(l, c, p, -2.6, Eb, v));
      l.leader = v;
    }
    const y = l.pass || Math.abs(l.offset) > .3 ? Math.min(l.desired, Jfe) : l.desired,
      _ = 2 + l.v * 1.2,
      w = 1 - (l.v / Math.max(1, y)) ** 4,
      S = Number.isFinite(b) ? (_ / Math.max(.5, b)) ** 2 : 0,
      T = Math.max(-8, Kfe * (w - S));
    l.braking = T < -1 ? Math.min(1, -T / jfe) : l.v < .5 ? .6 : 0;
    l.v = Math.max(0, l.v + T * d);
    l.stopped = l.v < .2 ? (l.stopped ?? 0) + d : 0;
    i.move(l, d);
  }
  return {
    step: a
  };
}
