// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, FrontSide, MeshStandardNodeMaterial, Color, Vector2, MeshPhysicalNodeMaterial, MathUtils } from "three/webgpu";
import { surfaceRainNormal, createSurfaceRainUniforms } from "../../shaders/surfaceRain.ts";
import { texture, float, mix, normalMap, vec4, vec3, uv } from "three/tsl";
import { VU } from "../billboards/billboardMaterials.ts";
import { performanceProfile } from "../../platform/performanceProfile.ts";
export const GN = .01;
export const VN = new Vector3();
export const Yne = new Set(["77_5"]);
export const Xne = /^[a-z0-9]+_glass$/;
export const Jne = new Set(["mat_0.001"]);
export const ud = {
  color: [.02, .022, .026],
  roughness: .08,
  metalness: 0,
  envMapIntensity: .85,
  clearcoat: 1,
  clearcoatRoughness: .05,
  specularIntensity: 1
};
export function Zne(i) {
  return Yne.has(i == null ? undefined : i.name) || Xne.test((i == null ? undefined : i.name) ?? "");
}
export function eie(i) {
  i.transparent = false;
  i.opacity = 1;
  i.depthWrite = true;
  i.side = FrontSide;
  i.color.setRGB(...ud.color);
  i.roughness = ud.roughness;
  i.metalness = ud.metalness;
  i.envMapIntensity = ud.envMapIntensity;
  i.clearcoat = ud.clearcoat;
  i.clearcoatRoughness = ud.clearcoatRoughness;
  i.specularIntensity = ud.specularIntensity;
}
export function tie(i) {
  var n, r;
  if (!i || i.isMeshBasicMaterial || Jne.has(i.name) || i.transparent && (i.opacity ?? 1) < .6) return false;
  const e = i.metalness ?? 0;
  return (i.emissiveIntensity ?? 0) > .5 && (i.emissiveMap || ((r = (n = i.emissive) == null ? undefined : n.getHex) == null ? undefined : r.call(n)) > 0) && e < .15 ? false : e >= .15 || !!(i.roughnessMap || i.metalnessMap || i.normalMap);
}
export function sie(i, e, t) {
  if (Array.isArray(i.material)) {
    i.material[e] = t;
    return;
  }
  i.material = t;
}
export function nie(i) {
  if (i != null && i.isMeshStandardNodeMaterial && !i.isMeshPhysicalNodeMaterial) return i;
  const e = new MeshStandardNodeMaterial();
  e.name = i.name;
  e.color.copy(i.color ?? new Color(16777215));
  e.roughness = i.roughness ?? .5;
  e.metalness = i.metalness ?? 0;
  e.emissive.copy(i.emissive ?? new Color(0));
  e.emissiveIntensity = i.emissiveIntensity ?? 1;
  e.map = i.map ?? null;
  e.roughnessMap = i.roughnessMap ?? null;
  e.metalnessMap = i.metalnessMap ?? null;
  e.normalMap = i.normalMap ?? null;
  e.emissiveMap = i.emissiveMap ?? null;
  e.normalScale.copy(i.normalScale ?? new Vector2(1, 1));
  e.transparent = i.transparent ?? false;
  e.opacity = i.opacity ?? 1;
  e.side = i.side ?? FrontSide;
  e.depthWrite = i.depthWrite ?? true;
  e.alphaTest = i.alphaTest ?? 0;
  return e;
}
export function iie(i) {
  if (i != null && i.isMeshPhysicalNodeMaterial) return i;
  const e = new MeshPhysicalNodeMaterial();
  e.name = i.name;
  e.color.copy(i.color ?? new Color(16777215));
  e.roughness = i.roughness ?? .5;
  e.metalness = i.metalness ?? 0;
  e.emissive.copy(i.emissive ?? new Color(0));
  e.emissiveIntensity = i.emissiveIntensity ?? 1;
  e.map = i.map ?? null;
  e.roughnessMap = i.roughnessMap ?? null;
  e.metalnessMap = i.metalnessMap ?? null;
  e.normalMap = i.normalMap ?? null;
  e.emissiveMap = i.emissiveMap ?? null;
  e.normalScale.copy(i.normalScale ?? new Vector2(1, 1));
  e.transparent = false;
  e.opacity = 1;
  e.side = FrontSide;
  e.depthWrite = true;
  e.alphaTest = i.alphaTest ?? 0;
  return e;
}
export function attachSurfaceRain(i, e, {
  wetRoughness: wetRoughness,
  normalStrength: normalStrength,
  wetBrighten = null
}) {
  const r = uv(),
    o = surfaceRainNormal(uv(1), e),
    a = o.mask.mul(e.uIntensity),
    c = (i.roughnessMap ? texture(i.roughnessMap, r).g : float(1)).mul(float(i.roughness ?? .5)),
    d = (i.metalnessMap ? texture(i.metalnessMap, r).b : float(1)).mul(float(i.metalness ?? 0));
  i.roughnessNode = mix(c, wetRoughness, a);
  i.metalnessNode = d;
  const h = o.normalOffset.mul(normalStrength).mul(e.uIntensity);
  i.normalNode = normalMap(vec4(h.mul(.5).add(.5), float(1), float(1)));
  const f = float(i.opacity ?? 1);
  let p;
  if (i.map) p = texture(i.map, r);else {
    const m = i.color;
    p = vec4(float(m.r), float(m.g), float(m.b), f);
  }
  if (wetBrighten) {
    const m = vec3(float(.55), float(.6), float(.65));
    i.colorNode = vec4(mix(p.rgb, m, a.mul(wetBrighten)), p.a);
  } else i.colorNode = p;
  if (i.emissiveMap) i.emissiveNode = texture(i.emissiveMap, r).rgb.mul(float(i.emissiveIntensity ?? 1));else if ((i.emissiveIntensity ?? 0) > 0) {
    const m = i.emissive;
    i.emissiveNode = vec3(float(m.r), float(m.g), float(m.b)).mul(float(i.emissiveIntensity ?? 1));
  }
  i.needsUpdate = true;
}
export function applyCarSurfaceRain(i) {
  const e = createSurfaceRainUniforms(),
    t = new Set();
  let s = 0,
    n = 0;
  i.traverse(d => {
    d.isMesh && VU(d).forEach((h, f) => {
      const p = Zne(h);
      if (!p && !tie(h)) return;
      const m = p ? iie(h) : nie(h);
      p && eie(m);
      attachSurfaceRain(m, e, p ? {
        wetRoughness: e.uGlassWetRoughness,
        normalStrength: e.uGlassNormalStrength,
        wetBrighten: e.uGlassWetBrighten
      } : {
        wetRoughness: e.uWetRoughness,
        normalStrength: e.uNormalStrength
      });
      t.add(m);
      p ? n += 1 : s += 1;
      m !== h && sie(d, f, m);
    });
  });
  function r(d) {
    e.uTime.value += d;
    e.uTime.needsUpdate = true;
  }
  function o(d) {
    a(d ? 1 : 0);
  }
  function a(d) {
    Math.abs(e.uIntensity.value - d) <= GN || (e.uIntensity.value = d, e.uIntensity.needsUpdate = true);
  }
  function l({
    camera: camera,
    carRoot: carRoot,
    rainEnabled: rainEnabled
  }) {
    if (!camera || !carRoot || !performanceProfile.carSurfaceRain || !rainEnabled) return 0;
    carRoot.getWorldPosition(VN);
    const p = camera.position.distanceTo(VN),
      m = performanceProfile.carSurfaceRainFadeStart,
      A = Math.max(m + .001, performanceProfile.carSurfaceRainFadeEnd),
      g = MathUtils.clamp((p - m) / (A - m), 0, 1);
    return 1 - MathUtils.smoothstep(g, 0, 1);
  }
  function c({
    camera: camera,
    carRoot: carRoot,
    rainEnabled: rainEnabled
  }) {
    const p = l({
      camera: camera,
      carRoot: carRoot,
      rainEnabled: rainEnabled
    });
    a(p);
    return p > GN;
  }
  function u() {
    t.clear();
  }
  return {
    paintCount: s,
    glassCount: n,
    uniforms: e,
    update: r,
    setEnabled: o,
    setIntensity: a,
    syncProximity: c,
    dispose: u
  };
}
