// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
export const qhe = 100 / 3.6;
export function Hhe(i, e, t) {
  return i < e ? e : i > t ? t : i;
}
export function Whe(i) {
  const e = {
    phase: "off",
    needle: 0,
    grade: "",
    count: 0,
    time: 0,
    t100: NaN,
    revTarget: 0,
    launchRpm: 0,
    push: 0,
    forceNitro: false,
    blockNitro: false,
    muteHandbrake: false
  };
  let t = 1,
    s = -1;
  function n(l) {
    const [c, u] = i.zone;
    return l >= c && l <= u ? "rocket" : l >= c - i.goodMargin && l <= u + i.goodMargin ? "good" : l < c ? "bog" : "spin";
  }
  function r(l) {
    e.grade = n(e.needle);
    e.phase = "launch";
    e.time = 0;
    e.t100 = NaN;
    e.count += 1;
    e.muteHandbrake = l.handbrake > .1;
    s = 0;
  }
  function o(l, c) {
    e.muteHandbrake && c.handbrake < .1 && (e.muteHandbrake = false);
    const u = Math.abs(c.speed) < i.armSpeed && c.gear >= 1 && c.wheelsOnGround >= 3 && c.brake < .1,
      d = c.throttle > .5 && c.handbrake > .5 && !e.muteHandbrake;
    switch (e.phase) {
      case "off":
      case "blocked":
        e.phase = u && d ? c.nitroCharge >= i.minCharge ? "armed" : "blocked" : "off";
        break;
      case "armed":
        !u || !d ? e.phase = "off" : c.nitro > .5 && (e.phase = "timing", e.needle = 0, t = 1);
        break;
      case "timing":
        c.throttle <= .5 || c.brake > .1 || c.gear < 1 || c.wheelsOnGround < 3 ? e.phase = "off" : c.nitro < .5 || c.handbrake < .5 ? r(c) : (e.needle += t * l / i.sweep, e.needle >= 1 ? (e.needle = 2 - e.needle, t = -1) : e.needle <= 0 && (e.needle = -e.needle, t = 1));
        break;
      case "launch":
        {
          e.time += l;
          const p = e.grade === "bog" || e.grade === "spin";
          (e.time > (p ? i.missLockout : i.maxTime) || c.speed > i.endSpeed || c.brake > .1 || c.throttle < .3) && (e.phase = "off");
          break;
        }
    }
    s >= 0 && (s += l, c.speed >= qhe ? (e.t100 = s, s = -1) : (c.brake > .1 || s > 12) && (s = -1));
    const h = e.phase,
      f = h === "launch" && (e.grade === "rocket" || e.grade === "good");
    e.revTarget = h === "armed" ? i.armedRpm : h === "timing" ? i.revLow + (i.revHigh - i.revLow) * e.needle : 0;
    e.launchRpm = f ? i.launchRpm : h === "launch" && e.grade === "spin" ? i.revHigh : 0;
    e.forceNitro = f;
    e.blockNitro = h === "blocked" || h === "armed" || h === "timing" || h === "launch" && !f;
    e.push = f ? i.accel * (e.grade === "rocket" ? 1 : i.goodScale) * Hhe((i.pushSpeed - c.speed) / 10, 0, 1) : 0;
  }
  function a() {
    e.phase = "off";
    e.needle = 0;
    e.revTarget = 0;
    e.launchRpm = 0;
    e.push = 0;
    e.forceNitro = false;
    e.blockNitro = false;
    e.muteHandbrake = false;
    s = -1;
  }
  return {
    state: e,
    update: o,
    reset: a
  };
}
export const hb = 4;
export const $he = 1;
export const fb = 2.5;
export const $L = 6;
export const Fl = 9.81;
export const Khe = .4;
export const jhe = 1;
export const Yhe = 120;
export const Xhe = 1.5;
