// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, BufferGeometry, BufferAttribute, MeshStandardNodeMaterial, Mesh } from "three/webgpu";
import { uniform, attribute, vec3, float, smoothstep } from "three/tsl";
export const Qc = 4e3;
export const xfe = 45;
export const lk = 75;
export const ck = new Vector3();
export const bd = new Vector3();
export const WS = new Vector3();
export const Yr = new Vector3();
export function createSkidMarks({
  scene: scene,
  threshold = .18,
  lift = .015,
  layer = null
}) {
  const n = new Float32Array(Qc * 4 * 3),
    r = new Float32Array(Qc * 4 * 3),
    o = new Float32Array(Qc * 4),
    a = new Float32Array(Qc * 4).fill(-1e6),
    l = new Uint32Array(Qc * 6);
  for (let v = 0; v < Qc; v++) {
    const E = v * 4;
    l.set([E, E + 1, E + 2, E + 2, E + 1, E + 3], v * 6);
  }
  const c = new BufferGeometry(),
    u = new BufferAttribute(n, 3),
    d = new BufferAttribute(r, 3),
    h = new BufferAttribute(o, 1),
    f = new BufferAttribute(a, 1);
  c.setAttribute("position", u);
  c.setAttribute("normal", d);
  c.setAttribute("skidAlpha", h);
  c.setAttribute("skidBirth", f);
  c.setIndex(new BufferAttribute(l, 1));
  c.setDrawRange(0, 0);
  const p = uniform(0),
    m = p.sub(attribute("skidBirth", "float")),
    A = new MeshStandardNodeMaterial();
  A.name = "skid-marks";
  A.colorNode = vec3(.05, .048, .047);
  A.roughnessNode = float(.92);
  A.metalnessNode = float(0);
  A.opacityNode = attribute("skidAlpha", "float").mul(smoothstep(lk, xfe, m)).mul(.7);
  A.transparent = true;
  A.depthWrite = false;
  A.polygonOffset = true;
  A.polygonOffsetFactor = -2;
  A.polygonOffsetUnits = -2;
  const g = new Mesh(c, A);
  g.name = "skid-marks";
  g.frustumCulled = false;
  g.renderOrder = 2;
  g.receiveShadow = true;
  g.visible = false;
  layer !== null && g.layers.set(layer);
  scene.add(g);
  let b = 0,
    x = 0,
    y = 0,
    _ = -1 / 0;
  const w = new Map();
  function S(v, E, C, M, B, R) {
    Yr.subVectors(E, v).cross(C).normalize().multiplyScalar(M);
    const I = b * 4;
    n.set([v.x - Yr.x, v.y - Yr.y, v.z - Yr.z, v.x + Yr.x, v.y + Yr.y, v.z + Yr.z], I * 3);
    n.set([E.x - Yr.x, E.y - Yr.y, E.z - Yr.z, E.x + Yr.x, E.y + Yr.y, E.z + Yr.z], (I + 2) * 3);
    for (let k = 0; k < 4; k++) r.set([C.x, C.y, C.z], (I + k) * 3);
    o.set([B, B, R, R], I);
    a.fill(y, I, I + 4);
    for (const k of [u, d, h, f]) k.addUpdateRange(I * k.itemSize, 4 * k.itemSize), k.needsUpdate = true;
    b = (b + 1) % Qc;
    x = Math.min(Qc, x + 1);
    _ = y;
  }
  function T(v, E) {
    y += E;
    p.value = y;
    v.forEach((C, M) => {
      const B = C.contact ? C.skid ?? 0 : 0;
      if (B < threshold) {
        w.delete(M);
        return;
      }
      WS.set(C.contactNormal.x, C.contactNormal.y, C.contactNormal.z);
      bd.set(C.contactPoint.x, C.contactPoint.y, C.contactPoint.z).addScaledVector(WS, lift);
      const R = Math.min(1, (B - threshold) / .4 + .25),
        I = w.get(M);
      if (!I) {
        w.set(M, {
          p: bd.clone(),
          alpha: R
        });
        return;
      }
      if (!(I.p.distanceToSquared(bd) < .09)) {
        if (I.p.distanceToSquared(bd) > 16) {
          I.p.copy(bd);
          return;
        }
        ck.copy(I.p);
        S(ck, bd, WS, (C.width ?? .26) * .45, I.alpha, R);
        I.p.copy(bd);
        I.alpha = R;
      }
    });
    c.setDrawRange(0, x * 6);
    g.visible = x > 0 && y - _ < lk;
  }
  return {
    mesh: g,
    update: T,
    clear() {
      b = 0;
      x = 0;
      w.clear();
      c.setDrawRange(0, 0);
      g.visible = false;
    },
    dispose() {
      g.removeFromParent();
      c.dispose();
      A.dispose();
    }
  };
}
