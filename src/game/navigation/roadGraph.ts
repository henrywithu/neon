// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { yfe, bfe, bb } from "../../ui/map/cityMap.ts";
export function createRoadGraph(i, {
  cell = 64
} = {}) {
  const t = [],
    s = i.nodes.map(() => []);
  i.roads.forEach(g => {
    var _, w;
    if (g.type === "runway" || g.points.length < 2) return;
    const b = [0];
    for (let S = 1; S < g.points.length; S++) b.push(b[S - 1] + Math.hypot(g.points[S][0] - g.points[S - 1][0], g.points[S][1] - g.points[S - 1][1]));
    const x = {
        a: g.a,
        b: g.b,
        points: g.points,
        cum: b,
        length: b[b.length - 1],
        k: yfe[g.type] ?? 1,
        width: g.width ?? 12
      },
      y = t.length;
    t.push(x);
    (_ = s[g.a]) == null || _.push({
      road: y,
      to: g.b,
      dir: 0
    });
    (w = s[g.b]) == null || w.push({
      road: y,
      to: g.a,
      dir: 1
    });
  });
  const n = new Map(),
    r = (g, b) => g * 73856093 + b * 19349663;
  t.forEach((g, b) => {
    for (let x = 0; x < g.points.length - 1; x++) {
      const [y, _] = g.points[x],
        [w, S] = g.points[x + 1];
      for (let T = Math.floor(Math.min(_, S) / cell); T <= Math.floor(Math.max(_, S) / cell); T++) for (let v = Math.floor(Math.min(y, w) / cell); v <= Math.floor(Math.max(y, w) / cell); v++) {
        const E = r(v, T);
        n.has(E) || n.set(E, []);
        n.get(E).push(b, x);
      }
    }
  });
  function o(g, b) {
    const x = Math.floor(g / cell),
      y = Math.floor(b / cell);
    let _ = null;
    for (let w = 0; w <= 10; w++) {
      for (let S = -w; S <= w; S++) for (let T = -w; T <= w; T++) {
        if (Math.max(Math.abs(T), Math.abs(S)) !== w) continue;
        const v = n.get(r(x + T, y + S));
        if (v) for (let E = 0; E < v.length; E += 2) {
          const C = t[v[E]],
            M = v[E + 1],
            [B, R] = C.points[M],
            [I, k] = C.points[M + 1],
            L = I - B,
            F = k - R,
            O = L * L + F * F || 1,
            H = Math.max(0, Math.min(1, ((g - B) * L + (b - R) * F) / O)),
            W = B + L * H,
            P = R + F * H,
            z = Math.hypot(W - g, P - b);
          if (!_ || z < _.distance) {
            const Y = Math.sqrt(O);
            _ = {
              road: v[E],
              s: C.cum[M] + Y * H,
              x: W,
              z: P,
              distance: z,
              dx: L / Y,
              dz: F / Y,
              width: C.width
            };
          }
        }
      }
      if (_ && _.distance < w * cell) break;
    }
    return _;
  }
  function a(g, b, x) {
    const y = [],
      _ = w => {
        let S = 1;
        for (; S < g.cum.length - 1 && g.cum[S] < w;) S++;
        const T = (w - g.cum[S - 1]) / (g.cum[S] - g.cum[S - 1] || 1),
          [v, E] = g.points[S - 1],
          [C, M] = g.points[S];
        return [v + (C - v) * T, E + (M - E) * T];
      };
    if (y.push(_(b)), x > b) for (let w = 0; w < g.cum.length; w++) g.cum[w] > b && g.cum[w] < x && y.push(g.points[w]);else for (let w = g.cum.length - 1; w >= 0; w--) g.cum[w] < b && g.cum[w] > x && y.push(g.points[w]);
    y.push(_(x));
    return y;
  }
  const l = g => g & 1 ? t[g >> 1].a : t[g >> 1].b,
    c = t.length * 2,
    u = new Float64Array(c + 1),
    d = new Int32Array(c + 1),
    h = [];
  function f(g, b) {
    h.push([g, b]);
    let x = h.length - 1;
    for (; x > 0;) {
      const y = x - 1 >> 1;
      if (h[y][0] <= h[x][0]) break;
      [h[y], h[x]] = [h[x], h[y]];
      x = y;
    }
  }
  function p() {
    const g = h[0],
      b = h.pop();
    if (h.length) {
      h[0] = b;
      let x = 0;
      for (;;) {
        const y = x * 2 + 1,
          _ = y + 1;
        let w = x;
        if (y < h.length && h[y][0] < h[w][0] && (w = y), _ < h.length && h[_][0] < h[w][0] && (w = _), w === x) break;
        [h[w], h[x]] = [h[x], h[w]];
        x = w;
      }
    }
    return g;
  }
  const m = (g, b, x) => {
    b >= u[g] || (u[g] = b, d[g] = x, f(b, g));
  };
  function A(g, b, {
    heading: heading
  } = {}) {
    const y = o(g.x, g.z),
      _ = o(b.x, b.z);
    if (!y || !_) return null;
    const w = t[y.road],
      S = t[_.road];
    let T = 0;
    if (Number.isFinite(heading)) {
      const B = y.dx * Math.sin(heading) + y.dz * Math.cos(heading);
      Math.abs(B) > bfe && (T = Math.sign(B));
    }
    const v = B => T && B !== T ? bb : 0;
    u.fill(1 / 0);
    d.fill(-1);
    h.length = 0;
    m(y.road * 2, (w.length - y.s) * w.k + v(1), -1);
    m(y.road * 2 + 1, y.s * w.k + v(-1), -1);
    y.road === _.road && m(c, Math.abs(_.s - y.s) * w.k + v(Math.sign(_.s - y.s) || T), -2);
    let E = -1;
    for (; h.length;) {
      const [B, R] = p();
      if (B > u[R]) continue;
      if (R === c) break;
      const I = R >> 1,
        k = R & 1,
        L = l(R);
      if (L === S.a) {
        const F = B + _.s * S.k + (I === _.road && k === 1 ? bb : 0);
        F < u[c] && (E = L);
        m(c, F, R);
      }
      if (L === S.b) {
        const F = B + (S.length - _.s) * S.k + (I === _.road && k === 0 ? bb : 0);
        F < u[c] && (E = L);
        m(c, F, R);
      }
      for (const F of s[L]) {
        const O = F.road === I && F.dir !== k ? bb : 0;
        m(F.road * 2 + F.dir, B + t[F.road].length * t[F.road].k + O, R);
      }
    }
    if (!Number.isFinite(u[c])) return null;
    let C;
    if (d[c] === -2) C = [[g.x, g.z], ...a(w, y.s, _.s), [b.x, b.z]];else {
      const B = [];
      for (let I = d[c]; I >= 0; I = d[I]) B.push(I);
      B.reverse();
      const R = B[0];
      C = [[g.x, g.z], ...a(w, y.s, R & 1 ? 0 : w.length)];
      for (let I = 1; I < B.length; I++) {
        const k = t[B[I] >> 1];
        C.push(...(B[I] & 1 ? [...k.points].reverse() : k.points).slice(1));
      }
      C.push(...a(S, E === S.a ? 0 : S.length, _.s).slice(1), [b.x, b.z]);
    }
    let M = 0;
    for (let B = 1; B < C.length; B++) M += Math.hypot(C[B][0] - C[B - 1][0], C[B][1] - C[B - 1][1]);
    return {
      points: C,
      length: M
    };
  }
  return {
    route: A,
    snap: o
  };
}
