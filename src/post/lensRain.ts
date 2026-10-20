// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { uniform, renderGroup, Fn, smoothstep, float, vec2, vec4, rtt, screenUV, mix, vec3 } from "three/tsl";
import { pae, AS } from "./cyberpunkLook.ts";
import { NodeUpdateType } from "three/webgpu";
export function createLensRain({
  resolutionScale = .5
} = {}) {
  const e = {
      amount: uniform(0).setGroup(renderGroup),
      intensity: uniform(0).setGroup(renderGroup),
      phase: uniform(0).setGroup(renderGroup),
      dropSize: uniform(.28).setGroup(renderGroup),
      distortionStrength: uniform(.32).setGroup(renderGroup)
    },
    t = Fn(() => {
      const o = pae(),
        a = e.phase,
        l = e.dropSize,
        c = e.intensity,
        u = smoothstep(float(0), float(.5), c).mul(1.6),
        d = smoothstep(float(.1), float(.6), c),
        h = smoothstep(float(.45), float(1), c),
        f = AS(o, a, u, d, h, l),
        p = vec2(.005, 0),
        m = AS(o.add(p), a, u, d, h, l).x,
        A = AS(o.add(p.yx), a, u, d, h, l).x;
      return vec4(vec2(m.sub(f.x), f.x.sub(A)).mul(3.5), f.x, 1);
    })(),
    s = rtt(t);
  s.setResolutionScale(resolutionScale);
  s.autoUpdate = false;
  s.updateBeforeType = NodeUpdateType.FRAME;
  function n(o) {
    const a = s.sample(screenUV),
      l = e.amount,
      c = a.z.mul(l),
      u = a.xy.mul(e.distortionStrength).mul(e.dropSize).mul(l).mul(float(1).add(a.z.mul(.5))),
      d = o.sample(screenUV.add(u)),
      h = mix(vec3(1), vec3(1.08, 1.14, 1.26), c);
    return vec4(d.rgb.mul(h), d.a);
  }
  let r = true;
  return {
    uniforms: e,
    field: s,
    apply: n,
    setActive(o) {
      s.autoUpdate = !!o;
    },
    setEnabled(o) {
      r = !!o;
    },
    get enabled() {
      return r;
    }
  };
}
