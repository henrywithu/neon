// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { Vector3, Vector2, MathUtils } from "three/webgpu";
export function Sfe({
  lensRain: lensRain,
  minKmh = 30,
  fullKmh = 240
}) {
  if (!lensRain) return null;
  const {
    uniforms: s
  } = lensRain;
  let n = 0,
    r = 0,
    o = false;
  function a(l, c, u) {
    const d = u && lensRain.enabled ? Math.min(1, Math.max(0, (Math.abs(c) - minKmh) / (fullKmh - minKmh))) : 0,
      h = d > n ? 1.2 : .35;
    n += (d - n) * (1 - Math.exp(-h * l));
    n < .002 && d === 0 && (n = 0);
    const f = Math.min(1, n * 5);
    r += l * (.9 + 2.4 * n);
    s.intensity.value = n;
    s.amount.value = f;
    s.phase.value = r;
    const p = f > 0;
    p !== o && (o = p, lensRain.setActive(o));
  }
  return {
    update: a,
    get intensity() {
      return n;
    }
  };
}
export const Ag = new Vector3();
export function vfe({
  speedBlur: speedBlur,
  camera: camera,
  minKmh = 10,
  fullKmh = 150,
  maxKmh = 280,
  lensFromKmh = 150,
  lensFullKmh = 260,
  lensLow = .2
}) {
  if (!speedBlur) return null;
  const {
    uniforms: l
  } = speedBlur;
  let c = 0,
    u = 0,
    d = 0,
    h = 0;
  const f = new Vector2(.5, .5);
  function p(m, A, g, b, x = 0) {
    var H;
    const y = Math.abs(A),
      _ = b ? MathUtils.clamp((y - minKmh) / (fullKmh - minKmh), 0, 1) : 0,
      w = b ? .25 * MathUtils.clamp((y - fullKmh) / (maxKmh - fullKmh), 0, 1) : 0,
      S = b && x > 0 || speedBlur.previewNitro ? 1 : 0;
    h += (S - h) * (1 - Math.exp(-(S > h ? 7 : 2.5) * m));
    const T = speedBlur.preview ?? -1,
      v = T >= 0 ? T : Math.max(_ ** .7 + w, h * .95),
      E = v > c ? 4 : 6;
    c += (v - c) * (1 - Math.exp(-E * m));
    c < .001 && v === 0 && (c = 0);
    const C = b ? MathUtils.clamp((y - minKmh) / (lensFromKmh - minKmh), 0, 1) ** 1.5 : 0,
      M = b ? MathUtils.smoothstep(y, lensFromKmh, lensFullKmh) : 0,
      B = T >= 0 ? T : Math.max(lensLow * C + (1 - lensLow) * M, h * .95);
    u += (B - u) * (1 - Math.exp(-(B > u ? 3 : 6) * m));
    d += m * (.8 + 2.2 * c);
    const R = Math.hypot(g.x, g.z);
    let I = .5,
      k = .5;
    R > 2 && (Ag.set(g.x / R, 0, g.z / R).multiplyScalar(500).add(camera.position), Ag.project(camera), Ag.z < 1 && (I = MathUtils.clamp(Ag.x * .5 + .5, .3, .7), k = MathUtils.clamp(.5 - Ag.y * .5, .3, .65)));
    const L = 1 - Math.exp(-4 * m);
    f.x += (I - f.x) * L;
    f.y += (k - f.y) * L;
    l.amount.value = c;
    (H = speedBlur.setActive) == null || H.call(speedBlur, c > 0 || T >= 0);
    l.lensAmount.value = u;
    l.phase.value = d;
    const {
      normal: F,
      nitro: O
    } = speedBlur.presets;
    for (const W in F) l[W].value = F[W] + (O[W] - F[W]) * h;
    l.center.value.copy(f);
  }
  return {
    update: p,
    get amount() {
      return c;
    }
  };
}
