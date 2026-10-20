// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isGameInputBlocked } from "../ui/core/inputBoundary.ts";
import { YL, ja, zi } from "../game/vehicles/syncRig.ts";
export function efe(i, e, t) {
  return i < e ? e : i > t ? t : i;
}
export function jr(i, e, t, s) {
  const n = t * s;
  return i < e ? Math.min(i + n, e) : Math.max(i - n, e);
}
export function tfe(i) {
  return i instanceof HTMLElement ? i.tagName === "INPUT" || i.tagName === "TEXTAREA" || i.tagName === "SELECT" || i.isContentEditable : false;
}
export function createDriveInput({
  element = window
} = {}) {
  const e = new Set(),
    t = [];
  let s = false,
    n = 0,
    r = "keyboard";
  const o = new Map(),
    a = {
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: 0,
      nitro: 0,
      lookBack: false,
      horn: false,
      lookX: 0,
      lookY: 0,
      device: "keyboard",
      assistLevel: 1
    },
    l = {
      steer: 0,
      throttle: 0,
      brake: 0,
      handbrake: 0,
      active: false
    };
  function c(y) {
    !s || isGameInputBlocked() || tfe(y.target) || (y.code in YL && !y.repeat && y.timeStamp >= n && t.push(YL[y.code]), Object.values(ja).some(_ => _.includes(y.code)) && y.preventDefault(), e.add(y.code), r = "keyboard");
  }
  function u(y) {
    e.delete(y.code);
  }
  function d() {
    e.clear(); t.length = 0; o.clear();
    Object.assign(l, { steer: 0, throttle: 0, brake: 0, handbrake: 0, nitro: 0 });
    Object.assign(a, { steer: 0, throttle: 0, brake: 0, handbrake: 0, nitro: 0, horn: false, lookBack: false, lookX: 0, lookY: 0 });
  }
  function h(y) {
    for (const _ of y) if (e.has(_)) return true;
    return false;
  }
  function f() {
    var _;
    const y = ((_ = navigator.getGamepads) == null ? undefined : _.call(navigator)) ?? [];
    for (const w of y) {
      if (!w || !w.connected || w.mapping !== "standard") continue;
      const S = L => {
          var F;
          return ((F = w.buttons[L]) == null ? undefined : F.value) ?? 0;
        },
        T = L => {
          var F;
          return !!((F = w.buttons[L]) != null && F.pressed);
        },
        v = (L, F) => {
          const O = `${w.index}:${L}`,
            H = o.get(O) ?? false,
            W = T(L);
          W && !H && t.push(F);
          o.set(O, W);
        };
      v(zi.RB, "shiftUp");
      v(zi.LB, "shiftDown");
      v(zi.Y, "camera");
      v(zi.BACK, "reset");
      v(zi.START, "toggleAssists");
      v(zi.B, "exitVehicle");
      v(zi.DPAD_UP, "lights");
      v(zi.DPAD_DOWN, "watchFriend");
      const E = .09;
      let C = -(w.axes[0] ?? 0);
      C = Math.abs(C) < E ? 0 : (C - Math.sign(C) * E) / (1 - E);
      C = Math.sign(C) * Math.pow(Math.abs(C), 1.6);
      const M = S(zi.RT),
        B = S(zi.LT),
        R = w.axes[2] ?? 0,
        I = w.axes[3] ?? 0;
      if ((Math.abs(C) > 0 || M > .02 || B > .02 || T(zi.A) || Math.abs(R) > .2 || Math.abs(I) > .2) && (r = "gamepad"), r === "gamepad") return {
        steer: C,
        throttle: Math.max(M, T(zi.L3) ? 1 : 0),
        brake: B,
        handbrake: T(zi.A) ? 1 : 0,
        nitro: T(zi.L3) ? 1 : 0,
        lookBack: T(zi.X),
        horn: T(zi.R3),
        lookX: Math.abs(R) > .15 ? R : 0,
        lookY: Math.abs(I) > .15 ? I : 0
      };
    }
    return null;
  }
  function p(y, _, w) {
    const S = 4.6 - 1.8 * _,
      T = 6.5 - 1.5 * _;
    y === 0 ? a.steer = jr(a.steer, 0, T, w) : a.steer !== 0 && Math.sign(y) !== Math.sign(a.steer) ? a.steer = jr(a.steer, y, T + S, w) : a.steer = jr(a.steer, y, S, w);
  }
  function m(y, _ = 0) {
    if (isGameInputBlocked()) { d(); return a; }
    if (!s) return a.throttle = jr(a.throttle, 0, 8, y), a.brake = jr(a.brake, 0, 8, y), a.steer = jr(a.steer, 0, 6, y), a.handbrake = 0, a.nitro = 0, a.horn = false, a;
    const w = f();
    if (w) return a.device = "gamepad", a.throttle = jr(a.throttle, w.throttle, 12, y), a.brake = jr(a.brake, w.brake, 14, y), a.steer = jr(a.steer, w.steer, 9, y), a.handbrake = w.handbrake, a.nitro = w.nitro, a.lookBack = w.lookBack, a.horn = w.horn, a.lookX = w.lookX, a.lookY = w.lookY, a;
    const S = efe(Math.abs(_) / 38, 0, 1);
    if (l.active && r === "touch") {
      a.device = "touch";
      p(l.steer, S, y);
      const E = Math.max(l.throttle, l.nitro ?? 0);
      a.throttle = jr(a.throttle, E, E ? 5 : 9, y);
      a.brake = jr(a.brake, l.brake, 12, y);
      a.handbrake = l.handbrake;
      a.nitro = l.nitro ?? 0;
      a.horn = false;
      a.lookBack = false;
      a.lookX = 0;
      a.lookY = 0;
      return a;
    }
    a.device = "keyboard";
    p((h(ja.left) ? 1 : 0) - (h(ja.right) ? 1 : 0), S, y);
    const T = h(ja.throttle) || h(ja.nitro) ? 1 : 0,
      v = h(ja.brake) ? 1 : 0;
    a.throttle = jr(a.throttle, T, T ? 5 : 9, y);
    a.brake = jr(a.brake, v, 12, y);
    a.handbrake = h(ja.handbrake) ? 1 : 0;
    a.nitro = h(ja.nitro) ? 1 : 0;
    a.lookBack = h(ja.lookBack);
    a.horn = h(ja.horn);
    a.lookX = 0;
    a.lookY = 0;
    return a;
  }
  function A() {
    return t.length ? t.splice(0, t.length) : null;
  }
  function g(y) {
    const _ = !!y;
    _ && !s && (n = performance.now());
    s = _;
    s || d();
  }
  function b(y) {
    if (!s || isGameInputBlocked()) return;
    Object.assign(l, y);
    (l.steer || l.throttle || l.brake || l.handbrake || l.nitro) && (r = "touch");
  }
  function x(y) {
    s && !isGameInputBlocked() && t.push(y);
  }
  element.addEventListener("keydown", c);
  element.addEventListener("keyup", u);
  window.addEventListener("blur", d);
  window.addEventListener("neon:clear-input", d);
  window.addEventListener("gamepaddisconnected", d);
  return {
    clear: d,
    state: a,
    update: m,
    consumeActions: A,
    setEnabled: g,
    setTouch: b,
    pushAction: x,
    isEnabled: () => s,
    dispose() {
      element.removeEventListener("keydown", c);
      element.removeEventListener("keyup", u);
      window.removeEventListener("blur", d);
      window.removeEventListener("neon:clear-input", d);
      window.removeEventListener("gamepaddisconnected", d);
    }
  };
}
export const Vc = [{
  id: "chase",
  distance: 5.8,
  height: 1.85,
  lookHeight: .95,
  fovBoost: 9,
  lag: 1,
  breathe: .6
}, {
  id: "chaseFar",
  distance: 9.5,
  height: 2.7,
  lookHeight: 1.1,
  fovBoost: 10,
  lag: 1,
  breathe: 1.2
}, {
  id: "hood",
  distance: -.35,
  height: 1.36,
  lookHeight: 1.05,
  fovBoost: 16,
  lag: 0,
  fixed: true
}, {
  id: "bumper",
  distance: -2.7,
  height: .62,
  lookHeight: .6,
  fovBoost: 18,
  lag: 0,
  fixed: true
}];
