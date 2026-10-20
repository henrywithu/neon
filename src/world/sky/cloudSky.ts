// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { RepeatWrapping, SRGBColorSpace, LinearFilter, TextureLoader, NodeMaterial, Vector2, Color, Vector3, MathUtils, SphereGeometry, Mesh, BackSide } from "three/webgpu";
import { goe } from "../effects/flyingPlanes.ts";
import { uniform, texture, varyingProperty, Fn, modelViewProjection, vec2, sub, float, smoothstep, min, abs, mix, clamp, vec4, uv } from "three/tsl";
export const Aoe = "/custom_perlin.webp";
export function C3(i) {
  i.wrapS = RepeatWrapping;
  i.wrapT = RepeatWrapping;
  i.colorSpace = SRGBColorSpace;
  i.minFilter = LinearFilter;
  i.magFilter = LinearFilter;
  i.generateMipmaps = false;
  i.needsUpdate = true;
  return i;
}
export async function yoe() {
  const i = new TextureLoader(),
    [e, t] = await Promise.all([i.loadAsync(goe), i.loadAsync(Aoe)]);
  return {
    noise: C3(e),
    perlin: C3(t)
  };
}
export function createCloudMaterial({
  noiseTex: noiseTex,
  perlinTex: perlinTex
}) {
  const t = new NodeMaterial(),
    s = uniform(0),
    n = uniform(1.45),
    r = uniform(1.3),
    o = uniform(15.5),
    a = uniform(1.8),
    l = uniform(1),
    c = uniform(1),
    u = uniform(.9),
    d = uniform(.95),
    h = uniform(.5),
    f = uniform(new Vector2(.5, .25)),
    p = uniform(new Color("#b1b6d7")),
    m = uniform(new Color("#f8f2fb")),
    A = uniform(new Vector3(.86, .9, .95)),
    g = uniform(new Vector3(1.55, 1.4, 1.16)),
    b = uniform(new Vector3(.5, .6, .7)),
    x = uniform(1e-4),
    y = uniform(new Color(7324671)),
    _ = uniform(new Color(11921151)),
    w = texture(noiseTex),
    S = texture(perlinTex),
    T = varyingProperty("vec2", "vCloudUv"),
    v = Fn(() => {
      T.assign(uv());
      const C = modelViewProjection;
      C.z.assign(C.w);
      return C;
    })(),
    E = Fn(() => {
      const C = T.toVar("dUv"),
        M = s.mul(.5).mul(n),
        B = f.mul(vec2(-.04, -.025)).mul(M),
        R = f.mul(vec2(.005, .01)).mul(M),
        I = f.mul(-.036).mul(M),
        k = T.mul(.2).mul(o).add(B).add(h.mul(.1)),
        L = T.mul(.08).mul(o).add(R).add(h.mul(.05)),
        F = T.mul(.5).mul(o).add(I).add(h.mul(.02));
      C.y.addAssign(a.mul(.3).mul(sub(texture(w, k).r, .5)));
      C.y.subAssign(a.mul(.5).mul(sub(texture(w, L).r, .5)));
      C.y.mulAssign(float(1).add(a.mul(.1).mul(sub(texture(S, F).r, .5))));
      const O = f.mul(vec2(-.08, -.04)).mul(M),
        H = smoothstep(.4, .7, texture(w, T.mul(.08).mul(o).add(O)).r).mul(c);
      let W = smoothstep(float(.9).sub(H.mul(.1)), .7, C.y).mul(r).toVar("clouds");
      W.mulAssign(smoothstep(0, .2, C.y.sub(float(.2).mul(smoothstep(.4, 1, T.x)))));
      const P = f.mul(vec2(0, -.3).mul(M).mul(.1)),
        z = T.mul(.7).mul(o).add(P).add(h.mul(.03));
      z.addAssign(texture(w, T.mul(.5).mul(o)).rg.mul(.04));
      const Y = texture(w, z).r.mul(texture(w, T.mul(1.2).mul(o)).r),
        G = float(.4).mul(smoothstep(.45, .75, Y)).mul(r),
        X = f.mul(vec2(M.mul(.3))),
        ae = texture(w, vec2(1.2, .6).mul(T).mul(o).add(texture(S, T).rg.mul(.02)).add(texture(w, T.mul(.8).mul(o)).rg.mul(.04)).add(X).add(h.mul(.08))).r,
        ne = float(.3).mul(smoothstep(.4, .7, ae)).mul(l);
      W.addAssign(G);
      W.addAssign(ne);
      W.assign(smoothstep(.2, .9, W.mul(u)));
      W.assign(min(W, 1));
      let se = W.mul(smoothstep(1, .95, T.y)).mul(smoothstep(0, .05, T.y)).mul(smoothstep(0, .05, T.x)).mul(smoothstep(1, .95, T.x)).toVar("alpha");
      se.mulAssign(smoothstep(0, .15, abs(T.y.sub(.5))));
      se.mulAssign(smoothstep(0, .1, abs(T.y.sub(.5))));
      se.assign(min(se, 1).mul(d));
      const re = smoothstep(.35, 1, C.y).add(smoothstep(.35, 0, C.y)),
        le = W.mul(.7).add(.25),
        we = p.mul(A),
        Se = m.mul(g);
      let ye = mix(we, Se, le.mul(re));
      ye.assign(mix(ye, ye.mul(b), W.mul(x)));
      const U = mix(_, y, clamp(T.y, 0, 1));
      ye.assign(mix(ye, U, smoothstep(.99, 0, se)));
      const J = mix(U, ye, se);
      return vec4(J, 1);
    })();
  t.vertexNode = v;
  t.colorNode = E;
  t.transparent = false;
  t.depthWrite = false;
  t.depthTest = true;
  return {
    material: t,
    uniforms: {
      uTime: s,
      uSpeed: n,
      uCloudDensity: r,
      uNoiseScale: o,
      uDistortionStrength: a,
      uDetailAmount: l,
      uSmoothness: c,
      uContrast: u,
      uOpacity: d,
      uInstanceSeed: h,
      uWindDirection: f,
      uCloudDarkColor: p,
      uCloudLightColor: m,
      uDarkMultiplier: A,
      uLightMultiplier: g,
      uDensityDarkening: b,
      uDensityStrength: x,
      uSkyTop: y,
      uSkyBottom: _
    }
  };
}
export const xoe = {
  windDirection: new Vector2(.5, .25),
  cloudDensity: .9,
  noiseScale: 12.5,
  distortionStrength: 1.8,
  contrast: .9,
  opacity: .95,
  cloudDarkColor: new Color("#b1b6d7"),
  cloudLightColor: new Color("#f8f2fb"),
  lightMultiplier: new Vector3(1.55, 1.4, 1.16),
  densityStrength: 1e-4,
  speed: 1.45,
  detailAmount: 1,
  smoothness: 1
};
export const _oe = {
  windDirection: new Vector2(-.5, .2),
  cloudDensity: .8,
  noiseScale: 15,
  distortionStrength: 1.2,
  contrast: 1,
  opacity: .9,
  cloudDarkColor: new Color("#dd954e"),
  cloudLightColor: new Color("#ffe4bf"),
  lightMultiplier: new Vector3(1.4, 1.32, 1.18),
  densityStrength: .2,
  speed: 1.45,
  detailAmount: 1,
  smoothness: 1
};
export const woe = {
  windDirection: new Vector2(.35, -.15),
  cloudDensity: .64,
  noiseScale: 10.5,
  distortionStrength: 1.6,
  contrast: 1.3,
  opacity: .36,
  cloudDarkColor: new Color("#d8d0e8"),
  cloudLightColor: new Color("#595a7d"),
  lightMultiplier: new Vector3(.58, .58, .82),
  densityStrength: .56,
  speed: 1.8,
  detailAmount: 1,
  smoothness: 1
};
export function Uc(i) {
  return `#${i.getHexString()}`;
}
export function zc(i) {
  return typeof i == "number" ? `#${i.toString(16).padStart(6, "0")}` : i;
}
export function B3(i, e, t) {
  return {
    windDirection: i.windDirection.clone().lerp(e.windDirection, t),
    cloudDensity: MathUtils.lerp(i.cloudDensity, e.cloudDensity, t),
    noiseScale: MathUtils.lerp(i.noiseScale, e.noiseScale, t),
    distortionStrength: MathUtils.lerp(i.distortionStrength, e.distortionStrength, t),
    contrast: MathUtils.lerp(i.contrast, e.contrast, t),
    opacity: MathUtils.lerp(i.opacity, e.opacity, t),
    cloudDarkColor: i.cloudDarkColor.clone().lerp(e.cloudDarkColor, t),
    cloudLightColor: i.cloudLightColor.clone().lerp(e.cloudLightColor, t),
    lightMultiplier: i.lightMultiplier.clone().lerp(e.lightMultiplier, t),
    densityStrength: MathUtils.lerp(i.densityStrength, e.densityStrength, t),
    speed: MathUtils.lerp(i.speed, e.speed, t),
    detailAmount: MathUtils.lerp(i.detailAmount, e.detailAmount, t),
    smoothness: MathUtils.lerp(i.smoothness, e.smoothness, t)
  };
}
export function R3(i) {
  return new SphereGeometry(i, 32, 32, 0, Math.PI * 2, 0, Math.PI);
}
export async function createCloudSky(i, {
  radius = 135,
  verticalOffset = -33.5
} = {}) {
  const {
      noise: s,
      perlin: n
    } = await yoe(),
    {
      material: r,
      uniforms: o
    } = createCloudMaterial({
      noiseTex: s,
      perlinTex: n
    });
  let a = radius;
  const l = new Mesh(R3(a), r);
  l.name = "CloudSky";
  l.frustumCulled = false;
  l.renderOrder = 100;
  r.side = BackSide;
  i.add(l);
  const c = {
    enabled: true,
    radius: a,
    verticalOffset: verticalOffset,
    speed: o.uSpeed.value,
    cloudDensity: o.uCloudDensity.value,
    noiseScale: o.uNoiseScale.value,
    distortionStrength: o.uDistortionStrength.value,
    detailAmount: o.uDetailAmount.value,
    smoothness: o.uSmoothness.value,
    contrast: o.uContrast.value,
    opacity: o.uOpacity.value,
    densityStrength: o.uDensityStrength.value,
    windX: o.uWindDirection.value.x,
    windY: o.uWindDirection.value.y,
    skyTop: Uc(o.uSkyTop.value),
    skyBottom: Uc(o.uSkyBottom.value),
    cloudDarkColor: Uc(o.uCloudDarkColor.value),
    cloudLightColor: Uc(o.uCloudLightColor.value)
  };
  function u() {
    c.speed = o.uSpeed.value;
    c.cloudDensity = o.uCloudDensity.value;
    c.noiseScale = o.uNoiseScale.value;
    c.distortionStrength = o.uDistortionStrength.value;
    c.detailAmount = o.uDetailAmount.value;
    c.smoothness = o.uSmoothness.value;
    c.contrast = o.uContrast.value;
    c.opacity = o.uOpacity.value;
    c.densityStrength = o.uDensityStrength.value;
    c.windX = o.uWindDirection.value.x;
    c.windY = o.uWindDirection.value.y;
    c.skyTop = Uc(o.uSkyTop.value);
    c.skyBottom = Uc(o.uSkyBottom.value);
    c.cloudDarkColor = Uc(o.uCloudDarkColor.value);
    c.cloudLightColor = Uc(o.uCloudLightColor.value);
  }
  function d(O) {
    o.uWindDirection.value.copy(O.windDirection);
    o.uCloudDensity.value = O.cloudDensity;
    o.uNoiseScale.value = O.noiseScale;
    o.uDistortionStrength.value = O.distortionStrength;
    o.uContrast.value = O.contrast;
    o.uOpacity.value = O.opacity;
    o.uCloudDarkColor.value.copy(O.cloudDarkColor);
    o.uCloudLightColor.value.copy(O.cloudLightColor);
    o.uLightMultiplier.value.copy(O.lightMultiplier);
    o.uDensityStrength.value = O.densityStrength;
    O.speed != null && (o.uSpeed.value = O.speed);
    O.detailAmount != null && (o.uDetailAmount.value = O.detailAmount);
    O.smoothness != null && (o.uSmoothness.value = O.smoothness);
    u();
  }
  function h({
    evening = 0,
    night = 0,
    skyTop: skyTop,
    skyBottom: skyBottom
  }) {
    skyTop && o.uSkyTop.value.copy(skyTop);
    skyBottom && o.uSkyBottom.value.copy(skyBottom);
    const z = B3(xoe, _oe, evening),
      Y = B3(z, woe, night);
    d(Y);
  }
  function f(O, H) {
    l.position.set(O.position.x, O.position.y - c.verticalOffset, O.position.z);
    o.uTime.value = H;
  }
  function p(O) {
    c.enabled = !!O;
    l.visible = c.enabled;
  }
  function m(O) {
    p(O);
  }
  function A(O) {
    const H = Math.max(1, O);
    if (H === a) {
      c.radius = H;
      return;
    }
    a = H;
    c.radius = H;
    l.geometry.dispose();
    l.geometry = R3(a);
  }
  function g(O) {
    c.verticalOffset = O;
  }
  function b(O) {
    c.speed = O;
    o.uSpeed.value = O;
  }
  function x(O) {
    c.cloudDensity = O;
    o.uCloudDensity.value = O;
  }
  function y(O) {
    c.noiseScale = O;
    o.uNoiseScale.value = O;
  }
  function _(O) {
    c.distortionStrength = O;
    o.uDistortionStrength.value = O;
  }
  function w(O) {
    c.detailAmount = O;
    o.uDetailAmount.value = O;
  }
  function S(O) {
    c.smoothness = O;
    o.uSmoothness.value = O;
  }
  function T(O) {
    c.contrast = O;
    o.uContrast.value = O;
  }
  function v(O) {
    c.opacity = O;
    o.uOpacity.value = O;
  }
  function E(O) {
    c.densityStrength = O;
    o.uDensityStrength.value = O;
  }
  function C(O) {
    c.windX = O;
    o.uWindDirection.value.x = O;
  }
  function M(O) {
    c.windY = O;
    o.uWindDirection.value.y = O;
  }
  function B(O) {
    const H = zc(O);
    c.skyTop = H;
    o.uSkyTop.value.set(H);
  }
  function R(O) {
    const H = zc(O);
    c.skyBottom = H;
    o.uSkyBottom.value.set(H);
  }
  function I(O) {
    const H = zc(O);
    c.cloudDarkColor = H;
    o.uCloudDarkColor.value.set(H);
  }
  function k(O) {
    const H = zc(O);
    c.cloudLightColor = H;
    o.uCloudLightColor.value.set(H);
  }
  function L() {
    console.log("[CloudSky] config", {
      ...c,
      skyTop: zc(c.skyTop),
      skyBottom: zc(c.skyBottom),
      cloudDarkColor: zc(c.cloudDarkColor),
      cloudLightColor: zc(c.cloudLightColor)
    });
  }
  function F() {
    i.remove(l);
    l.geometry.dispose();
    r.dispose();
    s.dispose();
    n.dispose();
  }
  return {
    mesh: l,
    material: r,
    uniforms: o,
    params: c,
    update: f,
    updateFromSun: h,
    setEnabled: p,
    setVisible: m,
    setRadius: A,
    setVerticalOffset: g,
    setSpeed: b,
    setCloudDensity: x,
    setNoiseScale: y,
    setDistortionStrength: _,
    setDetailAmount: w,
    setSmoothness: S,
    setContrast: T,
    setOpacity: v,
    setDensityStrength: E,
    setWindX: C,
    setWindY: M,
    setSkyTop: B,
    setSkyBottom: R,
    setCloudDarkColor: I,
    setCloudLightColor: k,
    logConfig: L,
    dispose: F
  };
}
