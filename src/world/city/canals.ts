// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { BufferGeometry, Float32BufferAttribute, MeshStandardNodeMaterial, Mesh } from "three/webgpu";
import { attribute, smoothstep, sin, positionWorld, mix, vec3, float } from "three/tsl";
export const Mre = .18;
export const f3 = .7;
export function createCanals({
  lines = [],
  groundY: groundY,
  waterY: waterY
}) {
  const s = [],
    n = [],
    r = [],
    o = [],
    a = groundY + Mre,
    l = waterY - 3.5;
  for (const m of lines) {
    if (m.length < 2) continue;
    const A = m.map(([g, b], x) => {
      const y = m[Math.max(0, x - 1)],
        _ = m[Math.min(m.length - 1, x + 1)],
        w = _[0] - y[0],
        S = _[1] - y[1],
        T = Math.hypot(w, S) || 1;
      return {
        x: g,
        z: b,
        nx: -S / T,
        nz: w / T
      };
    });
    for (const g of ["cap", "face"]) {
      const b = s.length / 3;
      for (const x of A) g === "cap" ? (s.push(x.x - x.nx * f3, a, x.z - x.nz * f3, x.x, a, x.z), n.push(0, 1, 0, 0, 1, 0), r.push(a, a)) : (s.push(x.x, a, x.z, x.x, l, x.z), n.push(x.nx, 0, x.nz, x.nx, 0, x.nz), r.push(a, l));
      for (let x = 0; x < A.length - 1; x++) {
        const y = b + x * 2;
        g === "cap" ? o.push(y, y + 1, y + 2, y + 1, y + 3, y + 2) : o.push(y, y + 1, y + 2, y + 2, y + 1, y + 3);
      }
    }
  }
  const c = new BufferGeometry();
  c.setAttribute("position", new Float32BufferAttribute(s, 3));
  c.setAttribute("normal", new Float32BufferAttribute(n, 3));
  c.setAttribute("wallY", new Float32BufferAttribute(r, 1));
  c.setIndex(o);
  c.computeBoundingSphere();
  const u = attribute("wallY", "float"),
    d = smoothstep(waterY + .9, waterY - .2, u),
    h = sin(positionWorld.x.add(positionWorld.z).mul(1.7)).mul(.5).add(.5),
    f = new MeshStandardNodeMaterial();
  f.name = "seawall";
  f.colorNode = mix(vec3(.05, .05, .055).mul(h.mul(.2).add(.9)), vec3(.012, .02, .016), d);
  f.roughnessNode = mix(float(.75), float(.25), d);
  f.metalnessNode = float(0);
  const p = new Mesh(c, f);
  p.name = "city:seawalls";
  p.receiveShadow = true;
  p.castShadow = false;
  p.matrixAutoUpdate = false;
  p.updateMatrix();
  return {
    mesh: p,
    dispose() {
      p.removeFromParent();
      c.dispose();
      f.dispose();
    }
  };
}
