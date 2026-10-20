// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { uniform, renderGroup, convertToTexture, Fn, screenUV, vec2, screenCoordinate, screenSize, time, smoothstep, float, vec3, mix, pow, dot, vec4 } from "three/tsl";
import { hae, gS } from "../post/cyberpunkLook.ts";
export function createRainGlassUniforms() {
  return {
    speed: uniform(1).setGroup(renderGroup),
    intensity: uniform(.85).setGroup(renderGroup),
    distortionStrength: uniform(.28).setGroup(renderGroup),
    dropSize: uniform(1).setGroup(renderGroup),
    blurRadius: uniform(3.5).setGroup(renderGroup),
    amount: uniform(0).setGroup(renderGroup)
  };
}
export function createRainGlassShader(i, e) {
  const t = hae(i, e.blurRadius, 2, {
      resolutionScale: .6
    }),
    s = convertToTexture(t);
  return Fn(() => {
    const n = screenUV,
      r = vec2(screenCoordinate.x.sub(screenSize.x.mul(.5)).div(screenSize.y), screenSize.y.mul(.5).sub(screenCoordinate.y).div(screenSize.y)),
      o = time.mul(.2).mul(e.speed),
      a = e.intensity,
      l = e.dropSize,
      c = smoothstep(float(-.5), float(1), a).mul(2),
      u = smoothstep(float(.25), float(.75), a),
      d = smoothstep(float(0), float(.5), a),
      h = gS(r, o, c, u, d, l),
      f = vec2(.005, 0),
      p = gS(r.add(f), o, c, u, d, l).x,
      m = gS(r.add(f.yx), o, c, u, d, l).x,
      A = vec2(p.sub(h.x), h.x.sub(m)).mul(3.5),
      g = n.add(A.mul(e.distortionStrength).mul(l).mul(float(1).add(h.x.mul(.5))));
    let b = s.sample(g).rgb;
    const x = h.x.mul(.1);
    b = vec3(b.r.add(A.x.mul(x).mul(e.distortionStrength).mul(l)), b.g.add(A.y.mul(x).mul(e.distortionStrength).mul(l)), b.b);
    const y = float(1).add(h.x.mul(.2));
    b = b.mul(mix(vec3(1), vec3(y), h.x));
    const _ = pow(h.y, float(2)).mul(.25);
    b = b.add(vec3(_).mul(float(1).sub(h.x)));
    b = b.mul(mix(vec3(1), vec3(.85, .92, 1.12), float(.45)));
    const w = n.sub(.5);
    b = b.mul(float(1).sub(dot(w, w).mul(.75)));
    const S = s.sample(n).rgb;
    b = mix(S, b, h.x.mul(.85));
    return vec4(b.mul(.85), float(.75));
  })();
}
export const Yb = {
  normal: {
    strength: .15,
    clearRadius: .2,
    carShield: .45,
    rayLength: 2.6,
    rayStrength: 1.15,
    lineStrength: .3,
    distortion: .24,
    lensChroma: .12
  },
  nitro: {
    strength: .4,
    clearRadius: .15,
    carShield: 1,
    rayLength: 2.2,
    rayStrength: 3,
    lineStrength: .21,
    distortion: -.13,
    lensChroma: .5
  }
};
