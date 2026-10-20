// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { jn, qc, Dl } from "../../ui/map/gpsHud.ts";
export function fk({
  physics: physics,
  props: props,
  groundY: groundY,
  radius = 70,
  retire = 120,
  vanishDistance = 30
}) {
  var I;
  const {
      RAPIER: o,
      world: a
    } = physics,
    {
      placements: l,
      assets: c,
      layer: u,
      physicsOf: d
    } = props,
    h = props.count,
    f = new Float32Array(h * 8),
    p = [];
  for (let k = 0; k < h; k++) {
    const L = l[k * 5 + 3];
    f.set([l[k * 5 + 1], groundY, l[k * 5 + 2], 0, Math.sin(L / 2), 0, Math.cos(L / 2), 0], k * 8);
    (I = d(k)) != null && I.mass && p.push(k);
  }
  const m = 48,
    A = new Map();
  for (const k of p) {
    const L = `${Math.floor(f[k * 8] / m)},${Math.floor(f[k * 8 + 2] / m)}`;
    A.has(L) || A.set(L, []);
    A.get(L).push(k);
  }
  const g = new Map(),
    b = new Set();
  let x = 0;
  const y = new Uint8Array(h),
    _ = new Float32Array(h),
    w = new Uint8Array(h),
    S = new Set();
  let T = 0,
    v = 0;
  function E(k) {
    var ne;
    const L = c[l[k * 5]],
      F = l[k * 5 + 4],
      O = L.height * F / 2;
    jn.set(f[k * 8 + 3], f[k * 8 + 4], f[k * 8 + 5], f[k * 8 + 6]);
    qc.set(0, O, 0).applyQuaternion(jn);
    const H = d(k),
      W = !!H.breakSpeed && !y[k],
      P = (W ? o.RigidBodyDesc.fixed() : o.RigidBodyDesc.dynamic()).setTranslation(f[k * 8] + qc.x, f[k * 8 + 1] + qc.y, f[k * 8 + 2] + qc.z).setRotation({
        x: jn.x,
        y: jn.y,
        z: jn.z,
        w: jn.w
      }).setLinearDamping(.15).setAngularDamping(.4).setSleeping(!W).setCanSleep(true),
      z = a.createRigidBody(P),
      Y = H.mass,
      G = Math.max(.05, H.half ? H.half[0] : L.width * F / 2),
      X = Math.max(.05, H.half ? H.half[1] : L.depth * F / 2),
      ae = a.createCollider(o.ColliderDesc.cuboid(G, Math.max(.05, O), X).setMass(Y).setFriction(.6).setRestitution(.15), z);
    (ne = physics.setSurface) == null || ne.call(physics, ae, "concrete");
    b.add(ae.handle);
    g.set(k, {
      body: z,
      halfH: O,
      fixed: W,
      collider: ae.handle
    });
  }
  function C(k) {
    const L = g.get(k);
    L && (b.delete(L.collider), a.removeRigidBody(L.body), g.delete(k));
  }
  function M(k) {
    const L = Math.floor((k.x - radius) / m),
      F = Math.floor((k.x + radius) / m),
      O = Math.floor((k.z - radius) / m),
      H = Math.floor((k.z + radius) / m),
      W = radius * radius;
    for (let z = O; z <= H; z++) for (let Y = L; Y <= F; Y++) for (const G of A.get(`${Y},${z}`) ?? []) {
      if (g.has(G) || w[G]) continue;
      const X = f[G * 8] - k.x,
        ae = f[G * 8 + 2] - k.z;
      X * X + ae * ae < W && E(G);
    }
    const P = retire * retire;
    for (const [z, {
      body: Y,
      fixed: G
    }] of g) {
      const X = f[z * 8] - k.x,
        ae = f[z * 8 + 2] - k.z;
      X * X + ae * ae > P && (G || Y.isSleeping()) && C(z);
    }
  }
  function B(k, L, F) {
    const O = Math.hypot(F.x, F.z);
    if (!O) return;
    const H = 3.2 + O * Math.max(k, 1 / 60) * 2;
    for (const [W, P] of g) {
      if (!P.fixed || O < d(W).breakSpeed) continue;
      const z = f[W * 8] - L.x,
        Y = f[W * 8 + 2] - L.z;
      z * z + Y * Y > H * H || (P.body.setBodyType(o.RigidBodyType.Dynamic, true), P.fixed = false);
    }
  }
  function R(k, L) {
    var O, H, W;
    T += k;
    x -= k;
    x <= 0 && (x = .25, M(L));
    for (const [P, {
      body: z,
      halfH: Y,
      fixed: G
    }] of g) {
      if (G || z.isSleeping()) continue;
      const X = z.translation(),
        ae = z.rotation();
      if (jn.set(ae.x, ae.y, ae.z, ae.w), qc.set(0, -Y, 0).applyQuaternion(jn), Dl.set(X.x + qc.x, X.y + qc.y, X.z + qc.z), f.set([Dl.x, Dl.y, Dl.z, jn.x, jn.y, jn.z, jn.w, 1], P * 8), !y[P]) {
        const ne = Dl.x - l[P * 5 + 1],
          se = Dl.z - l[P * 5 + 2],
          re = 1 - 2 * (jn.x * jn.x + jn.z * jn.z);
        (ne * ne + se * se > .36 || re < .9) && (y[P] = 1, _[P] = T, v += 1, (O = d(P)) != null && O.vanishAfter && S.add(P), (W = (H = d(P)) == null ? undefined : H.onKnock) == null || W.call(H, P));
      }
      u.setInstanceTransform(P, Dl, jn, l[P * 5 + 4]);
      X.y < groundY - 12 && C(P);
    }
    const F = vanishDistance * vanishDistance;
    for (const P of S) {
      if (T - _[P] < d(P).vanishAfter) continue;
      const z = f[P * 8] - L.x,
        Y = f[P * 8 + 2] - L.z;
      z * z + Y * Y < F || (C(P), S.delete(P), w[P] = 1, Dl.set(f[P * 8], f[P * 8 + 1], f[P * 8 + 2]), jn.set(f[P * 8 + 3], f[P * 8 + 4], f[P * 8 + 5], f[P * 8 + 6]), u.setInstanceTransform(P, Dl, jn, 0));
    }
  }
  return {
    beforeStep: B,
    update: R,
    owns: k => b.has(k),
    get activeCount() {
      return g.size;
    },
    get knocked() {
      return v;
    },
    get cleared() {
      let k = 0;
      for (let L = 0; L < h; L++) k += w[L];
      return k;
    },
    poseOf(k) {
      return {
        x: f[k * 8],
        y: f[k * 8 + 1],
        z: f[k * 8 + 2],
        moved: f[k * 8 + 7] === 1,
        active: g.has(k)
      };
    },
    dispose() {
      for (const k of [...g.keys()]) C(k);
    }
  };
}
export function Bfe({
  physics: physics,
  getBody: getBody,
  rate = 10,
  reach = 60,
  ceiling = 30,
  near = 45
}) {
  const {
      RAPIER: o,
      world: a
    } = physics,
    l = new o.Ray({
      x: 0,
      y: 0,
      z: 0
    }, {
      x: 0,
      y: 0,
      z: 0
    }),
    c = o.QueryFilterFlags.EXCLUDE_DYNAMIC | o.QueryFilterFlags.EXCLUDE_KINEMATIC,
    u = {
      left: 1 / 0,
      right: 1 / 0,
      up: 1 / 0,
      enclosure: 0
    },
    d = new Float32Array(8);
  let h = 0;
  function f(m, A, g, b, x, y, _, w) {
    l.origin.x = A;
    l.origin.y = g;
    l.origin.z = b;
    l.dir.x = x;
    l.dir.y = y;
    l.dir.z = _;
    const S = a.castRay(l, w, true, c, undefined, undefined, m);
    return S ? S.timeOfImpact : 1 / 0;
  }
  function p(m) {
    if (h -= m, h > 0) return null;
    h = 1 / rate;
    const A = getBody(),
      g = A.translation(),
      b = A.rotation(),
      x = 2 * (b.x * b.z + b.w * b.y),
      y = 1 - 2 * (b.x * b.x + b.y * b.y),
      _ = Math.atan2(x, y),
      w = g.y + 1;
    let S = 0;
    for (let v = 0; v < 8; v++) {
      const E = _ + v * Math.PI / 4;
      d[v] = f(A, g.x, w, g.z, Math.sin(E), 0, Math.cos(E), reach);
      d[v] < near && S++;
    }
    const T = (v, E, C) => Math.min(d[E], d[v] * Math.SQRT1_2, d[C] * Math.SQRT1_2);
    u.left = T(1, 2, 3);
    u.right = T(5, 6, 7);
    u.up = f(A, g.x, g.y + 1.2, g.z, 0, 1, 0, ceiling);
    u.enclosure = S / 8;
    return u;
  }
  return {
    state: u,
    update: p
  };
}
export const pk = {
  street: 38 / 3.6,
  avenue: 52 / 3.6,
  boulevard: 62 / 3.6
};
export const Rfe = 2.2;
export const mk = 1.75;
export const Ife = 18;
export const DG = 3.6;
export const PG = 2.45;
export const YE = 2.6;
export const Nfe = 25;
