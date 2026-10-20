// @ts-nocheck
/** Recovered reference implementation; see research/PROVENANCE.md. */
import { $ue, Hue, Wue } from "../../audio/engine/settings.ts";
import { isTouchDevice } from "../../platform/deviceLayout.ts";
export function Kue({
  walkControls: walkControls,
  state: state
} = {}) {
  var x, y;
  const t = document.createElement("div");
  t.className = "move-hint";
  t.setAttribute("data-ui-block-look", "true");
  t.hidden = true;
  t.setAttribute("role", "status");
  t.setAttribute("aria-live", "polite");
  t.innerHTML = `
    <div class="move-hint__frame">
      <span class="move-hint__corner move-hint__corner--tl"></span>
      <span class="move-hint__corner move-hint__corner--tr"></span>
      <span class="move-hint__corner move-hint__corner--bl"></span>
      <span class="move-hint__corner move-hint__corner--br"></span>
      <div class="move-hint__inner">
        ${$ue()}
        <div class="move-hint__copy">
          <span class="move-hint__kicker">Movement</span>
          <span class="move-hint__title">Use WASD to walk</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(t);
  let s = false,
    n = false,
    r = !!(state != null && state.openedPanel),
    o = null;
  function a() {
    o && (window.clearTimeout(o), o = null);
  }
  function l(_) {
    t.hidden = !_;
    t.classList.toggle("move-hint--visible", _);
  }
  function c() {
    a();
    l(false);
  }
  function u() {
    n || (n = true, c());
  }
  function d() {
    return !isTouchDevice();
  }
  function h() {
    a();
    !(!d() || !s || n || r || !document.pointerLockElement) && (o = window.setTimeout(() => {
      o = null;
      !(!d() || !s || n || r || !document.pointerLockElement) && l(true);
    }, Hue));
  }
  function f() {
    if (!s || n || r) {
      c();
      return;
    }
    if (document.pointerLockElement) {
      l(false);
      h();
      return;
    }
    c();
  }
  function p(_) {
    Wue.has(_.code) && u();
  }
  function m({
    moving: moving
  } = {}) {
    moving && u();
  }
  function A(_) {
    if (s = !!_, !s || !d()) {
      c();
      return;
    }
    f();
  }
  document.addEventListener("pointerlockchange", f);
  window.addEventListener("keydown", p);
  const g = (x = walkControls == null ? undefined : walkControls.subscribe) == null ? undefined : x.call(walkControls, m),
    b = (y = state == null ? undefined : state.subscribe) == null ? undefined : y.call(state, ({
      openedPanel: openedPanel
    }) => {
      if (r = !!openedPanel, r) {
        c();
        return;
      }
      f();
    });
  return {
    root: t,
    setEnabled: A,
    destroy() {
      a();
      g == null || g();
      b == null || b();
      document.removeEventListener("pointerlockchange", f);
      window.removeEventListener("keydown", p);
      t.remove();
    }
  };
}
export const jue = .12;
export function Yue(i, e) {
  const t = i.getBoundingClientRect(),
    s = e.getBoundingClientRect();
  return Math.max(24, (t.width - s.width) / 2);
}
