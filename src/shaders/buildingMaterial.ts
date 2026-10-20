// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { DataTexture, RGBAFormat, FloatType, NearestFilter, MeshStandardNodeMaterial, FrontSide, Frustum, Matrix4, Sphere, Box3, Quaternion } from "three/webgpu";
import { uniform, attribute, texture, vec2, step, fract, vec3, mix, sin, time, positionGeometry, select, abs, normalGeometry, floor, hash, smoothstep, float, normalMap, uv } from "three/tsl";
import { e3 } from "../world/city/buildingKit.ts";
export function createBuildingMaterial({
  palette: palette,
  textures: textures
}) {
  const t = palette.length,
    s = new Float32Array(t * 3 * 4);
  palette.forEach((Je, je) => {
    s.set([Je.color[0], Je.color[1], Je.color[2], Je.texture], (0 * t + je) * 4);
    s.set([Je.emissive[0], Je.emissive[1], Je.emissive[2], Je.kind ?? 0], (1 * t + je) * 4);
    s.set([Je.roughness, Je.metalness, Je.alpha, 0], (2 * t + je) * 4);
  });
  const n = new DataTexture(s, t, 3, RGBAFormat, FloatType);
  n.magFilter = NearestFilter;
  n.minFilter = NearestFilter;
  n.needsUpdate = true;
  const r = uniform(1),
    o = uniform(.42),
    a = uniform(.5),
    l = uniform(.75),
    c = uniform(2.2),
    d = attribute("matid", "float").add(.5).div(t),
    h = Je => texture(n, vec2(d, (Je + .5) / 3)),
    f = h(0),
    p = h(1),
    m = h(2),
    A = step(.5, f.w),
    g = p.w,
    b = step(.5, g).mul(step(g, 1.5)),
    x = step(1.5, g).mul(step(g, 2.5)),
    y = step(2.5, g).mul(step(g, 3.5)),
    _ = step(3.5, g).mul(step(g, 4.5)),
    w = step(4.5, g),
    S = uv(),
    T = texture(textures.plasterColor, S),
    v = texture(textures.plasterOrm, S),
    E = attribute("seed", "float"),
    C = p.xyz,
    M = step(.18, E),
    B = fract(E.mul(7.31)),
    R = vec3(1, .72, .42),
    I = vec3(.55, .78, 1),
    k = vec3(1, .35, .8),
    L = mix(mix(R, I, step(.62, B)), k, step(.9, B)),
    F = sin(time.mul(.7).add(E.mul(60))).mul(.08).add(.92),
    O = C.x.max(C.y).max(C.z),
    H = positionGeometry,
    W = select(abs(normalGeometry.x).greaterThan(abs(normalGeometry.z)), H.z, H.x),
    P = H.y,
    z = floor(vec2(W.div(3), P.div(3.4))),
    Y = hash(z.x.mul(12.9).add(z.y.mul(78.2)).add(E.mul(311))),
    G = step(.38, Y),
    X = smoothstep(0, .12, fract(P.div(3.4))).mul(smoothstep(1, .9, fract(P.div(3.4)))),
    ae = G.mul(Y.mul(.9).add(.35)).mul(X.mul(.8).add(.2)),
    ne = L.mul(O).mul(M).mul(F).mul(ae).mul(o),
    se = sin(time.mul(fract(E.mul(3.3)).mul(1.5).add(.4)).add(E.mul(40))).mul(.12).add(.88),
    re = step(.06, fract(E.mul(13.7))),
    le = C.mul(fract(E.mul(5.9)).mul(.6).add(.55)).mul(se).mul(re).mul(a),
    we = floor(time.mul(.22).add(E.mul(17))),
    Se = floor(vec2(W, P).div(.45)),
    ye = hash(floor(Se.y.div(3)).mul(7.13).add(floor(Se.x.div(6)).mul(1.71)).add(we.mul(3.31)).add(E.mul(97))),
    U = step(.42, ye),
    J = step(.5, fract(W.mul(.08).sub(time.mul(.6)).add(P.mul(.02)))),
    Q = sin(P.mul(22)).mul(.12).add(.88),
    j = e3(fract(E.mul(3.1).add(we.mul(.37)))),
    de = e3(fract(E.mul(3.1).add(we.mul(.37)).add(.45))),
    K = mix(j, de, U.mul(J)).mul(mix(float(.22), float(1), U)).mul(Q).mul(l),
    V = floor(vec2(W.div(2.4), P.div(3.6))),
    te = fract(vec2(W.div(2.4), P.div(3.6))),
    fe = hash(V.x.mul(17.3).add(V.y.mul(41.7)).add(E.mul(523))),
    Ce = step(.76, fe),
    Ue = smoothstep(.08, .16, te.x).mul(smoothstep(.92, .84, te.x)).mul(smoothstep(.18, .26, te.y)).mul(smoothstep(.88, .8, te.y)),
    Ae = L.mul(O).mul(M).mul(Ce.mul(fe.sub(.76).mul(2.5).add(.4))).mul(Ue).mul(o),
    Be = Je => {
      const je = fract(Je.mul(5.9)).mul(.6).add(.55),
        Te = step(.9, fract(Je.mul(29.3))),
        ue = step(.72, fract(time.mul(.23).add(Je.mul(7.1)))),
        $ = step(.3, hash(floor(time.mul(13).add(Je.mul(91))))),
        q = mix(float(1), $.mul(.85).add(.15), Te.mul(ue));
      return je.mul(step(.06, fract(Je.mul(13.7)))).mul(q).mul(c);
    },
    He = C.mul(Be(E)),
    at = C.mul(r),
    Re = mix(mix(mix(mix(mix(at, ne, b), le, x), K, y), Ae, _), He, w),
    Fe = new MeshStandardNodeMaterial();
  Fe.name = "city-buildings";
  Fe.colorNode = mix(mix(f.xyz, T.rgb, A), vec3(.02), y);
  Fe.roughnessNode = mix(m.x, v.g.mul(.9).add(.1), A);
  Fe.metalnessNode = mix(m.y, float(0), A);
  Fe.normalNode = normalMap(texture(textures.plasterNormal, S), vec2(A.mul(.8)));
  Fe.emissiveNode = Re;
  Fe.side = FrontSide;
  return {
    material: Fe,
    paletteTex: n,
    paletteCount: t,
    signLight: Be,
    uniforms: {
      windowGlow: r,
      roomGlow: o,
      neonGlow: a,
      screenGlow: l,
      signGlow: c
    }
  };
}
export const VT = new Frustum();
export const t3 = new Matrix4();
export const QT = new Sphere();
export const Ha = new Box3();
export const s3 = new Quaternion();
