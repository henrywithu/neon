// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export function kpe(i, {
  cell = 64
} = {}) {
  const t = i.nodes.length,
    s = Int32Array.from({
      length: t
    }, (f, p) => p),
    n = f => {
      for (; s[f] !== f;) s[f] = s[s[f]], f = s[f];
      return f;
    },
    r = i.roads.filter(f => f.type !== "runway" && f.points.length >= 2);
  for (const f of r) s[n(f.a)] = n(f.b);
  const o = new Map();
  for (const f of r) {
    const p = n(f.a);
    o.set(p, (o.get(p) ?? 0) + 1);
  }
  let a = -1,
    l = 0;
  for (const [f, p] of o) p > l && (l = p, a = f);
  const c = [],
    u = new Map(),
    d = (f, p) => f * 73856093 + p * 19349663;
  for (const f of r) if (n(f.a) === a) for (let p = 0; p < f.points.length - 1; p++) {
    const [m, A] = f.points[p],
      [g, b] = f.points[p + 1],
      x = c.length;
    c.push({
      x0: m,
      z0: A,
      x1: g,
      z1: b,
      width: f.width ?? 12
    });
    for (let y = Math.floor(Math.min(A, b) / cell); y <= Math.floor(Math.max(A, b) / cell); y++) for (let _ = Math.floor(Math.min(m, g) / cell); _ <= Math.floor(Math.max(m, g) / cell); _++) {
      const w = d(_, y);
      u.has(w) || u.set(w, []);
      u.get(w).push(x);
    }
  }
  function h(f, p, m = 8) {
    const A = Math.floor(f / cell),
      g = Math.floor(p / cell);
    let b = null;
    for (let x = 0; x <= m; x++) {
      for (let y = -x; y <= x; y++) for (let _ = -x; _ <= x; _++) if (Math.max(Math.abs(_), Math.abs(y)) === x) for (const w of u.get(d(A + _, g + y)) ?? []) {
        const S = c[w],
          T = S.x1 - S.x0,
          v = S.z1 - S.z0,
          E = T * T + v * v || 1,
          C = Math.max(0, Math.min(1, ((f - S.x0) * T + (p - S.z0) * v) / E)),
          M = S.x0 + T * C,
          B = S.z0 + v * C,
          R = Math.hypot(M - f, B - p);
        (!b || R < b.distance) && (b = {
          x: M,
          z: B,
          yaw: Math.atan2(T, v),
          width: S.width,
          distance: R
        });
      }
      if (b && b.distance < x * cell) break;
    }
    return b;
  }
  return {
    snap: h,
    segmentCount: c.length
  };
}
export const Ck = 64;
