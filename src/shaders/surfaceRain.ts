// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Fn, fract, vec3, dot, sin, smoothstep, float, vec2, floor, abs, length, pow, sqrt, max, uniform } from "three/tsl";
export const Qne = Fn(([i]) => {
  const e = fract(vec3(i, i, i).mul(vec3(.1031, .11369, .13787))),
    t = e.add(dot(e, e.yzx.add(19.19)));
  return fract(vec3(t.x.add(t.y).mul(t.z), t.x.add(t.z).mul(t.y), t.y.add(t.z).mul(t.x)));
});
export const qne = Fn(([i]) => fract(sin(i.mul(12345.564)).mul(7658.76)));
export const Hne = Fn(([i, e]) => smoothstep(float(0), i, e).mul(smoothstep(float(1), i, e)));
export const zN = Fn(([i, e, t, s = float(1)]) => {
  const n = i,
    r = i.toVar(),
    o = e.mul(.15);
  r.y.addAssign(o.mul(.75));
  const a = vec2(4, 2),
    l = a.mul(2);
  let c = floor(r.mul(l));
  r.y.addAssign(qne(c.x));
  c = floor(r.mul(l));
  const u = Qne(c.x.mul(35.2).add(c.y.mul(2376.1))),
    d = fract(r.mul(l)).sub(vec2(.5, 0));
  let h = u.x.sub(.5);
  const f = n.y.mul(10),
    p = sin(f.add(sin(f)));
  h = h.add(p.mul(float(.5).sub(abs(h))).mul(u.z.sub(.5)));
  h = h.mul(.7);
  const m = fract(o.add(u.z)),
    A = Hne(float(.85), m).sub(.5).mul(.9).add(.5),
    g = vec2(h, A),
    b = length(d.sub(g).mul(a.yx)),
    x = pow(smoothstep(float(.9).mul(t), float(0), b), float(2)),
    y = sqrt(smoothstep(float(1), A, d.y)),
    _ = abs(d.x.sub(h)),
    w = smoothstep(float(.23).mul(y).mul(t), float(.15).mul(y).mul(y).mul(t), _).mul(smoothstep(float(-.02).mul(t), float(.02).mul(t), d.y.sub(A))).mul(y).mul(y),
    S = smoothstep(float(-.02).mul(t), float(.02).mul(t), d.y.sub(A)),
    T = n.y,
    v = fract(T.mul(10)).add(d.y.sub(.5)),
    E = length(d.sub(vec2(h, v))),
    C = smoothstep(float(.4).mul(t), float(0), E),
    M = x.add(C.mul(y).mul(S).mul(s)),
    B = float(1).sub(b).mul(.5),
    R = M.add(w.mul(.35));
  return vec2(R, B);
});
export const surfaceRain = Fn(([i, e, t, s, n, r = float(1)]) => {
  const o = zN(i, e, n, r),
    a = zN(i.mul(1.85), e, n, r),
    l = smoothstep(float(.3), float(1), o.x.add(a.x));
  return vec2(l, max(o.y.mul(t), a.y.mul(s)));
});
export function Wne(i) {
  return {
    staticDrops: float(0),
    layer1: smoothstep(float(.25), float(.75), i),
    layer2: smoothstep(float(0), float(.5), i)
  };
}
export function $ne(i, e, t, s, n = .005, r = float(1)) {
  const {
      layer1: o,
      layer2: a
    } = t,
    l = vec2(n, 0),
    c = surfaceRain(i, e, o, a, s, r),
    u = surfaceRain(i.add(l), e, o, a, s, r).x,
    d = surfaceRain(i.add(l.yx), e, o, a, s, r).x;
  return {
    mask: c.x,
    edge: c.y,
    normalOffset: vec2(u.sub(c.x), d.sub(c.x))
  };
}
export function createSurfaceRainUniforms() {
  return {
    uTime: uniform(0),
    uSpeed: uniform(1),
    uIntensity: uniform(1),
    uScale: uniform(20.5),
    uDropSize: uniform(.45),
    uNormalStrength: uniform(.25),
    uWetRoughness: uniform(.1),
    uGlassNormalStrength: uniform(.25),
    uGlassWetRoughness: uniform(.05),
    uGlassWetBrighten: uniform(.3),
    uDropletMix: uniform(.15)
  };
}
export function surfaceRainNormal(i, e) {
  const t = e.uTime.mul(1.2).mul(e.uSpeed),
    s = Wne(e.uIntensity);
  return $ne(i.mul(e.uScale), t, s, e.uDropSize, .005, e.uDropletMix);
}
