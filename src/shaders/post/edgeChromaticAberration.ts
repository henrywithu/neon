// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { TempNode } from "three/webgpu";
import { Fn, fract, sin, dot, vec2, float, vec4, nodeObject, convertToTexture, nodeProxy, luminance, mix, vec3, max, uv } from "three/tsl";
import FilmNode from "three/addons/tsl/display/FilmNode.js";
export class EdgeChromaticAberrationNode extends TempNode {
  static get type() {
    return "EdgeChromaticAberrationNode";
  }
  constructor(e, t, s, n) {
    super("vec4");
    this.textureNode = e;
    this.strengthNode = t;
    this.edgeFalloffNode = s;
    this.centerNode = n;
  }
  setup() {
    const e = this.textureNode,
      t = e.uvNode || uv(),
      s = Fn(([o]) => fract(sin(dot(o, vec2(12.9898, 78.233))).mul(float(43758.5453))).sub(float(.5)).mul(float(2)).mul(float(.004))).setLayout({
        name: "Dither",
        type: "float",
        inputs: [{
          name: "screenPos",
          type: "vec2"
        }]
      }),
      n = Fn(([o, a, l, c]) => {
        const u = o.sub(c),
          d = u.length(),
          h = float(1).sub(float(1).div(float(1).add(d.mul(l).pow(2)))),
          f = a.mul(h),
          p = u.mul(float(1).add(f.mul(.015))),
          m = u,
          A = u.mul(float(1).sub(f.mul(.015))),
          g = c.add(p),
          b = c.add(m),
          x = c.add(A),
          y = e.sample(g).r,
          _ = e.sample(b).g,
          w = e.sample(x).b,
          S = e.sample(o).a,
          T = s(o),
          v = y.add(T),
          E = _.add(T),
          C = w.add(T);
        return vec4(v, E, C, S);
      }).setLayout({
        name: "EdgeChromaticAberrationShader",
        type: "vec4",
        inputs: [{
          name: "uv",
          type: "vec2"
        }, {
          name: "strength",
          type: "float"
        }, {
          name: "edgeFalloff",
          type: "float"
        }, {
          name: "center",
          type: "vec2"
        }]
      });
    return Fn(() => n(t, this.strengthNode, this.edgeFalloffNode, this.centerNode))();
  }
}
export const nae = (i, e = 1, t = 3, s = null) => (s === null && (s = vec2(.5, .5)), nodeObject(new EdgeChromaticAberrationNode(convertToTexture(i), nodeObject(e), nodeObject(t), nodeObject(s))));
export const rae = nodeProxy(FilmNode);
export const Ap = "neonNoir";
export const oae = {
  Neutral: "neutral",
  "Neon Noir": "neonNoir",
  "Magenta Rain": "magentaRain",
  "Teal Dusk": "tealDusk",
  "Silent Hill": "silentHill",
  "Sin City": "sinCity"
};
export const aae = Fn(([i, e]) => {
  const t = luminance(i);
  return mix(vec3(t), i, e).max(0);
});
export const I3 = .18;
export const lae = Fn(([i, e, t]) => {
  const s = i.mul(float(2).pow(e)),
    n = max(luminance(s), float(1e-4)),
    r = n.div(I3).pow(t).mul(I3);
  return s.mul(r.div(n)).max(0);
});
export const cae = Fn(([i, e]) => {
  const t = luminance(i);
  return vec3(i.r, mix(i.g, t, e), i.b).max(0);
});
