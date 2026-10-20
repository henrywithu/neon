// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { BufferGeometry, Float32BufferAttribute, MeshStandardNodeMaterial, AdditiveBlending, Mesh, Vector3 } from "three/webgpu";
import { smoothstep, attribute, mix, vec3, float } from "three/tsl";
export const p3 = .45;
export const YT = .18;
export const m3 = .95;
export const g3 = .09;
export const Bre = 1.6;
export const Rre = [.1, .85, 1];
export function createCurbs({
  runs = [],
  seawalls = [],
  groundY: groundY
}) {
  const s = [],
    n = [],
    r = [],
    o = [],
    a = [],
    l = [],
    c = groundY,
    u = groundY + YT + m3;
  for (const [A, g, b] of runs) {
    const x = seawalls[A];
    if (!x || b - g < 1) continue;
    const y = x.slice(g, b + 1),
      _ = s.length / 3,
      w = a.length / 3;
    y.forEach(([S, T], v) => {
      const E = y[Math.max(0, v - 1)],
        C = y[Math.min(y.length - 1, v + 1)],
        M = C[0] - E[0],
        B = C[1] - E[1],
        R = Math.hypot(M, B) || 1,
        I = -B / R,
        k = M / R,
        L = S - I * p3,
        F = T - k * p3;
      s.push(L, c, F, L, u, F);
      n.push(I, 0, k, I, 0, k);
      r.push(0, u - c);
      a.push(L, c - .5, F, L, groundY + YT + Bre, F);
    });
    for (let S = 0; S < y.length - 1; S++) {
      const T = _ + S * 2;
      o.push(T, T + 1, T + 2, T + 1, T + 3, T + 2);
      const v = w + S * 2;
      l.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
    }
  }
  const d = new BufferGeometry();
  d.setAttribute("position", new Float32BufferAttribute(s, 3));
  d.setAttribute("normal", new Float32BufferAttribute(n, 3));
  d.setAttribute("railY", new Float32BufferAttribute(r, 1));
  d.setIndex(o);
  d.computeBoundingSphere();
  const h = YT + m3,
    f = smoothstep(h - g3 - .01, h - g3 + .01, attribute("railY", "float")),
    p = new MeshStandardNodeMaterial();
  p.name = "guardrail";
  p.side = AdditiveBlending;
  p.colorNode = mix(vec3(.035, .037, .045), vec3(.02), f);
  p.roughnessNode = float(.45);
  p.metalnessNode = float(.4);
  p.emissiveNode = vec3(...Rre).mul(f.mul(.8));
  const m = new Mesh(d, p);
  m.name = "city:guardrails";
  m.castShadow = false;
  m.receiveShadow = false;
  m.matrixAutoUpdate = false;
  m.updateMatrix();
  return {
    mesh: m,
    trimesh: o.length ? {
      vertices: new Float32Array(a),
      indices: new Uint32Array(l)
    } : null,
    dispose() {
      m.removeFromParent();
      d.dispose();
      p.dispose();
    }
  };
}
export const $a = 1400;
export const ir = new Vector3();
export const To = new Vector3();
