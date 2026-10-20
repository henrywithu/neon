// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Mu, gl, rA } from "../city/instanceStorage.ts";
import { BoxGeometry, MeshBasicNodeMaterial, InstancedMesh, Matrix4, Quaternion, Vector3, BufferGeometry, BufferAttribute, Mesh } from "three/webgpu";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
export function lie(i) {
  i.traverse(e => {
    e.layers.set(Mu);
  });
}
export function cie(i, {
  name = "city:proxies"
} = {}) {
  const t = new BoxGeometry(1, 1, 1);
  t.deleteAttribute("uv");
  const s = new MeshBasicNodeMaterial({
    color: 0
  });
  s.name = name;
  const n = gl(new InstancedMesh(t, s, Math.max(1, i.length)));
  n.name = name;
  n.count = i.length;
  const r = new Matrix4(),
    o = new Quaternion(),
    a = new Vector3(),
    l = new Vector3(),
    c = new Vector3(0, 1, 0);
  i.forEach(([u, d, h, f, p, m, A = 0], g) => {
    o.setFromAxisAngle(c, A);
    a.set(u, d, h);
    l.set(f * 2, p * 2, m * 2);
    n.setMatrixAt(g, r.compose(a, o, l));
  });
  n.instanceMatrix.needsUpdate = true;
  n.computeBoundingSphere();
  n.layers.set(rA);
  n.castShadow = true;
  n.receiveShadow = false;
  n.matrixAutoUpdate = false;
  n.updateMatrixWorld(true);
  return {
    mesh: n,
    dispose() {
      n.removeFromParent();
      t.dispose();
      s.dispose();
    }
  };
}
export function uie(i, {
  anchor = i
} = {}) {
  i.updateMatrixWorld(true);
  const t = new Matrix4().copy(anchor.matrixWorld).invert(),
    s = new Matrix4(),
    n = [],
    r = [];
  i.traverse(c => {
    var p, m;
    const u = c.isMesh ? (m = (p = c.geometry) == null ? undefined : p.attributes) == null ? undefined : m.position : null;
    if (!u) return;
    n.push(c);
    const d = new Float32Array(u.count * 3);
    for (let A = 0; A < u.count; A++) d[A * 3] = u.getX(A), d[A * 3 + 1] = u.getY(A), d[A * 3 + 2] = u.getZ(A);
    const h = new BufferGeometry();
    h.setAttribute("position", new BufferAttribute(d, 3));
    const f = c.geometry.index;
    h.setIndex(f ? new BufferAttribute(Uint32Array.from(f.array), 1) : new BufferAttribute(Uint32Array.from({
      length: u.count
    }, (A, g) => g), 1));
    h.applyMatrix4(s.multiplyMatrices(t, c.matrixWorld));
    r.push(h);
  });
  const o = mergeGeometries(r);
  for (const c of r) c.dispose();
  o.computeBoundingSphere();
  const a = new MeshBasicNodeMaterial({
    color: 0
  });
  a.name = "car:proxy";
  const l = new Mesh(o, a);
  l.name = "car:proxy";
  l.castShadow = true;
  l.receiveShadow = false;
  l.layers.set(rA);
  anchor.add(l);
  for (const c of n) c.castShadow = false;
  return {
    proxy: l,
    meshes: n
  };
}
