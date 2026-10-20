// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { reference, renderGroup, Fn, vec2, fract, texture, ivec2, add, mix } from "three/tsl";
import { Scene, Color, DirectionalLight } from "three/webgpu";
export function createShadowFilter(i) {
  const e = reference("mapSize", "vec2", i).setGroup(renderGroup);
  return Fn(({
    depthTexture: depthTexture,
    shadowCoord: shadowCoord,
    depthLayer: depthLayer
  }) => {
    const r = vec2(1).div(e),
      o = shadowCoord.xy,
      a = fract(o.mul(e).add(.5)).toConst();
    o.subAssign(a.sub(.5).mul(r));
    const l = f => {
        let p = texture(depthTexture, o).offset(f).gather();
        depthTexture.isArrayTexture && (p = p.depth(depthLayer));
        return p.compare(shadowCoord.z);
      },
      c = l(ivec2(-1, 1)).toConst(),
      u = l(ivec2(1, 1)).toConst(),
      d = l(ivec2(-1, -1)).toConst(),
      h = l(ivec2(1, -1)).toConst();
    return add(mix(c.x, u.y, a.x).add(c.y).add(u.x).mul(a.y), mix(c.w, u.z, a.x).add(c.z).add(u.w), mix(d.x, h.y, a.x).add(d.y).add(h.x), mix(d.w, h.z, a.x).add(d.z).add(h.w).mul(a.y.oneMinus())).mul(1 / 9);
  });
}
export function freezeWorldMatrices(i) {
  i.traverse(e => {
    e.matrixAutoUpdate = false;
    e.updateMatrix();
  });
  i.updateMatrixWorld(true);
}
export function addStaticObject(i, e) {
  i.add(e);
  freezeWorldMatrices(e);
  return e.position.clone();
}
export function createScene() {
  const i = new Scene();
  i.background = new Color(525840);
  const e = 200,
    t = 150,
    s = new DirectionalLight("#cfefff", 10);
  s.position.set(23, 31, 3);
  s.target.position.set(0, 0, 0);
  s.castShadow = true;
  s.shadow.mapSize.set(4096, 4096);
  s.shadow.camera.near = 1;
  s.shadow.camera.far = t + e * 2;
  s.shadow.camera.left = -e;
  s.shadow.camera.right = e;
  s.shadow.camera.top = e;
  s.shadow.camera.bottom = -e;
  s.shadow.camera.updateProjectionMatrix();
  s.shadow.bias = -.001;
  s.shadow.normalBias = .009;
  s.shadow.intensity = 1.4;
  s.shadow.autoUpdate = false;
  s.shadow.filterNode = createShadowFilter(s.shadow);
  i.add(s);
  i.add(s.target);
  const n = new DirectionalLight("#ffd6c8", 1.5);
  n.position.set(-18, 22, -12);
  n.target.position.set(0, 0, 0);
  n.castShadow = false;
  i.add(n);
  i.add(n.target);
  const r = {
    intensity: s.intensity,
    shadowIntensity: s.shadow.intensity,
    color: `#${s.color.getHexString()}`,
    x: s.position.x,
    y: s.position.y,
    z: s.position.z
  };
  function o() {
    s.intensity = r.intensity;
    s.shadow.intensity = r.shadowIntensity;
    s.color.set(r.color);
    s.position.set(r.x, r.y, r.z);
    s.target.updateMatrixWorld();
  }
  o();
  return {
    scene: i,
    sunLight: s,
    fillLight: n,
    sunState: r,
    applySun: o
  };
} /**
  * @license
  * Copyright 2010-2026 Three.js Authors
  * SPDX-License-Identifier: MIT
  */
