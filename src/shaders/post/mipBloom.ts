// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import FSR1Node from "three/addons/tsl/display/FSR1Node.js";
import { convertToTexture, Fn, smoothstep, luminance, mix, vec4, uniform, passTexture, float, vec2, texture, uv } from "three/tsl";
import { QuadMesh, Vector2, TempNode, RenderTarget, HalfFloatType, LinearFilter, NodeUpdateType, RendererUtils, NodeMaterial } from "three/webgpu";
export const Yoe = (i, e, t) => new FSR1Node(convertToTexture(i), e, t);
export const Af = new QuadMesh();
export const lS = new Vector2();
export let cS;
export const uS = [1, .9, .8, .6, .45, .3, .2];
export const Xoe = Fn(({
  input: input,
  threshold: threshold,
  smoothWidth: smoothWidth
}) => {
  const s = smoothstep(threshold, threshold.add(smoothWidth), luminance(input.rgb));
  return mix(vec4(0), input, s);
});
export class MipBloomNode extends TempNode {
  static get type() {
    return "MipBloomNode";
  }
  constructor(e, t = 1, s = 0, n = 0, r = uS.length) {
    super("vec4");
    this.inputNode = e;
    this.strength = t.isNode ? t : uniform(t);
    this.radius = s.isNode ? s : uniform(s);
    this.threshold = n.isNode ? n : uniform(n);
    this.smoothWidth = uniform(.01);
    this.highPassFn = Xoe;
    this.spread = uniform(1.5);
    this.gain = uniform(.7);
    this._levels = Math.min(r, uS.length);
    this.levelFactors = uS.slice(0, this._levels).map(a => uniform(a));
    this._resolutionScale = .5;
    const o = () => {
      const a = new RenderTarget(1, 1, {
        depthBuffer: false,
        type: HalfFloatType
      });
      a.texture.minFilter = LinearFilter;
      a.texture.magFilter = LinearFilter;
      a.texture.generateMipmaps = false;
      return a;
    };
    this._down = Array.from({
      length: this._levels
    }, o);
    this._up = Array.from({
      length: this._levels - 1
    }, o);
    this._down.forEach((a, l) => a.texture.name = `MipBloom.down${l}`);
    this._up.forEach((a, l) => a.texture.name = `MipBloom.up${l}`);
    this._downMaterials = [];
    this._upMaterials = [];
    this._textureOutput = passTexture(this, this._up[0].texture);
    this.updateBeforeType = NodeUpdateType.FRAME;
  }
  getTextureNode() {
    return this._textureOutput;
  }
  setResolutionScale(e) {
    this._resolutionScale = e;
    return this;
  }
  getResolutionScale() {
    return this._resolutionScale;
  }
  setSize(e, t) {
    var r;
    let s = Math.max(1, Math.floor(e * this._resolutionScale * .5)),
      n = Math.max(1, Math.floor(t * this._resolutionScale * .5));
    for (let o = 0; o < this._levels; o++) this._down[o].setSize(s, n), (r = this._up[o]) == null || r.setSize(s, n), s = Math.max(1, Math.floor(s / 2)), n = Math.max(1, Math.floor(n / 2));
  }
  updateBefore(e) {
    const {
      renderer: t
    } = e;
    cS = RendererUtils.resetRendererState(t, cS);
    t.getDrawingBufferSize(lS);
    this.setSize(lS.x, lS.y);
    for (let s = 0; s < this._levels; s++) this._downMaterials[s].texel.value.set(1 / this._down[s].width, 1 / this._down[s].height), t.setRenderTarget(this._down[s]), Af.material = this._downMaterials[s], Af.name = `MipBloom [ Down ${s} ]`, Af.render(t);
    for (let s = this._levels - 2; s >= 0; s--) {
      const n = s === this._levels - 2 ? this._down[s + 1] : this._up[s + 1];
      this._upMaterials[s].texel.value.set(1 / n.width, 1 / n.height);
      t.setRenderTarget(this._up[s]);
      Af.material = this._upMaterials[s];
      Af.name = `MipBloom [ Up ${s} ]`;
      Af.render(t);
    }
    RendererUtils.restoreRendererState(t, cS);
  }
  setup(e) {
    const t = e.getSharedContext(),
      s = a => {
        const l = this.levelFactors[a];
        return mix(l, float(1.2).sub(l), this.radius).mul(this.gain);
      },
      n = (a, l) => Fn(() => {
        const c = uv(),
          u = (p, m) => a(c.add(l.mul(vec2(p * .5, m * .5)))),
          d = u(-2, 2).add(u(2, 2)).add(u(-2, -2)).add(u(2, -2)),
          h = u(0, 2).add(u(-2, 0)).add(u(2, 0)).add(u(0, -2)),
          f = u(-1, 1).add(u(1, 1)).add(u(-1, -1)).add(u(1, -1));
        return u(0, 0).mul(.125).add(d.mul(.03125)).add(h.mul(.0625)).add(f.mul(.125));
      })(),
      r = this.inputNode,
      o = a => this.highPassFn({
        input: r.sample(a),
        threshold: this.threshold,
        smoothWidth: this.smoothWidth
      });
    for (let a = 0; a < this._levels; a++) {
      const l = this._downMaterials[a] || (this._downMaterials[a] = new NodeMaterial()),
        c = l.texel || (l.texel = uniform(new Vector2())),
        u = a === 0 ? null : texture(this._down[a - 1].texture),
        d = a === 0 ? o : h => u.sample(h);
      l.fragmentNode = vec4(n(d, c).rgb, 1).context(t);
      l.name = `MipBloom_down${a}`;
      l.needsUpdate = true;
    }
    for (let a = this._levels - 2; a >= 0; a--) {
      const l = this._upMaterials[a] || (this._upMaterials[a] = new NodeMaterial()),
        c = l.texel || (l.texel = uniform(new Vector2())),
        u = a === this._levels - 2,
        d = texture(u ? this._down[a + 1].texture : this._up[a + 1].texture),
        h = texture(this._down[a].texture);
      let p = Fn(() => {
        const m = uv(),
          A = c.mul(this.spread),
          g = (y, _) => d.sample(m.add(A.mul(vec2(y, _)))).rgb,
          b = g(0, 1).add(g(-1, 0)).add(g(1, 0)).add(g(0, -1)).mul(2),
          x = g(-1, 1).add(g(1, 1)).add(g(-1, -1)).add(g(1, -1));
        return g(0, 0).mul(4).add(b).add(x).div(16);
      })().mul(u ? s(a + 1) : float(1)).add(h.sample(uv()).rgb.mul(s(a)));
      a === 0 && (p = p.mul(this.strength));
      l.fragmentNode = vec4(p, 1).context(t);
      l.name = `MipBloom_up${a}`;
      l.needsUpdate = true;
    }
    return this._textureOutput;
  }
  dispose() {
    for (const e of [...this._down, ...this._up]) e.dispose();
    for (const e of [...this._downMaterials, ...this._upMaterials]) e.dispose();
  }
}
