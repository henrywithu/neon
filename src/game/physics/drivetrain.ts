// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { VS, vd } from "./tires.ts";
export function So(i, e, t) {
  return i < e ? e : i > t ? t : i;
}
export function Vhe(i, e) {
  if (e <= i[0][0]) return i[0][1];
  const t = i[i.length - 1];
  if (e >= t[0]) return t[1];
  for (let s = 1; s < i.length; s++) if (e <= i[s][0]) {
    const [n, r] = i[s - 1],
      [o, a] = i[s];
    return r + (a - r) * (e - n) / (o - n);
  }
  return t[1];
}
export function createDrivetrain(i) {
  const {
      engine: e,
      gearbox: t,
      clutch: s,
      differential: n
    } = i,
    r = e.idleRpm * VS,
    o = t.ratios.length,
    a = {
      gear: 1,
      engineOmega: r,
      clutch: 0,
      clutchTarget: 0,
      locked: false,
      shifting: false,
      shiftTimer: 0,
      shiftTarget: 1,
      limiterTimer: 0,
      throttle: 0,
      throttleEffective: 0,
      torqueLimit: 1 / 0,
      launching: false,
      launchTorque: 0,
      revTarget: 0,
      launchRpm: 0,
      engineTorque: 0,
      load: 0,
      soundLoad: 0,
      automatic: true,
      stalled: false,
      reverseTimer: 0
    };
  function l(_) {
    return _ === 0 ? 0 : _ < 0 ? -t.reverse * t.finalDrive : t.ratios[_ - 1] * t.finalDrive;
  }
  function c() {
    return a.engineOmega * vd;
  }
  function u(_) {
    return Vhe(e.torqueCurve, _);
  }
  function d(_) {
    return e.frictionTorque + e.frictionPerRpm * Math.max(_, 0);
  }
  function h(_) {
    const w = c(),
      S = _ * u(w),
      T = (1 - _) * d(w);
    return S - T;
  }
  function f(_, w) {
    if (n.type === "open") return 0;
    const S = n.stiffness;
    if (n.type === "locked") return S * _;
    const T = w >= 0 ? n.powerRamp : n.coastRamp,
      v = n.preload + T * Math.abs(w);
    return So(S * _, -v, v);
  }
  function p(_) {
    _ = So(_, -1, o);
    return _ === a.gear || a.shifting ? false : (a.shifting = true, a.shiftTimer = t.shiftTime, a.shiftTarget = _, a.locked = false, true);
  }
  function m() {
    a.gear < o && p(a.gear + 1);
  }
  function A() {
    a.gear > -1 && p(a.gear - 1);
  }
  function g(_, w) {
    const S = w.forwardSpeed;
    let T = w.throttle,
      v = w.brake;
    if (a.automatic && !a.shifting && (a.gear >= 1 && S < .35 && v > .1 && T < .05 ? (a.reverseTimer += _, a.reverseTimer > .3 && (p(-1), a.reverseTimer = 0)) : a.gear === -1 && S > -.6 && T > .1 && v < .05 ? (a.reverseTimer += _, a.reverseTimer > .18 && (p(1), a.reverseTimer = 0)) : a.reverseTimer = 0), a.gear === -1 || a.shifting && a.shiftTarget === -1) {
      const M = T;
      T = v;
      v = M;
    }
    a.shifting && (a.shiftTimer -= _, a.shiftTimer <= t.shiftTime * .5 && a.gear !== a.shiftTarget && (a.gear = a.shiftTarget), a.shiftTimer <= 0 && (a.shifting = false));
    const E = l(a.gear);
    if (a.automatic && !a.shifting && a.gear >= 1) {
      const M = Math.abs(S) / w.wheelRadius * Math.abs(E) * vd,
        B = Math.min(c(), M * 1.06 + 200),
        R = T < .05,
        I = R ? t.upshiftRpm : t.upshiftRpmLight + (t.upshiftRpm - t.upshiftRpmLight) * So(T * 1.25, 0, 1),
        k = R ? t.coastDownshiftRpm ?? t.downshiftRpm : t.downshiftRpm + (t.downshiftRpmKick - t.downshiftRpm) * So((T - .6) / .4, 0, 1);
      if (B > I && a.gear < o && S > 1) p(a.gear + 1);else if (a.gear > 1) {
        const L = M * (l(a.gear - 1) / E);
        c() < k && L < t.upshiftRpm * .93 && p(a.gear - 1);
      }
    }
    const C = l(a.gear);
    if (a.launching = false, a.shifting) {
      const M = 1 - a.shiftTimer / t.shiftTime;
      a.clutchTarget = M < .5 ? 0 : So((M - .5) * 2.4, 0, 1);
    } else if (C === 0) a.clutchTarget = 0;else if (a.locked) {
      const M = Math.abs(C * w.drivenOmega) * vd;
      T < .05 && M < e.idleRpm * 1.3 ? (a.locked = false, a.clutchTarget = 0) : a.clutchTarget = 1;
    } else {
      const M = Math.abs(C * w.drivenOmega) * vd;
      if (T > .02) {
        const B = c(),
          R = So((B - e.idleRpm) / ((a.launchRpm || s.launchRpm) - e.idleRpm), 0, 1);
        a.clutchTarget = Math.max(R * R, a.clutchTarget, .06);
        a.launching = true;
      } else a.clutchTarget = M > e.idleRpm * 1.15 ? 1 : 0;
    }
    a.throttle = T;
    return {
      throttle: T,
      brake: v
    };
  }
  function b(_, w, S, T, v) {
    const E = a.clutchTarget > a.clutch ? 9 : 30;
    a.clutch += So(a.clutchTarget - a.clutch, -E * _, E * _);
    const C = c();
    let M = a.throttle;
    if (a.revTarget > 0) M = Math.min(M, So((a.revTarget + 150 - C) / 400, 0, 1));else if (a.launching && !a.locked) {
      const se = Math.abs(l(a.gear) * (w.omega + S.omega) * .5) * vd,
        re = s.launchLockRpm ?? s.launchRpm + 900,
        le = a.launchRpm || s.launchRpm,
        we = se + le * Math.max(0, 1 - se / re);
      M = Math.min(M, So((we + 200 - C) / 600, 0, 1));
    }
    let B = -1;
    if (a.shifting && a.clutch < .05) {
      const se = l(a.shiftTarget) * (w.omega + S.omega) * .5;
      a.shiftTarget > 0 && Math.abs(se) * vd > C ? B = Math.abs(se) : M = 0;
    }
    C > e.limiterRpm && (a.limiterTimer = e.limiterCut);
    a.limiterTimer > 0 && (a.limiterTimer -= _, M = 0);
    C < e.idleRpm && !a.locked && (M = Math.max(M, So((e.idleRpm - C) / 250, 0, .45)));
    a.throttleEffective = M;
    let R = h(M);
    const I = So(R / Math.max(u(C), 1), -1, 1);
    a.locked && R > a.torqueLimit && (R = Math.max(a.torqueLimit, 0), a.throttleEffective = R / Math.max(u(C), 1));
    a.engineTorque = R;
    a.load = So(R / Math.max(u(C), 1), -1, 1);
    a.soundLoad = a.load + (I - a.load) * .75;
    const k = l(a.gear),
      L = e.inertia,
      F = t.efficiency,
      O = w.effInertia ?? w.inertia,
      H = S.effInertia ?? S.inertia;
    if (k === 0 || a.clutch <= .001) {
      a.locked = false;
      let se = R / L;
      B > 0 && (se += (B - a.engineOmega) * 40);
      a.revTarget > 0 && a.engineOmega > a.revTarget * VS && (se += (a.revTarget * VS - a.engineOmega) * 10);
      a.engineOmega = Math.max(a.engineOmega + se * _, r * .6);
      const re = f(w.omega - S.omega, 0);
      w.omega += (T - re * .5) / O * _;
      S.omega += (v + re * .5) / H * _;
      return;
    }
    const W = (w.omega + S.omega) * .5,
      P = a.engineOmega - k * W;
    if (a.locked && (a.clutchTarget < .999 || a.engineOmega < r * .92) && (a.locked = false), a.locked) {
      const se = L * k * k,
        re = R * k * F,
        le = f(w.omega - S.omega, re),
        we = re * .5 - le * .5 + T,
        Se = re * .5 + le * .5 + v,
        ye = O + se * .25,
        U = H + se * .25,
        J = se * .25,
        Q = ye * U - J * J;
      w.omega += (U * we - J * Se) / Q * _;
      S.omega += (ye * Se - J * we) / Q * _;
      a.engineOmega = k * (w.omega + S.omega) * .5;
      a.engineOmega < 0 && (a.engineOmega = 0);
      return;
    }
    let z = s.maxTorque * a.clutch * Math.tanh(P / s.slipReference);
    z > a.torqueLimit && (z = Math.max(a.torqueLimit, 0));
    a.launching ? (z = Math.min(z, a.launchTorque + s.launchTorqueRate * _), a.launchTorque = Math.max(z, 0)) : a.launchTorque = 0;
    let Y = (R - z) / L;
    B > 0 && (Y += (B - a.engineOmega) * 40);
    a.engineOmega = Math.max(a.engineOmega + Y * _, r * .6);
    const G = z * k * F,
      X = f(w.omega - S.omega, G);
    w.omega += (G * .5 - X * .5 + T) / O * _;
    S.omega += (G * .5 + X * .5 + v) / H * _;
    const ae = a.engineOmega - k * (w.omega + S.omega) * .5,
      ne = a.launching ? 8 : 2;
    a.clutch >= .999 && a.clutchTarget >= .999 && (Math.sign(ae) !== Math.sign(P) || Math.abs(ae) < ne) && (a.locked = true, a.engineOmega = Math.max(k * (w.omega + S.omega) * .5, 0));
  }
  function x(_) {
    if (!a.locked) return _;
    const w = l(a.gear);
    return _ + e.inertia * w * w * .25;
  }
  function y() {
    a.gear = 1;
    a.engineOmega = r;
    a.clutch = 0;
    a.clutchTarget = 0;
    a.locked = false;
    a.shifting = false;
    a.shiftTimer = 0;
    a.limiterTimer = 0;
    a.torqueLimit = 1 / 0;
    a.launching = false;
    a.launchTorque = 0;
    a.revTarget = 0;
    a.launchRpm = 0;
    a.reverseTimer = 0;
  }
  return {
    state: a,
    gearRatio: l,
    engineRpm: c,
    fullTorque: u,
    update: g,
    step: b,
    shiftUp: m,
    shiftDown: A,
    requestShift: p,
    drivenInertia: x,
    reset: y,
    maxGear: o
  };
}
