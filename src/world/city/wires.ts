// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Group, Vector3, MeshStandardNodeMaterial, AdditiveBlending, BufferGeometry, Float32BufferAttribute, Mesh, Matrix4, Quaternion } from "three/webgpu";
import { XT } from "./props.ts";
import { attribute, vec3, float, sin, time, mix } from "three/tsl";
import { Mu } from "./instanceStorage.ts";
export const JT = .025;
export const b3 = 220;
export function createWires({
  wires = [],
  groundY: groundY
}) {
  const t = new Group();
  t.name = "city:wires";
  const s = wires.length / 7;
  if (!s) return {
    root: t,
    update() {},
    dispose() {}
  };
  const n = new Map(),
    r = new Vector3(),
    o = new Vector3(),
    a = new Vector3(),
    l = new Vector3(),
    c = new Vector3(),
    u = new Vector3(0, 1, 0);
  for (let m = 0; m < s; m++) {
    const A = m * 7;
    r.set(wires[A], groundY + wires[A + 1], wires[A + 2]);
    o.set(wires[A + 3], groundY + wires[A + 4], wires[A + 5]);
    const g = wires[A + 6],
      b = `${Math.floor((r.x + o.x) / 2 / b3)},${Math.floor((r.z + o.z) / 2 / b3)}`;
    n.has(b) || n.set(b, {
      positions: [],
      glow: []
    });
    const x = n.get(b);
    l.subVectors(o, r).normalize();
    c.crossVectors(l, u).normalize();
    const y = (m * 2654435761 >>> 0) % 7 === 0 ? 1 : 0,
      _ = [];
    for (let w = 0; w <= XT; w++) {
      const S = w / XT;
      a.lerpVectors(r, o, S);
      a.y -= 4 * g * S * (1 - S);
      _.push(a.clone());
    }
    for (const w of [c, u]) for (let S = 0; S < XT; S++) {
      const T = _[S],
        v = _[S + 1],
        E = [[T, -1], [T, 1], [v, -1], [v, -1], [T, 1], [v, 1]];
      for (const [C, M] of E) x.positions.push(C.x + w.x * JT * M, C.y + w.y * JT * M, C.z + w.z * JT * M), x.glow.push(y);
    }
  }
  const d = attribute("wireGlow", "float"),
    h = new MeshStandardNodeMaterial();
  h.name = "city-wires";
  h.side = AdditiveBlending;
  h.colorNode = vec3(.015, .015, .018);
  h.roughnessNode = float(.4);
  h.metalnessNode = float(.6);
  const f = sin(time.mul(1.3)).mul(.25).add(.75);
  h.emissiveNode = mix(vec3(0), vec3(1, .2, .75).mul(f), d);
  const p = [];
  for (const [, m] of n) {
    const A = new BufferGeometry();
    A.setAttribute("position", new Float32BufferAttribute(m.positions, 3));
    A.setAttribute("wireGlow", new Float32BufferAttribute(m.glow, 1));
    A.computeVertexNormals();
    A.computeBoundingSphere();
    const g = new Mesh(A, h);
    g.name = "city-wires-chunk";
    g.layers.set(Mu);
    g.matrixAutoUpdate = false;
    t.add(g);
    p.push(g);
  }
  return {
    root: t,
    count: s,
    update(m) {
      for (const A of p) {
        const g = A.geometry.boundingSphere.center;
        A.visible = (g.x - m.position.x) ** 2 + (g.z - m.position.z) ** 2 < 300 * 300;
      }
    },
    dispose() {
      t.removeFromParent();
      for (const m of p) m.geometry.dispose();
      h.dispose();
    }
  };
}
export const x3 = new Matrix4();
export const ZT = new Quaternion();
export const eS = new Vector3();
export const _3 = new Vector3();
