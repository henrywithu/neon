// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { uniform, vec4, positionWorld, smoothstep, abs, max, float, vec3 } from "three/tsl";
import { Matrix4 } from "three/webgpu";
export function LG({
  root: root,
  materialsRoot = root,
  rearZ = -1.85,
  frontZ = 1.85
}) {
  const n = uniform(new Matrix4()),
    r = uniform(0),
    o = uniform(0);
  let a = 0;
  const l = n.mul(vec4(positionWorld, 1)).xyz,
    c = smoothstep(rearZ + .25, rearZ - .15, l.z),
    u = smoothstep(.42, .28, abs(l.x));
  materialsRoot.traverse(d => {
    if (d.isMesh) for (const h of Array.isArray(d.material) ? d.material : [d.material]) {
      if (!(h != null && h.emissiveNode) || h.userData.carLights) continue;
      const f = h.emissiveNode,
        p = smoothstep(.05, .3, max(f.r, max(f.g, f.b))),
        m = float(.6).add(r.mul(1.9)),
        A = float(1).add(c.mul(m.sub(1)));
      h.emissiveNode = f.mul(A).add(vec3(1, .96, .9).mul(o.mul(c).mul(u).mul(p).mul(3.5)));
      h.userData.carLights = true;
      h.needsUpdate = true;
      a += 1;
    }
  });
  return {
    materials: a,
    update({
      braking = 0,
      reversing = false
    } = {}) {
      root.updateMatrixWorld();
      n.value.copy(root.matrixWorld).invert();
      r.value += (Math.min(1, braking) - r.value) * .5;
      o.value = reversing ? 1 : 0;
    },
    setBrake(d) {
      r.value = d;
    }
  };
}
