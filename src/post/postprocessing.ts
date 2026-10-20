// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Node, RenderPipeline, BlendMode, NormalBlending, UnsignedByteType, NodeUpdateType } from "three/webgpu";
import { float, uniform, pass, output, vec4, emissive, packNormalToRGB, normalView, mrt, sample, unpackRGBToNormal, convertToTexture, Fn, max, mix, smoothstep } from "three/tsl";
import { oz, Goe, Woe, Noe, Koe } from "../world/lighting.ts";
import { performanceProfile } from "../platform/performanceProfile.ts";
import { Zoe, tae } from "../shaders/post/sharpUpscale.ts";
import { createCyberpunkLook } from "./cyberpunkLook.ts";
import { createLensRain } from "./lensRain.ts";
import { createSpeedBlur } from "./speedBlur.ts";
import { FEATURES } from "../world/createWorld.ts";
import { createRainGlassUniforms, createRainGlassShader } from "../shaders/rainGlass.ts";
import { Yoe } from "../shaders/post/mipBloom.ts";
export class xae extends Node {
  constructor() {
    super("float");
  }
  setup(e) {
    var t;
    return float(((t = e.material) == null ? undefined : t.depthWrite) === false ? 0 : 1);
  }
}
export function _ae(i, e) {
  const t = i._renderContexts,
    s = t.get;
  t.get = function (n = null, r = null, o = 0) {
    return s.call(this, n, r, n === e ? 0 : o);
  };
}
export function wae(i, e) {
  const t = oz(i),
    s = t.setSize.bind(t);
  t.setSize = (n, r) => s(Math.max(1, Math.floor(n * e)), Math.max(1, Math.floor(r * e)));
  return t;
}
export function createPostprocessing(i, e, t, {
  rain: rain,
  smoke: smoke
} = {}) {
  var Te;
  const r = new RenderPipeline(i),
    o = (rain == null ? undefined : rain.layer) ?? null,
    a = (smoke == null ? undefined : smoke.layer) ?? null,
    l = (rain == null ? undefined : rain.useDedicatedPass) !== false && o !== null,
    c = t.clone();
  o !== null && (l ? c.layers.disable(o) : c.layers.enable(o));
  a !== null && c.layers.enable(a);
  const u = l && o !== null ? (() => {
    const ue = t.clone();
    ue.layers.disable(0);
    ue.layers.enable(o);
    return ue;
  })() : null;
  function d(ue) {
    c.copy(ue, false);
    o !== null && (l ? c.layers.disable(o) : c.layers.enable(o));
    a !== null && c.layers.enable(a);
    c.updateMatrixWorld(true);
    u && (u.copy(ue, false), u.layers.disable(0), u.layers.enable(o), u.updateMatrixWorld(true));
  }
  d(t);
  let h = performanceProfile.fsr,
    f = performanceProfile.renderScale;
  const p = uniform(performanceProfile.fsrSharpness),
    m = () => h ? f : 1,
    A = pass(e, c);
  A.transparent = true;
  _ae(i, A.renderTarget);
  A.setResolutionScale(m());
  function g(ue) {
    const $ = {
      output: output,
      emissive: vec4(emissive, output.a)
    };
    ue && ($.normal = vec4(packNormalToRGB(normalView), new xae()));
    const q = mrt($);
    q.setBlendMode("emissive", new BlendMode(NormalBlending));
    ue && q.setBlendMode("normal", new BlendMode(NormalBlending));
    return q;
  }
  const b = A.getTextureNode("output"),
    x = A.getTextureNode("emissive");
  A.getTexture("emissive").type = UnsignedByteType;
  A.getTexture("output").type = UnsignedByteType;
  const y = A.getTexture("normal");
  y.type = UnsignedByteType;
  let _ = true;
  function w(ue) {
    if (ue === _) return;
    _ = ue;
    const $ = A.renderTarget.textures,
      q = $.indexOf(y);
    ue && q === -1 ? $.push(y) : !ue && q !== -1 && $.splice(q, 1);
    A.setMRT(g(ue));
    A.renderTarget.dispose();
  }
  A.setMRT(g(true));
  const S = A.getTextureNode("depth"),
    T = sample(ue => unpackRGBToNormal(A.getTextureNode("normal").sample(ue))),
    v = Goe(S, T, c);
  let E = performanceProfile.aoResolutionScale;
  v.resolutionScale = E * m();
  v.samples.value = performanceProfile.aoSamples;
  v.radius.value = performanceProfile.aoRadius;
  v.scale.value = performanceProfile.aoScale;
  v.thickness.value = performanceProfile.aoThickness;
  v.distanceExponent.value = performanceProfile.aoDistanceExponent;
  v.distanceFallOff.value = performanceProfile.aoDistanceFallOff;
  v.useTemporalFiltering = false;
  const C = convertToTexture(Woe(v.getTextureNode(), S, T, c));
  C.updateBeforeType = NodeUpdateType.FRAME;
  C.setResolutionScale(E * m());
  let M = null,
    B = null;
  u && (M = pass(e, u), B = M.getTextureNode("output"));
  const R = performanceProfile.bloomMode === "unreal" ? Noe(x, 2.5, .45) : Zoe(x, 2.5, .45);
  let I = performanceProfile.bloomResolutionScale;
  R.setResolutionScale(I * m());
  R.highPassFn = Fn(({
    input: input,
    threshold: threshold,
    smoothWidth: smoothWidth
  }) => {
    const oe = max(input.r, max(input.g, input.b));
    return mix(vec4(0), input, smoothstep(threshold, threshold.add(smoothWidth), oe));
  });
  const k = createCyberpunkLook({
    scenePass: A
  });
  let L = performanceProfile.bloom,
    F = performanceProfile.ao;
  w(F);
  let O = ((Te = rain == null ? undefined : rain.params) == null ? undefined : Te.enabled) ?? !!B,
    H = null,
    W = null,
    P = null;
  const z = performanceProfile.lensRain ? createLensRain({
      resolutionScale: performanceProfile.lensRainResolutionScale
    }) : null,
    Y = performanceProfile.speedBlur ? createSpeedBlur({
      samples: performanceProfile.speedBlurSamples
    }) : null,
    G = FEATURES.intro && performanceProfile.introGlass;
  let X = G,
    ae = null,
    ne = null,
    se = performanceProfile.smaa,
    re = performanceProfile.aaFilter,
    le = performanceProfile.upscaleFilter;
  G && (ne = createRainGlassUniforms(), ae = {
    speed: ne.speed,
    intensity: ne.intensity,
    distortionStrength: ne.distortionStrength,
    dropSize: ne.dropSize,
    blurRadius: ne.blurRadius,
    amount: ne.amount
  });
  function we() {
    return L ? R : null;
  }
  function Se() {
    let ue = z ? z.apply(b) : b;
    if (F) {
      const $ = C.r,
        q = x.rgb;
      ue = vec4(ue.rgb.sub(q).max(0).mul($).add(q), ue.a);
    }
    l && O && B && (ue = ue.add(B.rgb.mul(B.a)));
    return ue;
  }
  let ye = false,
    U = null,
    J = null;
  function Q() {
    const ue = Se(),
      $ = performanceProfile.postLite;
    if (U = j(ue, Y), J = $ && Y ? j(ue, null) : U, H = U.plain, U.antialiased, W = H, X && ne) {
      const q = createRainGlassShader(H, ne);
      P = mix(H, q, ne.amount);
    }
    r.outputNode = K();
    r.needsUpdate = true;
  }
  function j(ue, $) {
    var Lt;
    const q = we(),
      oe = performanceProfile.postLite,
      xe = m(),
      me = k.buildComposite(ue, {
        bloomContribution: q,
        speedBlur: $,
        bloomTex: L ? R.getTextureNode() : null,
        lite: oe,
        resolutionScale: xe
      }),
      ie = convertToTexture(me);
    ie.updateBeforeType = NodeUpdateType.FRAME;
    ie.setResolutionScale(xe);
    let Ne;
    re === "fxaa" ? Ne = Koe(ie) : Ne = h ? wae(ie, xe) : oz(ie);
    const ze = mt => le === "easu" ? Yoe(mt, p) : tae(mt, p);
    let tt = Ne;
    if (h) {
      let mt = Ne.isTextureNode ? Ne : (Lt = Ne.getTextureNode) == null ? undefined : Lt.call(Ne);
      mt || (mt = convertToTexture(Ne), mt.setResolutionScale(xe));
      tt = ze(mt);
    }
    const dt = h ? ze(ie) : me;
    return {
      plain: oe ? dt : k.applyFilmGrain(dt),
      antialiased: oe ? tt : k.applyFilmGrain(tt)
    };
  }
  function de() {
    const ue = r.outputNode;
    for (const $ of new Set([U, J])) r.outputNode = se ? $.antialiased : $.plain, r.needsUpdate = true, r.render();
    r.outputNode = ue;
    r.needsUpdate = true;
  }
  Y && (Y.setActive = ue => {
    const $ = !!ue;
    $ !== ye && (ye = $, !(J === U || X) && (r.outputNode = K(), r.needsUpdate = true));
  });
  Q();
  function K() {
    if (X && P) return P;
    const ue = ye ? U : J;
    return se ? ue.antialiased : ue.plain;
  }
  r.outputNode = K();
  function V() {
    X && (X = false, ne = null, P = null, ae = null, r.outputNode = K(), r.needsUpdate = true);
  }
  function te(ue) {
    const $ = !!ue;
    $ !== O && (O = $, Q());
  }
  if (rain != null && rain.setEnabled) {
    const ue = rain.setEnabled.bind(rain);
    rain.setEnabled = $ => {
      ue($);
      te($);
    };
  }
  function fe() {
    r.outputNode = K();
    r.needsUpdate = true;
  }
  function Ce(ue) {
    L = !!ue;
    Q();
  }
  function Ue(ue) {
    I = ue;
    R.setResolutionScale(I * m());
  }
  function Ae(ue) {
    se = !!ue;
    r.outputNode = K();
    r.needsUpdate = true;
  }
  function Be(ue) {
    F = !!ue;
    w(F);
    Q();
  }
  function He(ue) {
    E = ue;
    v.resolutionScale = E * m();
    C.setResolutionScale(E * m());
  }
  function at({
    enabled = h,
    scale = f,
    sharpness = p.value,
    filter = le
  } = {}) {
    p.value = sharpness;
    const xe = !!enabled,
      me = Math.min(1, Math.max(.25, scale));
    xe === h && me === f && filter === le || (h = xe, le = filter, f = me, A.setResolutionScale(m()), Ue(I), He(E), Q());
  }
  function Re(ue) {
    ue !== re && (re = ue, Q());
  }
  function Fe(ue) {
    v.samples.value = ue;
  }
  function Je(ue, $ = {}) {
    return k.applyPreset(ue, {
      bloomPass: R,
      ...$
    });
  }
  function je() {
    const ue = Math.max(1, i.domElement.width),
      $ = Math.max(1, i.domElement.height);
    A.setSize(ue, $);
    M == null || M.setSize(ue, $);
  }
  return {
    post: r,
    scenePass: A,
    beautyCamera: c,
    sceneCamera: c,
    rainCamera: u,
    syncCameras: d,
    bloomPass: R,
    aoPass: v,
    look: k,
    applyLookPreset: Je,
    restoreCombinedOutput: fe,
    resizePostProcessing: je,
    scenePassColor: b,
    scenePassEmissive: x,
    get composedOutput() {
      return W;
    },
    setRainPassEnabled: te,
    get introRainGlass() {
      return ae;
    },
    lensRain: z,
    speedBlur: Y,
    disposeIntroRainGlass: V,
    warmOutputVariants: de,
    perf: {
      setBloomEnabled: Ce,
      setBloomResolutionScale: Ue,
      setSmaaEnabled: Ae,
      setAoEnabled: Be,
      setAoResolutionScale: He,
      setAoSamples: Fe,
      setUpscale: at,
      setAaFilter: Re
    }
  };
}
