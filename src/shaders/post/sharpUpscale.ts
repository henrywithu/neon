// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { MipBloomNode } from "./mipBloom.ts";
import { nodeObject, Fn, vec2, textureSize, floor, max, vec4, texture, textureLoad, ivec2, int, exp2, min, float, vec3, convertToTexture, uv } from "three/tsl";
import { QuadMesh, Vector2, TempNode, RenderTarget, HalfFloatType, LinearFilter, NodeUpdateType, RendererUtils, NodeMaterial } from "three/webgpu";
export const Zoe = (i, e, t, s, n) => new MipBloomNode(nodeObject(i), e, t, s, n);
export const dS = new QuadMesh();
export const hS = new Vector2();
export let fS;
export class SharpUpscaleNode extends TempNode {
  static get type() {
    return "SharpUpscaleNode";
  }
  constructor(e, t = .2) {
    super("vec4");
    this.textureNode = e;
    this.sharpness = nodeObject(t);
    this._target = new RenderTarget(1, 1, {
      depthBuffer: false,
      type: HalfFloatType
    });
    this._target.texture.name = "SharpUpscale";
    this._target.texture.minFilter = LinearFilter;
    this._target.texture.magFilter = LinearFilter;
    this._material = null;
    this.updateBeforeType = NodeUpdateType.FRAME;
  }
  setSize(e, t) {
    this._target.setSize(e, t);
  }
  updateBefore(e) {
    const {
      renderer: t
    } = e;
    fS = RendererUtils.resetRendererState(t, fS);
    t.getDrawingBufferSize(hS);
    this.setSize(hS.x, hS.y);
    t.setRenderTarget(this._target);
    dS.material = this._material;
    dS.name = "SharpUpscale [ Catmull-Rom ]";
    dS.render(t);
    RendererUtils.restoreRendererState(t, fS);
  }
  setup(e) {
    const t = this.textureNode,
      s = Fn(() => {
        const a = vec2(textureSize(t)),
          l = uv().mul(a),
          c = floor(l.sub(.5)).add(.5),
          u = l.sub(c),
          d = u.mul(u.mul(u.mul(-.5).add(1)).sub(.5)),
          h = u.mul(u).mul(u.mul(1.5).sub(2.5)).add(1),
          f = u.mul(u.mul(u.mul(-1.5).add(2)).add(.5)),
          p = u.mul(u).mul(u.mul(.5).sub(.5)),
          m = h.add(f),
          A = c.sub(1).div(a),
          g = c.add(2).div(a),
          b = c.add(f.div(m)).div(a),
          x = (E, C) => t.sample(vec2(E, C)).level(0),
          y = x(b.x, A.y).mul(m.x.mul(d.y)),
          _ = x(A.x, b.y).mul(d.x.mul(m.y)),
          w = x(b.x, b.y).mul(m.x.mul(m.y)),
          S = x(g.x, b.y).mul(p.x.mul(m.y)),
          T = x(b.x, g.y).mul(m.x.mul(p.y)),
          v = m.x.mul(d.y).add(d.x.mul(m.y)).add(m.x.mul(m.y)).add(p.x.mul(m.y)).add(m.x.mul(p.y));
        return max(y.add(_).add(w).add(S).add(T).div(v), vec4(0));
      }),
      n = this._material || (this._material = new NodeMaterial());
    n.fragmentNode = s().context(e.getSharedContext());
    n.name = "SharpUpscale_catmullRom";
    n.needsUpdate = true;
    const r = texture(this._target.texture);
    return Fn(() => {
      const a = vec2(textureSize(textureLoad(r))),
        l = ivec2(int(floor(uv().x.mul(a.x))), int(floor(uv().y.mul(a.y)))).toConst(),
        c = (T, v) => textureLoad(r, l.add(ivec2(T, v))),
        u = c(0, 0),
        d = c(0, -1),
        h = c(-1, 0),
        f = c(1, 0),
        p = c(0, 1),
        m = exp2(this.sharpness.negate()),
        A = min(min(d.rgb, h.rgb), min(f.rgb, p.rgb)).toConst(),
        g = max(max(d.rgb, h.rgb), max(f.rgb, p.rgb)).toConst(),
        b = float(.25 - 1 / 16),
        x = min(A, u.rgb).div(g.mul(4)),
        y = vec3(1).sub(max(g, u.rgb)).div(A.mul(4).sub(4)),
        _ = max(x.negate(), y),
        w = max(b.negate(), min(max(_.r, max(_.g, _.b)), float(0))).mul(m).toConst(),
        S = d.rgb.add(h.rgb).add(f.rgb).add(p.rgb).mul(w).add(u.rgb).div(w.mul(4).add(1));
      return vec4(max(S, vec3(0)), u.a);
    })();
  }
  dispose() {
    var e;
    this._target.dispose();
    (e = this._material) == null || e.dispose();
  }
}
export const tae = (i, e) => new SharpUpscaleNode(convertToTexture(i), e);
