// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Yb } from "../shaders/rainGlass.ts";
import { uniform, fract, float, sin, Fn, vec4, screenSize, vec2, dot, screenUV, vec3, mix, smoothstep, abs, length, step, screenCoordinate, atan, floor, If } from "three/tsl";
import { Vector2 } from "three/webgpu";
export const yae = Object.keys(Yb.normal);
export function createSpeedBlur({
  samples = 8
} = {}) {
  const e = {
      amount: uniform(0),
      lensAmount: uniform(0),
      center: uniform(new Vector2(.5, .5)),
      ...Object.fromEntries(yae.map(r => [r, uniform(Yb.normal[r])])),
      phase: uniform(0)
    },
    t = r => fract(float(52.9829189).mul(fract(r.x.mul(.06711056).add(r.y.mul(.00583715))))),
    s = r => fract(sin(r.mul(127.1)).mul(43758.5453));
  function n(r, o, {
    bloomTex = null
  } = {}) {
    return Fn(() => {
      const l = vec4(o).toVar();
      If(e.amount.greaterThan(.001), () => {
        const c = screenSize.x.div(screenSize.y),
          u = vec2(c, 1),
          d = c.mul(c).mul(.25).add(.25),
          h = (W, P) => {
            const z = W.sub(.5).mul(u),
              Y = dot(z, z).div(d);
            return z.mul(float(1).add(P.mul(Y)).div(float(1).add(P))).div(u).add(.5);
          },
          f = e.distortion.mul(e.lensAmount),
          p = h(screenUV, f),
          m = vec3(r.sample(h(screenUV, f.mul(float(1).add(e.lensChroma)))).level(0).r, r.sample(p).level(0).g, r.sample(h(screenUV, f.mul(float(1).sub(e.lensChroma)))).level(0).b),
          A = mix(o.rgb, m, smoothstep(0, .015, abs(f))),
          g = p.sub(e.center),
          b = length(g.mul(vec2(c, 1))),
          x = step(0, g.y),
          y = length(g.mul(vec2(c, mix(1, e.carShield, x)))),
          _ = smoothstep(e.clearRadius, e.clearRadius.add(.5), y),
          w = e.amount.mul(_),
          S = e.strength.mul(w),
          T = t(screenCoordinate.xy);
        let v = vec3(0),
          E = vec3(0);
        for (let W = 0; W < samples; W++) {
          const P = float(W).add(T).div(samples),
            z = vec3(float(1).sub(P), float(1).sub(abs(P.mul(2).sub(1))), P),
            Y = r.sample(p.sub(g.mul(S).mul(P))).level(0);
          v = v.add(Y.rgb.mul(z));
          bloomTex && (E = E.add(bloomTex.sample(p.sub(g.mul(S).mul(e.rayLength).mul(P))).level(0).rgb));
        }
        const C = v.div(samples * .5),
          M = mix(A, C, smoothstep(0, .2, w)).toVar();
        bloomTex && M.addAssign(E.div(samples).mul(e.rayStrength).mul(w));
        const B = atan(g.y, g.x.mul(c)).div(Math.PI * 2).mul(96),
          R = floor(B),
          I = s(R),
          k = fract(B),
          L = smoothstep(.42, .5, k).mul(smoothstep(.58, .5, k)),
          F = fract(b.mul(1.4).sub(e.phase.mul(I.add(.6))).add(I.mul(7))),
          O = smoothstep(0, .08, F).mul(smoothstep(.45, .1, F)),
          H = L.mul(O).mul(smoothstep(.8, .95, I)).mul(_.mul(_)).mul(smoothstep(.2, .9, e.amount)).mul(e.lineStrength);
        M.addAssign(vec3(.75, .9, 1).mul(H));
        l.assign(vec4(M, o.a));
      });
      return l;
    })();
  }
  return {
    uniforms: e,
    apply: n,
    presets: {
      normal: {
        ...Yb.normal
      },
      nitro: {
        ...Yb.nitro
      }
    }
  };
}
