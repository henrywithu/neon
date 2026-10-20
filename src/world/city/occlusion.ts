// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { w3, qre, Ka, tS } from "./signLighting.ts";
export function createOcclusion({
  width = 256,
  height = 128,
  range = 260,
  cellSize = 64,
  shrink = 1,
  margin = 1,
  guard = 1.3,
  near = .5,
  minDistance = 18
} = {}) {
  const c = new Float32Array(width * height);
  let u = false,
    d = new Float32Array(0),
    h = 0,
    f = 0,
    p = 1,
    m = 1,
    A = [[]];
  function g(R) {
    d = new Float32Array(R.length * 8);
    h = 1 / 0;
    f = 1 / 0;
    let I = -1 / 0,
      k = -1 / 0;
    R.forEach(([L, F, O, H, W, P, z = 0], Y) => {
      const G = Math.min(shrink, W * .5);
      d.set([L, F - G / 2, O, Math.max(.05, H - shrink), Math.max(.05, W - G / 2), Math.max(.05, P - shrink), Math.cos(z), Math.sin(z)], Y * 8);
      h = Math.min(h, L);
      I = Math.max(I, L);
      f = Math.min(f, O);
      k = Math.max(k, O);
    });
    p = Math.max(1, Math.ceil((I - h + 1) / cellSize));
    m = Math.max(1, Math.ceil((k - f + 1) / cellSize));
    A = Array.from({
      length: p * m
    }, () => []);
    for (let L = 0; L < R.length; L++) {
      const F = Math.max(0, Math.min(p - 1, Math.floor((d[L * 8] - h) / cellSize))),
        O = Math.max(0, Math.min(m - 1, Math.floor((d[L * 8 + 2] - f) / cellSize)));
      A[O * p + F].push(L);
    }
    u = false;
  }
  const b = w3.elements,
    x = new Float32Array(24),
    y = new Float32Array(24),
    _ = new Float32Array(24),
    w = new Float32Array(24),
    S = {
      occluders: 0,
      tested: 0,
      occluded: 0,
      ms: 0
    };
  function T(R, I, k, L, F, O, H, W, P) {
    const z = (R / k * .5 + .5) * width,
      Y = (.5 - I / k * .5) * height,
      G = (L / O * .5 + .5) * width,
      X = (.5 - F / O * .5) * height,
      ae = (H / P * .5 + .5) * width,
      ne = (.5 - W / P * .5) * height,
      se = (G - z) * (ne - Y) - (ae - z) * (X - Y);
    if (Math.abs(se) < 1e-6) return;
    const re = 1 / k,
      le = 1 / O,
      we = 1 / P,
      Se = Math.max(0, Math.floor(Math.min(z, G, ae))),
      ye = Math.min(width - 1, Math.ceil(Math.max(z, G, ae))),
      U = Math.max(0, Math.floor(Math.min(Y, X, ne))),
      J = Math.min(height - 1, Math.ceil(Math.max(Y, X, ne))),
      Q = 1 / se;
    for (let j = U; j <= J; j++) {
      const de = j + .5;
      for (let K = Se; K <= ye; K++) {
        const V = K + .5,
          te = ((G - V) * (ne - de) - (ae - V) * (X - de)) * Q,
          fe = ((ae - V) * (Y - de) - (z - V) * (ne - de)) * Q,
          Ce = 1 - te - fe;
        if (te < 0 || fe < 0 || Ce < 0) continue;
        const Ue = 1 / (te * re + fe * le + Ce * we),
          Ae = j * width + K;
        Ue < c[Ae] && (c[Ae] = Ue);
      }
    }
  }
  function v(R) {
    let I = 0;
    for (const F of R) _[I * 3] = x[F * 3], _[I * 3 + 1] = x[F * 3 + 1], _[I * 3 + 2] = x[F * 3 + 2], I++;
    let k = _,
      L = true;
    for (let F = 0; F < I; F++) k[F * 3 + 2] < near && (L = false);
    if (!L) {
      let F = 0;
      for (let O = 0; O < I; O++) {
        const H = (O + 1) % I,
          W = k[O * 3 + 2],
          P = k[H * 3 + 2],
          z = W >= near;
        if (z && (w[F * 3] = k[O * 3], w[F * 3 + 1] = k[O * 3 + 1], w[F * 3 + 2] = W, F++), z !== P >= near) {
          const Y = (near - W) / (P - W);
          w[F * 3] = k[O * 3] + (k[H * 3] - k[O * 3]) * Y;
          w[F * 3 + 1] = k[O * 3 + 1] + (k[H * 3 + 1] - k[O * 3 + 1]) * Y;
          w[F * 3 + 2] = near;
          F++;
        }
      }
      if (F < 3) return;
      k = w;
      I = F;
    }
    for (let F = 1; F < I - 1; F++) T(k[0], k[1], k[2], k[F * 3], k[F * 3 + 1], k[F * 3 + 2], k[(F + 1) * 3], k[(F + 1) * 3 + 1], k[(F + 1) * 3 + 2]);
  }
  function E(R) {
    const I = R * 8,
      k = d[I],
      L = d[I + 1],
      F = d[I + 2],
      O = d[I + 3],
      H = d[I + 4],
      W = d[I + 5],
      P = d[I + 6],
      z = d[I + 7],
      Y = P * O,
      G = -z * O,
      X = z * W,
      ae = P * W;
    for (let ne = 0; ne < 8; ne++) {
      const se = ne & 1 ? 1 : -1,
        re = ne & 2 ? 1 : -1,
        le = ne & 4 ? 1 : -1,
        we = k + se * Y + le * X,
        Se = L + re * H,
        ye = F + se * G + le * ae;
      y[ne * 3] = we;
      y[ne * 3 + 1] = Se;
      y[ne * 3 + 2] = ye;
      x[ne * 3] = b[0] * we + b[4] * Se + b[8] * ye + b[12];
      x[ne * 3 + 1] = b[1] * we + b[5] * Se + b[9] * ye + b[13];
      x[ne * 3 + 2] = b[3] * we + b[7] * Se + b[11] * ye + b[15];
    }
    for (const [ne, se, re] of qre) {
      let le, we, Se;
      se === 0 ? (le = P * re, we = 0, Se = -z * re) : se === 1 ? (le = 0, we = re, Se = 0) : (le = z * re, we = 0, Se = P * re);
      const ye = ne[0] * 3;
      le * (y[ye] - Ka.x) + we * (y[ye + 1] - Ka.y) + Se * (y[ye + 2] - Ka.z) >= 0 || v(ne);
    }
  }
  function C(R) {
    const I = performance.now();
    R.updateMatrixWorld();
    Ka.setFromMatrixPosition(R.matrixWorld);
    tS.copy(R.projectionMatrix);
    const k = tS.elements;
    for (const P of [0, 4, 8, 12]) k[P] /= guard;
    for (const P of [1, 5, 9, 13]) k[P] /= guard;
    w3.multiplyMatrices(tS, R.matrixWorldInverse);
    c.fill(1 / 0);
    S.occluders = 0;
    const L = Math.max(0, Math.floor((Ka.x - range - h) / cellSize)),
      F = Math.min(p - 1, Math.floor((Ka.x + range - h) / cellSize)),
      O = Math.max(0, Math.floor((Ka.z - range - f) / cellSize)),
      H = Math.min(m - 1, Math.floor((Ka.z + range - f) / cellSize)),
      W = range * range;
    for (let P = O; P <= H; P++) for (let z = L; z <= F; z++) for (const Y of A[P * p + z]) {
      const G = d[Y * 8] - Ka.x,
        X = d[Y * 8 + 2] - Ka.z;
      if (G * G + X * X > W) continue;
      const ae = Y * 8,
        ne = b[3] * d[ae] + b[7] * d[ae + 1] + b[11] * d[ae + 2] + b[15],
        se = Math.hypot(d[ae + 3], d[ae + 4], d[ae + 5]);
      ne < -se || (E(Y), S.occluders++);
    }
    S.tested = 0;
    S.occluded = 0;
    u = true;
    S.ms = performance.now() - I;
  }
  function M(R, I) {
    if (!u || !B.enabled) return false;
    S.tested++;
    const k = I * 6;
    let L = 1 / 0,
      F = 1 / 0,
      O = -1 / 0,
      H = -1 / 0,
      W = 1 / 0;
    for (let X = 0; X < 8; X++) {
      const ae = X & 1 ? R[k + 3] + margin : R[k] - margin,
        ne = X & 2 ? R[k + 4] + margin : R[k + 1] - margin,
        se = X & 4 ? R[k + 5] + margin : R[k + 2] - margin,
        re = b[3] * ae + b[7] * ne + b[11] * se + b[15];
      if (re < minDistance) return false;
      const le = ((b[0] * ae + b[4] * ne + b[8] * se + b[12]) / re * .5 + .5) * width,
        we = (.5 - (b[1] * ae + b[5] * ne + b[9] * se + b[13]) / re * .5) * height;
      le < L && (L = le);
      le > O && (O = le);
      we < F && (F = we);
      we > H && (H = we);
      re < W && (W = re);
    }
    const P = Math.floor(L),
      z = Math.ceil(O),
      Y = Math.floor(F),
      G = Math.ceil(H);
    if (P < 0 || Y < 0 || z > width - 1 || G > height - 1) return false;
    for (let X = Y; X <= G; X++) {
      const ae = X * width;
      for (let ne = P; ne <= z; ne++) if (c[ae + ne] >= W) return false;
    }
    S.occluded++;
    return true;
  }
  const B = {
    enabled: true,
    setOccluders: g,
    render: C,
    occludedAabb: M,
    stats: S,
    get ready() {
      return u;
    },
    depth: c,
    width: width,
    height: height
  };
  return B;
}
export const e0 = "/maps/metro/";
export const T3 = 2;
export const Wre = Math.cos(2 * Math.PI / 180);
export const $re = 300;
