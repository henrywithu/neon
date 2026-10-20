// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { TextureLoader, Sphere, Vector3, SpriteNodeMaterial, Sprite, SRGBColorSpace } from "three/webgpu";
import { range, uniform, time, texture, rotateUV, mix, color, uv } from "three/tsl";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { iz } from "../weather/createCollisionHeight.ts";
export const _1 = 3;
export function ioe(i) {
  i.layers.disable(0);
  i.layers.enable(_1);
}
export function rz(i) {
  return new Promise((e, t) => {
    new TextureLoader().load(i, e, undefined, t);
  });
}
export function roe(i, e, t, s) {
  const n = Math.max(e.length(), t.length(), s);
  i.geometry.boundingSphere = new Sphere(new Vector3(0, n * .5, 0), n);
  i.frustumCulled = true;
}
export function S3({
  map: map,
  count: count,
  speed: speed,
  offsetMin: offsetMin,
  offsetMax: offsetMax,
  scaleMin: scaleMin,
  scaleMax: scaleMax,
  opacity: opacity,
  colorStart: colorStart,
  colorEnd: colorEnd,
  worldScale: worldScale
}) {
  const d = range(.1, 1),
    h = range(offsetMin, offsetMax),
    f = range(scaleMin, scaleMax),
    p = range(.1, 4),
    m = uniform(speed),
    A = uniform(opacity),
    g = time.add(5).mul(m),
    b = g.mul(d).mod(1),
    x = b.div(d),
    y = texture(map, rotateUV(uv(), g.mul(p))),
    w = y.a.mul(y.r.max(y.g).max(y.b)).mul(x.oneMinus()).mul(A),
    S = new SpriteNodeMaterial();
  S.colorNode = mix(color(colorStart), color(colorEnd), x.mul(.85));
  S.opacityNode = w;
  S.positionNode = h.mul(b);
  S.scaleNode = f.mul(b.max(.25));
  S.depthWrite = false;
  S.depthTest = true;
  S.alphaTest = .05;
  S.transparent = true;
  S.toneMapped = false;
  const T = new Sprite(S);
  T.scale.setScalar(worldScale);
  T.count = count;
  roe(T, offsetMin, offsetMax, worldScale);
  ioe(T);
  T.renderOrder = 5;
  return {
    mesh: T,
    material: S,
    speedUniform: m,
    opacityUniform: A
  };
}
export async function createSmoke({
  scene: scene,
  car: car,
  exhaust: exhaust,
  exhaustScale: exhaustScale,
  ambient = true
}) {
  if (!performanceProfile.smokeEnabled) return {
    params: null,
    dispose() {}
  };
  const r = await rz(iz);
  r.colorSpace = SRGBColorSpace;
  const o = [],
    a = performanceProfile.exhaustCount,
    l = performanceProfile.ambientCount,
    c = {
      exhaustOpacity: .4,
      exhaustScale: exhaustScale ?? 4,
      exhaustSpeed: .5,
      exhaust: a > 0 ? exhaust ?? [{
        x: .47,
        y: .52,
        z: -2.45
      }, {
        x: -.51,
        y: .55,
        z: -2.42
      }] : [],
      ambientOpacity: .4,
      ambientSpeed: .065,
      ambient: ambient ? [{
        x: -138.5,
        y: -5,
        z: 36.2,
        scale: 9.5
      }, {
        x: -119.5,
        y: -4.85,
        z: 16.8,
        scale: 15
      }, {
        x: -135.5,
        y: -5,
        z: 36,
        scale: 5
      }, {
        x: -106.2,
        y: -5,
        z: 18,
        scale: 9.8
      }] : []
    };
  for (let T = 0; T < c.exhaust.length; T += 1) {
    const v = c.exhaust[T],
      E = S3({
        map: r,
        count: a,
        speed: c.exhaustSpeed,
        offsetMin: new Vector3(-.08, .02, -.04),
        offsetMax: new Vector3(.08, .35, .04),
        scaleMin: .12,
        scaleMax: .42,
        opacity: c.exhaustOpacity,
        colorStart: 10131600,
        colorEnd: 4868165,
        worldScale: c.exhaustScale
      });
    E.mesh.position.set(v.x, v.y, v.z);
    E.mesh.name = `exhaust-smoke-${T + 1}`;
    car.add(E.mesh);
    o.push(E);
  }
  for (let T = 0; T < c.ambient.length; T += 1) {
    const v = c.ambient[T],
      E = S3({
        map: r,
        count: l,
        speed: c.ambientSpeed,
        offsetMin: new Vector3(-.7, 0, -.7),
        offsetMax: new Vector3(.7, 1.2, .7),
        scaleMin: .3,
        scaleMax: .9,
        opacity: c.ambientOpacity,
        colorStart: 9078917,
        colorEnd: 4539200,
        worldScale: v.scale
      });
    E.mesh.position.set(v.x, v.y, v.z);
    E.mesh.name = `ambient-smoke-${T + 1}`;
    scene.add(E.mesh);
    o.push(E);
  }
  const u = c.exhaust.length;
  function d(T) {
    const v = c.exhaust[T],
      E = o[T];
    !v || !E || E.mesh.position.set(v.x, v.y, v.z);
  }
  function h(T) {
    for (let v = 0; v < u; v += 1) {
      const E = T[v] ?? T[T.length - 1];
      E && (c.exhaust[v] = {
        x: E.x,
        y: E.y,
        z: E.z
      }, d(v));
    }
  }
  function f(T) {
    const v = c.ambient[T],
      E = o[u + T];
    !v || !E || E.mesh.position.set(v.x, v.y, v.z);
  }
  let p = 1;
  function m() {
    for (let T = 0; T < u; T += 1) o[T].opacityUniform.value = c.exhaustOpacity * p, o[T].opacityUniform.needsUpdate = true;
  }
  function A(T) {
    c.exhaustOpacity = T;
    m();
  }
  function g(T) {
    Math.abs(T - p) < .002 || (p = T, m());
  }
  function b(T) {
    c.ambientOpacity = T;
    for (let v = u; v < o.length; v += 1) o[v].opacityUniform.value = T, o[v].opacityUniform.needsUpdate = true;
  }
  function x(T) {
    c.exhaustScale = T;
    for (let v = 0; v < u; v += 1) o[v].mesh.scale.setScalar(T);
  }
  function y(T, v) {
    const E = c.ambient[T],
      C = o[u + T];
    !E || !C || (E.scale = v, C.mesh.scale.setScalar(v));
  }
  function _(T) {
    c.exhaustSpeed = T;
    for (let v = 0; v < u; v += 1) o[v].speedUniform.value = T, o[v].speedUniform.needsUpdate = true;
  }
  function w(T) {
    c.ambientSpeed = T;
    for (let v = u; v < o.length; v += 1) o[v].speedUniform.value = T, o[v].speedUniform.needsUpdate = true;
  }
  function S() {
    console.info("[smoke] Current config:", JSON.stringify(c, null, 2));
  }
  return {
    emitters: o,
    params: c,
    layer: _1,
    syncExhaustPosition: d,
    setExhaustPositions: h,
    syncAmbientPosition: f,
    setExhaustOpacity: A,
    setExhaustFade: g,
    setAmbientOpacity: b,
    setExhaustScale: x,
    setAmbientScale: y,
    setExhaustSpeed: _,
    setAmbientSpeed: w,
    logConfig: S,
    dispose() {
      for (const T of o) T.mesh.removeFromParent(), T.material.dispose();
      r.dispose();
    }
  };
}
