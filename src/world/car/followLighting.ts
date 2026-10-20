// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, MeshStandardNodeMaterial, DirectionalLight } from "three/webgpu";
import { performanceProfile } from "../../platform/performanceProfile.ts";
import { rA } from "../city/instanceStorage.ts";
import { lights } from "three/tsl";
export const Gf = new Vector3();
export const kb = new Vector3();
export const pv = new Vector3();
export const A0e = new Vector3(0, 1, 0);
export const wd = new Vector3();
export const Vf = new Vector3();
export function createFollowShadow({
  renderer: renderer,
  light: light,
  sunState: sunState,
  camera: camera,
  extent = 90,
  distance = 220,
  lookAhead = .55,
  layerMask = 1,
  frameSkip = 1
}) {
  const c = light.shadow;
  c.camera.left = -extent;
  c.camera.right = extent;
  c.camera.top = extent;
  c.camera.bottom = -extent;
  c.camera.near = 1;
  c.camera.far = distance + 160;
  c.camera.updateProjectionMatrix();
  c.camera.layers.mask = layerMask;
  let u = 0;
  function d() {
    if (u += 1, u % Math.max(1, frameSkip) !== 0) return;
    camera.getWorldDirection(Vf);
    Vf.y = 0;
    Vf.lengthSq() < 1e-6 && Vf.set(0, 0, -1);
    Vf.normalize();
    wd.copy(camera.position).addScaledVector(Vf, extent * lookAhead);
    Gf.set(sunState.x, sunState.y, sunState.z).normalize();
    kb.crossVectors(A0e, Gf).normalize();
    pv.crossVectors(Gf, kb);
    const h = 2 * extent / c.mapSize.x,
      f = Math.round(wd.dot(kb) / h) * h,
      p = Math.round(wd.dot(pv) / h) * h,
      m = wd.dot(Gf);
    wd.set(0, 0, 0).addScaledVector(kb, f).addScaledVector(pv, p).addScaledVector(Gf, m);
    light.target.position.copy(wd);
    light.position.copy(wd).addScaledVector(Gf, distance);
    light.updateMatrixWorld();
    light.target.updateMatrixWorld();
    c.needsUpdate = true;
    renderer.shadowMap.needsUpdate = true;
  }
  return {
    update: d,
    extent: extent
  };
}
export const dF = 3.2;
export const hF = .6;
export function b0e(i) {
  const e = new MeshStandardNodeMaterial();
  for (const t of ["name", "color", "map", "emissive", "emissiveIntensity", "emissiveMap", "roughness", "roughnessMap", "metalness", "metalnessMap", "normalMap", "normalScale", "aoMap", "aoMapIntensity", "alphaMap", "envMapIntensity", "transparent", "opacity", "side", "alphaTest", "depthWrite", "vertexColors"]) {
    const s = i[t];
    s !== undefined && (s != null && s.isColor || s != null && s.isVector2 ? e[t].copy(s) : e[t] = s);
  }
  return e;
}
export function createMetroLighting({
  sceneResult: sceneResult,
  renderer: renderer,
  camera: camera,
  car: car,
  syncLighting: syncLighting
}) {
  const {
      sunLight: r,
      fillLight: o,
      sunState: a
    } = sceneResult,
    l = a.intensity;
  a.intensity = dF;
  syncLighting();
  o.intensity = hF;
  r.shadow.mapSize.set(performanceProfile.followShadowMapSize, performanceProfile.followShadowMapSize);
  r.shadow.bias = -5e-4;
  r.shadow.normalBias = .03;
  const c = createFollowShadow({
      renderer: renderer,
      light: r,
      sunState: a,
      camera: camera,
      extent: performanceProfile.followShadowExtent,
      frameSkip: performanceProfile.followShadowFrameSkip,
      layerMask: 1 | 1 << rA
    }),
    u = new DirectionalLight(r.color, Math.max(0, l - dF));
  u.name = "car-hero-key";
  const d = new DirectionalLight(o.color, 1.5 - hF);
  d.name = "car-hero-fill";
  const h = () => {
    u.position.set(a.x, a.y, a.z);
    d.position.copy(o.position).sub(o.target.position);
    for (const m of [u, d]) m.target.position.set(0, 0, 0), m.updateMatrixWorld(), m.target.updateMatrixWorld();
  };
  h();
  const f = lights([r, o, u, d]);
  function p(m) {
    m.traverse(A => {
      if (!A.isMesh) return;
      const b = (Array.isArray(A.material) ? A.material : [A.material]).map(x => {
        if (!(x != null && x.isNodeMaterial ? x.lights === true : x == null ? undefined : x.isMeshStandardMaterial)) return x;
        const _ = x.isNodeMaterial ? x : b0e(x);
        _.lightsNode = f;
        _.needsUpdate = true;
        return _;
      });
      A.material = Array.isArray(A.material) ? b : b[0];
    });
  }
  car && p(car);
  return {
    followShadow: c,
    key: u,
    carFill: d,
    syncKeys: h,
    lightCar: p
  };
}
