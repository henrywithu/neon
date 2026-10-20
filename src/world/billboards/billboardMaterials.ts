// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { time, floor, clamp, fract, step, float, smoothstep, abs, hash, select, mod, int, texture, vec2, fwidth, sin, exp, uniform, Fn, length, mix, vec4, uv } from "three/tsl";
import { MeshStandardNodeMaterial, FrontSide, Vector3, Vector2 } from "three/webgpu";
export function VU(i) {
  return Array.isArray(i.material) ? i.material : [i.material];
}
export function Ine(i, e) {
  const t = [];
  i.traverse(s => {
    s.isMesh && VU(s).forEach((n, r) => {
      (n == null ? undefined : n.name) === e && t.push({
        mesh: s,
        material: n,
        materialIndex: r
      });
    });
  });
  return t;
}
export function sampleBillboardAtlas({
  atlas: atlas,
  rects: rects,
  first: first,
  count: count,
  phase: phase,
  st: st,
  period = 9,
  wipe = .7
}) {
  const l = time.div(period).add(phase.mul(count)),
    c = floor(l),
    u = clamp(fract(l).mul(period / wipe), 0, 1),
    d = step(u, .999),
    h = st.y.sub(u),
    f = float(1).sub(smoothstep(0, .1, abs(h))).mul(d),
    p = hash(floor(st.y.mul(96)).add(c.mul(131))),
    m = st.x.add(p.sub(.5).mul(.12).mul(f)),
    A = select(h.lessThan(0), mod(c, count), mod(c.add(count).sub(1), count)).add(first),
    g = rects.element(int(A)),
    b = texture(atlas, g.xy.add(clamp(vec2(m, st.y), .003, .997).mul(g.zw))).rgb,
    x = st.y.mul(360),
    y = float(1).sub(smoothstep(.25, .6, fwidth(x))),
    _ = float(1).sub(y.mul(.18).mul(sin(x.mul(Math.PI * 2)).mul(.5).add(.5))),
    w = exp(abs(h).mul(-90)).mul(d).mul(.9);
  return b.mul(_).add(w);
}
export function createBillboardUniforms({
  vignetteInner = .05,
  vignetteOuter = .9,
  vignetteMin = .01,
  emissiveIntensity = .2
} = {}) {
  return {
    vignetteInner: uniform(vignetteInner),
    vignetteOuter: uniform(vignetteOuter),
    vignetteMin: uniform(vignetteMin),
    emissiveIntensity: uniform(emissiveIntensity)
  };
}
export function createBillboardShader(i, e, t, s) {
  const {
    vignetteInner: n,
    vignetteOuter: r,
    vignetteMin: o
  } = s;
  return {
    output: Fn(() => {
      const l = uv(),
        c = sampleBillboardAtlas({
          atlas: i.texture,
          rects: i.rects,
          first: float(e.first),
          count: float(e.count),
          phase: float(t),
          st: clamp(l, 0, 1)
        }),
        u = length(l.sub(.5)).mul(2),
        d = float(1).sub(smoothstep(n, r, u)),
        h = mix(o, float(1), d);
      return vec4(c.mul(h), 1);
    })()
  };
}
export const kne = ["billboard_face", "billboard_fireguy", "billboard_3"];
export function Fne(i) {
  if (i != null && i.isMeshStandardNodeMaterial) return i;
  const e = new MeshStandardNodeMaterial();
  e.name = i.name;
  e.roughness = i.roughness ?? .5;
  e.metalness = i.metalness ?? 0;
  e.transparent = i.transparent ?? false;
  e.opacity = i.opacity ?? 1;
  e.side = i.side ?? FrontSide;
  return e;
}
export function Dne(i, e, t) {
  if (Array.isArray(i.material)) {
    i.material[e] = t;
    return;
  }
  i.material = t;
}
export const ig = [new Vector3(), new Vector3(), new Vector3()];
export const li = [new Vector2(), new Vector2(), new Vector2()];
export const NT = new Vector3();
export const LT = new Vector3();
export const PN = new Vector3();
export const ON = new Vector3();
export function Pne(i) {
  const {
      position: e,
      uv: t
    } = i.geometry.attributes,
    s = i.geometry.index;
  if (!t) return 1;
  i.updateWorldMatrix(true, false);
  const n = (s ? s.count : e.count) / 3;
  let r = -1,
    o = 0;
  for (let h = 0; h < n; h++) {
    for (let p = 0; p < 3; p++) li[p].fromBufferAttribute(t, s ? s.getX(h * 3 + p) : h * 3 + p);
    const f = Math.abs((li[1].x - li[0].x) * (li[2].y - li[0].y) - (li[2].x - li[0].x) * (li[1].y - li[0].y));
    f > o && (o = f, r = h);
  }
  if (r < 0) return 1;
  for (let h = 0; h < 3; h++) {
    const f = s ? s.getX(r * 3 + h) : r * 3 + h;
    ig[h].fromBufferAttribute(e, f).applyMatrix4(i.matrixWorld);
    li[h].fromBufferAttribute(t, f);
  }
  NT.subVectors(ig[1], ig[0]);
  LT.subVectors(ig[2], ig[0]);
  const a = li[1].x - li[0].x,
    l = li[1].y - li[0].y,
    c = li[2].x - li[0].x,
    u = li[2].y - li[0].y,
    d = 1 / (a * u - c * l);
  PN.copy(NT).multiplyScalar(u).addScaledVector(LT, -l).multiplyScalar(d);
  ON.copy(LT).multiplyScalar(a).addScaledVector(NT, -c).multiplyScalar(d);
  return PN.length() / Math.max(1e-6, ON.length());
}
export function One(i, e) {
  if (!i.length || !e) return null;
  const t = createBillboardUniforms(),
    s = [];
  let n = false;
  for (let o = 0; o < i.length; o++) {
    const {
        mesh: a,
        material: l,
        materialIndex: c
      } = i[o],
      u = e.runFor(Pne(a) > .8 ? "square" : "portrait"),
      {
        output: d
      } = createBillboardShader(e, u, (o + .37) / i.length, t),
      h = Fne(l);
    h.colorNode = d;
    h.emissiveNode = d.rgb.mul(t.emissiveIntensity);
    h.needsUpdate = true;
    h !== l && Dne(a, c, h);
    s.push(a);
  }
  function r() {
    if (!n) {
      n = true;
      for (const o of s) o.visible = false;
    }
  }
  return {
    dispose: e.dispose,
    disable: r,
    uniforms: t
  };
}
export function Une(i) {
  return kne.flatMap(e => Ine(i, e));
}
export function applyBillboardMaterials(i, e) {
  const t = [],
    s = One(Une(i), e);
  s && t.push(s.dispose);
  function n() {
    for (const r of t) r();
  }
  return {
    dispose: n,
    billboard: s
  };
}
