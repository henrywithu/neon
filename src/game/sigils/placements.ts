// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { AG, mG, pG, au, gG } from "../../ui/map/markers.ts";
import { Fn, mx_noise_float, float, clamp, mix } from "three/tsl";
import { Vector3 } from "three/webgpu";
export const oL = new Map();
export function aL(i) {
  let e = oL.get(i);
  e || (e = new Path2D(AG(i)), oL.set(i, e));
  return e;
}
export function yG(i, e, t, s, n, {
  done = false,
  alpha = 1,
  glow = 0,
  variant = "mission"
} = {}) {
  const c = n / 100,
    u = variant === "garage",
    d = u ? mG : pG;
  i.save();
  i.globalAlpha *= alpha;
  i.translate(t - n / 2, s - n / 2);
  i.scale(c, c);
  i.save();
  i.translate(50, 50);
  u || i.rotate(Math.PI / 4);
  const h = u ? 42 : 33;
  i.beginPath();
  i.roundRect ? i.roundRect(-h, -h, h * 2, h * 2, u ? 14 : 9) : i.rect(-h, -h, h * 2, h * 2);
  glow > 0 && (i.shadowColor = d, i.shadowBlur = glow);
  i.fillStyle = d;
  i.fill();
  i.shadowBlur = 0;
  i.lineWidth = 6;
  i.lineJoin = "round";
  i.strokeStyle = au;
  i.stroke();
  i.restore();
  i.save();
  i.translate(26, 74);
  i.scale(.05, .05);
  i.fillStyle = au;
  i.fill(aL(e));
  i.restore();
  done && (i.translate(66, 66), i.beginPath(), i.arc(0, 0, 15, 0, Math.PI * 2), i.fillStyle = gG, i.fill(), i.lineWidth = 4, i.strokeStyle = au, i.stroke(), i.translate(-10.5, 10.5), i.scale(.0219, .0219), i.fillStyle = au, i.fill(aL("check")));
  i.restore();
}
export function bG(i = Math.min(2, window.devicePixelRatio || 1)) {
  const e = new Map();
  return function (s, n, r = false, o = "mission") {
    const a = `${s}|${n}|${r ? 1 : 0}|${o}`;
    let l = e.get(a);
    if (!l) {
      const c = Math.ceil(n * .5),
        u = Math.ceil((n + c * 2) * i);
      l = document.createElement("canvas");
      l.width = u;
      l.height = u;
      const d = l.getContext("2d");
      d.scale(i, i);
      yG(d, s, n / 2 + c, n / 2 + c, n, {
        done: r,
        glow: n * .3 * i,
        variant: o
      });
      l.cssSize = n + c * 2;
      e.set(a, l);
    }
    return l;
  };
}
export const I1 = i => Math.round(i).toLocaleString("en-US");
export function N1(i, {
  tenths = true
} = {}) {
  if (!Number.isFinite(i)) return "--:--";
  const t = Math.max(0, i),
    s = Math.floor(t / 60),
    n = t - s * 60,
    r = Math.floor(n),
    o = `${s}:${String(r).padStart(2, "0")}`;
  return tenths ? `${o}.${Math.floor((n - r) * 10)}` : o;
}
export function xG(i, e = i.rules.time) {
  const t = i.rules,
    s = i.route.length,
    n = i.route.filter(l => l == null ? undefined : l.stop).length,
    r = [],
    o = Number.isFinite(e) ? N1(e, {
      tenths: false
    }) : null;
  t.topSpeed && r.push(`Hit ${t.topSpeed} km/h`);
  const a = o ? ` within ${o}` : "";
  s > 1 && n === s ? r.push(`Make ${n} drops${a}`) : s > 1 ? r.push(`Clear ${s - 1} checkpoints and finish${a}`) : s === 1 ? r.push(n ? `${t.topSpeed ? "Then stop" : "Stop"} in the box${a}` : `Reach the finish${a}`) : o && r.push(`Time limit ${o}`);
  t.drift && r.push(`Bank ${I1(t.drift)} drift points`);
  t.chain && r.push(`Link one ${I1(t.chain)}-point drift chain`);
  t.smash && r.push(`Knock over ${t.smash} street props`);
  t.minSpeed && r.push(`Once past ${t.minSpeed} km/h, never drop below it`);
  Number.isFinite(t.crashes) && r.push(t.crashes === 0 ? "No crashes" : `No more than ${t.crashes} crashes`);
  Number.isFinite(t.damage) && r.push(`Keep damage under ${t.damage}%`);
  t.noNitro && r.push("No nitro");
  t.zone && r.push(`Stay within ${t.zone} m of the start`);
  n && n < s && r.push("Stop inside each box");
  return r;
}
export function _G(i) {
  var t, s;
  if (!(i != null && i.done)) return "";
  const e = [];
  Number.isFinite((t = i.best) == null ? undefined : t.time) && e.push(`BEST ${N1(i.best.time)}`);
  Number.isFinite((s = i.best) == null ? undefined : s.drift) && e.push(`${I1(i.best.drift)} PTS`);
  return e.join(" · ");
}
export const md = I1;
export const Gc = 16;
export const pue = 1.2;
export const lL = 28;
export const mue = 1.5;
export const nb = 14;
export const Sf = 12;
export function gue({
  anchors: anchors,
  boxes: boxes,
  roads: roads,
  groundY: groundY,
  groundAt = null,
  radius = 70,
  step = 4
}) {
  const a = [];
  for (const [x, y, _, w, S, T, v = 0] of boxes) y - S > groundY + 2.4 || a.push({
    cx: x,
    cz: _,
    hx: w,
    hz: T,
    c: Math.cos(v),
    s: Math.sin(v),
    r: Math.hypot(w, T)
  });
  const l = new Map(),
    c = (x, y) => x * 73856093 + y * 19349663;
  a.forEach((x, y) => {
    for (let _ = Math.floor((x.cz - x.r) / Gc); _ <= Math.floor((x.cz + x.r) / Gc); _++) for (let w = Math.floor((x.cx - x.r) / Gc); w <= Math.floor((x.cx + x.r) / Gc); w++) {
      const S = c(w, _);
      l.has(S) || l.set(S, []);
      l.get(S).push(y);
    }
  });
  const u = (x, y, _) => {
      const w = new Set();
      for (let S = Math.floor((y - _) / Gc); S <= Math.floor((y + _) / Gc); S++) for (let T = Math.floor((x - _) / Gc); T <= Math.floor((x + _) / Gc); T++) for (const v of l.get(c(T, S)) ?? []) w.add(v);
      return w;
    },
    d = (x, y, _) => {
      const w = y - x.cx,
        S = _ - x.cz;
      return [w * x.c - S * x.s, w * x.s + S * x.c];
    },
    h = (x, y, _) => {
      const [w, S] = d(x, y, _),
        T = Math.abs(w) - x.hx,
        v = Math.abs(S) - x.hz;
      return T > 0 || v > 0 ? Math.hypot(Math.max(T, 0), Math.max(v, 0)) : Math.max(T, v);
    },
    f = (x, y, _, w, S, T) => {
      const [v, E] = d(x, y, _),
        C = w * x.c - S * x.s,
        M = w * x.s + S * x.c;
      let B = 0,
        R = T;
      for (const [I, k, L] of [[v, C, x.hx], [E, M, x.hz]]) if (Math.abs(k) < 1e-9) {
        if (Math.abs(I) > L) return 1 / 0;
      } else {
        let F = (-L - I) / k,
          O = (L - I) / k;
        if (F > O && ([F, O] = [O, F]), B = Math.max(B, F), R = Math.min(R, O), B > R) return 1 / 0;
      }
      return B;
    },
    p = [],
    m = new Map();
  for (const x of roads) for (let y = 0; y < x.points.length - 1; y++) {
    const [_, w] = x.points[y],
      [S, T] = x.points[y + 1],
      v = p.length;
    p.push({
      x0: _,
      z0: w,
      x1: S,
      z1: T,
      hw: (x.width ?? 10) / 2
    });
    for (let E = Math.floor(Math.min(w, T) / 32); E <= Math.floor(Math.max(w, T) / 32); E++) for (let C = Math.floor(Math.min(_, S) / 32); C <= Math.floor(Math.max(_, S) / 32); C++) {
      const M = c(C, E);
      m.has(M) || m.set(M, []);
      m.get(M).push(v);
    }
  }
  const A = (x, y) => {
      let _ = null;
      const w = lL + 20;
      for (let S = Math.floor((y - w) / 32); S <= Math.floor((y + w) / 32); S++) for (let T = Math.floor((x - w) / 32); T <= Math.floor((x + w) / 32); T++) for (const v of m.get(c(T, S)) ?? []) {
        const E = p[v],
          C = E.x1 - E.x0,
          M = E.z1 - E.z0,
          B = C * C + M * M || 1,
          R = Math.max(0, Math.min(1, ((x - E.x0) * C + (y - E.z0) * M) / B)),
          I = E.x0 + C * R,
          k = E.z0 + M * R,
          L = Math.hypot(I - x, k - y) - E.hw;
        (!_ || L < _.edge) && (_ = {
          edge: L,
          px: I,
          pz: k
        });
      }
      return _;
    },
    g = Array.from({
      length: Sf
    }, (x, y) => [Math.sin(y / Sf * Math.PI * 2), Math.cos(y / Sf * Math.PI * 2)]);
  function b(x, y, _, w) {
    const S = A(x, y);
    if (!S || S.edge < pue || S.edge > lL) return null;
    const T = u(x, y, nb + 2);
    let v = 1 / 0;
    for (const L of T) {
      const F = h(a[L], x, y);
      if (F < v && (v = F), v < mue) return null;
    }
    const E = g.map(([L, F]) => {
      let O = 1 / 0;
      for (const H of T) O = Math.min(O, f(a[H], x, y, L, F, nb));
      return O;
    });
    let C = 0,
      M = 0;
    for (let L = 0; L < Sf; L++) E[L] < nb && (C += 1 - E[L] / nb), L < Sf / 2 && E[L] < 9 && E[L + Sf / 2] < 9 && (M += 1);
    const B = S.px - x,
      R = S.pz - y,
      I = Math.hypot(B, R);
    for (const L of u((x + S.px) / 2, (y + S.pz) / 2, I / 2 + 2)) if (f(a[L], x, y, B / I, R / I, I) < I) return null;
    if (groundAt) {
      const L = groundAt(x, y);
      if (L === null || Math.abs(L - groundY) > .6) return null;
    }
    const k = M * 1.4 + C * .45 + Math.min(v, 3) * .3 - Math.hypot(x - _, y - w) / 22 - Math.max(0, S.edge - 10) * .06;
    return {
      x,
      z: y,
      score: k,
      pairs: M,
      clearance: v
    };
  }
  return anchors.map(([x, y]) => {
    const _ = b(x, y, x, y);
    if (_) return {
      x,
      z: y,
      score: _.score,
      pairs: _.pairs,
      fallback: false
    };
    const w = [];
    for (let T = -radius; T <= radius; T += step) for (let v = -radius; v <= radius; v += step) {
      if (v * v + T * T > radius * radius) continue;
      const E = b(x + v, y + T, x, y);
      E && w.push(E);
    }
    w.sort((T, v) => v.score - T.score);
    let S = w[0] ?? null;
    for (const T of w.slice(0, 6)) for (let v = -step; v <= step; v += step / 3) for (let E = -step; E <= step; E += step / 3) {
      const C = b(T.x + E, T.z + v, x, y);
      C && C.score > S.score && (S = C);
    }
    return S ? {
      x: S.x,
      z: S.z,
      score: S.score,
      pairs: S.pairs,
      fallback: false
    } : {
      x,
      z: y,
      score: -1 / 0,
      fallback: true
    };
  });
}
export const Aue = "/models/game/sigils.glb";
export const oB = i => `/models/game/sigils/${i}.svg`;
export const BS = .62;
export const yue = 1.55;
export const bue = 2.1;
export const xue = 1.4;
export const mg = 1.15;
export const cL = 2.3;
export const uL = 160;
export const dL = Fn(([i]) => {
  const e = mx_noise_float(i.mul(4.2)).mul(.5).add(.5),
    t = float(.5).sub(i.y);
  return clamp(mix(e, t, .42).mul(1.3).sub(.14), 0, 1);
});
export function _ue(i, e, t = Math.random) {
  const s = i.attributes.position,
    n = i.index,
    r = n ? n.count / 3 : s.count / 3,
    o = new Vector3(),
    a = new Vector3(),
    l = new Vector3(),
    c = new Float32Array(r);
  let u = 0;
  const d = (f, p) => n ? n.getX(f * 3 + p) : f * 3 + p;
  for (let f = 0; f < r; f++) o.fromBufferAttribute(s, d(f, 0)), a.fromBufferAttribute(s, d(f, 1)), l.fromBufferAttribute(s, d(f, 2)), u += a.sub(o).cross(l.sub(o)).length() * .5, c[f] = u;
  const h = new Float32Array(e * 3);
  for (let f = 0; f < e; f++) {
    const p = t() * u;
    let m = 0,
      A = r - 1;
    for (; m < A;) {
      const x = m + A >> 1;
      c[x] < p ? m = x + 1 : A = x;
    }
    o.fromBufferAttribute(s, d(m, 0));
    a.fromBufferAttribute(s, d(m, 1));
    l.fromBufferAttribute(s, d(m, 2));
    let g = t(),
      b = t();
    g + b > 1 && (g = 1 - g, b = 1 - b);
    h[f * 3] = o.x + (a.x - o.x) * g + (l.x - o.x) * b;
    h[f * 3 + 1] = o.y + (a.y - o.y) * g + (l.y - o.y) * b;
    h[f * 3 + 2] = o.z + (a.z - o.z) * g + (l.z - o.z) * b;
  }
  return h;
}
