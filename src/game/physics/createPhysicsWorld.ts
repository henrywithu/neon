// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { US } from "../../runtime/createCameraDirector.ts";
export let zS = null;
export function loadRapier() {
  zS || (zS = import("@dimforge/rapier3d-compat").then(async i => {
    const e = i.default ?? i;
    await e.init();
    return e;
  }));
  return zS;
}
export async function createPhysicsWorld({
  hz = 120,
  maxStepsPerFrame = 8,
  gravity = -9.81
} = {}) {
  const s = await loadRapier(),
    n = new s.World({
      x: 0,
      y: gravity,
      z: 0
    }),
    r = 1 / hz;
  n.timestep = r;
  n.numSolverIterations = 4;
  const o = new s.EventQueue(true),
    a = new Set(),
    l = new Map(),
    c = new Set();
  let u = 0,
    d = 0,
    h = 0;
  function f(S) {
    a.add(S);
  }
  function p(S) {
    for (const T of a) T.preStep === S.preStep && a.delete(T);
  }
  function m(S, T) {
    l.set(S.handle, US[T] ?? US.asphalt);
  }
  function A(S) {
    return l.get(S.handle) ?? US.asphalt;
  }
  function g(S) {
    c.add(S);
    return () => c.delete(S);
  }
  function b() {
    var S;
    for (const T of a) T.preStep(r);
    n.step(o);
    c.size ? o.drainContactForceEvents(T => {
      for (const v of c) v(T);
    }) : o.clear();
    for (const T of a) (S = T.postStep) == null || S.call(T, r);
    d += 1;
  }
  function x(S) {
    u += Math.min(S, .1);
    let T = 0;
    const v = performance.now();
    for (; u >= r && T < maxStepsPerFrame;) b(), u -= r, T += 1;
    T === maxStepsPerFrame && u >= r && (u = 0);
    h = performance.now() - v;
    return u / r;
  }
  function y({
    center: center,
    half: half,
    rotation = null,
    surface = "concrete",
    friction = .6
  }) {
    const M = s.RigidBodyDesc.fixed().setTranslation(center[0], center[1], center[2]);
    rotation && M.setRotation(rotation);
    const B = n.createRigidBody(M),
      R = n.createCollider(s.ColliderDesc.cuboid(half[0], half[1], half[2]).setFriction(friction), B);
    m(R, surface);
    return R;
  }
  function _({
    vertices: vertices,
    indices: indices,
    surface = "concrete",
    friction = .6
  }) {
    const C = n.createRigidBody(s.RigidBodyDesc.fixed()),
      M = n.createCollider(s.ColliderDesc.trimesh(vertices, indices).setFriction(friction), C);
    m(M, surface);
    return M;
  }
  function w({
    y: S = 0,
    size = 4e3,
    surface = "asphalt"
  } = {}) {
    return y({
      center: [0, S - .5, 0],
      half: [size / 2, .5, size / 2],
      surface: surface,
      friction: 1
    });
  }
  return {
    RAPIER: s,
    world: n,
    dt: r,
    hz: hz,
    eventQueue: o,
    update: x,
    stepOnce: b,
    addStepListener: f,
    removeStepListener: p,
    setSurface: m,
    getSurface: A,
    onContactForce: g,
    addStaticBox: y,
    addStaticTrimesh: _,
    addGroundPlane: w,
    get stepCount() {
      return d;
    },
    get lastStepMs() {
      return h;
    }
  };
}
