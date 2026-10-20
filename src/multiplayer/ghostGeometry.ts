// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Matrix4, Vector3, BufferGeometry, BufferAttribute } from "three/webgpu";
export const Kf = Object.freeze({
  BODY: 0,
  WHEEL: 1,
  FLAME: 2,
  SMOKE: 3,
  BEAM: 4,
  LAMP: 5
});
export const Qk = 4096;
export function* rv(i, e, t, s, n = 8192) {
  const r = i.length / 3,
    o = 1 / s,
    a = new Map(),
    l = new Int32Array(r),
    c = new Float64Array(r * 3),
    u = new Float64Array(r * 3),
    d = new Uint32Array(r);
  let h = 0;
  for (let S = 0; S < r; S++) {
    const T = i[S * 3],
      v = i[S * 3 + 1],
      E = i[S * 3 + 2],
      C = ((Math.floor(T * o) + 2048) * Qk + (Math.floor(v * o) + 2048)) * Qk + (Math.floor(E * o) + 2048);
    let M = a.get(C);
    M === undefined && (M = h++, a.set(C, M));
    l[S] = M;
    c[M * 3] += T;
    c[M * 3 + 1] += v;
    c[M * 3 + 2] += E;
    u[M * 3] += e[S * 3];
    u[M * 3 + 1] += e[S * 3 + 1];
    u[M * 3 + 2] += e[S * 3 + 2];
    d[M]++;
    S % n === 0 && (yield);
  }
  const f = t.length / 3,
    p = new Uint32Array(t.length),
    m = h < 2e5,
    A = new Set();
  let g = 0;
  for (let S = 0; S < f; S++) {
    const T = l[t[S * 3]],
      v = l[t[S * 3 + 1]],
      E = l[t[S * 3 + 2]];
    if (!(T === v || v === E || T === E)) {
      if (m) {
        const C = Math.min(T, v, E),
          M = Math.max(T, v, E),
          B = T + v + E - C - M,
          R = (C * h + B) * h + M;
        if (A.has(R)) continue;
        A.add(R);
      }
      p[g++] = T;
      p[g++] = v;
      p[g++] = E;
      S % n === 0 && (yield);
    }
  }
  const b = new Int32Array(h).fill(-1);
  let x = 0;
  for (let S = 0; S < g; S++) b[p[S]] < 0 && (b[p[S]] = x++);
  const y = new Float32Array(x * 3),
    _ = new Float32Array(x * 3);
  for (let S = 0; S < h; S++) {
    const T = b[S];
    if (T < 0) continue;
    const v = 1 / d[S];
    y[T * 3] = c[S * 3] * v;
    y[T * 3 + 1] = c[S * 3 + 1] * v;
    y[T * 3 + 2] = c[S * 3 + 2] * v;
    const E = u[S * 3],
      C = u[S * 3 + 1],
      M = u[S * 3 + 2],
      B = Math.hypot(E, C, M) || 1;
    _[T * 3] = E / B;
    _[T * 3 + 1] = B > 1e-9 ? C / B : 1;
    _[T * 3 + 2] = M / B;
  }
  const w = new Uint32Array(g);
  for (let S = 0; S < g; S++) w[S] = b[p[S]];
  return {
    pos: y,
    nrm: _,
    idx: w
  };
}
export function fB(i) {
  return {
    pos: new Float32Array(i * 3),
    nrm: new Float32Array(i * 3),
    hub: new Float32Array(i * 3),
    info: new Float32Array(i * 4),
    idx: null
  };
}
export function qk({
  at: at,
  dir: dir,
  length: length,
  radius: radius,
  segments = 10,
  part: part,
  b: o = 0,
  c: a = 0,
  flare = false
}) {
  const c = Math.hypot(dir[0], dir[1], dir[2]) || 1,
    u = [dir[0] / c, dir[1] / c, dir[2] / c],
    d = Math.abs(u[1]) > .9 ? [1, 0, 0] : [0, 1, 0],
    h = [u[1] * d[2] - u[2] * d[1], u[2] * d[0] - u[0] * d[2], u[0] * d[1] - u[1] * d[0]],
    f = Math.hypot(h[0], h[1], h[2]) || 1;
  h[0] /= f;
  h[1] /= f;
  h[2] /= f;
  const p = [u[1] * h[2] - u[2] * h[1], u[2] * h[0] - u[0] * h[2], u[0] * h[1] - u[1] * h[0]],
    m = fB(segments + 1),
    A = (x, y, _, w) => {
      m.pos.set(y, x * 3);
      m.nrm.set(_, x * 3);
      m.hub.set(at, x * 3);
      m.info.set([part, w, o, a], x * 4);
    },
    g = flare ? length : 0;
  for (let x = 0; x < segments; x++) {
    const y = x / segments * Math.PI * 2,
      _ = [h[0] * Math.cos(y) + p[0] * Math.sin(y), h[1] * Math.cos(y) + p[1] * Math.sin(y), h[2] * Math.cos(y) + p[2] * Math.sin(y)];
    A(x, [at[0] + u[0] * g + _[0] * radius, at[1] + u[1] * g + _[1] * radius, at[2] + u[2] * g + _[2] * radius], _, flare ? 1 : 0);
  }
  const b = flare ? 0 : length;
  A(segments, [at[0] + u[0] * b, at[1] + u[1] * b, at[2] + u[2] * b], u, flare ? 0 : 1);
  m.idx = new Uint32Array(segments * 3);
  for (let x = 0; x < segments; x++) m.idx.set([x, (x + 1) % segments, segments], x * 3);
  return m;
}
export const Eo = (1 + Math.sqrt(5)) / 2;
export const Hk = [[-1, Eo, 0], [1, Eo, 0], [-1, -Eo, 0], [1, -Eo, 0], [0, -1, Eo], [0, 1, Eo], [0, -1, -Eo], [0, 1, -Eo], [Eo, 0, -1], [Eo, 0, 1], [-Eo, 0, -1], [-Eo, 0, 1]].map(([i, e, t]) => {
  const s = Math.hypot(i, e, t);
  return [i / s, e / s, t / s];
});
export const ige = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];
export function rge({
  at: at,
  radius: radius,
  a = 0,
  b = 0
}) {
  const n = fB(Hk.length);
  Hk.forEach((r, o) => {
    n.pos.set([at[0] + r[0] * radius, at[1] + r[1] * radius, at[2] + r[2] * radius], o * 3);
    n.nrm.set(r, o * 3);
    n.hub.set(at, o * 3);
    n.info.set([Kf.SMOKE, a, b, 0], o * 4);
  });
  n.idx = Uint32Array.from(ige);
  return n;
}
export function ov({
  pos: pos,
  nrm: nrm,
  idx: idx
}, {
  part: part,
  hub = [0, 0, 0],
  a: r = 0,
  b = 0,
  c: a = 0
}) {
  const l = pos.length / 3,
    c = fB(l);
  c.pos.set(pos);
  c.nrm.set(nrm);
  for (let u = 0; u < l; u++) c.hub.set(hub, u * 3), c.info.set([part, r, b, a], u * 4);
  c.idx = idx;
  return c;
}
export function oge(i) {
  let e = 0,
    t = 0;
  for (const o of i) e += o.pos.length / 3, t += o.idx.length;
  const s = {
    pos: new Float32Array(e * 3),
    nrm: new Float32Array(e * 3),
    hub: new Float32Array(e * 3),
    info: new Float32Array(e * 4),
    idx: new Uint32Array(t)
  };
  let n = 0,
    r = 0;
  for (const o of i) {
    const a = o.pos.length / 3;
    s.pos.set(o.pos, n * 3);
    s.nrm.set(o.nrm, n * 3);
    s.hub.set(o.hub, n * 3);
    s.info.set(o.info, n * 4);
    for (let l = 0; l < o.idx.length; l++) s.idx[r + l] = o.idx[l] + n;
    n += a;
    r += o.idx.length;
  }
  return s;
}
export function ZE(i) {
  let e = 1 / 0,
    t = -1 / 0,
    s = 1 / 0,
    n = -1 / 0,
    r = 1 / 0,
    o = -1 / 0;
  for (let a = 0; a < i.length; a += 3) i[a] < e && (e = i[a]), i[a] > t && (t = i[a]), i[a + 1] < s && (s = i[a + 1]), i[a + 1] > n && (n = i[a + 1]), i[a + 2] < r && (r = i[a + 2]), i[a + 2] > o && (o = i[a + 2]);
  return {
    minX: e,
    maxX: t,
    minY: s,
    maxY: n,
    minZ: r,
    maxZ: o
  };
}
export const sx = 8192;
export const age = 38e3;
export const Wk = 6;
export const av = new Matrix4();
export const kg = new Vector3();
export const Bb = new Vector3();
export function $k(i, e = null) {
  const t = [];
  i.traverse(s => {
    var n, r;
    if (!(!s.isMesh || !s.visible || !s.layers.isEnabled(0) || s.name === "car:proxy") && (r = (n = s.geometry) == null ? undefined : n.attributes) != null && r.position) {
      if (e) {
        for (let o = s.parent; o; o = o.parent) if (e.has(o)) return;
      }
      t.push(s);
    }
  });
  return t;
}
export function* lv(i, e) {
  let t = 0,
    s = 0;
  for (const c of i) {
    const u = c.geometry;
    t += u.attributes.position.count;
    s += u.index ? u.index.count : u.attributes.position.count;
  }
  const n = new Float32Array(t * 3),
    r = new Float32Array(t * 3),
    o = new Uint32Array(s);
  let a = 0,
    l = 0;
  for (const c of i) {
    const u = c.geometry,
      d = u.attributes.position,
      h = u.attributes.normal ?? null,
      f = e(c);
    for (let p = 0; p < d.count; p++) kg.fromBufferAttribute(d, p).applyMatrix4(f), n[(a + p) * 3] = kg.x, n[(a + p) * 3 + 1] = kg.y, n[(a + p) * 3 + 2] = kg.z, h ? (Bb.fromBufferAttribute(h, p).transformDirection(f), r[(a + p) * 3] = Bb.x, r[(a + p) * 3 + 1] = Bb.y, r[(a + p) * 3 + 2] = Bb.z) : r[(a + p) * 3 + 1] = 1, p % sx === 0 && (yield);
    if (u.index) {
      for (let p = 0; p < u.index.count; p++) o[l + p] = u.index.getX(p) + a;
      l += u.index.count;
    } else {
      for (let p = 0; p < d.count; p++) o[l + p] = a + p;
      l += d.count;
    }
    a += d.count;
    yield;
  }
  return {
    pos: n,
    nrm: r,
    idx: o
  };
}
export function* lge(i) {
  const {
    model: e,
    rig: t,
    wheels: s,
    def: n
  } = i;
  e.updateMatrixWorld(true);
  const r = e.parent ? new Matrix4().copy(e.parent.matrixWorld).invert() : new Matrix4(),
    o = new Set(Object.values(s)),
    a = L => {
      var O;
      const F = ((O = Array.isArray(L.material) ? L.material[0] : L.material) == null ? undefined : O.name) ?? "";
      return /taillight/i.test(F) ? "tail" : /headlight/i.test(F) ? "head" : null;
    },
    l = $k(e, o),
    c = l.filter(L => !a(L)),
    u = {
      tail: l.filter(L => a(L) === "tail"),
      head: l.filter(L => a(L) === "head")
    },
    d = yield* lv(c, L => av.multiplyMatrices(r, L.matrixWorld).clone()),
    h = ZE(d.pos),
    f = Math.max(h.maxX - h.minX, h.maxY - h.minY, h.maxZ - h.minZ),
    p = d.idx.length / 3,
    m = Math.min(.09, Math.max(.028, f / 110 * Math.sqrt(Math.max(1, p / (age * 6))))),
    A = yield* rv(d.pos, d.nrm, d.idx, m, sx),
    g = ZE(A.pos),
    b = [ov(A, {
      part: Kf.BODY
    })],
    x = {
      tail: false,
      head: false
    };
  for (const L of ["tail", "head"]) {
    if (!u[L].length) continue;
    const F = yield* lv(u[L], H => av.multiplyMatrices(r, H.matrixWorld).clone()),
      O = yield* rv(F.pos, F.nrm, F.idx, .02, sx);
    O.idx.length && (b.push(ov(O, {
      part: Kf.LAMP,
      a: L === "head" ? 1 : 0
    })), x[L] = true);
  }
  const y = {
      front: 0,
      rear: 0
    },
    _ = {
      front: 0,
      rear: 0
    },
    w = [],
    S = new Matrix4().multiplyMatrices(r, t ? i.rigNode.matrixWorld : new Matrix4());
  for (const L of t.wheels) {
    const F = s[L.id];
    if (!F) continue;
    const O = new Matrix4().copy(F.matrixWorld).invert(),
      H = new Matrix4().makeRotationZ(L.camber ?? 0).setPosition(L.position[0], L.position[1], L.position[2]);
    H.premultiply(S);
    const W = $k(F),
      P = yield* lv(W, X => new Matrix4().multiplyMatrices(H, av.multiplyMatrices(O, X.matrixWorld))),
      z = yield* rv(P.pos, P.nrm, P.idx, .026, sx),
      Y = kg.set(L.position[0], L.position[1], L.position[2]).applyMatrix4(S).toArray();
    b.push(ov(z, {
      part: Kf.WHEEL,
      hub: Y,
      a: L.front ? 1 : 0,
      b: L.left ? 1 : 0
    }));
    const G = L.front ? "front" : "rear";
    y[G] += L.radius ?? .36;
    _[G] += 1;
    w.push({
      front: !!L.front,
      left: !!L.left,
      x: Y[0],
      y: Y[1],
      z: Y[2]
    });
    yield;
  }
  const T = _.front ? y.front / _.front : .36,
    v = _.rear ? y.rear / _.rear : T;
  (((n == null ? undefined : n.tailpipes) ?? []).length ? n.tailpipes : [{
    x: .5,
    y: .45,
    z: g.minZ
  }, {
    x: -.5,
    y: .45,
    z: g.minZ
  }]).forEach((L, F) => b.push(qk({
    at: [L.x, L.y, L.z - .06],
    dir: [0, 0, -1],
    length: 2.9,
    radius: .2,
    segments: 8,
    part: Kf.FLAME,
    b: F
  })));
  const C = g.minY + (g.maxY - g.minY) * .36,
    M = Math.max(.35, (g.maxX - g.minX) * .5 * .55);
  for (const L of [1, -1]) b.push(qk({
    at: [L * M, C, g.maxZ - .15],
    dir: [L * .04, -.03, 1],
    length: 10,
    radius: 1.5,
    segments: 10,
    part: Kf.BEAM,
    b: L > 0 ? 1 : 0,
    flare: true
  }));
  for (const L of w.filter(F => !F.front)) for (let F = 0; F < Wk; F++) b.push(rge({
    at: [L.x, .1, L.z],
    radius: .32,
    a: F / Wk,
    b: L.x >= 0 ? 1 : -1
  }));
  const B = oge(b),
    R = new BufferGeometry();
  R.setAttribute("position", new BufferAttribute(B.pos, 3));
  R.setAttribute("normal", new BufferAttribute(B.nrm, 3));
  R.setAttribute("ghostHub", new BufferAttribute(B.hub, 3));
  R.setAttribute("ghostInfo", new BufferAttribute(B.info, 4));
  R.setIndex(new BufferAttribute(B.idx, 1));
  R.computeBoundingSphere();
  const I = w.filter(L => L.front),
    k = w.filter(L => !L.front);
  R.userData.ghost = {
    id: (n == null ? undefined : n.id) ?? "?",
    box: g,
    radiusFront: T,
    radiusRear: v,
    wheelbase: I.length && k.length ? I[0].z - k[0].z : 2.8,
    lamps: x,
    bodyTriangles: A.idx.length / 3,
    triangles: B.idx.length / 3
  };
  return R;
}
