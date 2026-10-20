// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export function HL({
  stiffness: stiffness,
  falloff: falloff
}) {
  const t = Math.min(Math.max(falloff, .3), .99),
    s = 2 - 2 / Math.PI * Math.asin(t),
    n = stiffness / s,
    r = Math.tan(Math.PI / (2 * s));
  let o = (n - r) / (n - Math.atan(n));
  o = Math.min(o, .97);
  return {
    B: n,
    C: s,
    E: o
  };
}
export function WL(i, e) {
  const t = i.B * e;
  return Math.sin(i.C * Math.atan(t - i.E * (t - Math.atan(t))));
}
export function Ghe(i) {
  return {
    ...i,
    peakTanSlipAngle: Math.tan(i.peakSlipAngle),
    latCurve: HL(i.lateral),
    longCurve: HL(i.longitudinal)
  };
}
export function GS(i, e, t, s, n, r) {
  if (e <= 0) return r.fx = 0, r.fy = 0, r.s = 0, r.mu = 0, r;
  const o = (e - i.nominalLoad) / i.nominalLoad,
    a = Math.min(Math.max(1 - i.loadSensitivity * o, .65), 1.25),
    l = i.mu * n * a,
    c = l * i.longitudinalGrip * e,
    u = l * e,
    d = t / i.peakSlipRatio,
    h = s / i.peakTanSlipAngle,
    f = Math.sqrt(d * d + h * h);
  if (f < 1e-7) return r.fx = 0, r.fy = 0, r.s = 0, r.mu = l, r;
  const p = d / f,
    m = h / f,
    A = WL(i.longCurve, f),
    g = WL(i.latCurve, f),
    b = A * p * p + g * m * m;
  r.fx = c * b * p;
  r.fy = u * b * m;
  r.s = f;
  r.mu = l;
  return r;
}
export const VS = Math.PI * 2 / 60;
export const vd = 60 / (Math.PI * 2);
