// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { PG, DG, Ife, pk, Rfe, mk } from "../physics/dynamicProps.ts";
export function Lfe(i, e) {
  const t = [i[0]];
  let s = 0;
  for (let o = 0; o < i.length - 1; o++) {
    const [a, l] = i[o],
      [c, u] = i[o + 1],
      d = Math.hypot(c - a, u - l);
    let h = e - s;
    for (; h <= d;) t.push([a + (c - a) * h / d, l + (u - l) * h / d]), h += e;
    s = d - (h - e);
  }
  const n = i[i.length - 1],
    r = t[t.length - 1];
  Math.hypot(n[0] - r[0], n[1] - r[1]) > e * .25 && t.push(n);
  return t;
}
export function kfe(i, e = 2, t = 2) {
  const s = i.length;
  let n = new Float64Array(s),
    r = new Float64Array(s);
  for (let c = 0; c < s; c++) n[c] = i[c][0], r[c] = i[c][1];
  let o = n.slice(),
    a = r.slice();
  for (let c = 0; c < t; c++) {
    for (let u = 1; u < s - 1; u++) {
      const d = Math.min(e, u, s - 1 - u);
      let h = 0,
        f = 0;
      for (let p = u - d; p <= u + d; p++) h += n[p], f += r[p];
      o[u] = h / (2 * d + 1);
      a[u] = f / (2 * d + 1);
    }
    [n, o] = [o, n];
    [r, a] = [a, r];
  }
  const l = new Array(s);
  for (let c = 0; c < s; c++) l[c] = [n[c], r[c]];
  return l;
}
export function Ffe(i, e) {
  return i.map((t, s) => {
    const n = i[Math.max(0, s - 1)],
      r = i[Math.min(i.length - 1, s + 1)],
      o = r[0] - n[0],
      a = r[1] - n[1],
      l = Math.hypot(o, a) || 1;
    return [t[0] - a / l * e, t[1] + o / l * e];
  });
}
export function Dfe(i, e = .6) {
  const t = [i[0]];
  for (let n = 1; n < i.length - 1; n++) {
    const r = t[t.length - 1];
    Math.hypot(i[n][0] - r[0], i[n][1] - r[1]) >= e && t.push(i[n]);
  }
  const s = i[i.length - 1];
  t.length > 1 && Math.hypot(s[0] - t[t.length - 1][0], s[1] - t[t.length - 1][1]) < e && t.pop();
  t.push(s);
  return t;
}
export function Pfe(i, e, t) {
  const s = [0];
  for (let a = 1; a < i.length; a++) s.push(s[a - 1] + Math.hypot(i[a][0] - i[a - 1][0], i[a][1] - i[a - 1][1]));
  const n = s[s.length - 1];
  if (n - e - t < 4) return null;
  const r = a => {
      let l = 1;
      for (; l < s.length - 1 && s[l] < a;) l++;
      const c = (a - s[l - 1]) / (s[l] - s[l - 1] || 1);
      return [i[l - 1][0] + (i[l][0] - i[l - 1][0]) * c, i[l - 1][1] + (i[l][1] - i[l - 1][1]) * c];
    },
    o = [r(e)];
  for (let a = 0; a < i.length; a++) s[a] > e && s[a] < n - t && o.push(i[a]);
  o.push(r(n - t));
  return o;
}
export function gk(i, e) {
  for (let t = 0; t < i.length - 1; t++) {
    const [s, n] = i[t],
      [r, o] = i[t + 1],
      a = Math.hypot(r - s, o - n);
    if (e <= a || t === i.length - 2) {
      const l = a > 0 ? Math.min(1, Math.max(0, e / a)) : 0;
      return [s + (r - s) * l, n + (o - n) * l];
    }
    e -= a;
  }
  return i[0];
}
export function Ak(i, e, t) {
  const s = gk(i, e),
    n = gk(i, e + t),
    r = n[0] - s[0],
    o = n[1] - s[1],
    a = Math.hypot(r, o) || 1;
  return [r / a, o / a];
}
export function Ofe(i) {
  let e = 0;
  for (let t = 0; t < i.length - 1; t++) e += Math.hypot(i[t + 1][0] - i[t][0], i[t + 1][1] - i[t][1]);
  return e;
}
export function Ufe(i, e, t) {
  const s = i.length - 1,
    n = new Float64Array(s);
  let r = 0;
  for (let a = 0; a < s; a++) {
    const l = Math.atan2(i[a + 1] - i[a], e[a + 1] - e[a]);
    if (a === 0) {
      n[a] = l;
      continue;
    }
    let c = l - n[a - 1] % (2 * Math.PI);
    c -= 2 * Math.PI * Math.round(c / (2 * Math.PI));
    n[a] = n[a - 1] + c;
    r += Math.abs(c);
  }
  if (r <= PG) return r;
  let o = 0;
  for (let a = 0; a < s; a++) for (let l = a + 1; l < s && t[l] - t[a] < 25; l++) o = Math.max(o, Math.abs(n[l] - n[a]));
  return o;
}
export function zfe(i, e, t = 48) {
  const s = new Map(),
    n = (r, o) => (r + 32768) * 65536 + (o + 32768);
  for (const r of i) for (let o = 0; o < r.points.length - 1; o++) {
    const [a, l, c] = r.points[o],
      [u, d, h] = r.points[o + 1];
    if (Math.min(l, d) >= DG) continue;
    const f = {
      x0: a,
      z0: c,
      h0: l,
      x1: u,
      z1: h,
      h1: d,
      reach: r.width / 2 + e
    };
    for (let p = Math.floor((Math.min(c, h) - f.reach) / t); p <= Math.floor((Math.max(c, h) + f.reach) / t); p++) for (let m = Math.floor((Math.min(a, u) - f.reach) / t); m <= Math.floor((Math.max(a, u) + f.reach) / t); m++) {
      const A = n(m, p);
      s.has(A) || s.set(A, []);
      s.get(A).push(f);
    }
  }
  return (r, o) => {
    let a = null;
    const l = s.get(n(Math.floor(r / t), Math.floor(o / t)));
    if (!l) return null;
    for (const c of l) {
      const u = c.x1 - c.x0,
        d = c.z1 - c.z0,
        h = u * u + d * d || 1,
        f = Math.max(0, Math.min(1, ((r - c.x0) * u + (o - c.z0) * d) / h));
      if (Math.hypot(c.x0 + u * f - r, c.z0 + d * f - o) >= c.reach) continue;
      const p = c.h0 + (c.h1 - c.h0) * f;
      p > .04 && (a === null || p < a) && (a = p);
    }
    return a;
  };
}
export function Gfe(i, e, {
  highways = []
} = {}) {
  const s = e.map(() => 0),
    n = e.map(() => 0),
    r = i.map(A => {
      if (A.type === "runway" || A.points.length < 2 || A.a === A.b) return null;
      s[A.a] += 1;
      s[A.b] += 1;
      n[A.a] = Math.max(n[A.a], A.width);
      n[A.b] = Math.max(n[A.b], A.width);
      const g = kfe(Lfe(A.points, 3)),
        b = [...g].reverse();
      return {
        points: g,
        length: Ofe(g),
        outA: Ak(g, 0, 8),
        outB: Ak(b, 0, 8)
      };
    }),
    o = e.map(() => 1),
    a = e.map(() => []);
  i.forEach((A, g) => {
    r[g] && (a[A.a].push(r[g].outA), a[A.b].push(r[g].outB));
  });
  a.forEach((A, g) => {
    if (s[g] !== 2 || A.length !== 2) return;
    const b = Math.max(-1, Math.min(1, -(A[0][0] * A[1][0] + A[0][1] * A[1][1]))),
      x = Math.acos(b);
    o[g] = Math.min(12, Math.max(1, Ife * Math.tan(x / 2)));
  });
  const l = zfe(highways, 1.2),
    c = [],
    u = new Map();
  i.forEach((A, g) => {
    const b = r[g];
    if (!b) return;
    const x = Math.max(1.7, Math.min(A.width / 4, 4.5)),
      y = _ => Math.min(b.length * .3, s[_] > 2 ? n[_] / 2 + 3 : s[_] === 1 ? 2 : o[_]);
    for (const _ of [1, -1]) {
      const w = _ === 1 ? b.points : [...b.points].reverse(),
        S = _ === 1 ? A.a : A.b,
        T = _ === 1 ? A.b : A.a,
        v = Pfe(Ffe(w, x), y(S), y(T));
      if (!v) continue;
      const E = Dfe(v),
        C = new Float32Array(E.length),
        M = new Float32Array(E.length),
        B = new Float32Array(E.length);
      let R = false;
      for (let k = 0; k < E.length; k++) if (C[k] = E[k][0], M[k] = E[k][1], k && (B[k] = B[k - 1] + Math.hypot(C[k] - C[k - 1], M[k] - M[k - 1])), !R && highways.length) {
        const L = l(C[k], M[k]);
        R = L !== null && L < DG;
      }
      R || (R = Ufe(C, M, B) > PG);
      const I = {
        id: c.length,
        road: g,
        from: S,
        to: T,
        xs: C,
        zs: M,
        cum: B,
        length: B[B.length - 1],
        speed: pk[A.type] ?? pk.street,
        width: A.width,
        next: [],
        blocked: R,
        routable: !R
      };
      c.push(I);
      u.has(S) || u.set(S, []);
      u.get(S).push(I);
    }
  });
  const d = A => {
      for (; A > Math.PI;) A -= 2 * Math.PI;
      for (; A < -Math.PI;) A += 2 * Math.PI;
      return A;
    },
    h = (A, g) => {
      const b = A.xs.length;
      let x = g ? b - 1 : 0;
      const y = g ? -1 : 1;
      let _ = x;
      for (; _ + y >= 0 && _ + y < b && Math.abs(A.cum[_] - A.cum[x]) < 6;) _ += y;
      const [w, S] = g ? [_, x] : [x, _];
      return Math.atan2(A.xs[S] - A.xs[w], A.zs[S] - A.zs[w]);
    };
  for (const A of c) {
    const g = A.xs.length,
      b = h(A, true);
    for (const x of u.get(A.to) ?? []) {
      if (x.road === A.road) continue;
      const y = h(x, false),
        _ = d(y - b);
      if (Math.abs(_) > Rfe) continue;
      const w = x.xs[0] - A.xs[g - 1],
        S = x.zs[0] - A.zs[g - 1];
      if (Math.hypot(w, S) > .5) {
        const T = Math.atan2(w, S);
        if (Math.abs(d(T - b)) > mk || Math.abs(d(y - T)) > mk) continue;
      }
      A.next.push({
        lane: x,
        turn: _
      });
    }
  }
  const f = c.map(() => []),
    p = new Int32Array(c.length);
  for (const A of c) for (const g of A.next) f[g.lane.id].push(A), g.lane.routable && (p[A.id] += 1);
  const m = c.filter(A => A.routable && p[A.id] === 0);
  for (; m.length;) {
    const A = m.pop();
    if (A.routable) {
      A.routable = false;
      for (const g of f[A.id]) g.routable && --p[g.id] === 0 && m.push(g);
    }
  }
  for (const A of c) {
    let g = 0;
    for (let b = 1; b < A.xs.length - 1; b++) g += d(Math.atan2(A.xs[b + 1] - A.xs[b], A.zs[b + 1] - A.zs[b]) - Math.atan2(A.xs[b] - A.xs[b - 1], A.zs[b] - A.zs[b - 1]));
    A.bend = g;
  }
  return {
    lanes: c,
    out: u
  };
}
