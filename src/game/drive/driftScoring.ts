// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const Ab = Math.PI / 180;
export const IG = "trapnest-neon:drift-best";
export function dfe() {
  try {
    const i = Number(localStorage.getItem(IG));
    return Number.isFinite(i) && i > 0 ? i : 0;
  } catch {
    return 0;
  }
}
export function hfe(i) {
  try {
    localStorage.setItem(IG, String(i));
  } catch {}
}
export const ffe = [[5500, "INSANE DRIFT"], [4200, "SUPER DRIFT"], [3e3, "GREAT DRIFT"], [1800, "GOOD DRIFT"], [0, "DRIFT"]];
export const pfe = i => ffe.find(([e]) => i >= e)[1];
export function createDriftScoring({
  minKmh = 30,
  minAngle = 12 * Ab,
  rate = .05,
  step = 2,
  maxMultiplier = 5,
  grace = 2
} = {}) {
  const o = {
      total: 0,
      best: dfe(),
      combo: 0,
      multiplier: 1,
      chainTime: 0,
      graceLeft: 0,
      inChain: false,
      drifting: false,
      angle: 0,
      kmh: 0,
      rating: ""
    },
    a = [];
  let l = 1;
  function c() {
    o.inChain = false;
    o.combo = 0;
    o.multiplier = 1;
    o.chainTime = 0;
    o.graceLeft = 0;
  }
  function u() {
    const f = Math.round(o.combo);
    f > 0 && (o.total += f, f > o.best && (o.best = f, hfe(f)), a.push({
      type: "bank",
      points: f,
      multiplier: o.multiplier
    }));
    c();
  }
  function d(f, p) {
    const m = Math.abs(p.drifting ? p.driftAngle : p.slipAngleBody),
      A = Math.abs(p.travelKmh ?? p.speedKmh),
      g = p.wheelsOnGround >= 2 && A > minKmh && m > minAngle;
    o.drifting = g;
    o.angle = g ? m / Ab : 0;
    o.kmh = g ? A : 0;
    g && (o.rating = pfe(A * (m / Ab)));
    g ? (o.inChain || (c(), o.inChain = true), o.chainTime += f, o.multiplier = Math.min(maxMultiplier, 1 + Math.floor(o.chainTime / step)), o.combo += f * A * (m / Ab) * rate * o.multiplier * l, o.graceLeft = grace) : o.inChain && (o.graceLeft -= f, o.graceLeft <= 0 && u());
  }
  function h() {
    if (!o.inChain) return;
    const f = Math.round(o.combo);
    c();
    f > 0 && a.push({
      type: "lost",
      points: f
    });
  }
  return {
    state: o,
    update: d,
    crash: h,
    setBonus(f) {
      l = Math.max(1, f);
    },
    get bonus() {
      return l;
    },
    bank: () => o.inChain && u(),
    nextEvent: () => a.shift() ?? null,
    stepProgress: () => o.multiplier >= maxMultiplier ? 1 : o.chainTime % step / step,
    graceFraction: () => o.inChain ? Math.max(0, o.graceLeft) / grace : 0
  };
}
