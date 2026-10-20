// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { getExperiencePreferences, reducedMotion } from "../platform/experiencePreferences.ts";
import { Color, Vector3, NodeUpdateType } from "three/webgpu";
import { uniform, smoothstep, float, max, vec4, mix, saturation, length, screenUV, vec2, convertToTexture, step, Fn, fract, vec3, dot, sin, floor, abs, pow, sqrt, screenCoordinate, screenSize } from "three/tsl";
import { Ap, cae, aae, lae, nae, rae, oae } from "../shaders/post/edgeChromaticAberration.ts";
import { performanceProfile } from "../platform/performanceProfile.ts";
import GaussianBlurNode from "three/addons/tsl/display/GaussianBlurNode.js";
export function pS([i, e, t]) {
  const s = new Color(i, e, t);
  s.convertSRGBToLinear();
  return new Vector3(s.r, s.g, s.b);
}
export const sl = {
  enabled: .35,
  near: 0,
  far: 50,
  amount: .8,
  colorSrgb: [.34, .37, .47]
};
export function yf(i = sl.colorSrgb, e = {}) {
  return {
    fogEnabled: e.fogEnabled ?? sl.enabled,
    fogNear: e.fogNear ?? sl.near,
    fogFar: e.fogFar ?? sl.far,
    fogColorSrgb: i,
    fogAmount: e.fogAmount ?? sl.amount
  };
}
export function bf({
  fogEnabled: fogEnabled,
  fogNear: fogNear,
  fogFar: fogFar,
  fogColorSrgb: fogColorSrgb,
  fogAmount: fogAmount,
  gradeTint: gradeTint,
  gradeOffset: gradeOffset,
  saturationAmount: saturationAmount,
  contrast: contrast,
  greenSuppress: greenSuppress,
  gradeMix: gradeMix,
  chromaticStrength: chromaticStrength,
  chromaticEdgeFalloff: chromaticEdgeFalloff,
  vignetteIntensity: vignetteIntensity,
  vignetteSmoothness: vignetteSmoothness,
  grainIntensity: grainIntensity,
  exposure = 0,
  hdrPunch = 1
}) {
  return {
    fogEnabled: fogEnabled,
    fogNear: fogNear,
    fogFar: fogFar,
    fogColorSrgb: fogColorSrgb,
    fogAmount: fogAmount,
    gradeTint: gradeTint,
    gradeOffset: gradeOffset,
    saturation: saturationAmount,
    contrast: contrast,
    greenSuppress: greenSuppress,
    gradeMix: gradeMix,
    chromaticStrength: chromaticStrength,
    chromaticEdgeFalloff: chromaticEdgeFalloff,
    vignetteIntensity: vignetteIntensity,
    vignetteSmoothness: vignetteSmoothness,
    grainIntensity: grainIntensity,
    exposure: exposure,
    hdrPunch: hdrPunch
  };
}
export const lookPresets = {
  neutral: {
    label: "Neutral",
    bloom: {
      strength: 3,
      radius: .5
    },
    bloomWide: {
      strength: 1.25,
      radius: 1
    },
    uniforms: bf({
      ...yf([.36, .38, .42]),
      gradeTint: [1, 1, 1],
      gradeOffset: [0, 0, 0],
      saturationAmount: 1,
      contrast: 1,
      greenSuppress: 1,
      gradeMix: 0,
      chromaticStrength: 0,
      chromaticEdgeFalloff: 3,
      vignetteIntensity: 0,
      vignetteSmoothness: .65,
      grainIntensity: 0
    })
  },
  neonNoir: {
    label: "Neon Noir",
    bloom: {
      strength: 1.6,
      radius: .64
    },
    bloomWide: {
      strength: 0,
      radius: 0
    },
    uniforms: bf({
      ...yf([.36, .37, .47], {
        fogNear: -20,
        fogAmount: .71
      }),
      gradeTint: [1.02, .9, 1.06],
      gradeOffset: [.004, -.006, .008],
      saturationAmount: 1.34,
      contrast: 1.4,
      greenSuppress: .4,
      gradeMix: .82,
      exposure: .2,
      hdrPunch: 1.15,
      chromaticStrength: .8,
      chromaticEdgeFalloff: 3.5,
      vignetteIntensity: .8,
      vignetteSmoothness: .64,
      grainIntensity: .12
    })
  },
  magentaRain: {
    label: "Magenta Rain",
    bloom: {
      strength: 5,
      radius: .72
    },
    bloomWide: {
      strength: 2.6,
      radius: 1
    },
    uniforms: bf({
      ...yf([.4, .34, .44]),
      gradeTint: [1.08, .9, 1.08],
      gradeOffset: [.012, -.015, .01],
      saturationAmount: 1.28,
      contrast: 1.12,
      greenSuppress: .68,
      gradeMix: .9,
      chromaticStrength: .85,
      chromaticEdgeFalloff: 3.5,
      vignetteIntensity: .5,
      vignetteSmoothness: .55,
      grainIntensity: .3
    })
  },
  tealDusk: {
    label: "Teal Dusk",
    bloom: {
      strength: 3.6,
      radius: .58
    },
    bloomWide: {
      strength: 1.85,
      radius: .78
    },
    uniforms: bf({
      ...yf([.32, .38, .46]),
      gradeTint: [.94, .98, 1.06],
      gradeOffset: [-.008, 0, .01],
      saturationAmount: 1.06,
      contrast: 1.06,
      greenSuppress: .8,
      gradeMix: .72,
      chromaticStrength: .28,
      chromaticEdgeFalloff: 3,
      vignetteIntensity: .3,
      vignetteSmoothness: .68,
      grainIntensity: .14
    })
  },
  silentHill: {
    label: "Silent Hill",
    bloom: {
      strength: 1.41,
      radius: 1
    },
    bloomWide: {
      strength: 0,
      radius: 0
    },
    uniforms: bf({
      ...yf([.37, .38, .39], {
        fogEnabled: 1,
        fogNear: -20,
        fogFar: 30,
        fogAmount: 1
      }),
      gradeTint: [1, 1, 1],
      gradeOffset: [0, 0, 0],
      saturationAmount: .42,
      contrast: 1.91,
      greenSuppress: 0,
      gradeMix: .24,
      chromaticStrength: .61,
      chromaticEdgeFalloff: 12,
      vignetteIntensity: .63,
      vignetteSmoothness: 0,
      grainIntensity: .48
    })
  },
  sinCity: {
    label: "Sin City",
    bloom: {
      strength: 2.9,
      radius: .59
    },
    bloomWide: {
      strength: 0,
      radius: 0
    },
    uniforms: bf({
      ...yf([.47, 0, .58], {
        fogEnabled: 1,
        fogNear: -13,
        fogFar: 53,
        fogAmount: .83
      }),
      gradeTint: [1, 1, 1],
      gradeOffset: [0, 0, 0],
      saturationAmount: 0,
      contrast: 2,
      greenSuppress: 1,
      gradeMix: 1,
      chromaticStrength: .79,
      chromaticEdgeFalloff: 4.17,
      vignetteIntensity: .77,
      vignetteSmoothness: .24,
      grainIntensity: 0
    })
  }
};
export function N3([i, e, t]) {
  return new Vector3(i, e, t);
}
export function createCyberpunkLook({
  scenePass: scenePass
}) {
  const e = scenePass.getViewZNode().negate(),
    t = scenePass.getLinearDepthNode(),
    s = {
      fogEnabled: uniform(sl.enabled),
      fogNear: uniform(sl.near),
      fogFar: uniform(sl.far),
      fogColor: uniform(pS(sl.colorSrgb)),
      fogAmount: uniform(sl.amount),
      fogDistanceScale: uniform(1),
      fogBloomSuppress: uniform(.75),
      gradeTint: uniform(new Vector3(1.02, .9, 1.06)),
      gradeOffset: uniform(new Vector3(.004, -.006, .008)),
      saturation: uniform(1.06),
      contrast: uniform(1.1),
      greenSuppress: uniform(.72),
      gradeMix: uniform(.7),
      chromaticStrength: uniform(1.33),
      chromaticEdgeFalloff: uniform(1.38),
      vignetteIntensity: uniform(.72),
      vignetteSmoothness: uniform(.64),
      grainIntensity: uniform(.22),
      exposure: uniform(0),
      hdrPunch: uniform(1)
    };
  let n = Ap;
  function r(u) {
    s.fogEnabled.value = u.fogEnabled;
    s.fogNear.value = u.fogNear;
    s.fogFar.value = u.fogFar;
    s.fogColor.value.copy(pS(u.fogColorSrgb));
    s.fogAmount.value = u.fogAmount;
    s.gradeTint.value.copy(N3(u.gradeTint));
    s.gradeOffset.value.copy(N3(u.gradeOffset));
    s.saturation.value = u.saturation;
    s.contrast.value = u.contrast;
    s.greenSuppress.value = u.greenSuppress;
    s.gradeMix.value = u.gradeMix;
    s.chromaticStrength.value = getExperiencePreferences().screenEffects && !reducedMotion() ? u.chromaticStrength : 0;
    s.chromaticEdgeFalloff.value = u.chromaticEdgeFalloff;
    s.vignetteIntensity.value = u.vignetteIntensity;
    s.vignetteSmoothness.value = u.vignetteSmoothness;
    s.grainIntensity.value = getExperiencePreferences().screenEffects && !reducedMotion() ? u.grainIntensity : 0;
    s.exposure.value = u.exposure;
    s.hdrPunch.value = u.hdrPunch;
  }
  function o(u, d) {
    if (!d) return;
    const {
        bloom: h,
        bloomWide: f
      } = u,
      p = h.strength + f.strength * .35;
    d.strength.value = Math.min(p, Math.max(p * performanceProfile.bloomStrengthScale, performanceProfile.bloomStrengthFloor));
    d.radius.value = Math.max(h.radius, f.radius * .55);
  }
  function a(u, {
    bloomPass: bloomPass
  } = {}) {
    const h = lookPresets[u];
    return h ? (n = u, r(h.uniforms), o(h, bloomPass), true) : false;
  }
  function l(u, {
    bloomContribution = null,
    speedBlur = null,
    bloomTex = null,
    lite = false,
    resolutionScale = 1
  } = {}) {
    const A = smoothstep(s.fogNear, s.fogFar, e.div(s.fogDistanceScale)),
      g = smoothstep(float(.68), float(1), t),
      b = max(A, g).mul(s.fogEnabled),
      x = b.mul(s.fogAmount);
    let y = vec4(mix(u.rgb, s.fogColor, x), u.a);
    if (bloomContribution) {
      const I = float(1).sub(b.mul(s.fogBloomSuppress));
      y = y.add(bloomContribution.mul(I));
    }
    const _ = y.rgb.mul(s.gradeTint).add(s.gradeOffset);
    let w = cae(_, s.greenSuppress);
    w = saturation(w, s.saturation);
    w = aae(w, s.contrast);
    const S = vec4(lae(mix(y.rgb, w, s.gradeMix), s.exposure, s.hdrPunch), y.a),
      T = length(screenUV.sub(vec2(.5, .5))).mul(1.6),
      v = float(1).sub(smoothstep(s.vignetteSmoothness, float(1), T).mul(s.vignetteIntensity));
    if (lite && !speedBlur) return vec4(S.rgb.mul(v), S.a);
    const E = convertToTexture(S);
    E.updateBeforeType = NodeUpdateType.FRAME;
    E.setResolutionScale(resolutionScale);
    const C = nae(E, s.chromaticStrength, s.chromaticEdgeFalloff, vec2(.5, .5)),
      M = lite ? E : mix(E, C, step(float(.001), s.chromaticStrength)),
      B = speedBlur ? speedBlur.apply(E, M, {
        bloomTex: bloomTex
      }) : M;
    return vec4(B.rgb.mul(v), B.a);
  }
  function c(u) {
    return rae(u, s.grainIntensity);
  }
  a(Ap);
  return {
    uniforms: s,
    buildComposite: l,
    applyFilmGrain: c,
    applyPreset: a,
    getCurrentPresetId: () => n,
    getPresetLabels: () => oae,
    getPresets: () => lookPresets,
    linearFogColorToSrgb: (u = new Color()) => (u.setRGB(s.fogColor.value.x, s.fogColor.value.y, s.fogColor.value.z), u.convertLinearToSRGB()),
    setFogColorFromSrgb: (u, d, h) => {
      s.fogColor.value.copy(pS([u, d, h]));
    }
  };
}
export const hae = (i, e, t, s = {}) => new GaussianBlurNode(convertToTexture(i), e, t, s);
export const az = Fn(([i]) => {
  const e = fract(vec3(i, i, i).mul(vec3(.1031, .11369, .13787))),
    t = e.add(dot(e, e.yzx.add(19.19)));
  return fract(vec3(t.x.add(t.y).mul(t.z), t.x.add(t.z).mul(t.y), t.y.add(t.z).mul(t.x)));
});
export const fae = Fn(([i]) => fract(sin(i.mul(12345.564)).mul(7658.76)));
export const lz = Fn(([i, e]) => smoothstep(float(0), i, e).mul(smoothstep(float(1), i, e)));
export const w1 = Fn(([i, e, t]) => {
  const s = i,
    n = i.toVar(),
    r = e.mul(.15);
  n.y.addAssign(r.mul(.75));
  const o = vec2(4, 2),
    a = o.mul(2);
  let l = floor(n.mul(a));
  n.y.addAssign(fae(l.x));
  l = floor(n.mul(a));
  const c = az(l.x.mul(35.2).add(l.y.mul(2376.1))),
    u = fract(n.mul(a)).sub(vec2(.5, 0));
  let d = c.x.sub(.5);
  const h = s.y.mul(10),
    f = sin(h.add(sin(h)));
  d = d.add(f.mul(float(.5).sub(abs(d))).mul(c.z.sub(.5)));
  d = d.mul(.7);
  const p = fract(r.add(c.z)),
    m = lz(float(.85), p).sub(.5).mul(.9).add(.5),
    A = vec2(d, m),
    g = length(u.sub(A).mul(o.yx)),
    b = pow(smoothstep(float(.9).mul(t), float(0), g), float(2)),
    x = sqrt(smoothstep(float(1), m, u.y)),
    y = abs(u.x.sub(d)),
    _ = smoothstep(float(.23).mul(x).mul(t), float(.15).mul(x).mul(x).mul(t), y).mul(smoothstep(float(-.02).mul(t), float(.02).mul(t), u.y.sub(m))).mul(x).mul(x),
    w = smoothstep(float(-.02).mul(t), float(.02).mul(t), u.y.sub(m));
  smoothstep(float(.2).mul(x).mul(t), float(0), y);
  const S = s.y,
    T = fract(S.mul(10)).add(u.y.sub(.5)),
    v = length(u.sub(vec2(d, T))),
    E = smoothstep(float(.4).mul(t), float(0), v),
    C = b.add(E.mul(x).mul(w)),
    M = float(1).sub(g).mul(.5),
    B = C.add(_.mul(.35));
  return vec2(B, M);
});
export const cz = Fn(([i, e, t]) => {
  const s = i.mul(40).toVar(),
    n = floor(s);
  s.assign(fract(s).sub(.5));
  const r = az(n.x.mul(107.45).add(n.y.mul(3543.654))),
    o = r.xy.sub(.5).mul(.7),
    a = length(s.sub(o)),
    l = lz(float(.025), fract(e.add(r.z)));
  return pow(smoothstep(float(.4).mul(t), float(0), a), float(1.8)).mul(fract(r.z.mul(10))).mul(l);
});
export const gS = Fn(([i, e, t, s, n, r]) => {
  const o = cz(i, e, r).mul(t),
    a = w1(i, e, r),
    l = w1(i.mul(1.85), e, r),
    c = smoothstep(float(.3), float(1), o.add(a.x).add(l.x));
  return vec2(c, max(a.y.mul(t), l.y.mul(s)));
});
export const AS = Fn(([i, e, t, s, n, r]) => {
  const o = cz(i, e, r).mul(t),
    a = w1(i, e, r),
    l = w1(i.mul(1.85), e, r),
    c = smoothstep(float(.3), float(1), o.add(a.x.mul(s)).add(l.x.mul(n)));
  return vec2(c, max(a.y.mul(s), l.y.mul(n)));
});
export const pae = () => vec2(screenCoordinate.x.sub(screenSize.x.mul(.5)).div(screenSize.y), screenSize.y.mul(.5).sub(screenCoordinate.y).div(screenSize.y));
