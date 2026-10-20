// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Color, InstancedInterleavedBuffer, CylinderGeometry, MeshBasicNodeMaterial, AdditiveBlending, DoubleSide, Mesh, PlaneGeometry, CanvasTexture, SRGBColorSpace, LinearMipmapLinearFilter } from "three/webgpu";
import { Ck } from "./routePlanning.ts";
import { instancedBufferAttribute, distance, cameraPosition, smoothstep, float, positionGeometry, vec3, fract, time, pow, vec4, length, abs, max, sin, cameraViewMatrix, cameraProjectionMatrix, vec2, texture, uv } from "three/tsl";
import { yG } from "../sigils/placements.ts";
export const Ff = 12;
export const Ol = 8;
export const Df = 4;
export const _d = 128;
export const _g = {
  start: new Color(1, .78, .05),
  checkpoint: new Color(.1, .85, 1),
  finish: new Color(1, .82, .4)
};
export function createCheckpointBeacons({
  scene: scene,
  groundY: groundY,
  mirrorLayer: mirrorLayer,
  viewLayer: viewLayer,
  icons = []
}) {
  const r = new Float32Array(Ck * Ff),
    o = new InstancedInterleavedBuffer(r, Ff),
    a = instancedBufferAttribute(o, "vec4", Ff, 0),
    l = instancedBufferAttribute(o, "vec4", Ff, 4),
    c = instancedBufferAttribute(o, "vec4", Ff, 8),
    u = a.xyz,
    d = a.w,
    h = l.x,
    f = l.yzw,
    p = c.x,
    m = c.y,
    A = c.w,
    g = distance(u.xz, cameraPosition.xz),
    b = m.greaterThan(0).select(smoothstep(m, m.mul(.72), g), float(1)),
    x = smoothstep(d.mul(1.05), d.mul(2.6), g),
    y = new CylinderGeometry(1, 1, 1, 40, 1, true);
  y.translate(0, .5, 0);
  const _ = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    side: AdditiveBlending,
    blending: DoubleSide
  });
  _.name = "mission-beam";
  _.positionNode = u.add(positionGeometry.mul(vec3(d, h, d)));
  const w = uv().y,
    S = fract(w.mul(h).div(1.6).sub(time.mul(.9)).add(A)),
    T = smoothstep(0, .08, S).mul(smoothstep(.34, .1, S)),
    E = pow(float(1).sub(w), 1.7).mul(T.mul(.45).add(.2)).mul(p).mul(b).mul(x);
  _.colorNode = vec4(f.mul(pow(float(1).sub(w), 8).mul(1.4).add(.75)), E);
  const C = new Mesh(y, _),
    M = new PlaneGeometry(2, 2);
  M.rotateX(-Math.PI / 2);
  const B = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: DoubleSide
  });
  B.name = "mission-ring";
  B.positionNode = u.add(vec3(positionGeometry.x.mul(d), .06, positionGeometry.z.mul(d)));
  const R = length(positionGeometry.xz),
    I = smoothstep(.84, .9, R).mul(smoothstep(1, .94, R)),
    k = smoothstep(1, .1, R).mul(.16),
    L = fract(time.mul(.55).add(A)),
    F = smoothstep(.07, 0, abs(R.sub(L))).mul(float(1).sub(L)),
    O = max(I.mul(.8).add(k.mul(x)).add(F.mul(.6)), 0).mul(p).mul(b).mul(R.lessThan(1).select(1, 0));
  B.colorNode = vec4(f.mul(1.2), O);
  const H = new Mesh(M, B),
    W = document.createElement("canvas");
  W.width = Ol * _d;
  W.height = Df * _d;
  const P = W.getContext("2d");
  icons.length > Ol * Df && console.warn(`[missions] ${icons.length} badge icons, the atlas holds ${Ol * Df}`);
  icons.slice(0, Ol * Df).forEach((V, te) => {
    const fe = te % Ol * _d + _d / 2,
      Ce = Math.floor(te / Ol) * _d + _d / 2;
    yG(P, V, fe, Ce, _d * .84);
  });
  const z = new CanvasTexture(W);
  z.colorSpace = SRGBColorSpace;
  z.generateMipmaps = true;
  z.minFilter = LinearMipmapLinearFilter;
  z.anisotropy = 4;
  const Y = new PlaneGeometry(1, 1),
    G = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false
    });
  G.name = "mission-badge";
  const X = c.z,
    ae = sin(time.mul(1.6).add(A.mul(6.28))).mul(.25),
    ne = u.add(vec3(0, h.mul(.42).add(ae).add(1.2), 0)),
    se = X.greaterThanEqual(0).select(float(2.6), float(0)),
    re = cameraViewMatrix.mul(vec4(ne, 1));
  G.vertexNode = cameraProjectionMatrix.mul(vec4(re.xy.add(positionGeometry.xy.mul(se)), re.z, 1));
  const le = X.mod(Ol),
    we = X.div(Ol).floor(),
    Se = vec2(le.add(uv().x).div(Ol), float(Df - 1).sub(we).add(uv().y).div(Df)),
    ye = texture(z, Se);
  G.colorNode = vec4(ye.rgb.mul(1.15), ye.a.mul(p).mul(b).mul(x.mul(.7).add(.3)));
  const U = new Mesh(Y, G),
    J = [C, H, U];
  J.forEach((V, te) => {
    V.name = ["mission-beams", "mission-rings", "mission-badges"][te];
    V.frustumCulled = false;
    V.count = 0;
    V.visible = false;
    V.renderOrder = 6 + te;
    V.layers.set(te === 0 ? mirrorLayer : viewLayer);
    scene.add(V);
  });
  let Q = false,
    j = [];
  function de() {
    const V = Math.min(Ck, j.length);
    for (let te = 0; te < V; te++) {
      const fe = j[te];
      r.set([fe.x, fe.y ?? groundY, fe.z, fe.radius, fe.height, fe.color.r, fe.color.g, fe.color.b, fe.alpha ?? 1, fe.fadeFar ?? 0, fe.atlas ?? -1, fe.seed ?? te * .137], te * Ff);
    }
    o.needsUpdate = true;
    for (const te of J) te.count = Math.max(1, V), te.visible = V > 0 && Q;
  }
  function K(V) {
    const te = V.position;
    let fe = false;
    for (const Ce of j) if (!(Ce.fadeFar > 0) || Math.hypot(Ce.x - te.x, Ce.z - te.z) < Ce.fadeFar) {
      fe = true;
      break;
    }
    if (fe !== Q) {
      Q = fe;
      for (const Ce of J) Ce.visible = j.length > 0 && Q;
    }
  }
  return {
    meshes: J,
    set(V) {
      j = V;
      Q = true;
      de();
    },
    update: K,
    dispose() {
      for (const V of J) V.removeFromParent(), V.geometry.dispose(), V.material.dispose();
      z.dispose();
    }
  };
}
export const Bk = "!<>-_\\/[]{}=+*^?#%&$@01";
export const Dpe = 2;
export const Ppe = 55;
export const Ope = {
  ".": .28,
  "!": .28,
  "?": .28,
  ",": .1,
  ";": .12,
  ":": .12,
  "—": .14
};
export const Upe = .32;
export const zpe = .25;
export const Gpe = 4;
export const Vpe = 3;
export const Qpe = () => typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
