// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { createGltfLoaders } from "../loaders/createGltfLoaders.ts";
import { Vector3, LineCurve3, CatmullRomCurve3, BufferGeometry, Box3, Group, Line, LineBasicMaterial } from "three/webgpu";
import { performanceProfile } from "../../platform/performanceProfile.ts";
export const aoe = "/models/plane.glb";
export async function loe(i) {
  return (await createGltfLoaders(i).loadAsync(aoe)).scene;
}
export const v3 = 200;
export const coe = .1;
export const bE = 30;
export const uoe = [{
  curvePoints: [[-250, 17, 94.5], [-178.5, 17, 37.5], [-133.5, 17, 30.5], [17.5, 30.5, 25.5], [221.5, 40, 94.5]],
  speed: 1,
  scale: 1,
  startOffset: 0,
  direction: 1,
  yawOffset: .098407346410207,
  loopDelay: bE
}, {
  curvePoints: [[204, 60, -25], [115.5, 60, 39], [-22, 60, -4], [-152, 60, 39], [11.5, 60, 120], [50, 60, -19]],
  speed: 1,
  scale: 1,
  startOffset: .4,
  direction: 1,
  yawOffset: .078407346410207,
  loopDelay: bE
}];
export function doe(i) {
  return {
    curvePoints: i.curvePoints.map(e => [...e]),
    speed: i.speed ?? 1,
    scale: i.scale ?? 1,
    startOffset: i.startOffset ?? 0,
    direction: i.direction ?? 1,
    yawOffset: i.yawOffset ?? 0,
    loopDelay: i.loopDelay ?? bE
  };
}
export function E3(i) {
  if (!i || i.length < 2) return null;
  const e = i.map(([t, s, n]) => new Vector3(t, s, n));
  return i.length === 2 ? new LineCurve3(e[0], e[1]) : new CatmullRomCurve3(e, false, "catmullrom", .5);
}
export function M3(i, e) {
  const t = i.getPoints(e);
  return new BufferGeometry().setFromPoints(t);
}
export function hoe(i) {
  i.traverse(e => {
    e.isMesh && (e.castShadow = true, e.receiveShadow = true);
  });
}
export function foe(i) {
  i.updateWorldMatrix(true, true);
  const t = new Box3().setFromObject(i).getCenter(new Vector3());
  i.position.sub(t);
}
export function poe(i, e, t, s, n) {
  t.lengthSq() <= 1e-10 || (n.copy(e).add(t), i.lookAt(n), s && i.rotateY(s));
}
export async function createFlyingPlanes({
  scene: scene,
  renderer: renderer,
  paths = uoe,
  debugPath = false
} = {}) {
  var S;
  if (!performanceProfile.planeEnabled) return {
    params: null,
    update() {},
    dispose() {}
  };
  const n = await loe(renderer);
  foe(n);
  const r = new Group();
  r.name = "flying-planes";
  scene.add(r);
  const o = new Group();
  o.name = "flying-planes-debug";
  r.add(o);
  const a = {
      enabled: true,
      debugPath: debugPath,
      debugPathColor: "#00ffff",
      speedMultiplier: 1,
      paths: paths.map(doe)
    },
    l = [],
    c = new Vector3(),
    u = new Vector3(),
    d = new Vector3();
  function h(T) {
    const v = M3(T, v3),
      E = new Line(v, new LineBasicMaterial({
        color: a.debugPathColor
      }));
    E.visible = a.debugPath;
    o.add(E);
    return {
      line: E,
      geometry: v
    };
  }
  function f(T) {
    var B;
    const v = l[T],
      E = a.paths[T];
    if (!v || !E || (v.curve = E3(E.curvePoints), !v.curve)) return;
    if (v.debugLine) {
      (B = v.debugGeometry) == null || B.dispose();
      v.debugGeometry = M3(v.curve, v3);
      v.debugLine.geometry = v.debugGeometry;
      return;
    }
    const {
      line: C,
      geometry: M
    } = h(v.curve);
    v.debugLine = C;
    v.debugGeometry = M;
    m();
  }
  function p(T) {
    const v = l[T],
      E = a.paths[T];
    !v || !E || v.mesh.scale.setScalar(E.scale);
  }
  function m() {
    o.visible = a.enabled && a.debugPath;
    for (const T of l) T.debugLine && (T.debugLine.visible = a.enabled && a.debugPath);
  }
  for (let T = 0; T < a.paths.length; T += 1) {
    const v = a.paths[T],
      E = new Group();
    E.name = `plane-anchor-${T + 1}`;
    const C = n.clone(true);
    C.name = `plane-${T + 1}`;
    hoe(C);
    C.scale.setScalar(v.scale);
    E.add(C);
    r.add(E);
    const M = E3(v.curvePoints),
      B = M ? h(M) : {
        line: null,
        geometry: null
      };
    l.push({
      anchor: E,
      mesh: C,
      curve: M,
      debugLine: B.line,
      debugGeometry: B.geometry,
      progress: v.startOffset,
      waitRemaining: 0
    });
  }
  function A(T) {
    if (!a.enabled) {
      r.visible = false;
      return;
    }
    r.visible = true;
    m();
    for (let v = 0; v < l.length; v += 1) {
      const E = l[v],
        C = a.paths[v],
        {
          curve: M,
          anchor: B
        } = E;
      if (!M || !C) {
        B.visible = false;
        continue;
      }
      if (E.waitRemaining > 0) {
        E.waitRemaining -= T;
        B.visible = false;
        continue;
      }
      B.visible = true;
      const R = C.direction >= 0 ? 1 : -1;
      if (E.progress += T * C.speed * a.speedMultiplier * coe * R, E.progress > 1) {
        E.progress = 0;
        E.waitRemaining = C.loopDelay;
        B.visible = false;
        continue;
      }
      if (E.progress < 0) {
        E.progress = 1;
        E.waitRemaining = C.loopDelay;
        B.visible = false;
        continue;
      }
      M.getPointAt(E.progress, c);
      B.position.copy(c);
      M.getTangentAt(E.progress, u);
      u.multiplyScalar(R);
      poe(B, c, u, C.yawOffset, d);
    }
  }
  function g(T) {
    a.enabled = !!T;
  }
  function b(T) {
    a.speedMultiplier = T;
  }
  function x(T) {
    a.debugPath = !!T;
    m();
  }
  function y(T) {
    var v;
    a.debugPathColor = T;
    for (const E of l) (v = E.debugLine) != null && v.material && E.debugLine.material.color.set(T);
  }
  function _(T, v) {
    f(T);
  }
  function w() {
    console.info("[planes] Current config:", JSON.stringify(a, null, 2));
  }
  return {
    group: r,
    primaryAnchor: ((S = l[0]) == null ? undefined : S.anchor) ?? null,
    params: a,
    update: A,
    setEnabled: g,
    setSpeedMultiplier: b,
    setDebugPath: x,
    setDebugPathColor: y,
    syncPathCurve: f,
    syncPathPoint: _,
    syncPlaneScale: p,
    logConfig: w,
    dispose() {
      var T, v, E, C;
      for (const M of l) M.anchor.removeFromParent(), (T = M.debugGeometry) == null || T.dispose(), (E = (v = M.debugLine) == null ? undefined : v.material) == null || E.dispose(), (C = M.debugLine) == null || C.removeFromParent();
      r.removeFromParent();
    }
  };
}
export const goe = "/custom_noise.webp";
