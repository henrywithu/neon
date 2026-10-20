// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { loadSurfaceTexture } from "../loaders/surfaceTextures.ts";
import { uniform, positionWorld, texture, vec2, time, vec4, normalMap, vec3, Fn, fract, dot } from "three/tsl";
import { MeshStandardNodeMaterial, Mesh, PlaneGeometry } from "three/webgpu";
export const Vie = "/textures/wet-puddles-normal.jpg";
export function createWater({
  scene: scene,
  y = -7.2,
  size = 9e3
}) {
  const s = loadSurfaceTexture(Vie),
    n = uniform(.55),
    r = positionWorld.xz,
    o = texture(s, r.mul(.021).add(vec2(time.mul(.011), time.mul(.007)))),
    a = texture(s, r.mul(.047).sub(vec2(time.mul(.009), time.mul(-.013)))),
    l = o.add(a).mul(.5),
    c = new MeshStandardNodeMaterial();
  c.name = "harbor-water";
  c.colorNode = vec4(.004, .012, .018, 1);
  c.roughness = .06;
  c.metalness = 0;
  c.normalNode = normalMap(l, vec2(n));
  c.envMapIntensity = 1.6;
  const u = new Mesh(new PlaneGeometry(size, size), c);
  u.name = "harbor-water";
  u.rotation.x = -Math.PI / 2;
  u.position.y = y;
  u.receiveShadow = false;
  scene.add(u);
  return {
    mesh: u,
    y: y,
    update(d) {
      u.position.x = Math.round(d.position.x / 50) * 50;
      u.position.z = Math.round(d.position.z / 50) * 50;
      u.updateMatrixWorld();
    },
    dispose() {
      u.removeFromParent();
      u.geometry.dispose();
      c.dispose();
      s.dispose();
    }
  };
}
export const $f = 1;
export const qie = .1031;
export const Hie = vec3(.1031, .103, .0973);
export const Wie = ($f * 2 + 1) ** 2;
export const r3 = Fn(([i]) => {
  const e = fract(vec3(i.x, i.yx).mul(qie)),
    t = e.add(dot(e, e.yzx.add(19.19)));
  return fract(t.x.add(t.y).mul(t.z));
});
export const $ie = Fn(([i]) => {
  const e = fract(vec3(i.x, i.yx).mul(Hie)),
    t = e.add(dot(e, e.yzx.add(19.19)));
  return fract(t.xx.add(t.yz).mul(t.zy));
});
