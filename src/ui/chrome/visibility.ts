// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { kce } from "./audioButton.ts";
export function Fce({
  state: state,
  idleMs: idleMs,
  activityTarget = document,
  isPlaying = () => false,
  isLookingAround = () => false,
  onWake: onWake,
  onIdle: onIdle,
  onActivity: onActivity
} = {}) {
  let l = null;
  const c = kce(idleMs);
  function u() {
    l && (window.clearTimeout(l), l = null);
  }
  function d() {
    u();
    l = window.setTimeout(() => {
      if (l = null, state.openedPanel) {
        d();
        return;
      }
      state.hideAllUi();
      onIdle == null || onIdle();
    }, c);
  }
  function h(g) {
    isPlaying() && ((g == null ? undefined : g.type) === "keydown" || /move$/.test((g == null ? undefined : g.type) ?? "") && isLookingAround()) || (state.uiVisible || (state.showAllUi(), onWake == null || onWake()), onActivity == null || onActivity(g), d());
  }
  const f = {
      passive: true
    },
    p = () => {
      document.pointerLockElement || h();
    };
  function m() {
    activityTarget.addEventListener("mousemove", h);
    activityTarget.addEventListener("pointerdown", h);
    activityTarget.addEventListener("pointermove", h);
    activityTarget.addEventListener("touchstart", h, f);
    activityTarget.addEventListener("touchmove", h, f);
    activityTarget.addEventListener("click", h);
    activityTarget.addEventListener("keydown", h);
    document.addEventListener("pointerlockchange", p);
    d();
  }
  function A() {
    u();
    activityTarget.removeEventListener("mousemove", h);
    activityTarget.removeEventListener("pointerdown", h);
    activityTarget.removeEventListener("pointermove", h);
    activityTarget.removeEventListener("touchstart", h);
    activityTarget.removeEventListener("touchmove", h);
    activityTarget.removeEventListener("click", h);
    activityTarget.removeEventListener("keydown", h);
    document.removeEventListener("pointerlockchange", p);
  }
  return {
    start: m,
    destroy: A,
    resetTimer: h
  };
}
export function createVisibilityCoordinator({
  state: state,
  header: header,
  audioButton: audioButton,
  walkControlsHint: walkControlsHint,
  virtualJoystick: virtualJoystick,
  isAppReady = () => true
} = {}) {
  function o({
    openedPanel: openedPanel,
    uiVisible: uiVisible
  }) {
    var d, h, f, p, m, A, g, b, x, y, _, w, S, T;
    if (!isAppReady()) {
      (d = header == null ? undefined : header.setForceHidden) == null || d.call(header, true);
      (h = audioButton == null ? undefined : audioButton.setForceHidden) == null || h.call(audioButton, true);
      (f = walkControlsHint == null ? undefined : walkControlsHint.setForceHidden) == null || f.call(walkControlsHint, true);
      (p = virtualJoystick == null ? undefined : virtualJoystick.setForceHidden) == null || p.call(virtualJoystick, true);
      (m = audioButton == null ? undefined : audioButton.setVisible) == null || m.call(audioButton, false);
      return;
    }
    const u = openedPanel === "settings" || openedPanel === "about" || openedPanel === "walk-controls" || openedPanel === "achievements";
    if (!uiVisible) {
      (A = header == null ? undefined : header.setForceHidden) == null || A.call(header, true);
      (g = audioButton == null ? undefined : audioButton.setForceHidden) == null || g.call(audioButton, true);
      (b = walkControlsHint == null ? undefined : walkControlsHint.setForceHidden) == null || b.call(walkControlsHint, true);
      (x = virtualJoystick == null ? undefined : virtualJoystick.setForceHidden) == null || x.call(virtualJoystick, true);
      return;
    }
    (y = header == null ? undefined : header.setForceHidden) == null || y.call(header, u);
    (_ = audioButton == null ? undefined : audioButton.setForceHidden) == null || _.call(audioButton, u);
    (w = audioButton == null ? undefined : audioButton.setVisible) == null || w.call(audioButton, !u);
    (S = walkControlsHint == null ? undefined : walkControlsHint.setForceHidden) == null || S.call(walkControlsHint, u && openedPanel !== "walk-controls");
    (T = virtualJoystick == null ? undefined : virtualJoystick.setForceHidden) == null || T.call(virtualJoystick, u);
  }
  const a = state.subscribe(o);
  return {
    refresh() {
      o({
        openedPanel: state.openedPanel,
        uiVisible: state.uiVisible
      });
    },
    destroy() {
      a();
    }
  };
}
export const Pce = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;
