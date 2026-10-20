// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { isMobileLayout, isTouchDevice } from "../../platform/deviceLayout.ts";
import { Yue, jue } from "./moveHint.ts";
import { AudioListener, PositionalAudio, AudioLoader } from "three/webgpu";
import { getAudioVolume, subscribeAudioState } from "../../audio/audioState.ts";
export function Xue({
  walkControls: walkControls,
  state: state
} = {}) {
  var y;
  const t = document.createElement("div");
  t.className = "virtual-joystick";
  t.setAttribute("data-ui-block-look", "true");
  t.hidden = true;
  t.setAttribute("aria-hidden", "true");
  t.innerHTML = `
    <div class="virtual-joystick__base">
      <div class="virtual-joystick__knob"></div>
    </div>
  `;
  document.body.appendChild(t);
  const s = t.querySelector(".virtual-joystick__base"),
    n = t.querySelector(".virtual-joystick__knob");
  let r = false,
    o = false,
    a = false,
    l = !!(state != null && state.openedPanel),
    c = null,
    u = {
      x: 0,
      y: 0
    };
  function d() {
    return isMobileLayout() || isTouchDevice();
  }
  function h() {
    var _;
    (_ = walkControls == null ? undefined : walkControls.setMoveAxes) == null || _.call(walkControls, 0, 0);
    n.style.transform = "translate(-50%, -50%)";
    c = null;
  }
  function f() {
    const _ = r && o && !a && !l && d();
    t.hidden = !_;
    t.classList.toggle("virtual-joystick--visible", _);
    _ || h();
  }
  function p(_, w) {
    var F, O;
    const S = Yue(s, n),
      T = _ - u.x,
      v = w - u.y,
      E = Math.hypot(T, v),
      C = Math.min(E, S),
      M = Math.atan2(v, T),
      B = Math.cos(M) * C,
      R = Math.sin(M) * C;
    n.style.transform = `translate(calc(-50% + ${B}px), calc(-50% + ${R}px))`;
    const I = B / S,
      k = R / S,
      L = Math.hypot(I, k);
    if (L <= jue) {
      (F = walkControls == null ? undefined : walkControls.setMoveAxes) == null || F.call(walkControls, 0, 0);
      return;
    }
    (O = walkControls == null ? undefined : walkControls.setMoveAxes) == null || O.call(walkControls, I / L, k / L);
  }
  function m() {
    const _ = s.getBoundingClientRect();
    u = {
      x: _.left + _.width / 2,
      y: _.top + _.height / 2
    };
  }
  function A(_) {
    var w;
    !r || a || l || !d() || (_.preventDefault(), _.stopPropagation(), c = _.pointerId, m(), (w = t.setPointerCapture) == null || w.call(t, _.pointerId), p(_.clientX, _.clientY));
  }
  function g(_) {
    c === _.pointerId && (_.preventDefault(), _.stopPropagation(), p(_.clientX, _.clientY));
  }
  function b(_) {
    var w, S;
    c === _.pointerId && (_.preventDefault(), _.stopPropagation(), (w = t.hasPointerCapture) != null && w.call(t, _.pointerId) && ((S = t.releasePointerCapture) == null || S.call(t, _.pointerId)), h());
  }
  t.addEventListener("pointerdown", A);
  t.addEventListener("pointermove", g);
  t.addEventListener("pointerup", b);
  t.addEventListener("pointercancel", b);
  const x = (y = state == null ? undefined : state.subscribe) == null ? undefined : y.call(state, ({
    openedPanel: openedPanel
  }) => {
    l = !!openedPanel;
    f();
  });
  return {
    root: t,
    setEnabled(_) {
      r = !!_;
      f();
    },
    setVisible(_) {
      o = !!_;
      f();
    },
    setForceHidden(_) {
      a = !!_;
      f();
    },
    destroy() {
      x == null || x();
      t.removeEventListener("pointerdown", A);
      t.removeEventListener("pointermove", g);
      t.removeEventListener("pointerup", b);
      t.removeEventListener("pointercancel", b);
      h();
      t.remove();
    }
  };
}
export function Jue(i) {
  return i ? {
    isActive: () => i.isActive(),
    isMoving: () => i.isMoving(),
    setMoveAxes: (...e) => i.setMoveAxes(...e),
    subscribe: e => i.subscribe(e),
    hasTouchLooked: () => {
      var e;
      return ((e = i.hasTouchLooked) == null ? undefined : e.call(i)) ?? false;
    },
    requestPointerLock: () => {
      var e;
      return (e = i.requestPointerLock) == null ? undefined : e.call(i);
    },
    exitPointerLock: () => {
      var e;
      return (e = i.exitPointerLock) == null ? undefined : e.call(i);
    }
  } : null;
}
export const Zue = "/engine.mp3";
export const bL = 2.5;
export async function ede({
  camera: camera,
  car: car,
  silent = false
}) {
  const s = new AudioListener();
  if (camera.add(s), silent) return {
    listener: s,
    sound: null,
    play: async () => {},
    pause() {},
    dispose() {
      camera.remove(s);
    }
  };
  const n = new PositionalAudio(s);
  n.name = "quadra-engine";
  n.setRefDistance(3);
  n.setRolloffFactor(3.4);
  n.setDistanceModel("inverse");
  n.setLoop(true);
  n.setVolume(getAudioVolume() * bL);
  n.position.set(0, .55, .4);
  car.add(n);
  car.updateMatrixWorld(true);
  const r = await new AudioLoader().loadAsync(Zue);
  n.setBuffer(r);
  async function o() {
    if (n.isPlaying) return;
    const c = s.context;
    c.state !== "running" && (await c.resume());
    n.play();
  }
  function a() {
    n.isPlaying && n.pause();
  }
  const l = subscribeAudioState(({
    isMusicPlaying: isMusicPlaying,
    audioVolume: audioVolume
  }) => {
    n.setVolume(audioVolume * bL);
    isMusicPlaying ? o().catch(() => {}) : a();
  });
  return {
    listener: s,
    sound: n,
    play: o,
    pause: a,
    dispose() {
      l();
      a();
      n.source && n.disconnect();
      car.remove(n);
      camera.remove(s);
    }
  };
}
