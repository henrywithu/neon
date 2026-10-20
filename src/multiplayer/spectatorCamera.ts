// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, MathUtils } from "three/webgpu";
import { Tge, Yk, Sge, xge, _ge, Uf, wge } from "./ghosts.ts";
export function vge({
  camera: camera
}) {
  const e = new Vector3(),
    t = new Vector3(),
    s = new Vector3(),
    n = new Vector3();
  let r = 0,
    o = 0;
  return {
    begin(a) {
      r = 0;
      o = a.yaw;
      const l = camera.position.x - a.x,
        c = camera.position.z - a.z,
        u = Math.hypot(l, c);
      u > Tge && camera.position.set(a.x + l / u * Yk, a.y + 18, a.z + c / u * Yk);
      camera.getWorldDirection(n);
      s.copy(camera.position).addScaledVector(n, 20);
    },
    update(a, l) {
      r += l;
      const c = Math.abs(a.speed);
      o += Sge(a.yaw - o) * (1 - Math.exp(-3 * l));
      const u = xge + Math.min(c * .07, 4.5),
        d = _ge + Math.min(c * .02, 1.2);
      e.set(a.x - Math.sin(o) * u, a.y + d, a.z - Math.cos(o) * u);
      const h = 1.4 + 3.6 * MathUtils.smoothstep(r, .2, 2);
      camera.position.x = Uf(camera.position.x, e.x, h, l);
      camera.position.y = Uf(camera.position.y, e.y, h, l);
      camera.position.z = Uf(camera.position.z, e.z, h, l);
      t.set(a.x, a.y + wge, a.z);
      s.x = Uf(s.x, t.x, h * 1.5, l);
      s.y = Uf(s.y, t.y, h * 1.5, l);
      s.z = Uf(s.z, t.z, h * 1.5, l);
      camera.up.set(0, 1, 0);
      camera.lookAt(s);
    }
  };
}
export const Xk = i => i >= 1e3 ? `${(i / 1e3).toFixed(1)} KM` : `${Math.round(i / 10) * 10} M`;
